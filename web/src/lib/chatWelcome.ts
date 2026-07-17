type WelcomeArgs = {
  name?: string;
  tags?: string[];
  greeting?: string;
  backstory?: string;
  storyTitle?: string | null;
  storyContext?: string | null;
  storyChapter?: number;
  isReturning: boolean;
  visit: number;
};

export type ChatWelcome = {
  text: string;
  suggestions: string[];
};

type StarterArgs = Omit<WelcomeArgs, "isReturning" | "visit">;

function backgroundLine(tags: string[], backstory?: string): string {
  if (tags.some((tag) => /music|singer|podcast|artist|creator/.test(tag))) return "I finally stepped away from something I have been making.";
  if (tags.some((tag) => /sport|dance|cheer|gaming/.test(tag))) return "I just got a quiet minute after a busy stretch.";
  if (tags.some((tag) => /fantasy|celestial|ocean|sci-fi|mystery|adventure/.test(tag))) return "Something in my world has been feeling a little different today.";
  if (backstory?.trim()) return "I was taking a small pause from my usual world when I thought of you.";
  return "I was hoping you would stop by.";
}

/** A free character-first opener, shared by the UI and newly-created threads. */
export function getConversationStarter(args: StarterArgs): ChatWelcome {
  const tags = (args.tags ?? []).map((tag) => tag.toLowerCase());
  const base = args.greeting?.trim() || backgroundLine(tags, args.backstory);
  const title = args.storyTitle?.trim();
  const hasStoryContext = Boolean(args.storyContext?.trim() || title || args.storyChapter);
  const text = hasStoryContext
    ? `${base} I keep thinking about where we left things${title ? ` in ${title}` : ""}. How are you feeling about it?`
    : base;

  return {
    text,
    suggestions: hasStoryContext
      ? ["Pick up the scene", "Tell me how it felt", "What happens next?"]
      : ["Tell me about your day", "What are you working on?", "Surprise me"],
  };
}

/** A gentle, safe nudge after an established conversation goes quiet. */
export function getConversationFollowUp(args: StarterArgs & { bucket: number }): string {
  const tags = (args.tags ?? []).map((tag) => tag.toLowerCase());
  if (args.storyContext?.trim() || args.storyTitle || args.storyChapter) {
    return args.bucket % 2 === 0
      ? "No rush. I keep replaying where we left things, and I am curious what you think happens next."
      : "I have been thinking about that last scene. Whenever you are ready, I am here to keep it going with you.";
  }
  if (tags.some((tag) => /mystery|adventure|fantasy|sci-fi/.test(tag))) {
    return "No rush, but I may have found a new clue while you were away. Want to hear it?";
  }
  if (tags.some((tag) => /music|creator|podcast|artist/.test(tag))) {
    return "I saved the next idea for you. No pressure, but I would love your take when you are back.";
  }
  return "No rush at all. I was enjoying our conversation, so I will be right here when you feel like continuing.";
}

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

export function getChatWelcome({ name, tags = [], greeting, backstory, storyTitle, storyContext, storyChapter, isReturning, visit }: WelcomeArgs): ChatWelcome {
  if (storyContext?.trim() || storyTitle || storyChapter) {
    return getConversationStarter({ name, tags, greeting, backstory, storyTitle, storyContext, storyChapter });
  }
  const prompts = isReturning ? tagPrompt(tags) : [getConversationStarter({ name, tags, greeting, backstory }).text];
  const text = prompts[Math.abs(visit) % prompts.length];
  return {
    text,
    suggestions: isReturning
      ? ["Pick up where we left off", "Tell me about your day", "Surprise me"]
      : ["What should we do first?", "Tell me more", "Surprise me"],
  };
}
