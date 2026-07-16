import { resolveTtsLanguage, resolveTtsStyle } from "@/lib/tts";

export type ElevenLabsVoice = {
  id: string;
  name: string;
  gender: string;
  language: string;
  accent: string;
  description: string;
};

let cachedVoices: { expiresAt: number; voices: ElevenLabsVoice[] } | null = null;

const languageNames: Record<string, string> = {
  en: "english", es: "spanish", fr: "french", de: "german", it: "italian", pt: "portuguese", ja: "japanese", ko: "korean", zh: "chinese",
};

export function elevenLabsConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

export async function listElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
  if (!elevenLabsConfigured()) return [];
  if (cachedVoices && cachedVoices.expiresAt > Date.now()) return cachedVoices.voices;

  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!.trim() },
    next: { revalidate: 0 },
  });
  if (!response.ok) throw new Error(`ElevenLabs voice list failed (${response.status})`);
  const body = await response.json() as { voices?: Array<{ voice_id?: string; name?: string; labels?: Record<string, string>; description?: string | null }> };
  const voices = (body.voices ?? [])
    .filter((voice): voice is Required<Pick<typeof voice, "voice_id">> & typeof voice => Boolean(voice.voice_id))
    .map((voice) => ({
      id: voice.voice_id,
      name: voice.name?.trim() || "Unnamed voice",
      gender: voice.labels?.gender?.trim().toLowerCase() || "",
      language: voice.labels?.language?.trim().toLowerCase() || "",
      accent: voice.labels?.accent?.trim() || "",
      description: [voice.labels?.description, voice.description].filter(Boolean).join(" ").slice(0, 180),
    }));
  cachedVoices = { voices, expiresAt: Date.now() + 30 * 60 * 1000 };
  return voices;
}

// A deterministic match means a companion keeps the same voice even after a
// server restart. Explicit creator choices always take precedence elsewhere.
export async function chooseElevenLabsVoice(definition: Record<string, unknown>, characterId: string) {
  const voices = await listElevenLabsVoices();
  if (!voices.length) return null;
  const targetGender = String(definition.gender ?? "").toLowerCase();
  const targetLanguage = resolveTtsLanguage(definition);
  const languageName = languageNames[targetLanguage];
  const style = resolveTtsStyle(definition);
  const styleWords: Record<typeof style, string[]> = {
    warm: ["warm", "friendly", "soft", "caring", "natural"],
    playful: ["playful", "bright", "energetic", "expressive", "lively"],
    calm: ["calm", "gentle", "thoughtful", "narration", "soft"],
    bold: ["bold", "confident", "strong", "dramatic", "deep"],
    reserved: ["quiet", "calm", "soft", "gentle", "intimate"],
  };

  const scored = voices.map((voice) => {
    const searchable = `${voice.name} ${voice.description} ${voice.accent}`.toLowerCase();
    let score = 0;
    if (targetGender && voice.gender === targetGender) score += 6;
    if (voice.language.includes(targetLanguage) || voice.language.includes(languageName)) score += 5;
    for (const word of styleWords[style]) if (searchable.includes(word)) score += 1;
    return { voice, score };
  }).sort((a, b) => b.score - a.score || a.voice.id.localeCompare(b.voice.id));
  const highest = scored[0]?.score ?? 0;
  const best = scored.filter((candidate) => candidate.score === highest).map((candidate) => candidate.voice);
  let hash = 0;
  for (let i = 0; i < characterId.length; i += 1) hash = (hash * 31 + characterId.charCodeAt(i)) | 0;
  return best[Math.abs(hash) % best.length] ?? null;
}
