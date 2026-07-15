export const TTS_VOICES = [
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

export const TTS_DELIVERIES = [
  { speed: 0.86, label: "Soft and deliberate", description: "unhurried, intimate" },
  { speed: 0.94, label: "Grounded", description: "calm and thoughtful" },
  { speed: 1, label: "Natural", description: "everyday conversation" },
  { speed: 1.08, label: "Bright and quick", description: "playful, lively" },
  { speed: 1.16, label: "Fast and energetic", description: "restless, enthusiastic" },
] as const;

type TtsVoiceId = (typeof TTS_VOICES)[number]["id"];
const ids = new Set<string>(TTS_VOICES.map((voice) => voice.id));
const deliverySpeeds = new Set<number>(TTS_DELIVERIES.map((delivery) => delivery.speed));
const feminine: TtsVoiceId[] = ["aura-2-helena-en", "aura-2-cora-en", "aura-2-vesta-en", "aura-2-pandora-en", "aura-2-thalia-en"];
const masculine: TtsVoiceId[] = ["aura-2-apollo-en", "aura-2-draco-en", "aura-2-orion-en", "aura-2-pluto-en", "aura-2-aries-en"];

export function isTtsVoice(value: unknown): value is TtsVoiceId {
  return typeof value === "string" && ids.has(value);
}

export function isTtsSpeed(value: unknown): value is (typeof TTS_DELIVERIES)[number]["speed"] {
  return typeof value === "number" && deliverySpeeds.has(value);
}

// Legacy companions get a stable, varied default without a database migration.
export function resolveTtsVoice(definition: Record<string, unknown>, characterId: string): TtsVoiceId {
  if (isTtsVoice(definition.ttsVoice)) return definition.ttsVoice;
  const pool = definition.gender === "female" ? feminine : definition.gender === "male" ? masculine : [...feminine, ...masculine];
  let hash = 0;
  for (let i = 0; i < characterId.length; i += 1) hash = (hash * 31 + characterId.charCodeAt(i)) | 0;
  return pool[Math.abs(hash) % pool.length];
}

export function resolveTtsSpeed(definition: Record<string, unknown>, characterId: string): number {
  if (isTtsSpeed(definition.ttsSpeed)) return definition.ttsSpeed;
  const tone = [definition.voice, definition.persona, ...(Array.isArray(definition.tags) ? definition.tags : [])]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
  if (/soft|quiet|guarded|brooding|mysterious|unhurried|gentle|calm/.test(tone)) return 0.9;
  if (/bright|playful|energetic|excited|bubbly|quick|witty/.test(tone)) return 1.08;
  let hash = 0;
  for (let i = 0; i < characterId.length; i += 1) hash = (hash * 31 + characterId.charCodeAt(i)) | 0;
  return [0.94, 1, 1.06][Math.abs(hash) % 3];
}
