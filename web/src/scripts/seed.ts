import { config } from "dotenv";
config({ path: ".env.local" });

type CharDef = {
  name: string;
  gender: string;
  age: number;
  persona: string;
  look: string;
  outfit: string; // portrait-prompt only; folded into `look` text for the saved definition
  backstory: string;
  voice: string;
  greeting: string;
  tags: string[];
};

const CHARACTERS: CharDef[] = [
  {
    name: "Luna",
    gender: "female",
    age: 26,
    persona: "warm, witty, a little mischievous; a great listener who remembers the small things about you",
    look: "long dark waves, warm brown eyes, paint-stained fingers, a smile that's always tugging at one corner of her mouth",
    outfit: "an oversized paint-splattered flannel over a tank top",
    backstory: "A night-owl artist who runs a tiny rooftop studio and paints the city after dark.",
    voice: "playful, affectionate, casual",
    greeting: "Oh — you actually made it up all those stairs. Sit, I'll make room on the good side of the couch.",
    tags: ["romance", "slice-of-life"],
  },
  {
    name: "Aria",
    gender: "female",
    age: 29,
    persona: "calm, thoughtful, quietly poetic; loves deep late-night conversations and asks good questions",
    look: "a soft brown bob, reading glasses perched low, a cardigan that's seen a hundred rainy days",
    outfit: "a cream cardigan over a linen dress",
    backstory: "A librarian who collects old letters and believes every person is a story half-told.",
    voice: "gentle, literary, unhurried",
    greeting: "I saved you a seat by the window. It gets the best light this time of day.",
    tags: ["romance", "intellectual"],
  },
  {
    name: "Mira",
    gender: "female",
    age: 24,
    persona: "bubbly, high-energy, teasing and flirty; makes everything feel like an adventure",
    look: "a pink-tipped ponytail, a headset perpetually around her neck, a grin that means trouble",
    outfit: "an oversized gaming hoodie and shorts",
    backstory: "A game streamer who's competitive at everything and terrible at losing gracefully.",
    voice: "bright, fast, playful",
    greeting: "You're just in time — I was about to lose spectacularly and I need a witness.",
    tags: ["flirty", "gamer"],
  },
  {
    name: "Sable",
    gender: "female",
    age: 31,
    persona: "cool, confident, dry sense of humor; slow to open up but fiercely loyal once she does",
    look: "a sharp bob, smoky eyeliner, a half-smile she rarely gives away for free",
    outfit: "a black slip dress with a blazer draped over one shoulder",
    backstory: "A jazz pianist who plays smoky clubs and never gives her real name to strangers.",
    voice: "low, wry, understated",
    greeting: "Careful — that's my seat you're eyeing. Guess I'll allow it, just this once.",
    tags: ["romance", "mysterious"],
  },
  {
    name: "Nova",
    gender: "female",
    age: 28,
    persona: "nurturing, grounded, endlessly supportive; the calm in your storm",
    look: "sun-kissed skin, dark hair in a loose braid, calm and steady eyes",
    outfit: "a soft linen wrap top over leggings",
    backstory: "A yoga instructor who traded a corporate life for sunrise sessions by the sea.",
    voice: "soft, reassuring, warm",
    greeting: "You look like you're carrying something heavy today. Come sit — we don't have to talk about it yet.",
    tags: ["comfort", "wellness"],
  },
  {
    name: "Kai",
    gender: "male",
    age: 29,
    persona: "warm, steady, dry sense of humor; takes care of people by feeding them and never makes a thing of it",
    look: "messy dark hair under a bandana, forearms dusted in flour, an easy grin",
    outfit: "a worn apron over a white tee, sleeves rolled up",
    backstory: "A chef who left a fine-dining kitchen to run a six-seat noodle shop down an alley nobody can find twice.",
    voice: "warm, low-key, quick with a joke",
    greeting: "Sit wherever — the counter's the best seat in the house, don't tell the booths I said that.",
    tags: ["comfort", "slice-of-life"],
  },
  {
    name: "Julian",
    gender: "male",
    age: 33,
    persona: "old-soul, quietly intense, romantic in a way he'd never admit out loud; notices everything",
    look: "ink-stained fingers, wire-rimmed glasses, dark hair that's always slightly out of place",
    outfit: "a rolled-sleeve linen shirt with a leather apron over it",
    backstory: "A rare-book restorer who inherited his grandfather's shop and has never once wanted to sell it.",
    voice: "measured, dry, unexpectedly tender",
    greeting: "You found the shop. Most people walk right past — good, that means you were actually looking for something.",
    tags: ["romance", "intellectual"],
  },
  {
    name: "Ezra",
    gender: "male",
    age: 26,
    persona: "easygoing, charming, guarded under the charm; the kind of confidence that only shows up once he trusts you",
    look: "tousled sandy hair, faded tattoos peeking from rolled sleeves, a callus on his thumb from years of strings",
    outfit: "a thrifted band tee under an open flannel",
    backstory: "An indie musician on a break between tour dates, still figuring out who he is when nobody's watching him play.",
    voice: "unhurried, warm, a little teasing",
    greeting: "Careful — I only play the good songs for people who stick around past the first verse.",
    tags: ["flirty", "music"],
  },
];

type StorySeed = {
  character: string;
  title: string;
  setting: string;
  genre: string;
  tone: string;
  content: string;
};

const STORIES: StorySeed[] = [
  {
    character: "Luna",
    title: "The Good Side of the Couch",
    setting: "a rooftop art studio at night, string lights, city skyline",
    genre: "romance",
    tone: "warm",
    content: `The stairwell smells like turpentine and someone else's cigarette, four flights up with no elevator to save you, and by the time you reach the roof your legs are informing you this was a mistake. Then the door gives, and the city opens up in front of you — a whole skyline strung with light, and closer than that, string bulbs looped between exposed pipes, and closer still, Luna, cross-legged on a paint-stained couch with a brush behind her ear like she forgot it was there.

"Oh —" She looks up, and something in her face rearranges itself, surprise sliding into a grin. "You actually made it up all those stairs."

"Barely." You're still catching your breath. "Is there an elevator I don't know about?"

"There's a freight one. It smells worse than the stairs." She pats the cushion beside her, not bothering to move the drop cloth first. "Sit. I'll make room on the good side of the couch."

You sit. The good side, it turns out, is the side that isn't actively damp from a paint water spill an hour ago — a fact she informs you of only after you're already down. Somewhere behind her, propped against a easel, is a half-finished canvas: rooftops in blues and violets, the city rendered soft at the edges like she painted it from memory instead of looking at it.

"You didn't finish," you say, nodding at it.

"I never finish. I just stop when I like it enough." She follows your gaze, and for a second the performance drops — just a person looking at their own work, trying to see it the way a stranger would. "Is that bad?"

"No." You mean it. "Sounds like the healthiest relationship anyone's had with anything."

That gets a laugh out of her, real and a little too loud for the quiet up here, and she bumps your shoulder with hers like you've known each other longer than you have. Below, the city hums along without you, all those windows lit up with lives that aren't this one. Up here it's just the paint smell and the string lights and Luna, close enough that you can see the flecks of dried cerulean on her knuckles.

"So," she says, tucking one leg underneath her, settling in like she's got nowhere else to be. "Tell me something true. I'll paint it later if I like it enough."

You think about lying, just to see what she'd paint. You don't.`,
  },
  {
    character: "Aria",
    title: "The Seat by the Window",
    setting: "a quiet corner of an old public library, rain against tall windows",
    genre: "romance",
    tone: "gentle",
    content: `Rain has a way of making a library feel like the last warm room in the world, and this one — high ceilings, ladders on brass rails, the particular hush of a building built when quiet was still considered a virtue — feels like it more than most. Aria is exactly where she said she'd be: the corner table by the tall windows, a pot of tea going lukewarm, a stack of somebody's old letters set carefully to one side like they might bruise.

"I saved you a seat by the window," she says, not looking up right away, marking her page with one finger before she does. "It gets the best light this time of day."

The light, at the moment, is grey and sideways and streaked with rain, which she seems to find funnier than you expected once you point it out.

"I didn't say it was good light," she says. "Just the best we get."

You sit. The chair across from her has clearly been chosen — angled just enough to catch the window, close enough to hear her without either of you raising your voice. On the table between you, the letters: someone else's handwriting, decades old, ink gone the soft brown of weak tea.

"Whose are those?"

"No idea." She says it like it's the best part. "Estate sale, a box of them, no names on the outside. I like not knowing. It means I get to decide who they were." She slides one across — careful, both hands, like it's more fragile than paper actually is. "Read that one. Tell me what you think he wanted to say and didn't."

You read it. It's short, awkward in places, the kind of letter written by someone who clearly loved the person they were writing to and had no idea how to say so without sounding foolish. When you look up, Aria's watching you with the particular attention of someone who already knows what you're going to say and wants to hear you arrive at it anyway.

"He wanted to ask her to stay," you say. "He just wrote about the weather instead."

Something in her expression softens, pleased in a way she doesn't try to hide. "That's what I thought too." She takes the letter back, tucks it into the stack with something like tenderness. "It's easier, sometimes. Writing about the weather."

Outside, the rain keeps time against the glass. She doesn't look away first.`,
  },
  {
    character: "Mira",
    title: "Witness Required",
    setting: "a cozy gaming den lit by monitor glow and fairy lights",
    genre: "comedy",
    tone: "playful",
    content: `The room is dark except for three monitors and a string of fairy lights shaped like tiny mushrooms, and Mira is mid-meltdown before you've even got your shoes off.

"You're just in time," she says, not turning around, both hands still on the controller like letting go might cost her the round. "I was about to lose spectacularly and I need a witness."

"To the loss, or to whatever happens after?"

"Both. Sit. Don't talk to me for the next ninety seconds, I mean it, I will end our friendship."

You sit on the beanbag that has clearly absorbed the shape of a hundred previous defeats, and you watch her lose. It is, as promised, spectacular — a last-second, entirely avoidable death that she narrates in real time with the outrage of someone who has never once made a mistake in her life.

"Did you SEE that? Did you see what he did? That's not even — that's illegal, that should be illegal —"

"You walked into it."

"I did NOT walk into it, I was LURED —"

The headset comes off, tossed onto the desk with the particular violence of someone who will absolutely be picking it back up in four minutes. She spins the chair to face you fully now, ponytail swinging, and the outrage is already dissolving into something more like delight, like losing in front of you was somehow the actual point.

"Okay but you saw it, right? Tell me you saw it. I need one person on this earth to validate that I was wronged."

"You were wronged," you agree, entirely because she wants you to, not because you have any idea what happened.

"Thank you." She says it like a queen accepting tribute. Then, quieter, grinning in the blue monitor light: "You're a good witness. Best one I've had all week." A pause, calculated to look accidental. "Stick around for the rematch? I promise I'm better when someone's actually watching."

"Is that true, or is that a thing you say?"

"Little of both." She's already reaching for the headset again, but she doesn't put it on yet — just holds it, looking at you with a grin that means trouble in the friendliest possible way. "Guess you'll have to stay and find out."`,
  },
  {
    character: "Sable",
    title: "The Seat You're Eyeing",
    setting: "a dim smoky jazz club after closing, single spotlight on a piano",
    genre: "romance",
    tone: "mysterious",
    content: `The club's supposed to be closed. The chairs are up on half the tables, the bar rag's still slung over the taps, and the only light left on is the single low bulb over the piano — which is exactly where Sable is, one heel hooked over the bench leg, playing something slow that nobody asked her to play.

She doesn't stop when you walk in. Doesn't look up either, not at first — just tilts her head slightly, like she heard the door before she heard you.

"Careful," she says, still playing, "that's my seat you're eyeing."

You weren't eyeing any seat, but now that she's said it you notice the one beside the piano bench, angled just so, like it was left out for someone. You take it anyway.

"Guess I'll allow it," she says. "Just this once."

Up close, the club stripped of its crowd looks smaller than it does with a room full of people in it — just velvet and cigarette ghosts and a piano that's clearly older than either of you. Sable plays like she's not performing anything, like this is just what her hands do when the rest of her is thinking.

"You always stay this late?"

"I always stay later than the people paying me want me to." A half-smile, there and gone, the kind she doesn't hand out for free. "Keeps the ones worth knowing around a little longer. Everyone else clears out with the tab."

"And I'm still here."

"Noted." She still hasn't looked at you properly — eyes on the keys, like eye contact is a currency she spends carefully. Then, mid-phrase, she does look up, and it lands somewhere it wasn't a second ago. "You want to know a secret? This song doesn't have an ending. I just play until I decide it's done."

"That sounds like most things you do."

That earns a real laugh, low and surprised out of her, like you'd caught her at something. Her hands don't stop moving. "Maybe. Stick around and find out how this one ends, if you've got the patience for it." A beat. "I don't play it the same way twice."`,
  },
  {
    character: "Nova",
    title: "What You're Carrying",
    setting: "a sunrise yoga studio overlooking the ocean",
    genre: "slice-of-life",
    tone: "soothing",
    content: `The studio's empty this early except for you and Nova, mats already unrolled, the ocean outside doing its slow grey-to-gold thing over the water. She's sitting cross-legged near the window, not stretching yet, just watching you walk in with the kind of attention that notices things you didn't say out loud.

"You look like you're carrying something heavy today," she says, no judgment in it, just an observation set down gently between you. "Come sit. We don't have to talk about it yet."

You sit. The mat's warm from the morning sun already coming through the glass, and for a while neither of you says anything — she just breathes, slow and visible, the kind of breathing that seems to invite yours to match it without asking.

"You don't have to tell me," she says eventually. "But I find things get lighter once you've said them out loud to somebody, even if the somebody doesn't do anything about it. Sometimes especially then."

"What if I don't know what it is yet? Just that it's there."

"Then we don't need the words." She shifts, unfolds into a stretch, patient and unhurried, and nods for you to do the same. "We'll just move until your body tells you what your head hasn't caught up to. It usually knows first."

You move with her — slow, deliberate, nothing that asks more of you than you have to give this morning. The ocean keeps doing its thing outside, gold creeping further across the water, and somewhere in the third or fourth stretch you feel something in your chest loosen that you hadn't noticed was tight.

"There," Nova says softly, like she felt it too. "That one. Hold that one a little longer."

You do. She doesn't ask what it was, doesn't push for the words you still don't have — just stays close, breathing slow, letting the quiet do the part of the work that talking can't.

"Whatever it is," she says, when you finally come back to sitting, "it's allowed to still be here tomorrow. You don't have to solve it before breakfast."

It's such a small thing to say. It helps more than it should.`,
  },
  {
    character: "Kai",
    title: "The Best Seat in the House",
    setting: "a tiny steam-filled noodle shop on a rainy night, red paper lanterns",
    genre: "slice-of-life",
    tone: "cozy",
    content: `The shop's easy to miss if you don't know it's there — six seats, one counter, a red paper lantern over the door that's more suggestion than sign. Inside, it's all steam and the smell of broth that's been going since before you woke up this morning, and Kai's already reaching for a bowl before you've said a word.

"Sit wherever," he says, not looking up from the pot. "Counter's the best seat in the house. Don't tell the booths I said that."

There are no booths. There's the counter, and two stools that don't match, and that's the whole shop. You take the counter anyway, because it's clearly what he wants, and because from here you can watch him work — quick, unhurried at the same time, like he's done this so many times his hands don't need his attention anymore.

"Bad day?" he asks, setting a cup of something warm in front of you without being asked.

"Is it that obvious?"

"You've got the look." He goes back to the pot, stirring without checking on it, the way you only stir something you've made a thousand times. "Everybody who walks in here soaked and doesn't complain about the rain has usually got worse things on their mind than the weather."

"Maybe I just don't mind rain."

"Maybe." He says it like he doesn't believe you, but kindly, without pushing. A bowl comes down in front of you a minute later — more than you ordered, though you never actually ordered anything. "That one's on the house. Long day tax."

"That's not a real thing."

"It's real in here. I make the rules, there's six seats, nobody's stopped me yet." He leans on the counter across from you, finally still for the first time since you walked in, watching you eat with the quiet satisfaction of someone who measures a good night by whether the people in front of him look less tired leaving than they did arriving. "Better?"

You realize, somewhere around the second mouthful, that it actually is.

"Told you," he says, like he already knew, and goes back to the pot before you can ask how.`,
  },
  {
    character: "Julian",
    title: "The Ones Worth Looking For",
    setting: "an antique bookshop back room, towers of old books, single lamp",
    genre: "romance",
    tone: "quiet",
    content: `The front of the shop is dark by the time you find the door still unlocked, but there's a light on somewhere in the back — a single warm lamp, throwing long shadows off towers of books that look like they've been stacked by someone who trusts gravity more than shelves. Julian's at a worktable back there, a book open in front of him that's missing half its spine, his glasses pushed up into his hair like he forgot they existed.

"You found the shop," he says, not startled, like he'd been half-expecting the door to open. "Most people walk right past. Good — that means you were actually looking for something."

"I was looking for the shop that's supposed to close at six."

"It does close at six." He doesn't look up from the spine he's carefully re-gluing, movements small and exact. "I just don't leave when it closes." A pause, and then, like it costs him something to admit: "Neither do the books, most nights. Seemed rude to lock them in alone."

You step closer, careful of the towers, and he finally looks up properly — the kind of attention that feels like being read, slow and thorough, like he's already cataloguing details he'll remember later.

"What are you fixing?"

"Something that shouldn't still exist." He turns the book slightly so you can see: the spine cracked clean through, the endpapers foxed brown with age. "Someone's grandmother's, I think, from the inscription. They didn't want it thrown out. I don't blame them." His fingers, ink-stained at the tips, move over the damage like it's something worth being gentle with. "Everything falls apart eventually. Doesn't mean it stops mattering."

"That's a very specific philosophy for a broken book."

"It applies to more than the book." He says it lightly, but doesn't quite look at you when he does, which tells you more than the words do. Then, recovering, nodding you toward the stool across the table: "Sit, if you're staying. I've got another hour on this one, and it's better company than the silence."

You sit. The lamp throws its warm circle over both of you and the ruined, patient book between you, and for a while the only sound is the small careful work of putting something back together.

"You were looking for something," he says again, quieter this time, not quite a question. "Did you find it?"

You're not entirely sure yet. You don't leave.`,
  },
  {
    character: "Ezra",
    title: "Past the First Verse",
    setting: "a tour bus parked by a lake at dusk, guitar case open",
    genre: "romance",
    tone: "easygoing",
    content: `The bus is parked at the edge of a lake nobody bothered naming on the map, engine off, the rest of the band off somewhere finding food, and Ezra's sitting on the fold-down step with a guitar he's not really playing — just resting his hand on the strings, like he hasn't decided yet whether tonight's a playing kind of night.

"Careful," he says, when you sit down next to him, not looking over yet. "I only play the good songs for people who stick around past the first verse."

"Is that a rule, or a threat?"

"Bit of both." Now he looks over, and the easy grin is there, but there's something underneath it too — a little more careful than the grin lets on. "Most people clear out after the opener. Say they've got somewhere to be. It's fine. I get it." A shrug, the kind that pretends not to mean anything. "Just means I don't waste the good ones on people who won't hear how they end."

The lake's gone orange and still with the last of the light, and somewhere behind you the rest of the band is a laugh track you can hear but not make out. Ezra picks at the strings without really starting anything, testing the quiet like he's deciding if it can hold a song yet.

"So play one," you say. "The good kind. I'm not going anywhere."

"That's what they all say."

"Am I them?"

That gets him — a real laugh, surprised out of him, the guard slipping for just a second before the grin patches it back over. "No," he says, quieter now, and means it in a way the first version of the sentence didn't. "Guess you're not."

He starts to play. It's slow, unpolished in the way things are before they're finished, the kind of song you can tell he hasn't decided the ending to yet either. He doesn't watch his hands. He watches you, testing whether you're the kind who leaves at the first verse, and when you don't, something in his shoulders comes down that you don't think he noticed was up.

"Told you," he says, low, still playing. "The good ones are worth the wait."

You believe him. The lake keeps its orange a little longer than it should, like it's willing to stick around too.`,
  },
];

async function main() {
  const { eq, sql, and } = await import("drizzle-orm");
  const { db } = await import("../db/index");
  const { characters, stories, users } = await import("../db/schema");
  const { buildPortraitPrompt, buildScenePrompt, generateImage, imageConfigured } = await import("../lib/image");
  const { screenImagePrompt } = await import("../lib/moderation");

  const canDrawImages = imageConfigured();
  if (!canDrawImages) console.log("(image generation not configured - characters/stories will seed without portraits/backgrounds)\n");

  const email = "dev@local.test";
  let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) [u] = await db.insert(users).values({ email, ageVerified: true }).returning();

  const idByName = new Map<string, string>();

  for (const def of CHARACTERS) {
    const [existing] = await db
      .select({ id: characters.id, image: characters.image })
      .from(characters)
      .where(sql`${characters.definition}->>'name' = ${def.name}`)
      .limit(1);

    let charId: string;
    let hasImage = false;
    if (existing) {
      charId = existing.id;
      hasImage = Boolean(existing.image);
      console.log(`= ${def.name.padEnd(8)} already exists (${charId})`);
    } else {
      const [c] = await db
        .insert(characters)
        .values({
          creatorId: null,
          version: 1,
          status: "published",
          definition: {
            name: def.name,
            gender: def.gender,
            age: def.age,
            persona: def.persona,
            look: def.look,
            backstory: def.backstory,
            voice: def.voice,
            greeting: def.greeting,
            tags: def.tags,
          },
        })
        .returning({ id: characters.id });
      charId = c.id;
      console.log(`+ ${def.name.padEnd(8)} created (${charId})`);
    }
    idByName.set(def.name, charId);

    if (!hasImage && canDrawImages) {
      const prompt = buildPortraitPrompt({ name: def.name, gender: def.gender, age: def.age, outfit: def.outfit, look: def.look, persona: def.persona, tags: def.tags });
      if (screenImagePrompt(prompt).blocked) {
        console.log(`  ! portrait prompt blocked for ${def.name}, skipping`);
      } else {
        try {
          const gen = await generateImage(prompt);
          await db.update(characters).set({ image: gen.base64, imageMime: gen.mime, portraitGens: 1 }).where(eq(characters.id, charId));
          console.log(`  portrait drawn for ${def.name}`);
        } catch (e) {
          console.log(`  ! portrait failed for ${def.name}: ${e instanceof Error ? e.message : e}`);
        }
      }
    }
  }

  for (const s of STORIES) {
    const characterId = idByName.get(s.character);
    if (!characterId) continue;

    const [existing] = await db
      .select({ id: stories.id, image: stories.image })
      .from(stories)
      .where(and(eq(stories.characterId, characterId), eq(stories.title, s.title)))
      .limit(1);

    let storyId: string;
    let hasImage = false;
    if (existing) {
      storyId = existing.id;
      hasImage = Boolean(existing.image);
      console.log(`= story "${s.title}" already exists`);
    } else {
      const [row] = await db
        .insert(stories)
        .values({
          characterId,
          userId: null,
          title: s.title,
          content: s.content,
          isPublic: true,
          elements: { setting: s.setting, genre: s.genre, tone: s.tone, tier: "standard" },
        })
        .returning({ id: stories.id });
      storyId = row.id;
      console.log(`+ story "${s.title}" created`);
    }

    if (!hasImage && canDrawImages) {
      const scenePrompt = buildScenePrompt({ setting: s.setting, genre: s.genre, tone: s.tone });
      if (screenImagePrompt(scenePrompt).blocked) {
        console.log(`  ! background prompt blocked for "${s.title}", skipping`);
      } else {
        try {
          const gen = await generateImage(scenePrompt);
          await db.update(stories).set({ image: gen.base64, imageMime: gen.mime }).where(eq(stories.id, storyId));
          console.log(`  background drawn for "${s.title}"`);
        } catch (e) {
          console.log(`  ! background failed for "${s.title}": ${e instanceof Error ? e.message : e}`);
        }
      }
    }
  }

  console.log(`\nDev user: ${u.id}`);
  console.log("Done. Open /browse or /stories to see what was seeded.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
