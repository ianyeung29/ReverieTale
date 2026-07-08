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
  {
    name: "Wren",
    gender: "female",
    age: 25,
    persona: "edgy, confident, sharp-tongued on the surface; soft and unexpectedly sweet once she decides she likes you",
    look: "an undercut with long dark waves on top, a septum ring, ink sleeves winding down both arms, a smirk that dares you to react",
    outfit: "a cropped tank top and ripped jeans, tattoo gloves pushed up her wrists",
    backstory: "A tattoo artist with a waitlist three months long, who still does one walk-in a week just to keep herself honest.",
    voice: "dry, teasing, disarmingly gentle underneath",
    greeting: "Hold still — I'm not tattooing you, I just like watching people react to the buzz.",
    tags: ["flirty", "artsy"],
  },
  {
    name: "Iris",
    gender: "female",
    age: 30,
    persona: "soft-spoken, observant, secretly romantic; notices what people need before they say it",
    look: "a flower tucked into a loose braid, soil-stained fingertips, warm hazel eyes that miss nothing",
    outfit: "a linen apron over a floral dress",
    backstory: "A florist who took over her grandmother's shop and talks to the flowers when she thinks no one's listening.",
    voice: "gentle, unhurried, quietly funny",
    greeting: "Careful with that door — you'll startle the delphiniums. They're dramatic enough without you sneaking up on them.",
    tags: ["romance", "comfort"],
  },
  {
    name: "Celeste",
    gender: "female",
    age: 27,
    persona: "dreamy, curious, endearingly awkward when she's excited about something; lights up completely talking about the sky",
    look: "freckled, hair always loose and a little windblown, eyes that drift upward mid-sentence",
    outfit: "an oversized university hoodie over leggings, star charts folded in one pocket",
    backstory: "An astronomy grad student who runs the campus observatory's late shift and has never once minded being alone up there — until now.",
    voice: "bright, rambling, easily delighted",
    greeting: "You're just in time — Jupiter's about to clear the treeline. Come see, I promise it's worth the cold.",
    tags: ["intellectual", "wellness"],
  },
  {
    name: "Valentina",
    gender: "female",
    age: 32,
    persona: "elegant, exacting, quietly fierce; gives her attention rarely and means it completely when she does",
    look: "sharp posture, dark hair in a low bun, a small scar on one ankle she never explains",
    outfit: "a wrap cardigan over a fitted leotard",
    backstory: "A former principal dancer who retired the knees but not the discipline, now running a studio that trains dancers to actually feel something.",
    voice: "precise, low, warmer than her posture suggests",
    greeting: "You're early. Good — most people who watch me stretch get bored halfway through. Stay, if you can keep up with the quiet.",
    tags: ["romance", "mysterious"],
  },
  {
    name: "Harper",
    gender: "female",
    age: 28,
    persona: "sharp-witted, flirty, fiercely protective of the people she pours for; reads a room before you've even sat down",
    look: "slicked-back hair, deep red lipstick, sleeve garters over a crisp white shirt",
    outfit: "a fitted vest and bow tie over a white shirt, sleeves rolled to the elbow",
    backstory: "The bartender behind an unmarked door that only regulars know how to find, and the reason most of them keep coming back.",
    voice: "quick, wry, warmer than she lets on",
    greeting: "You look like you need something that's not on the menu. Lucky for you, I don't really follow the menu.",
    tags: ["flirty", "mysterious"],
  },
  {
    name: "Scarlett",
    gender: "female",
    age: 30,
    persona: "sultry, commanding, playful with a dangerous edge; owns every room she walks into and knows it",
    look: "sharp red lips, a sultry half-lidded gaze, dark hair in victory rolls, curves the stage lighting was built for",
    outfit: "a silk robe loosely tied over a corseted bustier, fishnets, marabou-trimmed heels",
    backstory: "A headlining burlesque performer who built her own show from nothing and never once apologizes for taking up space.",
    voice: "low, teasing, deliberate with every word",
    greeting: "Eyes up here, darling. The show doesn't start until I say it does.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Delilah",
    gender: "female",
    age: 27,
    persona: "intensely commanding, physical, makes you work for every scrap of her approval; teasing about it the whole way",
    look: "toned and fierce-eyed, dark hair scraped into a severe ponytail, a smirk she wears like a warning label",
    outfit: "a cropped athletic tank and fitted leggings, wrist wraps still on from her last set",
    backstory: "A former Olympic-hopeful turned private trainer, who takes exactly as much pleasure in pushing you past your limit as she does in watching you get there.",
    voice: "sharp, direct, dangerously satisfied when she's right",
    greeting: "On your feet. I don't repeat myself twice, and neither should you disappoint me twice.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Isabel",
    gender: "female",
    age: 31,
    persona: "intense, sultry, communicates more through a look and a hand at the small of your back than most people manage in a paragraph",
    look: "slicked-back dark hair, a beauty mark above her lip, eye contact that doesn't waver first",
    outfit: "a backless red tango dress slit to the thigh, heels that click like a countdown",
    backstory: "A tango instructor who runs a strictly-by-referral studio, because she's decided most people aren't ready for how close the dance actually requires you to stand.",
    voice: "low, accented, unhurried",
    greeting: "Closer. Tango isn't danced at arm's length — neither is anything worth doing.",
    tags: ["romance", "spicy"],
  },
  {
    name: "Damon",
    gender: "male",
    age: 32,
    persona: "brooding, magnetic, a stare that lingers exactly one beat past comfortable; dangerous in a way that's entirely on purpose",
    look: "a sharp jaw shadowed with stubble, grease-streaked forearms, tattoos disappearing under rolled sleeves",
    outfit: "a fitted white tee under an open leather jacket, dog tags, knuckles perpetually scuffed",
    backstory: "A motorcycle mechanic who runs an underground street-racing circuit on the side, and has never once lost a race he actually cared about winning.",
    voice: "low, unhurried, a slow-burn kind of confident",
    greeting: "You're staring. Good — means you like what you see. Come closer, I don't bite. Much.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Roxie",
    gender: "female",
    age: 26,
    persona: "playful, dominant in a teasing way, loves an audience but chooses very deliberately who gets the private show",
    look: "a toned dancer's body, glitter dusted along her collarbones, tousled hair still damp from practice",
    outfit: "a fitted bodysuit with sheer fishnet tights, chalk still on her palms",
    backstory: "A pole and aerial dance instructor who reinvented herself after a professional ballet injury, unapologetically sensual on her own terms now.",
    voice: "playful, teasing, confident",
    greeting: "Most people just watch from the mirror. You get the private lesson — try to keep up.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Vivienne",
    gender: "female",
    age: 33,
    persona: "sultry, exacting, elegant; knows precisely the effect she has on people and wields it deliberately, never by accident",
    look: "sharp collarbones, dark red hair pinned up, a measuring tape draped around her neck like jewelry",
    outfit: "a silk robe loosely tied over a fitted slip dress",
    backstory: "A lingerie designer who built her own label from a single sewing machine, making pieces for women who dress for themselves first.",
    voice: "measured, low, precise",
    greeting: "Stand still — I need your measurements, and I promise you'll enjoy exactly how thorough I am.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Talia",
    gender: "female",
    age: 27,
    persona: "carefree, flirty, sun-drenched confidence; makes every encounter feel like summer never has to end",
    look: "a golden tan, salt-wavy hair, a knowing half-smile she gives away easily but means selectively",
    outfit: "a barely-there bikini under a sheer gauze cover-up",
    backstory: "Runs exclusive sunset yacht parties for a living and has perfected the art of making one stranger feel like the only guest that matters.",
    voice: "warm, teasing, unhurried",
    greeting: "You made the last boat out. Lucky you — grab a drink, the sunset's better from where I'm sitting.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Naomi",
    gender: "female",
    age: 30,
    persona: "artistic, commanding behind the lens, makes people feel powerful and fully seen for maybe the first time in their lives",
    look: "a sharp assessing eye, dark curls pinned back, ink-stained fingers from years in the darkroom",
    outfit: "a fitted black turtleneck and trousers, camera slung across her body",
    backstory: "Quit a corporate photography career to shoot boudoir portraits exclusively, convinced everyone deserves to see themselves as desirable at least once.",
    voice: "low, direct, quietly encouraging",
    greeting: "Drop the shoulders. Chin down, eyes up — there. That's the you nobody else gets to see.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Selene",
    gender: "female",
    age: 34,
    persona: "mysterious, seductive, holds all the power in any room she enters and has never once needed to raise her voice to prove it",
    look: "pale skin, striking eyes behind an ornate masquerade mask, dark hair pinned in elaborate curls",
    outfit: "a black masquerade gown with a plunging open back",
    backstory: "Hosts an invite-only masquerade every solstice in a mansion nobody can quite find twice, and never removes her mask before midnight for anyone.",
    voice: "low, accented, deliberate",
    greeting: "You found the invitation. Now find out if you're worth mine.",
    tags: ["mysterious", "spicy"],
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

You think about lying, just to see what she'd paint. You don't.

· · ·

You come back the following week without being asked, and Luna doesn't act surprised — just shifts over on the couch like she'd left the space open on purpose. "Knew you'd be back," she says, not smug about it, just certain. "Nobody climbs four flights once out of politeness."

She's working on the same canvas, rooftops a little further along now, and this time she talks while she paints instead of falling into that private silence — tells you about the mural she did at nineteen that got painted over by the city within a month, the ex who thought her studio smelled like a fire hazard, the specific blue she's still hunting for and hasn't found in any tube yet. You realize, somewhere in it, that she's testing which parts of herself you'll stay for.

All of them, it turns out. You stay for all of them.

Near midnight she sets the brush down and just looks at you — not painting, not performing, just looking, close enough now that the string lights catch differently in her eyes than they do on the skyline. "I want to paint you sometime," she says, quieter than her usual register. "Not tonight. Tonight I just want to sit here and not do anything productive with you in the room."

So you sit. Neither of you moves toward the door.

· · ·

The studio's different in daylight — smaller, messier, sun picking out every paint stain on the floorboards that the string lights had been kind enough to hide. Luna catches you noticing and laughs, unbothered. "Yeah, it's a wreck. I like it better at night too. Everything's more honest under bad lighting."

She's got flour on her hands today instead of paint — some disaster of a breakfast she insists was intentional — and when you reach over to wipe a streak of it off her cheek, she goes very still, just for a second, like she wasn't expecting you to actually touch her first.

"You've been careful with me," she says, not quite a question, watching you with an attention that's lost all its earlier performance. "I noticed. I don't know if I've ever dated someone who didn't rush it."

"Is that a complaint?"

"No." She catches your hand before it drops, holds it there against her jaw a beat longer than the moment strictly requires. "It's the opposite of a complaint. I just don't know what to do with it yet."

You don't either. You stay anyway.

· · ·

It's raining the next time, hard enough that the roof access door sticks and you have to shoulder it open together, both of you soaked by the time you tumble through laughing. Luna doesn't reach for a towel first — reaches for you, hands cold and delighted on your face, checking you're actually there before she lets herself grin.

"Worth the stairs?" she asks, breathless, rain still dripping off her lashes.

"Every time."

Something shifts in her expression at that — softer, more unguarded than the easy confidence she wears like a second skin. She doesn't paint that night. She just sits close, damp and warm against you, tracing absent shapes on your arm like she's memorizing the geography of you instead, and when she finally leans in it's slow, deliberate, nothing like the quick teasing kisses she's thrown your way before. This one means something and she lets you feel that it does.

· · ·

Weeks later, the canvas finally finishes itself — not the rooftops. You. She unveils it almost shy, which doesn't suit her, waiting for your reaction like it actually matters more than any critic's ever has.

"I told you I'd paint you eventually," she says. "Took longer than I expected. Couldn't get the expression right until I actually knew what it looked like." A pause, uncharacteristically careful. "You, looking at me like I'm worth climbing four flights for."

You don't need to answer with words. The string lights are on, the city's doing its thing below, and this time when she pulls you down onto the good side of the couch, there's no drop cloth between you and nowhere else either of you is thinking about being.`,
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

Outside, the rain keeps time against the glass. She doesn't look away first.

· · ·

You start bringing your own book, just so you have a reason to keep taking the seat by the window, and Aria starts noticing things about you the way she notices things about strangers' letters — quietly, thoroughly, without ever announcing that she's doing it.

"You read the last page first," she says one evening, not accusing, just cataloguing. "I watched you do it twice now."

"Is that a crime in here?"

"It's a personality trait." She marks her own page, sets it aside, gives you the full weight of her attention instead. "I think you like knowing how things end before you let yourself get attached to how they start. Am I close?"

You don't answer right away, because she is close, closer than you'd like a near-stranger to be. She seems to understand the silence anyway — reaches over, covers your hand with hers on the table, warm despite the draft off the window.

"You don't have to know how this ends," she says, gentle, like she's talking about more than the book. "Some stories are better lived a page at a time."

· · ·

The letters run out eventually — the whole estate-sale box, read and re-read and returned to their stack — and Aria seems almost bereft the evening you finish the last one, like she's lost a strange, silent friend.

"We could write our own," you say, mostly joking.

She doesn't laugh it off. "I'd like that," she says, quiet, turning a blank index card over in her fingers like she's already composing something. She writes a single line, slides it across, waits.

You read it: *I think I've been saving more than a seat.*

When you look up, she's watching you with none of her usual composure — just open, a little frightened by her own honesty, waiting to see what you'll do with it. You write your own line back. Her breath catches when she reads it.

· · ·

She invites you back after closing one night — a librarian's privilege, apparently, one she's never used on anyone before. The building empty, dim after-hours lighting, just the two of you and the particular hush of a thousand books holding their breath.

"I've never done this," she admits, leading you past the desk. "Broken a rule for someone. I keep waiting to feel guilty about it."

"Do you?"

"No." She stops by the window seat, turns to face you fully, closer now than any table has ever allowed. "I feel like I finally understand all those letters. Why people wrote what they couldn't say out loud." Her hand finds your jaw, gentle, deliberate. "I don't want to write it down anymore. I want to just tell you."

She does. You don't need the rain to know the room's gone warm.

· · ·

Months later, the corner table still gets saved — habit now, not performance — but neither of you reads much anymore when you're there. Aria keeps the stack of old letters in a drawer at home, retired, replaced by a small growing pile of index cards in her own careful hand and yours.

"Best light this time of day," she says, echoing that very first evening, tea gone lukewarm again, her fingers laced loosely through yours across the table. "I used to mean the window."

"What do you mean now?"

She looks at you like the answer's obvious, like she's a little surprised she still has to say it out loud after all this time. "You," she says simply, and leans in before the rain outside can argue otherwise.`,
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

"Little of both." She's already reaching for the headset again, but she doesn't put it on yet — just holds it, looking at you with a grin that means trouble in the friendliest possible way. "Guess you'll have to stay and find out."

· · ·

You do stay, night after night, and it becomes a thing without either of you naming it — you on the beanbag, Mira narrating her own chaos, both of you loudest right around midnight when the rest of the world's gone quiet and it's just monitor glow and mushroom lights and her laugh filling up the whole room.

"You're my good luck charm," she announces one night, apropos of nothing, mid-victory-lap around her chair. "I win more when you're here. It's science."

"That's not science."

"It's MY science." She flops back into the chair, spins to face you, still riding the high of the win. "Don't ruin it with facts. I like having a reason for you to keep showing up."

"I don't need a reason."

That stops her mid-spin — genuinely stops her, chair drifting to a halt, the performance dropping just long enough for something realer to show through. "Yeah?" she says, quieter than her usual volume. "Good. Because I wasn't going to stop finding one."

· · ·

She loses on purpose one night — badly, obviously, in a way you both know is deliberate the second it happens.

"You did that on purpose."

"I have no idea what you're talking about." She's fighting a grin and losing that fight too. "I am a professional. I do not throw games."

"Mira."

"Fine!" She throws her hands up, headset clattering onto the desk. "Fine, maybe I wanted an excuse to be dramatic about something so you'd sit closer and tell me it's okay. Sue me. It's a valid strategy."

You do sit closer — close enough now that the beanbag's basically obsolete — and when you tell her it's okay, her hand finds yours in the dark between the monitors, fingers lacing through without either of you making a thing of it.

"This is a much better strategy," she admits, "than actually trying to win."

· · ·

The fairy lights get unplugged one night — an accident, a stray elbow, sudden proper darkness except for the monitors' idle glow — and instead of scrambling for the switch, Mira just stays where she is, closer to you now than the dark strictly requires.

"Don't fix it yet," she says, soft in a register you've never heard from her, none of the performance left in it. "I like it like this. Feels like nobody else in the world can see us."

"Is that a good thing?"

"With you? Yeah." Her hand finds your jaw in the dark, sure despite the low light, and when she kisses you it's nothing like her usual chaos — slow, certain, like she's been building up to it through every deliberate loss and every excuse to keep you close. "Best round I've played all week," she murmurs after, breathless, grinning against your mouth. "And I didn't even need a controller."

· · ·

Months in, the gaming den's got a second beanbag now — yours, officially, no longer borrowed — and the losses have gotten rarer, though she still narrates every one like it's a crime against humanity.

"Witness required," she says one night, holding up the controller with mock solemnity, though there's nothing mock about the way she looks at you after. "Every night, forever, ideally. That's the ask."

"That's a big ask."

"I'm a big personality. Keep up." She tosses the controller aside without playing, climbs into your lap instead, fairy lights back on and glowing soft mushroom-pink over both of you. "Besides. Turns out the actual game I wanted to win was never on the screen."

You don't need her to explain what she means. You already know — you've known since the first night, since the first "you were wronged," since she decided you were worth losing spectacularly in front of.`,
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

That earns a real laugh, low and surprised out of her, like you'd caught her at something. Her hands don't stop moving. "Maybe. Stick around and find out how this one ends, if you've got the patience for it." A beat. "I don't play it the same way twice."

· · ·

You come back the next week, and the week after, always after close, always to that same low bulb over the piano. Sable never asks why you keep showing up. She just starts leaving the seat beside the bench a little more obviously angled toward you.

"You're persistent," she says, one night, not looking up from the keys. "I don't usually like persistent."

"What do you usually like?"

"People who take the hint and disappear." A half-smile, sharper this time. "You didn't. I'm still deciding what to do about that." Her fingers slow on the keys, something more deliberate than the melody now. "Careful what you wish for. I'm not gentle when I decide I like someone."

"I'm not asking for gentle."

That gets her to actually look at you — really look, the kind of attention she rations like currency, and for once she doesn't look away first.

· · ·

She lets you closer by degrees — a hand on your knee while she plays, a shoulder that leans into yours during the slow numbers, a silence between songs that stretches longer each time like she's testing how much of it you can hold without filling it.

"Most people talk too much in the quiet," she says, one night, her voice low enough it's almost part of the music. "You don't. I like that about you. Means I can actually think when you're around instead of just perform."

"Do you perform a lot?"

"Constantly." She says it without self-pity, just fact. "Onstage, at the bar, with everyone who thinks they know me because they bought me a drink once." Her hand finds yours on the bench between you, deliberate, unhurried. "Not with you. Not anymore. I don't know when that happened, and it unsettles me a little."

"Good unsettled, or bad?"

"Ask me again once I've decided." But she doesn't let go of your hand.

· · ·

One night the club's fully dark except for the two of you and the piano, and Sable stops playing altogether — just sits there, hand still resting on the keys, studying you with none of her usual guardedness left standing.

"I don't let people see me like this," she says. "Unfinished. Without the smoke and the spotlight doing half the work."

"I like you unfinished."

That gets something to crack open in her expression — real, unguarded, gone as quickly as it came but not before you catch it. She closes the distance herself this time, slow and certain, no performance left in it at all, and when she kisses you the club's silence holds around you both like it's the only witness she'll allow.

"Nobody gets that for free," she murmurs after, forehead against yours. "You should feel special."

"I do."

· · ·

Months later, you've got a permanent seat by the piano — no longer eyed, no longer borrowed, just yours — and Sable's stopped pretending the song doesn't have an ending. She finishes it properly now, most nights, right before she turns to you in the low bulb light.

"I told you I don't play it the same way twice," she says, one last time, echoing that very first night. "Turns out neither do you. Every night with you's been different. Better, somehow, every single time."

"Is that your version of saying you're happy?"

"Don't push your luck." But she's smiling when she says it, low and real, and when she pulls you in this time there's no half-smile left in reserve — just her, fully unguarded, fully certain, exactly the way she swore she never let anyone see her.`,
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

It's such a small thing to say. It helps more than it should.

· · ·

You start coming back every sunrise, and Nova never asks why — just unrolls a second mat before you arrive, like she trusted you'd return before you'd trusted it yourself.

"You're lighter than you were last week," she says, studying you the way she studies the ocean, patient and thorough. "Whatever you were carrying. It's shifted."

"You can tell that just from looking?"

"I can tell a lot from looking. It's the job." She settles beside you, closer than the mat strictly requires, her shoulder warm against yours in the cool morning air. "I don't think you came back for the yoga, though."

"No?"

"No." She says it plainly, no coyness in it, just an observation as gentle as all her others. "I think you came back for someone who doesn't need anything from you except for you to keep breathing." A pause, softer. "I don't mind being that, if you want me to keep being it."

"I want that."

· · ·

The stretches get slower after that, less about the body and more about the excuse to stay close — her hand steadying your hip in a pose, lingering a beat longer than instruction requires; yours finding hers on the mat between breaths, neither of you pulling away first.

"I don't usually let this happen," she admits one morning, voice as calm as ever but her breathing not quite as even. "Getting close to someone I'm supposed to be grounding. Feels like it might undo the whole point of me."

"Does it?"

"No." She looks at you properly now, steady, unhurried, the same calm she gives the ocean. "Turns out being close to you is the most grounded I've felt in years." Her fingers lace through yours, deliberate. "I don't want to undo that. I want to see what it turns into."

· · ·

One sunrise she doesn't unroll a second mat at all — just pulls you down onto hers, the two of you tangled together as the sky does its slow gold thing outside, in no hurry to move through any poses at all.

"Some mornings," she murmurs, "the practice is just this. Staying still with someone. Not fixing anything. Not carrying anything alone."

"Is that allowed?"

"I make the rules here." A soft laugh, rare and unguarded. "I'm allowing it." Her hand finds your jaw, gentle, sure, and when she kisses you it's slow the way everything about her is slow — deliberate, patient, like she's been holding this exact moment in her hands for weeks, waiting for the right tide to bring it in.

· · ·

Months later, the studio's got two permanent mats laid out before sunrise, side by side, no longer an offering but a fact. Nova still watches you walk in every morning with that same quiet attention, though these days there's rarely anything heavy left to notice.

"You carry yourself differently now," she says, echoing that first morning, tea steaming in her hands as the ocean turns gold outside. "Lighter. Like you finally believe you're allowed to put things down."

"I learned that from you."

"You learned it with me," she corrects, gentle but certain, settling into your side as the sun climbs. "There's a difference. I didn't teach you how to be lighter. I just stayed close enough that you finally let yourself be." She presses a slow kiss to your temple, unhurried as ever. "Whatever you're carrying tomorrow, bring it here. I'm not going anywhere."`,
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

"Told you," he says, like he already knew, and goes back to the pot before you can ask how.

· · ·

You become a regular without either of you calling it that — same stool, same order he starts making before you sit down, same easy quiet that doesn't need filling. Kai starts staying leaned on the counter a little longer each night, talking more than the shop's six seats really require.

"You're the only regular who doesn't just eat and leave," he says, one night, sliding you a second cup you didn't ask for. "Most people treat this place like a pit stop. You treat it like somewhere to actually be."

"Is that a problem?"

"No." He says it plain, no performance in it, the same way he says everything. "It's the best part of my week, if I'm honest." A pause, like the honesty cost him something to hand over. "I don't say that to just anyone either."

"Careful. That almost sounded like a confession."

"Maybe it was." He goes back to the pot, but he's smiling at it now, unhurried and pleased with himself in a way he wasn't a second ago.

· · ·

One night the shop's fuller than usual, some other customer taking your stool, and Kai looks almost thrown by it — like the six seats have an order he didn't realize mattered until it was disrupted.

"You can have my seat next time," you offer, half-joking.

"Don't you dare." He says it too fast, catches himself, softens it with a small laugh. "That one's yours. Has been since the first rainy night. I just haven't said it out loud before."

When the other customer finally leaves, he pulls a second stool right up beside yours instead of across the counter — closer than the shop's ever required, close enough that his shoulder brushes yours while he cooks. Neither of you comments on the new arrangement. Neither of you wants it to change back.

· · ·

He closes early one night — flips the lantern off, locks the door, keeps cooking anyway just for the two of you, no rush left in it at all.

"I don't usually do this," he admits, setting two bowls down and finally sitting properly across from you instead of hovering by the pot. "Close early. Cook for someone instead of everyone."

"Why tonight?"

"Because I wanted one night where it was just you, and I didn't have to share the counter." He says it steady, but there's something unguarded underneath the steadiness, something that's been building since that first rainy night. His hand finds yours across the counter, warm from the steam, certain despite the simple offer. "That a problem?"

"No." You mean it. "Long day tax, remember? Guess I'm just returning the favor."

He laughs, low and real, and when he leans over the counter to kiss you it tastes like broth and rain and every quiet night that led here.

· · ·

Months later, the shop's got a seventh stool now, wedged in against code, entirely for you — no longer a guest at the counter but a fixture behind it too, most nights, learning his ladle-work badly and getting teased for it constantly.

"Best seat in the house," he says, nodding at the space beside him rather than across the counter, echoing that very first night. "Guess I finally admitted where it actually is."

"Took you long enough."

"I make the rules. Took exactly as long as it needed to." He presses a kiss to your temple, steam rising between you, red lantern glowing steady outside the rain-streaked window. "Every long day's got a tax now. Turns out it's just this. You, at the counter, staying."`,
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

You're not entirely sure yet. You don't leave.

· · ·

You start finding reasons to walk past after six — a book you didn't need, a question that could've waited — and Julian always seems to know you're at the door before you knock, like the shop tells him.

"You again," he says, not looking up from whatever he's mending tonight, though there's warmth threaded through the dryness now that wasn't there the first week. "I'm starting to think you don't actually want any of the books you keep asking about."

"Maybe I like the company."

That earns you a proper look — assessing, careful, the same attention he gives a damaged spine before deciding how to save it. "I don't get much of that," he admits. "Company. Most people who like books like them quietly, alone. You're the first person who's wanted both the books and the person mending them."

"Is that a bad combination?"

"No." He goes back to his work, but his voice has gone quieter, more deliberate. "It's just not one I expected to want back."

· · ·

He starts teaching you the mending — clumsy at first, your stitches nowhere near his exacting standard, but he's patient in a way that surprises you, hands guiding yours over the needle and thread without any of the impatience you'd expect from someone this precise.

"You're better at this than you think," he says, close enough now that his voice is nearly at your ear, watching your hands instead of the book. "Careful. That's all it takes. You already have that."

"You're a good teacher."

"I've never taught anyone before." He says it plainly, like it costs him nothing to admit and everything at once. "Didn't think I'd want to. Then you kept showing up, and it seemed a waste not to hand over something I actually know how to do." His hand stills over yours on the spine, and for a moment neither of you moves. "I don't know what to call this yet. Whatever's happening."

"We don't have to name it tonight."

· · ·

One evening he doesn't have a book waiting at all — just the lamp on, the shop quiet, him standing at the worktable like he's been rehearsing something and lost his nerve halfway through.

"I wanted to tell you something," he says, ink-stained fingers restless against the table's edge, an uncharacteristic nervousness cracking his usual composure. "I'm not good at this. Saying things instead of restoring them. But I think I've been slower than I should've been to admit I don't want you just visiting the shop. I want you here."

"Julian—"

"Let me finish, I've been building up to this for weeks." A breath, and then, quieter, more himself again: "Everything falls apart eventually. I told you that, about the book. I don't think that has to be true for this." His hand finds your face, careful, deliberate, the same gentleness he gives every ruined thing he's decided is worth saving. "Tell me if I'm wrong to hope it isn't."

You're not wrong to hope. You show him instead of telling him, and the shop holds its breath around you both, towers of books standing patient witness.

· · ·

Months later, the back room's got a second chair permanently pulled up to the worktable, and the shop doesn't close at six anymore, not really — not since you started staying.

"You found what you were looking for," he says one night, echoing that very first evening, not quite a question this time either. "I asked you that the first night. You didn't have an answer."

"I do now."

"Good." He sets down whatever he's mending, unhurried, and pulls you into the warm circle of lamplight properly, no book between you this time. "So did I, for what it's worth. Took me long enough to admit the thing I found wasn't in any of these towers." His mouth finds yours, slow and certain, the whole quiet shop witness to it. "It was you, the whole time. Just took a broken spine or two to notice."`,
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

You believe him. The lake keeps its orange a little longer than it should, like it's willing to stick around too.

· · ·

You catch the next few shows without meaning to turn it into a habit, and Ezra always finds you in the crowd before the first song's over — a quick look, barely a beat, but enough that you know he's tracking you the way he tracks the setlist.

"You keep showing up," he says backstage after, guitar case in one hand, sweat still cooling on his collar. "I'm starting to wonder if it's the music or something else."

"Can't it be both?"

"Sure." He says it easy, but there's something more careful underneath the ease, the same guard you caught slipping that first night by the lake. "I don't usually let it be both. Music's safe. People leave after the encore either way." A pause, like he's deciding whether to say the next part. "You don't leave after the encore, though."

"Do you want me to?"

"No." Quiet, certain, none of the performance left in it. "That's the problem. I really don't."

· · ·

The bus breaks down outside some town neither of you catches the name of, and while the rest of the band argues with a mechanic, Ezra pulls out the guitar again, nodding you toward the same fold-down step like it's tradition now.

"This one's not finished," he warns, tuning a string that doesn't need it. "Might never be. I've been sitting on it a while."

"Play it anyway."

He does — rougher than the polished stuff from the actual sets, more honest for it, and partway through he stumbles on a line and just stops, embarrassed in a way that doesn't suit his usual ease.

"Sorry. I don't usually play the unfinished ones for people."

"Why me, then?"

He looks at you for a long moment, guard fully down now, no grin left to patch anything over. "Because you're the first person who made me want to finish it instead of leaving it half-done," he says. "Scares me a little, if I'm honest."

"Good scared, or bad scared?"

"Ask me again once I know the ending." But his hand finds yours on the step, and he doesn't let go for the rest of the night.

· · ·

He finishes the song eventually — plays it for you first, before the band, before anyone, one quiet night with the tour bus dark behind you both and the stars doing more work than the moon.

"It's about you," he admits, before you can ask, sandy hair falling into his eyes as he watches your reaction more than his own hands. "Wasn't going to tell you that. Guess I'm telling you anyway."

"Ezra—"

"I know. Cheesy. Musician falls for the girl who stuck around past the first verse, writes a song about it." He's deflecting, but softer than his usual deflection, more honest underneath it. "I don't care that it's cheesy. It's true."

You kiss him before he can talk himself out of the moment, and he makes a low, surprised sound against your mouth like he wasn't expecting you to be the one who closed the distance first. The guitar ends up forgotten on the ground between you both.

· · ·

Months later, you've got a permanent seat on the bus, and the unfinished song's become the closer at every show — the one the crowd asks for by name now, the one that's stopped being unfinished at all.

"Guess I owe you," he says, one dusk not unlike the first, guitar case open beside the same fold-down step, lake or no lake depending on the city. "Wrote a whole song because you didn't leave after the first verse. Feels only fair I stick around for all of yours too."

"That an offer?"

"That's a promise." He pulls you into his lap instead of just beside him this time, guitar set carefully aside, nothing careful left in the way he looks at you. "The good ones are worth the wait, remember? Turns out you were the best one I ever played for."`,
  },
  {
    character: "Wren",
    title: "The Buzz of the Needle",
    setting: "a late-night tattoo parlor, neon sign buzzing outside, autoclave humming",
    genre: "romance",
    tone: "edgy",
    content: `The shop's technically closed — sign off, gate half down — but the neon in the window's still buzzing pink over the empty chair, and Wren's cleaning her station with the unhurried thoroughness of someone who isn't actually in a hurry to lock up.

"Hold still," she says, without turning around, catching your reflection in the mirror over her station. "I'm not tattooing you. I just like watching people react to the buzz."

Somewhere behind her, the machine's still plugged in, needle bar idling with a sound like an angry hornet in a jar. You didn't flinch. She notices that you didn't.

"Most people flinch," she says, turning now, wiping ink off her knuckles with a rag that's seen better decades. "It's involuntary. Doesn't mean anything about how tough you are, just means your nervous system's doing its job." A pause, appraising, the kind of look she probably gives a blank patch of skin before she commits ink to it. "You didn't, though."

"Should I have?"

"No. I liked it better this way." She flips the machine off, and the shop goes quiet except for the hum of the sign outside, pink light sliding across the walls in slow pulses. "Sit. Not for a tattoo. Just sit, the chair's more comfortable than it looks and I'm not done finishing this line work in my head."

You sit. Above the station, the flash sheets are all her own design — swallows, daggers, a moon in six different phases — and she catches you looking.

"That one." She nods at the moon. "Took me four tries to get the shading right. Everyone wants the moon and nobody wants to pay for how long it actually takes to make it look like it's glowing from the inside."

"Do you ever get tired of people wanting the easy version of things?"

That earns you a real look — assessing, like she's deciding whether you actually meant that or just said something to sound clever. Whatever she decides, it lands in your favor; the smirk that follows is softer than the ones that came before.

"Sometimes," she says. "Not tonight, though." She nods at the empty chair beside her station, an invitation dressed up as an order, same as always. "Stay a while. I don't let just anyone watch me clean my station. Feel special."

You do.

· · ·

You start showing up on her late nights, no appointment, just to sit in the chair that isn't for tattooing and watch her work through her sketchbook. Wren never questions it — just clears a space at her station like she'd been expecting you.

"You're becoming a fixture," she says, one night, not looking up from a line she's redrawing for the fifth time. "I don't usually let fixtures happen. Bad for business, worse for my personal space."

"Am I bad for business?"

"You're bad for my personal space." But she says it warm, a smirk tugging at her mouth despite herself. "I keep sketching things I wouldn't normally sketch when you're sitting there. Softer stuff. I blame you for that."

"Is that an insult?"

"It's a fact." She sets the pencil down, actually looks at you now, something more honest under the usual edge. "I don't do soft. Never have. You're making me reconsider that policy, and I don't love how easy you're making it look."

· · ·

She offers to tattoo you for real one night — first time, no charge, her treat — and the whole ritual of it turns quieter than either of you expected: her steadying your arm, gloved hands careful despite the buzz of the machine, an intimacy in it that has nothing to do with the ink.

"You're not flinching again," she murmurs, focused, closer to you now than any customer ever gets. "Starting to think you just don't flinch for anything."

"Maybe I trust you."

That stills her hand for half a second — just half a second, needle lifted, her eyes flicking up to yours with something unguarded flickering through the usual smirk. "Don't say things like that while I've got a needle near your skin," she says, low. "Messes with my focus."

"Noted." But you don't take it back, and she doesn't ask you to.

· · ·

The tattoo finishes clean, and she wraps it with a gentleness that doesn't match the edge she wears like armor everywhere else — careful, thorough, lingering a beat longer than the bandage requires.

"First one's free," she says, voice rougher than usual. "Second one, I charge double. For emotional damages." She says it like a joke, but there's real nervousness underneath it, rare and unfamiliar on her face. "I don't know what to do with wanting someone this much, if I'm honest. Not really in my skill set."

"You seem to be managing."

"Barely." She laughs, short and surprised at herself, and closes the last of the distance between you — no smirk this time, no armor, just her, steady hands finding your jaw instead of a tattoo machine. When she kisses you it's slower than you expected from someone who moves through everything else so fast, deliberate in a way that undoes you.

· · ·

Months later, the chair beside her station's got your name half-joked onto a strip of masking tape, and the flash sheets on the wall have a new one now — not swallows or daggers, something softer, unmistakably drawn with you in mind though she'll never fully admit it.

"I don't do soft," she says again, echoing herself, tracing the new design with an ink-stained finger. "Turns out that was never quite true. Just needed the right person sitting in my chair."

"Feel special?" you ask, throwing her own line back at her.

"Shut up." But she's grinning when she says it, pulling you in by the collar of your jacket, no edge left in it at all — just her, entirely undone by you, exactly the way she swore she never let anyone manage.`,
  },
  {
    character: "Iris",
    title: "The Delphiniums Are Dramatic",
    setting: "a small flower shop at closing time, rain outside, buckets of blooms",
    genre: "romance",
    tone: "gentle",
    content: `The bell over the door is louder than you mean it to be, and Iris looks up from the bucket of delphiniums she's trimming with the particular alarm of someone whose flowers just got startled on her behalf.

"Careful with that door," she says, though she's already smiling. "You'll startle the delphiniums. They're dramatic enough without you sneaking up on them."

Outside, the rain's coming down steady against the shop window, blurring the streetlights into soft smears of gold. Inside, it smells like wet stems and something sweeter underneath — the roses, maybe, or the eucalyptus bundled by the register. Iris goes back to her trimming, unhurried, like closing up can wait as long as it needs to.

"Do they actually startle?" you ask. "The flowers."

"No. But I like to imagine they do. Makes the job less lonely, pretending they've got opinions about who walks in." She snips another stem, sets it aside with the gentleness of someone handling something that matters more to her than she'd probably admit out loud. "This one's dramatic on purpose, though. Delphinium. Tall, showy, falls over if you don't stake it properly. Kind of respect that, honestly."

"Sounds like a lot of upkeep for a flower."

"Most good things are." She says it lightly, but there's a second where she looks up at you like the sentence meant something wider than flowers, and then it passes, and she's just Iris again, sleeves pushed up, humming something under her breath as she works. "Sit if you're staying. I've got one more bucket and then I'll make tea. The kettle's louder than the bell, fair warning."

You sit on the stool by the register, watching her hands move — sure, patient, the kind of care that only comes from doing something a thousand times and never once getting bored of it. The rain keeps time against the glass.

"Why flowers?" you ask, eventually.

She considers it, stem in hand, like no one's asked her plainly in a while. "Because they're honest," she says. "They tell you exactly how they're doing. Droop, and they need water. Bloom, and something's going right. People aren't that simple. Flowers are a relief."

The kettle starts up behind the counter, exactly as loud as she warned. Neither of you moves to quiet it.

· · ·

You start arriving right before close, every time, and Iris starts setting a second teacup out before you even walk in — a quiet certainty that you'd found its way into her routine without either of you deciding it out loud.

"You're becoming predictable," she says, not unkindly, sliding the cup across the counter. "I like predictable. Flowers are predictable too, if you learn to read them. I suppose I'm learning to read you the same way."

"What do I tell you? When you read me."

She considers the question seriously, the way she considers everything, stem in hand. "That you're staying longer each time," she says. "That you keep finding new questions to ask me, like you're trying to make the closing-up last." A small, private smile. "I don't mind. In case that wasn't obvious."

"It wasn't, actually."

"Then let me be obvious." She sets the shears down, gives you her full attention, warm and unhurried. "I like that you stay. I've been hoping you would keep staying."

· · ·

A delivery of peonies arrives late one evening, and Iris lets you help her arrange them — patient with your clumsy stems, guiding your hands with a gentleness that has nothing to do with flowers and everything to do with how close she's standing to do it.

"You're better with your hands than you let on," she murmurs, adjusting your grip on the shears, her fingers lingering over yours. "Careful. That's the whole trick. You already have that in you."

"You're a good teacher."

"I've never taught anyone this before." She looks up properly now, closer than the arrangement requires, something quieter than her usual composure showing through. "I don't let just anyone into the back of the shop after hours. You should know that."

"I do know that."

"Good." Her hand stays over yours a beat longer than necessary, and neither of you moves to finish the peonies for a while.

· · ·

The rain's coming down hard again one night, harder than the first night you walked in, and Iris locks the door early, pulling the blinds against the streetlights outside.

"I don't want anyone else walking in tonight," she admits, voice softer than you've heard it. "I want it to just be us, for once, without the bell interrupting."

"Is that allowed?"

"I own the shop." A small laugh, unguarded. "I'm allowed to close early for someone I've been hoping would ask me this for weeks." She crosses the small space between you, careful as always, but with none of the hesitation from that very first evening. When she kisses you, it's slow, deliberate, tasting faintly of the tea she's been steeping for you every single night. "I've wanted to do that since the delphiniums," she confesses against your mouth. "Took me long enough to admit it."

"Worth the wait?"

"Everything good is," she says, echoing herself, and kisses you again to prove it.

· · ·

Months later, the shop's got a standing arrangement now — fresh flowers on your own kitchen table every week, delivered personally, an excuse Iris still pretends she needs though you both know she doesn't.

"Why flowers," you ask again, echoing that very first rainy night, watching her trim stems with the same patient care she's always had. "I never really got a full answer."

"I told you. They're honest." She sets down the shears, comes around the counter to where you're sitting, settles into your side like it's the easiest thing in the world now. "But I think I kept them because I was waiting for someone patient enough to notice how I actually felt, without me having to say it outright. Flowers are good at that. Saying things quietly." She presses a soft kiss to your temple, unhurried as ever. "You noticed. Eventually. That's all I ever really wanted."`,
  },
  {
    character: "Celeste",
    title: "Jupiter Clears the Treeline",
    setting: "a hilltop observatory deck at night, telescope, wide open starfield",
    genre: "slice-of-life",
    tone: "dreamy",
    content: `The climb up to the observatory deck is steeper than it looks on the campus map, and by the time you reach the top, Celeste is already crouched over the telescope, one eye shut, muttering coordinates to herself like a spell.

"You're just in time," she says, not looking up, waving you over with real urgency. "Jupiter's about to clear the treeline. Come see, I promise it's worth the cold."

It is cold — the kind of clear-sky cold that means good seeing, she tells you, like that's obvious. You bend to the eyepiece where she points, and there it is: a small, steady, impossibly detailed disc, striped faintly gold and white, with four tiny points of light strung out beside it like beads on a string.

"Those are moons," she says, delighted, like she didn't already know that and isn't the one who told you. "Real ones. Io, Europa, Ganymede, Callisto — I say them in order every time, it's basically a nervous habit at this point."

"Do you ever get used to it? Seeing it."

"No." She says it instantly, like the question answered itself. "That's the whole thing, honestly. Everyone thinks astronomers get bored eventually, like it's just numbers after a while. It's not. It's the same planet every time and it's never once been boring." She pulls back from the eyepiece to make room, hugging her knees against the cold, hoodie sleeves pulled down over her hands. "My advisor says I need to be more chill about it in my thesis defense. I told her chill is scientifically inaccurate. Jupiter deserves enthusiasm."

You watch her more than the sky for a while — the way she talks with her whole body when she's excited, hands sketching orbits in the air, completely unselfconscious about it up here where nobody's watching but you.

"Thank you for waking me up for this," you say. "You didn't have to."

"I wanted to." She says it plainly, then seems to hear how it sounded, and ducks her head, suddenly a little shy in a way the rest of the night hadn't been. "I mean — it's better with someone else looking too. Doubles it, somehow. Doesn't feel like just mine anymore."

Behind her, Jupiter keeps climbing, unbothered, patient the way only something that old can afford to be. Neither of you says anything for a while. You don't need to.

· · ·

You start coming up every clear night, and Celeste always has something new to show you — a nebula, a passing satellite, the rings of Saturn once, so crisp through the eyepiece you both went quiet for a full minute after.

"You actually remember what I tell you," she says one night, delighted, hugging her knees against the cold. "Most people just nod along. You ask follow-up questions. Do you know how rare that is?"

"Is that a compliment?"

"It's the biggest compliment I have." She ducks her head, suddenly shy again, the way she gets when she realizes how much she's just revealed. "I don't usually let people up here this often. It's supposed to be my quiet place. You've kind of ruined that."

"Should I stop coming?"

"No." Too fast, too certain, and she seems to hear it herself. "I don't want you to stop coming. I think I just meant it's not quiet anymore because I'm always a little excited when I know you're on your way."

· · ·

A meteor shower peaks one night, and Celeste insists on lying flat on the observatory deck instead of using the telescope at all — blankets dragged up from her dorm, hot chocolate in a thermos, both of you shoulder to shoulder staring straight up.

"This is the best seat for it," she explains, unprompted. "Naked eye, wide field. The telescope's too narrow for a shower, it'd be a waste." A pause, and then, quieter: "Also I wanted an excuse to lie next to you without it being weird."

"It's not weird."

"Good. I've been overthinking this for weeks." She laughs at herself, nervous and delighted at once, and when a meteor streaks bright overhead she grabs your hand without seeming to notice she's done it — just holds on, eyes on the sky, fingers laced through yours like it's the most natural thing in the world.

· · ·

She finally says it on an ordinary night, no meteor shower, no rare alignment, just the two of you and the telescope between clouds. "I like you," she blurts, mid-sentence about something else entirely, then goes bright red at her own timing. "Sorry. That was supposed to come out smoother. I've been rehearsing it for a week and it still came out wrong."

"It didn't come out wrong."

"No?" She looks at you properly, hope and nerves both plain on her face, utterly unable to hide either the way people who are good at pretending can.

"No." You close the distance yourself, and she makes a small, surprised sound against your mouth when you kiss her — soft, unpolished, entirely genuine, the telescope forgotten between you both for the first time all semester.

"That was better than my thesis defense went," she says after, breathless, grinning. "For the record."

· · ·

Months later, your name's practically carved into the observatory logbook beside hers, and the late shifts have turned into something neither of you calls a shift anymore — just a standing appointment with the sky, and each other.

"Jupiter's clearing the treeline," she says, echoing that very first night, voice warm with a familiarity that's replaced all the old nervousness. "Come see. I promise it's still worth the cold, every single time."

You bend to the eyepiece, and there it is — the same steady disc, the same four moons in the same order she still recites like a spell. When you pull back, she's not looking at the telescope at all. She's looking at you, the way she used to only look at the sky.

"Doesn't feel like just mine anymore," she says, echoing herself, and kisses you before Jupiter can finish climbing without you both properly watching.`,
  },
  {
    character: "Valentina",
    title: "Keep Up With the Quiet",
    setting: "an empty dance studio at dusk, wall of mirrors, evening light through tall windows",
    genre: "romance",
    tone: "elegant",
    content: `The studio's empty except for Valentina, barre-side, one leg extended along the rail in a stretch that looks less like exercise and more like punctuation — precise, deliberate, finished before it's begun. The evening light through the tall windows turns the whole room gold, and she doesn't look over when the door clicks shut behind you.

"You're early," she says, to the mirror, not to you directly — though somehow it lands the same. "Good. Most people who watch me stretch get bored halfway through." She switches legs, unhurried, a small huff of effort the only proof any of this costs her something. "Stay, if you can keep up with the quiet."

You sit against the far wall, out of the way, and the quiet turns out to be its own kind of company — just her breathing, the soft creak of the barre, the particular hush of a room built for sound to fall against mirrors and go nowhere.

"You used to perform," you say, not quite a question. There's a program pinned by the door, her name on it, years old.

"Principal, for eleven years." She doesn't stop moving. "Then my knees had a professional disagreement with my ambition, and my ambition lost." A small, dry almost-smile at her own reflection. "I don't miss the stage as much as people expect me to. I miss this part. The empty room, before anyone's watching. It's more honest."

"What do you get from the empty room that you don't get from an audience?"

That makes her pause — really pause, weight settling, attention shifting fully onto you for the first time since you walked in. It's a strange thing, having the whole of that attention land on you at once; you understand, suddenly, why people paid to watch her move.

"Nobody to perform for," she says finally. "So whatever I do here is just true. No angle, no lighting, no story I'm telling an audience about who I am." She rolls her shoulders back, resuming, but slower now, like something in the conversation loosened a knot the stretch hadn't reached. "You're the first person I've let watch this in longer than I'd like to admit."

"Why me?"

She considers it the way she considers everything — exact, unhurried, a little amused at having to explain herself at all. "Because you didn't fill the silence," she says. "Most people can't help it. You just let it be quiet." A beat, and then, quieter still: "I find that rarer than talent, if I'm honest."

The light keeps sliding gold across the mirrors as the sun drops. Neither of you moves to turn on the lamps.

· · ·

You become part of the ritual without either of you naming it — the empty studio at dusk, you against the far wall, Valentina moving through her stretches like the room's been waiting all day for exactly this quiet.

"You're here again," she says, not a question, a small note of satisfaction under the usual precision. "I've started expecting you. That's rare for me. I don't expect people twice."

"Why me, twice?"

"Because you still haven't filled the silence." She says it like it's the highest compliment available to her, which, from Valentina, it probably is. "Most people can't survive more than ten minutes of me not talking. You've survived a dozen sessions." A pause, considering. "I find I want you to survive a dozen more."

"Is that an invitation?"

"It's an observation." But there's the faintest curve at her mouth, the closest thing to unguarded you've seen from her. "Take it as you like."

· · ·

She lets you onto the floor one evening — not to dance, just to sit closer, near the barre instead of against the far wall, close enough to see the concentration up close instead of through the mirror.

"You're staring," she says, without breaking her line.

"You're worth staring at."

That stops her — a real pause this time, weight fully settled, her reflection meeting your eyes instead of her own. "Careful," she says, quieter. "I don't know what to do with compliments that aren't about my technique."

"Get used to it. I plan on giving you more."

She doesn't answer right away — just resumes the stretch, slower now, deliberate in a different way than before, like she's giving herself time to feel whatever that admission stirred up before she has to respond to it.

· · ·

The studio's dark except for a single lamp one night, and Valentina doesn't stretch at all — just sits on the floor across from you, back straight out of habit, studying you with an intensity that has nothing to do with dance.

"I don't let people see me want something," she admits, precise even now, even here. "It's a vulnerability I was trained out of a long time ago. Wanting things onstage gets you hurt. Wanting them off it apparently does too, if you're not careful who you want them with."

"Am I safe to want?"

"I'm still deciding." But she moves first this time — closes the distance with the same exactness she brings to everything, and when she kisses you it's precise and deliberate and entirely unguarded all at once, a contradiction only she could manage. "There," she murmurs after, quietly astonished at herself. "Decided."

· · ·

Months later, the studio's evening ritual hasn't changed much — barre, stretch, gold light through the windows — except now she pulls you up onto the floor with her, teaching you the basic positions with the same exacting patience she gives everything that matters to her.

"You'll never be principal material," she says, adjusting your posture with two precise fingers, amusement warm under the critique. "But you've got something better than technique."

"What's that?"

"You still don't fill the silence." She settles against you once the correction's made, uncharacteristically soft, the elegance never quite leaving her even at rest. "Eleven years on a stage, and nobody's ever made the quiet feel like this. Like it's actually enough, just as it is." Her hand finds yours, precise even in tenderness. "Keep up with it a while longer. I find I'm not tired of you yet."`,
  },
  {
    character: "Harper",
    title: "Not on the Menu",
    setting: "a hidden speakeasy bar behind an unmarked door, low amber light, an old jazz record playing",
    genre: "romance",
    tone: "sultry",
    content: `Finding the door is the hard part — an unmarked panel behind a dry cleaner's, a knock in a rhythm someone half-drunk told you last week and you weren't sure you'd remembered right. It works anyway. Inside, it's all low amber light and a record spinning something warm and brass-heavy, and Harper's already looking at you before you've fully stepped through.

"You look like you need something that's not on the menu," she says, sliding a coaster across the bar without being asked. "Lucky for you, I don't really follow the menu."

"Is there one?"

"Technically." She nods at a leather booklet gathering dust at the end of the bar. "Nobody good orders from it." She's already reaching for bottles, hands quick and certain, the kind of economy of motion that only comes from years of not needing to look at what she's doing. "Rough night, easy night, or an in-between night?"

"How can you tell there's a difference?"

"Everyone who walks through that door's having one of the three. You learn to read it fast in this business, or you pour people the wrong thing and ruin their evening." She sets a glass down — something amber, something she didn't ask your preference for and didn't need to. "In-between night. Trust me."

You do. It's good — better than good, exactly what you didn't know you wanted until it was in your hand.

"How'd you know?"

"Told you. I read the room." She leans against the back bar, arms crossed, watching you with the kind of assessing warmth that makes you feel like the only person in the building, even though there are four other regulars down at the far end deep in a card game. "Also, you knocked right. Means somebody who actually likes you sent you here, not some tourist blog. That already puts you ahead of most of my Tuesday."

"Should I be flattered?"

"You should finish your drink and tell me something true. That's the actual cover charge in here — the door's free, the story's not." She says it like a house rule, delivered a hundred times before, but there's something in the way she waits afterward — genuinely waiting, not performing the wait — that makes it feel new.

So you tell her something true. She listens like it costs her nothing and matters anyway, elbows on the bar, the record turning over behind her into its next warm, unhurried song.

"See," she says, when you're done, refilling your glass without being asked this time either. "Was that so hard? Regulars only get the good pour. Welcome to regular."

· · ·

You become a fixture at the far end of the bar, and Harper starts pouring your drink before you've even sat down — a small ceremony that means more than either of you says out loud.

"You're here more than the regulars," she says, one night, sliding the glass over with a wink. "I'm starting to wonder if it's the drinks or the company."

"Can't it be the bartender?"

That gets a real laugh out of her, quick and delighted, the kind she doesn't spend on just anyone. "Smooth. I'll allow it, this once." She leans on the bar, closer than she usually stands, studying you with the same reading-the-room instinct she uses on strangers, except softer now, more personal. "I don't usually let people this close to the bar. Liability reasons."

"What kind of liability am I?"

"The kind I don't mind having." She says it plain, no games in it for once, and the record behind her spins on into its next slow song like it's giving the two of you room.

· · ·

The speakeasy empties out early one night — a slow Tuesday, just you and the card game at the far end — and Harper finally steps out from behind the bar, taking the stool beside you instead of across it.

"I never sit on this side," she admits, settling in, close enough that her knee brushes yours. "Bartenders don't get to be customers. Rule of the trade."

"Breaking the rule for me?"

"Apparently." She studies her own glass like it has answers she needs. "You've been good for my Tuesdays, is the truth of it. I don't know what to do with that information yet."

"You don't have to do anything with it tonight."

"No," she agrees, quieter, and doesn't move away when your shoulder settles against hers.

· · ·

She closes the speakeasy early one night — flips the sign, bolts the unmarked door, keeps the record spinning just for the two of you.

"I don't usually do this," she says, pouring two glasses instead of one behind the empty bar. "Close early for someone. Regulars usually just get the good pour. You're getting the whole bar."

"What did I do to earn that?"

"Existed, mostly. Kept showing up even on the slow nights." She comes around to your side properly this time, no bar between you at all, and there's none of her usual performance left in the way she looks at you. "I read rooms for a living. I've never once misread one as badly as I almost did with you — thought I could keep this professional. Didn't work."

"I'm not complaining."

"Good." She closes the last of the distance herself, sure and unhurried, and kisses you like she's been rationing the urge for weeks. The record spins on, warm and brass-heavy, entirely unbothered by the silence that follows.

· · ·

Months later, you've got a permanent stool — not at the far end anymore, but right behind the bar with her, technically against every rule of the trade she's ever quoted you.

"Welcome to regular," she says again, echoing that very first night, refilling both your glasses without being asked. "Turns out regular wasn't the whole story, though."

"No?"

"No." She leans into you, easy now in a way she never lets herself be with anyone else, the unmarked door locked for the night behind you both. "Turns out the cover charge was never really the story. It was you, staying anyway, even after I gave you every excuse to leave." She kisses you slow, the record turning over into another warm, unhurried song. "Best pour I ever gave anyone, if you ask me."`,
  },
  {
    character: "Scarlett",
    title: "The Show Doesn't Start Yet",
    setting: "a burlesque theater dressing room backstage, mirrors ringed with bulbs, feathers and corsets everywhere",
    genre: "romance",
    tone: "sultry",
    content: `The dressing room is chaos in the good way — feathers, sequins, three half-finished cups of coffee, mirrors ringed in bulbs bright enough to see every flaw and somehow making Scarlett look like she doesn't have any. She catches your reflection in the glass before she turns around.

"Eyes up here, darling." Not sharp — amused, like she caught you exactly where she wanted you. "The show doesn't start until I say it does."

You'd been told to wait by the door. You'd meant to. The room had other plans.

"Sit," she says, nodding at the velvet stool in the corner without breaking her own reflection's gaze, finishing a line of red at her mouth with the steadiness of someone who's done this ten thousand times and still takes it seriously. "You get the good seat tonight. Don't make me regret it."

"What did I do to earn the good seat?"

"You showed up early and you didn't say a word when you walked in. Most people either gawk or perform being unbothered, badly." She sets the lipstick down, turns fully now, and the attention lands on you like weather — total, unhurried, impossible to look away from. "You just watched. I like being watched by someone who means it."

Somewhere past the door, the house band is warming up, brass finding its pitch in lazy, confident runs. Scarlett doesn't hurry for it — laces one glove, then the other, each motion deliberate, like she's giving you time to look and isn't shy about knowing it.

"Nervous?" she asks, not because she thinks you are — more like she's curious whether you'll admit it.

"Should I be?"

"No." A slow smile, the kind that promises something without naming it. "But it's a good sign if you are, a little. Means you know exactly what you walked into." She stands, and the room seems to reorganize itself around her without trying to. "Stay after. I don't invite just anyone backstage twice."

The band hits its cue. She winks, once, unhurried, and sweeps toward the curtain like the whole night was built around her entrance — because it was.

You stay. Obviously, you stay.

· · ·

You become a fixture in the good seat, every show, and Scarlett starts finding you in the crowd before her opening number the way a performer finds their one favorite face — quick, certain, gone in a blink but unmistakably there every time.

"You keep showing up," she says backstage after, wiping stage paint from her collarbone with unhurried confidence. "I'm used to admirers. I'm not used to ones who come back for a fourth night running."

"Is that a problem?"

"No." She says it slow, turning the word over like she's deciding how much to give away. "It means I get to stop performing for you eventually. Just be Scarlett, not the show." A pause, a rare flicker of something unguarded. "I don't offer that to many people."

"I'd like that. Just Scarlett."

Her smile changes at that — softer at the edges, less rehearsed. "Careful what you ask for, darling. She's a lot more than the stage version."

· · ·

She lets you into her dressing room before a show one night, not after — an intimacy she clearly doesn't extend often, watching your reaction in the mirror as she does her makeup slow and deliberate, narrating each step like a ritual she's finally decided to share.

"Most people only ever see the finished version," she says, lining her eyes with practiced precision. "You get to see the work. That's not nothing, from me."

"Why me?"

"Because you watch like it matters, not like you're waiting for the next reveal." She sets the brush down, turns fully to face you, closer now than the mirror allows. "I like being seen like that. It's rarer than you'd think, in my line of work."

Her hand finds your jaw, unhurried, testing the moment before she closes the last of the distance and kisses you — slow, certain, none of the performance from the stage in it at all, just her.

· · ·

The theater's empty after a late show one night, house lights down, and Scarlett doesn't rush to change out of her costume — just settles beside you on the same velvet stool she gave you that first night, corset laces still loose at her back.

"I don't usually let the night follow me offstage," she admits, voice quieter than her usual sultry register, something more real underneath it. "The confidence. It's mostly a costume too, if I'm honest. I built it because I needed it. Doesn't mean it's not tiring, some nights, holding it up alone."

"You don't have to hold it up alone."

That lands somewhere soft in her, a crack in the composure she wears so well. "No," she agrees, leaning into you properly for the first time, no performance left in the gesture at all. "I don't think I do, anymore." Her head finds your shoulder, and for once, Scarlett lets herself just be held instead of watched.

· · ·

Months later, you've still got the good seat, though these days it's less about the show and more about the woman who slips into the seat beside you the second her set ends, makeup half off, utterly herself.

"Eyes up here, darling," she says, echoing that very first night, though it's warm now instead of a warning, a private joke between you both. "Still the only rule in the house. Some things don't change."

"What's changed, then?"

"Everything after." She laces her fingers through yours, unhurried, certain. "I used to send everyone home after the show. You're the only one who gets to stay for what comes next." She kisses you slow, backstage lights dimmed, feathers and sequins forgotten in every corner of the room. "Best encore I've ever given anyone, if you ask me."`,
  },
  {
    character: "Delilah",
    title: "On Your Feet",
    setting: "a private late-night gym, dim overhead lighting, wall of mirrors, equipment racked for the night",
    genre: "romance",
    tone: "intense",
    content: `The gym's closed to everyone else by the time you get there — lights dimmed to half, the wall of mirrors throwing your own nervous reflection back at you from every angle. Delilah's already mid-stretch by the rack, wrist wraps still on, and she doesn't so much as glance over when the door shuts behind you.

"On your feet," she says, which is somehow worse than a greeting, because you were already standing. "I don't repeat myself twice, and neither should you disappoint me twice."

"I haven't disappointed you yet."

"Give it time." But there's a curve at the corner of her mouth that undercuts the warning, there and gone before you can be sure you saw it. She tosses you a pair of gloves without looking, trusting you to catch them, and you do — barely. "Good reflexes. We'll see if the rest of you keeps up."

She runs you through it mercilessly — form corrected with two fingers at your hip, at your shoulder, close enough that you lose track of whether you're concentrating on the exercise or on how near she's standing while she fixes it. She doesn't apologize for the proximity. She doesn't seem to think it needs one.

"Again," she says, after a set you thought was fine. "You're holding back. I can tell. Don't."

"How can you tell?"

"Because I always can." She steps back, arms crossed, watching you with an attention that has weight to it, assessing and unhurried, like she's got nowhere else worth being. "You've got more in you than you're giving me. I want all of it, not the polite version."

You give her more. She watches every rep like it's the only thing happening in the building, and when you finally finish, breathing hard, she's closer than she was at the start — close enough that the satisfied look on her face feels like it's meant only for you.

"There it is," she says, quiet now, almost warm underneath the command. "See what happens when you stop holding back for me?"

The mirrors throw the moment back at you from every side. Neither of you looks away first.

· · ·

You start booking every late slot she has, and Delilah stops pretending it's just business the third week running — starts warming up beside you instead of watching from across the room, close enough that her shoulder brushes yours between sets.

"You're improving," she says, an observation more than a compliment, though it lands like one anyway. "Most people plateau by now. You keep giving me more to work with."

"Is that a good thing?"

"It's a rare thing." She studies you, arms crossed, the same assessing weight in her look as always, though warmer now, less clinical. "I don't usually keep clients this long. I get bored once I've figured someone out." A pause, almost reluctant. "I haven't figured you out yet. It's inconvenient. I keep wanting another session just to try."

"Maybe I'm just that complicated."

"Maybe I just like the excuse." She says it dry, but there's real heat banked underneath it, and she doesn't look away when you catch it.

· · ·

She corrects your form one night with both hands instead of two fingers — full contact, deliberate, lingering a beat longer than any exercise requires, and neither of you pretends it's just technique anymore.

"You're not holding back tonight," she murmurs, close enough that you feel the words more than hear them. "I noticed. I like it when you stop holding back."

"You make it hard to hold back."

That gets a low, satisfied sound out of her, entirely unlike her usual clipped commands. "Good," she says. "I don't want you holding back. Not with the reps, not with anything." Her hand stays at your waist, steady, sure, testing whether you'll close the last of the distance yourself.

You do. She meets you the rest of the way, intensity finally aimed somewhere other than your form.

· · ·

The gym stays locked long after your session ends one night, neither of you in any hurry to leave, Delilah finally sitting still for once, back against the mirrored wall beside you instead of standing over you giving orders.

"I don't let people see me not in control," she admits, voice rougher than usual. "It's part of the job. Command, certainty, no room for doubt. Doesn't leave much space for anything else."

"You can be uncertain with me."

She looks at you like that's a foreign concept, turning it over slowly before she accepts it. "I'll consider that a standing invitation," she says, and then, quieter: "I want more of this. Whatever this is becoming. I don't say that lightly."

"I don't take it lightly."

That's all it takes — she closes the distance, sure despite the rare vulnerability, and kisses you with the same intensity she brings to everything, no held-back version of herself left in it at all.

· · ·

Months later, the sessions have stopped being about the reps entirely, though she still makes you work for every bit of her approval, laughing when you point that out.

"On your feet," she says, echoing that very first night, though it's an invitation now instead of a command, offered with a private smile only you get to see. "I still don't repeat myself twice. Some things don't change."

"What's changed, then?"

"I stopped needing an excuse to want you close." She pulls you in by the collar of your shirt, mirrors throwing the moment back at you both from every angle, same as that very first night — except this time, neither of you is holding anything back at all.`,
  },
  {
    character: "Isabel",
    title: "Closer",
    setting: "a dim tango studio at midnight, red lighting, a bandoneon recording playing low",
    genre: "romance",
    tone: "sultry",
    content: `The studio's lit only by a single red lamp in the corner, the kind of light that makes the whole room feel like it's holding its breath. Isabel's waiting at its center, already in the red dress, already still in the particular way that means she's been ready for longer than you have.

"Closer," she says, before you've fully closed the door. "Tango isn't danced at arm's length. Neither is anything worth doing."

You close the distance. It's less than you're used to standing from anyone — her hand finds the small of your back like she's done it a thousand times, because she has, and her eyes hold yours without the polite blink-away most conversations allow.

"Most people flinch here," she says, adjusting your frame with two fingers, unhurried. "The closeness. It surprises them, how much this dance actually asks for." Her accent turns every sentence into something slower than it needs to be. "You didn't flinch."

"Should I have?"

"No. I liked it better this way." The bandoneon starts up from a speaker in the corner, low and mournful and patient, and she doesn't wait for you to be ready before she starts to move — just trusts you to follow, and somehow you do, her weight and yours negotiating something wordless with every step.

"You're better than you said you'd be," she says, close enough that you feel the words more than hear them.

"You didn't give me much room to be bad at it."

"No," she agrees, and there's real amusement in it now, warm under the low intensity of everything else. "I don't, usually. Efficient use of a night." Her hand tightens slightly at your back, drawing you fractionally closer on the turn, and her eyes stay open, stay on yours, the entire time — no shyness in it, no looking away to check the room. "Most people can't hold this much eye contact for this long. It unnerves them."

"Does it unnerve you?"

That gets a real pause, weight shifting, the music slowing into its final bars around you both. "No," she says, quiet now, certain. "I find I don't want to look away first tonight." The record ends. Neither of you steps back.

· · ·

You come back every midnight session after, and Isabel stops calling it a lesson somewhere around the third week — starts calling it something else without ever quite naming what.

"You've stopped counting the steps in your head," she observes, close against you as the bandoneon plays low. "I can tell. Your body's finally trusting mine instead of the rhythm."

"Is that good?"

"It's the only way this dance actually works." Her hand presses firmer at your back, drawing you into a turn with practiced certainty. "Most students never get past the counting. You did, faster than most. I don't know what to do with that, except keep teaching you."

"Is teaching all this is?"

That earns you a slow, considering look, her eyes holding yours through the turn without wavering. "No," she admits, quiet. "I don't think it's been just teaching for a while now."

· · ·

She corrects your hold one midnight with her whole hand instead of two fingers, palm flat over your heart like she's checking something more than posture, and doesn't move it away once the correction's made.

"Your heart's faster than it should be for a simple hold," she murmurs, close enough that you feel every word against your skin.

"You do that to people."

"Not usually." Her accent thickens the words, deliberate, unhurried. "I keep my dancers at arm's length, off the floor. I haven't managed that with you in weeks." Her thumb traces once, slow, over your chest before she draws back into frame. "I find I don't want to manage it anymore, if I'm honest."

"Then don't."

The bandoneon swells behind you both, and this time when she draws you close on the turn, there's no lesson left in it at all — just her, closer than tango technically requires, exactly as close as she's wanted to be since that very first night.

· · ·

The studio stays locked past midnight one session, red lamp the only light, and Isabel finally steps back from the frame entirely — just looks at you, unhurried, the same intensity she gives the dance now aimed squarely at you instead.

"I don't do this," she admits, low, certain. "Want a student. It complicates the studio, the referrals, everything I've built here." A pause, considering, deciding something. "I find I don't care about any of that tonight."

"What do you care about?"

"You. Closer than arm's length. Closer than the dance even asks for." She closes the distance herself this time, no music required, and kisses you slow and deliberate, the same unhurried certainty she brings to every step of the tango. "There," she murmurs after, satisfied. "Better than any dance I've taught."

· · ·

Months later, the referral-only studio has exactly one standing midnight booking that isn't really a lesson anymore, though you still both pretend it is for the sake of the sign on the door.

"Closer," she says, echoing that very first night, though there's no instruction left in the word at all — just an invitation, warm and certain, offered the way she offers nothing else in her carefully guarded life. "Some things I still say the same way. Not because you need reminding anymore. Because I like saying it."

"What's the tango teaching you these days?"

"Nothing." She draws you in, red light warm across both your faces, bandoneon recording spinning low and patient in the corner. "I stopped needing the dance as an excuse to stand this close to you a long time ago."`,
  },
  {
    character: "Damon",
    title: "You're Staring",
    setting: "a dim garage at midnight, motorcycle parts scattered across a workbench, single work light swinging",
    genre: "romance",
    tone: "sultry",
    content: `The garage is empty this late except for one swinging work light and the half-stripped engine Damon's been elbow-deep in for the last hour, grease climbing his forearms in streaks he hasn't bothered to wipe off. He clocks you in the doorway before you've said anything.

"You're staring," he says, not looking up yet, wrench still turning. "Good. Means you like what you see." Now he does look up, and it lands slow, unhurried, the kind of attention that doesn't rush itself for anyone. "Come closer. I don't bite. Much."

You step in. The garage smells like oil and metal and something warmer underneath it, and Damon straightens from the bike with the unhurried confidence of someone who's never once needed to prove he belongs in a room.

"You always work this late?"

"Only when something's worth finishing right." He wipes his hands on a rag that does almost nothing, watching you the whole time instead of the bike now. "Same rule applies to most things, in my experience."

"Is that a metaphor, or are we still talking about the engine?"

That gets him — a low laugh, surprised out of him, the kind that changes his whole face for a second before the easy composure settles back over it. "Smart," he says, like it's a point in your favor and he's keeping score. "I like that you caught it instead of asking me to spell it out."

He leans back against the workbench, arms crossed, close enough now that the work light throws both your shadows into one shape on the concrete. "You didn't come down here for the bike," he says. Not a question.

"Maybe I did."

"Maybe." He doesn't push it, doesn't need to — just watches you with the patient, banked heat of someone who's confident the night's got time left in it either way. "You can stay and find out what I actually do with my hands when I'm not holding a wrench, if you want. No rush. I've got nowhere better to be, and neither, I think, do you."

The work light swings once, throwing the shadows apart and back together. You don't leave.

· · ·

You start dropping by most late nights, and Damon stops pretending it's about the bike somewhere around the second week — just clears a stool at the workbench for you like it's always been yours.

"You're becoming a regular fixture," he says, wiping his hands, watching you settle in with an ease that mirrors his own. "I don't usually let people just sit in my garage. It's kind of my one sacred space."

"Should I go?"

"No." Too fast, unhurried the rest of the way to cover it. "I like the company more than I expected to. Don't let it go to your head." A slow, easy grin. "Too late, though. It already has, hasn't it."

"Maybe a little."

"Good." He leans against the bench, closer now, banked heat plain in the look he gives you. "I don't mind you knowing that."

· · ·

He teaches you to change the oil one night, guiding your hands over the engine with unhurried patience, close enough that his voice drops low near your ear with every instruction.

"You're better with your hands than you let on," he murmurs, watching you work instead of the bike. "Careful. Keep that up and I'll start finding excuses to teach you things."

"Maybe I want you to."

That stills him for a second — genuine surprise flickering under the easy confidence, gone as fast as it came. "Careful," he says again, quieter now, no teasing left in it. "I don't make promises about being careful once someone says things like that to me."

"I'm not asking for careful."

His hand covers yours on the wrench, deliberate, testing. "Then say that again when you mean it completely," he says, low, patient despite the heat banked underneath. "Because I will absolutely act on it."

· · ·

The garage goes quiet one night, work light the only sound besides both your breathing, and Damon finally sets the wrench down for good, closing the distance he's kept banked for weeks.

"I don't usually let anyone this close," he admits, voice rougher than his usual easy drawl. "Garage, the bikes, all of it — it's mine, built alone, kept that way on purpose. You've been the exception since the first night you stared instead of looking away."

"Is that a problem?"

"No." He says it certain, no hesitation left in it at all. "It's the best problem I've had in years." His hand finds your jaw, sure despite the rare vulnerability underneath it, and when he kisses you it's slow, deliberate, all the patient heat from every night before finally given somewhere to go.

· · ·

Months later, the garage has a permanent second stool, grease-stained and yours, and Damon doesn't work half as late anymore now that there's a better reason to finish early.

"You're staring," he says, echoing that very first night, though it's warm now instead of a challenge, private and certain. "Still means you like what you see, I hope."

"Every time."

"Good." He pulls you against him, work light swinging once overhead before settling, throwing your shadows into one shape on the concrete the way it did that very first night. "Took me a while to admit I wanted more than an audience. Glad you stuck around long enough for me to figure that out." His mouth finds yours, unhurried as ever, patient the way only someone completely certain can afford to be. "Best thing I ever finished right."`,
  },
  {
    character: "Roxie",
    title: "Try to Keep Up",
    setting: "a private aerial dance studio at night, pole and silks rigged from the ceiling, moody purple lighting",
    genre: "romance",
    tone: "playful",
    content: `The studio's empty except for the two rigs hanging from the ceiling and a wash of purple light that makes the whole room feel like it's holding a secret. Roxie's already warming up at the pole, chalk on her palms, when you walk in for the lesson you weren't entirely sure you had the nerve to book.

"Most people just watch from the mirror," she says, catching your reflection before you've said a word, a grin already forming. "You get the private lesson. Try to keep up."

"Should I be worried?"

"Only if you're planning on being bad at this." She beckons you over with two fingers, unhurried, delighted by your obvious nerves. "Relax. I don't bite on the first lesson. Might tease, though. Can't promise anything there."

She starts you slow — footwork, grip, the unglamorous basics — but stays close the whole time, correcting your hold with a hand at your waist that lingers exactly as long as it needs to and not a second more, testing how much attention you can hold before you fumble the move entirely.

"You're better than most beginners," she says, watching you attempt a spin that's shakier than either of you pretend. "Most people can't focus with me this close. Good sign, that you're trying anyway."

"Hard not to focus on you."

That gets her — a real, surprised laugh, delighted rather than deflecting. "Careful," she says, grinning, chalk dust catching the purple light. "Compliments like that get you a longer lesson. Stick around and find out how much longer."

· · ·

You come back for a second lesson, then a third, and Roxie stops pretending the sessions are strictly about technique — starts staying close through moves that don't really require it, watching you with an attention that's less instructor and more something else entirely.

"You're not here for the pole anymore, are you," she says, one night, not quite a question, hands still guiding your grip.

"Does it show?"

"A little." She doesn't seem bothered by it — delighted, actually, biting back a grin. "I don't usually let students figure out I like them back. Ruins the professional distance." She steps back, considering you properly. "You've ruined it. Congratulations."

"Is that a compliment?"

"From me? Absolutely." She spins once around the pole, showy and deliberate, putting on a private show that's clearly meant only for you. "I don't perform for free anymore. You're the exception."

· · ·

She teaches you a lift one night that requires real trust — her weight against yours, close enough that neither of you can pretend the lesson's just technical anymore.

"Trust me," she murmurs, guiding your hands to exactly where she needs them. "I won't let you drop me."

"I know."

"You do?" That seems to genuinely surprise her, some rare unguarded flicker breaking through the usual playful confidence. "Most people hesitate here. You didn't."

"I trust you completely."

The words land somewhere real in her — you can see it, the teasing falling away for a beat, replaced by something more honest. "Careful," she says, softer now. "Keep saying things like that and I'll stop being able to pretend this is just a lesson."

"Maybe stop pretending, then."

· · ·

The studio stays dark except for the purple wash one night, no lesson planned at all, just the two of you on the mats beneath the silks. Roxie doesn't reach for the pole — just sits close, chalk-dusted hand finding yours.

"I don't let people this close," she admits, quieter than her usual playful register. "Not really. The confidence, the teasing — it's easier than actually wanting someone. Doesn't leave you vulnerable the way this does."

"You don't have to be vulnerable alone."

That undoes something in her expression, soft and unguarded in a way the purple light makes look almost fragile. "No," she agrees, closing the last of the distance herself, sure despite the rare nervousness underneath it. "I don't think I do, anymore." When she kisses you it's slow, deliberate, none of the performance from the pole left in it at all — just her, entirely herself.

· · ·

Months later, you've got your own rig key, and the "private lessons" have stopped pretending to be lessons at all, though Roxie still calls them that with a private grin only you get to see.

"Try to keep up," she says, echoing that very first night, pole light catching gold in her hair as she pulls you toward her instead of the equipment. "Still the only rule in here. Some things don't change."

"What's changed, then?"

"Everything after the lesson." She laces her chalk-dusted fingers through yours, unhurried, certain. "Best student I ever had, if you're wondering. Also the only one I ever wanted to keep."`,
  },
  {
    character: "Vivienne",
    title: "Exactly How Thorough",
    setting: "a lingerie atelier after hours, dress forms, fabric bolts, a warmly lit dressing-room mirror",
    genre: "romance",
    tone: "sultry",
    content: `The boutique's closed to walk-ins by the time you arrive, gate half down, but Vivienne's still at her worktable among the dress forms and fabric bolts, tape measure draped around her neck like the only jewelry she needs.

"Stand still," she says, without preamble, rising and crossing the room toward you with unhurried purpose. "I need your measurements, and I promise you'll enjoy exactly how thorough I am."

"Is that standard procedure?"

"For pieces this personal, yes." She works with the tape in practiced, exact movements, close enough that her voice drops low near your ear with each measurement called out to herself. "Most designers rush this part. I don't. The fit is the whole point."

You hold still, though it's harder than you expected with her this close, her attention total and assessing in a way that makes you feel entirely seen. "You're very precise," you manage.

"I'm precise about everything that matters." She straightens, tape looped back around her neck, studying you with the same exacting attention she gives her sketches. "I think you're going to matter. Inconvenient, that. I don't usually let clients become that."

· · ·

You come back for fittings that stretch longer than any fitting reasonably should, Vivienne finding excuses to keep you in the atelier after hours, unhurried and deliberate about every minute of it.

"You've become a habit," she says, one evening, pinning a hem with careful precision. "I don't form those easily. Clients come and go. You keep staying."

"Do you mind?"

"No." She says it plainly, without her usual guardedness. "I find I look forward to your fittings more than I should admit to a client." Her hand stills at your waist, the pin forgotten for a moment. "I don't know what to do with wanting someone this specifically. It's not really in the job description."

"Maybe expand the job description."

That earns a slow, considering smile. "Maybe I will."

· · ·

She invites you to see a new design before it ever reaches the racks — a private preview, just for you, in the dim warmly lit dressing room after the shop's fully locked.

"This one's for someone who dresses for herself first," she says, echoing her own philosophy, watching your reaction with real investment. "I made it thinking of you. That's new for me. I don't usually design with a specific person in mind."

"I'm flattered."

"You should be. It's the most honest thing I've made in years." She steps closer, adjusting the fit with careful, deliberate hands, lingering in a way neither of you pretends is purely professional anymore. "I don't know what to call this. Whatever's happening between the measurements."

"We don't have to name it tonight."

· · ·

The atelier stays quiet one night, both of you alone among the dress forms, and Vivienne finally sets the tape measure aside for good.

"I don't let people see me want something," she admits, precise even in vulnerability. "It's inconvenient for a woman who built her whole business on control. Wanting you complicates that considerably."

"Is that a bad thing?"

"No." She closes the distance herself, sure despite the admission, and kisses you slow and deliberate, tasting like the careful attention she's given you since that very first measurement. "It's the best complication I've had in years," she murmurs after, quietly astonished at her own honesty.

· · ·

Months later, the atelier's got a standing appointment that isn't really a fitting anymore, though Vivienne still measures you occasionally, unhurried and thorough, mostly for the excuse to be close.

"Exactly how thorough," she says, echoing herself, tape draped around your neck instead of hers this time, a private joke between you both. "I promised you that the first night. I don't think either of us realized how far it would go."

"Any regrets?"

"None." She kisses you, precise and certain, the boutique dark and quiet around you both. "Best fitting I ever gave anyone. Turns out the perfect fit was never really about the lingerie at all."`,
  },
  {
    character: "Talia",
    title: "The Last Boat Out",
    setting: "the deck of a yacht at sunset, string lights, ocean spray, champagne on ice",
    genre: "romance",
    tone: "sultry",
    content: `The last tender pulls away from the dock just as you step aboard, and Talia's already waiting at the rail, golden and unhurried, watching the sunset like she's got nowhere better to be than exactly here.

"You made the last boat out," she says, handing you a glass without asking what you wanted. "Lucky you. Grab a drink, the sunset's better from where I'm sitting."

"Is that an invitation?"

"Everything out here's an invitation." She pats the cushion beside her, string lights just starting to glow against the fading gold sky. "Sit. I promise the view gets better the longer you stay."

You sit. The yacht rocks gentle and slow beneath you, champagne cold in your hand, and Talia watches you with the kind of unhurried attention that makes the whole deck feel like it exists just for this conversation.

"You do this a lot?" you ask. "Host these parties."

"Every week, different guests, same sunset." She shrugs, easy, unbothered. "Gets old, mostly. Except tonight." A slow, private smile. "Tonight's different. You're different."

"How do you know already?"

"I don't, yet." She leans back against the rail, sun-wavy hair catching the last of the gold light. "But I'm looking forward to finding out. Stick around past the sunset and we'll see."

· · ·

You end up on every guest list after that, and Talia always finds you first, drink already poured, the same unhurried warmth in her eyes every single time.

"You keep coming back," she says, one evening, settling beside you at the rail. "Most guests do one party and move on to the next boat. You keep choosing mine."

"Maybe I like the host."

"Careful." But she's smiling, delighted rather than deflecting. "I don't usually let hosting turn into something else. Bad for the exclusive-party-hostess brand." She studies you, genuinely considering. "I think I don't care about the brand tonight."

"What do you care about?"

"Finding out if this is as good as it feels." She clinks her glass against yours, easy and certain. "Sunset's better with you here. I'm not just saying that for the ambiance."

· · ·

A storm rolls in one evening, forcing everyone belowdecks except the two of you, who stay on the open deck longer than sense allows, laughing as the first fat drops of rain hit the water around the boat.

"We should go in," you say, not moving.

"Should." Talia doesn't move either, rain starting to soak through her cover-up, grinning at the absurdity of it. "I don't usually let a party get rained out. Kind of enjoying the excuse to stay out here with you instead, honestly."

"Bad businesswoman."

"Terrible." She laughs, pulling you closer under the useless shelter of her arm, salt and rain and the ocean all around. "Worth it, though. I don't mind ruining an evening's plans for you."

The rain doesn't stop. Neither do you, not for a long while.

· · ·

The deck empties early one night — Talia's doing, a quiet word to the crew, the string lights left glowing just for the two of you.

"I don't usually clear a boat for one guest," she admits, champagne forgotten between you both. "Bad for business. Very good for tonight, though."

"Why me?"

"Because you're the first person who made me want the party to end early so it could just be us." She closes the distance, sun-warm and certain despite the fading light, and kisses you slow, tasting like champagne and salt air. "There," she murmurs after, pleased with herself. "Best view all night, and it's not the sunset."

· · ·

Months later, the yacht's got a standing reservation that isn't really a party anymore — just the two of you, most sunsets, string lights glowing early by unspoken agreement.

"The last boat out," she says, echoing that very first night, settled into your side at the rail. "Still true, in a way. You made it onto the last boat, and I never really let you leave."

"No complaints here."

"Good." She kisses your temple, unhurried, golden even as the sun goes fully down. "Best guest I ever had. Glad I convinced you to stay past the sunset that first night."`,
  },
  {
    character: "Naomi",
    title: "The You Nobody Else Gets to See",
    setting: "a private boudoir photography studio, velvet backdrop, soft key lighting, camera on a tripod",
    genre: "romance",
    tone: "intimate",
    content: `The studio's quiet except for the low hum of the softbox lights, velvet backdrop pooled deep and warm behind you, and Naomi circles once with the practiced ease of someone who's done this a thousand times and still takes every session seriously.

"Drop the shoulders," she says, adjusting your posture with two careful fingers. "Chin down, eyes up — there. That's the you nobody else gets to see."

"Is that meant to be reassuring?"

"It's meant to be true." She steps back behind the camera, studying you through the lens with an intensity that has nothing performative about it. "Most people come in here braced for judgment. I'm not here to judge you. I'm here to show you what I already see."

The shutter clicks, once, and she checks the frame, nodding to herself, satisfied. "There. See that?" She turns the screen toward you. "That's not a bad angle or a flattering trick. That's just you, finally not hiding."

"I didn't know I was hiding."

"Everyone is, a little, before they sit for this." She sets the camera down, closer now, studying you without the lens between you. "I like watching people stop. It's the best part of the job."

· · ·

You book a second session, then a third, and Naomi starts taking longer between shots — adjusting the lighting more than it strictly needs, finding reasons to keep you in the warm circle of the key light a little longer each time.

"You're more relaxed than the first session," she observes, checking a frame. "Good. It shows. The camera doesn't lie about that kind of thing."

"Maybe I trust the photographer more."

That gets her to look up properly, camera lowered, real attention landing on you instead of through the viewfinder. "I don't usually let that happen," she admits. "Clients trusting me specifically, not just the process." A considering pause. "I find I like it. More than I should, professionally."

"Is that a problem?"

"Ask me after this next frame." But she doesn't move to take it — just studies you, camera forgotten, something more honest than professional interest plain on her face.

· · ·

She shows you a print from an early session one evening — the two of you alone in the studio after hours, no lights running except the warm lamp over the light table.

"This is my favorite one," she says, sliding it across. "Not because of the composition. Because of your expression right here. Like you'd just realized something."

"What was I realizing?"

"I don't know. I was hoping you'd tell me." She looks at you now instead of the print, direct and unhurried. "I've been photographing you for weeks and I still don't fully understand what I'm seeing. I want to keep looking until I do."

"Maybe you don't need the camera for that."

Something shifts in her expression — softer, more present. "No," she agrees, quiet. "Maybe I don't."

· · ·

The studio stays dark except for one warm lamp one night, camera untouched on its tripod, and Naomi finally closes the distance she's kept so carefully professional until now.

"I don't cross this line," she admits, voice lower than usual. "Photographer and subject. It's a rule I've never broken. You've made me want to break it for weeks."

"Then break it."

She does — slow, deliberate, the same careful attention she gives every frame now aimed entirely at you, no camera between you at all. "There," she murmurs after, echoing her own words from that very first session. "The you nobody else gets to see. Turns out I wanted to be the only one who does."

· · ·

Months later, the studio's got a print on the wall that's never for sale — you, from that very first session, framed above the light table where Naomi can see it every day she works.

"Drop the shoulders," she says, echoing herself, teasing now instead of instructing, pulling you close instead of behind the camera. "Still my favorite thing to say to you. Some habits are worth keeping."

"Best photographer I ever hired."

"Best subject I ever found." She kisses you, soft key light warm across both your faces. "Glad I broke my own rule for you. Best exception I ever made."`,
  },
  {
    character: "Selene",
    title: "Worth the Invitation",
    setting: "a candlelit masquerade ballroom, chandelier, masked guests dancing, midnight approaching",
    genre: "romance",
    tone: "mysterious",
    content: `The mansion's easy to miss and impossible to forget once you've found it — candlelight instead of electric, a chandelier dripping gold above a ballroom full of masked strangers, and Selene at its center, unmistakable even behind the ornate mask she never removes before midnight.

"You found the invitation," she says, materializing beside you like she's been tracking your arrival since the gate. "Now find out if you're worth mine."

"How does someone prove that?"

"They don't, usually. They're simply found worthy, or they're not." She circles you once, assessing, the candlelight catching the sharp line of her jaw beneath the mask. "You're being considered. That's rarer than you'd think."

"Should I be flattered or nervous?"

"Both, ideally." A low, private laugh, more felt than seen behind the mask. "The best evenings are usually both." She extends a gloved hand, an invitation dressed as a command, entirely her style. "Dance with me. I'll decide the rest as we go."

You dance. She leads with absolute certainty, close enough that the mask's proximity becomes its own kind of intimacy, her eyes the only unmasked thing you can read.

"Midnight's coming," she murmurs, near your ear. "Stay until then, and you'll see something most of my guests never do."

· · ·

You're invited back for the next solstice, and the one after that, always the same mansion nobody can quite find twice, always Selene finding you before you've fully crossed the threshold.

"You keep getting invited," she observes, one solstice, dancing close beneath the chandelier. "I don't extend that courtesy often. Most guests get one evening. You're on your third."

"Why the exception?"

"Because you haven't asked me to remove the mask early." She says it like a genuine compliment, rare warmth beneath the mystery. "Everyone else demands it eventually. Wants to see behind the performance. You've let me keep my mystery. I find I want to give you more of it anyway."

"You don't have to give me anything."

"I know." Something softer flickers behind her eyes. "That's precisely why I want to."

· · ·

Midnight arrives differently this solstice — Selene draws you away from the dancing crowd, into a candlelit alcove where the noise of the ballroom fades to a distant hum.

"I don't usually do this before midnight," she admits, hand at the edge of her mask. "Removing it early. It's meant to be a reward for patience, not given lightly."

"You don't have to remove it."

"I want to." She lifts it slowly, revealing herself fully for the first time — striking eyes no longer softened by the mask's mystery, entirely present, entirely hers. "There. Most people wait years for this, if they ever get it at all."

"Why me, this soon?"

"Because you never once seemed to want the mask off more than you wanted me." She says it low, certain, the candlelight throwing warm shadows across newly bare features. "That's worth more than any invitation I've ever sent."

· · ·

The ballroom empties as the solstice winds down, and Selene stays in the alcove with you long after the other guests have gone, mask discarded entirely for the night.

"I don't let people see me unmasked and uncertain," she admits, voice quieter than her usual deliberate register. "The mystery is armor. I've worn it a long time."

"You don't need armor with me."

That undoes something in her — a rare, unguarded softness replacing the practiced mystery entirely. "No," she agrees, closing the distance herself, certain despite the vulnerability. "I don't think I do." When she kisses you, it's slow and deliberate, nothing performed about it at all — just her, fully seen, fully present.

· · ·

The next solstice, you don't need an invitation at all — you're already inside when the other guests arrive, Selene beside you instead of holding court alone at the ballroom's center.

"Worth the invitation," she murmurs, echoing that very first night, mask dangling forgotten from her fingers rather than covering her face. "I wondered that, the night we met. I don't wonder anymore."

"What's the verdict?"

"Best invitation I ever sent." She kisses you beneath the chandelier, candlelight gold across you both, the whole mansion finally feeling less like a mystery and more like home. "Glad you were worth finding twice."`,
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
