/**
 * Plays a companion reply through Deepgram when it is configured. Audio stays
 * private behind our authenticated message route; browser speech is only a
 * fallback for an unavailable network/API response.
 */
let currentAudio: HTMLAudioElement | null = null;
let playbackVersion = 0;
const audioUrls = new Map<string, string>();

function stopBrowserSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

function fallbackSpeak(text: string, version: number, onEnd?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 1;
  utterance.onend = () => { if (version === playbackVersion) onEnd?.(); };
  utterance.onerror = () => { if (version === playbackVersion) onEnd?.(); };
  window.speechSynthesis.speak(utterance);
  return true;
}

export async function speakReply(messageId: string, text: string, onEnd?: () => void): Promise<boolean> {
  stopSpeaking();
  const version = ++playbackVersion;

  try {
    let url = audioUrls.get(messageId);
    if (!url) {
      const res = await fetch(`/api/messages/${messageId}/audio`);
      if (!res.ok) throw new Error(`TTS unavailable (${res.status})`);
      const blob = await res.blob();
      if (!blob.size) throw new Error("TTS returned no audio");
      url = URL.createObjectURL(blob);
      audioUrls.set(messageId, url);
    }
    if (version !== playbackVersion) return false;

    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      if (version === playbackVersion) { currentAudio = null; onEnd?.(); }
    };
    audio.onerror = () => {
      if (version === playbackVersion) { currentAudio = null; onEnd?.(); }
    };
    await audio.play();
    return true;
  } catch {
    if (version !== playbackVersion) return false;
    return fallbackSpeak(text, version, onEnd);
  }
}

export function stopSpeaking(): void {
  playbackVersion += 1;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  stopBrowserSpeech();
}
