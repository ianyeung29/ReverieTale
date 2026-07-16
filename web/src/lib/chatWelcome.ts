type WelcomeArgs = {
  tags?: string[];
  greeting?: string;
  isReturning: boolean;
  visit: number;
};

export type ChatWelcome = {
  text: string;
  suggestions: string[];
};

function tagPrompt(tags: string[]): string[] {
  if (tags.some((tag) => ["mystery", "thriller", "adventure"].includes(tag))) {
    return [
      "I have been holding onto a clue for you. Want to help me make sense of it?",
      "Something interesting happened while you were away. Want the short version or the strange version?",
    ];
  }
  if (tags.some((tag) => ["music", "creator", "podcast", "fashion"].includes(tag))) {
    return [
      "I saved a half-finished idea for you. Want to help me make it better?",
      "I have been collecting inspiration. Tell me what kind of story you are in the mood for.",
    ];
  }
  if (tags.some((tag) => ["sports", "dance", "gaming"].includes(tag))) {
    return [
      "I have a challenge waiting if you are up for it. Want in?",
      "I was hoping you would come back. I need a teammate with good instincts.",
    ];
  }
  if (tags.some((tag) => ["fantasy", "celestial", "ocean", "sci-fi"].includes(tag))) {
    return [
      "The world got a little stranger while you were away. Want to see what I found?",
      "I kept a small piece of the impossible aside for you. Ready to investigate?",
    ];
  }
  return [
    "I am glad you are here. What should we talk about first?",
    "I was hoping you would stop by. Tell me what is on your mind.",
  ];
}

export function getChatWelcome({ tags = [], greeting, isReturning, visit }: WelcomeArgs): ChatWelcome {
  const prompts = isReturning ? tagPrompt(tags) : [greeting?.trim() || "I was hoping you would stop by. What should we get into?"];
  const text = prompts[Math.abs(visit) % prompts.length];
  return {
    text,
    suggestions: isReturning
      ? ["Pick up where we left off", "Tell me about your day", "Surprise me"]
      : ["What should we do first?", "Tell me more", "Surprise me"],
  };
}
