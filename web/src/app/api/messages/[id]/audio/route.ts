import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, messages, threads } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { chooseElevenLabsVoice, elevenLabsConfigured } from "@/lib/elevenlabs";
import { elevenEmotionTag, elevenVoiceId, elevenVoiceSettings, inferSpeechEmotion, resolveDeepgramVoice, resolveTtsLanguage } from "@/lib/tts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_TTS_CHARS = 2000;

function speechText(content: string): string {
  // Parentheses are commonly used for in-character actions and stage direction.
  // Keep them in the visible transcript, but don't make the companion narrate
  // them back to the reader. Repeat to handle a small amount of nesting safely.
  let text = content;
  for (let i = 0; i < 4; i += 1) {
    const next = text.replace(/\([^()]*\)/g, " ");
    if (next === text) break;
    text = next;
  }
  // Remove any previous audio-direction notation too. It should never be read
  // out, and ElevenLabs gets fresh directions derived from this exact reply.
  return text
    .replace(/\n\s*---\s*\n/g, " ")
    .replace(/\[[^\]]{1,100}\]/g, " ")
    .replace(/\*+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TTS_CHARS);
}

async function elevenLabsSpeech({ key, text, definition, characterId, messageId }: {
  key: string;
  text: string;
  definition: Record<string, unknown>;
  characterId: string;
  messageId: string;
}) {
  const chosen = elevenVoiceId(definition.ttsVoice) ?? (await chooseElevenLabsVoice(definition, characterId))?.id;
  if (!chosen) throw new Error("ElevenLabs returned no available voices");
  const emotion = inferSpeechEmotion(text, definition);
  const model = process.env.ELEVENLABS_TTS_MODEL?.trim() || "eleven_v3";
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(chosen)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      // Direction tags stay out of the chat transcript. Eleven v3 uses these
      // for emotion/non-verbal delivery; the fallback never receives them.
      text: `${elevenEmotionTag(emotion)} ${text}`,
      model_id: model,
      language_code: resolveTtsLanguage(definition),
      voice_settings: elevenVoiceSettings(definition),
    }),
  });
  if (!response.ok || !response.body) {
    console.warn("[tts] ElevenLabs failed; trying Deepgram", { status: response.status, messageId });
    return null;
  }
  return response;
}

// GET /api/messages/:id/audio -> synthesize a private companion reply. ElevenLabs
// is preferred for expressive character delivery; Deepgram is a cost/availability
// fallback. Audio is deliberately not persisted and is cached only by the client.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return new Response("unauthorized", { status: 401 });

  const [row] = await db
    .select({ content: messages.content, role: messages.role, ownerId: threads.userId, definition: characters.definition, characterId: characters.id })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .innerJoin(characters, eq(threads.characterId, characters.id))
    .where(eq(messages.id, id))
    .limit(1);
  if (!row || row.ownerId !== userId) return new Response("not found", { status: 404 });
  if (row.role !== "character") return new Response("not a companion reply", { status: 400 });

  const text = speechText(row.content);
  if (!text) return new Response("empty reply", { status: 400 });
  const definition = (row.definition ?? {}) as Record<string, unknown>;
  const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
  const deepgramKey = process.env.DEEPGRAM_API_KEY?.trim();
  if (!elevenKey && !deepgramKey) return new Response("speech is not configured", { status: 503 });

  if (elevenKey && elevenLabsConfigured()) {
    try {
      const upstream = await elevenLabsSpeech({ key: elevenKey, text, definition, characterId: row.characterId, messageId: id });
      if (upstream) {
        return new Response(upstream.body, {
          headers: {
            "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
            "Cache-Control": "private, no-store",
            "X-TTS-Provider": "elevenlabs",
          },
        });
      }
    } catch (error) {
      console.warn("[tts] ElevenLabs request failed; trying Deepgram", { messageId: id, error: error instanceof Error ? error.message : error });
    }
  }

  if (!deepgramKey) return new Response("speech generation failed", { status: 502 });
  const model = resolveDeepgramVoice(definition, row.characterId);

  try {
    const upstream = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}`, {
      method: "POST",
      headers: { Authorization: `Token ${deepgramKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!upstream.ok || !upstream.body) {
      console.error("[tts] Deepgram failed", { status: upstream.status, messageId: id });
      return new Response("speech generation failed", { status: 502 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "private, no-store",
        "X-TTS-Provider": "deepgram",
      },
    });
  } catch (error) {
    console.error("[tts] Deepgram request failed", error instanceof Error ? error.message : error);
    return new Response("speech generation failed", { status: 502 });
  }
}
