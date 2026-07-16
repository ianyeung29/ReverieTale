export const DEEPGRAM_VOICES = [
  { id: "aura-2-helena-en", label: "Helena", description: "Caring and natural" },
  { id: "aura-2-cora-en", label: "Cora", description: "Warm storyteller" },
  { id: "aura-2-vesta-en", label: "Vesta", description: "Patient and empathetic" },
  { id: "aura-2-pandora-en", label: "Pandora", description: "Calm British tone" },
  { id: "aura-2-thalia-en", label: "Thalia", description: "Clear and energetic" },
  { id: "aura-2-apollo-en", label: "Apollo", description: "Confident and casual" },
  { id: "aura-2-draco-en", label: "Draco", description: "Warm British baritone" },
  { id: "aura-2-orion-en", label: "Orion", description: "Calm and approachable" },
  { id: "aura-2-pluto-en", label: "Pluto", description: "Smooth and empathetic" },
  { id: "aura-2-aries-en", label: "Aries", description: "Warm and energetic" },
] as const;

// Kept deliberately broad. A companion's written persona supplies the detail;
// this choice simply keeps their default spoken presence stable between replies.
export const TTS_STYLES = [
  { id: "warm", label: "Warm and open", description: "kind, close, reassuring" },
  { id: "playful", label: "Playful and bright", description: "quick, teasing, lively" },
  { id: "calm", label: "Calm and thoughtful", description: "soft, measured, reflective" },
  { id: "bold", label: "Bold and expressive", description: "confident, dramatic, direct" },
  { id: "reserved", label: "Reserved and quiet", description: "guarded, subtle, intimate" },
] as const;

export const TTS_LANGUAGES = [
  { id: "en", label: "English" },
  { id: "es", label: "Spanish" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
  { id: "it", label: "Italian" },
  { id: "pt", label: "Portuguese" },
  { id: "ja", label: "Japanese" },
  { id: "ko", label: "Korean" },
  { id: "zh", label: "Chinese" },
] as const;

// Transitional aliases keep the existing editor markup compact while mapping
// its old two select slots onto language and character presence, not speed.
export const TTS_VOICES = TTS_LANGUAGES.map((language) => ({ ...language, description: "spoken dialogue" }));
export const TTS_DELIVERIES = TTS_STYLES.map((style) => ({ speed: style.id, label: style.label, description: style.description }));

type DeepgramVoiceId = (typeof DEEPGRAM_VOICES)[number]["id"];
export type TtsStyle = (typeof TTS_STYLES)[number]["id"];
export type TtsLanguage = (typeof TTS_LANGUAGES)[number]["id"];
export type SpeechEmotion = "warm" | "playful" | "calm" | "excited" | "angry" | "thoughtful" | "whisper" | "sad";

const deepgramIds = new Set<string>(DEEPGRAM_VOICES.map((voice) => voice.id));
const styles = new Set<string>(TTS_STYLES.map((style) => style.id));
const languages = new Set<string>(TTS_LANGUAGES.map((language) => language.id));
const feminine: DeepgramVoiceId[] = ["aura-2-helena-en", "aura-2-cora-en", "aura-2-vesta-en", "aura-2-pandora-en", "aura-2-thalia-en"];
const masculine: DeepgramVoiceId[] = ["aura-2-apollo-en", "aura-2-draco-en", "aura-2-orion-en", "aura-2-pluto-en", "aura-2-aries-en"];

export function isTtsVoice(value: unknown): value is string {
  return typeof value === "string" && (deepgramIds.has(value) || /^eleven:[A-Za-z0-9_-]{8,100}$/.test(value));
}

export function isTtsStyle(value: unknown): value is TtsStyle {
  return typeof value === "string" && styles.has(value);
}

export function isTtsLanguage(value: unknown): value is TtsLanguage {
  return typeof value === "string" && languages.has(value);
}

export function elevenVoiceId(value: unknown): string | null {
  return typeof value === "string" && /^eleven:([A-Za-z0-9_-]{8,100})$/.test(value) ? value.slice(7) : null;
}

function stableIndex(characterId: string, length: number) {
  let hash = 0;
  for (let i = 0; i < characterId.length; i += 1) hash = (hash * 31 + characterId.charCodeAt(i)) | 0;
  return Math.abs(hash) % length;
}

// Legacy companions get a stable, varied fallback without a database migration.
export function resolveDeepgramVoice(definition: Record<string, unknown>, characterId: string): DeepgramVoiceId {
  if (typeof definition.ttsVoice === "string" && deepgramIds.has(definition.ttsVoice)) return definition.ttsVoice as DeepgramVoiceId;
  const pool = definition.gender === "female" ? feminine : definition.gender === "male" ? masculine : [...feminine, ...masculine];
  return pool[stableIndex(characterId, pool.length)];
}

export function resolveTtsLanguage(definition: Record<string, unknown>): TtsLanguage {
  return isTtsLanguage(definition.ttsLanguage) ? definition.ttsLanguage : "en";
}

export function resolveTtsStyle(definition: Record<string, unknown>): TtsStyle {
  if (isTtsStyle(definition.ttsStyle)) return definition.ttsStyle;
  const tone = [definition.voice, definition.persona, ...(Array.isArray(definition.tags) ? definition.tags : [])]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
  if (/playful|witty|flirty|bright|bubbly|energetic/.test(tone)) return "playful";
  if (/quiet|guarded|brooding|mysterious|gentle|calm/.test(tone)) return "reserved";
  if (/bold|confident|dramatic|adventurous|rebellious/.test(tone)) return "bold";
  if (/thoughtful|poetic|patient|reflective/.test(tone)) return "calm";
  return "warm";
}

export function inferSpeechEmotion(text: string, definition: Record<string, unknown>): SpeechEmotion {
  const lower = text.toLowerCase();
  if (/\b(furious|angry|annoyed|back off|stop that|don't you dare)\b|!{2,}/.test(lower)) return "angry";
  if (/\b(sad|sorry|miss you|hurt|cry|tears?)\b/.test(lower)) return "sad";
  if (/\b(whisper|quietly|hush|secret)\b/.test(lower)) return "whisper";
  if (/\b(laugh|haha|hehe|amazing|can't wait|yes!)\b/.test(lower) || /!$/.test(text.trim())) return "excited";
  if (/\?$/.test(text.trim()) || /\b(wonder|curious|tell me|really)\b/.test(lower)) return "thoughtful";
  const style = resolveTtsStyle(definition);
  if (style === "playful") return "playful";
  if (style === "calm" || style === "reserved") return "calm";
  return "warm";
}

export function elevenEmotionTag(emotion: SpeechEmotion): string {
  return {
    warm: "[warmly]",
    playful: "[mischievously]",
    calm: "[calm]",
    excited: "[excited]",
    angry: "[angry]",
    thoughtful: "[thoughtful]",
    whisper: "[whispers]",
    sad: "[softly]",
  }[emotion];
}

export function elevenVoiceSettings(definition: Record<string, unknown>) {
  const style = resolveTtsStyle(definition);
  return {
    // Lower stability leaves enough range for Eleven v3's emotion tags, without
    // making quiet or reflective companions unpredictably theatrical.
    stability: style === "bold" || style === "playful" ? 0.38 : style === "reserved" ? 0.58 : 0.48,
    similarity_boost: 0.75,
    use_speaker_boost: true,
  };
}
