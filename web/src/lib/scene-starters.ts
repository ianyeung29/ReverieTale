export type SceneStarterCharacter = {
  name: string;
  tags: string[];
  tagline?: string;
};

export type SceneStarter = {
  id: string;
  title: string;
  description: string;
  scenario: string;
  relationship: string;
  tone: string;
  setting: string;
};

/**
 * Small, safe entry points that turn a character profile into a story moment.
 * They are deliberately structured rather than romantic-roleplay prompts: the
 * same starters work for a 13+ audience and give the story generator a useful
 * direction without asking a new reader to author a prompt from scratch.
 */
export function buildSceneStarters(character: SceneStarterCharacter): SceneStarter[] {
  const tags = new Set(character.tags.map((tag) => tag.toLowerCase()));

  if (tags.has("mystery") || tags.has("detective")) {
    return [
      { id: "clue", title: "Inspect the clue", description: `Something near ${character.name} does not add up. Take a closer look before it disappears.`, scenario: "a strange clue appears at the worst possible moment", relationship: "new acquaintances", tone: "curious", setting: "a quiet place with one detail out of place" },
      { id: "question", title: "Ask the impossible question", description: `Start with the question ${character.name} keeps avoiding.`, scenario: "an unexpected question opens a bigger mystery", relationship: "new acquaintances", tone: "tense", setting: "a nearly empty cafe after closing" },
      { id: "lead", title: "Follow the lead", description: "A rumor points somewhere neither of you planned to go.", scenario: "a rumor leads to an unfamiliar corner of town", relationship: "reluctant teammates", tone: "adventurous", setting: "a rain-slick street at dusk" },
    ];
  }

  if (tags.has("fantasy") || tags.has("supernatural")) {
    return [
      { id: "light", title: "Follow the strange light", description: `A flicker at the edge of the room makes ${character.name} stop mid-sentence.`, scenario: "a strange light appears where it should not", relationship: "new acquaintances", tone: "mysterious", setting: "a hidden courtyard after dark" },
      { id: "message", title: "Read the message", description: "A note arrives with both of your names written on it.", scenario: "a message arrives from an unknown sender", relationship: "two strangers with the same clue", tone: "curious", setting: "an old library with a locked reading room" },
      { id: "door", title: "Open the wrong door", description: "One ordinary errand becomes a detour neither of you can explain.", scenario: "an ordinary door opens into an impossible place", relationship: "unexpected partners", tone: "adventurous", setting: "a hallway that seems longer than it was before" },
    ];
  }

  if (tags.has("sci-fi") || tags.has("adventure")) {
    return [
      { id: "signal", title: "Answer the signal", description: `A device near ${character.name} starts repeating a message meant for both of you.`, scenario: "an unfamiliar signal asks for help", relationship: "new teammates", tone: "curious", setting: "a workshop with a window onto the city" },
      { id: "detour", title: "Take the detour", description: "The usual way home is closed, and the alternate route looks anything but ordinary.", scenario: "a detour turns into a small adventure", relationship: "fellow travelers", tone: "adventurous", setting: "a late train platform under bright station lights" },
      { id: "plan", title: "Make a plan", description: `Help ${character.name} solve a problem before time runs out.`, scenario: "a plan has to come together before an important deadline", relationship: "new teammates", tone: "hopeful", setting: "a cluttered table covered in maps and notes" },
    ];
  }

  return [
    { id: "question", title: "Ask what changed", description: `${character.name} looks like they have something to say. Be the one who notices.`, scenario: "a familiar place feels different after one honest question", relationship: "new acquaintances", tone: "curious", setting: "a favorite after-school spot just before sunset" },
    { id: "invitation", title: "Take the invitation", description: "A simple invitation turns into a moment worth remembering.", scenario: "an unexpected invitation leads somewhere new", relationship: "new acquaintances", tone: "hopeful", setting: "a neighborhood event just starting to come alive" },
    { id: "linger", title: "Stay a little longer", description: "The easy moment to leave passes. Choose to see what happens next.", scenario: "a quiet conversation changes direction when nobody leaves", relationship: "new acquaintances", tone: "cozy", setting: "a small cafe while rain taps the windows" },
  ];
}
