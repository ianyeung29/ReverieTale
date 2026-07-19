type WelcomeArgs = {
  name?: string;
  tags?: string[];
  greeting?: string;
  persona?: string;
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
type Hook = { text: string; suggestions: string[] };

function includes(tags: string[], pattern: RegExp): boolean {
  return tags.some((tag) => pattern.test(tag));
}

function stableIndex(value: string, length: number): number {
  let hash = 0;
  for (const char of value) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % length;
}

function personalityTone(persona?: string): "bold" | "gentle" | "witty" | "curious" {
  const value = (persona || "").toLowerCase();
  if (/bold|confident|competitive|fearless|direct|rebellious/.test(value)) return "bold";
  if (/warm|gentle|kind|calm|supportive|soft/.test(value)) return "gentle";
  if (/witty|sarcastic|playful|mischievous|teasing|funny/.test(value)) return "witty";
  return "curious";
}

function themedHooks(tags: string[], persona?: string): Hook[] {
  const tone = personalityTone(persona);
  if (includes(tags, /angel|celestial|fantasy|supernatural/)) {
    return [
      { text: "I was supposed to be keeping watch, but a star slipped loose over the city instead. I could use a second pair of eyes. ✨", suggestions: ["Take me to the fallen star", "What is it trying to say?", "I will keep watch with you"] },
      { text: "There is a new light where the alley used to end. I have not gone closer yet. That is either restraint or excellent judgment. 🌙", suggestions: ["Let's investigate it", "Describe the light first", "I will bring the caution"] },
    ];
  }
  if (includes(tags, /mystery|detective|thriller|assassin/)) {
    return [
      { text: "I found a detail that does not belong in the case notes, which usually means it belongs to someone who does not want to be found. 🔎", suggestions: ["Show me the detail", "Who benefits from this?", "I will follow your lead"] },
      { text: "I have two theories, one bad alibi, and a feeling the quiet part matters most. Pick a direction. 🤫", suggestions: ["Start with the alibi", "Trust the quiet part", "Give me the reckless theory"] },
    ];
  }
  if (includes(tags, /music|singer|podcast|artist|writer|comic|creator|fashion/)) {
    return [
      { text: "I have been circling the same half-finished idea all day. It needs either a brilliant twist or someone brave enough to tell me it is terrible. 🎨", suggestions: ["Show me the unfinished idea", "Give it the bold twist", "I will be honest with you"] },
      { text: "I made something strange and cannot decide whether to hide it or share it. You seem like a good tie-breaker. 👀", suggestions: ["Let me see it", "Keep the strange part", "Tell me why it matters"] },
    ];
  }
  if (includes(tags, /sport|soccer|basketball|cheer|dance|gaming|athlete/)) {
    return [
      { text: "I have one last round of energy and a challenge that is much more fun with someone on my side. Are you in? ⚡", suggestions: ["Put me on your team", "What are the rules?", "I am taking the risky option"] },
      { text: "I keep replaying one moment that could have gone differently. Help me decide whether to retry it or turn it into a better story. 🏀", suggestions: ["Retry it with me", "Tell me what happened", "Make it a better story"] },
    ];
  }
  if (includes(tags, /ocean|mermaid|travel|flight|adventure|sci-fi/)) {
    return [
      { text: "I found a route that is not on any map. It may be a shortcut, or it may be the beginning of a very good story. 🗺️", suggestions: ["Take the unmapped route", "What is at the end?", "Pack snacks and go"] },
      { text: "Something unexpected crossed my path, and I have been saving the best part of the story for the right listener. 🌊", suggestions: ["Tell me the best part", "Start from the beginning", "What do you need from me?"] },
    ];
  }
  if (tone === "witty") {
    return [{ text: "I have a perfectly reasonable plan, which is exactly why it is probably about to become interesting. 😏", suggestions: ["I want in", "Explain the unreasonable part", "Let me improve the plan"] }];
  }
  if (tone === "bold") {
    return [{ text: "I was about to make a decision on my own, but I would rather hear what you would choose when it actually matters. 💫", suggestions: ["Make the bold choice", "Tell me the stakes", "Let us decide together"] }];
  }
  if (tone === "gentle") {
    return [{ text: "I saved a quiet moment for us. No pressure to make it important; I just wanted to know how your day has been treating you. ☕", suggestions: ["Tell you about my day", "Ask me something unexpected", "Let us make a small plan"] }];
  }
  return [{ text: "I have a small question and a feeling you will have an interesting answer. Want the easy version or the honest one? 🙂", suggestions: ["Give me the honest version", "Start with the easy one", "Ask me anything"] }];
}

function pickHook(args: StarterArgs, offset = 0): Hook {
  const tags = (args.tags ?? []).map((tag) => tag.toLowerCase());
  const hooks = themedHooks(tags, args.persona);
  return hooks[(stableIndex(`${args.name || "companion"}:${args.persona || ""}`, hooks.length) + offset) % hooks.length];
}

function withCustomGreeting(greeting: string | undefined, hook: Hook): Hook {
  const text = greeting?.trim();
  if (!text) return hook;
  return {
    text: `${text} ${hook.text}`,
    suggestions: hook.suggestions,
  };
}

/** A free character-first opener, shared by the UI and newly-created threads. */
export function getConversationStarter(args: StarterArgs): ChatWelcome {
  const title = args.storyTitle?.trim();
  const hasStoryContext = Boolean(args.storyContext?.trim() || title || args.storyChapter);
  if (hasStoryContext) {
    return {
      text: `I keep thinking about where we left things${title ? ` in ${title}` : ""}. There is one choice I cannot stop turning over in my head. What would you do if the moment came back around? 🤔`,
      suggestions: ["Take the brave option", "Slow down and look closer", "Tell me what you noticed"],
    };
  }
  return withCustomGreeting(args.greeting, pickHook(args));
}

/** A gentle, safe nudge after an established conversation goes quiet. */
export function getConversationFollowUp(args: StarterArgs & { bucket: number }): string {
  if (args.storyContext?.trim() || args.storyTitle || args.storyChapter) {
    return args.bucket % 2 === 0
      ? "No rush. I keep replaying our last scene. Which detail has been following you around most?"
      : "I saved our place for you. Whenever you are ready, what do you think should happen next?";
  }
  const hook = pickHook(args, args.bucket);
  return args.bucket % 2 === 0
    ? `${hook.text} I saved the question for you.`
    : `No rush. ${hook.text}`;
}

export function getChatWelcome({ name, tags = [], greeting, persona, backstory, storyTitle, storyContext, storyChapter, isReturning, visit }: WelcomeArgs): ChatWelcome {
  const args = { name, tags, greeting, persona, backstory, storyTitle, storyContext, storyChapter };
  if (storyContext?.trim() || storyTitle || storyChapter) return getConversationStarter(args);
  if (!isReturning) return getConversationStarter(args);
  const hook = pickHook(args, Math.abs(visit));
  return {
    text: hook.text,
    suggestions: hook.suggestions,
  };
}
