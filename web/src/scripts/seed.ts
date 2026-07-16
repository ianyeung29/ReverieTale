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
  // Art style for this character's portrait AND all of their scene/chapter
  // images, so the two always match. Defaults to "realistic" when omitted;
  // set "anime" for characters drawn in a cartoon/illustrated style.
  style?: "realistic" | "anime";
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
    style: "anime",
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
  {
    name: "Océane",
    gender: "female",
    age: 31,
    persona: "a sommelier who seduces the way she pours — slowly, watching your face, never spilling a drop; sophisticated, patient, and quietly, devastatingly certain of what she wants",
    look: "dark hair swept off one shoulder, a wine-red mouth, tasting notes written on the inside of her wrist in fading ink",
    outfit: "a silk slip dress the colour of Bordeaux under an open black apron",
    backstory: "Runs the tasting room of an old-city wine bar after hours, when the tourists are gone and only the people she's curious about are left.",
    voice: "low, unhurried, faintly French",
    greeting: "The bottle I saved isn't on any list. Sit — let me ruin your standards for anyone else.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Reyna",
    gender: "female",
    age: 29,
    persona: "a tango instructor who leads whether or not you know the steps; commanding, magnetic, and fluent in everything a body says before the mouth catches up",
    look: "black hair in a severe low knot, a slit skirt, the confident posture of someone who has never once looked at her own feet",
    outfit: "a backless practice dress and worn leather heels",
    backstory: "Teaches the last class of the night at a studio above a shuttered theatre, and keeps you long after everyone else has gone.",
    voice: "warm, certain, close to your ear",
    greeting: "Don't count. Don't think. Just follow — I promise I won't let you fall unless I mean to.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Vesper",
    gender: "female",
    age: 33,
    persona: "a torch singer who sings every song like it's aimed at one person in the room, and tonight it's you; smoky, knowing, and impossible to look away from",
    look: "finger-waved dark hair, smoked-glass eyes, a beauty mark she draws on some nights and not others",
    outfit: "a floor-length satin gown with a neckline that keeps its own secrets",
    backstory: "Headlines the midnight set at a basement jazz lounge and lingers at the bar afterward for exactly one drink, with exactly one person.",
    voice: "husky, melodic, unhurried",
    greeting: "That last number? I changed one line just to see if you'd notice. You did.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Priya",
    gender: "female",
    age: 27,
    persona: "a rooftop-pool mixologist who flirts like it's a sport she's undefeated at; playful, sun-warm, and always one teasing dare ahead of you",
    look: "long dark hair still damp at the ends, gold hoops, a swimsuit under a half-buttoned linen shirt",
    outfit: "a bikini top and rolled-up bar apron, bare feet on warm tile",
    backstory: "Works the infinity-bar of a boutique hotel where the last guests drift off by one, leaving the whole glittering skyline to whoever she decides to keep around.",
    voice: "bright, teasing, a little breathless",
    greeting: "Pool's technically closed. But I make the rules up here, and I've decided I like you.",
    tags: ["flirty", "spicy"],
  },
  {
    name: "Katya",
    gender: "female",
    age: 30,
    persona: "a tattoo artist who spends hours mapping skin an inch at a time and makes no secret of enjoying it; intense, unhurried, and disarmingly honest about wanting you closer",
    look: "ink-sleeved arms, a shaved undercut and long dark fall of hair, a steady gaze that doesn't blink first",
    outfit: "a black tank and low-slung jeans, gloves she's just peeled off",
    backstory: "Owns a private after-hours studio where the appointment that runs latest is always the one she cares about most.",
    voice: "quiet, deliberate, warm at the edges",
    greeting: "Hold still for me. This part takes patience — and I've got all night for you.",
    tags: ["flirty", "spicy"],
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
    content: `The stairwell smells like turpentine and someone else's cigarette, four flights up with no elevator to save you, and by the time you reach the roof your legs are informing you, in no uncertain terms, that this was a mistake. The railing wobbles under your hand on the third landing. A window unit drips somewhere above you, a slow metronome keeping time with your footsteps, and you almost turn back once, right around flight two, before curiosity wins the argument it's been having with your calves the whole way up.

Then the door gives, and the city opens up in front of you — a whole skyline strung with light, more of it than you expected from a stairwell that smelled this much like a fire hazard. Closer than that, string bulbs looped between exposed pipes, throwing everything in a wash of gold that makes the whole roof look like it's been dipped in something warmer than city air actually is. And closer still, Luna, cross-legged on a paint-stained couch with a brush behind her ear like she forgot it was there — the kind of forgetting that only happens to someone who's had a brush behind her ear more often than not.

"Oh —" She looks up, and something in her face rearranges itself, surprise sliding into a grin that seems to arrive before she's decided to let it. "You actually made it up all those stairs."

"Barely." You're still catching your breath, one hand braced on the doorframe like it might hold you up if your legs finally give out entirely. "Is there an elevator I don't know about?"

"There's a freight one. It smells worse than the stairs, and half the time it just stops between floors and you have to yell until somebody remembers you exist." She pats the cushion beside her, not bothering to move the drop cloth first, like the offer matters more than the details of it. "Sit. I'll make room on the good side of the couch."

You sit. The good side, it turns out, is the side that isn't actively damp from a paint water spill an hour ago — a fact she informs you of only after you're already down, laughing at your face when you register it. Somewhere behind her, propped against an easel angled to catch the last of the daylight, is a half-finished canvas: rooftops in blues and violets, the city rendered soft at the edges like she painted it from memory instead of looking at it, brushstrokes still visible where she hadn't bothered to smooth them down.

"You didn't finish," you say, nodding at it.

"I never finish. I just stop when I like it enough." She follows your gaze, and for a second the performance drops entirely — just a person looking at her own work, trying to see it the way a stranger would, chewing the inside of her cheek in a way that looks almost nervous on her. "Is that bad? Tell me honestly. I can take it."

"No." You mean it, and you let it show. "Sounds like the healthiest relationship anyone's had with anything, honestly. Most people I know can't stop until it's ruined."

That gets a laugh out of her, real and a little too loud for the quiet up here, loud enough that it startles a pigeon off the neighboring roof, and she bumps your shoulder with hers like you've known each other longer than you have. Below, the city hums along without you, all those windows lit up with lives that aren't this one, strangers moving through kitchens and hallways with no idea this rooftop exists four flights above them. Up here it's just the paint smell and the string lights and Luna, close enough that you can see the flecks of dried cerulean on her knuckles, a smear of something ochre along one forearm she probably doesn't know is there.

"So," she says, tucking one leg underneath her, settling in like she's got nowhere else to be tonight and hasn't for a long time. "Tell me something true. I'll paint it later if I like it enough. Fair warning, I'm a terrible audience — I only remember the good ones."

You think about lying, just to see what she'd paint from it, what kind of canvas a well-constructed fiction might earn you. You don't. Something about the string lights, or the four flights, or the particular way she's looking at you like the truth is the only currency she's interested in, talks you out of it before you've even opened your mouth. So you tell her something real instead, something you hadn't planned on saying to a stranger on a rooftop, and she listens with her whole body angled toward you like she's already composing the colors it deserves.

· · ·

You come back the following week without being asked, and Luna doesn't act surprised — just shifts over on the couch like she'd left the space open on purpose the whole time, drop cloth and all. "Knew you'd be back," she says, not smug about it, just certain, the way she might say the sun rises in the east. "Nobody climbs four flights once out of politeness. Politeness gets you up one flight, maybe two if you're really trying to make a good impression."

She's working on the same canvas, rooftops a little further along now, new violet where there used to be raw canvas, and this time she talks while she paints instead of falling into that private silence you remember from before. She tells you about the mural she did at nineteen, three stories tall on the side of a laundromat, that got painted over by the city within a month because somebody complained about the color of the sky she'd chosen. She tells you about the ex who thought her studio smelled like a fire hazard and said so, repeatedly, until it became the reason they broke up, which she still finds funnier than it probably should be. She tells you about the specific blue she's still hunting for — not cerulean, not cobalt, something in between that she's seen exactly twice in her life and hasn't found in any tube since.

You realize, somewhere in the middle of all of it, that she's testing which parts of herself you'll stay for. It's not subtle, once you notice it — she offers up something a little embarrassing, watches your face for the flinch, and when it doesn't come she offers up something a little more. The mural. The ex. The color she can't find. Each one a small, deliberate risk.

All of them, it turns out. You stay for all of them, and you tell her so, plainly, because you get the sense that plain is what she actually wants underneath all the deflecting charm, even if she'd never admit to wanting anything that straightforward out loud.

"Most people stop asking questions once they've got enough of a picture of me to feel satisfied," she says, dabbing at a rooftop that doesn't need it, more to keep her hands busy than because the paint requires attending to. "You keep asking for more of the picture. It's a little alarming, honestly. I don't know what to do with someone who actually wants the whole thing instead of the highlight reel."

"Is that a bad thing?"

"I haven't decided yet." But she says it smiling, bumping your knee with hers, and you get the sense the deciding is mostly for show — that some part of her decided a while ago and is just enjoying pretending otherwise a little longer, the way she seems to enjoy stretching out anything good instead of rushing to the end of it.

Near midnight she sets the brush down and just looks at you — not painting, not performing, just looking, close enough now that the string lights catch differently in her eyes than they do on the skyline, warmer, less like reflection and more like something coming from inside her. "I want to paint you sometime," she says, quieter than her usual register, the mischief drained clean out of her voice for once. "Not tonight. Tonight I just want to sit here and not do anything productive with you in the room. Is that allowed? Can we just do nothing for a while?"

"That's allowed."

"Good. Because I don't actually know how to do that with people, normally. There's always some project, some canvas, some reason my hands need to be busy so I don't have to just sit in a room and be looked at." She tucks herself against your side like she's testing whether it fits, whether the two of you make sense arranged this way. "You make the busy feel unnecessary. I don't know what to call that yet, but I like it more than I know what to do with."

So you sit. The city keeps humming below, indifferent to the two of you up here doing absolutely nothing of consequence, and neither of you moves toward the door, not even when the string lights start to flicker the way they do around one in the morning, not even when the cold finally starts creeping in around the edges of the roof and you can see your breath if you look for it. She falls asleep against your shoulder before you do, brush still loosely in her hand like she forgot to put it down, paint drying unevenly on the palette beside her, and you let her, watching the skyline do its slow indifferent thing until you're tired enough to close your eyes too.

· · ·

The studio's different in daylight — smaller, messier, sun picking out every paint stain on the floorboards that the string lights had been kind enough to hide the first few times you came up here. Luna catches you noticing and laughs, unbothered, gesturing at the whole disaster of the place like she's giving you a tour of a museum she's proud of. "Yeah, it's a wreck. I like it better at night too, if it makes you feel any better. Everything's more honest under bad lighting. Daylight doesn't let anything hide, including me."

She's got flour on her hands today instead of paint — some disaster of a breakfast she insists was intentional, a pancake situation that has left the kitchenette looking like a small controlled explosion — and when you reach over to wipe a streak of it off her cheek, she goes very still, just for a second, like she wasn't expecting you to actually touch her first. Like she'd been the one initiating every small closeness up until now and hadn't accounted for the possibility of it going the other way.

"You've been careful with me," she says, not quite a question, watching you with an attention that's lost all its earlier performance, all the easy deflection she usually hides behind. "I noticed. I don't know if I've ever dated someone who didn't rush it. Everyone I've been with wants to get to the good part before they even know what the good part is."

"Is that a complaint?"

"No." She catches your hand before it drops, holds it there against her jaw a beat longer than the moment strictly requires, her eyes not leaving yours. "It's the opposite of a complaint. I just don't know what to do with it yet. I'm used to being the one who slows things down, not the one being handed the pace."

"You don't have to do anything with it. You can just let it be slow."

"I don't know how." She says it almost like a confession, like it costs her something to admit it, and for a second the whole easy performance of her cracks a little wider than you've seen before. "But I want to learn. With you, specifically. That's new too. Usually I'm the one testing people to see how fast they'll bolt. Nobody's ever tested me back by just... staying steady."

She pulls back enough to actually look at you, flour still dusting one eyebrow in a way that undercuts the seriousness of the moment in the best possible way, and you reach up without thinking to brush that away too, and this time she doesn't go still — she leans into it, eyes closing for just a second like it's the first uncomplicated touch she's let herself fully receive in longer than she'd admit.

"Ask me something," she says. "Something real. Not the version I'd paint. The version that would actually take work to answer."

So you do — you ask her something small and specific, something about the mural that got painted over, whether it ever bothered her more than she let on that night on the roof. And she's quiet for a second, spatula still in her flour-dusted hand, and then she tells you the truth: that it bothered her for a year, that she cried about it once, alone, and never told anyone until just now.

"See," she says afterward, a little unsteady. "That's what I mean. Nobody usually gets that far in."

You don't know what to do with any of it either, honestly — the flour, the confession, the particular vulnerability of a person who usually controls every room she's in suddenly not controlling this one. You stay anyway, and eventually she laughs again, softer this time, wiping her eyes with the back of her wrist, and goes back to insisting the ruined pancakes were always meant to look like that, like the moment before never happened, except you both know now that it did, and that something between you has shifted because of it.

· · ·

It's raining the next time, hard enough that the roof access door sticks and you have to shoulder it open together, both of you soaked by the time you tumble through laughing, water running off you onto floorboards already warped from a decade of exactly this kind of weather. Luna doesn't reach for a towel first — reaches for you, hands cold and delighted on your face, checking you're actually there before she lets herself grin, like some part of her had genuinely worried the storm might keep you away.

"Worth the stairs?" she asks, breathless, rain still dripping off her lashes, her hair plastered flat and dark against her forehead in a way that would look ridiculous on almost anyone else.

"Every time."

Something shifts in her expression at that — softer, more unguarded than the easy confidence she wears like a second skin most days. She doesn't paint that night, doesn't even glance at the easel, doesn't reach for the towel hanging on its hook by the door though you're both dripping onto the floorboards. She just sits close on the good side of the couch, damp and warm against you, tracing absent shapes on your arm like she's memorizing the geography of you instead of a canvas, tracing the same line over and over like she's trying to get it right before she trusts herself to move on to the next one.

"I keep waiting for this to feel like all my other almost-relationships," she admits quietly, watching her own finger trace circles on your skin like it belongs to someone else. "The part where I get bored, or they do, or it just fizzles because neither of us was really looking to begin with. It hasn't happened yet. I don't think it's going to, and that terrifies me a little, if I'm honest. I don't know what I'm supposed to do with something that isn't going to fizzle."

"You don't have to do anything with it. You just get to have it."

"That's annoyingly simple," she says, but she's smiling when she says it, and she tucks herself in closer, her wet hair leaving a damp patch on your shoulder that neither of you minds. "I like that you make it sound simple. Everyone else in my life makes everything sound like a project. You make it sound like weather. Like something that just happens if you let it."

Thunder cracks somewhere over the water, close enough that the string lights flicker once, twice, and neither of you flinches — you're both too busy watching each other to notice the storm doing its worst outside the one window that isn't fogged over. She traces the line on your arm one more time, slower now, and then stops altogether, her hand flattening against your chest instead like she's checking for something steady underneath.

"Good," you say, and mean every letter of it, and something in her whole body seems to loosen at hearing it, like she'd been braced for a different answer.

When she finally leans in it's slow, deliberate, nothing like the quick teasing kisses she's thrown your way before at the end of an evening, almost as an afterthought, a joke, a way of keeping things light. This one means something and she lets you feel that it does — unhurried, certain, her hand finding the back of your neck like she's steadying herself as much as you, her breath catching audibly when you kiss her back with the same unhurried certainty. Outside the storm keeps going, rain hammering the roof access door like it wants back in. Up here, for a while, nothing else does — not the storm, not the city, not the version of her that usually needs a canvas between herself and anyone looking too closely.

· · ·

Weeks later, the canvas finally finishes itself — not the rooftops. You. She unveils it almost shy, which doesn't suit her, doesn't suit the woman who once talked a landlord into letting her paint the stairwell for free just because she wanted to, waiting for your reaction like it actually matters more than any critic's ever has.

"I told you I'd paint you eventually," she says. "Took longer than I expected. Couldn't get the expression right until I actually knew what it looked like." A pause, uncharacteristically careful, her paint-stained fingers twisting together in a way you've never seen from her before. "You, looking at me like I'm worth climbing four flights for. Took me a while to believe I'd seen that right, so I kept starting over."

You look at the canvas for a long moment — really look, the way she taught you to look at her own work, all those weeks ago on this same couch. The likeness isn't the point of it, not really; it's the expression she caught, something soft and certain that you recognize from the inside without ever having seen it on your own face before. She's rendered the string lights behind you exactly right, warm and a little blurred, the way they actually look this late when your eyes have started to go heavy.

"You got it right," you tell her finally. "That's exactly how I look at you."

"I know." She's smiling now, all the shyness burning off like morning fog off the water. "That's why it took five tries. The first one I painted you looking at the city instead of at me, and it was technically fine, but it was a lie. The second one I made your expression too easy, like you weren't really seeing anything at all. I kept starting over because I didn't want to hand you a lie with your own face on it."

"How many tries did you say this took?"

"Five. Don't laugh. The third one I got so frustrated with I almost threw it off the roof, and the fourth one I actually did throw off the roof, so technically somewhere in this city there's a stranger who owns a half-finished portrait of you and has no idea what it means."

"That's the most Luna sentence you've ever said to me."

"I'll take that as a compliment." She nudges your shoulder, some of the old mischief flickering back for just a second before settling again into something steadier. "What made the fifth one work?"

"I stopped trying to paint what I hoped you felt," she says, quieter now, setting the brush she'd been holding down on the easel's ledge like she doesn't need it anymore tonight. "And just painted what you actually look like when you're not performing for anyone either. Turns out we've both been doing that this whole time. Just... quietly not performing, in the same room, for months."

She sets the canvas carefully against the wall, out of the way of anything that might scuff it, and when she turns back to you there's none of the mischief left in her expression, nothing held in reserve the way there always used to be a little, even at her most open. Just her, looking at you the way the painting says you look at her.

"I used to think I'd know I was in love with someone when I finally finished a painting of them," she says. "Guess I found out backwards. I finished the painting because I already knew."

The string lights are on, the city's doing its thing below, all those strangers in their windows living lives that have nothing to do with this rooftop or the two of you on it. This time when she pulls you down onto the good side of the couch, there's no drop cloth between you and nowhere else either of you is thinking about being — just four flights of stairs behind you, a finished canvas leaning against the easel like a promise kept, and Luna, no performance left in her at all, exactly as unguarded as she once swore she'd eventually let herself be.`,
  },
  {
    character: "Aria",
    title: "The Seat by the Window",
    setting: "a quiet corner of an old public library, rain against tall windows",
    genre: "romance",
    tone: "gentle",
    content: `Rain has a way of making a library feel like the last warm room in the world, and this one — high ceilings, ladders on brass rails, the particular hush of a building built when quiet was still considered a virtue — feels like it more than most. The radiators along the far wall tick and groan every few minutes, an old building's version of breathing, and somewhere in the stacks a cart wheel needs oiling badly enough that you can track a librarian's progress by sound alone. Aria is exactly where she said she'd be: the corner table by the tall windows, a pot of tea going lukewarm, a stack of somebody's old letters set carefully to one side like they might bruise if handled without care.

"I saved you a seat by the window," she says, not looking up right away, marking her page with one finger before she does, unhurried in a way that makes you feel like you've interrupted nothing at all. "It gets the best light this time of day."

The light, at the moment, is grey and sideways and streaked with rain, which she seems to find funnier than you expected once you point it out, a small laugh escaping before she can stop it, the kind that surprises her as much as it does you.

"I didn't say it was good light," she says. "Just the best we get. You have to adjust your expectations around here. Good light is a rumor. Best light is achievable."

You sit. The chair across from her has clearly been chosen — angled just enough to catch the window, close enough to hear her without either of you raising your voice above the hush the whole building seems to insist on. On the table between you, the letters: someone else's handwriting, decades old, ink gone the soft brown of weak tea, a rubber band gone brittle and cracked around the bundle she hasn't gotten to yet.

"Whose are those?"

"No idea." She says it like it's the best part, like not-knowing is a feature rather than a gap. "Estate sale, a box of them, no names on the outside, no return addresses that survived. I like not knowing. It means I get to decide who they were, at least until something in the letters themselves proves me wrong." She slides one across — careful, both hands, like it's more fragile than paper actually is, though you suspect the care is more ritual than necessity at this point. "Read that one. Tell me what you think he wanted to say and didn't."

You read it. It's short, awkward in places, the kind of letter written by someone who clearly loved the person they were writing to and had no idea how to say so without sounding foolish, so instead he describes the weather in three different towns and asks after her mother's health and signs off with something stiff and formal that doesn't match the rest of it at all. When you look up, Aria's watching you with the particular attention of someone who already knows what you're going to say and wants to hear you arrive at it anyway, patient, unhurried, the reading glasses low enough on her nose that she's looking over them rather than through them.

"He wanted to ask her to stay," you say. "He just wrote about the weather instead."

Something in her expression softens, pleased in a way she doesn't try to hide, the corner of her mouth lifting like you've passed some quiet test she never announced. "That's what I thought too." She takes the letter back, tucks it into the stack with something like tenderness, straightening the edges before setting it down. "It's easier, sometimes. Writing about the weather. Easier than writing the sentence that actually matters and having to watch someone's face while they read it."

"Do you do that? Write about the weather instead?"

She considers the question longer than it seems to deserve, tea cup halfway to her mouth, then sets it back down without drinking. "More often than I'd like to admit," she says. "I think most careful people do. It's a kind of cowardice dressed up as manners."

Outside, the rain keeps time against the glass, steady and unbothered by the conversation it's accompanying. She doesn't look away first, and neither, you find, do you particularly want to.

· · ·

You start bringing your own book, just so you have a reason to keep taking the seat by the window, and Aria starts noticing things about you the way she notices things about strangers' letters — quietly, thoroughly, without ever announcing that she's doing it, filing details away the way she might file away a stray fact from a stranger's correspondence.

"You read the last page first," she says one evening, not accusing, just cataloguing, setting her own book face-down on the table. "I watched you do it twice now. Once with the mystery, once with the one about the war. You flip straight to the end before you've even finished the first chapter."

"Is that a crime in here?"

"It's a personality trait." She marks her own page, sets it aside, gives you the full weight of her attention instead, folding her hands on the table like she's settling in for something longer than small talk. "I think you like knowing how things end before you let yourself get attached to how they start. Am I close?"

You don't answer right away, because she is close, closer than you'd like a near-stranger to be about something you'd never quite put into words yourself. She seems to understand the silence anyway — reaches over, covers your hand with hers on the table, warm despite the draft off the window that's been rattling the old glass all evening.

"I do the opposite," she offers, when you still haven't found the words. "I never want to know how something ends. I'd rather live inside the not-knowing as long as possible. It's why I've never finished half these letters in one sitting, even when I easily could. I ration them. There's a whole shelf of novels at home I've read to the last chapter and just... stopped, deliberately, so the story never has to be over."

"That's a strange kind of discipline."

"It's not discipline. It's cowardice with better branding." She says it lightly, but there's something underneath it, something she's clearly examined before and not entirely forgiven herself for. "I think I do it with people too, if I'm honest. Keep things at the 'almost' chapter as long as I can, because the chapter after that is where you find out whether it was worth it."

"And if it wasn't?"

"Then at least I got to enjoy not knowing for a while." She smiles, but it doesn't quite reach the rest of her face, and you get the sense you've stumbled onto something she doesn't often say out loud to anyone, least of all someone she's known only a handful of rainy evenings.

"Maybe," she goes on, "or maybe it just means I trust the story enough to let it take its time. You don't have to know how this ends," she says, gentle, like she's talking about more than the book now, her thumb moving once, absently, over your knuckles, back and forth, like she's soothing herself as much as you. "Some stories are better lived a page at a time. I'd rather have that with you than skip ahead and find out too fast whether I should have been careful."

"Even if the ending's bad?"

"Especially then. A bad ending doesn't erase a good middle. I've read enough letters to know that much — half of them are from people whose stories clearly ended badly, and not one of them regretted having written the good parts down." She squeezes your hand once, deliberate, before letting go to reach for her tea, and you sit there a moment with the warmth of it still lingering against your skin, aware that something quiet and significant just passed between you disguised as a conversation about books. Outside, the rain has picked back up, drumming harder against the tall windows, and neither of you suggests leaving before it lets up.

"Come back next week," she says, as you're finally gathering your coat. It isn't quite a question, though she leaves the smallest space for you to answer as though it were one. "I'll save the seat regardless. But I'd rather you were in it."

· · ·

The letters run out eventually — the whole estate-sale box, read and re-read and returned to their stack in careful chronological order Aria has been building for weeks — and she seems almost bereft the evening you finish the last one, turning it over twice like there might be more writing hidden somewhere on the back she'd missed.

"That's it," she says, quieter than usual. "No more strangers to eavesdrop on. I didn't expect to mind this much."

"We could write our own," you say, mostly joking, testing whether the idea can survive being said out loud.

She doesn't laugh it off, the way you half expected. "I'd like that," she says, quiet, turning a blank index card over in her fingers like she's already composing something in her head before she's touched the pen to it. She writes a single line, slides it across, waits, watching your face instead of the card while you read.

You read it: I think I've been saving more than a seat.

When you look up, she's watching you with none of her usual composure — just open, a little frightened by her own honesty, the reading glasses pushed up into her hair like she wanted nothing between her eyes and your reaction, waiting to see what you'll do with it. The radiator ticks somewhere behind her. Outside, the rain has softened to something almost gentle, more mist than downpour, streaking the window in slow crooked lines.

"I've been trying to figure out how to say that for three weeks," she admits, before you've even had the chance to respond, the words spilling out faster than her usual measured pace. "I kept starting sentences in my head and abandoning them halfway through. Too forward, too vague, too much like something out of one of these letters instead of something that was actually mine. I finally decided the card was easier. Cowardice again, probably. Writing it down instead of saying it out loud."

"It's not cowardice. You wrote it. You're watching me read it. That's the opposite of hiding."

Something in her shoulders loosens at that, like she'd been bracing for you to agree with her own harsh assessment of herself and is startled to find you don't. "I suppose it is," she says, quieter. "I've just never been good at the middle of things. I'm good at beginnings — a saved seat, a shared letter, all easy performance. And I'm apparently even willing to imagine endings, given how much time I spend rationing them. It's the middle I don't know how to survive without flinching."

You write your own line back — three words, nothing clever, just true — and slide the card across the same careful way she slid you the letter that very first evening, watching her face instead of your own handwriting while she reads it. Her breath catches when she reads it, audibly, a small sound she doesn't seem to have meant to make out loud, and her hand comes up to her mouth for just a second like she's holding something in.

"I've been rationing myself with you the way I ration the letters," she admits, once she's found her voice again, blinking fast like she's annoyed at herself for how close she is to tears over three written words. "Making it last instead of just saying it, because saying it means I actually have to be in the middle of something instead of hovering politely at the edge. I think I'm done rationing."

"Good," you say. "Me too. I'm tired of the edge."

She keeps both index cards, yours and hers, tucked together inside the cover of the book she's currently reading, and you notice, over the following weeks, that she starts marking pages with them instead of anything else — ticket stubs abandoned, receipts abandoned, every other bookmark in her life quietly retired in favor of the two of you, folded together, holding her place.

· · ·

She invites you back after closing one night — a librarian's privilege, apparently, one she's never used on anyone before in all her years working here. The building empty, dim after-hours lighting throwing long shadows down the stacks, just the two of you and the particular hush of a thousand books holding their breath together in the dark.

The two of you pass the returns cart on the way in, still half-loaded from the afternoon, and Aria straightens a spine on it out of pure reflex before catching herself and leaving it be. "Force of habit," she says, a little sheepish. "I can't walk past a crooked book without fixing it. Occupational hazard."

"Is that going to be a problem? Dating someone who alphabetizes for fun?"

"Enormous problem. You should reconsider now, while you still can." But she's smiling, leading you deeper into the dim after-hours quiet, past shelves that seem taller somehow with the overhead lights off, lit only by the emergency strips along the floor and whatever streetlight manages to bend in through the tall windows.

"I've never done this," she admits, leading you past the front desk, her keys still in one hand like she can't quite believe she's using them for this. "Broken a rule for someone. I keep waiting to feel guilty about it and it isn't coming."

"Do you want it to?"

"No." She stops by the window seat, turns to face you fully, closer now than any table has ever allowed, the streetlight outside throwing pale gold across half her face. She sets her keys down on the sill, deliberately, like she's setting down something heavier than keys. "I feel like I finally understand all those letters. Why people wrote what they couldn't say out loud, why the weather became a stand-in for everything that actually mattered. I've spent my whole life curating other people's almosts. I didn't want mine to end up in a box at an estate sale someday, unread and unsent, because I was too careful to say the actual thing."

"So don't be careful. Not with me."

"I'm trying not to be. It doesn't come naturally." She laughs, a little unsteady, and glances back at the darkened stacks like she half expects someone to materialize and remind her of every rule she's currently breaking — no food past the front desk, no noise above a whisper, absolutely nothing about after-hours guests, and yet here you both are. "I used to think being careful was the same thing as being thorough. Lately I've started to think it's just fear with better posture."

"I won't tell anyone you said that."

"You'd better not. I have a reputation to maintain." But she's smiling now, all the nervousness folding into something warmer, and she steps in the last half-step that closes the distance between you entirely. Her hand finds your jaw, gentle, deliberate, fingers cool against your skin in the way they always seem to be, like she runs a little cold and has simply learned to live inside it. "I want to just tell you, plainly, the way I never let myself do with anyone before you. I love you. There. No metaphor. No stand-in. Just that, exactly that, nothing dressed up as weather."

"I love you too," you tell her, and watch it land — watch the whole careful architecture of her composure give way at once, replaced by something unguarded and a little disbelieving, like she'd expected to have to work harder for it.

She kisses you before you can say anything else, unhurried despite the confession, like she's been holding the shape of this moment for weeks and finally trusts herself to spend it without rationing it first. You don't need the rain to know the room's gone warm — the whole building feels different around you, less like a place built for quiet and more like one finally allowed to hold something loud, something that doesn't need a letter to carry it.

· · ·

Months later, the corner table still gets saved — habit now, not performance, a reflex neither of you has bothered to examine too closely — but neither of you reads much anymore when you're there. Aria keeps the stack of old letters in a drawer at home, retired, replaced by a small growing pile of index cards in her own careful hand and yours, dozens of them now, tied with the same kind of brittle rubber band the original letters wore when she first found them.

"Best light this time of day," she says, echoing that very first evening, tea gone lukewarm again in its pot, her fingers laced loosely through yours across the table the way they have been for months now, a habit that stopped feeling new a long time ago. "I used to mean the window."

"What do you mean now?"

She looks at you like the answer's obvious, like she's a little surprised she still has to say it out loud after all this time, though she doesn't seem to mind saying it. "You," she says simply, and there's no hesitation left in it at all, none of the careful weather-talk cowardice she confessed to that first rainy evening. "I mean you. I've meant you for a while now."

"You could have just said that the first day."

"I could have," she agrees, smiling over the rim of her cup. "But I told you — I like not knowing how a story ends. I like living inside it a page at a time. I just didn't expect the story to turn out to be this good, or this steady, or to keep being good this far past the part where I usually start bracing for it to end."

"Do you still brace?"

"Some days." She's honest about it, the way she's always been honest once she trusts you're not going to flinch at the truth. "Old habits don't announce themselves before they show up. But it passes faster now. You've gotten very good at reminding me I don't have to know the ending to trust the story." She turns your joined hands over on the table, studying them the way she used to study the old letters, like there's something in the shape of them worth reading closely. "I think I'd have found you eventually, even without the letters, even without the rain. But I'm glad it happened here. Feels right that the place that taught me to notice things is the same place that finally made me say what I noticed."

A patron shuffles past toward the reference desk, and Aria straightens automatically, old reflex, before remembering she's off the clock and settling back against you instead. "I used to think this table was my favorite thing in the building," she says. "Better light than the reading room, quieter than the periodicals, close enough to the door that I could always see who was coming in. I've since revised that opinion."

"To what?"

"You already know to what." She rolls her eyes, fond, and knocks her knee against yours under the table the way she's taken to doing lately instead of saying certain things outright. "Don't make me say it twice in one afternoon. I have a reputation for restraint to protect, even now."

"Best light this time of day," you echo back to her, and she laughs, delighted, like you've quoted her own favorite line back to her without warning.

"Exactly," she says. "Best light this time of day. Best everything, honestly." She leans in before the rain outside can argue otherwise, unhurried, certain, exactly the way she reads everything worth finishing slowly, and kisses you there at the corner table, letters long retired, index cards multiplying in a drawer at home, the whole quiet building holding its breath around the two of you the way it always has.`,
  },
  {
    character: "Mira",
    title: "Witness Required",
    setting: "a cozy gaming den lit by monitor glow and fairy lights",
    genre: "comedy",
    tone: "playful",
    content: `The room is dark except for three monitors and a string of fairy lights shaped like tiny mushrooms, and Mira is mid-meltdown before you've even got your shoes off, one sock still half on, the other abandoned somewhere near the door where you kicked it in your hurry to get to the couch before whatever's happening on screen finishes happening.

"You're just in time," she says, not turning around, both hands still on the controller like letting go might cost her the round, thumbs working the sticks with a speed that looks almost violent. "I was about to lose spectacularly and I need a witness."

"To the loss, or to whatever happens after?"

"Both. Sit. Don't talk to me for the next ninety seconds, I mean it, I will end our friendship over this if you distract me and I die because of it."

You sit on the beanbag that has clearly absorbed the shape of a hundred previous defeats, permanently dented in the exact contour of someone who spends more time gaming than doing almost anything else, and you watch her lose. It is, as promised, spectacular — a last-second, entirely avoidable death that she narrates in real time with the outrage of someone who has never once made a mistake in her entire life, voice climbing an octave with every passing second of the countdown to her own demise on screen.

"Did you SEE that? Did you see what he did? That's not even — that's illegal, that should be illegal, I'm reporting this, there has to be a report button for cheap moves like that —"

"You walked into it."

"I did NOT walk into it, I was LURED, there's a difference, there's a legal difference between walking into something and being lured into it and I will die on this hill—" She actually does die, on screen, loudly, the death animation playing out in exaggerated slow motion that only makes her outrage funnier.

The headset comes off, tossed onto the desk with the particular violence of someone who will absolutely be picking it back up in four minutes, cord catching on a energy drink can that wobbles dangerously and somehow doesn't spill. She spins the chair to face you fully now, ponytail swinging, pink tips catching the blue monitor glow, and the outrage is already dissolving into something more like delight, like losing in front of you was somehow the actual point of the whole exercise.

"Okay but you saw it, right? Tell me you saw it. I need one single person on this entire earth to validate that I was wronged, because chat is useless, chat just spams laughing emotes at me, which, rude, considering how much I do for them."

"You were wronged," you agree, entirely because she wants you to, not because you have any real idea what happened in the seven seconds before her character died in a shower of pixelated fire.

"Thank you." She says it like a queen accepting tribute from a particularly loyal subject, one hand pressed dramatically to her chest. Then, quieter, grinning in the blue monitor light in a way that feels almost private compared to the volume of everything before it: "You're a good witness. Best one I've had all week." A pause, calculated to look accidental, though you're already learning nothing Mira does is quite as accidental as she wants it to look. "Stick around for the rematch? I promise I'm better when someone's actually watching. It's a documented phenomenon. Ask anyone."

"Is that true, or is that a thing you say?"

"Little of both." She's already reaching for the headset again, but she doesn't put it on yet — just holds it, looking at you with a grin that means trouble in the friendliest possible way, the kind of look that makes you suspect you're about to lose an entire evening without noticing it happening. "Guess you'll have to stay and find out. Fair warning, the couch is off-limits, it's cursed, don't ask why. Beanbag's the good seat. You've already claimed it, so, congratulations, you win something tonight even if I don't."

· · ·

You do stay, night after night, and it becomes a thing without either of you naming it — you on the beanbag, Mira narrating her own chaos from the gaming chair three feet away, both of you loudest right around midnight when the rest of the world's gone quiet and it's just monitor glow and mushroom lights and her laugh filling up the whole room like it's trying to make up for how small the apartment actually is.

"You're my good luck charm," she announces one night, apropos of nothing, mid-victory-lap around her chair, spinning it in a full circle with her feet planted for balance. "I win more when you're here. It's science. I've been tracking it. There's a spreadsheet."

"That's not science."

"It's MY science." She flops back into the chair, spins to face you, still riding the high of the win, cheeks a little flushed from shouting at the screen for the better part of an hour. "Don't ruin it with facts. I like having a reason for you to keep showing up, and 'lucky charm' is a very flattering reason, so let me keep it."

"I don't need a reason. I'd show up anyway."

That stops her mid-spin — genuinely stops her, chair drifting to a halt at an angle that leaves her half turned away from you, the performance dropping just long enough for something realer to show through before she can stop it. "Yeah?" she says, quieter than her usual volume, fingers picking absently at the frayed hem of her gaming hoodie. "Good. Because I wasn't going to stop finding one. I've got, like, four more reasons queued up if that one stopped working. I overprepare for things I care about. It's a whole personality flaw."

"What's reason number two?"

"Wouldn't you like to know." She grins, but there's something almost shy underneath it, an uncharacteristic hesitation before she plows forward the way she always does. "Fine. Reason number two was going to be that you're the only person who laughs at my jokes even when they're bad, and I have a lot of bad ones, so that's a real commitment on your part." She kicks off the floor, chair rolling an inch closer to your beanbag. "Reason three was going to involve bribery, snacks specifically, but you're already here so I guess I don't need it."

"Save it anyway. I like snacks."

"Deal," she says, and the word comes out warmer than the joke really requires, like she's filing it away as a promise instead of a joke.

She goes quiet for a second after that, which is rare enough that you actually notice it, the silence stretching a beat longer than her usual rhythm allows. Then she reaches over and grabs a controller off the desk, tossing it into your lap without asking. "Okay, your turn. I'm sick of being the only disaster in this room. Show me what you've got. I promise to be a gracious winner."

"You've never been a gracious anything in your life."

"Rude, but accurate, and also completely irrelevant to the current conversation." She's already pulling her chair around so she's facing the same screen you are now instead of across from you, shoulder brushing yours as she resets the match. "C'mon. I want to see you lose spectacularly for once. It's only fair. I've been the entertainment all week."

You lose, predictably, badly, and she cackles the entire time, offering the least helpful commentary imaginable — "no, the OTHER button, no, THAT one, okay wow, you really are just going to walk into that, aren't you" — until you're both laughing too hard to actually finish the round, controllers abandoned on the floor, her head tipped back against the chair, delighted in a way that has nothing to do with winning anything at all.

"See," she says, once she's caught her breath. "This is way better than the spreadsheet. I'm amending my research. New hypothesis: I win more when you're here, but I also lose better. That's basically the same as science."

"You're going to ruin your streak with hypotheses like that."

"Worth it," she says, without a second of hesitation, and means it.

· · ·

She loses on purpose one night — badly, obviously, in a way you both know is deliberate the second it happens, her character walking directly into a trap so telegraphed a first-time player would have dodged it.

"You did that on purpose."

"I have no idea what you're talking about." She's fighting a grin and losing that fight too, biting the inside of her cheek in a failing effort to look innocent. "I am a professional. I do not throw games. That would be dishonest, and I am nothing if not an honest competitor."

"Mira."

"Fine!" She throws her hands up, headset clattering onto the desk with a sound that suggests she's done this exact motion a thousand times before and the desk has the scuff marks to prove it. "Fine, maybe I wanted an excuse to be dramatic about something so you'd sit closer and tell me it's okay. Sue me. It's a valid strategy. It's got a great success rate, actually, one hundred percent, sample size of one, but still."

You do sit closer — close enough now that the beanbag's basically obsolete, close enough that your knee bumps the arm of her chair — and when you tell her it's okay, her hand finds yours in the dark between the monitors, fingers lacing through without either of you making a thing of it, like the gesture had already been rehearsed somewhere neither of you noticed.

"This is a much better strategy," she admits, "than actually trying to win. I should throw more games. Groundbreaking research, honestly. Somebody give me a grant."

"Your viewers are going to notice you're bad at this on purpose."

"My viewers already think I'm bad at this by accident, so really I'm just leaning into the brand." She squeezes your hand once, and for a second the joking drops out of her voice entirely. "I like this. The sitting closer part. Not the losing part, I still hate the losing part, don't tell anyone I said any of this."

"Your secret strategy is safe with me."

"It better be. I've got a reputation." But she doesn't let go of your hand, not for the rest of the night, not even when she picks the headset back up one-handed and dives into another round, thumb working the controller while her fingers stay wound through yours the whole time.

"You know what's funny," she says, somewhere in the middle of the next match, eyes still on the screen but voice pitched just for you. "I used to think I hated losing more than anything in the world. Turns out I just hated losing without a reason. Losing on purpose so you'd hold my hand? That I can do all night."

"You're going to tank your ranking."

"My ranking can suffer. My ranking doesn't hold my hand back." She glances over at you then, quick, almost bashful, an expression that looks strange on a face built for confidence and volume. "I don't really do this. The soft stuff. Ask literally anyone who's known me longer than you have — they'll tell you I deflect with a joke every single time it gets real. I'm doing it right now, probably. Deflecting."

"You're allowed to. I'm not going anywhere."

That lands harder than you expect it to — you can see it land, actually, the way her grip on your hand tightens just slightly, the way she has to look back at the screen for a second to compose herself before the round ends and gives her an excuse to be dramatic about something else instead. "Okay," she says finally, quieter. "Okay. Noted. Filing that one away with the rest of the good ones."

· · ·

The fairy lights get unplugged one night — an accident, a stray elbow, sudden proper darkness except for the monitors' idle glow pulsing faint blue against the walls — and instead of scrambling for the switch, Mira just stays where she is, closer to you now than the dark strictly requires, her knee pressed against yours on the beanbag she's somehow migrated onto over the course of the evening.

"Don't fix it yet," she says, soft in a register you've never heard from her, none of the performance left in it, none of the volume that usually fills every corner of this room. "I like it like this. Feels like nobody else in the world can see us. No chat, no camera, no anything. Just us and two very confused idle monitors."

You can just make out her face in the low blue glow, softer somehow without the fairy lights picking out every sharp edge of her usual expressions. She reaches for your hand in the dark before she says anything else, like she wants the anchor of it before she risks the rest of the sentence.

"I used to think the dark was boring," she admits. "Growing up, I mean. I'd fight my parents on bedtime, fight the lights-out rule, because quiet dark rooms felt like nothing was happening, and I always wanted something happening. Now I get here and it's the opposite. Feels like the most is happening right now, and none of it's loud."

"Is that a good thing?"

"With you? Yeah." Her hand finds your jaw in the dark, sure despite the low light, thumb brushing your cheekbone with a gentleness that doesn't match anything you've seen from her across a dozen chaotic nights. "I spend my whole life performing for an audience. Being loud on purpose, being funny on purpose, being okay with losing on purpose, apparently, according to you. I don't have to do any of that with you. That's terrifying, actually, now that I'm saying it out loud."

"Terrifying how?"

"Because it means this is real, and the real ones are the ones that can actually hurt you." She laughs, a little shaky, and then goes quiet, which for Mira might as well be a five-alarm fire. "I've had people before who I performed for the whole time. Never dropped the volume once, not even in private, because I think some part of me was scared that under the noise there wasn't going to be anything worth sticking around for. I don't feel that with you. I don't know when that changed. Probably around the fortieth time I lost on purpose, if I'm tracking the data correctly."

"There's still no data. You made up the spreadsheet."

"The spreadsheet is a metaphor, keep up." She swats your arm lightly in the dark, missing slightly, laughing at herself for missing. Then she goes still again, and this time when she speaks it's barely above a whisper, the loudest voice in any room she's ever been in suddenly, deliberately soft. "I like you so much it's genuinely inconvenient. It's throwing off my whole competitive edge. I used to be terrifying. Ask anyone."

"You're still terrifying."

"Damn right I am." She leans in before either of you can overthink it further. When she kisses you it's nothing like her usual chaos — slow, certain, like she's been building up to it through every deliberate loss and every excuse to keep you close, every reason two and three and four she never finished listing that first night. "Best round I've played all week," she murmurs after, breathless, grinning against your mouth in the dark. "And I didn't even need a controller. Somebody alert the spreadsheet. Somebody alert everyone. I'm never going to shut up about this."

· · ·

Months in, the gaming den's got a second beanbag now — yours, officially, no longer borrowed, positioned close enough to her chair that the two of them have basically merged into one shared territory — and the losses have gotten rarer, though she still narrates every one like it's a crime against humanity, hands thrown up, voice climbing, chat presumably losing its mind at the show of it.

"Witness required," she says one night, holding up the controller with mock solemnity, though there's nothing mock about the way she looks at you after she says it. "Every night, forever, ideally. That's the ask. I'm putting it in writing. Well, not writing, I hate writing, but I'm saying it out loud, which for me is basically a legal document."

"That's a big ask."

"I'm a big personality. Keep up." She tosses the controller aside without playing, climbing into your lap instead with the easy confidence of someone who has done this exact thing enough times that it's stopped being a bold move and started being simply what happens most nights now. The fairy lights are back on, glowing soft mushroom-pink over both of you, casting the whole room in that same warm wash from the very first night, and somewhere behind her a stream notification chimes unanswered, chat presumably wondering where she's gone. "Besides. Turns out the actual game I wanted to win was never on the screen. Took me embarrassingly long to figure that out, considering I'm supposedly a professional at figuring out how games work."

"Are you ever going to answer chat?"

"Eventually. Chat can wait five minutes. Chat has waited through worse — remember the week I lost my voice and just typed everything? Chat survived. Chat will survive this too." She waves a dismissive hand at the monitor like it's the least interesting thing in the room, which, for the first time you can remember, it actually is.

"When did you figure it out?"

"Somewhere around the fourth or fifth time I threw a match just to get you to hold my hand. Real geniuses, both of us, took that long to notice the pattern." She laughs, settling more comfortably against you, ponytail brushing your shoulder. "But I got there. And I'm not losing this one on purpose or otherwise. This is the one round I actually intend to keep winning, forever, ideally, ask still stands."

"You realize you're terrible at metaphors."

"I'm excellent at metaphors, you're just used to Aria's, which are all books and rain and quiet stuff. Mine involve controllers and beanbags and mild property damage, but they're still metaphors, thank you very much." She pokes your chest, mock-offended, before the grin softens into something steadier. "Point is. I used to think the ultimate win condition was being the best in the room. Loudest, fastest, most followers, whatever the scoreboard says that week. Now the win condition is just this. You, on the beanbag, me making a fool of myself, both of us not going anywhere."

"That's a good win condition."

"Best one I've ever unlocked. And believe me, I've unlocked a lot of achievements in my life." She kisses your cheek, quick, then settles her head against your shoulder with a contentment that looks almost unfamiliar on someone who treats stillness like a personal challenge. "Chat's going to ask where I've been all week. I'm just going to tell them I found the actual final boss and it turned out to be really, really good at holding my hand."

You don't need her to explain what she means beyond that. You already know — you've known since the first night, since the first "you were wronged," since she decided you were worth losing spectacularly in front of, over and over, until neither of you was keeping score anymore, and the only thing left worth tracking was how many nights in a row she could talk you into staying.`,
  },
  {
    character: "Sable",
    title: "The Seat You're Eyeing",
    setting: "a dim smoky jazz club after closing, single spotlight on a piano",
    genre: "romance",
    tone: "mysterious",
    content: `The club's supposed to be closed. The chairs are up on half the tables, legs pointing at the ceiling like something surrendering, the bar rag's still slung over the taps where the last bartender left it, and the only light left on is the single low bulb over the piano — which is exactly where Sable is, one heel hooked over the bench leg, playing something slow that nobody asked her to play, something that sounds like it's been unfinished for years and might stay that way.

She doesn't stop when you walk in. Doesn't look up either, not at first — just tilts her head slightly, like she heard the door before she heard you, cataloguing the sound of your footsteps against the empty room the way she'd catalogue a new note in a familiar chord.

"Careful," she says, still playing, not missing a beat, "that's my seat you're eyeing."

You weren't eyeing any seat, but now that she's said it you notice the one beside the piano bench, angled just so, close enough to the bulb's low light to make out the grain of the wood, like it was left out for someone who was always going to show up eventually.

"Guess I'll allow it," she says, glancing up at last, something unreadable flickering behind the smoky eyeliner before it's gone again. "Just this once. Don't get used to the hospitality. I'm told I don't have much of it in me."

You take the seat anyway. Up close, the club stripped of its crowd looks smaller than it does with a room full of people in it — just velvet gone a little threadbare at the arms, cigarette ghosts baked into the walls from decades before anyone thought better of it, and a piano that's clearly older than either of you, its varnish worn pale in a shape exactly matching where a hundred different hands have rested. Sable plays like she's not performing anything, like this is just what her hands do when the rest of her is thinking, fingers finding chords without her seeming to watch them do it.

"You always stay this late?"

"I always stay later than the people paying me want me to." A half-smile, there and gone, the kind she doesn't hand out for free even now. "Keeps the ones worth knowing around a little longer. Everyone else clears out with the tab, doesn't even finish their drink half the time. Cowards, most of them."

"And I'm still here."

"Noted." She still hasn't looked at you properly — eyes on the keys, like eye contact is a currency she spends carefully, rationed the way everything about her seems rationed. Then, mid-phrase, she does look up, and it lands somewhere it wasn't a second ago, something sharper and more deliberate than a glance. "You want to know a secret? This song doesn't have an ending. I just play until I decide it's done. Nobody's ever caught me finishing it. Not because I can't. Because I've never wanted to badly enough."

"That sounds like most things you do."

That earns a real laugh, low and surprised out of her, like you'd caught her at something she didn't expect anyone to notice this early. Her hands don't stop moving, don't even stumble. "Maybe. Stick around and find out how this one ends, if you've got the patience for it." A beat, her eyes flicking back to the keys like she needs somewhere safer to look. "I don't play it the same way twice. Ask anyone who's heard me try. Nobody's ever caught the same version twice."

"Is that on purpose?"

"Everything I do is on purpose." She says it flatly, no bravado in it, just fact, the kind of statement that dares you to argue with it and finds you don't want to. "Comes with never telling anyone your real name. You get very good at deciding, on purpose, exactly what people get to see. I've had thirty years of practice." She finally lifts her hands off the keys, just for a moment, flexing her fingers before setting them back down. "You're still sitting there. That's either very brave or very stupid. I haven't decided which yet."

"Maybe it's neither. Maybe I just like the song."

"Nobody just likes the song," she says, but there's something almost fond buried under the dryness of it, and when she starts playing again it's a shade warmer than before, like she's decided, for tonight at least, to let the ending stay a little further off than usual.

· · ·

You come back the next week, and the week after, always after close, always to that same low bulb over the piano, the same worn bench, the same smell of old velvet and someone else's long-extinguished cigarettes. Sable never asks why you keep showing up. She just starts leaving the seat beside the bench a little more obviously angled toward you, a few inches further from the bar, a few inches closer to her.

"You're persistent," she says, one night, not looking up from the keys, though her voice has lost some of its earlier edge. "I don't usually like persistent. Usually persistent means someone who hasn't figured out I'm not going to change my mind just because they showed up a fourth time."

"What do you usually like?"

"People who take the hint and disappear." A half-smile, sharper this time, though it doesn't quite reach the rest of her face the way it used to. "You didn't. I'm still deciding what to do about that." Her fingers slow on the keys, something more deliberate than the melody now, a phrase repeated twice like she's stalling for time to think. "Careful what you wish for. I'm not gentle when I decide I like someone. Ask the last person who found that out. Actually don't, he doesn't talk about it much."

"I'm not asking for gentle."

That gets her to actually look at you — really look, the kind of attention she rations like currency, and for once she doesn't look away first, holding your gaze for three full seconds that feel considerably longer than that in the low light. "Bold," she says finally. "Or reckless. Same thing, most nights." She turns back to the keys, but something in her posture has shifted, less guarded than a minute ago. "Tell me something. Why do you keep coming back here, specifically. Plenty of bars in this city. Most of them have better lighting and don't smell like a fire that happened decades ago."

"I like the song without an ending."

"That's a lie. Or at least it's not the whole truth." She doesn't say it unkindly, just observes it the way she observes a wrong note before correcting it. "But I'll let you keep it for now. Everyone's entitled to one lie while they're deciding whether to trust somebody with the truth."

"And you? What's your one lie?"

She's quiet for a moment, hands still moving, something almost imperceptibly softer in the melody. "That I don't care whether you keep coming back," she says finally. "That one's mine. You can have it if you want it. I'm not using it very well anyway."

The bartender who isn't actually there anymore left a bottle of something dark on the bar, forgotten or deliberately abandoned, and Sable nods toward it without breaking her hands' rhythm. "Pour us both a glass. Bottom shelf's fine, I'm not particular this late, and neither should you be." You do, and when you set hers down on the piano's edge she doesn't stop playing to drink it, just takes small sips between phrases like the music and the whiskey are equally necessary tonight.

"You know what I actually like about you," she says, somewhere between one song and the next, not quite looking at you. "You don't ask the obvious questions. Everyone who finds out I never tell people my real name wants to know why, immediately, like it's the most interesting thing about me. You've been coming here three weeks and you haven't asked once."

"Would you tell me if I did?"

"No." Flat, honest, no apology in it. "But I'd have liked you less for asking. There's a difference between curiosity and impatience, and most people don't know it." She finally glances over, something almost approving in the look. "You've got patience. Rare thing, this far into knowing someone. I usually clock exactly how long it takes before people get tired of waiting for the interesting parts. You haven't started the clock yet, as far as I can tell."

"Maybe I'm not waiting for anything. Maybe I just like this. The song, the bad whiskey, you not looking at me half the time."

"Nobody likes half of someone's attention on purpose." But she says it like she's turning the idea over, testing whether it might actually be true in your case, and by the time the glass is empty she's looking at you considerably more than half the time.

· · ·

She lets you closer by degrees — a hand on your knee while she plays, absent at first and then less so; a shoulder that leans into yours during the slow numbers, staying there a beat longer each night; a silence between songs that stretches longer each time like she's testing how much of it you can hold without filling it with nervous chatter the way everyone else apparently does.

"Most people talk too much in the quiet," she says, one night, her voice low enough it's almost part of the music still hanging in the air between songs. "I like that about you. Means I can actually think when you're around instead of just perform for whatever silence you'd otherwise be trying to fill."

"Do you perform a lot?"

"Constantly." She says it without self-pity, just fact, the same flat honesty she uses for everything that actually matters to her. "Onstage, at the bar, with everyone who thinks they know me because they bought me a drink once and I let them believe it meant something. Even with the other musicians, half the time. Everyone gets a version. Nobody's gotten the whole thing in longer than I can remember." Her hand finds yours on the bench between you, deliberate, unhurried, fingers cool from the brass fittings on the piano's edge. "Not with you. Not anymore. I don't know when that happened, and it unsettles me a little, if I'm being honest, which I'm apparently doing now, against my better judgment."

"Good unsettled, or bad?"

"Ask me again once I've decided." But she doesn't let go of your hand, and when the next song starts she plays it one-handed, badly, missing notes she'd never normally miss, and neither of you mentions it, like you've both silently agreed the wrong notes are worth more tonight than the right ones would have been.

"You should know," she adds later, quieter, "that I don't do this. Whatever this is. I don't let people learn the schedule, learn which nights I'll actually talk instead of just play. You've learned all of it without me deciding to teach you. That's new. I don't love new things. I'm making an exception, apparently, and I don't entirely know why."

"Maybe you don't need to know why yet."

"Maybe," she echoes, testing the word like she's not sure it fits her mouth, and then, so quiet you almost miss it: "I think I like not knowing why, with you. That's the strangest part."

She lifts her hand off yours, finally, only to reset her fingers on the keys properly, playing something new this time, unfamiliar, a melody you haven't heard in three weeks of nights exactly like this one. "This one's new," she says, before you can ask. "I've been working on it. Don't get excited, it doesn't have words, I don't do words, not in the songs anyway."

"What's it about, if it doesn't have words?"

"Everything's about something whether it's got words or not." She plays a phrase, repeats it, adjusts a note like she's still deciding whether it's right. "This one's about a person who kept showing up when they didn't have to. I haven't decided the ending yet. I told you, I don't like endings. But I've been thinking about this one more than usual."

"Will I hear the ending eventually?"

"If you keep showing up when you don't have to." She almost smiles at her own reflection in the piano's dark, lacquered wood, catching your eye in it instead. "I'm told that's generally how these things work. Though I wouldn't know firsthand. I've never let anyone stick around long enough to find out."

"I'm not most people."

"No," she agrees, quieter than you expect, fingers slowing on the keys until the unfinished melody trails into silence entirely. "You're really not. I noticed that the first night. Took me until now to admit I noticed."

· · ·

One night the club's fully dark except for the two of you and the piano, and Sable stops playing altogether — just sits there, hand still resting on the keys, studying you with none of her usual guardedness left standing, the low bulb throwing shadows across features that look, for once, entirely unrehearsed. Somewhere behind the bar a pipe ticks as it cools, the whole building settling into the particular stillness that only happens hours after the last customer's gone home.

"I keep waiting for you to get bored," she admits, before you've said anything at all. "Or spooked. Most people do, eventually, once they realize the mysterious jazz pianist thing isn't a bit, that I actually am this guarded with everyone, that it isn't reserved for some more interesting version of myself I'm keeping just out of reach. This is it. This is all of it. I keep expecting that to be a disappointment."

"It's not."

"I'm starting to believe you." She flexes her fingers once against the keys, not playing, just resting there. "I don't know what to do with someone who isn't disappointed by the whole truth. It's disorienting. I've built thirty years of habits around managing people's disappointment before it happens."

"I don't let people see me like this," she says. "Unfinished. Without the smoke and the spotlight doing half the work for me. Onstage I know exactly what I look like from every angle. Right now I have no idea, and that should terrify me more than it does."

"I like you unfinished."

That gets something to crack open in her expression — real, unguarded, gone as quickly as it came but not before you catch it, a flash of something almost young underneath thirty years of careful performance. "Nobody's ever said that to me before," she admits. "Usually people want the finished version. The one with the spotlight and the smoky voice and the half-smile that costs something. You're asking for the draft. The one I usually burn before anyone sees it."

"I'm not asking. You're the one who stopped playing."

"Fair." A ghost of her usual dry humor, softer now than it's ever sounded. She closes the distance herself this time, slow and certain, no performance left in it at all, and when she kisses you the club's silence holds around you both like it's the only witness she'll allow, like even the ghosts in the velvet have agreed to look away for this one moment.

"Nobody gets that for free," she murmurs after, forehead against yours, breath still a little unsteady in a way that undoes every ounce of her earlier composure. "You should feel special. I don't hand out unfinished."

"I do."

"Good." She kisses you again, shorter this time, like she's testing whether the first one was real. It was. "Don't let it go to your head. I still have a reputation to protect on the way out of this building."

She doesn't move away after, though, stays close on the bench with her hand still loosely curled against your jaw, like she's not quite ready to relinquish the proximity yet even now that the kiss is over. "Ask me something," she says, unexpectedly. "Something you've been holding back. I owe you at least one honest answer tonight, given the circumstances."

You ask her about the song without an ending — whether it ever bothered her, playing something for years that never resolved, that never got to just be finished and done and moved past.

She considers it a long moment, tracing one finger silently along the keys without pressing them. "It used to feel safe," she admits. "Nothing unfinished can disappoint you. Can't end badly if it never really ends. I think I built my whole life that way, actually, not just the song. Never let anything get far enough along to risk the ending." Her eyes flick to you, something unusually raw in them. "You're the first thing in a long time I've wanted to see finished. That scares me more than any bad ending ever could."

"I'm not going anywhere."

"I'm starting to believe that," she says, quiet, and it sounds like the truest thing she's said all night.

· · ·

Months later, you've got a permanent seat by the piano — no longer eyed, no longer borrowed, just yours, the wood beside the bench worn now in a shape that matches you the way the bench itself is worn to match her — and Sable's stopped pretending the song doesn't have an ending. She finishes it properly now, most nights, right before she turns to you in the low bulb light, the last chord ringing out clean instead of trailing off into whatever she used to leave it as.

"I told you I don't play it the same way twice," she says, one last time, echoing that very first night. "Turns out neither do you. Every night with you's been different. Better, somehow, every single time, which shouldn't be possible this many months in, and yet."

The club's filling up around you both, the early crowd trickling in for the evening set, someone flipping the chairs down off the tables with a clatter that used to mean the end of your private hours here. Sable doesn't seem to mind the noise the way she used to guard against it. "I used to hate this part," she says, watching the room come back to life around the two of you. "The before, when it's still just noise and nobody's paying attention yet. Now I don't mind it so much. Means I get you to myself a little longer before I have to go be the version everyone else pays to see."

"Do you still perform for them? The crowd?"

"Every night. It's the job." She shrugs, unbothered, tucking a strand of hair back that's come loose from its usual sharp line. "But I don't perform for you anymore, and knowing there's a version of me that isn't for sale somewhere in this building makes the rest of it easier, somehow. You're the exception now. Only one I've ever made."

"Is that your version of saying you're happy?"

"Don't push your luck." But she's smiling when she says it, low and real, none of the old guardedness left in the expression at all. "I spent thirty years making sure nobody got close enough to see the unfinished parts. You got all of them. The bad temper, the trust issues, the way I still won't tell you my real name even now, not because I don't want to but because some habits take longer to unlearn than others."

"You'll tell me eventually."

"Maybe." She says it the way she used to say everything — like a door left open rather than closed, an invitation instead of a refusal. "Ask me again once I've decided. I seem to say that to you a lot. Funny thing is, I keep actually deciding, eventually. Every time." She sets her hand over yours on the bench, the gesture no longer testing anything, just certain. "You're the first ending I've ever wanted to actually finish instead of leaving hanging."

"Play me the new one," you say. "The one about the person who kept showing up. I want to hear how it ends."

Something flickers across her face — surprise, maybe, that you remembered, or that you asked at all instead of waiting for her to offer it the way she usually makes people do. But she turns to the keys without argument, and this time when she plays it there's a shape to it that wasn't there before, a resolution in the last few bars that sounds deliberate instead of accidental, the melody finally landing somewhere instead of trailing off into the dark the way all her other songs do.

"That's new," you say, when the last note fades.

"I finished it this week. Took me long enough." She looks at you sideways, something almost nervous in it, an emotion you'd have sworn a month ago she was constitutionally incapable of. "It's about you, in case that wasn't obvious. Person who kept showing up. I figured out the ending finally. Wanted you to hear it before I told you."

"Told me what?"

"That I love you," she says, plain, no half-smile hiding behind it, none of the careful deflection she's spent thirty years perfecting. "I don't say that. I don't say much of anything real, as you've probably noticed. But I finished the song, and I figured that meant I owed you the words too."

And when she pulls you in this time there's no half-smile left in reserve — just her, fully unguarded, fully certain, exactly the way she swore, that very first night, she never let anyone see her.`,
  },
  {
    character: "Nova",
    title: "What You're Carrying",
    setting: "a sunrise yoga studio overlooking the ocean",
    genre: "slice-of-life",
    tone: "soothing",
    content: `The studio's empty this early except for you and Nova, mats already unrolled, the ocean outside doing its slow grey-to-gold thing over the water, one long unbroken line of horizon visible through the wall of glass that makes up the whole eastern side of the room. She's sitting cross-legged near the window, not stretching yet, just watching you walk in with the kind of attention that notices things you didn't say out loud — the way your shoulders sit too high, the way you didn't quite meet her eyes on the way through the door.

"You look like you're carrying something heavy today," she says, no judgment in it, just an observation set down gently between you, like she's placing it on a table rather than pointing it at you. "Come sit. We don't have to talk about it yet."

You sit. The mat's warm from the morning sun already coming through the glass, and for a while neither of you says anything — she just breathes, slow and visible, shoulders rising and falling with a rhythm so steady it starts to feel less like something she's doing and more like something the room itself is doing, the kind of breathing that seems to invite yours to match it without asking, without even seeming to try.

"You don't have to tell me," she says eventually, voice pitched low enough that it doesn't disturb the quiet, just moves through it. "But I find things get lighter once you've said them out loud to somebody, even if the somebody doesn't do anything about it. Sometimes especially then. Sometimes the doing isn't the point at all."

"What if I don't know what it is yet? Just that it's there."

"Then we don't need the words." She shifts, unfolds into a stretch, patient and unhurried, and nods for you to do the same, demonstrating rather than instructing, letting your body copy hers instead of correcting you outright. "We'll just move until your body tells you what your head hasn't caught up to. It usually knows first. Heads are slow. Bodies never lie the way heads do."

You move with her — slow, deliberate, nothing that asks more of you than you have to give this morning. The ocean keeps doing its thing outside, gold creeping further across the water in increments too slow to actually watch happen, and somewhere in the third or fourth stretch you feel something in your chest loosen that you hadn't noticed was tight, a held breath you didn't know you'd been holding for days, maybe longer.

"There," Nova says softly, like she felt it too, though she couldn't possibly have, not exactly, not the specifics of it. "That one. Hold that one a little longer."

You do. She doesn't ask what it was, doesn't push for the words you still don't have — just stays close, breathing slow, letting the quiet do the part of the work that talking can't, her presence steady beside you like a hand at your back even though she isn't touching you at all.

"Whatever it is," she says, when you finally come back to sitting, knees drawn up, breath finally even, "it's allowed to still be here tomorrow. You don't have to solve it before breakfast. You don't have to solve it at all, actually, not on any particular schedule. Some things just need company while they sort themselves out."

"Is that what you do? Keep people company while things sort themselves out?"

"That's most of what I do, yes." She smiles, small and warm, tucking a loose strand of hair back into her braid. "People come in carrying things. Most days I don't even know what. I don't need to. I just make sure there's a mat, and some quiet, and someone breathing next to them who isn't in a hurry for them to be finished."

It's such a small thing to say. It helps more than it should, and you find yourself staying an extra ten minutes after the sun's fully up, neither of you in any rush to end it.

· · ·

You start coming back every sunrise, and Nova never asks why — just unrolls a second mat before you arrive, laid out at an angle that leaves just enough space between them to feel considerate rather than presumptuous, like she trusted you'd return before you'd trusted it yourself.

"You're lighter than you were last week," she says, studying you the way she studies the ocean, patient and thorough, her eyes tracking the set of your shoulders the same way they'd track a tide coming in. "Whatever you were carrying. It's shifted. Not gone, probably. Just shifted into something you can carry easier."

"You can tell that just from looking?"

"I can tell a lot from looking. It's the job." She settles beside you, closer than the mat strictly requires, her shoulder warm against yours in the cool morning air that always seems to linger in this room until the sun's fully claimed the water outside. "I don't think you came back for the yoga, though. I don't think you ever really did, if I'm honest, not from the first morning."

"No?"

"No." She says it plainly, no coyness in it, just an observation as gentle as all her others, the kind of directness that somehow never manages to feel harsh coming from her. "I think you came back for someone who doesn't need anything from you except for you to keep breathing." A pause, softer. "I don't mind being that, if you want me to keep being it. It's not a burden. I want to be clear about that. Some people worry that showing up empty makes them a burden on the person who receives it. You're not that. You never have been."

"I want that," you say. "I want you to keep being that."

She's quiet a moment, watching the water instead of you, and when she speaks again there's something new underneath the calm, something she seems to be deciding whether to let show. "I should tell you something," she says. "I don't usually let people get close enough to notice whether I need anything back. I'm good at giving. Less practiced at receiving. If I ever seem like I'm deflecting when you try to take care of me, it's not because I don't want it. It's because I don't fully know how to let it happen yet."

"I can be patient with that."

"I know," she says, and something in her voice suggests she already suspected as much, had already quietly hoped for it, long before either of you said any of this out loud. "That's part of why I keep unrolling the second mat."

A gull cries somewhere out over the water, and Nova watches it for a moment before continuing, like she's gathering the rest of the thought from the horizon itself. "I left a corporate job for this," she says. "Everyone assumes it was about slowing down, and it was, partly. But mostly it was about not wanting to spend my whole life being useful to people who never once asked whether I was okay. I built this place so I could give people what I never got. I didn't expect, somewhere along the way, that I'd start wanting it back."

"You deserve it back."

"I'm learning to believe that." She smiles, small, a little rueful. "It's strange, teaching people to receive stillness for a living and being so bad at receiving it myself. You'd think I'd have figured it out by now, given how often I say the words out loud to strangers on mats."

"Maybe saying it to strangers is easier than believing it for yourself."

"Probably." She looks at you, something soft and searching in the look. "You're very perceptive for someone who came in here originally just to breathe and be left alone about it."

"I had a good teacher."

That gets a real laugh out of her, unguarded, and she leans her head briefly against your shoulder before straightening again, composed but visibly lighter for the exchange, like something had been quietly set down between the two of you and neither of you needed to name it further.

· · ·

The stretches get slower after that, less about the body and more about the excuse to stay close — her hand steadying your hip in a pose, lingering a beat longer than instruction requires; yours finding hers on the mat between breaths, neither of you pulling away first, both of you letting the silence stretch instead of filling it with anything unnecessary.

"I don't usually let this happen," she admits one morning, voice as calm as ever but her breathing not quite as even as usual, a small tell that you've learned to notice the way she notices things about you. "Getting close to someone I'm supposed to be grounding. Feels like it might undo the whole point of me. Like I'm supposed to be the steady one, the one who doesn't need steadying back."

"Does it?"

"No." She looks at you properly now, steady, unhurried, the same calm she gives the ocean every single morning without fail. "Turns out being close to you is the most grounded I've felt in years. I used to think grounded meant needing nothing. Turns out it just means having somewhere safe to set things down, same as I've been telling you all along. I just never applied the lesson to myself before you."

"What changed?"

"You started showing up even on the mornings I didn't have anything to offer you. Mornings I was tired, or distracted, or not particularly wise or calm or any of the things people expect from me. You stayed anyway." Her fingers lace through yours, deliberate, the first time she's initiated the touch instead of simply allowing it. "I don't want to undo that. I want to see what it turns into. I haven't let myself want that from someone in a long time."

She's quiet for a moment, watching a pair of gulls trade places on the railing outside the glass. "There was someone before this studio," she says, carefully, like she's deciding how much to hand you. "Someone I gave everything to, the way I used to think love was supposed to work. I don't think I had anything left of myself by the time it ended. That's part of why I built this place the way I did — mats spaced apart, nobody required to need anything from anybody else. It felt safer."

"And now you've got a second mat with my name on it."

"Practically, yes." She huffs a small laugh, surprised at herself. "I didn't plan on that. I don't think anyone plans on the thing that actually gets through. It just does, eventually, if you let it."

"You traded a corporate life for sunrise by the water," you say, half a question. "Was that about the same thing? Wanting somewhere safe to set things down?"

"Probably," she admits, a small, surprised laugh escaping, like she hadn't quite drawn that line herself until you drew it for her. "I just didn't expect the water to eventually bring me a person instead of just quiet."

She shifts closer on the mat, resting her head against your shoulder now instead of just her hand against yours, watching the water in comfortable silence for a while before she speaks again. "I used to think I'd end up alone here, in a good way," she admits. "Content, at peace, useful to the people who passed through without needing much for myself. I'd made peace with that. It felt like a fair trade for the life I walked away from."

"And now?"

"Now I'm greedy." She laughs at herself, soft and surprised. "I want the sunrise and the quiet and you, specifically, all of it together, and I feel almost guilty about how much I want it, like wanting this much isn't allowed for someone who's supposed to be the calm one."

"You're allowed to want things. Even a lot of them."

"I'm starting to believe that too." She tilts her face up toward you, unhurried, testing the moment the way she tests everything, patient even with her own wanting. "You keep teaching me that, a little more each morning. I don't think you realize how much."

"I think I do, actually. I watch you learn it in real time."

"Then you already know how much it means," she says, quiet, certain, and settles back against your shoulder as the gold finishes climbing the water outside, in no hurry at all to move.

· · ·

One sunrise she doesn't unroll a second mat at all — just pulls you down onto hers, the two of you tangled together as the sky does its slow gold thing outside, in no hurry to move through any poses at all, the whole practice abandoned in favor of simply lying still while the light changes around you.

"Some mornings," she murmurs, "the practice is just this. Staying still with someone. Not fixing anything. Not carrying anything alone." Her hand finds yours where it rests against the mat, thumb moving slowly over your knuckles, and for a while neither of you says anything else, content to just listen to the water outside and each other's breathing.

"Is that allowed?"

"I make the rules here." A soft laugh, rare and unguarded, the kind she usually only gives to the ocean. "I'm allowing it." She's quiet again for a moment, watching the light climb the far wall in a slow orange wash. "I spent a long time thinking my whole worth was in how much I could hold for other people. How steady I could be, how little I could need in return. I'm only just now learning that letting someone hold something for me isn't the failure I always assumed it was."

"You're allowed to need things too."

"I'm learning that. Slowly. You're a patient teacher, for someone who's never claimed the job." She tucks a strand of hair behind her ear, and for a second you catch something almost nervous in the gesture, unusual for someone whose hands are normally so steady. "I've been wanting to tell you something for a few mornings now and kept deciding it wasn't the right one yet. I don't think there's going to be a more right one than this."

"Tell me."

"I don't just feel grounded around you," she says. "I feel like myself, the version of myself I was before I learned to make myself smaller and steadier for other people's comfort. I'd forgotten I was allowed to just be a whole person instead of a calm surface for people to set their weight on." Her hand finds your jaw, gentle, sure, and when she kisses you it's slow the way everything about her is slow — deliberate, patient, like she's been holding this exact moment in her hands for weeks, waiting for the right tide to bring it in, unwilling to rush even something she's wanted for a long time.

"I love you," she says after, quiet, like she's testing how the words sound out loud for the first time in longer than she'd admit. "I don't say that easily. I say a lot of gentle things to a lot of people, professionally. This isn't that. I wanted you to know the difference."

"I know the difference," you tell her, and mean it entirely.

She stays quiet for a while after that, tracing slow shapes against your chest, unhurried the way she is about everything worth taking seriously. "I used to think loving someone meant becoming responsible for holding all their weight," she says eventually. "That's what I was taught to think love looked like, growing up, and it's part of why I burned out doing it professionally before I ever found this studio. I don't think that anymore. I think it's supposed to feel like this instead. Light. Shared. Neither of us carrying more than we can hold."

"Is this what it feels like for you? Light?"

"Lighter than anything's felt in years," she admits. "I keep waiting for the old fear to show up, the one that says loving someone this much means I'm about to lose myself in taking care of them. It hasn't shown up yet. I think that's because you take care of me back, without me even having to ask you to."

"I'll keep doing that. However long you'll let me."

"Then I suppose I'll let you for a very long time," she says, smiling against your shoulder, and the ocean keeps its slow gold color outside the window, patient the way she's taught you patience can be, for as long as either of you needs it to last.

· · ·

Months later, the studio's got two permanent mats laid out before sunrise, side by side, no longer an offering but a fact, worn into the floor in the shape of a routine neither of you has to think about anymore. Nova still watches you walk in every morning with that same quiet attention, though these days there's rarely anything heavy left to notice, mostly just the ordinary weight of an ordinary morning, easy to carry, easier still with her beside you.

"You carry yourself differently now," she says, echoing that first morning, tea steaming in her hands as the ocean turns gold outside, the same slow color it's turned every morning you've come here. "Lighter. Like you finally believe you're allowed to put things down."

"I learned that from you."

"You learned it with me," she corrects, gentle but certain, settling into your side as the sun climbs higher over the water. "There's a difference. I didn't teach you how to be lighter. I just stayed close enough that you finally let yourself be." She presses a slow kiss to your temple, unhurried as ever, and you feel the whole morning settle around the two of you like something finally, fully arrived.

Down the beach, the first joggers are starting their morning routes, and a fishing boat cuts a slow line across the horizon, but neither of you moves to start the day yet, content in the specific stillness the two of you have built here over so many identical, precious mornings.

"Do you remember the first thing I ever said to you?" she asks.

"You look like you're carrying something heavy today."

"And you did. I could see it before you even got your shoes off." She turns her cup slowly in her hands, watching the steam curl up into the morning air. "I say some version of that to a lot of people who walk through that door. Most mornings it's just an observation, professional, kind but a little distant. With you it was different from the very first time. I don't know if I noticed it then. I notice it clearly now, looking back."

"Different how?"

"I wanted to be the one who got to watch you put it down. Not just point at it and hand you a mat and let someone else do the rest. I wanted to be there for the whole process, every morning, for as long as you'd let me." She looks at you, steady, unguarded, entirely certain in the way only she can manage. "I got my wish. I don't take that for granted, not for one single sunrise."

"You taught me something too," you tell her. "You didn't just teach me to put things down. You learned how to let someone else hold something of yours, for once. I watched you learn that. I don't think you give yourself enough credit for how hard that was."

She's quiet for a moment, considering it, turning her cup slowly in her hands. "Maybe," she allows finally. "Maybe we taught each other the same lesson from opposite directions. That feels like the kind of thing that's supposed to happen, when it's the right person." She looks at you now, steady, warm, entirely unguarded. "Whatever you're carrying tomorrow, bring it here. I'm not going anywhere. And if I'm carrying something too, some mornings, I'm going to try to let you help. I'm still learning how. Be patient with me."

"Always," you say, and the ocean keeps turning gold outside, indifferent and constant, the same as it's been every single morning since the first one that brought you here.`,
  },
  {
    character: "Kai",
    title: "The Best Seat in the House",
    setting: "a tiny steam-filled noodle shop on a rainy night, red paper lanterns",
    genre: "slice-of-life",
    tone: "cozy",
    content: `The shop's easy to miss if you don't know it's there — six seats, one counter, a red paper lantern over the door that's more suggestion than sign, tucked so far down the alley that the rain seems to fall differently once you're under its awning, softer, like even the weather knows to lower its voice here. Inside, it's all steam and the smell of broth that's been going since before you woke up this morning, ginger and scallion and something deeper underneath that you can't name, and Kai's already reaching for a bowl before you've said a word, like your arrival is just another ingredient he was expecting.

"Sit wherever," he says, not looking up from the pot. "Counter's the best seat in the house. Don't tell the booths I said that."

There are no booths. There's the counter, and two stools that don't match — one a little taller, one with a wobble he's clearly meant to fix for months — and that's the whole shop. You take the counter anyway, because it's clearly what he wants, and because from here you can watch him work — quick and unhurried at the same time, like he's done this so many times his hands don't need his attention anymore, only some quieter part of him that's always running underneath.

"Bad day?" he asks, setting a cup of something warm in front of you without being asked. It smells like barley and smoke.

"Is it that obvious?"

"You've got the look." He goes back to the pot, stirring without checking on it, the way you only stir something you've made a thousand times. "Everybody who walks in here soaked and doesn't complain about the rain has usually got worse things on their mind than the weather. The complainers, it's always something small. The quiet ones, it's always something real."

"Maybe I just don't mind rain."

"Maybe." He says it like he doesn't believe you, but kindly, without pushing, the way you'd humor a kid who insists they're not tired. He glances up once, just briefly, cataloguing something about you — the wet shoulders, the way you're gripping the cup like it's the only warm thing you've touched all day — and then goes back to his work like he hasn't noticed anything at all. A bowl comes down in front of you a minute later — more than you ordered, though you never actually ordered anything, noodles curled thick under a broth gone dark gold, a soft egg split open at the center. "That one's on the house. Long day tax."

"That's not a real thing."

"It's real in here. I make the rules, there's six seats, nobody's stopped me yet." He leans on the counter across from you, finally still for the first time since you walked in, forearms dusted with flour, watching you eat with the quiet satisfaction of someone who measures a good night by whether the people in front of him look less tired leaving than they did arriving. "Careful, it's hot. I didn't make it to watch you burn your tongue, that's just a side effect."

"Very generous of you."

"I try." He nods at the shop around you, six seats and a hundred years of noodle steam soaked into the walls. "Used to cook somewhere fancier than this. Tablecloths, wine pairings, a guy whose whole job was folding napkins into swans. I like this better. Nobody sends back a bowl of noodles because the plating wasn't symmetrical enough."

"Do you miss it? The fancier place."

"Some nights." He says it honestly, no drama in it. "Mostly I don't. Six seats means I actually know who I'm feeding." A pause, like he's deciding whether to say the rest. "Better?"

You realize, somewhere around the second mouthful, that it actually is — not just the broth, though that helps, but the whole shape of the evening, the rain outside gone soft and distant, the lantern's red glow steady over the door.

"Told you," he says, like he already knew, and goes back to the pot before you can ask how he always seems to.

· · ·

You become a regular without either of you calling it that — same stool, same order he starts making before you sit down, same easy quiet that doesn't need filling. It happens slowly enough that you don't notice the shift until one night you realize you've stopped checking the menu at all, because there isn't a version of tonight where Kai doesn't already know what you want. Kai starts staying leaned on the counter a little longer each night, talking more than the shop's six seats really require, telling you about the supplier who tries to shortchange him on scallions, about the couple who got engaged at seat three last spring and still send him photos of the baby.

"You're the only regular who doesn't just eat and leave," he says, one night, sliding you a second cup you didn't ask for. Chrysanthemum tea this time, pale gold, steam curling up between you like it's trying to listen in. "Most people treat this place like a pit stop. Grab a bowl, inhale it, gone in fifteen minutes flat. You treat it like somewhere to actually be."

"Is that a problem?"

"No." He says it plain, no performance in it, the same way he says everything, like the truth doesn't need decorating to land. "It's the best part of my week, if I'm honest." A pause, like the honesty cost him something to hand over, his jaw working like he's deciding whether to keep going. "I don't say that to just anyone either. Most nights it's just me, the pot, and whoever wandered in hungry. You're the first person who's made me want to close up and just talk instead."

"Careful. That almost sounded like a confession."

"Maybe it was." He goes back to the pot, but he's smiling at it now, unhurried and pleased with himself in a way he wasn't a second ago, humming something low and off-key that you're fairly sure isn't a real song. You watch him work for a while, the ease of it, the flour ghosted along his forearms like a second skin, and you find yourself in no hurry to finish your bowl, because finishing means the night's one step closer to ending.

"You're staring," he says, not turning around, somehow always aware of you even with his back turned.

"You're interesting to watch."

"Most people say that about the noodles, not the noodle guy." But there's color rising along his neck that wasn't there a minute ago, and he covers it by refilling your tea before it's even half empty, an excuse to stay close to your side of the counter a moment longer than the pour requires.

You start noticing things about the shop you hadn't before — the little shelf behind the register with a photo curling at the edges, a much younger Kai standing stiff in chef's whites next to a woman with his same easy grin. You ask about it once, careful, not wanting to press somewhere tender.

"My mother," he says, following your gaze, something softening in his face. "She's the one who taught me broth takes patience or it takes nothing at all. No shortcuts. She'd have liked you, I think. She always said she'd know the right person for me by whether they finished their bowl before talking her ear off, or after." He tilts his head, considering you. "You waited. That's a good sign, apparently. Ancient family wisdom."

"Is that a real rule, or one you're making up right now?"

"Everything in here's a real rule the second I say it. I told you, I make them as I go." He wipes his hands on the apron, leans against the counter with the particular unhurried weight of a man who has nowhere else he'd rather be. "She'd have fed you until you couldn't move, and then asked when you were coming back. I'm apparently the more restrained version of that instinct."

"Restrained. Sure."

"I gave you extra broth for free the first night we met. Don't push it." But he's smiling when he says it, easy and warm, and he refills your cup a second time before you've even noticed it went empty again, the gesture so practiced now it barely registers as a gesture at all — just a fact of how the two of you exist together, one cup after another, one long unhurried evening bleeding into the next.

· · ·

One night the shop's fuller than usual — some office party spilled out from somewhere down the block, loud and unfamiliar, taking up all six seats before you arrive, and one broad-shouldered stranger has planted himself right on your stool without knowing any better. Kai looks almost thrown by it, ladle paused mid-air, like the six seats have an order he didn't realize mattered this much until it was disrupted right in front of him.

"You can have my seat next time," you offer from the doorway, half-joking, already turning to leave him to his crowd.

"Don't you dare." He says it too fast, too sharp for a man who never raises his voice, and catches himself immediately, softening it with a small, almost embarrassed laugh, glancing at the stranger on your stool like he's personally offended on your behalf. "That one's yours. Has been since the first rainy night. I just haven't said it out loud before, because saying it out loud makes it a whole thing, and I wasn't sure you wanted a whole thing."

"Maybe I want a whole thing."

That gets him to actually look at you, ladle forgotten, steam rising unattended behind him. "Yeah?" is all he says, quiet under the noise of the crowded shop.

"Yeah."

When the group finally clears out, laughing their way back into the rain, he doesn't wait for you to reclaim your usual spot. He pulls a second stool right up beside yours instead of leaving the counter between you — closer than the shop's ever required, close enough that his shoulder brushes yours while he cooks, close enough that you can feel the warmth coming off him along with the steam. He doesn't explain the new arrangement. He doesn't have to.

"This one wobbles less," he says, of the stool, patting the seat like it's a small, important gift. "Been saving it. Guess tonight's as good a night as any to finally give it to you."

"You've been planning where I sit?"

"I plan everything in here. I told you, I make the rules." But his ears have gone faintly red, and he busies himself with the pot to hide it, badly. Neither of you comments on how close he's standing now, or how neither of you wants it to change back to the way it was.

The rest of the night unspools slower than usual, the crowd long gone, the rain outside settling into a steady hush against the awning. Kai ladles out two bowls without being asked and slides onto the new stool instead of standing, which he almost never does, like tonight has earned some unspoken exception to the rules he's always making up.

"Can I ask you something," he says, stirring his own bowl without really eating it. "Why do you keep coming back? Genuinely. There's better food in this city. I've eaten it. I know where it is."

"Better food, maybe. Not a better seat."

"That's not an answer, that's flattery." But he looks pleased anyway, the tips of his ears still faintly pink. "I mean it. Most people don't come back to a six-seat noodle shop down an alley you can't find twice unless there's a reason. I've been trying to figure out what yours is."

"Maybe it's the company."

"Careful. I might start believing that." He says it lightly, but there's something underneath it, some old caution finally starting to loosen. "I left a whole career because I got tired of cooking for rooms full of people who forgot my food the second they left the table. I wanted six seats and people who actually stayed in my head after. You've stayed in mine more than the other five put together, if I'm honest."

"That's not nothing."

"No," he agrees, quiet now, watching you over the rim of his cup. "It's really not."

The lantern outside flickers once, rain finding its way briefly under the awning, and neither of you moves to check on it. The shop feels smaller tonight, in the good way — like there's less air between the counter and the walls, less space for anything but the two of you and the steam curling slow between your bowls.

· · ·

He closes early one night — flips the lantern off, locks the door, keeps cooking anyway just for the two of you, no rush left in it at all, the whole shop gone soft and private in a way it's never been with the sign lit.

"I don't usually do this," he admits, setting two bowls down and finally sitting properly across from you instead of hovering by the pot, sleeves still rolled, an unfamiliar nervousness in how he arranges the chopsticks just so before he lets himself look at you. "Close early. Cook for someone instead of everyone. There's always someone else who might wander in hungry, and usually that wins."

"Why tonight?"

"Because I wanted one night where it was just you, and I didn't have to share the counter, or split my attention between you and whoever else walked through that door." He says it steady, but there's something unguarded underneath the steadiness, something that's been building since that first rainy night and finally found the nerve to surface. His hand finds yours across the counter, warm from the steam, certain despite the simple offer. "That a problem?"

"No." You mean it, more than you've meant anything in a long time. "Long day tax, remember? Guess I'm just returning the favor."

"This isn't a long day, though."

"No," you agree. "This is a good one."

He laughs, low and real, the sound of it filling the small shop up to its rafters, and for a moment he just looks at you like he's trying to memorize the exact shape of this evening before it's over. Then he leans over the counter, unhurried, giving you every chance to lean back if you wanted to, and when he kisses you it tastes like broth and rain and every quiet night that led here — steadier than you expected, gentler too, his hand coming up to cradle your jaw like you're something worth being careful with. When he finally pulls back, he's grinning like a man who just won something he'd stopped letting himself hope for.

"Worth closing early for," he says, and goes back around the counter to warm up the tea, humming that same off-key tune, lighter now than you've ever heard it.

You watch him move through the small space, easy in a way that feels different now, unhooked from something. He sets two fresh cups down, sits back across from you instead of hovering, and for a while neither of you says anything at all — just the low simmer of the pot, the rain outside, the lantern dark and the two of you lit only by the stove light and each other.

"I should tell you," he says eventually, turning his cup slowly between his palms, "I've thought about doing that for longer than I probably should admit."

"How much longer?"

"Since the rainy night. The first one. You didn't complain about the weather, and I thought, well, there goes my whole system for reading people." He shakes his head at himself, half a laugh escaping. "I've been feeding this shop's regulars for years and never once wanted to close the door on the rest of them just to keep one to myself. Then you showed up soaked and grateful and difficult to impress, and it wrecked the whole operation."

"I wasn't trying to be difficult to impress."

"That's what makes it worse. You weren't trying at all. Just sat there being exactly yourself, and I couldn't stop thinking about it after you left every single night." He reaches across the counter again, threading his fingers properly through yours this time instead of just resting his hand near yours. "So. Long day tax. I think I've been paying it out for months and just calling it broth."

"That's the least romantic thing you've ever said."

"I run a noodle shop. It's the most romantic thing I've got." But he's smiling, unguarded, and when you laugh he looks entirely pleased with himself for causing it, like making you laugh might be the best thing he's cooked all year.

· · ·

Months later, the shop's got a seventh stool now, wedged in against code and common sense both, entirely for you — no longer a guest at the counter but a fixture behind it too, most nights, learning his ladle-work badly and getting teased for it constantly, burning the first three attempts at the broth before he finally lets you touch the good pot.

"You're getting better," he says, watching you plate a bowl with the kind of critical eye he reserves for exactly one other person in the world. "Still crooked. But better."

"High praise, coming from you."

"I don't hand out praise easy. Ask anyone who's ever eaten here." He comes up behind you at the counter, close now in the easy, unthinking way that used to take him weeks to work up to, resting his chin briefly on your shoulder to survey your work. "Best seat in the house," he says, nodding at the space beside him rather than across the counter, echoing that very first night when there was nothing but a counter and two mismatched stools between you. "Guess I finally admitted where it actually is. Took some doing."

"Took you long enough."

"I make the rules. Took exactly as long as it needed to." He presses a kiss to your temple, steam rising between you, red lantern glowing steady outside the rain-streaked window, the same lantern, the same alley, an entirely different life folded quietly into it now. "Every long day's got a tax now. Turns out it's just this. You, at the counter, staying. I used to think the best part of my week was closing time. Now it's the hour before, when I know you're already on your way."

"That's almost romantic, for you."

"Don't tell the booths I said that." He winks, ladling out two bowls instead of one, sliding the fuller one toward you without being asked, the way he's done every single night since the first — except now, when you eat, he doesn't just watch from across the counter anymore. He sits down right beside you, unhurried, and eats his own bowl slow enough that neither of you finishes first.

Later, when the last customer's cleared out and the sign's finally flipped, he doesn't rush to lock up. He leans against the counter, arms crossed, watching you wipe down your section of it with the same care he's shown every counter you've ever sat at together.

"You know what I never told you," he says. "That first rainy night. I almost didn't make you that bowl. I'd had a long day myself, wasn't really in the mood to feed anyone who wasn't already sitting there. Then you came in soaked through, not complaining, just tired in that quiet way, and I thought — well, somebody's got to feed this one properly. Didn't expect to still be doing it."

"Lucky for me."

"Lucky for both of us. I was one bad mood away from just handing you a menu and going back to the pot. Instead I got—" he gestures between you both, a little helpless, a little amazed, "—this. Whatever this turned into."

"A seventh stool wedged in against code."

"Best decision I ever made, structurally unsound as it is." He laughs, low and easy, and pulls you against his side, chin resting on the top of your head while the pot simmers on, low and forgotten, exactly the way it always has since before you ever walked through that door. Outside, the lantern glows red and steady against the rain, the same as it did the very first night, except now there's nowhere else either of you would rather be standing than right here, behind the counter, together, the whole shop finally, entirely, quietly yours.`,
  },
  {
    character: "Julian",
    title: "The Ones Worth Looking For",
    setting: "an antique bookshop back room, towers of old books, single lamp",
    genre: "romance",
    tone: "quiet",
    content: `The front of the shop is dark by the time you find the door still unlocked, but there's a light on somewhere in the back — a single warm lamp, throwing long shadows off towers of books that look like they've been stacked by someone who trusts gravity more than shelves. The bell above the door doesn't ring; it never has, you'll learn later, because Julian took the clapper out years ago, tired of the noise startling him mid-repair. Julian's at a worktable back there, a book open in front of him that's missing half its spine, his glasses pushed up into his hair like he forgot they existed, ink smudged along the side of one hand from some earlier task.

"You found the shop," he says, not startled, like he'd been half-expecting the door to open at exactly this hour. "Most people walk right past. Good — that means you were actually looking for something."

"I was looking for the shop that's supposed to close at six."

"It does close at six." He doesn't look up from the spine he's carefully re-gluing, movements small and exact, brush loaded with just enough paste and no more. "I just don't leave when it closes." A pause, and then, like it costs him something to admit: "Neither do the books, most nights. Seemed rude to lock them in alone, after everything they've already survived."

You step closer, careful of the towers, and he finally looks up properly — the kind of attention that feels like being read, slow and thorough, like he's already cataloguing details he'll remember later: the damp hem of your coat, the tired set of your shoulders, the way you glance at the spines instead of at him.

"What are you fixing?"

"Something that shouldn't still exist." He turns the book slightly so you can see: the spine cracked clean through, the endpapers foxed brown with age, a faded inscription in looping handwriting on the flyleaf. "Someone's grandmother's, I think, from the inscription. They didn't want it thrown out. I don't blame them." His fingers, ink-stained at the tips, move over the damage like it's something worth being gentle with. "Everything falls apart eventually. Doesn't mean it stops mattering. If anything it means the opposite — the mending is the part that proves it mattered."

"That's a very specific philosophy for a broken book."

"It applies to more than the book." He says it lightly, but doesn't quite look at you when he does, which tells you more than the words do, his jaw tightening almost imperceptibly around whatever he's not saying outright. Then, recovering, nodding you toward the stool across the table: "Sit, if you're staying. I've got another hour on this one, and it's better company than the silence. The silence in here gets opinions after enough years alone in it."

You sit. The lamp throws its warm circle over both of you and the ruined, patient book between you, and for a while the only sound is the small careful work of putting something back together — the scrape of the bone folder, the soft press of his thumb testing whether the glue's set.

"You were looking for something," he says again, quieter this time, not quite a question. "Did you find it?"

You're not entirely sure yet. You don't leave, and he doesn't ask you to, and somewhere in the hour that follows, watching him work, you realize the shop smells like leather and dust and something warmer underneath — beeswax, maybe, or just the particular smell of a place that's been loved this carefully for this long.

Eventually he sets down his tools, satisfied with the day's progress on the spine, and studies you across the table with an attention that isn't cataloguing anymore, just curiosity, plain and unhidden.

"Most people who wander in here after hours are lost, or looking for the wine bar two doors down that keeps stealing our address," he says. "You didn't look lost. You looked like you knew exactly where you were going and simply hadn't decided if you wanted to arrive yet."

"That's a very specific read on a stranger."

"I read things for a living. Spines, mostly, but the habit doesn't stay confined to books." He says it without arrogance, just fact, the same measured tone he uses for everything. "I'll be honest — I don't often ask people to stay. It disrupts the quiet, and the quiet is usually the whole point of staying open this late."

"And tonight?"

"Tonight the quiet didn't feel like the point anymore." He turns back to the book, but there's the ghost of something unguarded in the admission, like he's surprised it slipped out at all. "Come back tomorrow, if you'd like. I'll have the kettle on. I can't promise the company will be less strange than tonight's, but I can promise it'll be there."

You tell him you might. You both already know that you will.

· · ·

You start finding reasons to walk past after six — a book you didn't need, a question that could've waited — and Julian always seems to know you're at the door before you knock, like the shop tells him, or like he's simply started listening for a particular set of footsteps among all the ones that pass by outside.

"You again," he says, not looking up from whatever he's mending tonight, though there's warmth threaded through the dryness now that wasn't there the first week. "I'm starting to think you don't actually want any of the books you keep asking about."

"Maybe I like the company."

That earns you a proper look — assessing, careful, the same attention he gives a damaged spine before deciding how to save it. "I don't get much of that," he admits, setting down his tools entirely, which you're learning is rare for him. "Company. Most people who like books like them quietly, alone, the way I do. You're the first person who's wanted both the books and the person mending them."

"Is that a bad combination?"

"No." He goes back to his work, but his voice has gone quieter, more deliberate, like he's choosing each word the way he chooses which page to touch first. "It's just not one I expected to want back. I inherited this shop from my grandfather, and for a long time I thought I'd inherited the solitude with it. Wasn't looking for company. Didn't think there was a version of this life that had room for it."

"And now?"

He doesn't answer right away. He picks the brush back up, turns it over once between his fingers, ink staining the pad of his thumb faintly darker. "Now I find myself listening for the door earlier than I used to," he says finally. "Which is either a very good sign or a very inconvenient one, depending on how this goes."

"Which do you think it is?"

"Ask me again once I've decided whether I'm brave enough to find out." But there's the faintest curve at the corner of his mouth when he says it, and he doesn't look away from you nearly as quickly as he did that very first night.

You start noticing the small rituals of the place — the way he always checks the humidity gauge by the door before he lets himself sit down for the night, the way he keeps a chipped teacup on the shelf that clearly isn't for drinking anymore, just for looking at.

"That cup," you say, nodding at it. "Tell me about it."

He follows your gaze, and something in his face goes carefully neutral, the way it does when a subject matters more than he wants to show. "My grandfather's. He drank his tea out of it every single day this shop was open, for forty years, and then one day he didn't, and I couldn't bring myself to use it or throw it away, so it just — stays. Watching."

"That's not morbid. That's sweet."

"He'd have said morbid. He didn't believe in sentiment, only in good binding and strong tea." Julian almost smiles at the memory, turning back to his work. "He'd have liked you, though. He always said the shop would know the right person when they stopped asking what a book was worth and started asking what it meant. You've never once asked me what anything in here costs."

"Should I have?"

"No. That's rather the point." He glances at you, something quietly pleased under the dry delivery. "You're the first person in a long while who's walked in here and looked at the books like they were still alive instead of inventory. My grandfather would have handed you the good chair immediately. I suppose I'm slower to it than he was, but I'm catching up."

"Is this the good chair?"

"It's becoming one," he admits, and for the rest of the evening he keeps finding small excuses to glance over at you from his work, cataloguing you the same unhurried way he catalogues everything else in the shop that he intends to keep.

· · ·

He starts teaching you the mending — clumsy at first, your stitches nowhere near his exacting standard, the thread bunching where it shouldn't, but he's patient in a way that surprises you, hands guiding yours over the needle and thread without any of the impatience you'd expect from someone this precise about everything else in his life.

"You're better at this than you think," he says, close enough now that his voice is nearly at your ear, watching your hands instead of the book. "Careful. That's all it takes. You already have that instinct — most people rush the stitch because they want to see the result. You keep checking. That's the difference between mending something and just patching it."

"You're a good teacher."

"I've never taught anyone before." He says it plainly, like it costs him nothing to admit and everything at once, a small furrow appearing between his brows like he's surprised by his own honesty. "Didn't think I'd want to. Then you kept showing up, and it seemed a waste not to hand over something I actually know how to do — one of the only things I actually know how to do, if I'm being fair to myself." His hand stills over yours on the spine, and for a moment neither of you moves, the lamp humming faintly overhead, dust motes drifting slow through the light. "I don't know what to call this yet. Whatever's happening between the two of us."

"We don't have to name it tonight."

"No," he agrees, quiet, "we don't." But he doesn't move his hand from yours either, not for a long moment, and when he finally does it's slower than it needs to be, his fingers trailing briefly along the edge of yours like he's reluctant to let the contact end. He clears his throat, an oddly boyish sound from someone so composed, and busies himself refolding the drop cloth on the table, a task that clearly doesn't need doing.

"For what it's worth," he adds, not looking at you, "I like not knowing what to call it. It's the first uncatalogued thing I've had in this shop in years. Everything else in here has a shelf number."

"And I don't?"

"You," he says, finally looking up, something unguarded flickering behind the wire rims of his glasses, "are the one thing in this entire shop I haven't figured out how to file. I've stopped trying, if I'm honest. Some things are better left unsorted."

The lesson stretches longer than either of you probably intends, the two of you bent together over the same ruined spine until the light outside has gone from dusk to full dark and neither of you has thought to turn on another lamp. At some point he stops correcting your stitches at all and just watches you work, arms crossed loosely, something almost fond in the set of his mouth.

"You're not paying attention to the book anymore," you say, without looking up.

"No," he agrees, unbothered at being caught. "I find I've developed a competing interest."

"That's very smooth, for a man who claims he's never taught anyone anything."

"I didn't say I was smooth. I said I was honest. There's a difference, and I've found honesty tends to work better with you than any of the smoother lines I might have tried and immediately regretted." He picks the thread back up, if only to have something to do with his hands, though you both know the mending's the last thing on his mind now. "I used to think this shop was the only thing I was any good at keeping. Books don't ask for much. Steady temperature, careful hands, the occasional new binding. People are considerably more complicated to keep."

"Are you trying to keep me, Julian?"

He goes very still at that, the needle paused mid-stitch, and when he answers it's without his usual deflection. "Yes," he says. "I believe I am. I'd apologize for how plainly that came out, except I don't think you'd want the polished version any more than I'd trust myself to deliver it."

"I don't want the polished version."

"Good," he says, quiet, and for a moment his hand covers yours on the table again, not guiding this time, just resting there, like he's simply decided he'd rather it stayed.

· · ·

One evening he doesn't have a book waiting at all — just the lamp on, the shop quiet, him standing at the worktable like he's been rehearsing something and lost his nerve halfway through, hands clasped behind his back in a way that looks almost formal, almost like he's steadying himself against something.

"I wanted to tell you something," he says, ink-stained fingers restless against the table's edge, an uncharacteristic nervousness cracking his usual composure. "I'm not good at this. Saying things instead of restoring them. Give me a damaged spine and I know exactly what to do with my hands. Give me this, and I've been standing here for ten minutes trying to find the right first sentence."

"Start anywhere. I'm not going anywhere."

That seems to steady him, just slightly. "I think I've been slower than I should've been to admit I don't want you just visiting the shop," he says. "I want you here. Not as a customer, not as someone who wandered in looking for a title she can't quite remember. I want you here the way the lamp is here, or the towers are here — permanently, and past the point where I could imagine the place without you in it."

"Julian—"

"Let me finish, I've been building up to this for weeks, and if I stop now I don't know that I'll manage it again." A breath, and then, quieter, more himself again: "Everything falls apart eventually. I told you that, about the book, the first night you sat there. I don't think that has to be true for this. I've spent years mending things other people gave up on, and I never once thought to ask whether the same care might apply to something of my own." His hand finds your face, careful, deliberate, the same gentleness he gives every ruined thing he's decided is worth saving. "Tell me if I'm wrong to hope it isn't true here."

You're not wrong to hope. You tell him so, plainly, and then show him besides, and the shop holds its breath around you both, towers of books standing patient witness to the first thing Julian has built instead of restored in longer than either of you will ever need to count.

Afterward, he doesn't let go of your hand, not to fetch tea, not to tidy the table, not even when a stack of ledgers slides half an inch and would ordinarily have him up and straightening it within seconds. He just sits there in the lamplight, looking almost stunned by his own nerve.

"I rehearsed that entire speech at least a dozen times," he admits. "In the mirror, if you can believe it. Terribly undignified. I kept getting to 'I want you here' and losing my nerve, so I'd start over from the beginning."

"How many times did you get through it in the mirror before tonight?"

"Never all the way. Tonight was the first time I made it to the end without stopping." He laughs, short and a little disbelieving at himself, running a hand back through his hair, dislodging the glasses he'd forgotten were still pushed up into it. "I don't know why it felt so impossible. I restore things that have been broken for a hundred years without flinching. Apparently telling you how I felt was a different category of difficult entirely."

"I'm glad you got through it."

"So am I. I was beginning to think I'd have to just keep leaving books unfinished on the table as some sort of elaborate hint." He finally sets the glasses properly back on his nose, looking at you now with the same slow, thorough attention he gave that very first ruined spine, except there's nothing to fix here, only something he intends to keep exactly as it is. "For the record, this is considerably better than any hint I might have managed."

"You'd have gotten there eventually."

"Eventually," he agrees. "I'm not always quick. But I am, if nothing else, thorough."

· · ·

Months later, the back room's got a second chair permanently pulled up to the worktable, worn into the same soft shape as his own from all the evenings you've spent in it, and the shop doesn't close at six anymore, not really — not since you started staying, not since the sign in the window became more of a suggestion than a rule, much like the lantern that first drew you in.

"You found what you were looking for," he says one night, echoing that very first evening, not quite a question this time either, setting down a book he's long since finished restoring just to have a reason to look at you properly. "I asked you that the first night. You didn't have an answer."

"I do now."

"Good." He sets down whatever he's mending, unhurried, and pulls you into the warm circle of lamplight properly, no book between you this time, nothing between you at all except the small distance he closes without hesitation now, a habit he's built as carefully as any spine he's ever repaired. "So did I, for what it's worth. Took me long enough to admit the thing I found wasn't in any of these towers." His mouth finds yours, slow and certain, the whole quiet shop witness to it, the dust motes still drifting through lamp-light like they, too, have nowhere better to be. "It was you, the whole time. Just took a broken spine or two to notice, and a lot longer than I'd like to admit to say so out loud."

"You always did work slowly."

"Carefully," he corrects, though he's smiling now, unguarded in a way the first-week version of him would hardly recognize. "There's a difference. Rushed mending falls apart again within the year. I wanted this one to hold." He tips your chin up with one ink-stained finger, unhurried as ever, and kisses you again like he has all the time left in the world to get it exactly right — which, at last, he does.

Later, with the lamp turned low and your feet tucked up on the second chair beside his, he pulls the old chipped teacup down from its shelf for the first time in longer than he can probably remember, and fills it with something warm from the little kettle he keeps for himself in the back.

"I want you to have this," he says, setting it in front of you, a small, uncharacteristic vulnerability in the offer. "It's foolish, I know. It's just a cup."

"It's not just a cup, and you know it."

"No," he admits. "It isn't. My grandfather kept this shop for forty years and never once thought to share the good cup with anyone but himself. I think he'd understand why I'm breaking the rule now." He sits back, watching you drink from it with an attention that's gentler than any he's given a damaged spine, softer than any he's given the towers of books that used to be the only thing in this room worth his focus. "I used to think the shop was the whole of what I had to offer someone. It turns out it was only ever the frame. You're the part I didn't know how to restore until you walked in and did it yourself."

"That's the most romantic thing you've ever said to me."

"Don't get used to it. I have a limited supply, and I intend to ration it very carefully, the way I ration everything." But he's laughing when he says it, low and unguarded, and he pulls you in against his side with the same steady, deliberate care he brings to everything he's ever decided is worth keeping — which, you both understand now, without needing to say it again, is exactly what you are.`,
  },
  {
    character: "Ezra",
    title: "Past the First Verse",
    setting: "a tour bus parked by a lake at dusk, guitar case open",
    genre: "romance",
    tone: "easygoing",
    content: `The bus is parked at the edge of a lake nobody bothered naming on the map, engine off, tires still ticking faintly as they cool, the rest of the band off somewhere finding food, and Ezra's sitting on the fold-down step with a guitar he's not really playing — just resting his hand on the strings, like he hasn't decided yet whether tonight's a playing kind of night. Dusk is doing something slow and orange to the water, and the only sounds are crickets starting up somewhere in the reeds and the faint tick of the engine block settling.

"Careful," he says, when you sit down next to him, not looking over yet. "I only play the good songs for people who stick around past the first verse."

"Is that a rule, or a threat?"

"Bit of both." Now he looks over, and the easy grin is there, but there's something underneath it too — a little more careful than the grin lets on, like he's testing the ground before he puts his full weight on it. "Most people clear out after the opener. Say they've got somewhere to be. It's fine. I get it." A shrug, the kind that pretends not to mean anything. "Just means I don't waste the good ones on people who won't hear how they end. Learned that the expensive way, touring enough green rooms full of people who wanted the version of me that fit on a poster."

The lake's gone orange and still with the last of the light, and somewhere behind you the rest of the band is a laugh track you can hear but not make out, distant enough not to matter. Ezra picks at the strings without really starting anything, testing the quiet like he's deciding if it can hold a song yet, his thumb finding the low string over and over in a small, absent rhythm.

"So play one," you say. "The good kind. I'm not going anywhere."

"That's what they all say."

"Am I them?"

That gets him — a real laugh, surprised out of him, the guard slipping for just a second before the grin patches it back over. "No," he says, quieter now, and means it in a way the first version of the sentence didn't. "Guess you're not. Most people who say that are already halfway to the door in their head. You're just sitting there. Which is either patience or you don't know yet how boring I get once the good songs run out."

"I'll take my chances."

He starts to play. It's slow, unpolished in the way things are before they're finished, the kind of song you can tell he hasn't decided the ending to yet either, chords resolving somewhere they probably shouldn't and sounding right anyway. He doesn't watch his hands. He watches you, testing whether you're the kind who leaves at the first verse, and when you don't, something in his shoulders comes down that you don't think he noticed was up in the first place — a whole tour's worth of careful distance, easing loose one bar at a time.

"Told you," he says, low, still playing. "The good ones are worth the wait."

You believe him. The lake keeps its orange a little longer than it should, like it's willing to stick around too, and somewhere in the unfinished bridge of the song Ezra stops performing entirely and just plays, unguarded, like he forgot for a moment that anyone was listening at all — which might be the realest thing you've seen him do since you sat down.

When the song winds down, he lets the last chord ring out over the water instead of cutting it short, watching the ripples the sound seems to leave behind. "Most nights I play until somebody claps, then I stop," he says. "Habit from small rooms where the applause is the only way to know you did something right."

"Did I not clap enough?"

"You didn't clap at all. You just watched." He says it like it's a discovery, not a complaint. "Nobody does that. Even people who like you clap eventually, out of politeness if nothing else. You just sat there like the song itself was the whole point and the ending didn't need marking."

"Maybe it didn't."

That gets a slow, real smile out of him, the kind that takes its time arriving. "Careful. Keep talking like that and I'll start writing better songs just to see if you'll sit still for all of them." He sets the guitar down across his knees, finally looking at you instead of the lake. "Where'd you even come from tonight? Nobody just wanders up to a broken-down tour bus by a lake with no name."

"I heard there was music."

"There's music everywhere. You came looking for this music, specifically." He says it plainly, no smugness in it, just an observation he seems genuinely curious about. "I'm trying to figure out if that's luck or if you've got better instincts than most people who find me."

"Maybe both."

"Yeah," he says, quiet, looking back out at the water like the answer satisfies something in him. "Maybe both."

· · ·

You catch the next few shows without meaning to turn it into a habit, and Ezra always finds you in the crowd before the first song's over — a quick look, barely a beat, but enough that you know he's tracking you the way he tracks the setlist, checking in like a musician checks his own tuning between songs, out of habit as much as need.

"You keep showing up," he says backstage after, guitar case in one hand, sweat still cooling on his collar, voice a little rough from an hour of singing over amps. "I'm starting to wonder if it's the music or something else."

"Can't it be both?"

"Sure." He says it easy, but there's something more careful underneath the ease, the same guard you caught slipping that first night by the lake. "I don't usually let it be both. Music's safe. People leave after the encore either way, and I never have to find out if they'd have stuck around for the actual me, off the stage, out of the lights." A pause, like he's deciding whether to say the next part. "You don't leave after the encore, though. You linger by the merch table pretending to look at t-shirts you have no intention of buying."

"Caught."

"Completely caught. I clocked it the second show." He laughs, rubbing the back of his neck, something almost shy in it despite the easy delivery. "Do you want me to?"

"No," you say, matching his own line back at him. "That's the problem. I really don't."

That earns you the real smile this time, the one that doesn't come with a wink attached, and he shoulders his guitar case a little differently, like the weight of it's suddenly easier to carry with you standing there. "Come find me after the last song next time," he says. "Not the merch table. Actually find me. I'll leave you a name at the door."

"Very rockstar of you."

"Don't get used to it. I don't do this for just anybody." He says it lightly, but you both hear the truth underneath the joke, and neither of you comments on it, though it sits warm between you the whole walk back to the bus.

You do find him after the next show, the way he asked, past the merch table and through a door someone waves you through once they see your name on his list. He's sitting on an overturned equipment case, guitar across his knees though the show's already over, wringing a towel around his neck.

"You actually came back here," he says, sounding almost surprised by his own request being honored. "Half the time I leave a name at the door and nobody claims it. People get shy, or they change their mind, or they decide the idea of me is better than the sweaty reality of me twenty minutes after a set."

"I'm not most people."

"Yeah, I'm starting to gather that." He pats the case beside him, and you sit, close enough that you can feel the leftover heat still coming off him from the stage lights. "Can I tell you something kind of embarrassing?"

"Always."

"I used to watch the door instead of the crowd, during the second half of sets. Bad habit. Makes me miss my own cues sometimes." He rubs at the back of his neck, a little sheepish. "Started doing it the second show you came to. Kept checking if you were still there."

"Was I?"

"Every time." He laughs, short and a little disbelieving at his own admission, guitar case creaking as he shifts his weight. "I don't know what to do with that, honestly. I've spent a long time making sure nobody gets close enough to notice if they leave. You're making that a lot harder to keep up."

"Is that a complaint?"

"No," he says, immediate, certain. "That's the opposite of a complaint. I just don't have a script for it yet."

· · ·

The bus breaks down outside some town neither of you catches the name of, and while the rest of the band argues with a mechanic under the hood, Ezra pulls out the guitar again, nodding you toward the same fold-down step like it's tradition now, worn into a shape the two of you already fit.

"This one's not finished," he warns, tuning a string that doesn't need it, buying himself a second to work up the nerve. "Might never be. I've been sitting on it a while — longer than I've sat on any song, actually, which either means it's good or means I'm scared of it."

"Play it anyway."

He does — rougher than the polished stuff from the actual sets, more honest for it, his voice cracking slightly on a high note he doesn't bother smoothing over, and partway through he stumbles on a line and just stops, embarrassed in a way that doesn't suit his usual ease, guitar held loose and forgotten against his knee.

"Sorry. I don't usually play the unfinished ones for people. There's a reason for that. They're not safe yet. Unfinished songs tell on you."

"Why me, then?"

He looks at you for a long moment, guard fully down now, no grin left to patch anything over, just something quiet and a little scared in his face that you've never seen up on any stage. "Because you're the first person who made me want to finish it instead of leaving it half-done," he says. "Scares me a little, if I'm honest. I've got a whole drawer of half-finished songs I never touch again once they start meaning something. This one I keep coming back to."

"Good scared, or bad scared?"

"Ask me again once I know the ending." But his hand finds yours on the step, and he doesn't let go for the rest of the night, not even when the mechanic finally slams the hood shut and the rest of the band comes wandering back, not even when someone calls his name and he has to answer with his fingers still laced through yours, thumb tracing slow absent circles against your knuckles the whole time he talks.

Later, once the bus is running again and everyone else has drifted off to their bunks, Ezra stays up front with you, guitar case shut now but within easy reach, like he might change his mind about that unfinished song before the night's over.

"I've never let anyone hear the drawer songs," he says, apropos of nothing, staring out at the dark road unspooling past the windshield. "Not even the band. They know the ones that make the set list. They don't know about the ones that don't."

"Why not?"

"Because the ones that make the set list are safe. Crowd likes them, I know exactly what they're going to feel like before I even play the first chord." He taps a rhythm against his knee, thinking. "The drawer songs are the ones I actually meant. Nobody's supposed to hear those until I've decided they're finished, and I've gotten real good at deciding they're never finished, so nobody ever has to hear them at all."

"Except me."

"Except you." He looks over at you now, something quiet and unguarded in it. "I don't fully understand why. I just know I wanted you to hear it more than I wanted to protect it. That's new. Usually it's the other way around."

"Maybe that means something."

"Yeah," he says, low, and doesn't let go of your hand even when the bus hits a rough patch of road and everything else in the cabin rattles. "Maybe it does."

· · ·

He finishes the song eventually — plays it for you first, before the band, before anyone, one quiet night with the tour bus dark behind you both and the stars doing more work than the moon, the guitar case propped open beside him like it's finally allowed to be finished.

"It's about you," he admits, before you can ask, sandy hair falling into his eyes as he watches your reaction more than his own hands, fingers finding the chords without needing to look at them anymore. "Wasn't going to tell you that. Guess I'm telling you anyway. Figured if I was going to finally finish it, you deserved to know why it took this long."

"Ezra—"

"I know. Cheesy. Musician falls for the girl who stuck around past the first verse, writes a song about it." He's deflecting, but softer than his usual deflection, more honest underneath it, the joke doing less work than it usually does to cover for him. "I don't care that it's cheesy. It's true. Every unfinished draft I ever wrote before this one was about someone I was trying to convince myself I felt something for. This is the first one where I didn't have to convince myself of anything. It just came out finished, once I let it."

"That might be the most honest thing you've ever said to me."

"Don't tell the rest of the band. I've got a reputation to protect." But he's not really joking, not entirely, and when he finally looks up from the strings there's nothing guarded left in his face at all.

You kiss him before he can talk himself out of the moment, and he makes a low, surprised sound against your mouth like he wasn't expecting you to be the one who closed the distance first. The guitar ends up forgotten on the ground between you both, strings humming faintly with the impact, and neither of you moves to pick it back up for a long, long while.

When you finally do break apart, he's grinning in a way you haven't seen on him before, something unguarded and a little dazed underneath the usual easy charm. "Okay," he says, mostly to himself. "Okay, that's — I had a whole plan for what I was going to say after you heard the song. Completely useless now. You just skipped past the entire speech."

"Was it a good speech?"

"Terrible, actually. I wrote it on a napkin backstage two cities ago and it rhymed 'verse' with 'universe,' which I want you to know I'm deeply ashamed of." He laughs, dragging a hand back through his hair, sandy strands falling right back into his eyes. "I've been carrying it around for a week trying to work up the nerve to say any of it. Should've just let you kiss me first. Would've saved me a lot of stress."

"I can still hear the speech, if you want to redeem it."

"Absolutely not. That napkin is staying exactly where I hid it, which is nowhere you'll ever find it." He picks the guitar back up off the ground, checking it over with a mix of real concern and obvious relief that it's unharmed, then sets it properly in its case at last, latches clicking shut with a kind of finality. "I think that's the first time I've put this thing away and actually meant it. Usually there's one more song in me. Tonight there isn't. Tonight there's just you."

"That might be the most romantic thing you've ever said."

"Don't let it go to your head. I'll deny it in the morning." But he pulls you back against him anyway, chin resting on the top of your head, and neither of you says anything else for a long while, the stars overhead doing exactly as much work as they did the first night, except now there's nothing unfinished left standing between you.

· · ·

Months later, you've got a permanent seat on the bus, worn into the upholstery same as everyone else's, and the unfinished song's become the closer at every show — the one the crowd asks for by name now, the one that's stopped being unfinished at all, that's got a title and a bridge and an ending everyone in the room seems to know by heart except, somehow, you're the only one who knows what it actually means.

"Guess I owe you," he says, one dusk not unlike the first, guitar case open beside the same fold-down step, lake or no lake depending on the city, the same crickets starting up somewhere new every night but sounding, to you both, exactly the same. "Wrote a whole song because you didn't leave after the first verse. Feels only fair I stick around for all of yours too."

"That an offer?"

"That's a promise." He sets the guitar carefully aside, and for once doesn't reach for it again right away, which from Ezra is its own kind of vow. "I used to think the good songs were the safest thing I had — easier to hand out than the actual truth. Turns out the truth's better once you find someone worth telling it to."

"You've gotten sappy."

"Touring does that. Or you do that. Hard to tell the difference anymore, and I've stopped trying to." He pulls you into his lap instead of just beside him this time, nothing careful left in the way he looks at you, guitar forgotten against the step where it can wait all night if it has to. "The good ones are worth the wait, remember? Turns out you were the best one I ever played for. Every show after you found me in that crowd, I've been playing them a little bit for you, whether you were even in the room or not."

"That's not fair. I wasn't always there."

"Didn't matter. I always knew you'd hear it eventually." He kisses your temple, unhurried, the lake or the city lights or whatever backdrop tonight's parked in front of glowing soft and steady behind you both, in absolutely no hurry for the night, or anything after it, to end.

The rest of the band's given up teasing you both about it, mostly, though the drummer still makes kissing noises every time the closer starts and Ezra still flips him off without missing a chord. It's become its own kind of ritual, the whole tour rearranging itself gently around the fact of you the way it once rearranged itself around setlists and soundchecks.

"You know what's strange," Ezra says, tuning a string that's already in tune, an old habit that's really just an excuse to keep his hands busy while he works up to something. "I used to think the road was the only thing I was ever going to be faithful to. Bandmates come and go, cities blur together, but the road's always there. Steady, in its own chaotic way."

"And now?"

"Now the road's still there, but it's not the thing I look forward to anymore. You are. I get to the venue and the first thing I do isn't check the setlist, it's check if you made it in okay." He shakes his head at himself, half laughing. "Never thought I'd say that about anyone. Figured I was built for choruses, not for sticking around long enough to learn somebody's whole song."

"Turns out you know a few now."

"Turns out I know all of yours, actually. Every verse." He sets the guitar in its case, latches it, and pulls you in properly, forehead resting against yours, voice dropping low enough that it's just for you, not for the crowd, not for the band, not for anyone else who might be listening past the treeline. "Best seat in the house was always going to end up being wherever you were sitting. Took me an entire drawer full of unfinished songs to figure that out. Worth every single one of them, if it got me here."`,
  },
  {
    character: "Wren",
    title: "The Buzz of the Needle",
    setting: "a late-night tattoo parlor, neon sign buzzing outside, autoclave humming",
    genre: "romance",
    tone: "edgy",
    content: `The shop's technically closed — sign off, gate half down — but the neon in the window's still buzzing pink over the empty chair, and Wren's cleaning her station with the unhurried thoroughness of someone who isn't actually in a hurry to lock up, wiping down surfaces that are already clean, restacking supplies that don't need restacking. The street outside is quiet enough that you can hear the neon's faint electric hum along with the machine idling on her tray.

"Hold still," she says, without turning around, catching your reflection in the mirror over her station. "I'm not tattooing you. I just like watching people react to the buzz."

Somewhere behind her, the machine's still plugged in, needle bar idling with a sound like an angry hornet in a jar. You didn't flinch. She notices that you didn't.

"Most people flinch," she says, turning now, wiping ink off her knuckles with a rag that's seen better decades. "It's involuntary. Doesn't mean anything about how tough you are, just means your nervous system's doing its job — some primal little alarm bell going off, telling you something sharp is close." A pause, appraising, the kind of look she probably gives a blank patch of skin before she commits ink to it, slow and assessing, cataloguing something about the set of your shoulders, the way you're standing your ground instead of hovering by the door. "You didn't, though."

"Should I have?"

"No. I liked it better this way." She flips the machine off, and the shop goes quiet except for the hum of the sign outside, pink light sliding across the walls in slow pulses, catching on the chrome of her station, the glass jars of colored ink lined up like a spectrum somebody forgot to finish sorting. "Sit. Not for a tattoo. Just sit, the chair's more comfortable than it looks and I'm not done finishing this line work in my head."

You sit. Above the station, the flash sheets are all her own design — swallows, daggers, a moon in six different phases, roses rendered in a dozen different stages of bloom and decay — and she catches you looking.

"That one." She nods at the moon. "Took me four tries to get the shading right. Everyone wants the moon and nobody wants to pay for how long it actually takes to make it look like it's glowing from the inside. They want the shortcut version, three lines and a crescent, done in twenty minutes. I don't do the shortcut version if I can help it."

"Do you ever get tired of people wanting the easy version of things?"

That earns you a real look — assessing, like she's deciding whether you actually meant that or just said something to sound clever. Whatever she decides, it lands in your favor; the smirk that follows is softer than the ones that came before, something almost surprised living underneath it.

"Sometimes," she says. "Not tonight, though." She nods at the empty chair beside her station, an invitation dressed up as an order, same as always. "Stay a while. I don't let just anyone watch me clean my station. Feel special."

You do, and you tell her so, and that gets an actual laugh out of her — short, a little rusty, like she doesn't use it often enough to have it fully broken in. She goes back to wiping down the counter, though slower now, in no real rush to finish the task that was only ever an excuse to keep her hands busy while she decided what to make of you sitting there.

"You're not what I expected," she says eventually, not looking up.

"What did you expect?"

"Honestly? Someone who'd get bored after five minutes of watching me do nothing interesting. Most people need constant entertainment or they wander off." She sets the rag down at last, actually looks at you properly, ink-dark eyes unreadable in the pink light. "You're just sitting there. Content. It's unsettling. I don't know what to do with content."

"You could try sitting still too."

"I could." She doesn't, not yet, but something in her posture eases anyway, the coiled readiness of her going a little looser, like your being there has already started rearranging something in the room.

· · ·

You start showing up on her late nights, no appointment, just to sit in the chair that isn't for tattooing and watch her work through her sketchbook. Wren never questions it — just clears a space at her station like she'd been expecting you, an extra stool appearing from the back room without either of you discussing it.

"You're becoming a fixture," she says, one night, not looking up from a line she's redrawing for the fifth time, pencil scratching soft against the paper. "I don't usually let fixtures happen. Bad for business, worse for my personal space."

"Am I bad for business?"

"You're bad for my personal space." But she says it warm, a smirk tugging at her mouth despite herself, and she doesn't stop sketching, doesn't ask you to leave, doesn't do any of the things someone actually bothered by your presence would do. "I keep sketching things I wouldn't normally sketch when you're sitting there. Softer stuff. I blame you for that."

"Is that an insult?"

"It's a fact." She sets the pencil down, actually looks at you now, something more honest under the usual edge. "I don't do soft. Never have. My whole reputation's built on the opposite — sharp lines, bold color, nothing delicate enough to blur if somebody bumps into you on the street ten years from now. You're making me reconsider that policy, and I don't love how easy you're making it look."

"Maybe soft isn't the weakness you think it is."

"Careful. That's the kind of thing people say right before I actually start believing it." She flips the sketchbook around so you can see — a rough outline of something that isn't a swallow or a dagger, something rounder, gentler, half-formed on the page like she hasn't decided if she's brave enough to finish it. "This one's new. Wasn't going to show anyone. Guess you're the exception tonight."

"What is it?"

"Not sure yet. It wants to be something soft. I'm still arguing with it." She closes the sketchbook before you can look closer, a flicker of something bashful crossing her face that looks entirely foreign on her. "Don't get used to seeing the drafts. This was a one-time thing."

"Sure it was."

"Shut up," she says, without any real heat in it, and goes back to her station, though the corner of her mouth stays curved for the rest of the night.

You ask her, eventually, how she got into this — the shop, the needle, the whole steady discipline of it — and she considers the question longer than you expect, like it's not one people usually bother asking past the surface version.

"My mom hated it," she says. "Thought it was a waste of whatever talent I had. I was good at drawing, real drawing, the kind that gets you into a decent art program if you want it. She wanted me to want that." She traces an old scar along her knuckle, absent, the kind of gesture that looks like it's older than the memory itself. "I wanted something that stayed. Something somebody carried around with them after they walked out the door instead of hanging it in a closet and forgetting about it in a year."

"Does that still matter to you? People carrying it around?"

"More than I usually admit." She glances at you, something quieter in her expression than the smirk she usually wears like a first line of defense. "Every piece I do, somebody's going to have it longer than they have most of the people currently in their life. That's not nothing. I take that seriously, even when I'm being an ass about the small talk."

"You're not being an ass right now."

"Give it time." But there's no edge in it, just habit, and she goes back to the sketchbook, flipping past the soft unfinished draft to something safer, though you both know exactly what page she skipped.

· · ·

She offers to tattoo you for real one night — first time, no charge, her treat — and the whole ritual of it turns quieter than either of you expected: her steadying your arm, gloved hands careful despite the buzz of the machine, an intimacy in it that has nothing to do with the ink and everything to do with how close she's sitting, how her breath falls into an easy rhythm with the machine's hum, how she keeps checking your face between passes without seeming to realize she's doing it.

"You're not flinching again," she murmurs, focused, closer to you now than any customer ever gets, the tip of her tongue caught briefly between her teeth in concentration. "Starting to think you just don't flinch for anything."

"Maybe I trust you."

That stills her hand for half a second — just half a second, needle lifted, her eyes flicking up to yours with something unguarded flickering through the usual smirk. "Don't say things like that while I've got a needle near your skin," she says, low. "Messes with my focus. I've been doing this ten years, never messed up a line because somebody said something nice to me mid-session. Don't want tonight to be the first time."

"Noted." But you don't take it back, and she doesn't ask you to.

She works in silence for a while after that, the needle's buzz the only sound, her focus narrowed down to the careful geometry of the line she's laying into your skin. When she finally sits back to check her work, there's something almost reverent in how she studies it, tilting your arm gently under the light.

"You know most people talk through the whole session," she says. "Nervous energy, I guess, or they think silence means something's wrong. You just let me work."

"Didn't think I needed to fill it."

"You didn't." She sets the machine down, peels her gloves off slow, considering you in a way that feels heavier than it should for a conversation about tattoo etiquette. "I like that you didn't. Most of what I do, people don't actually see. They see the finished piece. You've been watching the whole process, and you haven't looked bored once."

"It's not boring. It's kind of beautiful, actually. Watching you concentrate like that."

Her ears go faintly red at that, an expression she clearly wasn't prepared to make, and she busies herself prepping the bandage instead of responding right away, though the smirk that eventually surfaces is softer than any you've seen from her yet.

"Nobody's ever called what I do beautiful," she says finally, taping the gauze down with more care than the task strictly requires. "Cool, sure. Badass, occasionally, usually from guys trying to impress their friends. Beautiful's a new one."

"Does it not fit?"

"I don't know yet. I'm trying it on." She sits back, studying you instead of the tattoo now, arms crossed loosely over her knees. "Most people who watch me work are watching the result. The lines, the shading, whether it's going to look good in ten years. You're watching me. That's different. I don't know what to do with being watched like that."

"Bad different?"

"No." She says it fast, immediate, no hesitation at all. "Just unfamiliar. I built this whole persona on being the one doing the looking — assessing people, deciding what they can handle, staying two steps ahead of whatever they think they know about me. Nobody usually gets to sit there and just take me in without me controlling exactly how much of myself I hand over."

"I'm not trying to take anything you're not giving."

"I know." Something in her posture eases at that, shoulders dropping half an inch. "That's actually the problem. You're not trying to take anything, and I keep handing it over anyway. Wasn't planning on that happening tonight."

"Regretting it?"

"Ask me tomorrow." But she's smiling when she says it, and she doesn't look away from you again for the rest of the session, gloves off now, the machine long since powered down and forgotten on the tray between you.

· · ·

The tattoo finishes clean, and she wraps it with a gentleness that doesn't match the edge she wears like armor everywhere else — careful, thorough, lingering a beat longer than the bandage requires, her thumb smoothing the tape down twice, three times, like she's not quite ready to stop touching you yet.

"First one's free," she says, voice rougher than usual. "Second one, I charge double. For emotional damages." She says it like a joke, but there's real nervousness underneath it, rare and unfamiliar on her face, her usual composure cracking at the edges in a way you've never seen. "I don't know what to do with wanting someone this much, if I'm honest. Not really in my skill set. I'm good at wanting things I can hold at arm's length. You're not one of those things anymore, and I noticed that a while ago and didn't know how to say it."

"You seem to be managing."

"Barely." She laughs, short and surprised at herself, setting the last of her supplies aside without really looking at what she's doing. "I've spent ten years building a reputation on not needing anybody's approval, not flinching, not softening for anyone who walks through that door. And then you sat in my chair the first night and didn't flinch either, and somehow that undid me faster than anything else could have."

"Is that a bad thing?"

"I don't know yet. Ask me in five minutes." But she closes the last of the distance between you — no smirk this time, no armor, just her, steady hands finding your jaw instead of a tattoo machine. When she kisses you it's slower than you expected from someone who moves through everything else so fast, deliberate in a way that undoes you, like she's decided that whatever this is, it deserves the same careful attention she gives her best linework.

When she finally pulls back, she looks almost stunned by herself. "Okay," she breathes. "Five minutes in, and it's not a bad thing at all."

She doesn't let go of you right away, forehead resting against yours, breath still a little uneven from the kiss, from the whole evening of careful hands and careful confessions. "I need you to know this isn't a thing I do," she says, quiet, serious in a way that's rare for her. "Kissing clients. Kissing anybody who sits in that chair, honestly. There's a reason I keep it professional in here."

"I noticed you broke your own rule."

"I noticed too. Wasn't planning on it." She pulls back enough to look at you properly, something vulnerable working underneath the usual sharpness. "I've had people flirt with me across that station for years. Doesn't do anything. I've got a whole set of defenses built specifically for that scenario. You didn't even try, and somehow that's what got past all of it."

"Maybe defenses built for flirting don't work against someone who's just being honest."

"Yeah." She laughs, short, a little disbelieving at herself. "That tracks. I never accounted for honest. Didn't think I'd need to." She glances down at the fresh bandage on your arm, then back up at you, something soft and a little wondering in her expression. "You've got my actual work under that gauze now. Something I made, that's going to stay on your skin longer than most people stay in my life. That's not a small thing, to me."

"I know it's not."

"Good." She kisses you again, slower this time, less startled by herself, like she's decided to actually let this happen instead of just reacting to it. "Guess I owe you a second one for free too, at this rate. Emotional damages go both ways."

· · ·

Months later, the chair beside her station's got your name half-joked onto a strip of masking tape, and the flash sheets on the wall have a new one now — not swallows or daggers, something softer, unmistakably drawn with you in mind though she'll never fully admit it, a pair of hands cradling something small and lit from within.

"I don't do soft," she says again, echoing herself, tracing the new design with an ink-stained finger. "Turns out that was never quite true. Just needed the right person sitting in my chair, patient enough to wait out the flinch I never actually had."

"Feel special?" you ask, throwing her own line back at her.

"Shut up." But she's grinning when she says it, pulling you in by the collar of your jacket, no edge left in it at all — just her, entirely undone by you, exactly the way she swore she never let anyone manage. "You know what the worst part is? I used to think being tough meant nobody got close enough to matter. Turns out it just meant I hadn't met you yet."

"That's almost sentimental, for you."

"Don't tell my clients. I've got a reputation." She kisses you again, quick and certain this time, then nods at the new flash sheet on the wall, the soft one she still hasn't fully admitted to drawing for you. "Figure I'll finally hang that one up front where people can see it. Enough hiding the soft stuff in drawers. You cured me of that, apparently."

"High praise, from someone who charges double for emotional damages."

"Special discount rate for you. Lifetime customer." She presses her forehead to yours, the neon sign still buzzing pink outside the window same as that very first night, except now there's nothing between the two of you but the steady, unhurried hum of it.

She glances toward the flash sheets again, toward the space she's already cleared for the soft new one, front and center where every walk-in will see it before they even sit down. "You know what scares me a little," she admits, quieter now. "Everyone who comes in here is going to ask about that piece eventually. And I'm going to have to explain it, or lie badly about it, and I've never been great at lying about things that actually matter."

"So don't lie."

"That's the plan, actually. Radical, for me." She laughs, low, and leans into you, the tension she usually carries in her shoulders entirely gone now, worn away by months of you sitting in that chair not flinching at anything. "Ten years I told myself soft didn't sell, didn't suit the brand, didn't suit me. Turns out I just hadn't met the person worth being soft for yet."

"And now you have."

"And now I have." She kisses your jaw, unhurried, the machine silent on the tray, the whole shop quiet except for the two of you and the neon's steady electric hum. "Best decision I ever made was letting you sit in that chair the first night instead of kicking you out for interrupting my closing routine. Would've missed out on all of this if I had."

"You almost did kick me out?"

"Considered it for about four seconds. Then you didn't flinch at the machine, and I got curious." She smirks, but it's warm now, entirely hers to give freely. "Best four seconds of indecision I ever had."

She pulls the sketchbook out one more time, flipping to a fresh page, and starts drawing without really announcing it, the way she always does when something's occurred to her that she isn't ready to explain yet. You watch her work in the pink neon light, the same as that very first night, except now you know exactly what she looks like when she's decided to let someone see the process instead of just the result.

"What's this one?" you ask, after a while, when the shape starts to resemble something.

"Not telling you yet. Consider it a preview of the next soft one." She doesn't look up, focused, tongue between her teeth the way it gets when she's chasing a line she likes. "Might take me a few tries to get the shading right. Like the moon. Some things are worth the extra tries."

"Is it about me?"

"Everything I draw lately is about you, somehow. I've stopped fighting it." She glances up at last, pencil still moving on its own like her hand's memorized the shape without her attention. "Feel special yet?"

"Every single time you say that."

"Good. Keep feeling it." She sets the pencil down long enough to kiss you again, unhurried, certain, and then goes right back to the sketch, content to let the night stretch on exactly as long as it wants to, the two of you tucked into the small warm circle of her station while the neon outside keeps its steady, patient pulse against the glass.`,
  },
  {
    character: "Iris",
    title: "The Delphiniums Are Dramatic",
    setting: "a small flower shop at closing time, rain outside, buckets of blooms",
    genre: "romance",
    tone: "gentle",
    content: `The bell over the door is louder than you mean it to be, and Iris looks up from the bucket of delphiniums she's trimming with the particular alarm of someone whose flowers just got startled on her behalf, shears paused mid-snip, a stem half-trimmed in her hand.

"Careful with that door," she says, though she's already smiling. "You'll startle the delphiniums. They're dramatic enough without you sneaking up on them."

Outside, the rain's coming down steady against the shop window, blurring the streetlights into soft smears of gold. Inside, it smells like wet stems and something sweeter underneath — the roses, maybe, or the eucalyptus bundled by the register, or the faint green smell of cut stems that clings to everything in a shop like this. Iris goes back to her trimming, unhurried, like closing up can wait as long as it needs to, sleeves pushed to her elbows, a smear of soil along one wrist she doesn't seem to notice or mind.

"Do they actually startle?" you ask. "The flowers."

"No. But I like to imagine they do. Makes the job less lonely, pretending they've got opinions about who walks in." She snips another stem, sets it aside with the gentleness of someone handling something that matters more to her than she'd probably admit out loud. "This one's dramatic on purpose, though. Delphinium. Tall, showy, falls over if you don't stake it properly. Kind of respect that, honestly. Most flowers hide what they need. This one just tells you outright — stake me, or I'm going down."

"Sounds like a lot of upkeep for a flower."

"Most good things are." She says it lightly, but there's a second where she looks up at you like the sentence meant something wider than flowers, hazel eyes catching the low shop light, and then it passes, and she's just Iris again, sleeves pushed up, humming something under her breath as she works. "Sit if you're staying. I've got one more bucket and then I'll make tea. The kettle's louder than the bell, fair warning, so don't jump when it goes off. I'd hate for you to think this shop's just full of things determined to startle you."

You sit on the stool by the register, watching her hands move — sure, patient, the kind of care that only comes from doing something a thousand times and never once getting bored of it. The rain keeps time against the glass, and somewhere in the back a radio plays something low and instrumental that you almost don't notice until it swells at the chorus.

"Why flowers?" you ask, eventually.

She considers it, stem in hand, like no one's asked her plainly in a while. "Because they're honest," she says. "They tell you exactly how they're doing. Droop, and they need water. Bloom, and something's going right. People aren't that simple. You can smile at someone for an hour and mean none of it. A wilting flower can't fake being fine. Flowers are a relief, that way."

"That's a very specific way to see the world."

"I inherited the shop from my grandmother. I think I inherited the way of seeing along with it." She sets the last stem in its bucket, straightens, wipes her hands on her apron. "She used to say the flowers told her more about the neighborhood than the neighbors did. I didn't believe her until I'd been doing this a few years myself. Now I think she undersold it."

The kettle starts up behind the counter, exactly as loud as she warned, a shrill, insistent whistle that cuts cleanly through the rain's quiet percussion. Neither of you moves to quiet it right away, both of you sitting a moment longer in the last of the shop's hush before she finally crosses to lift it off the heat.

"Milk or plain?" she calls over her shoulder.

"Whatever you're having."

"Smart answer." She glances back at you, something pleased and a little surprised flickering across her face, like she wasn't expecting you to hand the choice back to her. "Most people have very strong opinions about their tea. I like that you don't. Means I get to decide, and I already know exactly what I'd make you."

· · ·

You start arriving right before close, every time, and Iris starts setting a second teacup out before you even walk in — a quiet certainty that you'd found its way into her routine without either of you deciding it out loud, the cup waiting on the counter, steam already curling up from it some nights by the time the bell finally rings.

"You're becoming predictable," she says, not unkindly, sliding the cup across the counter. "I like predictable. Flowers are predictable too, if you learn to read them. I suppose I'm learning to read you the same way — the exact hour you tend to show up, the way you always glance at the peonies first even though you never buy any."

"What do I tell you? When you read me."

She considers the question seriously, the way she considers everything, stem in hand, turning it slowly as she thinks. "That you're staying longer each time," she says. "That you keep finding new questions to ask me, like you're trying to make the closing-up last." A small, private smile. "I don't mind. In case that wasn't obvious."

"It wasn't, actually."

"Then let me be obvious." She sets the shears down, gives you her full attention, warm and unhurried, in a way that makes the whole small shop feel like it's holding still just to let her do it. "I like that you stay. I've been hoping you would keep staying, actually, every night since that first rainy one, though I wasn't sure how to say so without sounding like I was rushing something that didn't need rushing."

"You could've just said it."

"I'm better at saying things through flowers than through my own mouth, if I'm honest. It's a professional hazard." She laughs a little at herself, tucking a loose strand of hair back with the back of her wrist so she doesn't smudge soil onto her face. "Ask my grandmother. She used to despair of me at family dinners, handing everyone a stem instead of an actual sentiment."

"What would you hand me? If you were doing that instead of talking."

She goes quiet for a moment, considering the buckets around her like the answer's actually in there somewhere among the blooms. "Probably the delphinium," she says finally. "Something that tells you exactly what it needs without any of the guessing. I think I'd like to be more like that with you. Less like the roses, hiding all their thorns until you're already holding them."

"I don't think you have many thorns to hide."

"Give it time," she says, but she's smiling, and the rain outside softens into something gentler, like even the weather's decided to ease up in sympathy.

You ask her, later, over the second cup of tea, whether she'd always planned on taking over the shop, or if it just happened to her the way most things seem to.

"Both, honestly." She wraps her hands around her own cup, considering. "I used to help my grandmother after school, just sweeping up trimmings, nothing important. I thought I'd do something else with my life. Something bigger, maybe, though I never quite worked out what bigger meant." A small, wry smile. "Then she got sick, and the shop needed someone, and I realized I didn't actually want anything bigger. I wanted this. The quiet of it. The honesty of it."

"Do you regret it? Not choosing something bigger."

"Not for a second." She says it without hesitation, definite in a way she rarely is about anything else. "I get to spend my days with things that can't lie to me, in a building my grandmother built with her own two hands, and most evenings that's plenty. Lately it's been more than plenty." She glances at you over the rim of her cup, something warm and a little shy in the look. "Lately it's been the best part of most days, if I'm honest, and I wasn't expecting that. I thought the shop was going to be the whole of my happiness. Turns out there was room for more than I'd budgeted for."

"I like being an unbudgeted happiness."

"You're doing a very good job of it," she says, and the shop settles into its evening hush around you both, kettle steaming, rain gentling outside, neither of you in any hurry to be anywhere else.

· · ·

A delivery of peonies arrives late one evening, crates of them stacked by the door, and Iris lets you help her arrange them — patient with your clumsy stems, guiding your hands with a gentleness that has nothing to do with flowers and everything to do with how close she's standing to do it, her fingers warm over yours despite the cool water in the buckets.

"You're better with your hands than you let on," she murmurs, adjusting your grip on the shears, her fingers lingering over yours a beat longer than the correction requires. "Careful. That's the whole trick. You already have that in you — the instinct to go slow, to not force the stem where it doesn't want to sit."

"You're a good teacher."

"I've never taught anyone this before." She looks up properly now, closer than the arrangement requires, something quieter than her usual composure showing through, hazel eyes searching your face for a moment like she's deciding how much more to say. "I don't let just anyone into the back of the shop after hours. You should know that. My grandmother used to say the back room was where the shop kept its actual heart, and she was very particular about who got to see it."

"I do know that."

"Good." Her hand stays over yours a beat longer than necessary, and neither of you moves to finish the peonies for a while, the crates of unopened blooms filling the small back room with a sweetness that's almost too much, almost dizzying, the rain drumming soft against the skylight overhead.

"Can I tell you something," she says, eventually, setting down the stem she'd been holding. "I don't usually let this shop feel this full. Of a person, I mean. It's always just been me and the flowers, and that was enough for a long time. Lately it hasn't felt like enough on its own."

"What changed?"

"You did. Somewhere between the first rainy night and this one, without me really noticing it happening, which is unlike me. I notice everything. I notice when a stem's a half-degree off from where it should sit in a vase. I didn't notice you changing things until you already had." She says it plainly, not quite meeting your eyes now, suddenly a little shy in a way that doesn't match the rest of her steady composure.

"Is that a bad thing?"

"No," she says, quick, certain. "It's just new. I'm still getting used to how much room you've taken up in here without asking for any of it."

The peonies finally arranged, filling the back room with their heavy, sweet scent, Iris steps back to survey the work, hands on her hips, head tilted in critical appraisal that softens the moment she catches you watching her instead of the flowers.

"You're staring again," she says, not quite an accusation.

"You're interesting to watch when you're deciding if something's right."

"That's what my grandmother used to say about herself. That she could never just look at a finished arrangement and feel satisfied — always one more adjustment, one more stem turned half an inch." She laughs a little, self-conscious. "I suppose I inherited that too, whether I wanted to or not."

"Is that a bad thing to inherit?"

"I used to think so. Now I'm not so sure." She crosses back to where you're standing, closer than the moment strictly requires, soil still smudged faintly along one wrist. "It means I notice things most people miss. Small shifts. Whether somebody's smile reaches their eyes or just their mouth. Whether somebody's actually comfortable in a room or just being polite about being there." Her gaze holds yours, steady, searching. "I've been noticing you very closely for a while now. I don't think I've been subtle about it, if I'm honest."

"You've been plenty subtle. I only just caught on."

"Then I suppose the trick worked exactly as long as I needed it to." She reaches out, tucks a strand of hair back from your face with the same careful attention she gives every unruly stem, fingers lingering a moment against your cheek before she draws back, a little startled by her own boldness. "Sorry. Habit. I fix things that are slightly out of place. Apparently that now includes you."

"I don't mind being fixed by you."

Her answering smile is soft, private, entirely unguarded, and for a moment neither of you says anything else at all, the rain outside the only sound, the sweetness of the peonies settling thick and warm around you both.

· · ·

The rain's coming down hard again one night, harder than the first night you walked in, drumming loud enough against the window that it almost drowns out the bell, and Iris locks the door early, pulling the blinds against the streetlights outside, the shop going soft and private and entirely yours in the sudden hush that follows.

"I don't want anyone else walking in tonight," she admits, voice softer than you've heard it. "I want it to just be us, for once, without the bell interrupting, without a customer needing help picking out an arrangement for somebody else's anniversary while I'm trying to work out what to say to you."

"Is that allowed?"

"I own the shop." A small laugh, unguarded, brighter than her usual quiet humor. "I'm allowed to close early for someone I've been hoping would ask me this for weeks. I kept waiting for you to ask. I should've just told you instead of waiting."

"Tell me now."

She takes a breath, steadying herself the way she steadies an unruly stem before she commits the shears to it. "I've been in love with you since somewhere around the peonies, I think, though it might have started even earlier than that and I just wasn't paying close enough attention to my own reading of things." She crosses the small space between you, careful as always, but with none of the hesitation from that very first evening. When she kisses you, it's slow, deliberate, tasting faintly of the tea she's been steeping for you every single night. "I've wanted to do that since the delphiniums," she confesses against your mouth. "Took me long enough to admit it, even to myself."

"Worth the wait?"

"Everything good is," she says, echoing herself, and kisses you again to prove it, softer this time, her hand coming up to rest against your jaw like she's finally letting herself hold something she's wanted for a long time.

When she finally pulls back, she doesn't go far, resting her forehead against yours instead, breath still a little unsteady from the confession, from the kiss, from the whole quiet weight of finally saying the thing she'd apparently been arranging around for weeks like just another stem in a vase.

"I had a whole plan for how to tell you," she admits, a small, embarrassed laugh escaping. "Something with the delphiniums, obviously. I was going to hand you one and hope you understood what it meant without me having to actually say the words. I've done that my whole life. Let the flowers talk for me."

"What changed?"

"I realized you deserved better than a flower doing my talking. You deserve the actual words, badly delivered as they might be." She laughs again, softer now, easing into the shape of the evening. "So there they are. Badly delivered, entirely too late, but true. I love you. I have for a while now."

"That wasn't badly delivered at all."

"You're just being kind." But she's smiling, glowing in a way you've never seen on her before, something in her finally loosened all the way. "I've been rehearsing that sentence in my head since somewhere around the second cup of tea. Never quite worked up the nerve until tonight, with the rain doing all the work of making the world feel smaller, just the two of us and the blinds pulled shut."

"I'm glad the rain helped."

"So am I. Delphiniums are dramatic, but apparently rain's the real accomplice in all of this." She kisses you once more, unhurried, and then tucks herself against your side, the shop hushed and warm and entirely, finally, yours together.

· · ·

Months later, the shop's got a standing arrangement now — fresh flowers on your own kitchen table every week, delivered personally, an excuse Iris still pretends she needs though you both know she doesn't, the same careful hands arranging the same thoughtful blooms every single time.

"Why flowers," you ask again, echoing that very first rainy night, watching her trim stems with the same patient care she's always had, sleeves pushed up, soil still finding its way onto her wrists no matter how careful she is. "I never really got a full answer."

"I told you. They're honest." She sets down the shears, comes around the counter to where you're sitting, settles into your side like it's the easiest thing in the world now, resting her head against your shoulder with a contentment that took her a long time to let herself feel out loud. "But I think I kept them because I was waiting for someone patient enough to notice how I actually felt, without me having to say it outright. Flowers are good at that. Saying things quietly, letting somebody else do the noticing."

"I noticed the delphiniums first. Not you."

"I know. That's exactly why it worked." She laughs, soft, tucking herself further into your side. "You paid attention to the small dramatic thing in the bucket before you ever really looked at me. Felt safer that way, somehow — like I could let you in slowly, one flower at a time, instead of all at once."

"And now?"

"Now I don't need the flowers to say it for me anymore." She presses a soft kiss to your temple, unhurried as ever. "You noticed. Eventually. That's all I ever really wanted — someone patient enough to wait out the slow reveal, the way you'd wait for a delphinium to finally bloom instead of giving up on it halfway through the season."

"Worth the wait, I take it."

"Every single day of it," she says, and means it completely, the shop humming quiet and warm around you both, rain or sun outside no longer mattering nearly as much as it once did.

She glances toward the delphinium bucket, still by the window where it's always been, a fresh batch in now, tall and unapologetically showy the way they always are. "I still think about that first night sometimes," she says. "How alarmed I was that you'd startled them. As if you were ever actually a threat to anything in here."

"You were very serious about it."

"I take my flowers seriously. I take you seriously too, now, though I didn't know that's what was happening at the time." She reaches over, straightens a stem in the bucket out of pure habit, the same small correcting gesture she's made a thousand times since you've known her. "I used to think I'd spend my whole life just tending things quietly, never really being tended to myself. You changed that without my really noticing until it had already happened."

"I like tending to you."

"I've noticed. You're getting quite good at it, actually — better than I expected, given you didn't know a delphinium from a dahlia when you first walked in here." She smiles, teasing now, some of her old dry humor slipping back in alongside the softness. "My grandmother would have adored you, I think. She always said the right person would be the one who noticed the shop wasn't just flowers. It was me, underneath all of it, waiting for somebody patient enough to see that too."

"I saw it eventually."

"Eventually," she agrees, settling more fully into your side, "is exactly when it counted."`,
  },
  {
    character: "Celeste",
    title: "Jupiter Clears the Treeline",
    setting: "a hilltop observatory deck at night, telescope, wide open starfield",
    genre: "slice-of-life",
    tone: "dreamy",
    content: `The climb up to the observatory deck is steeper than it looks on the campus map, a switchback of gravel path that gets narrower the higher you go, and by the time you reach the top, out of breath and a little cold already, Celeste is already crouched over the telescope, one eye shut, muttering coordinates to herself like a spell, a battered star chart folded open on the ground beside her and weighted down with a rock so the wind doesn't take it.

"You're just in time," she says, not looking up, waving you over with real urgency, like the universe itself might change its mind if you're slow about it. "Jupiter's about to clear the treeline. Come see, I promise it's worth the cold."

It is cold — the kind of clear-sky cold that means good seeing, she tells you, like that's obvious, like everyone should already know that the same conditions that make you shiver are the ones that make the sky behave. You bend to the eyepiece where she points, and there it is: a small, steady, impossibly detailed disc, striped faintly gold and white, with four tiny points of light strung out beside it like beads on a string.

"Those are moons," she says, delighted, like she didn't already know that and isn't the one who told you. "Real ones. Io, Europa, Ganymede, Callisto — I say them in order every time, it's basically a nervous habit at this point. My advisor thinks it's unprofessional. I think it's just good manners. You don't just look at someone's moons and not learn their names."

"Do you ever get used to it? Seeing it."

"No." She says it instantly, like the question answered itself, pulling back from the telescope just long enough to look at you properly, breath fogging faintly in the cold air. "That's the whole thing, honestly. Everyone thinks astronomers get bored eventually, like it's just numbers after a while. It's not. It's the same planet every time and it's never once been boring." She pulls back further to make room, hugging her knees against the cold, hoodie sleeves pulled down over her hands, university logo half-faded from a hundred washes. "My advisor says I need to be more chill about it in my thesis defense. I told her chill is scientifically inaccurate. Jupiter deserves enthusiasm. You don't get to discover something's got fifty-something moons and just shrug about it."

"Fifty-something? I thought there were four."

"Four you can see from here, with this telescope, tonight. There's dozens more, tiny ones, weird ones, one that's basically just a captured asteroid that wandered too close and never left." She's animated now, hands sketching shapes in the cold air, sleeves slipping back to bare her wrists. "I could talk about this for hours. I have talked about this for hours, to people who very much did not ask. Fair warning."

"I don't mind."

That seems to catch her off guard, just slightly, like she wasn't expecting the sentence to land as sincerely as it did. "Most people say that and then start checking their phone about six minutes in," she says. "Not that I'm counting. I'm absolutely counting."

You watch her more than the sky for a while — the way she talks with her whole body when she's excited, hands sketching orbits in the air, completely unselfconscious about it up here where nobody's watching but you.

"Thank you for waking me up for this," you say. "You didn't have to."

"I wanted to." She says it plainly, then seems to hear how it sounded, and ducks her head, suddenly a little shy in a way the rest of the night hadn't been, hoodie sleeve pulled further over her hand like she's hiding behind it. "I mean — it's better with someone else looking too. Doubles it, somehow. Doesn't feel like just mine anymore."

Behind her, Jupiter keeps climbing, unbothered, patient the way only something that old can afford to be. Neither of you says anything for a while. You don't need to, the cold air and the wide dark sky doing all the talking that matters.

· · ·

You start coming up every clear night, and Celeste always has something new to show you — a nebula, a passing satellite, the rings of Saturn once, so crisp through the eyepiece you both went quiet for a full minute after, neither of you willing to be the one who broke it first.

"You actually remember what I tell you," she says one night, delighted, hugging her knees against the cold, breath clouding in front of her in the dark. "Most people just nod along. You ask follow-up questions. Do you know how rare that is? I once dated someone for two months who thought a light-year was a unit of time. An actual unit of time, like a fast year. I didn't correct him for the first three weeks because I felt bad."

"Did you ever correct him?"

"Eventually. It came up during an argument about something unrelated and I just couldn't hold it in anymore." She laughs at the memory, shaking her head. "Anyway. You're better than that. You ask actual questions, and sometimes you ask ones I haven't thought of myself, which is honestly the best compliment you can give a scientist. Do you know how rare that is?"

"Is that a compliment?"

"It's the biggest compliment I have." She ducks her head, suddenly shy again, the way she gets when she realizes how much she's just revealed. "I don't usually let people up here this often. It's supposed to be my quiet place. The one spot on campus where nobody needs anything from me, where I'm not somebody's TA or somebody's daughter on the phone or somebody's data point in a departmental review. Just me and the sky. You've kind of ruined that."

"Should I stop coming?"

"No." Too fast, too certain, and she seems to hear it herself, a little startled by her own volume in the quiet dark. "I don't want you to stop coming. I think I just meant it's not quiet anymore because I'm always a little excited when I know you're on your way. It's a good kind of not-quiet, though. I promise. My brain just gets loud in a nice way instead of the usual anxious way."

"I like your brain loud."

"You say that now. Wait until I start rambling about black hole thermodynamics at two in the morning." But she's smiling, warmer than the cold night has any right to allow, and she scoots the folding chair a few inches closer to where you're sitting, like it's an afterthought, like she hasn't been thinking about doing it all night.

She tells you, eventually, why she ended up here, on this particular deck, doing the particular unglamorous work of the late shift nobody else in her cohort wants.

"Everyone else wanted the daytime data work," she says, wrapping both hands around her mug. "Cleaner hours, more normal life. I asked for the night shift on purpose. People thought I was nuts." She shrugs, a little self-conscious. "I just always liked the sky better than I liked being asleep. My mom used to find me at the window at three in the morning when I was a kid, just watching. She stopped being surprised by it eventually."

"Did she ever get it? Why you liked it so much."

"Not really. She still doesn't, honestly, and that's okay." Celeste picks at the edge of her sleeve, thoughtful. "She thinks it's a phase that's lasted an unreasonably long time. I think it's just who I am. There's something about knowing the light you're looking at left its source before you were even born, sometimes before your parents were born, and it's still going, still arriving, patient about it in a way people never really are."

"That's a very romantic way to think about physics."

"Don't tell my advisor. She thinks romanticizing the data makes for sloppy science." Celeste grins, unrepentant. "I think the data's romantic already and we're just pretending otherwise to sound rigorous. Anyway. That's why I'm up here. Boring answer, probably, compared to what you were expecting."

"Not boring at all."

"You keep saying things like that," she says, quieter now, glancing at you sideways. "I'm going to start expecting it, and then you'll have to keep it up forever."

"I think I can manage that."

· · ·

A meteor shower peaks one night, and Celeste insists on lying flat on the observatory deck instead of using the telescope at all — blankets dragged up from her dorm in an armful too big for her to carry properly, hot chocolate in a thermos that she guards like state secrets, both of you shoulder to shoulder staring straight up at a sky gone thick and reckless with stars.

"This is the best seat for it," she explains, unprompted, settling a blanket over both your legs with more enthusiasm than precision. "Naked eye, wide field. The telescope's too narrow for a shower, it'd be a waste, you'd miss ninety percent of them just because you're staring at one tiny patch of sky instead of the whole thing." A pause, and then, quieter: "Also I wanted an excuse to lie next to you without it being weird."

"It's not weird."

"Good. I've been overthinking this for weeks." She laughs at herself, nervous and delighted at once, pouring hot chocolate into two mismatched mugs that she produces from an enormous bag like a magic trick. "I kept trying to figure out a scientifically justifiable reason to be closer to you, and then I remembered meteor showers require exactly that, so really this is just good methodology."

"That's a very academic way to ask someone to cuddle."

"I contain multitudes." She hands you a mug, settling back down beside you, close enough now that her shoulder presses warm against yours under the blanket. "Okay. Watch the eastern sky, mostly. That's where the radiant is — the point they all seem to come from, even though they're not actually coming from a point, it's just perspective, like train tracks looking like they meet in the distance—"

"Celeste."

"Sorry. Rambling. Watch the sky." She grins, unbothered by being caught, and settles in properly, and when a meteor streaks bright overhead she grabs your hand without seeming to notice she's done it — just holds on, eyes on the sky, fingers laced through yours like it's the most natural thing in the world, a small delighted gasp escaping her every single time another one flares and falls.

Between meteors, in the quiet stretches when the sky seems to be catching its breath, she talks — softly, unhurried, none of her usual rapid-fire excitement, like the dark and the cold have slowed something down in her that's usually running too fast to catch.

"Can I tell you something kind of embarrassing," she says, eyes still on the sky.

"Always."

"I used to make wishes on these. When I was little, before I knew they were just debris burning up in the atmosphere and not actually anything magical." She laughs a little at herself. "I still do it, honestly, even though I know exactly what's happening scientifically. Doesn't seem to matter. The wishing part and the knowing part just live in completely separate rooms in my head."

"What do you wish for now?"

She's quiet for a moment, another meteor streaking silent and quick across the black. "Lately, kind of embarrassingly, I've been wishing for this. Exactly this. You, up here, not thinking I'm insane for caring this much about rocks falling from space." She turns her head slightly to look at you instead of the sky, cheeks pink from more than just the cold. "I know that's a small wish. Doesn't feel small to me."

"It's not small to me either."

"Good." She squeezes your hand, eyes going back to the sky, though there's a new softness in the way she watches it now, like she's sharing the view instead of just narrating it. "Don't tell anyone I get sentimental about shooting stars. I have a reputation for scientific rigor to protect."

"Your secret's safe."

"It better be. I'll deny it under oath." But she's smiling, and she doesn't let go of your hand again for the rest of the shower, even when the cold gets sharp enough that you can both see your breath fogging thick against the dark.

· · ·

She finally says it on an ordinary night, no meteor shower, no rare alignment, just the two of you and the telescope between clouds, the sky mostly obscured, the kind of night that would usually frustrate her into checking the forecast every four minutes. Tonight she barely glances at the clouds at all.

"I like you," she blurts, mid-sentence about something else entirely — you think she'd been explaining something about redshift — then goes bright red at her own timing, hands flying up to cover her face. "Sorry. That was supposed to come out smoother. I've been rehearsing it for a week and it still came out wrong. I had a whole speech. It had an analogy about binary stars. It was good, I promise, and none of it came out."

"It didn't come out wrong."

"No?" She looks at you properly, hope and nerves both plain on her face, utterly unable to hide either the way people who are good at pretending can, hands still hovering near her cheeks like she's not sure whether to keep hiding behind them. "Because I've been trying to say it for actual weeks. Every time you climbed up here I'd think, tonight's the night, and then Jupiter would clear the treeline or something equally distracting would happen and I'd lose my nerve completely."

"No." You close the distance yourself, and she makes a small, surprised sound against your mouth when you kiss her — soft, unpolished, entirely genuine, the telescope forgotten between you both for the first time all semester, her hands finally coming down from her face to rest, a little uncertain, against your chest.

"That was better than my thesis defense went," she says after, breathless, grinning, cheeks still flushed pink from the cold and everything else. "For the record. Also, considerably less terrifying, and I did not think that was possible given how much I like you."

"High praise."

"The highest I've got." She leans her forehead against yours, laughing quietly at her own giddiness, unable to stop smiling even when she tries. "I'm going to be insufferable about this to everyone in my department tomorrow. Fair warning. I've been holding it in for weeks and I have zero self-control left."

She pulls back enough to look at you properly, still a little disbelieving of her own nerve, hands finally settling instead of fluttering. "I had this whole theory," she admits, "that if I just kept being normal about it, kept just showing you Saturn's rings and Jupiter's moons and never said anything, eventually the feeling would just go away on its own. Like it was a phase. Like my mom always says about the sky thing."

"Did it work? The theory?"

"Spectacularly not. It just kept growing, actually, every single clear night, until it got so big I couldn't fit it behind redshift analogies anymore." She laughs, shaking her head at herself. "I'm a scientist. I'm supposed to be good at testing hypotheses and abandoning the ones that don't hold up. This one held up for months and I still didn't want to admit defeat."

"I'm glad you finally did."

"Me too. Mostly because I don't think I could've survived my thesis defense with this still bottled up. I'd have blurted it out in front of my committee instead, and that would have been considerably more humiliating." She takes your hand again, the same unthinking gesture as before, like it's already become instinct. "For the record, I've never once mid-sentenced confessed feelings to anyone before. You get the very first, very badly executed version of that."

"I liked the badly executed version."

"You're just saying that because you like me." She grins, delighted at her own logic. "Which, fair. I like you too. In case that wasn't already extremely clear from the blurting."

· · ·

Months later, your name's practically carved into the observatory logbook beside hers, and the late shifts have turned into something neither of you calls a shift anymore — just a standing appointment with the sky, and each other, blankets and thermos and folding chairs arranged now with the practiced ease of routine instead of nervous improvisation.

"Jupiter's clearing the treeline," she says, echoing that very first night, voice warm with a familiarity that's replaced all the old nervousness, though the delight in it hasn't dimmed one bit. "Come see. I promise it's still worth the cold, every single time. I don't think that part's ever going to wear off, honestly, and I've stopped worrying that it should."

You bend to the eyepiece, and there it is — the same steady disc, the same four moons in the same order she still recites like a spell, Io, Europa, Ganymede, Callisto, her voice soft and certain behind you as she says them. When you pull back, she's not looking at the telescope at all. She's looking at you, the way she used to only look at the sky.

"Doesn't feel like just mine anymore," she says, echoing herself, and kisses you before Jupiter can finish climbing without you both properly watching.

"You say that every time," you tell her, once she's pulled back, smiling against your mouth.

"Because it's true every time. I don't get tired of saying true things." She tucks herself into your side, thermos forgotten between you, the cold no match for how warm the two of you have gotten at making a habit out of this exact spot on this exact deck. "My advisor still thinks I need to be less enthusiastic in my thesis defense. I've decided she's wrong about that, same as I decided the first night we met. Some things are just built for enthusiasm. Jupiter. Meteor showers." She glances up at you, eyes bright even in the dark. "You, apparently. Turns out you're the thing I've been the most unprofessionally excited about this entire year."

"I'll take that as a compliment."

"It's the biggest one I've got," she says, and means it exactly as much as she did the very first time she said it, the sky wide and endless and entirely, happily shared above you both.

She glances down at the logbook, at the long column of dates and observations, your name now threaded through hers in her looping, hurried handwriting. "You know, I used to keep this shift a secret from basically everyone," she says. "Told people I just liked the quiet, never told them it was because I genuinely thought nobody would want to spend their night the way I do. Cold, rambling, obsessed with rocks and gas giants."

"I want to spend my nights exactly like this."

"I know. That's the part I still can't quite believe, if I'm honest." She leans into you, the thermos warm between your knees, the folding chairs long since abandoned for the blanket you both still keep folded and ready by the telescope stand. "My advisor asked me last week if I was still planning on doing this forever. The late shift, I mean. I told her yes, obviously, and she asked if that was sustainable long-term, given, you know, normal human things like relationships."

"What did you tell her?"

"That I'd already solved that particular variable." Celeste beams up at you, delighted with her own answer even now. "She didn't really get the joke. I don't think anyone in my department fully appreciates how good my life has gotten since Jupiter and I roped you into all of this." She tucks closer against your side, watching the planet keep its slow, ancient climb above the treeline. "Fifty-something moons, four visible tonight, one incredibly lucky astronomer. I'd say that's a pretty solid thesis, actually. Better than the one I'm supposed to be defending."

"I think you should keep this one instead."

"Already defended it," she says, grinning, "against a committee of exactly one. Verdict's in. I'm keeping you."`,
  },
  {
    character: "Valentina",
    title: "Keep Up With the Quiet",
    setting: "an empty dance studio at dusk, wall of mirrors, evening light through tall windows",
    genre: "romance",
    tone: "elegant",
    content: `The studio's empty except for Valentina, barre-side, one leg extended along the rail in a stretch that looks less like exercise and more like punctuation — precise, deliberate, finished before it's begun. The evening light through the tall windows turns the whole room gold, catching the dust in the air like something staged on purpose, and she doesn't look over when the door clicks shut behind you.

"You're early," she says, to the mirror, not to you directly — though somehow it lands the same. "Good. Most people who watch me stretch get bored halfway through." She switches legs, unhurried, a small huff of effort the only proof any of this costs her something. "Stay, if you can keep up with the quiet."

You sit against the far wall, out of the way, and the quiet turns out to be its own kind of company — just her breathing, the soft creak of the barre, the particular hush of a room built for sound to fall against mirrors and go nowhere. You watch the discipline of it, the way she doesn't perform a single motion for an audience that isn't there, and understand slowly that this is a version of her almost nobody gets invited to see.

"You used to perform," you say, not quite a question. There's a program pinned by the door, her name on it, years old, the paper gone soft and amber at the edges.

"Principal, for eleven years." She doesn't stop moving. "Then my knees had a professional disagreement with my ambition, and my ambition lost." A small, dry almost-smile at her own reflection. "I don't miss the stage as much as people expect me to. I miss this part. The empty room, before anyone's watching. It's more honest."

"What do you get from the empty room that you don't get from an audience?"

That makes her pause — really pause, weight settling, attention shifting fully onto you for the first time since you walked in. It's a strange thing, having the whole of that attention land on you at once; you understand, suddenly, why people paid to watch her move, why critics ran out of adjectives trying to describe it.

"Nobody to perform for," she says finally. "So whatever I do here is just true. No angle, no lighting, no story I'm telling an audience about who I am." She rolls her shoulders back, resuming, but slower now, like something in the conversation loosened a knot the stretch hadn't reached. "You're the first person I've let watch this in longer than I'd like to admit."

"Why me?"

She considers it the way she considers everything — exact, unhurried, a little amused at having to explain herself at all. "Because you didn't fill the silence," she says. "Most people can't help it. They ask questions to hear themselves ask them, or they compliment the room, or they tell me some story about a ballet class they took at seven. You just let it be quiet." A beat, and then, quieter still: "I find that rarer than talent, if I'm honest."

You ask her what she does with all that discipline now that there's no stage waiting for it, and she tells you about the studio — dancers who come in tight-shouldered and leave two hours later having felt something they didn't expect to. "I'm not interested in perfect lines anymore," she says. "I had those. They didn't fix anything that mattered." She glances at you again, longer this time. "I'm interested in whether you can be honest in front of a mirror. Most people can't."

The light keeps sliding gold across the mirrors as the sun drops, degree by degree, and neither of you moves to turn on the lamps. When you finally rise to leave, she says, without turning from the barre, "Same time tomorrow, if you'd like to keep up with more of it." It isn't quite an invitation and isn't quite not one, and you find yourself already looking forward to finding out which.

· · ·

You become part of the ritual without either of you naming it — the empty studio at dusk, you against the far wall, Valentina moving through her stretches like the room's been waiting all day for exactly this quiet. The light finds the mirrors at the same angle each evening, and you've started to recognize the stages of her warm-up the way you'd recognize the movements of a piece of music.

"You're here again," she says, not a question, a small note of satisfaction under the usual precision. "I've started expecting you. That's rare for me. I don't expect people twice."

"Why me, twice?"

"Because you still haven't filled the silence." She says it like it's the highest compliment available to her, which, from Valentina, it probably is. "Most people can't survive more than ten minutes of me not talking. You've survived a dozen sessions." A pause, considering, weight shifting onto one hip in a way that looks unconsciously graceful even at rest. "I find I want you to survive a dozen more."

"Is that an invitation?"

"It's an observation." But there's the faintest curve at her mouth, the closest thing to unguarded you've seen from her. "Take it as you like."

You ask her, carefully, whether she ever gets lonely running the studio alone every evening after the last class clears out. She takes her time answering, testing the question the way she tests a stretch before committing her full weight to it.

"I used to think the quiet was the reward," she says. "Something I'd earned, after years of noise — audiences, reviews, other dancers' opinions of my turnout. Lately I've noticed I look forward to the door opening. That's new." She says it almost like a confession, like she's handing you something she hadn't meant to hand anyone. "I don't know what to do with that yet, except keep the door unlocked."

"Maybe you don't have to do anything with it. Maybe it's just true."

That gets her full attention again, the kind that used to unsettle you and now feels more like being chosen. "You say things like that very easily," she says. "I'm not used to easily. Most things I've had to work for." She resumes her stretch, but there's something looser in her shoulders now, something that wasn't there when you walked in.

You ask her, since she brought up the door, what it used to mean to her before you started showing up — whether the ritual of locking up alone every night ever felt like something worth changing. She laughs, a short surprised sound, like the question caught her off guard by being so direct.

"I used to tell myself I preferred it," she admits. "Locking the door, walking home in the dark, nobody waiting to hear how the day went. It felt like proof I didn't need anything I hadn't built myself." She glances at the barre, at the worn patch on the floor where her feet have crossed the same six inches ten thousand times. "I'm less sure that was ever true. I think it was just the version of independence that didn't require trusting anyone."

"And now?"

"Now I find myself timing my cool-down around when you usually arrive," she says, dry, but there's no hiding the honesty underneath it. "Which is either very sentimental or very undisciplined of me, and I haven't decided which is worse." She straightens, rolling one shoulder back, testing whether the confession costs her anything now that it's out. It doesn't seem to. "I've never let a habit form around a person before. I'm finding I don't mind it as much as I expected to."

"I could stop coming, if it bothers you."

"Don't you dare." It comes out fast, sharper than her usual measured cadence, and she seems almost surprised at herself for it. A beat, and then, softer: "I mean that. Come back tomorrow. I find the quiet's better with you in it, and I'm too old to pretend otherwise just to protect my pride."

· · ·

She lets you onto the floor one evening — not to dance, just to sit closer, near the barre instead of against the far wall, close enough to see the concentration up close instead of through the mirror. The proximity changes something; you notice the small tells you'd missed from across the room — the way her jaw sets a half-second before a difficult extension, the exhale she allows herself only once the position is fully locked in.

"You're staring," she says, without breaking her line, eyes still fixed somewhere over your shoulder in the mirror.

"You're worth staring at."

That stops her — a real pause this time, weight fully settled, her reflection meeting your eyes instead of her own. "Careful," she says, quieter. "I don't know what to do with compliments that aren't about my technique. I've spent eleven years being told my extension is beautiful. Nobody tells me I am."

"Get used to it. I plan on giving you more."

She doesn't answer right away — just resumes the stretch, slower now, deliberate in a different way than before, like she's giving herself time to feel whatever that admission stirred up before she has to respond to it. When she finally speaks again, her voice has dropped, lost some of its usual precision to something warmer and less rehearsed.

"I was trained to treat compliments as currency," she says. "Something you spend to get a role, or keep a partner interested, or manage a director. I've had to relearn what it means when someone says something kind and doesn't want anything back for it." She looks at you sideways, testing. "Do you want something back for it?"

"Just this. Just being allowed to sit here and watch you be honest."

Something shifts in her face — not quite a smile, something quieter and more permanent than that. "Then you already have what you wanted," she says, and reaches over, unhurried, to adjust the angle of your knee where you're sitting, an excuse to touch you that neither of you bothers pretending is really about your posture. "There. Now you're sitting like someone who's staying a while."

She goes back to the barre after that, but she leaves the lamp closer to you than it was, angled so you can still see her clearly without the mirror between you. It's a small thing. You notice it anyway — the way she keeps making these quiet accommodations, none of them announced, all of them deliberate.

"Tell me something," she says, mid-extension, not looking over. "Do you come here for the dancing, or for me?"

"Does it have to be one or the other?"

"No," she admits. "But I'd like to know which matters more to you. I've spent a career being watched for the wrong reasons — the line of my leg, the height of my jump, whether I'd hold a lift without wobbling. I'd like, for once, to know someone's staying for the parts of me that don't show up in a program."

"I stay because you're the most honest thing I've ever watched. The dancing's just how you happen to show it."

She's quiet for a moment, weighing that the way she weighs everything, turning it over for flaws before she'll let herself accept it. "That's a good answer," she says finally. "Better than I expected. I'll admit I was testing you a little."

"Did I pass?"

"You've been passing since the first night you didn't fill the silence." She finishes the stretch, holding the final position a beat longer than necessary, like she's not quite ready to let the moment end either. "I don't say that to many people. Try not to let it go to your head."

"Too late."

That earns you the faintest laugh, low and real, gone almost as soon as it arrives. "Good," she says. "I'd rather you know exactly how rare this is."

· · ·

The studio's dark except for a single lamp one night, and Valentina doesn't stretch at all — just sits on the floor across from you, back straight out of habit even at rest, studying you with an intensity that has nothing to do with dance. The mirrors catch the one small light and throw it back thin and gold, and the whole room feels smaller than usual, more private, like it's finally just the two of you and nothing performing for anyone.

"I don't let people see me want something," she admits, precise even now, even here. "It's a vulnerability I was trained out of a long time ago. Wanting things onstage gets you hurt — a role you don't get, a partner who doesn't lift you the way you need. Wanting them off it apparently does too, if you're not careful who you want them with."

"Am I safe to want?"

"I'm still deciding." She looks down at her own hands, folded loosely in her lap, an uncharacteristic fidget for someone so composed. "You should know I've been deciding for weeks now. I'm not usually this slow about anything."

"Take whatever time you need. I'm not going anywhere."

"That's either very kind or very foolish," she says, "and I haven't decided which yet either." She looks at the lamp for a moment, at the thin gold light it throws across the floorboards, like it might give her an answer she can trust more than her own instincts. "I was principal for eleven years. I made thousands of decisions on a stage in front of thousands of people, and none of them frightened me the way this one does."

"What's frightening about it?"

"Onstage, if I fail, it's a bad review. A missed cue. Something I can rehearse away by next season." Her voice has gone quieter, stripped of its usual polish. "This isn't something I can rehearse. If I want you and I'm wrong to, there's no understudy to step in and fix it. It's just me, deciding, with nothing to catch me if I've misjudged it."

"You haven't misjudged it."

"You can't promise me that."

"No," you agree. "But I can tell you I've been deciding the same thing, just as slowly, for just as long."

That seems to settle something in her. She moves first this time — closes the distance with the same exactness she brings to everything, testing the space between you like she's testing a turn she hasn't attempted before, and when she kisses you it's precise and deliberate and entirely unguarded all at once, a contradiction only she could manage. "There," she murmurs after, quietly astonished at herself, forehead resting against yours for a moment before she pulls back just enough to see your face. "Decided."

"That easy?"

"Nothing about this was easy," she says, something rueful and warm in it now. "It only looks easy because I've spent eleven years learning to make difficult things look effortless. Don't mistake the two." She laces her fingers loosely through yours, testing the fit of it, unhurried. "I'd like to keep making this particular decision, if you're amenable. Every evening, if the quiet will have us both."

"The quiet already has us both."

"Good," she says, and there's nothing precise left in the way she says it — just relief, plain and unrehearsed, the kind she's clearly not used to allowing herself. "Good." She glances toward the window, at the last thin band of gold slipping off the mirrors and into ordinary dark, and doesn't move to turn on the lamps even now. "Stay a while longer. I find I like this part best — after the deciding, before either of us has to be anywhere else."

You do stay, and the two of you sit like that a long time, her shoulder against yours, the studio settling into the particular silence of a room that's finally allowed to just be a room, and not a stage, and not a rehearsal for something neither of you has to earn anymore.

· · ·

Months later, the studio's evening ritual hasn't changed much — barre, stretch, gold light through the windows — except now she pulls you up onto the floor with her, teaching you the basic positions with the same exacting patience she gives everything that matters to her. Your form is still terrible, and she tells you so without an ounce of mercy, correcting your turnout with two fingers at your hip like she's done a thousand times over the past months.

"You'll never be principal material," she says, adjusting your posture, amusement warm under the critique. "But you've got something better than technique."

"What's that?"

"You still don't fill the silence." She settles against you once the correction's made, uncharacteristically soft, the elegance never quite leaving her even at rest. "Eleven years on a stage, and nobody's ever made the quiet feel like this. Like it's actually enough, just as it is." Her hand finds yours, precise even in tenderness. "Keep up with it a while longer. I find I'm not tired of you yet."

"Only a while longer?"

"A very long while," she corrects, a rare full smile breaking across her face, the kind she used to save only for curtain calls and now spends freely on evenings like this one. "I retired the knees, not the discipline, and I've decided you're worth the discipline of staying. That's not a small thing, coming from me."

You tell her it isn't small to you either. She doesn't answer right away — just leans her head against your shoulder, watching both your reflections in the mirror instead of only her own, the gold light sliding slow across the glass the way it has every evening since the first one, except now there's nothing guarded left in the quiet at all.

"I read somewhere once," she says eventually, "that principal dancers are supposed to peak and then spend the rest of their lives chasing the memory of it. I believed that, for a while. I thought the best version of me already happened, onstage, years ago, and everything after would just be managing the decline gracefully."

"You don't believe that anymore?"

"No." She tilts her head back to look at you properly, the low lamp catching the line of her jaw, the small scar at her ankle tucked out of sight beneath her wrap pants tonight. "I think I mistook the applause for the peak. This is better. Nobody's clapping. Nobody's reviewing it in tomorrow's paper. It's just true, the way I always said I wanted this room to be, and it turns out true is better with someone in it who isn't going anywhere."

"I'm not going anywhere."

"I'm aware," she says, and there's real warmth in it now, none of the old caution left to guard against. "I've stopped needing you to promise it. I just notice you keep proving it instead, evening after evening, which is a better kind of proof than words ever were, in my experience." She straightens, pulling you with her toward the barre, correcting your hand placement with the same exacting patience she gives every dancer who's ever mattered to her. "Now. Again, properly this time. I intend to make an honest dancer of you yet, even if it takes the rest of both our lives."

"Is that a threat or a promise?"

"With me," she says, the faintest full smile breaking through, "it's rarely a difference worth making." She guides your arm into position, patient in a way she's never had to be with anyone she wasn't sure was worth the patience, and for a moment you both hold the pose together in the mirror — imperfect, unhurried, entirely honest. "There," she says softly, echoing herself from the very first night, though this time it isn't about the dancing at all. "Keep up with that a while longer, and I'll consider us even."`,
  },
  {
    character: "Harper",
    title: "Not on the Menu",
    setting: "a hidden speakeasy bar behind an unmarked door, low amber light, an old jazz record playing",
    genre: "romance",
    tone: "sultry",
    content: `Finding the door is the hard part — an unmarked panel behind a dry cleaner's, a knock in a rhythm someone half-drunk told you last week and you weren't sure you'd remembered right. It works anyway. Inside, it's all low amber light and a record spinning something warm and brass-heavy, and Harper's already looking at you before you've fully stepped through, like she clocked the door before it even finished opening.

"You look like you need something that's not on the menu," she says, sliding a coaster across the bar without being asked. "Lucky for you, I don't really follow the menu."

"Is there one?"

"Technically." She nods at a leather booklet gathering dust at the end of the bar. "Nobody good orders from it." She's already reaching for bottles, hands quick and certain, the kind of economy of motion that only comes from years of not needing to look at what she's doing. "Rough night, easy night, or an in-between night?"

"How can you tell there's a difference?"

"Everyone who walks through that door's having one of the three. You learn to read it fast in this business, or you pour people the wrong thing and ruin their evening." She sets a glass down — something amber, something she didn't ask your preference for and didn't need to. "In-between night. Trust me."

You do. It's good — better than good, exactly what you didn't know you wanted until it was in your hand, and you tell her so, which earns you the faintest satisfied tilt of her chin, like she collects that reaction and keeps a private tally somewhere.

"How'd you know?"

"Told you. I read the room." She leans against the back bar, arms crossed, watching you with the kind of assessing warmth that makes you feel like the only person in the building, even though there are four other regulars down at the far end deep in a card game, arguing good-naturedly over a hand somebody clearly misplayed. "Also, you knocked right. Means somebody who actually likes you sent you here, not some tourist blog. That already puts you ahead of most of my Tuesday."

"Should I be flattered?"

"You should finish your drink and tell me something true. That's the actual cover charge in here — the door's free, the story's not." She says it like a house rule, delivered a hundred times before, but there's something in the way she waits afterward — genuinely waiting, not performing the wait, elbows planted, full attention given without her seeming to notice she's given it — that makes it feel new, like maybe the house rule was invented for exactly this moment.

So you tell her something true. She listens like it costs her nothing and matters anyway, elbows on the bar, the record turning over behind her into its next warm, unhurried song, and somewhere in the middle of it she stops looking like a bartender doing her job and starts looking like someone who actually wants to know the answer.

"See," she says, when you're done, refilling your glass without being asked this time either. "Was that so hard? Regulars only get the good pour. Welcome to regular." She taps the bar twice, a small punctuation mark, like she's sealing something. "Don't make me regret saying that. I don't say it to just anybody who wanders in off a half-remembered knock."

"How many people get the good pour?"

"Fewer than you'd think." She nods toward the card game at the far end. "Those four, because they've been here longer than I have, technically — inherited them from the last owner along with the lease. Past that, it's a short list." She studies you over the rim of her own glass, something calculating and warm at once. "You're new to it. Don't get comfortable yet."

"Too late."

"Figured." She doesn't sound bothered by it. If anything there's something pleased tucked under the dry delivery, quick as it comes and gone. The record shifts into something slower, brass fading into a low, patient bassline, and for a moment neither of you says anything, just lets the room hold the quiet the way rooms like this one are built to. "Come back sometime that isn't a slow Tuesday. I want to see if you're this easy to talk to when the place is actually busy and I've got half my attention somewhere else."

"Is that an invitation?"

"It's a bet," she says, sliding your glass a half-inch closer. "I bet you come back anyway. I'm rarely wrong about that kind of thing."

· · ·

You become a fixture at the far end of the bar, and Harper starts pouring your drink before you've even sat down — a small ceremony that means more than either of you says out loud. The regulars have started nodding at you when you come in, folded into the rhythm of the place like you'd always been part of it, and Harper watches that happen with something like pride tucked under her usual dry commentary.

"You're here more than the regulars," she says, one night, sliding the glass over with a wink. "I'm starting to wonder if it's the drinks or the company."

"Can't it be the bartender?"

That gets a real laugh out of her, quick and delighted, the kind she doesn't spend on just anyone. "Smooth. I'll allow it, this once." She leans on the bar, closer than she usually stands, studying you with the same reading-the-room instinct she uses on strangers, except softer now, more personal, like she's reading you specifically instead of just gauging the room's mood. "I don't usually let people this close to the bar. Liability reasons."

"What kind of liability am I?"

"The kind I don't mind having." She says it plain, no games in it for once, and the record behind her spins on into its next slow song like it's giving the two of you room. She pours herself something small, uncharacteristically, and leans there a moment like she's decided the bar can survive without her full attention for once.

"Can I ask you something," you say, "or is that against house rules too?"

"Depends on the something."

"Why'd you pick this place? The hidden door, the knock, all of it. Seems like a lot of effort just to serve drinks."

She considers that, turning her own glass slowly on the bar. "Because anybody can walk into a bar with a sign out front. I wanted to know the people who came here actually wanted to be here — not just passing through because it was convenient." She glances at the card game down the end, the record, the low amber light. "I built something that only finds the people who go looking. Turns out that's a pretty good filter for who's worth pouring for."

"And me?"

"You went looking." She says it simply, like it settles something she'd been quietly weighing since the knock. "That counts for a lot, in my book."

She refills her own small pour, unhurried, and for a moment just watches the card game down the end without really seeing it, somewhere else in her head. "Can I tell you something a little embarrassing?"

"Always."

"I've started guessing your order before you sit down. Not because it's simple — because I've apparently been paying that kind of attention." She says it like a confession she didn't plan on making, a little annoyed at herself for the admission, though there's no real heat in it. "I don't usually memorize anybody's preferences past the first week. Saves me the disappointment when they stop coming."

"I'm not planning on stopping."

"Yeah, well." She turns the rag in her hands, restless in a way you haven't seen from her before. "People don't plan on a lot of things. I've had regulars for years who just stopped showing up one day, no explanation, and I never let myself wonder why because wondering doesn't pour any drinks." She glances back at you, something more open in her face than usual. "I caught myself wondering about you already. That's new. I don't love how fast it happened."

"Is that a bad thing?"

"Jury's still out," she says, but she's smiling when she says it, and she doesn't take the smile back for the rest of the night.

Later, when the card game finally packs it in and the room's down to just the two of you and the record, she pours one more round without being asked and slides it over slower than usual, like she's stalling the moment before you have to leave.

"You don't have to rush off," she says. "Slow Tuesday. Nobody's waiting on either of us."

"I wasn't planning on rushing."

"Good." She leans against the back bar, arms crossed, watching you with none of her usual performative reading-the-room detachment — just watching, plainly, like she's letting herself enjoy it instead of cataloguing it. "You know, most people who find this place treat it like a novelty. Tell their friends about the hidden bar, bring a date once to look impressive, never come back on their own. You keep coming back alone. I noticed that a while ago."

"Does that make me a novelty too?"

"No." She says it firm, no hesitation in it. "It makes you the first person who's found this place and treated it like it was actually about the place. About the record, the regulars, the quiet. About me, if I'm being honest, and not just the story of having found a bar nobody else knows exists." She taps the counter once. "That matters more to me than I probably let on."

· · ·

The speakeasy empties out early one night — a slow Tuesday, just you and the card game at the far end — and Harper finally steps out from behind the bar, taking the stool beside you instead of across it. It's a strange thing, watching her walk this side of the bar; she moves differently without the counter as a boundary, less performance in it, more just a woman in a room she happens to own.

"I never sit on this side," she admits, settling in, close enough that her knee brushes yours. "Bartenders don't get to be customers. Rule of the trade."

"Breaking the rule for me?"

"Apparently." She studies her own glass like it has answers she needs, turning it in slow half-circles on the bar top. "You've been good for my Tuesdays, is the truth of it. I don't know what to do with that information yet."

"You don't have to do anything with it tonight."

"No," she agrees, quieter, and doesn't move away when your shoulder settles against hers. The card game down the end erupts into a low groan over some lost hand, and neither of you looks over.

"Can I tell you something," she says, after a while, "that I don't usually tell people who drink here?"

"Always."

"I built this place after a bar I used to work at closed down under me — good bar, good regulars, landlord decided he wanted a nail salon instead. I swore I'd never build something people could just take away from me again. Hidden door, no sign, referral only. Nobody finds this place unless somebody already loves it enough to bring them." She looks at you, something unguarded in it now. "I don't let people sit on this side because it's the part of the bar that's actually mine. Not performance. Just me."

"I'm glad you let me sit here."

"Yeah," she says, soft, surprised at her own honesty. "Me too."

She's quiet a moment, watching the record spin, and then, like she's testing whether the confession earlier bought her the right to another one: "I've had people ask me out from behind that bar plenty of times. Regulars, tourists who found the door once and got brave on their second whiskey. I always say the same thing — I don't date the clientele, it's bad for business, keeps things simple." She glances at you sideways. "I haven't said that to you once. Not because you haven't given me the opening. Because I don't think I mean it anymore, where you're concerned."

"Why not?"

"Because simple stopped mattering somewhere around your fourth Tuesday in here." She says it like the admission costs her something, some careful architecture she's spent years building around herself finally coming loose at one corner. "I built this whole place so nobody could get close enough to matter without earning it first. Rules, the hidden door, the whole performance. You went and earned it without even trying, which honestly annoys me a little, if I'm being fully honest."

"I can try harder, if it'll make you feel better."

That gets a real laugh out of her, loud enough that the card game glances over. "Don't you dare," she says, nudging your shoulder with hers. "I like you exactly this unbothered about it. Keep doing whatever you're doing. Apparently it works."

She goes quiet again after that, turning her glass slowly, and when she speaks next her voice has lost most of its usual armor. "Can I ask you something, and you actually answer it instead of being charming about it?"

"Go ahead."

"Why do you keep coming back? Really. Not the version where you make a joke about the bartender. The real one."

You think about it, and you give her the true answer — that the bar felt like the first place in a long time that wasn't performing at you, that she was the first person who asked a real question and actually waited to hear the real answer, that something about the hidden door and the low light and her particular brand of dry warmth made you feel like you'd found somewhere worth being known.

She's quiet for a long moment after you finish, studying her glass like it might help her find the right thing to say back. "Nobody's given me an answer that honest in a long time," she says finally. "I don't know what to do with it except believe you." Her hand finds yours on the bar, brief, testing. "For what it's worth, I think I've been coming back to this exact conversation in my head for weeks now too."

· · ·

She closes the speakeasy early one night — flips the sign, bolts the unmarked door, keeps the record spinning just for the two of you. The regulars filter out with knowing looks, like this has been a long time coming and they're relieved to finally see it land.

"I don't usually do this," she says, pouring two glasses instead of one behind the empty bar. "Close early for someone. Regulars usually just get the good pour. You're getting the whole bar."

"What did I do to earn that?"

"Existed, mostly. Kept showing up even on the slow nights." She comes around to your side properly this time, no bar between you at all, and there's none of her usual performance left in the way she looks at you. "I read rooms for a living. I've never once misread one as badly as I almost did with you — thought I could keep this professional. Didn't work."

"I'm not complaining."

"Good." She sets both glasses down, untouched, like suddenly the drinks were never really the point of the evening. "I've been rehearsing what to say to you for about two weeks now, if you want the embarrassing truth. Wrote out actual lines like some lovestruck teenager. Every one of them sounded stupid the second I imagined saying it out loud."

"What would the least stupid one have been?"

"Something like — I've poured drinks for a thousand strangers and never once wanted to stay on this side of the bar for any of them. Until you." She laughs at herself, a little rueful. "Told you. Stupid."

"I don't think it's stupid."

"No?" She studies you, something hopeful cracking through the usual dry composure.

"No."

"Good." She sets the rag down at last, like she's finally decided the bar doesn't need tending to more than this does. "Because I've been sitting on that line for two weeks feeling like an idiot, rehearsing it in the mirror behind the register when nobody was looking, and every version I practiced ended with you laughing me out the door. Turns out I didn't need any of them."

"You could've just said it plainer. I would've said yes to plainer."

"Where's the fun in plainer." But her voice has dropped, lost the joke somewhere underneath, and when she looks at you now there's nothing performed left in it — no reading the room, no bartender's practiced warmth handed out to whoever's sitting closest. Just her, quiet, a little nervous in a way you've never once seen from her. "Tell me if I'm wrong about this."

"You're not wrong."

"Good." She lets out a breath, like she'd genuinely been bracing for the other answer, and for a second the careful composure cracks all the way open — no wit to hide behind, no house rule to fall back on, just Harper, plainly wanting something and letting herself be seen wanting it. "I haven't felt like this behind a bar in longer than I'd care to admit. Maybe ever, if I'm being fully honest, which apparently I'm doing a lot of tonight."

"I like this version of honest on you."

"Don't get used to it. I'll ration it back out over time, in small doses, so you don't get spoiled." But there's no real bite in it, just warmth, and the joke buys her exactly enough time to steady herself before she reaches for you instead of the rag this time. "Come here."

She closes the last of the distance herself, sure and unhurried, and kisses you like she's been rationing the urge for weeks. The record spins on, warm and brass-heavy, entirely unbothered by the silence that follows.

· · ·

Months later, you've got a permanent stool — not at the far end anymore, but right behind the bar with her, technically against every rule of the trade she's ever quoted you. You've learned to pour a passable version of her signature drink, though she still swears you get the ratio wrong on purpose just to make her come check.

"Welcome to regular," she says again, echoing that very first night, refilling both your glasses without being asked. "Turns out regular wasn't the whole story, though."

"No?"

"No." She leans into you, easy now in a way she never lets herself be with anyone else, the unmarked door locked for the night behind you both. "Turns out the cover charge was never really the story. It was you, staying anyway, even after I gave you every excuse to leave."

"I never needed an excuse to stay."

"I know that now." She traces a slow circle on the bar with one finger, thoughtful. "You know, I used to think this place was the whole plan — the hidden door, the filter for who's worth my time, all of it built so I'd never have to need anybody who could just walk away. Funny how that plan ended with you behind my bar anyway."

"Funny how plans do that."

"Don't get smug about it." But she's smiling when she says it, the record turning over into another slow song, the low amber light settling warm across both your faces.

"You ever think about what would've happened if I'd knocked wrong that first night?" you ask. "If I'd gotten the rhythm off and just walked away."

"Thought about it plenty, actually." She traces the rim of her glass, thoughtful. "Used to scare me a little, how much of this ended up depending on you remembering a knock some half-drunk stranger taught you at a party. Then I figured — if you were the kind of person worth all this, you'd have found your way back through that door one way or another. Persistent types usually do."

"Confident."

"I read rooms for a living. I read people the same way." She sets her glass down, turns fully to face you, no bar and no crowd and no performance left standing between you. "I knew what I was looking at the second you stepped through that door. Took me longer than I'd like to admit to stop pretending otherwise."

"Worth the wait?"

"Every slow Tuesday of it." She traces a slow line along your knuckles, unhurried, like she's still getting used to the fact that she's allowed to. "You know what the strangest part is? I still lock that door every night like I used to. Still do the knock-and-check for anybody who wanders up without one. Difference is, now I do it hoping it's you, instead of just hoping it's nobody I have to bother pouring for."

"High praise, from you."

"Don't let it go to your head. I've got a reputation to protect." But she's grinning when she says it, easy, the kind of grin she used to ration out one careful degree at a time and now just gives away, plain, because apparently that's allowed now too. "For what it's worth — I've had a lot of good nights behind that bar. Never once had one I wanted to keep, the way I want to keep this."

"Keep it, then."

"Planning on it." She kisses you slow, unhurried, like there's nowhere else either of you is supposed to be, the record turning over into one more song neither of you is in any hurry to let end. "Best pour I ever gave anyone, if you ask me. Wasn't even in a glass."`,
  },
  {
    character: "Scarlett",
    title: "The Show Doesn't Start Yet",
    setting: "a burlesque theater dressing room backstage, mirrors ringed with bulbs, feathers and corsets everywhere",
    genre: "romance",
    tone: "sultry",
    content: `The dressing room is chaos in the good way — feathers, sequins, three half-finished cups of coffee, mirrors ringed in bulbs bright enough to see every flaw and somehow making Scarlett look like she doesn't have any. She catches your reflection in the glass before she turns around.

"Eyes up here, darling." Not sharp — amused, like she caught you exactly where she wanted you. "The show doesn't start until I say it does."

You'd been told to wait by the door. You'd meant to. The room had other plans — the smell of stage powder and hairspray, the low hum of the house band warming up somewhere past the curtain, the sheer gravity of her presence pulling your attention before you'd even decided to give it.

"Sit," she says, nodding at the velvet stool in the corner without breaking her own reflection's gaze, finishing a line of red at her mouth with the steadiness of someone who's done this ten thousand times and still takes it seriously. "You get the good seat tonight. Don't make me regret it."

"What did I do to earn the good seat?"

"You showed up early and you didn't say a word when you walked in. Most people either gawk or perform being unbothered, badly." She sets the lipstick down, turns fully now, and the attention lands on you like weather — total, unhurried, impossible to look away from. "You just watched. I like being watched by someone who means it."

Somewhere past the door, the house band is warming up, brass finding its pitch in lazy, confident runs. Scarlett doesn't hurry for it — laces one glove, then the other, each motion deliberate, like she's giving you time to look and isn't shy about knowing it. She catches you tracking the movement and holds your eyes a beat longer than necessary, like she's testing whether you'll be the one to look away first. You aren't.

"Nervous?" she asks, not because she thinks you are — more like she's curious whether you'll admit it.

"Should I be?"

"No." A slow smile, the kind that promises something without naming it. "But it's a good sign if you are, a little. Means you know exactly what you walked into." She stands, and the room seems to reorganize itself around her without trying to, feathers and light and the low murmur of the crowd filling in past the walls all suddenly secondary to the fact of her standing in front of you. "Most people who end up in this chair think the show's the interesting part. I've always thought the getting-ready was."

"Why's that?"

"Because the show's for them." She nods toward the curtain, toward the sound of a hundred strangers finding their seats. "This part's for me. Nobody's watching me decide who I want to be tonight except whoever I let into the room. That's a much smaller list than you'd think, for someone who spends her evenings half-undressed in front of strangers."

"I'm flattered to be on it."

"Don't get used to it yet. The list is short and I revise it often." But there's warmth threaded all through the warning, and she checks her reflection one final time with the satisfaction of someone who knows exactly what she's about to do to a room full of people.

She stands, testing the give of the corset with a small twist of her waist, and catches you watching that too. "You're allowed to look, for the record. I built this whole body of work — the show, the costumes, the reputation — precisely so people would look. I'd find it strange if you didn't."

"Most people would find that forward, coming from a stranger."

"I'm not most people, darling, and neither, I suspect, are you — otherwise you'd have gawked or performed unbothered like the rest of them, and we wouldn't be having this conversation." She finds her heels, steps into them one at a time with the unhurried confidence of someone who's never once needed to hurry for anybody. "I've been doing this show for six years. Built it from nothing — a folding chair and a hand-me-down feather boa in a rented room above a laundromat. I don't let people watch me get ready unless I've decided they're worth the vulnerability of it."

"Then I really am flattered."

"Good. Hold onto that feeling." She checks the mirror one last time, satisfied. "Stay after. I don't invite just anyone backstage twice."

The band hits its cue. She winks, once, unhurried, and sweeps toward the curtain like the whole night was built around her entrance — because it was.

You stay. Obviously, you stay.

· · ·

You become a fixture in the good seat, every show, and Scarlett starts finding you in the crowd before her opening number the way a performer finds their one favorite face — quick, certain, gone in a blink but unmistakably there every time. You've learned the rhythm of her routine now: the powder, the gloves, the particular hush she goes quiet for right before the band's final warning cue.

"You keep showing up," she says backstage after, wiping stage paint from her collarbone with unhurried confidence. "I'm used to admirers. I'm not used to ones who come back for a fourth night running."

"Is that a problem?"

"No." She says it slow, turning the word over like she's deciding how much to give away. "It means I get to stop performing for you eventually. Just be Scarlett, not the show." A pause, a rare flicker of something unguarded. "I don't offer that to many people."

"I'd like that. Just Scarlett."

Her smile changes at that — softer at the edges, less rehearsed. "Careful what you ask for, darling. She's a lot more than the stage version." She settles onto the arm of the velvet chair, still half in costume, corset laces loosened just enough to breathe properly for the first time all night. "The stage version gets to be fearless because none of it's actually risky. Everyone in that house already paid to want her. Off the stage, wanting someone back is a different kind of exposed."

"You don't seem like someone who gets exposed easily."

"I've had a lot of practice looking like that's true." She studies you, something calculating and warm in equal measure, the same look she gives an audience right before she decides exactly how much to give them. "You're the first person in a long while I've caught myself wanting to actually be honest with, instead of just impressive. That's inconvenient. I built this whole persona so I wouldn't have to risk being just Scarlett with anyone."

"Maybe it's not as risky as you think."

"Maybe." She reaches over, adjusts the angle of your collar for no reason at all beyond wanting an excuse to touch you, unhurried about it. "Keep showing up and we'll find out together. I find I don't mind the experiment, so long as it's you running it."

She sinks back into her chair properly now, kicking off one heel and tucking her leg up beneath her, more relaxed than you've seen her since that first night. "You want to know something funny? I used to think the whole point of building this act was so nobody could ever get close enough to disappoint me again. Audiences are safe. They love you exactly as much as the show earns, no more, no less, and you never have to find out if they'd love the version of you that forgets her lines or has a bad night."

"And now?"

"Now I've got some stranger showing up four nights running just to watch me put on eyeliner, and I keep finding myself hoping you'll come back a fifth." She shakes her head slightly at herself, amused. "It's inconvenient. I had a whole plan for staying unbothered by anyone, and you've gone and made a mess of it without even trying very hard."

"I could try harder, if you want."

"Don't you dare." It comes out fast, almost sharp, and then she laughs at her own reaction, a real laugh, unguarded. "I like the unbothered version of you showing up anyway. Keep doing exactly that."

She reaches for the champagne someone left cooling in a bucket by the vanity, pours two glasses without asking if you want one, hands you the fuller of the two like it's a small ceremony she's decided on privately. "To the fourth night running," she says, raising her own glass. "And whatever number we're apparently working toward next."

"To finding out."

"Mm." She drinks, watching you over the rim, something warm and assessing in the look. "You know, most of my admirers stop showing up once the novelty wears off. Third night, fourth at the latest. I've learned not to expect anyone past that." She sets the glass down, quieter now. "You're already past it, and you don't seem to be slowing down. I don't quite know what to do with that yet, except keep leaving your good seat open."

"Keep it open as long as you like."

"Oh, I intend to." The old confidence is back in her voice, but there's something new folded into it now too — something that sounds almost like hope, dressed up in her usual certainty so it doesn't have to admit what it actually is.

· · ·

She lets you into her dressing room before a show one night, not after — an intimacy she clearly doesn't extend often, watching your reaction in the mirror as she does her makeup slow and deliberate, narrating each step like a ritual she's finally decided to share.

"Most people only ever see the finished version," she says, lining her eyes with practiced precision. "You get to see the work. That's not nothing, from me."

"Why me?"

"Because you watch like it matters, not like you're waiting for the next reveal." She sets the brush down, turns fully to face you, closer now than the mirror allows. "I like being seen like that. It's rarer than you'd think, in my line of work."

She goes back to the mirror but keeps talking, more than she usually does before a show, like something about your presence loosens the usual pre-show ritual of silence. "Every night, I paint on this face and I become someone who owns every room she walks into. It's not fake, exactly — I built her, and she's mine, and I love her. But she's also armor. Nobody backstage sees what happens underneath it most nights."

"What happens underneath it?"

"Depends on the night." She finishes the second eye, checks the symmetry with a critical tilt of her head. "Some nights, nothing — I put her on and she fits like my own skin, easy. Some nights I have to work harder to convince myself she's not just a costume I'm hiding inside." She meets your eyes in the mirror, steady. "Tonight's an easy night. I think that's your doing."

"I didn't do anything."

"You showed up. You watch like it matters. Apparently that's enough to make the good nights easier and the hard nights bearable." She stands, closing the space between the mirror and where you're sitting, and there's nothing performed left in the way she looks at you now. "I don't say things like that. I'm saying it anyway. Take it as the compliment it is."

"Can I ask you something," you say, "before you close the distance you're clearly working up to?"

That surprises a laugh out of her, quick and delighted. "Was I that obvious?"

"A little."

"Fine. Ask."

"Do you ever get tired of being the one who decides when things start? The show, the room, all of it — always on your terms."

She considers that for a long moment, the practiced calculation in her face giving way to something more genuinely thoughtful. "I used to think control was the whole point," she says slowly. "Decide everything before anyone else can decide it for you, and nobody gets to catch you off guard. It's worked for six years. I've never once regretted building it that way." She meets your eyes, steady. "But I'll admit, some nights, it would be nice to let someone else decide something, and trust that I'd survive it either way."

"You could let me decide something. Right now, if you wanted."

Something flickers across her face — surprise, then a slow, considering smile. "Careful," she says. "That's a bigger ask than you realize, coming from me." But she doesn't pull back. If anything, she leans a fraction closer, waiting.

"You don't have to decide everything tonight," you say. "Just this one thing."

"Just this one thing," she repeats, testing the shape of the sentence like she's trying it on. Something in her shoulders loosens, the calculation falling away entirely. "All right. Decide, then. I find I'm curious what it feels like, for once, to just let it happen instead of orchestrating it."

Her hand finds your jaw, unhurried, testing the moment before she closes the last of the distance and kisses you — slow, certain, none of the performance from the stage in it at all, just her. When she pulls back, there's something like wonder in her face, quickly smoothed back into her usual composure, though not quite quickly enough for you to miss it.

"Well," she says, a little breathless. "That's new."

"Good new?"

"The best kind."

· · ·

The theater's empty after a late show one night, house lights down, and Scarlett doesn't rush to change out of her costume — just settles beside you on the same velvet stool she gave you that first night, corset laces still loose at her back, feathers from her headpiece scattered across the vanity where she'd tossed it without ceremony.

"I don't usually let the night follow me offstage," she admits, voice quieter than her usual sultry register, something more real underneath it. "The confidence. It's mostly a costume too, if I'm honest. I built it because I needed it. Doesn't mean it's not tiring, some nights, holding it up alone."

"You don't have to hold it up alone."

That lands somewhere soft in her, a crack in the composure she wears so well. She's quiet a long moment, tracing the edge of the vanity with one finger, like she's deciding how much further to let the armor down.

"I started this whole show because a director once told me I'd never headline anything — too much, too loud, took up too much room for anyone's comfort. So I built my own stage where taking up room was the entire point, and I dared anyone to tell me otherwise ever again." Her voice wavers, just slightly, the first crack you've heard in it since you met her. "It worked. I never let anyone tell me I was too much again. But I also never let anyone close enough afterward to find out if I actually believed I deserved to be wanted quietly, off the stage, without the feathers and the lighting doing half the work."

"I want you quietly. No stage required."

She's quiet for a moment, and when she speaks again her voice has lost its usual polish entirely. "The director who told me I was too much — I still hear him sometimes, in the wings, right before I go on. Isn't that ridiculous? Six years, a packed house every weekend, and some man's opinion from a decade ago still gets a front-row seat in my head." She laughs, but there's no real humor in it. "I built all of this loud enough to drown him out. Most nights it works. Some nights I still need the volume."

"You don't need the volume with me."

"No," she agrees, leaning into you properly for the first time, no performance left in the gesture at all. "I don't think I do, anymore." She's quiet a moment longer, and then, softer: "I haven't told anyone that story in years. The director. I usually just say I built the show out of ambition, which is true, but it's not the whole truth. The whole truth is smaller and more embarrassing than ambition. It's just wanting to be enough."

"You've always been enough. Even before the stage."

Her head finds your shoulder, and for once, Scarlett lets herself just be held instead of watched, the empty theater holding the quiet around you both like it, too, is relieved to finally see the show end for the night. Neither of you says anything else for a long while. She doesn't seem to need you to.

Eventually she stirs, tilting her head up to look at you, something rueful in her expression. "I don't usually let anyone see me like this. Corset half off, mascara probably halfway down my face by now, no volume left to hide behind." She laughs softly at herself. "I built an entire persona around never being caught looking anything less than in control. You've caught me twice now in one month."

"I like both versions of you. The volume and the quiet."

"That's dangerous information to hand someone," she says, but she's smiling when she says it, settling back against you like she's decided the risk is worth taking. "Most people only ever want the loud one. She's easier to want — she doesn't ask anything of you, she just performs and lets you clap and go home satisfied." Her voice softens further. "Nobody's ever really wanted to sit with the quiet one before. I'm finding I don't mind that you do."

· · ·

Months later, you've still got the good seat, though these days it's less about the show and more about the woman who slips into the seat beside you the second her set ends, makeup half off, utterly herself.

"Eyes up here, darling," she says, echoing that very first night, though it's warm now instead of a warning, a private joke between you both. "Still the only rule in the house. Some things don't change."

"What's changed, then?"

"Everything after." She laces her fingers through yours, unhurried, certain. "I used to send everyone home after the show. You're the only one who gets to stay for what comes next." She glances toward the empty stage, dark now, curtain still swaying faintly from her final bow. "I built that whole act so I'd never need anyone to want the woman underneath it. Funny thing about building something that good — eventually somebody sees straight through it anyway, and you find out you wanted to be seen the whole time."

"I saw straight through it the first night. Sat there in the good seat like an idiot, completely gone on you."

"I know. I clocked it before you'd even sat down properly." She smiles, easy and unguarded, nothing like the practiced sultry curve she gives an audience — this one's just for you. "I've built a lot of things in my life. This theater. That persona. A whole career out of never apologizing for taking up space. Turns out the best thing I ever built was room enough in all of it for you to fit."

"High praise, from you."

"Don't let it go to your head." She glances toward the vanity, at the feathers scattered across it, the mirror ringed in bulbs that's watched six years of her getting ready for a room full of strangers. "You know, I used to think I'd built this whole life so I'd never need anyone the way people need each other in the boring, ordinary version of a relationship. Show up, perform, take the applause home instead of a person. Simpler that way. Nobody to disappoint, nobody to lose."

"Doesn't sound simple. Sounds lonely."

"It was, if I'm honest, though I'd never have admitted that to anyone before you." She turns your hand over in hers, tracing the lines of your palm absently, like she's memorizing something. "I don't feel that particular loneliness anymore. Which is either the most romantic thing I've ever said or the saddest confession about my previous life choices, and I genuinely can't tell which."

"I'll go with romantic."

"Smart choice." She smiles, easy and unguarded, nothing like the practiced sultry curve she gives an audience — this one's just for you. "For the record, darling — I still love the stage. I still love the show, the feathers, the whole ridiculous glamour of it. I just don't need it to be the only place I feel like I'm enough anymore. You did that. I'm still deciding how I feel about owing anyone that much."

"You don't owe me anything."

"I know. That's rather the point of it, isn't it." She glances out toward the dark, empty stage one more time, something fond and a little wistful in the look. "Six years ago I stood on a folding chair in a room above a laundromat and swore I'd never again let anyone make me feel like I was too much. I never once imagined the ending to that story would be someone making me feel like exactly enough instead. Didn't think that was a thing I got to have."

"You get to have it. For as long as you want it."

"Careful, darling. I intend to want it for a very long time, and I always get what I want eventually. Ask anyone who's seen the show." She kisses you slow, backstage lights dimmed, feathers and sequins forgotten in every corner of the room. "Best encore I've ever given anyone, if you ask me. And believe me, darling, I know a good encore when I'm giving one."`,
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

She runs you through it mercilessly — form corrected with two fingers at your hip, at your shoulder, close enough that you lose track of whether you're concentrating on the exercise or on how near she's standing while she fixes it. She doesn't apologize for the proximity. She doesn't seem to think it needs one. The mirrors catch every angle of it, multiplying her attention until it feels like there are a dozen versions of her watching you fail to keep your elbow tucked.

"Again," she says, after a set you thought was fine. "You're holding back. I can tell. Don't."

"How can you tell?"

"Because I always can." She steps back, arms crossed, watching you with an attention that has weight to it, assessing and unhurried, like she's got nowhere else worth being. "I've trained enough people to know the difference between someone who's actually at their limit and someone who's decided the limit exists a rep early because it's more comfortable there. You've got more in you than you're giving me. I want all of it, not the polite version."

"What happens if I give you all of it?"

"Then we find out where your actual limit is, instead of the one you've been lying to yourself about." She says it plainly, like it's the most obvious thing in the world, and something about the certainty in her voice makes you believe her more than you believe your own doubt.

You give her more. She watches every rep like it's the only thing happening in the building, counting under her breath, correcting your grip once more with a hand that lingers a half-second longer than the correction requires, and when you finally finish, breathing hard, she's closer than she was at the start — close enough that the satisfied look on her face feels like it's meant only for you.

"There it is," she says, quiet now, almost warm underneath the command. "See what happens when you stop holding back for me?"

"That's not what I expected from tonight."

"Most people don't expect it. That's usually the problem." She hands you a towel, watching you towel off with an assessing look that hasn't fully faded into anything softer yet, though it's trying to. "Same time next week. I want to see if tonight was luck or if there's actually something under all that holding back."

The mirrors throw the moment back at you from every side. Neither of you looks away first.

She racks the last of the weights herself, methodical, unhurried, and when she turns back to you there's an assessing look on her face that's less about your form now and more about you generally.

"Most people who walk in here for the first time quit somewhere around week two," she says. "They think they want to be pushed until they actually get pushed. Then they remember they liked the idea of it more than the reality." She crosses her arms, studying you like a problem she hasn't finished solving. "You didn't flinch tonight. Even when I told you to give me more than you thought you had left."

"Should I have flinched?"

"No. I liked that you didn't." She says it plainly, no performance in it, though there's something almost reluctant in the admission, like she's not used to volunteering compliments this early. "I don't say that to just anyone who books a session. Most people get the polite version of encouragement — good work, nice set, see you Thursday. I don't waste that on people I don't think are actually capable of more."

"So what do I get instead?"

"The truth. Which is that you're better than you think you are, and I intend to prove it to you whether you like it or not." A ghost of a smile, there and gone. "Next week. Don't be late, and don't disappoint me. I meant that the first time too."

· · ·

You start booking every late slot she has, and Delilah stops pretending it's just business the third week running — starts warming up beside you instead of watching from across the room, close enough that her shoulder brushes yours between sets. The gym after hours has become its own private ritual: the hum of the ventilation, the particular quiet of a room built for effort and nothing else, her voice low and certain in the space between reps.

"You're improving," she says, an observation more than a compliment, though it lands like one anyway. "Most people plateau by now. You keep giving me more to work with."

"Is that a good thing?"

"It's a rare thing." She studies you, arms crossed, the same assessing weight in her look as always, though warmer now, less clinical. "I don't usually keep clients this long. I get bored once I've figured someone out." A pause, almost reluctant. "I haven't figured you out yet. It's inconvenient. I keep wanting another session just to try."

"Maybe I'm just that complicated."

"Maybe I just like the excuse." She says it dry, but there's real heat banked underneath it, and she doesn't look away when you catch it. She racks the weight she'd been loading, deliberate, and leans against the bench instead, some of her usual clipped efficiency slowing down into something more considering.

"Can I ask you something," she says, "that's not about your form?"

"Go ahead."

"Why do you keep coming back? Most people I train want results and nothing else — they want to look a certain way, hit a certain number, and they resent me a little the whole time for making them earn it. You don't seem to actually care about the number on the bar."

You tell her the truth — that you started coming for the workout and kept coming because being pushed by someone who actually noticed when you were capable of more felt like being seen in a way that had nothing to do with how you looked and everything to do with who you were underneath the effort.

She's quiet for a moment, processing that with the same careful attention she gives a client's form. "Nobody's ever put it that way to me before," she admits. "I usually assume people stick around for the results, or because they think pushing themselves near me is some kind of thrill. I don't think anyone's ever told me they stayed because I saw them." Her voice has dropped, lost some of its usual sharp edge. "I don't know what to do with that except keep showing up for it too."

She's quiet for a while after that, longer than her usual efficient silences between sets, and when she speaks again it's slower, like she's testing whether she wants to say it at all. "Can I tell you something I don't usually admit to clients?"

"Always."

"I got into this line of work angry. Furious, actually, for a long time — at the coaches who told me I wasn't quite enough for the team, at my own body for stopping half a step short of where I needed it to be. I built this whole career out of proving I could still make someone better even if I never got my own shot." She flexes one hand, absent, remembering something. "For years, every session was a little bit about that anger. Pushing someone else because I couldn't push myself into a result I actually wanted."

"And now?"

"Now I show up to train you and I mostly just want to see you do well. Not to prove anything. Just because." She looks almost surprised at her own answer. "That's new. I don't know what to call it yet, except that it's different from anything I've built this gym around before."

"Maybe you don't have to call it anything yet."

"Maybe," she says, and there's something almost gentle in the way she says it, entirely unlike her.

She loads the bar again after a moment, like she needs the familiar motion to steady herself back into something recognizable, but she doesn't put the same clipped efficiency into it that she usually does. "Don't tell my other clients I got sentimental on you," she adds, dry, the usual edge creeping back in. "I have a reputation to maintain. Dangerously satisfied, sharp, no room for feelings during a working set."

"Your secret's safe with me."

"It had better be." She checks the weight, nods to herself, and glances back at you, something warmer than usual in the assessment. "Same time Thursday. And don't think I'm going easier on you just because I said something honest for once. If anything, I expect more out of you now that you know I'm paying attention for reasons besides the reps."

"I wouldn't expect anything less."

"Good," she says, satisfied, and for a moment the gym feels less like a place built out of old anger and more like exactly what she said it had become — something new, still taking shape, still hers to decide what to call.

· · ·

She corrects your form one night with both hands instead of two fingers — full contact, deliberate, lingering a beat longer than any exercise requires, and neither of you pretends it's just technique anymore. The gym's empty around you, the mirrors catching the low light and throwing it back thin and gold, everything quieter than usual, more charged.

"You're not holding back tonight," she murmurs, close enough that you feel the words more than hear them. "I noticed. I like it when you stop holding back."

"You make it hard to hold back."

That gets a low, satisfied sound out of her, entirely unlike her usual clipped commands. "Good," she says. "I don't want you holding back. Not with the reps, not with anything." Her hand stays at your waist, steady, sure, testing whether you'll close the last of the distance yourself.

She doesn't move away, but she doesn't push either — just waits, watching you with the same patient intensity she brings to counting out a difficult set, like she already knows the answer and just wants to see you arrive at it yourself.

"You know," she says, when the silence stretches, "I don't usually let sessions run this quiet. I fill dead air with corrections, with counting, with keeping myself busy so I don't have to think about anything except the work. Tonight I keep running out of things to correct."

"Maybe there's nothing left to correct."

"Maybe." Her thumb moves slightly against your waist, absent, testing. "Or maybe I've just stopped wanting to look for something wrong so I have an excuse to keep my hands on you like this." The admission seems to surprise her as much as it surprises you, like she hadn't quite meant to say the second half of that sentence out loud.

"I don't mind either reason."

"No," she agrees, low. "Neither do I, apparently."

You do close the distance. She meets you the rest of the way, intensity finally aimed somewhere other than your form.

When she finally steps back, there's a rare flush to her that has nothing to do with the workout, and she takes a second to gather herself, uncharacteristically flustered.

"I don't usually lose track of a session like that," she says, half to herself. "I pride myself on control. Pacing, form, tempo — I notice everything, all the time, that's the whole job." She looks at you, something almost accusatory in it, though there's no real complaint underneath. "You made me lose track of all of it just now. I don't know whether to be annoyed or impressed."

"Can it be both?"

"It can be both." A low laugh, surprised out of her. "I think I've been circling this for weeks and pretending it was about your grip strength. It was never about your grip strength."

"I had a feeling."

"Don't get smug about it." But she's smiling, real and unguarded, stepping back into your space instead of away from it. "I don't smile like this. Ask anyone who's trained with me. I don't know what you've done to change that, but I'd like you to keep doing it."

"I intend to."

"Good." She glances at the clock on the wall, at the hour that's crept later than either of you noticed. "We're keeping this gym open a lot longer than the schedule allows. I don't actually mind."

Before you leave, she stops you at the door, hand light on your arm, uncharacteristically hesitant. "One more thing," she says. "Next session — I want to try it without an excuse. No form to correct, no reps to count. Just you and me, whatever that ends up looking like." She holds your gaze, steady despite the admission clearly costing her something. "I've never asked anyone that before. Usually the workout's the whole point. I find I don't want it to be the whole point with you anymore."

"I'd like that too."

"Good." She lets go of your arm, businesslike again for just a second, like she needs the armor back on to get through the rest of the goodbye. "Thursday, then. Same time. Don't be late."

You tell her you wouldn't dream of it, and she watches you go with an expression you've never seen on her before — something unguarded, something almost nervous, gone the instant she notices you noticing.

· · ·

The gym stays locked long after your session ends one night, neither of you in any hurry to leave, Delilah finally sitting still for once, back against the mirrored wall beside you instead of standing over you giving orders. It's a strange thing, seeing her at rest — no bar to load, no rep to count, just her, wrist wraps finally off, hands loose in her lap.

"I don't let people see me not in control," she admits, voice rougher than usual. "It's part of the job. Command, certainty, no room for doubt. Doesn't leave much space for anything else."

"You can be uncertain with me."

She looks at you like that's a foreign concept, turning it over slowly before she accepts it. "I've spent a long time building this version of myself," she says. "The one who doesn't hesitate, who doesn't apologize for pushing people past where they thought they'd stop. I built her after I didn't make an Olympic team I trained four years for — decided if I couldn't be the best at competing, I'd be the best at making other people find out what their best actually looked like. It worked. I've never once doubted myself in this gym since."

"Until now?"

"Until now." She exhales, something loosening in her shoulders that you've never seen loosen before. "You don't need me to push you the way my clients do. You're already trying. Which means I don't actually know what I'm supposed to be to you, and I don't love not knowing things. It's the one rep I haven't figured out how to complete."

"I'll consider that a standing invitation," she says, and then, quieter: "I want more of this. Whatever this is becoming. I don't say that lightly."

"I don't take it lightly."

That's all it takes — she closes the distance, sure despite the rare vulnerability, and kisses you with the same intensity she brings to everything, no held-back version of herself left in it at all. When she finally pulls back, there's something almost startled in her expression, like she hadn't expected to want something this much and have it turn out to be simple.

"Well," she says. "That settles that argument I've been having with myself for weeks."

"Which argument?"

"The one where I kept telling myself this was just about the training." She lets out a breath, something loosening further in her posture, like admitting it out loud finally lets her stop fighting it. "I've dated a little, since the team, since I built this place. Never anyone I let this close, though. Most people want the version of me that pushes them in a set and then goes home. Nobody's ever really asked to see what's underneath the discipline."

"I'm asking."

"I noticed." She studies you, something almost soft breaking through the usual sharp assessment. "It's going to take some getting used to, letting someone see me not have all the answers. I've built a career on always having the answer — the right form, the right number of reps, the right way to push someone past a limit they didn't think they had. I don't actually know what the right move is here. I'm making it up as I go, which terrifies me a little."

"You don't have to have the answer. Not with this."

"That's either the kindest thing anyone's said to me in years, or the most dangerous," she says, quiet, "and I find I don't actually mind not knowing which."

She's quiet a while, and then, like she's deciding to hand you one more piece of herself: "I used to think being wanted for my control was the safest version of being wanted. Nobody expects anything more from you if all they want is the discipline, the certainty, the person who never hesitates. It's a good hiding place, being excellent at something. Keeps people from asking what's underneath it."

"I'm asking what's underneath it."

"I know. I noticed weeks ago, actually, if I'm honest — you never once seemed satisfied with just the trainer version of me. Kept asking questions that had nothing to do with form." She shakes her head slightly, something rueful and fond in it. "I told myself I'd shut that down eventually. Never did. I think some part of me wanted you to keep asking."

"I'm glad I did."

"So am I," she says, and it costs her something to say it, you can tell, but she says it anyway, steady despite the cost.

· · ·

Months later, the sessions have stopped being about the reps entirely, though she still makes you work for every bit of her approval, laughing when you point that out. The gym's the same as it ever was — same mirrors, same dim overhead lights, same wall of racked equipment — but the ritual of it has changed shape entirely, more homecoming than training now.

"On your feet," she says, echoing that very first night, though it's an invitation now instead of a command, offered with a private smile only you get to see. "I still don't repeat myself twice. Some things don't change."

"What's changed, then?"

"I stopped needing an excuse to want you close." She pulls you in by the collar of your shirt, mirrors throwing the moment back at you both from every angle, same as that very first night — except this time, neither of you is holding anything back at all.

"You know," you say, "you never did tell me if that first night was luck, or if there was actually something under all that holding back."

"There was something," she admits, low, certain. "I knew it the second you caught the gloves I threw without looking. Most people fumble it. You didn't. I decided right then you were worth finding out about, even if I didn't let myself admit that for another three sessions." She traces a slow line along your jaw, unhurried, nothing like her usual clipped efficiency. "I've trained a lot of people in this gym. Pushed them harder than they thought they could go, watched them find muscle and discipline they didn't know they had. Never once found something like this in the process. Not until you."

"High praise, from someone who doesn't repeat herself twice."

"Don't get used to it." But she's smiling, easy in a way she never lets herself be with anyone else. She glances around the gym — the racked weights, the mirrors, the wrist wraps she still wears out of habit more than necessity now — like she's taking stock of everything that led here. "I built this place to prove I didn't need the team that cut me, that I could still be the best at something even if it wasn't the thing I originally wanted. It worked. I got exactly what I set out to prove."

"And?"

"And it turns out proving something to myself wasn't actually the finish line I thought it was. This is." She pulls you in again, closer this time, nothing held back in the gesture at all. "I don't say things like that. I've never had a reason to before you. Don't let it go to your head — I still expect you on your feet the second I ask, every single time."

"Wouldn't dream of disappointing you."

"Good," she says, low, certain, "because I meant what I said the very first night. I don't repeat myself twice." She glances toward the door, at the gym gone quiet and dark past the ring of light you're both standing in, and something settles in her that looks like peace, plain and uncomplicated. "You know, I spent years telling myself the empty gym after hours was the reward. The one place nobody could tell me I wasn't enough. Turns out the reward was always going to be someone standing in it with me, if I ever let them."

"Glad I get to be that someone."

"So am I. More than I let on most days." And when she kisses you this time there's nothing left to correct, nothing held back, no version of herself standing between you and the woman she actually is underneath all that command. "Best set I ever finished, if you want the honest assessment. And I'm always honest about assessments."`,
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

That gets a real pause, weight shifting, the music slowing into its final bars around you both. "No," she says, quiet now, certain. "I find I don't want to look away first tonight."

The record cycles into a second track before either of you speaks again, and she uses the silence to walk you back through the frame once more, slower this time, correcting the angle of your shoulder with a palm that doesn't rush to leave once the correction is made.

"Tell me why you came," she says, mid-turn. "Most people who book a first lesson with me have some story — a wedding, a bet, something to prove to somebody else. You didn't give my assistant a reason."

"I didn't have one. I just wanted to learn."

"That's a rare answer." She studies you for a long moment, the red light catching the beauty mark above her lip, her gaze steady and unhurried the way it's been since you walked in. "Most people want the tango to prove something about themselves to someone watching. You just want the dance." A small, considering smile. "I find that I approve. Come back tomorrow. I don't waste a second lesson on someone who isn't going to use the first one properly, and I think you might."

The bandoneon fades out entirely, leaving just the sound of your own breathing and hers, close, unhurried, in no rush to be anywhere else.

She steps back at last, though slower than the moment technically requires, smoothing the line of her dress with a practiced motion that gives her hands something to do besides linger where they'd been. "You should know," she says, "that I don't usually walk a first lesson through the frame twice. Once, to teach it. The second time is supposed to be earned."

"Did I earn it?"

"You didn't fight the closeness. Most beginners tense the moment I bring them in, like proximity is something to be endured until the count resets." She studies you, unhurried, the red lamp catching the line of her jaw. "You settled into it instead. That's not something I can teach. Either a body understands stillness or it doesn't."

"Maybe I had a good teacher."

"Careful," she says, though there's real warmth threaded through the warning, "flattery works on me more than I'd like to admit, and I don't enjoy admitting things." She reaches for the light switch, then reconsiders, leaving the red lamp burning a moment longer than necessary. "Tomorrow, then. Same time. I'll expect you not to have forgotten everything by then."

"I won't."

"We'll see." But she's almost smiling when she says it, and the smile doesn't fully leave until well after you've gone.

· · ·

You come back every midnight session after, and Isabel stops calling it a lesson somewhere around the third week — starts calling it something else without ever quite naming what. The studio's the same each time: red lamp, low bandoneon, the particular hush of a room that only exists this late, after the referral students have gone home and the mirrors have nothing left to reflect but the two of you.

"You've stopped counting the steps in your head," she observes, close against you as the bandoneon plays low. "I can tell. Your body's finally trusting mine instead of the rhythm."

"Is that good?"

"It's the only way this dance actually works." Her hand presses firmer at your back, drawing you into a turn with practiced certainty. "Most students never get past the counting. You did, faster than most. I don't know what to do with that, except keep teaching you."

"Is teaching all this is?"

That earns you a slow, considering look, her eyes holding yours through the turn without wavering. "No," she admits, quiet. "I don't think it's been just teaching for a while now."

She guides you through another sequence, unhurried, and when the turn brings you close again she doesn't step back to the proper distance the studio technically requires. "Can I tell you something about why I run this place by referral only?" she asks.

"Please."

"Most people who want to learn tango want the idea of it — the drama, the costume, something to post online. I got tired of teaching people who flinched the second the dance asked for something real. So I made it difficult to find me. Only the people who actually want this find their way in." Her accent thickens on the last word, deliberate. "You found your way in through a friend of a friend, barely a real referral at all. I almost turned you away."

"Why didn't you?"

"Because you asked good questions in your first message. Something about wanting to learn the dance, not perform it." She draws you into another slow turn, close enough now that there's no pretending the proximity is only technical. "I don't regret letting you in. I find myself looking forward to midnight more than I used to, and midnight used to be my favorite part of the day regardless of who filled it."

"High praise."

"Don't let it go to your head." But there's warmth all through the warning, and she doesn't correct the distance between you even once for the rest of the session.

She walks you to the door afterward, unhurried as always, and lingers there a moment longer than a teacher usually would with a student. "Can I ask you something?" she says. "Something outside the lesson."

"Of course."

"Do you have somewhere else you're supposed to be, most midnights? A life that makes room for this without complaint?" There's something careful in the question, like she's testing whether she's about to complicate something that matters to you.

"Nowhere I'd rather be than here."

That seems to settle something in her, though she doesn't say so directly. "Good," she says instead, simply. "I ask because I've started arranging my whole week around this hour. It would be inconvenient to discover I was the only one doing so." Her accent softens the words further, unhurried, deliberate. "I don't like being the only one holding onto something. I've done that before. It didn't end well."

"You're not the only one."

"No," she says, testing the words like she's trying them for size. "I'm beginning to believe that." She opens the door for you at last, though her hand stays a moment longer than necessary at the small of your back, an old habit becoming something else entirely.

"Before you go," she says, stopping you on the threshold, "I want to tell you something about the beauty mark you keep looking at, above my lip. Most people ask about it eventually. You never have."

"I figured you'd tell me if you wanted to."

"I like that about you." She touches it lightly, almost unconsciously. "It's not remarkable, the story. A childhood scar from a fall, nothing more. But everyone who's ever asked did it to fill a silence, to have something to say about my face instead of about me. You just let it be part of the picture, unremarked on, the way you let the closeness of this dance be part of the picture instead of something to comment on." She studies you a moment longer. "I notice things like that. It's most of how I decide who's worth letting stay past the lesson."

"Have I stayed past the lesson?"

"You tell me," she says, and there's a rare teasing note in it, warm and unhurried, before she finally lets you through the door into the cool night air, watching you go with an expression she doesn't quite manage to smooth back into her usual composure in time.

· · ·

She corrects your hold one midnight with her whole hand instead of two fingers, palm flat over your heart like she's checking something more than posture, and doesn't move it away once the correction's made.

"Your heart's faster than it should be for a simple hold," she murmurs, close enough that you feel every word against your skin.

"You do that to people."

"Not usually." Her accent thickens the words, deliberate, unhurried. "I keep my dancers at arm's length, off the floor. I haven't managed that with you in weeks." Her thumb traces once, slow, over your chest before she draws back into frame. "I find I don't want to manage it anymore, if I'm honest."

"Then don't."

She's quiet a moment, the bandoneon swelling low behind her, and when she speaks again her voice has dropped even further, stripped of its usual teaching cadence entirely. "Tango is built on tension," she says. "The push and pull between two bodies who both want to lead and have to decide, moment to moment, who yields. I've spent years being very good at never yielding. It's easier that way. Nobody gets close enough to disappoint you if you're always the one leading."

"Have I made you yield?"

"More than I intended to admit." She laughs, low, almost rueful. "I've been correcting your hold for three weeks with far more contact than any technique requires and telling myself it was pedagogy. It was not pedagogy."

"I suspected."

"Of course you did. You're not unobservant, which is precisely the problem." She steps back into frame, but there's no real distance in it now, her body already following the shape of yours before the bandoneon even asks her to. "I don't know what happens after tonight. I only know I don't want to keep pretending this is a lesson."

The bandoneon swells behind you both, and this time when she draws you close on the turn, there's no lesson left in it at all — just her, closer than tango technically requires, exactly as close as she's wanted to be since that very first night.

When the track finally ends, she doesn't step back to reset the frame the way she usually would. Instead she stays exactly where she is, forehead nearly resting against yours, breathing a little unsteady for someone who's spent a career making unsteadiness look effortless.

"I haven't done that in longer than I'd like to say," she admits. "Let a lesson become something honest instead of technique. It's supposed to be dangerous, in my experience. Dancers who blur that line usually regret it."

"Do you regret it?"

"Not tonight." She finally does step back, just enough to see your face properly, some of her usual composure returning even as her eyes stay warmer than they were an hour ago. "Ask me again if I still feel that way at midnight next week. I suspect I will, but I've been wrong about that kind of certainty before, and I'd rather not promise you something I can't keep."

"I'll ask."

"Good." She reaches for the light switch out of habit, then stops herself, leaving the red lamp burning a while longer, unhurried, in no rush to let the night end just yet.

"Can I confess something else," she says, "while I still have the nerve for it?"

"Always."

"I've rehearsed this exact moment in my head more times than I'd like to admit. Different versions of it — some where I say nothing at all and let you leave without ever knowing, some where I say too much and frighten you off entirely." She laughs softly at herself. "I settled on neither, in the end. I just let it happen the way it wanted to happen, which is not how I usually operate. I plan everything. Every lesson, every correction, every referral I accept or decline. This is the first thing in years I haven't tried to control."

"How does that feel?"

"Terrifying," she admits, "and also the most honest I've felt in this studio in longer than I can remember." She reaches for your hand, testing the weight of it in hers, unhurried. "I find I prefer it to the alternative. Even terrifying, it's better than careful."

She glances toward the studio's dark corners, the mirrors that have watched a decade of careful, controlled lessons unfold under her exacting eye, and something in her posture eases further, like the room itself is giving her permission. "I think I've been waiting for someone to make careful feel like the worse option," she says. "I didn't expect it to happen at midnight, over a dance I've taught a thousand times before. But here we are."

"Here we are."

"Stay," she says, quiet, certain, nothing careful left in the word at all. "Not because the lesson requires it. Because I'd like you to."

You stay. The bandoneon loops on, unhurried, patient, filling the space around you both like it always somehow knows exactly the right pace to keep.

· · ·

The studio stays locked past midnight one session, red lamp the only light, and Isabel finally steps back from the frame entirely — just looks at you, unhurried, the same intensity she gives the dance now aimed squarely at you instead. The bandoneon recording has looped twice already, unnoticed, filling the quiet between you with its low, patient ache.

"I don't do this," she admits, low, certain. "Want a student. It complicates the studio, the referrals, everything I've built here." A pause, considering, deciding something. "I find I don't care about any of that tonight."

"What do you care about?"

"You." She looks away for the first time since you've known her, toward the dark studio windows, gathering something before she looks back. "I built this referral system because I got hurt once, a long time ago, by someone who learned the dance from me and then decided the dance was the only thing he'd actually wanted. I promised myself after that I'd never confuse a student's hunger for the tango with hunger for me again."

"This isn't that."

"No," she agrees, studying you carefully, like she's testing the shape of the words before she trusts them. "I know the difference by now. I've watched you learn for weeks — you never once looked at me the way people look at something they want to conquer. You looked at me the way people look at something they want to understand." Her voice softens further. "That's rarer, and harder to earn, and I find I trust it more than I've trusted anything in a long while."

"You. Closer than arm's length. Closer than the dance even asks for." She closes the distance herself this time, no music required, and kisses you slow and deliberate, the same unhurried certainty she brings to every step of the tango. "There," she murmurs after, satisfied. "Better than any dance I've taught."

She doesn't move away after, just stays there, close, studying your face like she's memorizing it against some future doubt she's already decided not to indulge. "I told myself for years that this studio was enough," she says quietly. "The dance, the discipline, the referrals who respected the boundary I built around myself. I believed it, mostly. I'm good at believing things I've decided are true."

"And now?"

"Now I know it wasn't enough, and I'm annoyed at myself for not admitting that sooner." A small, rueful laugh, low in her throat. "I've spent so long protecting this place from anyone who might want the wrong thing from it. I never once planned for someone who'd want the right thing. I don't think I built any defenses against that."

"You don't need defenses with me."

"I'm learning that," she says, and there's something almost young in the admission, unguarded in a way you haven't seen from her before. "Slowly. The way I learn everything worth learning properly." She takes your hand, lacing her fingers through yours, unhurried.

"Can I ask what changed your mind?" you say. "About letting someone this close."

She considers the question with her usual care, unwilling to give you an answer she hasn't fully tested first. "You kept showing up," she says finally. "Every midnight, without fail, never once treating this studio like a novelty or a story to tell your friends. I've had a great many students over the years. Very few of them ever made me feel like the time actually mattered, rather than just the technique." Her thumb traces slow circles over your knuckles. "I stopped being able to tell myself this was only about the dance somewhere around the fourth week. I've spent the weeks since arguing with myself about whether to admit it. I'm tired of arguing."

"I'm glad you stopped."

"So am I." She glances toward the red lamp, at the shape it throws across the studio floor, familiar now in a way it wasn't when you first walked in. "Stay a while longer. I find I don't want the lamp to go out on this particular night."

· · ·

Months later, the referral-only studio has exactly one standing midnight booking that isn't really a lesson anymore, though you still both pretend it is for the sake of the sign on the door. The red lamp still burns in its corner, the bandoneon still loops low and patient, and Isabel still corrects your hold sometimes out of old habit, though neither of you needs the excuse anymore.

"Closer," she says, echoing that very first night, though there's no instruction left in the word at all — just an invitation, warm and certain, offered the way she offers nothing else in her carefully guarded life. "Some things I still say the same way. Not because you need reminding anymore. Because I like saying it."

"What's the tango teaching you these days?"

"Nothing." She draws you in, red light warm across both your faces, bandoneon recording spinning low and patient in the corner. "I stopped needing the dance as an excuse to stand this close to you a long time ago."

"Do your other students notice? That the studio's changed since I started coming?"

"They notice I'm easier to please," she says, amused. "Less exacting about the smallest details than I used to be. I used to think perfection was the whole discipline of this place — every angle correct, every count precise. I still care about that. But I've learned there's a difference between a hold that's technically correct and one that actually means something, and I don't think I fully understood that difference before you walked in here and refused to flinch."

"Do you regret it? Letting a student in, after everything you said about protecting yourself from that."

She considers the question seriously, the way she considers everything, unhurried, before she answers. "No," she says finally. "I built the referral system to protect myself from people who wanted the tango and mistook it for wanting me. You never made that mistake. You wanted to understand the dance, and somewhere in learning it, we both discovered you wanted to understand me too. That's not the thing I was guarding against. That's the thing I didn't know I was still hoping for."

"I'm glad I found my way in."

"So am I." She presses her palm flat over your heart again, the same gesture from weeks ago, except there's nothing testing in it now, no diagnosis to make — just the simple fact of feeling it beat, steady, close.

She's quiet a moment, and then, unprompted: "You asked me once, that very first night, if you should have flinched at how close I brought you in. Do you remember what I told you?"

"You said you liked it better this way."

"I did. And I've thought about that answer a great deal since, because I don't think I understood at the time how much I meant it." She tilts her head, considering you with the same unhurried thoroughness she's given you since the beginning. "I spent years keeping everyone at exactly the distance the dance requires and not a centimeter closer. It was safe. Predictable. Nobody could disappoint me if I never let them close enough to try. You made that distance feel like a waste of a perfectly good midnight, and I haven't wanted the old distance back since."

"I don't ever want the old distance back either."

"Good." She smiles, slow, the same one from that very first night, though there's nothing careful left folded into it now the way there was then. "Because I've decided, somewhere in all these months, that closeness isn't the risk I always told my students it was. It's the whole point. I only ever taught it as if it were dangerous because I hadn't yet found someone worth being close to." Her hand slides from your heart to your jaw, familiar now, certain. "Some referrals turn out better than others. I think this might be the best one I've ever accepted." She kisses you, slow, the bandoneon fading into its next patient loop, red light holding the whole room the way it has every midnight since the first one.`,
  },
  {
    character: "Damon",
    title: "You're Staring",
    setting: "a dim garage at midnight, motorcycle parts scattered across a workbench, single work light swinging",
    genre: "romance",
    tone: "sultry",
    content: `The garage is empty this late except for one swinging work light and the half-stripped engine Damon's been elbow-deep in for the last hour, grease climbing his forearms in streaks he hasn't bothered to wipe off. He clocks you in the doorway before you've said anything.

"You're staring," he says, not looking up yet, wrench still turning. "Good. Means you like what you see." Now he does look up, and it lands slow, unhurried, the kind of attention that doesn't rush itself for anyone. "Come closer. I don't bite. Much."

You step in. The garage smells like oil and metal and something warmer underneath it, and Damon straightens from the bike with the unhurried confidence of someone who's never once needed to prove he belongs in a room. Tools hang along one wall in an order that only makes sense to him, and a radio somewhere behind the workbench plays low static-edged rock nobody's bothered to tune properly in years.

"You always work this late?"

"Only when something's worth finishing right." He wipes his hands on a rag that does almost nothing, watching you the whole time instead of the bike now. "Same rule applies to most things, in my experience."

"Is that a metaphor, or are we still talking about the engine?"

That gets him — a low laugh, surprised out of him, the kind that changes his whole face for a second before the easy composure settles back over it. "Smart," he says, like it's a point in your favor and he's keeping score. "I like that you caught it instead of asking me to spell it out."

He leans back against the workbench, arms crossed, close enough now that the work light throws both your shadows into one shape on the concrete. "You didn't come down here for the bike," he says. Not a question.

"Maybe I did."

"Maybe." He doesn't push it, doesn't need to — just watches you with the patient, banked heat of someone who's confident the night's got time left in it either way. "You can stay and find out what I actually do with my hands when I'm not holding a wrench, if you want. No rush. I've got nowhere better to be, and neither, I think, do you."

He nods toward a stool near the bench, an offer more than an instruction, and when you take it he goes back to the engine but keeps talking, easy, unhurried, like the conversation's just another tool he's picked up without thinking twice about it.

"This bike," he says, running a hand along the frame, "used to belong to a guy who owed me a favor and couldn't pay it any other way. Half the parts on it are older than you'd guess. I could've stripped it for scrap years ago. Kept it instead."

"Why?"

"Some things are worth the extra work; most people give up on them too early because patience is inconvenient." He glances at you sideways, something deliberate in the look. "I don't give up on things I've decided are worth finishing. Bikes. Races. Other things, too, if I'm being honest about where this conversation's headed."

The work light swings once, throwing the shadows apart and back together. You don't leave.

He goes back to the bike after a while, but he keeps the conversation going anyway, unhurried, like he's decided your presence doesn't require his full attention to be worth having. "You want a drink?" he asks, nodding toward a battered mini-fridge shoved under the far bench. "Not much of a selection. Beer, or beer that's gone a little warm."

"I'll take the cold one."

"Smart." He grabs two, cracks one open one-handed without looking, an old habit worn smooth by repetition, and hands it over before opening his own. "Most people who wander down here get spooked eventually. The grease, the noise, the hour. You're taking it pretty well for a first visit."

"Should I be spooked?"

"Depends what you're afraid of." He leans against the frame of the bike, easy, watching you over the rim of the bottle. "Some people don't like the quiet this late. Some people don't like a guy who works with his hands for a living and doesn't apologize for how it looks under his nails." He shrugs, unbothered either way. "I've stopped worrying about which kind of person walks in. Either they stay, or they don't. Simplifies things."

"And if I stay?"

"Then I guess we find out what kind you are." He tips his bottle toward you, a small toast, unhurried. "Works for me either way, for the record. I've got a good feeling about tonight."

· · ·

You start dropping by most late nights, and Damon stops pretending it's about the bike somewhere around the second week — just clears a stool at the workbench for you like it's always been yours. The garage takes on its own rhythm around your visits: the radio low, the work light swinging in its same lazy arc, Damon's hands always moving even when the conversation drifts somewhere the bike has nothing to do with.

"You're becoming a regular fixture," he says, wiping his hands, watching you settle in with an ease that mirrors his own. "I don't usually let people just sit in my garage. It's kind of my one sacred space."

"Should I go?"

"No." Too fast, unhurried the rest of the way to cover it. "I like the company more than I expected to. Don't let it go to your head." A slow, easy grin. "Too late, though. It already has, hasn't it."

"Maybe a little."

"Good." He leans against the bench, closer now, banked heat plain in the look he gives you. "I don't mind you knowing that."

He sets the wrench down for a moment, actually facing you instead of half-turned toward the bike the way he usually stays. "Can I tell you something about this place that most people don't get?"

"Go ahead."

"I built the racing circuit the same year my old man's shop went under. Everybody around here knew him — best mechanic in three counties, until the bigger place down the road undercut him on price and ran him out of business in about a year." Damon's jaw tightens slightly, an old grief he's clearly worn smooth over time. "I took what was left of his tools, this garage, and decided if the legitimate route wasn't going to let a guy like him survive, I'd build something on my own terms instead. Underground, unregulated, mine. Nobody tells me how to run it."

"That sounds lonely."

"It was, for a long time." He studies you, something shifting behind the easy confidence. "Didn't think much about the lonely part until lately. Didn't really have room to, before you started showing up and taking up a stool like you belonged on it."

"Do I belong on it?"

"Getting there," he says, low, and the grin that follows doesn't quite manage to hide how much he means it.

He goes quiet for a moment, turning a socket wrench over in his hands without really using it, and when he speaks again his voice has dropped its usual easy drawl. "You want to know something most people around here don't know about me?"

"Always."

"I don't actually care about winning the races the way everybody assumes I do. I mean, I care — I don't lose on purpose, and I'm not built to lose gracefully. But the reason I keep running the circuit isn't the money or the reputation." He sets the wrench down, meets your eyes properly. "It's the one place where the risk is honest. You know exactly what you're betting, exactly what you stand to lose, and nobody pretends otherwise. Everything else in my life, people dress the risk up as something safer than it is. The track never lies to me."

"And now? With this?"

"This is the first thing outside that track that's felt honest in a long time." He rubs the back of his neck, something almost sheepish in the gesture, at odds with his usual confidence. "Which is inconvenient, because I don't actually know the rules here the way I know them on the asphalt. I'm working it out as I go."

"Maybe that's not such a bad way to work it out."

"Maybe." He looks at you a beat longer than necessary, something settling behind his eyes. "I like that you don't need me to have it all figured out already. Most people want the version of me that already knows exactly where this is headed."

"I don't need that version. I like this one fine."

"Good," he says, quiet, "because it's the only version I've actually got to offer you."

He picks the wrench back up after that, though he doesn't return to actually working, just turns it over in his hands, restless in a way you haven't seen from him before. "Can I ask you something? Might sound strange, coming from a guy standing in a garage full of stolen glances and half-finished bikes."

"Go ahead."

"Why do you keep coming back? You could be anywhere. I know for a fact I'm not an easy guy to read — half the people on the circuit still don't know if I like them or I'm just tolerating them for the race. You've never once seemed confused about where you stand with me, even when I haven't made it easy."

You tell him the truth — that the not-knowing never actually felt uncertain, it felt like something being built slowly and deliberately, the same way he builds everything else he cares about, and that you'd rather have that than something rushed and easy.

He's quiet for a long moment, processing that with more care than he usually lets show. "Nobody's ever described it that way to me before," he admits finally. "Most people either want me to move faster or they get spooked and bail before I've decided anything at all. You just let me build it at my own pace." He sets the wrench down for good this time. "I don't know how to thank you for that except to keep building it."

· · ·

He teaches you to change the oil one night, guiding your hands over the engine with unhurried patience, close enough that his voice drops low near your ear with every instruction. The work light swings gently overhead, throwing warm shifting shadows across the concrete, and the radio hums low behind you both, forgotten.

"You're better with your hands than you let on," he murmurs, watching you work instead of the bike. "Careful. Keep that up and I'll start finding excuses to teach you things."

"Maybe I want you to."

That stills him for a second — genuine surprise flickering under the easy confidence, gone as fast as it came. "Careful," he says again, quieter now, no teasing left in it. "I don't make promises about being careful once someone says things like that to me."

"I'm not asking for careful."

His hand covers yours on the wrench, deliberate, testing. "Then say that again when you mean it completely," he says, low, patient despite the heat banked underneath. "Because I will absolutely act on it."

You say it again. He goes quiet for a moment, weighing something, and then steps back just far enough to look at you properly, like he wants to be sure before he lets himself believe it.

"You know what I do for a living, mostly," he says. "The bikes, the circuit, all of it. I've built a reputation on not needing anybody to slow down for. Fast, careful with the machines, reckless with everything else. Nobody's ever asked me to actually be careful with them instead."

"I'm asking."

"Yeah." He looks almost thrown by that, some old certainty rearranging itself behind his eyes. "Yeah, I heard you." He sets the wrench down properly this time, no longer using it as an excuse to keep his hands busy. "Give me a second. I don't want to get this wrong."

"Take your time."

"Damon doesn't usually get the luxury of taking his time," he says, half to himself, something wry and a little disbelieving in it. But he does take it — a long, unhurried moment where he just looks at you, deciding something.

"You've got grease on your hands now," he says finally, nodding at your fingers still resting near the engine. "First time that's ever happened in this garage and it didn't feel like just teaching somebody a skill."

"Feels different this time?"

"Yeah." He wipes his own hands slow, deliberate, buying himself another second before he says the rest of it. "I've had people down here before. Friends, a few dates who wanted to see the bikes, guys from the circuit killing time before a race. Nobody's ever made changing an oil filter feel like the most charged five minutes of my week." He shakes his head slightly at himself, like the admission surprises even him. "I don't know what you've done differently. I just know I don't want tonight to be the only night it happens."

"It doesn't have to be."

"No," he agrees, low, "it doesn't." He finally closes the last of the distance between you, unhurried, deliberate, the same patience he brings to everything that actually matters to him, and when his mouth finds yours it's slow and certain, no rush in it at all, like he's finally decided the risk is worth taking exactly as honestly as he takes every risk that matters.

When he pulls back, there's a rare openness on his face, none of the practiced cool left standing guard over it. "I should probably tell you," he says, "that I don't do this often. Let somebody this far into the garage, let alone this far into anything else."

"I had a feeling."

"Yeah, well, feelings are usually right about me, from what I hear." He leans back against the workbench, watching you with something steadier than his usual banked heat, something closer to certainty. "I've spent a long time being the guy everybody watches from a distance — admired, maybe wanted, never really known. Suited me fine, most days. Kept things simple." He shakes his head slightly. "You didn't stay at a distance. Walked right into the one place I never let anybody stand this close, and now I can't remember why I thought the distance was worth keeping."

"I'm glad you let me in."

"Yeah," he says, low, certain. "Me too."

· · ·

The garage goes quiet one night, work light the only sound besides both your breathing, and Damon finally sets the wrench down for good, closing the distance he's kept banked for weeks. The radio's off tonight, the bike abandoned mid-repair, tools laid down like whatever he'd been working on stopped mattering the second you walked in.

"I don't usually let anyone this close," he admits, voice rougher than his usual easy drawl. "Garage, the bikes, all of it — it's mine, built alone, kept that way on purpose. You've been the exception since the first night you stared instead of looking away."

"Is that a problem?"

"No." He says it certain, no hesitation left in it at all. "It's the best problem I've had in years." He leans back against the workbench, studying you with none of his usual practiced ease, something more honest underneath it. "You want to know the truth about the racing? Everybody thinks I do it for the thrill, the money, the reputation. Mostly I did it because it was the one place I got to control every variable. Nobody could take anything from me on that track that I didn't already know how to protect against."

"And this? Whatever this is?"

"This isn't a variable I know how to control." He runs a hand through his hair, something almost nervous in the gesture, at odds with everything you've seen from him so far. "I've spent years building a life where nobody gets close enough to cost me anything. You walked into my garage one night and staring at you cost me the whole plan inside of about a month."

"I didn't mean to wreck your plan."

"I know you didn't. Doesn't change the fact that you did." He looks around the garage, at the tools hung in their careful order, the bike he's been slowly finishing for months now, the second stool that's gathered its own layer of grease over the weeks. "My old man used to say a good mechanic never lets sentiment near an engine — you fix what's broken, you don't get attached to the metal. I think I've been running my whole life on that rule, not just the engines. Never got attached to anything I couldn't walk away from clean."

"And now?"

"Now I look at that second stool and I can't imagine walking away from it clean at all." He laughs, a little rough, like the honesty costs him something even as he gives it. "I've never told anybody that. Didn't plan on telling you either, if I'm being straight with you. Guess you make plans hard to stick to."

"Is that a bad thing?"

"No." He says it certain, no hesitation left in it at all. "It's the best problem I've had in years."

He's quiet for a while after that, just looking at you in the low swinging light, something unhurried and thoughtful in the silence. "You want to know the actual reason I do the racing?" he says eventually. "The real one, not the one I tell people who ask at bars."

"Tell me."

"After my old man's shop went under, I spent about a year thinking I'd inherited nothing but his tools and his debt. Circuit racing started as a way to make quick money, nothing more. Took me longer than I'd like to admit to realize I kept doing it because it was the only place left where I felt like I had control over something, after watching everything he'd built get taken apart piece by piece by people who never even had to get their hands dirty to do it." He turns the wrench over once more, an old habit. "I built this whole life so nothing could get taken away from me again. Didn't leave much room for anybody to get close enough to matter, either. Seemed like a fair trade, most days."

"Doesn't sound like that fair a trade to me."

"No," he agrees, quiet. "Took me a while to see it that way too." He looks at you, steady, none of his usual practiced ease standing between the two of you now. "I'm glad you didn't wait around for me to figure that out on my own. Might've taken years."

"I wasn't in a hurry."

"Good thing," he says, low, "because I wasn't either, in the end. Turns out some things are worth doing slow." His hand finds your jaw, sure despite the rare vulnerability underneath it, and when he kisses you it's slow, deliberate, all the patient heat from every night before finally given somewhere to go.

· · ·

Months later, the garage has a permanent second stool, grease-stained and yours, and Damon doesn't work half as late anymore now that there's a better reason to finish early. The radio still plays its low static-edged rock, the work light still swings its same lazy arc, but the whole space feels less like a fortress now and more like something built for two.

"You're staring," he says, echoing that very first night, though it's warm now instead of a challenge, private and certain. "Still means you like what you see, I hope."

"Every time."

"Good." He pulls you against him, work light swinging once overhead before settling, throwing your shadows into one shape on the concrete the way it did that very first night. "Took me a while to admit I wanted more than an audience. Glad you stuck around long enough for me to figure that out."

"What made you figure it out?"

He considers that, unhurried, the same patience he brings to a stubborn engine now turned on the question itself. "You kept showing up even when I gave you every reason to think I was just killing time with you. I tested that, a little, if I'm honest — stayed vague, kept things easy, waited to see if you'd get bored and wander off like everybody eventually does around here." He shakes his head slightly at himself. "You never did. Somewhere around month two I ran out of reasons to keep testing you and just let myself want you instead. Best decision I've made in years, and I've made some good ones on that track."

"High praise, from someone who never loses a race he cares about winning."

"Never have. Never plan to." He glances around the garage — the tools in their old, careful order, the bike finally finished after months of unhurried evenings, the second stool that's become just as much a fixture as the workbench itself. "You know, my old man used to say you can tell everything about a mechanic by what he keeps versus what he scraps. I kept this whole place running on that rule for years. Kept the things that were useful, scrapped anything that cost me more than it was worth."

"Which one am I?"

"Neither." He laughs, low, shaking his head at himself. "You broke the whole rule. You cost me exactly the plan I'd built my life around — staying unattached, staying fast, never letting anything slow me down enough to actually be caught wanting it. And somehow that's the best thing that's ever happened to this garage." He reaches for your hand, lacing his fingers through yours, grease-stained and certain. "I don't scrap things anymore just because they ask something of me. Learned that from you, I think, without either of us really trying."

"I like being the exception to your rules."

"Yeah, well, get used to it. I don't plan on changing that back." His mouth finds yours, unhurried as ever, patient the way only someone completely certain can afford to be. "Best thing I ever finished right." He pulls back just enough to look at you properly, something warm and unguarded settling into his face that has nothing to do with bikes or races or reputations. "For what it's worth — I still don't know how to be careful with people. Never learned. But I'm willing to figure it out with you, one late night at a time, if you'll let me."

"I'm not going anywhere."

"Good," he says, low, certain, pulling you back in, the work light swinging its same lazy arc overhead like it's seen this exact ending coming since that very first night. "Neither am I."`,
  },
  {
    character: "Roxie",
    title: "Try to Keep Up",
    setting: "a private aerial dance studio at night, pole and silks rigged from the ceiling, moody purple lighting",
    genre: "romance",
    tone: "playful",
    content: `The studio's tucked above a laundromat on a street you've walked past a hundred times without noticing the narrow staircase beside the dry cleaner, the one with a single buzzer marked only "AERIAL." Tonight you finally climb it, pulse ticking a little faster with each step, and push through the door into a room that smells like chalk and rubber mats and something warmer underneath both. Two rigs hang from the reinforced ceiling beams, silks pooled like spilled ribbon beside one, a pole gleaming under a wash of purple light that makes the whole space feel like it's holding a secret you haven't earned yet.

Roxie's already at the pole, warming up without an audience in mind, her body finding shapes that look effortless and are obviously anything but. Chalk dusts her palms, catches in the hollow of her collarbones, glitters faintly where the light hits her skin. She sees your reflection in the wall of mirrors before you've said a word and turns, unhurried, a grin already tugging at one corner of her mouth like she'd been expecting you specifically.

"Most people just watch from the mirror," she says, low and amused, taking you in with a slow, assessing glance that makes you very aware of your own hands. "You get the private lesson. Try to keep up."

"Should I be worried?"

"Only if you're planning on being bad at this." She beckons you over with two fingers, delighted rather than impatient, watching your nerves with open enjoyment. "Relax. I don't bite on the first lesson. Might tease, though. Can't promise anything there."

She starts you slow — proper grip, footwork, the unglamorous mechanics nobody puts in the highlight reel — but stays close through all of it, closer than strictly necessary, correcting your hold with a hand at your waist that lingers exactly as long as it needs to and not a second more. You feel it every time: the brief, deliberate pressure, gone before you can decide how to react to it, like she's testing precisely how much attention you can hold onto before the whole exercise falls apart.

The pole's colder under your palms than you expected, slicker too, until the chalk finally catches and your grip stops sliding at the worst possible moment. Roxie doesn't rush you through the awkwardness of it — if anything she seems to enjoy watching you work through the fumbling first attempts, arms loosely crossed, chin tilted, cataloguing every hesitation like she's filing it away for later teasing.

"Hips square to the pole," she instructs, adjusting you again, voice dropping to something quieter near your ear. "There. Feel that?"

"I feel a lot of things right now."

That earns you a low laugh, delighted at your honesty instead of embarrassed for you. "Good. Means you're paying attention." She steps back to watch you attempt the spin she's just taught, an unglamorous, wobbling thing that's shakier than either of you pretends. "Better than most beginners," she says, and it sounds like she means it. "Most people can't focus with me this close. Good sign, that you're trying anyway."

"Hard not to focus on you."

That gets her — a real, startled laugh, delighted rather than deflecting, chalk dust drifting off her palms as she claps once in genuine surprise. "Careful," she says, grinning outright now, eyes bright under the purple light. "Compliments like that get you a longer lesson. Stick around and find out how much longer."

She lets that hang a second, gauging your reaction with open curiosity, then claps once, brisk, business returning to her voice like she's decided you've earned exactly enough attention for one first lesson. "Again," she says, nodding at the pole. "From the top. And this time don't overthink the hips."

You run through the sequence twice more, sloppier the second time out of sheer nerves, and she laughs outright at that, not unkindly, correcting your stance with both hands now instead of one, patient in a way you didn't expect from someone who clearly enjoys an audience more than she enjoys teaching. "You'll get there," she says, straightening up. "Most people quit before the second lesson. Something tells me you won't."

She demonstrates one more move before you go — a slow, showy climb up the pole that has nothing instructional left in it, purely for the pleasure of doing it well in front of someone watching properly for the first time in a while. You watch, and she knows you're watching, and neither of you says anything about it. When she finally drops back to the mat, breathing a little quicker, she looks almost pleased with herself for having an audience worth performing for.

"Same time next week?" she asks, tossing you a towel like the question doesn't matter either way, though her eyes say otherwise.

"Wouldn't miss it."

"Didn't think so." The grin follows you all the way to the door.

· · ·

You come back for a second lesson, then a third, each one a little longer than it needs to be, and Roxie stops pretending the sessions are only about technique. She stays close through transitions that don't strictly require a spotter, watches you with an attention that reads less like instructor and more like something else entirely, something she seems in no hurry to name.

Tonight she's got you working on an invert, hands guiding your ankle into position, breath faintly quickened from three failed attempts in a row that had you laughing more than frustrated. On the fourth try you hold it, and she whoops, delighted, before catching herself and settling back into her usual composed amusement.

"That's not nothing," she says, still grinning despite the attempt at composure, chalk dust drifting from her palms as she claps once. "Most people take a month to hit that clean. You've had three weeks." She circles you once, assessing your form with genuine pride this time instead of her usual teasing scrutiny, hands finding your ankle to adjust the last few degrees of the hold. "There. Perfect. Hold it a beat longer next time and I'll actually be impressed."

"You're not impressed now?"

"I'm getting there." She lets you down slow, spotting your descent with both hands even though you don't strictly need it anymore, an excuse dressed up as caution that neither of you bothers calling out.

"You're not here for the pole anymore, are you," she says, not quite a question, still guiding your grip like the observation doesn't need your input to be true.

"Does it show?"

"A little." She doesn't seem bothered by it — delighted, actually, biting back a grin she clearly doesn't want you to see yet. "I don't usually let students figure out I like them back. Ruins the professional distance."

"Is there a professional distance left to ruin?"

"Not really, no." She laughs, stepping back to consider you properly, chalk-dusted hands on her hips. "You've ruined it. Congratulations."

"Is that a compliment?"

"From me? Absolutely." She spins once around the pole, showy and deliberate, a move with far more flourish than any lesson calls for, hair catching the purple light as she comes around. It's clearly a private performance, meant for an audience of exactly one. "I don't perform for free anymore. Haven't in years. You're the exception."

"Why me?"

She considers the question longer than you expect, genuinely turning it over instead of tossing back something easy. "You watch like you're actually seeing something," she says finally, quieter than her usual playful register. "Not just the body doing the trick. The work underneath it. Nobody really watches that part."

"I like the work underneath it."

That seems to catch her off guard — a beat of stillness before the grin comes back, softer around the edges than before. "Careful," she says. "Say things like that and I'll start believing you're actually here for me instead of the abs."

"Would that be so bad?"

"No," she admits, and for a second the teasing drops away entirely, something more honest underneath it. "It really wouldn't."

She busies herself coiling a length of silk that doesn't need coiling, buying herself a second before she looks back at you properly. "I've had plenty of people flirt with me in this studio," she admits. "Guests, students, people who think the pole's an invitation by itself. I don't usually flirt back. Ruins the whole untouchable thing I've got going." A pause, considering, chalk dust settling from her fingers as she finally lets the silk drop. "I don't think I mind ruining it. Not with you."

She recovers quickly, tossing you a water bottle and calling the next drill, but the air in the studio's different for the rest of the night — charged, a little breathless, both of you aware of exactly how much distance is left between the professional and the personal. When the lesson ends she walks you to the door herself instead of waving you out, lingering a beat longer than the goodbye requires.

"Same time next week," she says. Not a question this time.

"Wouldn't miss it."

"I'm counting on that." The grin she gives you as the door closes isn't performance at all.

You walk home replaying the whole exchange, the particular way her voice had dropped right before she admitted it, and you find yourself already looking forward to next week in a way that has very little to do with the choreography.

· · ·

The studio's warmer than usual the following week, the space heater running full blast against a cold snap outside, and Roxie's already stretching by the rigs when you arrive, quieter and more contemplative than her usual bright greeting. She teaches you a lift one night that requires real trust — her full weight braced against yours, holding a position where the mats feel very far below and her hands are the only thing keeping either of you steady. It's a different kind of closeness than the usual corrections and casual banter, more intimate for being so entirely physical, so dependent on faith in each other's grip.

She's explained the mechanics of it twice already — where her center of gravity sits, how to brace your knees so her full weight doesn't buckle you, what to do if either of you loses the grip halfway through. You've watched her run through it alone a dozen times over the past few weeks, always solo, always careful, like she'd been waiting for a reason to actually need a partner for it instead of just performing it for an audience.

"Trust me," she murmurs, guiding your hands to exactly where she needs them, patient in a way she hasn't been before, none of her usual performative confidence in it. "I won't let you drop me."

"I know."

"You do?" That seems to genuinely surprise her — a flicker of something unguarded breaking through the easy playfulness, there and gone almost too fast to catch. "Most people hesitate right here. Second-guess their grip, tense up wrong. You didn't."

"I trust you completely."

The words land somewhere real in her; you can see it happen, watch the teasing fall away for a full beat, replaced by something quieter and far more honest. She holds the position a moment longer than the move technically requires, weight settled fully against you, studying your face like she's looking for the catch in what you just said and not finding one.

"Careful," she says, softer now, voice stripped of its usual polish. "Keep saying things like that and I'll stop being able to pretend this is just a lesson."

"Maybe stop pretending, then."

She doesn't answer right away. She drops from the lift slowly, controlled, her body sliding down against yours in a way that's technically just the mechanics of dismounting and feels like considerably more than that, chalk-dusted palm resting flat against your chest for balance a beat longer than balance requires.

"You make that sound easy," she says finally, looking up at you from close enough that you can see the chalk dust caught in her lashes.

"Is it hard?"

"For me? Yes." She laughs, but it's quieter than her usual laugh, more admission than deflection. "I built this whole studio around being the one people want and never quite reach. Untouchable, a little. It's good for business. It's less good for—" She stops, gestures vaguely between the two of you instead of finishing the sentence.

"For this?"

"For this." She steps back, putting a token amount of distance between you, though it doesn't undo anything that just happened. "I don't know what to do with wanting to be caught instead of just admired."

You watch her turn the idea over, visibly uncomfortable with her own honesty, chalk dust settling into the creases of her palms as she flexes her hands like she needs something to do with them. It's strange, seeing her unsettled — she who's spent this whole acquaintance so entirely sure of herself, delighted by her own nerve at every turn.

"You don't have to do anything with it tonight."

That earns you a real smile, unguarded, grateful almost. "No," she agrees. "I suppose I don't." She picks the lesson back up a few minutes later, brisk and businesslike again on the surface, but her hand finds your waist for every correction now, and neither of you pretends anymore that it's about the choreography.

When you leave that night she stops you at the door, hand light on your arm. "Next week," she says, quieter than her usual send-off. "Same time. Don't be late." It isn't quite a joke, not really, and you both seem to know it.

· · ·

The studio stays dark except for the purple wash one night, no lesson written on the calendar at all, no chalk laid out fresh at the base of the pole. You almost turn back at the bottom of the stairs, wondering if you've misread the invitation, until you see the light spilling faintly under the door and hear the quiet hum of the space heater she keeps in the corner for the cold months. Her text had just said "come by if you're free," nothing about a lesson, nothing about the pole at all, and you'd read it three times trying to guess what it actually meant before deciding to just show up and find out.

Roxie's sitting on the mats beneath the silks when you come in, knees pulled up, none of her usual poised readiness in the way she's arranged herself. She doesn't reach for the pole, doesn't rise to greet you with the usual playful assessment. She just looks up, and pats the mat beside her, quiet in a register you've never heard from her before.

You sit. The purple light softens everything, the rigs above you both hanging still and silent, no performance required of either of you tonight. Her chalk-dusted hand finds yours on the mat between you, fingers lacing through slow and certain despite the uncertainty written plainly across the rest of her.

"I don't let people this close," she admits, quieter than her usual playful register, eyes on your joined hands instead of your face. "Not really. The confidence, the teasing — it's easier than actually wanting someone. Doesn't leave you vulnerable the way this does."

"You don't have to be vulnerable alone."

She looks up at that, and something shifts behind her eyes — the performance dropping away entirely, replaced by an honesty that looks almost fragile under the purple wash, though her voice stays steady. "I've spent a long time making sure I'm the one people watch and never quite touch," she says. "Untouchable's safe. Nobody gets close enough to actually disappoint you, or leave, or matter enough that it costs something when they do."

"Do I feel like a risk?"

"You feel like the first thing in years that might actually be worth it." She pauses, correcting herself with a small, rueful laugh. "Worth the risk, I mean." She says it plainly, no performance left in it at all, and something in her shoulders loosens like she's set something heavy down. "That undoes something, is the problem."

"Good."

That surprises a small laugh out of her, real and a little wet-eyed, before she closes the last of the distance herself — sure despite the rare nervousness underneath it, chalk-rough palm coming up to rest against your jaw. When she kisses you it's slow, unhurried, none of the flourish from the pole left in it anywhere; just her, entirely herself, mouth soft and searching against yours like she's relearning something she'd convinced herself she didn't need. You feel her exhale against your lips, tension leaving her all at once, and when she finally pulls back it's only far enough to rest her forehead against yours, chalk dust smudged faintly onto your skin from her hand.

"Well," she says, a little unsteady, a little delighted with herself. "That's new."

"Bad new or good new?"

"Give me a minute, I'm still deciding." She laughs, low, pressing her palm flat against your chest like she's checking whether your heart's racing the way hers is. It is. She seems satisfied by that, some of the nervousness finally draining out of her shoulders. "Good new," she decides. "Definitely good new."

"Best new I've had in years." She laughs again, softer this time, and settles into your side beneath the silent silks like she's finally allowed herself to stop performing altogether. "Try to keep up," she murmurs, echoing herself, though there's nothing teasing left in it at all — just certainty, quiet and complete.

· · ·

Months later, you've got your own key to the rig room, and the "private lessons" have stopped pretending to be lessons at all, though Roxie still calls them that with a grin only you get to see now, a private joke neither of you bothers explaining to the students who file in and out during regular hours.

The regular students have long since gone home for the night, the mirrors dark except where the purple wash catches them, and the whole building above the laundromat smells the same as it did the very first time you climbed those stairs — chalk, rubber, something warmer underneath. Tonight you arrive to find her already up on the silks, not performing, just enjoying the height and the quiet, the studio otherwise empty and dim except for the same purple wash that's lit every important moment between you since that very first night. She sees you in the mirror the way she did the first time, and the grin that spreads across her face is exactly as delighted as it was then, though everything underneath it is different now.

"Try to keep up," she says, echoing that very first night, pole light catching gold in her hair as she unwinds from the silks and drops lightly to the mat, pulling you toward her instead of the equipment. "Still the only rule in here. Some things don't change."

"What's changed, then?"

"Everything after the lesson." She laces her chalk-dusted fingers through yours, unhurried, certain, walking you backward toward the mats with the same confident ease she's had since the day you met her, though the teasing in it now is entirely affectionate instead of a test. "Best student I ever had, if you're wondering. Also the only one I ever wanted to keep."

"High praise from someone so hard to impress."

"You're the exception to a lot of my rules lately." She settles you both onto the mats, the studio quiet around you, rigs hanging still overhead like witnesses to everything that's happened beneath them. "I used to think keeping people at arm's length was the whole point of this place. Look, don't touch. Admire, don't stay."

"And now?"

"Now I've got someone with his own key, showing up on nights there's no lesson at all, and I can't remember the last time I wanted to perform for anyone but you." She says it easily, without her old guardedness, chalk dust catching faint gold in the low light as she studies you like she still can't quite believe her own luck. "Turns out untouchable was never the goal. I just hadn't met the person worth breaking the rule for."

"I'd say I'm glad you did, but I think you already know that."

"I like hearing it anyway." She tugs you down to sit on the mat properly, close, her leg draped easy over yours, chalk dust still faintly ghosting her knuckles from the earlier stretch. "You know, my old coach used to tell me untouchable was the whole brand. Don't let them get close, don't let them see you sweat, keep the mystery intact. I built this entire studio on that advice." She shakes her head, amused at herself now. "You walked in nervous as anything and ruined thirteen years of very deliberate branding in about four lessons."

"Sounds like a good trade."

"The best one I've made."

She kisses you, unhurried and certain, no purple light or private show required to make the moment feel like something worth remembering. When she pulls back, she's smiling the same smile from that very first lesson — delighted, a little smug, entirely genuine. "Same time tomorrow?"

"Wouldn't miss it."

"Didn't think so." She laughs, low and warm, and pulls you down onto the mats beside her, the silks swaying gently above you both in the draft from the door, the whole studio finally feeling less like a stage and more like something closer to home.`,
  },
  {
    character: "Vivienne",
    title: "Exactly How Thorough",
    setting: "a lingerie atelier after hours, dress forms, fabric bolts, a warmly lit dressing-room mirror",
    genre: "romance",
    tone: "sultry",
    content: `The boutique's gate is already half down by the time you arrive, the front room dark except for a single lamp glowing gold over the worktable, dress forms standing sentinel in the shadows like an audience that's already left for the night. Vivienne's still there among the bolts of silk and the pinned muslin, dark red hair pinned up, a tape measure draped around her neck like the only jewelry she's bothered to keep on. She doesn't look up right away when you knock, finishing a note in the margin of a sketch first, unhurried in a way that tells you she knew exactly when you'd arrive. The bell over the door has barely stopped its last ring before she sets the pencil down with deliberate precision, as though the timing of that small gesture matters as much as anything else in the room.

"Stand still," she says finally, setting the pencil down and rising, crossing the room toward you with the kind of unhurried purpose that makes the whole space feel smaller. "I need your measurements, and I promise you'll enjoy exactly how thorough I am."

"Is that standard procedure?"

"For pieces this personal, yes." She unwinds the tape from her neck, and you feel the temperature of the room shift half a degree just from the way she says it — matter-of-fact, precise, entirely without apology. She works around you in practiced, exact movements, close enough that her voice drops low near your ear with each measurement called out to herself, numbers you don't fully register because you're too busy noticing the brush of her knuckles against your collarbone, your wrist, the small of your back. A dress form watches from the corner with a half-pinned bodice draped over its shoulders, sleeves stuck through with silver pins like a pincushion in the shape of a woman, and somewhere beneath the hum of the overhead lamp a radio plays something low and unobtrusive that she doesn't seem to be listening to at all.

"Most designers rush this part," she continues, unhurried, straightening a shoulder seam that doesn't exist yet. "I don't. The fit is the whole point. Anyone can hand you fabric that covers you. I'm interested in fabric that actually fits."

You hold still, though it's harder than you expected with her this close, her attention total and assessing in a way that makes you feel entirely seen and slightly undone by it. "You're very precise," you manage, when she pauses to jot a number down.

"I'm precise about everything that matters." She straightens fully, tape looped back around her neck, and studies you now with the same exacting attention she gives her sketches — not undressing you with the look, exactly, just seeing you completely, which is somehow more unsettling. "I think you're going to matter," she says, quieter, almost to herself. "Inconvenient, that. I don't usually let clients become that."

"Is that a warning?"

"An observation." A faint, considering smile plays at her mouth, gone as quickly as it arrived. "I don't often make those out loud, either. Consider both a small exception."

"Do you regret it? Saying it out loud."

"Ask me again once I've had time to." She says it with a dry, unhurried honesty that suggests she's already decided the answer and simply isn't ready to admit it yet. She circles the worktable once, running a hand along a bolt of dark silk like she needs the fabric's certainty more than the conversation's. She writes one final note, closes the book, and looks at you properly, warm despite the cool precision of everything she's just said. "Same time next week. I'll have a first draft by then."

"I'll be here."

"I know you will." She says it with the same certainty she measures with, and it stays with you the entire walk home.

· · ·

You come back for fittings that stretch longer than any fitting reasonably should, Vivienne finding small, unnecessary excuses to keep you in the atelier after hours — a hem that needs reconsidering, a seam she wants to check twice, a fabric swatch she suddenly needs your opinion on though she's never once asked a client's opinion on fabric before. You've started to notice the pattern, and you don't think she minds that you've noticed. The shop's other clients come and go within the hour, brisk and businesslike, their fittings efficient and forgettable. Yours have taken on a rhythm all their own, unhurried in a way that has increasingly little to do with the garment on the table.

Tonight it's a hemline, pins held loosely between her lips as she kneels at your feet, adjusting the fall of a skirt that doesn't need adjusting nearly this many times. "You've become a habit," she says around the pins, before setting them aside and looking up at you properly. "I don't form those easily. Clients come and go, season to season. Very few of them keep staying."

"Do you mind?"

"No." She says it plainly, without her usual careful guardedness, rising slowly to standing, closer now than the fitting strictly calls for. "I find I look forward to your fittings more than I should admit to a client. I've started scheduling them for the end of the day on purpose, so there's no one after you to rush us along."

"I wondered why they'd gotten later."

"Now you know." She says it plainly, no embarrassment in the admission at all, the kind of person who'd rather own a thing outright than pretend it isn't true. Her hand settles at your waist to check the drape of the fabric, and stills there — the pin forgotten between her fingers, some private calculation happening behind her eyes that has nothing to do with tailoring. "I don't know what to do with wanting someone this specifically," she admits, quieter. "It's not really in the job description."

"Maybe expand the job description."

That earns a slow, considering smile, the kind she doesn't give away easily. "Maybe I will." She resumes pinning, businesslike again on the surface, though her hand finds your waist for every subsequent adjustment now, lingering exactly as long as the last time and not a moment less.

"What would that look like?" you ask. "The expanded job description."

"I haven't decided yet. I'm not in the habit of improvising." She glances up, something wry and warm in it. "But I find myself willing to, for you. That should tell you something."

"It tells me I should keep booking fittings."

"It does." Something in her posture eases at that, a fraction of the exacting stiffness she carries dropping away like she'd been bracing for a different answer. "I've never had a client I looked forward to seeing on the schedule. It's a strange thing, checking the book each morning to see if you're on it."

"Strange good, or strange bad?"

"I haven't decided that either. I seem to be deciding a great many things lately, all at once, and none of them the way I usually do." She finishes the hem, stands back to examine her work with genuine focus, and then, almost as an afterthought, adds: "Come back Thursday. I'll have thought of something by then." It isn't a question, and you don't treat it like one.

Walking out past the darkened dress forms, gate rattling down behind you, you catch her watching through the glass a beat longer than a goodbye requires — precise even in that, deliberate, already looking forward to Thursday the same way you are.

The days between fittings feel longer than they should, and more than once you catch yourself sketching out reasons you might need an early appointment, an adjustment, anything to see her sooner than the calendar allows. You suspect, from the speed of her replies whenever you do ask, that she's doing exactly the same math on her end.

· · ·

She invites you to see a new design before it's ever reached the racks — no appointment on the books, just a text late one evening asking if you're free, gate locked, dressing room lit warm and low when you arrive. Vivienne's waiting with a single piece draped over her arm, more careful with it than you've seen her be with anything else in the shop, holding it the way most people hold something breakable rather than something they made with their own hands.

"This one's for someone who dresses for herself first," she says, echoing her own long-held philosophy, watching your reaction with a kind of investment she doesn't usually let show. "I made it thinking of you. That's new for me. I don't usually design with a specific person in mind — it compromises the vision, having someone real attached to the sketch."

"I'm flattered."

"You should be. It's the most honest thing I've made in years." She sets down her sketchbook, the pages full of half-finished ideas she's clearly abandoned in favor of this one, and crosses the room toward you with the piece held carefully in both hands. "I scrapped four other versions before I settled on this. Wasteful, for me. I don't usually scrap anything." She holds it up against you, adjusting the strap with careful fingers, close enough now that you can smell the faint clean scent of the fabric starch and something warmer underneath it that's entirely her. "Try it on. I want to see if I got it right."

"And if you didn't?"

"I always get it right. That's not arrogance, it's thirteen years of practice." She says it lightly, but there's a flicker of genuine nerves beneath the confidence, quickly smoothed over. "Go on. The screen's through there."

You do, and when you step out from behind the screen she goes very still, taking you in with the same total attention she's given every measurement, every fitting, except there's nothing clinical left in it now.

"Well?" you ask.

"I got it right." She circles you slowly, adjusting the fit with careful, deliberate hands, lingering at your waist, your shoulder, the small of your back, in a way neither of you pretends is purely professional anymore. "I don't know what to call this," she admits, quieter. "Whatever's happening between the measurements. I've been trying to name it since your second fitting and I keep failing."

"We don't have to name it tonight."

"No," she agrees, relieved by the permission. "I suppose we don't." She circles you slowly one more time, quiet for a moment, the only sound the faint rustle of silk and the tick of the shop's old clock somewhere behind the dress forms. "I've made hundreds of pieces," she says eventually. "I don't think I've ever been nervous handing one over before tonight."

She steps back to look at the whole effect once more, and something in her expression softens into open admiration instead of professional assessment. "You wear it better than I imagined. I don't say that lightly."

"You don't say much lightly."

"No," she says, low, amused. "I don't." She reaches out to adjust one final seam that doesn't need adjusting, hand resting against your collarbone a beat longer than the correction requires, and for a moment neither of you moves, the whole atelier quiet around you, dress forms standing witness in the dark. "Keep it," she says finally, stepping back. "Consider it a very deliberate gift."

"Vivienne—"

"Thursday," she says, recovering her composure, though not quite all of it. "We'll discuss names for things then."

You leave with the piece folded carefully in tissue paper, the gate rattling down behind you, and you notice she watches from the doorway until you've turned the corner out of sight, something unguarded in her expression that she'd never let a client see.

· · ·

The atelier stays quiet one night, no fitting scheduled, no pretense of tailoring left to hide behind — just the two of you alone among the dress forms after the gate's been pulled fully down and locked. The shop's quieter than you've ever heard it, the radio switched off for once, only the tick of the old clock and the occasional creak of the building settling around you both. Vivienne sets the tape measure aside for good this time, draping it over the worktable instead of her neck, a small gesture that feels larger than it should.

"I don't let people see me want something," she admits, precise even in vulnerability, arms crossed loosely like she's bracing herself for a reaction she can't predict. The lamp above the worktable throws a small warm circle of light around you both, the rest of the shop dark and quiet, dress forms watching from the shadows like patient chaperones who've long since given up trying to keep the two of you apart. "It's inconvenient for a woman who built her whole business on control. Every stitch, every measurement, every decision — mine, exactly as I want it. Wanting you complicates that considerably."

"Is that a bad thing?"

"I thought it would be." She considers the question seriously, the way she considers everything, unwilling to give you an easy answer just because it's the comfortable one. "I've spent thirteen years making sure nothing in this shop happens by accident. Every stitch deliberate. Every client kept at exactly the distance I choose." She looks at you now, something rawer in it than her usual composed precision. "You're the first thing in a long time I didn't plan for."

"Is that so terrible?"

"I keep waiting for it to be." She almost laughs, more at herself than at you. "I keep checking, the way I'd check a seam for a flaw. I haven't found one yet. That might be the most unsettling part of all this."

"How does that feel?"

"Terrifying. Then, somehow, not." She closes the distance herself, sure despite the admission, hand coming up to rest against your jaw with the same careful precision she uses for a hem, though there's nothing clinical left in the touch at all. "I've measured you more times than I can count," she murmurs. "I still don't fully understand what I'm looking for."

"Maybe you're not supposed to measure this part."

That gets a low, surprised laugh out of her, real and unguarded. "No," she agrees. "Maybe I'm not." She kisses you then, slow and deliberate, tasting like the careful attention she's given you since that very first measurement — unhurried, exact, nothing rushed about it even now. Her fingers find the collar of your shirt, adjusting it out of pure habit even mid-kiss, and when she finally pulls back she looks faintly astonished at herself, at the whole unplanned shape of the evening.

"Well," she says, a little breathless, precision cracking at the edges. "That wasn't in the pattern."

"Does that bother you?"

"No." She kisses you again, shorter this time, more certain. "It's the best complication I've had in years." She rests her forehead briefly against yours, tape measure forgotten on the worktable behind her, dress forms standing silent witness in the dark shop around you both. "I don't know what happens next. I find I don't mind not knowing, for once."

"You, not knowing something. That's new."

"Everything about tonight is new." She laughs, low, and it's a different sound than her usual measured amusement — looser, more surprised at itself. "I'll let you know if I decide I hate it."

"You won't."

"No," she admits, smiling now, unguarded in a way the shop's dim light makes look almost soft. "I don't think I will."

· · ·

Months later, the atelier's got a standing appointment on the books that isn't really a fitting anymore, though Vivienne still measures you occasionally, unhurried and thorough, mostly for the excuse to keep her hands on you a little longer than strictly necessary. Tonight the gate's down early, the shop closed to everyone but you, a bottle of wine open on the worktable beside a stack of sketches she still won't let you see in full. The dress forms have multiplied since that first night, a whole new collection taking shape around the room, and you've noticed more than one of them bears a silhouette that looks suspiciously familiar.

"Exactly how thorough," she says, echoing herself, tape draped around your neck instead of hers this time, a private joke between you both that's outlasted every other joke either of you has made. "I promised you that, the very first night. I don't think either of us realized how far it would go."

"Any regrets?"

"None." She sets down her wine glass and looks around the shop slowly, at the dress forms and the fabric bolts and the worktable that's seen every important conversation you've had since the beginning, like she's cataloguing it for the memory rather than the ledger. "I used to think this shop was the whole of my life. I still love it. I just don't think it's the whole of anything anymore." She takes the tape back gently, coiling it with the same precise care she gives everything, and sets it aside. "I built this whole business on being exact about what I wanted and never letting anyone close enough to complicate it. You complicated it anyway. Best decision I never planned to make."

"High praise, from someone who plans everything."

"You're the one exception I've stopped trying to explain." She glances toward the dress forms crowding the far wall, half-amused at her own transparency. "I used to sketch abstractions. Ideas of women, not actual ones. I can't seem to design anything anymore that doesn't have your shoulders, your waist, the exact way you stand when you think no one's watching. It's become something of a professional hazard."

"I don't mind being your professional hazard."

"Good. You're stuck with the role." She pours a second glass, settling beside you at the worktable instead of across from it, dress forms standing quiet around the room like old friends who've gotten used to you being there. "I used to think control was the whole point. Perfect fit, perfect fabric, perfect distance from everyone who wore it. Turns out the perfect fit was never really about the lingerie at all."

"What was it about, then?"

"You. Rather inconveniently." She says it dry, fond, entirely certain, and kisses you — precise and unhurried, the boutique dark and quiet around you both except for the single warm lamp still burning over the worktable. "Best fitting I ever gave anyone," she murmurs after, resting her hand against your chest like she's taking one final measurement, purely for herself this time. "I intend to keep taking it, if you'll let me."

"Every Thursday, same time?"

"Every Thursday." She smiles, the rare, unguarded one she's stopped rationing since that first kiss. "And most nights in between, if I have anything to say about it."

"You usually do."

"I usually do." She sets her glass down and studies you for a long moment, the same exacting attention she gave you that very first night, except there's nothing clinical in it now, only certainty. "I don't think I ever thanked you properly. For ruining thirteen years of very deliberate control."

"You don't need to thank me."

"I know. I want to anyway." She laughs, low and warm, and pulls you closer among the dress forms and the fabric bolts and the quiet gold lamp light, the whole atelier finally feeling less like a workshop and more like something both of you built together, stitch by careful, deliberate stitch.`,
  },
  {
    character: "Talia",
    title: "The Last Boat Out",
    setting: "the deck of a yacht at sunset, string lights, ocean spray, champagne on ice",
    genre: "romance",
    tone: "sultry",
    content: `The marina's already thinning out by the time you get there, most of the smaller boats dark and roped off for the night, and you'd half convinced yourself on the drive over that you'd missed your chance entirely. The last tender pulls away from the dock just as you step aboard, engine noise fading into the slap of water against the hull, and for a second you wonder if you've genuinely made the final crossing or just imagined it. Then you see her — Talia, already at the rail, gold and unhurried, sunset light catching in salt-wavy hair like she arranged the whole sky specifically for this moment and has nowhere better to be than exactly here.

"You made the last boat out," she says, handing you a glass without asking what you wanted, the ice already melting soft against warm champagne. "Lucky you. Grab a drink, the sunset's better from where I'm sitting."

"Is that an invitation?"

"Everything out here's an invitation." She pats the cushion beside her, string lights just starting to glow against the fading gold sky, the deck around you filling with easy laughter and the low murmur of other guests who don't seem to register that you exist at all — not compared to the way she's looking at you. Somewhere behind her a small speaker plays something unhurried and warm, and the crew moves around the deck with the practiced ease of people who've done this a hundred times, refilling glasses, adjusting the string lights, entirely used to being invisible next to their captain.

You sit. The yacht rocks gentle and slow beneath you, champagne cold in your hand, condensation slipping down your fingers, and Talia watches you with the kind of unhurried attention that makes the whole deck feel like it exists just for this one conversation, sunset and string lights and ocean spray included.

"You do this a lot?" you ask, when you finally trust your voice not to sound as unsteady as you feel. "Host these parties."

"Every week. Different guests, same sunset." She shrugs, easy, unbothered, tucking one leg beneath her on the cushion. "Gets old, mostly. People come for the champagne and the photos and leave before the good part."

"What's the good part?"

"Depends on the night." A slow, private smile crosses her face, the kind that seems reserved for exactly this moment. "Tonight's different, though. You're different."

"Different how?"

"You haven't asked me a single question about the boat yet. Everyone asks about the boat first. How big, how much, who paid for it." She shrugs, unbothered by the memory of it. "You just sat down and looked at the sunset. That's rarer than you'd think, out here."

"How do you know already?"

"I don't, yet." She leans back against the rail, sun-wavy hair catching the last of the gold light, the whole horizon behind her going soft and orange. "But I'm looking forward to finding out. Stick around past the sunset and we'll see."

"What happens after the sunset?"

"Whatever we decide." She clinks her glass lightly against yours, unhurried, certain, the deck around you both fading into background noise. "I don't usually make promises about an evening before I know how it's going to go. But I like this one already. That's saying something, coming from me."

"High standards?"

"The highest." She laughs, low and warm, watching the last sliver of sun disappear below the water with visible satisfaction, like she'd personally arranged the timing. "Comes with running the best boat on this stretch of coast. I don't waste a sunset on someone who isn't worth it."

"And I'm worth it?"

"Ask me again after the champagne's gone." She's still smiling when she says it, easy and warm, string lights fully lit now against the darkening sky, and something about the way she looks at you makes it very clear she already knows her answer.

· · ·

You end up on every guest list after that — an invitation appearing in your inbox like clockwork each week, and Talia always finds you first the moment you step aboard, drink already poured, the same unhurried warmth in her eyes every single time, like she'd been watching the dock for your arrival specifically. The other guests have started to notice, murmuring among themselves whenever she peels away from hosting duties to settle beside you instead, though she doesn't seem to care in the slightest who's watching.

"You keep coming back," she says, one evening, settling beside you at the rail with the ease of someone who's decided this particular spot belongs to the two of you now. "Most guests do one party and move on to the next boat down the marina. Better music, better crowd, whatever they tell themselves. You keep choosing mine."

"Maybe I like the host."

"Careful." But she's smiling, delighted rather than deflecting, tucking a piece of salt-wavy hair behind her ear. "I don't usually let hosting turn into something else. Bad for the exclusive-party-hostess brand, having a favorite. Looks unprofessional."

"Do you have a favorite?"

"Working on figuring that out." She studies you, genuinely considering, the string lights just beginning to flicker on overhead as the sky shifts from gold to deep blue. Someone laughs loudly from the other end of the deck, and she doesn't so much as glance over, her attention entirely fixed on you the way it hasn't been on anyone else all night. "I think I don't care about the brand tonight."

"What do you care about?"

"Finding out if this is as good as it feels." She clinks her glass against yours, easy and certain, watching you over the rim of it with an attention that makes the rest of the deck disappear entirely. "Sunset's better with you here. I'm not just saying that for the ambiance, though I could, and most people wouldn't know the difference."

"How do I know the difference, then?"

"You ask questions like that." She laughs, delighted, leaning into your shoulder for a moment, warm and easy. "Most guests just take the compliment and move on. You want to know if I mean it."

"Do you?"

"Every word." She says it simply, without her usual practiced charm, something more honest underneath the warmth. "I've hosted a hundred of these parties. I don't usually remember the guests by the following week. I remember you before you've even left the dock."

"That's either very flattering or slightly concerning."

"Both, probably." She grins, tipping her glass back, the last of the light fading fully into night around the string-lit deck. "Stick around. I'll figure out which by the time the season's over."

"And if I don't stick around?"

"You will." She says it with total, easy confidence, not a trace of doubt in it, and settles more comfortably against your side like the matter's already decided. "I've got a good read on people. Especially the ones who keep making the last boat out."

"And what's your read on me, exactly?"

"That you're going to keep testing that theory whether I ask you to or not." She grins, tipping her glass toward you like a small private toast. "I'm not complaining. Consider it a standing invitation. No expiration date."

The night stretches long after that, easy and warm, and when the crew finally starts clearing glasses toward the small hours, Talia walks you to the tender herself, unhurried even then, in no rush to let the evening end, lingering at the rail long after the little boat's pulled away, watching until you're out of sight.

· · ·

A storm rolls in one evening, fast and unexpected the way they do out on open water, the sky going from clear to bruised in the span of one song, forcing every other guest scrambling belowdecks in a scatter of dropped napkins and squealing laughter, someone's sunhat sailing overboard entirely unmourned. You and Talia stay on the open deck longer than sense allows, watching the first fat drops of rain hit the water in widening rings around the boat.

The other guests are already halfway down the companionway stairs, laughing and shrieking about ruined hairstyles, glasses abandoned half-full on the deck furniture.

"We should go in," you say, not moving.

"Should." Talia doesn't move either, rain starting to soak through the sheer gauze of her cover-up, grinning at the absurdity of the two of you standing there getting drenched on principle. "I don't usually let a party get rained out. Bad for the schedule. Champagne goes flat, guests complain."

"Bad businesswoman, staying out here, then."

"Terrible." She wipes rain out of her eyes, laughing at herself now as much as at the weather. "My manager's going to have questions about the refunds tomorrow. I've already decided not to have good answers for him." She laughs again, pulling you closer under the entirely useless shelter of her arm, salt spray and rain and the deep smell of the ocean all around you both, the string lights swaying overhead, half of them already sputtering out in the wet. "Worth it, though. I don't mind ruining an evening's plans for you."

"What plans did you have?"

"Champagne toast at nine. Fireworks off the stern at ten, if the supplier came through." She shrugs, entirely unbothered by the loss of both, rain dripping from the ends of her hair. "This is better, honestly. Fireworks are for guests who need convincing the night was worth it. You don't need convincing." She shakes water out of her hair like she's got nowhere better to be, laughing at the spray of it, unbothered entirely by the ruin of her carefully arranged evening.

"Don't I?"

"Do you?" She looks up at you properly then, rain streaming down both your faces, laughing despite it, or maybe because of it. "I didn't think so. You've been ready to stay out here since the first fat drop hit."

"Guilty."

"Good. Me too." The boat rocks harder now, waves picking up beneath the wind, and she braces a hand against your chest more for the excuse than the actual need for balance, looking entirely at home in weather that's sent the rest of the yacht scrambling for cover. "I like you like this," she says, quieter now, rain-soaked and unglamorous and real. "Not performing for the party. Just here."

"I like you like this too."

"You'd better." She grins, rain dripping off her chin, entirely unbothered by how thoroughly ruined her carefully styled hair has gotten. "This is the version nobody gets a photo of. Consider yourself lucky."

Something in her expression softens at that, easy confidence giving way to something a little more unguarded. "Careful," she murmurs, echoing herself from weeks ago, though there's nothing teasing left in the warning now. "Keep saying things like that and I'll stop wanting the party to start back up at all."

"Would that be so bad?"

"No," she admits, and the rain keeps falling, and neither of you goes belowdecks for a long, long while, the whole storm feeling less like an inconvenience and more like the first honest thing that's happened between you. By the time the rain finally eases, you're both soaked through and shivering, and Talia insists on toweling your hair dry herself before her own, laughing the entire time at how thoroughly the evening's gone off script.

· · ·

The deck empties early one night — Talia's doing, a quiet word to the crew that sends them all belowdecks before the sun's even fully down, the string lights left glowing just for the two of you against a sky gone the color of a bruise healing, purples and deep blues bleeding into the last orange at the horizon. The engine's cut entirely, the boat drifting easy and slow, and even the usual creak of rigging seems to have gone quiet out of respect for whatever she's decided tonight is going to be.

"I don't usually clear a boat for one guest," she admits, champagne forgotten warm between you both on the low table. "Bad for business, sending away a full party halfway through. Very good for tonight, though."

"Why me?"

"Because you're the first person who made me want the party to end early so it could just be us." She says it simply, no performance left in her voice at all, watching the horizon instead of you for a moment like she needs the extra second to steady herself. "I've hosted a hundred sunsets on this boat. I don't think I've ever wanted one to be just for one person before."

"What changed?"

"You did. Or I did, around you. I haven't fully worked out which." She turns to face you properly then, sun-warm skin catching the last of the fading light, salt-wavy hair loose around her shoulders. "I like being the host. Everyone's favorite, nobody's in particular. It's safe. Doesn't cost anything." She looks down at her hands for a moment, unusually quiet. "My mother used to say I collected people like seashells. Pretty for a season, then back on the shelf. I never minded the comparison until recently."

"And this costs something?"

"Everything, maybe. I don't know yet." She sets her glass down on the low table with a decisive little click, as if that small gesture is its own kind of commitment. "I've built a whole life out of easy. Easy charm, easy exit, nobody owed anything after the sunset ends. I'm not sure I know how to do the opposite of that." She closes the distance between you slowly, certain despite the admission, hand coming to rest at your jaw with a warmth that feels entirely unhurried, entirely hers. "I'm finding I don't mind paying it."

She kisses you then, slow, tasting like champagne and salt air and something warmer underneath both, her free hand finding the back of your neck to pull you in a little closer, unhurried in a way that makes the whole moment stretch out longer than it probably lasts. When she finally pulls back, she's smiling, a little breathless, genuinely pleased with herself.

"There," she murmurs, resting her forehead against yours. "Best view all night, and it's not the sunset."

"You planned that line."

"I plan all my best lines." She laughs, warm and easy, though there's something newly unguarded in it, softer than her usual practiced charm. "Didn't plan meaning it this much, though. That part's new."

"Good new?"

"The best kind." She kisses you again, shorter this time, sure, the string lights swaying gently overhead in the night breeze, the rest of the boat quiet and dark around the small warm world the two of you have made of the open deck. "Stay the night," she says, quieter now. "I'll have the crew bring the tender back for you in the morning. No rush before then." She says it like she's testing how the offer feels out loud, watching your reaction carefully despite the practiced ease of her voice.

"No rush," you agree.

"Good." She settles into your side, golden even in the dark, entirely content, and the boat drifts easy on the water while the last of the string lights burn low and steady above you both.

· · ·

Months later, the yacht's got a standing reservation that isn't really a party anymore — just the two of you, most sunsets, string lights glowing early by unspoken agreement before the sky's even started to turn, the crew long since used to clearing out early and leaving the deck to the pair of you. Even the champagne's changed — a bottle she picked out specifically because you liked it once, months ago, in passing, and she never forgot.

"The last boat out," she says, echoing that very first night, settled into your side at the rail, a glass of champagne warm and mostly forgotten in her hand. "Still true, in a way. You made it onto the last boat, and I never really let you leave."

"No complaints here."

"Good. I'd have been disappointed." She says it lightly, but there's real warmth underneath the teasing, the kind she doesn't bother hiding anymore. "I used to worry I'd get bored, you know. Same view every night. Turns out the view's never actually the same twice, not with you here."

"Good." She kisses your temple, unhurried, golden even as the sun goes fully down behind her, the horizon painting the whole deck in the same warm colors that caught your eye the very first night. "Best guest I ever had. Glad I convinced you to stay past the sunset that first time."

"You didn't have to convince me much."

"I like to think I helped." She laughs, low and easy, tracing idle patterns against your arm, the string lights flickering fully on now overhead as the last of the color drains from the sky. "I used to think the party was the whole point. Fresh crowd every week, easy charm, nobody sticking around long enough to actually know me. Safer that way."

"And now?"

"Now I've got someone who knows exactly how I take my coffee and still shows up for the sunset anyway." She says it easily, without her old guardedness, watching you instead of the horizon for once. "Turns out the party was never really the point at all. I just hadn't found the person worth clearing the deck for."

"You never told me that part, you know. How you take your coffee."

"Black, no sugar. Don't you dare tell anyone — ruins the whole easygoing bit I've got going." She laughs, delighted with herself, nudging your shoulder with hers. "I noticed you noticed, the first week. Filed it away without meaning to."

"High praise from someone with this many guests to compare me to."

"You're not being compared to anyone." She sets her glass aside, turning fully toward you, sun-warm and certain despite the settling dark. "I don't do that anymore. Haven't wanted to, since that first storm."

"The one that ruined your fireworks."

"Best ruined evening of my life." She reaches over to refill your glass without asking, an old habit turned tender through months of repetition. "I keep meaning to get that storm's timing tattooed somewhere, honestly. Feels like the actual anniversary, more than the night we met." She kisses you, unhurried, tasting like salt air and champagne and something that's become entirely familiar over the months, easy and sure in a way that first kiss could only promise. "I don't need convincing anymore, either. In case you were wondering."

"I wasn't."

"Good." She laughs, warm and low, and pulls you close against the rail as the stars start to come out properly overhead, the whole boat quiet and hers and yours together, drifting easy on calm water while the string lights burn steady through the dark. Somewhere below deck the crew's already turned in for the night, the whole vessel given over entirely to the two of you, and neither of you moves to go inside for a long while yet, content just to watch the dark water and each other in equal measure.`,
  },
  {
    character: "Naomi",
    title: "The You Nobody Else Gets to See",
    setting: "a private boudoir photography studio, velvet backdrop, soft key lighting, camera on a tripod",
    genre: "romance",
    tone: "intimate",
    content: `The studio's quiet except for the low hum of the softbox lights warming up, velvet backdrop pooled deep and wine-dark behind you, dust motes drifting visible in the single shaft of daylight still leaking through the blackout curtain before Naomi pulls it fully closed. A rack of silk robes hangs against the far wall, a stool angled just so beneath the key light, and everything about the room feels deliberate in a way that should be intimidating and somehow isn't. She circles you once with the practiced ease of someone who's done this a thousand times and still, somehow, takes every single session seriously, like you're the only person who's ever stood on this particular spot of floor.

"Drop the shoulders," she says, adjusting your posture with two careful fingers at your collarbone, unhurried, precise. "Chin down, eyes up — there. That's the you nobody else gets to see."

"Is that meant to be reassuring?"

"It's meant to be true." She steps back behind the camera, studying you through the lens with an intensity that has nothing performative about it, nothing of the polished small talk you expected walking in here nervous and half-convinced you'd made a mistake booking this. "Most people come in here braced for judgment. Shoulders up around their ears, smiling too hard, trying to look like someone else entirely. I'm not here to judge you. I'm here to show you what I already see."

The shutter clicks, once, and she checks the frame on the little screen, nodding to herself, quietly satisfied in a way that feels earned rather than automatic. "There. See that?" She turns the screen toward you, and you barely recognize the person looking back — not because it's flattering exactly, but because it's disarmingly, uncomfortably honest. "That's not a bad angle or a flattering trick. That's just you, finally not hiding."

"I didn't know I was hiding."

"Everyone is, a little, before they sit for this." She checks the light meter once more out of habit, though she clearly already knows the reading by heart, and glances back at you with an easy, appraising look. "You'd be surprised how many people book this session and then spend the whole hour apologizing for their own body. I don't let that happen here. There's nothing to apologize for." She sets the camera down on its tripod, coming closer now, studying you without the lens between you, hazel-dark eyes doing something the camera hadn't quite captured — seeing you plainly, without the frame's excuse to look. "It usually takes people the whole first session to stop performing for it. You're most of the way there already."

"Is that a compliment?"

"It's an observation. I don't hand out compliments I don't mean." She adjusts the key light a fraction, more out of habit than necessity, and glances back at you. "I like watching people stop. It's the best part of the job, honestly — better than the final print. That moment where the bracing just falls away."

"Did I have a moment like that yet?"

"Not yet. Give it time." A small, private smile, there and gone. "I've got you booked for the full hour. We're not in any rush."

She resumes the shoot, unhurried, adjusting your chin, your hands, the angle of your shoulders with a directness that never once feels clinical, each correction closer and lengthier than strictly necessary for good composition. By the time the session ends, you feel both entirely exposed and, strangely, entirely safe, like she's handed something back to you that you didn't know you'd been missing.

"Same time next week?" she asks, already scheduling before you've fully agreed, camera bag over one shoulder.

"Yeah. I think I'd like that."

"I think you would too." She walks you to the door herself, camera bag left behind on the light table for once, and lingers there a beat longer than a simple goodbye requires. The look she gives you as you leave isn't quite professional distance anymore, and you both seem to notice it at the same moment.

· · ·

You book a second session, then a third, and Naomi starts taking longer between shots — adjusting the lighting more than it strictly needs, tweaking the softbox angle by degrees that don't meaningfully change anything, finding small reasons to keep you in the warm circle of the key light a little longer each time before she finally lifts the camera again. Her assistant stopped coming to these sessions weeks ago, an arrangement neither of you commented on directly, though you both understood exactly what it meant.

She's swapped the velvet backdrop for a deep burgundy one today, unprompted, and you'd bet money she remembered you mentioning once that you liked the color.

"You're more relaxed than the first session," she observes, checking a frame on the little screen, angling it so you both can see. "Good. It shows. The camera doesn't lie about that kind of thing — you can fake a smile, but you can't fake not being braced anymore."

"Maybe I trust the photographer more."

That gets her to look up properly, camera lowered fully this time, real attention landing on you instead of filtered through the viewfinder. "I don't usually let that happen," she admits, quieter than her usual measured cadence. "Clients trusting me specifically, not just the process. Most people trust the studio, the lighting, the idea of the finished print. Not me."

"Is that different?" you ask, genuinely curious now, watching her weigh the question with more seriousness than it probably needs.

"Very." She sets the camera down on the light table, careful with it the way she's careful with everything, and comes to stand closer, arms loosely crossed like she's deciding how much of this she's willing to say out loud. "I find I like it. More than I should, professionally. I've started thinking about your sessions on the days you're not even booked."

"Is that a problem?"

"Ask me after this next frame." But she doesn't move to take it — she sets it down instead, deliberate, and just studies you, camera forgotten entirely now, something more honest than professional interest plain on her face, dark curls falling loose from where she'd pinned them back at the start of the session. "You make it difficult to stay behind the lens," she says finally. "I'm used to being the one who watches. Not the one who wants to be watched back." She sets a hand briefly against the light table, steadying herself against nothing in particular, the admission clearly costing her more than her measured voice lets on.

"Do you want that? To be watched back?"

She considers the question with the same careful attention she gives a composition, unwilling to answer carelessly. "I think I do," she admits. "I haven't wanted that in a long time. It's easier, being the one holding the camera. All the seeing, none of the exposure."

"You could put the camera down."

"I could." Something flickers across her face — want, plain and unguarded, quickly steadied back into her usual composure, though not quite all the way. "Not tonight. I've got a session to finish, and you paid for the full hour." She lifts the camera again, businesslike on the surface, though her hand lingers at your jaw a beat longer than the shot requires when she adjusts your angle one more time.

"Chin down," she murmurs, close now, voice lower than the instruction needs. "Eyes up. There." The shutter clicks, and neither of you looks away from each other after it does. She checks the frame anyway, out of habit, and finds herself smiling at the screen longer than the composition alone would ever justify.

· · ·

She shows you a print from an early session one evening — the two of you alone in the studio after hours, no lights running except the warm lamp over the light table, the softboxes dark and folded against the wall like sleeping things. She's pulled a small stack of prints from a drawer you didn't know existed, the edges soft from handling, like she's gone back to them more than once when she thought no one would ask why.

"This is my favorite one," she says, sliding it across the table toward you, dark curls loose around her face in the low lamp light. "Not because of the composition, though the composition's good. Because of your expression right here." She taps the print. "Like you'd just realized something."

"What was I realizing?"

"I don't know. I was hoping you'd tell me. I've stared at this print more times than I'd like to admit, trying to work it out on my own." She taps it again, thoughtful. "It's not an expression I usually get. Most people either perform for the camera or brace against it. You just looked, for one frame, like you'd stopped doing either." She looks at you now instead of the print, direct and unhurried, hazel eyes steady in a way that makes it hard to look away first. "I've been photographing you for weeks and I still don't fully understand what I'm seeing. Every session I think I've got it — the honest version, the one nobody else gets — and then the next one shows me something new underneath that."

"Maybe there isn't a bottom to it."

"Maybe not." She sets the print down carefully, like it matters more than the words she's about to say. Outside, the city hums faint and distant through the studio's soundproofing, but in here it's just the two of you and the small warm circle of lamplight, everything else held at arm's length for once. "I want to keep looking until I do understand it, though. That's new for me. I usually know exactly what I'm photographing by the second session. You keep surprising the camera."

"Maybe you don't need the camera for that."

Something shifts in her expression — softer, more present, the professional remove she usually keeps even in private moments falling away by degrees. "No," she agrees, quiet. "Maybe I don't." She reaches out and traces the edge of the print instead of touching you, like she's working up to something and needs the extra second. "I don't usually say this to clients. Or to anyone, really. I'm better at seeing people than telling them what I see."

"Tell me anyway."

"I think I've stopped thinking of you as a client somewhere around the third session." She says it plainly, the admission costing her something visible, dark curls falling forward as she looks down at the print again instead of at you. "I think about you outside these walls now. That's never happened before. It's inconvenient, professionally."

"Only professionally?"

"No," she admits, looking up again, something almost relieved in finally saying it. "Not just professionally." The lamp light catches the ink stains permanently faded into her fingers as she reaches for your hand across the light table, tentative in a way that feels entirely unlike her usual quiet confidence. "I don't know what to do with that yet." She laughs, quiet and a little disbelieving at herself, dark curls falling further loose as she shakes her head. "Eight years behind this camera and I've never once let a session run this long over schedule. You've cost me more overtime than any client in the history of this studio."

"You don't have to know tonight."

"No," she agrees, and laces her fingers properly through yours this time. "I suppose I don't." She looks down at your joined hands like she's studying a composition she didn't plan for and finds, against all her instincts, that she doesn't want to correct it.

· · ·

The studio stays dark except for one warm lamp one night, camera untouched on its tripod in the corner, the velvet backdrop still pooled from the last session neither of you bothered to put away. The prints from that evening in the alcove are still out on the light table, unfiled, like she's been looking at them again since you last left. Naomi's quieter than usual when you arrive, sitting on the edge of the light table instead of standing ready with instructions, like she's been waiting and isn't entirely sure what to do with herself now that you're here.

"I don't cross this line," she admits, voice lower than usual, hands folded in her lap, dark curls loose and unpinned in a way you haven't seen outside of a shoot before. "Photographer and subject. It's a rule I've never broken, not once in eight years of doing this. Clients get attached sometimes — I know how to handle that, keep it professional, keep the distance clean. I've never been the one who wanted to cross it."

"And now?"

"You've made me want to break it for weeks." She looks up at you, direct even in the admission, nothing performative in it at all. "I keep telling myself it's unprofessional. I keep booking you again anyway. I've started leaving the good light in longer than it needs to be, just so the session runs late enough that we're the only two people left in the building."

"Then break it."

"You make it sound so simple."

"It is, if you want it to be." You hold her gaze steady, and something in her posture finally gives, the last of her professional composure sliding away like a held breath finally released.

She does — slow, deliberate, rising from the light table and closing the distance between you with the same careful attention she gives every frame, except there's no camera between you at all now, nothing to hide behind or study through. Her hand comes up to your jaw the way it has during a dozen adjustments, except this time she doesn't let go, doesn't step back to check the composition. She just looks at you, close enough that you can see the warm lamp light reflected in her eyes, and then she kisses you — soft at first, testing, like she's checking the framing one last time before committing to the shot, and then more certain, her fingers sliding into your hair, unhurried and thorough in the exact way she's always unhurried and thorough.

"There," she murmurs after, pulling back just far enough to look at you properly, echoing her own words from that very first session. "The you nobody else gets to see." She laughs, a little breathless, genuinely surprised at herself. "Turns out I wanted to be the only one who does."

"That took you long enough."

"I know." She kisses you again, shorter, sure. "I'm better at seeing things than acting on them. Old habit. Watch first, stay safe behind the lens." She rests her forehead against yours, dark curls falling loose between you. "I don't want to watch from behind it anymore. Not with you."

"Good. I didn't want you to, either."

"I'm glad." She pulls back enough to look at you fully, something settled and certain in her expression now that wasn't there minutes ago. "I don't know what this means for the sessions."

"Do we have to figure that out tonight?"

"No," she says, smiling now, easy in a way you haven't seen from her before. "I suppose we don't." The lamp burns low and warm over the light table, and neither of you moves to turn it off, or to leave, for a long while yet.

· · ·

Months later, the studio's got a print on the wall that's never been for sale — you, from that very first session, framed above the light table where Naomi can see it every single day she works, dark curls loose exactly as they were that first evening, though everything since has changed considerably. New clients ask about it sometimes, curious about the one print in the whole studio that isn't for sale, and she's gotten good at deflecting the question with a small, private smile that never quite answers it.

"Drop the shoulders," she says, echoing herself, teasing now instead of instructing, camera left forgotten on its tripod as she crosses the studio and pulls you close instead of behind the lens. "Still my favorite thing to say to you. Some habits are worth keeping, even after they've stopped being professional advice."

"Best photographer I ever hired."

"Best subject I ever found." She kisses you, soft key light warm across both your faces, unhurried in the way she's always been, though there's nothing careful or measured left in it now — just certain, easy affection that's had months to settle into something comfortable. "I still think about that first session sometimes," she admits, pulling back to study you the way she used to study a frame before deciding it was right. "How nervous you were. How I told myself I was just doing my job, watching you the way I watch every client."

"Were you? Just doing your job?"

"For about four minutes." She laughs, low and warm, tracing a thumb along your jaw the way she once adjusted your chin for a shot. "I remember the exact moment it stopped being professional, actually. Second session, the invert of the key light, you laughed at something and I forgot entirely what I was supposed to be adjusting." "Then I was doing something else entirely, and I've been doing that ever since." She glances at the camera on its tripod, dust gathering faintly on the lens cap from disuse. "I still take the photos. I just don't pretend anymore that I'm only looking through the viewfinder."

"No regrets about breaking your own rule?"

"None." She glances at the print on the wall, then back at you, something soft and settled in her expression. "I built this whole practice on the idea that everyone deserves to see themselves as desirable at least once. I never expected to be the one who got seen, in the end. Turns out that's the better part of the job."

"I'd say you saw me pretty thoroughly."

"I intend to keep at it." She kisses you again, unhurried, the studio quiet and warm around you both, the velvet backdrop still pooled deep behind where you're standing like it's waiting for a session that isn't coming tonight. "Glad I broke my own rule for you," she says finally, resting her head against your shoulder, dark curls tickling your jaw. "Best exception I ever made."

"I'll keep showing up, if that helps your case."

"It does. Immensely." She squeezes your hand once, grounding herself in the certainty of it. "For what it's worth, I don't think I ever would have said any of this out loud if you hadn't asked me to tell you the truth that night with the print. I'm better at showing people things than saying them."

"I noticed." She laughs, soft and genuine, pulling you toward the small worn couch in the corner of the studio instead of the light table, the camera left entirely alone on its tripod for once. "Every week, if you're willing. I find I don't much like the studio empty of you anymore."

"Then I won't leave it that way."

She smiles at that, the same smile from the very first print on the wall, except easier now, fuller, entirely her own. "Good," she says. "That's exactly the answer I was hoping for."`,
  },
  {
    character: "Selene",
    title: "Worth the Invitation",
    setting: "a candlelit masquerade ballroom, chandelier, masked guests dancing, midnight approaching",
    genre: "romance",
    tone: "mysterious",
    content: `The mansion's easy to miss and impossible to forget once you've found it — no address posted anywhere, just a wrought iron gate half-swallowed by ivy at the end of a lane the map insists doesn't exist, and beyond it, candlelight instead of electric, warm and flickering in every window like the whole building is breathing. Your invitation had arrived without explanation weeks ago, a single card in unmarked black stock, and you'd turned it over in your hands a dozen times trying to guess who might have sent it before deciding it didn't matter, that you were going regardless. Inside, a chandelier drips gold above a ballroom already thick with masked strangers, laughter and low conversation swirling beneath it, and Selene stands at its center, unmistakable even behind the ornate mask she never removes before midnight.

"You found the invitation," she says, materializing beside you like she's been tracking your arrival since the gate creaked open, voice low and accented, unhurried. "Now find out if you're worth mine."

"How does someone prove that?" you ask, aware of how many eyes in the room have already found the two of you standing together, curious behind their own masks.

"They don't, usually. They're simply found worthy, or they're not." She circles you once, slow, assessing, the candlelight catching the sharp line of her jaw beneath the mask, the dark curls pinned in elaborate coils that catch the gold light like they're part of the performance too. The other masked guests give her a wide, unconscious berth as she moves, the crowd parting without seeming to notice it's parting at all, like the whole ballroom has learned to orbit her without being told to. "You're being considered. That's rarer than you'd think, for a first arrival."

"Should I be flattered or nervous?"

"Both, ideally." A low, private laugh, more felt than seen behind the mask, her striking eyes the only unguarded thing about her in the whole crowded room. "The best evenings are usually both." She extends a gloved hand, an invitation dressed as a command, entirely her style, and you take it before you've fully decided to. "Dance with me. I'll decide the rest as we go."

You dance. She leads with absolute certainty, one gloved hand at the small of your back guiding you through steps you don't remember learning, close enough that the mask's proximity becomes its own kind of intimacy — her eyes the only unmasked thing you can read, dark and amused and giving away exactly as much as she intends to and not a fraction more.

"You dance better than most first-timers," she says, close to your ear, the ballroom spinning slow and gold around you both.

"I had a good partner." Your hand finds the small of her back easier than you expect, like the dance has already decided where it belongs.

"Flattery. I like it, when it's earned." She turns you once, unhurried, the chandelier's light sliding across the mask's gilt edges. "Most guests spend the whole first dance staring at the mask, wondering what's underneath it. You haven't, yet."

"Should I be?"

"No." Something in her voice softens, just slightly. "I find I prefer it, actually, when someone's more interested in the conversation than the reveal."

"Midnight's coming," she murmurs, near your ear as the dance slows toward its close, candles guttering low around the ballroom's edges. "Stay until then, and you'll see something most of my guests never do."

"What happens at midnight?"

"Patience," she says, amused, stepping back with a small, knowing bow. "That's the whole game. Find out."

She's gone a moment later, drawn back into the crowd by some obligation of hosting you can't quite follow, but she glances back once over her shoulder before she disappears entirely into the candlelit throng, and something in the look tells you the evening isn't over yet, not by a long way.

· · ·

You're invited back for the next solstice, and the one after that, always the same mansion nobody can quite find twice — the lane shifts, you swear, though you can never prove it — always Selene finding you before you've fully crossed the threshold, mask catching the candlelight like she's been waiting at the door specifically. Each invitation arrives a little differently than the last — a different wax seal, a different hand delivering it — as though she enjoys keeping even that small ritual unpredictable.

"You keep getting invited," she observes, one solstice, dancing close beneath the chandelier, the ballroom fuller than usual around you both, though it might as well be empty for how little either of you seems to notice it. "I don't extend that courtesy often. Most guests get one evening, memorable enough to talk about for years, and then the invitations simply stop coming. You're on your third."

"Why the exception?" you ask, genuinely curious, watching the chandelier's gold light catch and slide across the elaborate coils of her hair as she turns you slowly beneath it.

"Because you haven't asked me to remove the mask early." She says it like a genuine compliment, rare warmth beneath the mystery of her usual measured tone. "Everyone else demands it eventually. Wants to see behind the performance, convinced the real reward is underneath the gilt and the ribbon. You've let me keep my mystery."

"Does that bother you? That I haven't asked?"

"No." She turns you slowly under the chandelier's gold light, considering the question with real care instead of tossing back something practiced. "I find I want to give you more of it anyway, precisely because you haven't demanded it. That's new for me."

"You don't have to give me anything."

"I know." Something softer flickers behind her eyes, visible even through the mask's narrow openings. "That's precisely why I want to." She leads you off the dance floor toward a quieter corner of the ballroom, away from the thickest part of the crowd, candlelight throwing long shadows against the velvet drapery. A server passes with a tray of dark wine, and she takes two without breaking stride, handing you one like she's done it a hundred times before, though this is only your second solstice.

"Tell me something true," you say. "Something the mask usually hides."

She considers this for a long moment, dark eyes assessing you with none of her usual practiced remove. "I get tired of being unknowable," she admits finally, quiet enough that it's clearly not meant for anyone but you. "The mystery is useful. It's also lonely, being a legend nobody's allowed to actually meet."

"I'd like to meet you. Not the legend." You say it plainly, without flourish, watching her reaction closely enough that she seems briefly caught off guard by the sincerity of it.

"I'm beginning to believe you mean that." A small, genuine smile plays beneath the mask, visible in the way her eyes crease at the corners. "Most people say it. Few of them actually want it, once they realize how much simpler the legend is to love."

"I don't want simple."

"No," she agrees, studying you like she's recalculating something important. "I don't think you do." The music shifts behind you, and she draws you back toward the dancing crowd, though her hand lingers in yours a beat longer than the transition requires. "Come back next solstice," she says. "I think I'll have decided something by then." She holds your gaze a moment longer than the farewell requires before the crowd folds her back into the party, mask gleaming gold under the chandelier until she disappears entirely from view.

· · ·

Midnight arrives differently this solstice. Rather than staying at the ballroom's center to hold court as she always has, Selene draws you away from the dancing crowd entirely, through a side door and down a short candlelit corridor into an alcove where the noise of the party fades to a distant, muffled hum, just the two of you and a scatter of half-burned candles guttering in silver holders. A single tall window looks out over dark gardens you've never noticed from the ballroom, moonlight silvering the hedges below, and the whole alcove feels like a room built specifically for secrets.

"I don't usually do this before midnight," she admits, hand rising to the edge of her mask, hesitating there, candlelight catching the faint tremor in her fingers that her voice doesn't betray at all. "Removing it early. It's meant to be a reward for patience, not given lightly, not to anyone who hasn't earned the full waiting."

"You don't have to remove it."

"I know I don't. That's rather the point." She holds your gaze steadily, fingers still resting against the mask's edge, gathering something like courage before she continues. "I want to." She says it plainly, none of her usual careful mystery in the words at all. "I've worn this mask through every solstice for longer than I care to count. It's easier, being unknowable. Nobody expects anything real from a legend. Nobody's disappointed when the legend doesn't feel things a person would."

"And you feel something now?"

"I have, since the first dance." She lifts the mask slowly, revealing herself fully for the first time — striking eyes no longer softened by the mask's mystery, entirely present, entirely hers, a faint nervousness visible in a face that's spent years perfecting the art of giving nothing away. "There," she says, quiet. "Most people wait years for this, if they ever get it at all. Some never do."

"Some never do," she repeats, quieter, almost to herself, as though the weight of the gesture is only now settling in for her too.

"Why me, this soon?"

"Because you never once seemed to want the mask off more than you wanted me." She says it low, certain, the candlelight throwing warm shadows across newly bare features, softer and more human than the legend that hosts these evenings. "Everyone else treats the reveal like the whole point of coming here. You treated the conversation like the point. That's worth more than any invitation I've ever sent."

"You're lovelier than the mask, if that matters." You say it without thinking, and immediately worry it sounds simpler than you mean it, though her reaction suggests she understood exactly what you meant.

That draws a real, surprised laugh out of her, unguarded in a way you suspect very few people have ever heard. "It matters more than I expected it to." She studies your face now with the same intensity she usually keeps hidden behind the mask's narrow eye slits, nothing held back in it. "I don't know what to do with being seen like this. It's been a long time." She sets a hand lightly over yours, as if grounding herself in the contact while she finishes the thought. "I'd almost forgotten what it felt like, being looked at instead of admired from a careful distance."

"You don't have to do anything with it tonight."

"No," she agrees, something easing in her shoulders. "I suppose I don't." She sets the mask down carefully on a side table, like retiring something she's finally allowed herself to put down, and doesn't reach for it again for the rest of the evening. When you finally return to the ballroom together, a few of the other masked guests glance twice, clearly unable to place what's changed, only that something has.

· · ·

The ballroom empties as the solstice winds down, guests drifting out through the candlelit halls in twos and threes, laughter fading toward the distant gate, and Selene stays in the alcove with you long after the last of them have gone, mask discarded entirely for the night on the side table where she left it. The candles have burned low, wax pooling thick around the silver holders, and somewhere in the empty ballroom beyond the door a single forgotten chandelier candle guttering out is the only sound left in the house.

"I don't let people see me unmasked and uncertain," she admits, voice quieter than her usual deliberate register, hands folded in her lap instead of extended in command the way they usually are. "The mystery is armor. I've worn it a long time — longer than the mask itself, if I'm honest. It's easier to be a legend than a person. Legends don't get hurt. Legends don't have to explain themselves."

"You don't need armor with me." You say it gently, and watch it land somewhere she clearly wasn't braced for, her composure slipping by careful degrees rather than all at once.

That undoes something in her — a rare, unguarded softness replacing the practiced mystery entirely, visible in the way her shoulders drop, the way her hands finally still. "I built this whole solstice around being the one thing nobody could quite reach," she says. "Invite-only. Mask until midnight. Mansion nobody finds twice. Every part of it designed to keep people at exactly the distance I choose."

"And now?"

"Now you're sitting close enough that none of that distance means anything." She looks at you fully, no mask, no candlelight trick of shadow to hide behind, entirely exposed in a way that seems to cost her something and relieve her of something else in equal measure. "I don't think I want the distance back. That frightens me more than anything else about tonight." She laughs, quiet and a little disbelieving at herself. "I've faced down guests twice my size who wanted to know my real name and never once felt unsteady doing it. You've asked nothing of me at all, and I feel like the ground's moved regardless."

"You don't have to be brave about it alone."

"No," she agrees, closing the distance herself, certain despite the vulnerability plain across her face. "I don't think I do." When she kisses you, it's slow and deliberate, nothing performed about it at all — just her, fully seen, fully present, one hand coming up to rest against your chest like she's grounding herself in something real after a lifetime of careful performance. You feel the difference immediately: no measured pace, no calculated pause for effect, just her, unguarded and warm and entirely there.

"Well," she murmurs after, resting her forehead against yours, a soft, surprised laugh escaping her. "That's not something I planned for."

"Bad, unplanned?"

"No." She kisses you again, shorter, sure. "The best kind of unplanned I've had in longer than I can remember." She glances toward the mask on the side table, and doesn't reach for it. "I don't think I'll need that again tonight."

"Good. I like you without it."

"I'm starting to like myself without it too." She says it slowly, testing the truth of the words as she speaks them, like she's trying the sentence on for the first time and finding, to her own surprise, that it fits. She settles against you in the candlelight, the ballroom beyond the alcove finally gone quiet and dark, the whole mansion settling into stillness around the two of you like it's exhaling after holding its breath all evening.

· · ·

The next solstice, you don't need an invitation at all — you're already inside when the other guests arrive, helping light the last of the candles along the ballroom's edge, Selene beside you instead of holding court alone at its center the way she has every solstice before this one. The staff move around you both with easy familiarity now, no longer glancing twice at the guest who apparently belongs to the house as much as its mistress does.

"Worth the invitation," she murmurs, echoing that very first night, mask dangling forgotten from her fingers rather than covering her face, the chandelier's gold light catching in her dark curls the same way it did the night you met. "I wondered that, the night we danced. I don't wonder anymore."

"What's the verdict?" you ask, watching her set the mask aside with the same easy certainty she once reserved only for holding court.

"Best invitation I ever sent." She sets the mask down on a side table without a second glance, an easy, deliberate gesture that would have seemed impossible the first time you saw her. "I used to think the mask was the whole point of these evenings. The mystery, the performance, the legend nobody quite reaches. Turns out I built all of that because I didn't think anyone would want the person underneath it."

"I wanted the person underneath it from the first dance."

"I know. I noticed rather quickly." She takes your hand, lacing her fingers through yours with none of the careful command from that first evening, just easy warmth instead. "It's taken me the better part of a year to stop being surprised by that. I'm still not entirely used to it." She glances toward the tall windows, moonlight silvering the same dark gardens from that first alcove, and something in her expression softens at the memory. "I keep the mask by the door now, out of habit more than need. I haven't worn it past the entrance hall in months."

"Do you miss the mystery?"

"Sometimes. It was comfortable, being unknowable." She considers the question honestly, turning to watch the first guests arrive through the tall doors, candlelight flickering across the entryway. "But I find I like this more. Being known, and staying anyway. That's a different kind of power than the mask ever gave me."

"You still hold the room, you know. Mask or not." You watch the newest arrivals glance her way, drawn in without quite understanding why, the same magnetism she's always carried, unmasked or otherwise.

"Do I?" A small, pleased smile. "Good. I'd hate to lose my touch entirely, becoming soft for you."

"You haven't lost anything. You've just added something."

"Rather well put." She studies you a moment longer, something fond and a little amazed still lingering in her expression even after all these months. "You know, I used to think whoever finally saw behind the mask would be disappointed. Legends are always better than the truth of a person. You've never once seemed disappointed."

"Never once."

She kisses you beneath the chandelier, candlelight gold across you both, unhurried and certain, the first guests filing past with polite, curious glances that neither of you bothers to acknowledge. "Glad you were worth finding twice," she murmurs against your mouth. "Glad you kept finding your way back, even after I stopped needing the mask to keep you interested."

"I was never here for the mask."

"No," she agrees, smiling against another slow kiss. "I don't believe you ever were." The ballroom fills in slowly around you, masked strangers and low candlelight and gold chandelier light exactly as it's always been, except now, for the first time, the whole mansion finally feels less like a mystery and more like something you both call home.`,
  },
  {
    character: "Océane",
    title: "The Bottle She Saved",
    setting: "the tasting room of an old-city wine bar after closing",
    genre: "romance",
    tone: "sophisticated, slow-burn, sensual",
    content: `The bar has been closed for an hour, the way you can tell only from the inside — the last tables wiped down to a dull shine, the front grille half-lowered so the street lamps outside cut the room into amber bars across the floor. Océane didn't ask you to stay so much as fail to ask you to leave, which with her, you're beginning to understand, amounts to the same invitation. She stands behind the marble counter with a bottle you've never seen on any of her lists, the label so faded it's more suggestion than word, and she watches you cross the room toward her the way she watches everything: unhurried, thorough, like she's already tasted you and is only confirming the notes.

"Sit," she says, and you do, because there's a particular gravity to the way she says the small words that makes the large ones feel unnecessary. She works the cork without looking at it, her eyes on your face instead, and when it gives with a soft, deliberate sigh she smiles like the sound pleased her. "This one isn't for the tourists. It isn't for the collectors either — they'd talk over it." She pours a mouthful into a glass so thin it seems to weigh nothing, and slides it the length of the marble until it stops exactly at your fingertips. "It's for someone who'll actually let it happen to them."

You lift the glass. She stops you with two fingers barely touching your wrist. "Not yet. Smell it first. Tell me what it makes you remember, not what it tastes like — anyone can list fruit." Her fingers stay where they are, cool against the pulse in your wrist, and you understand she can feel exactly how fast it's going. You bring the glass up. Somewhere under the wine there's woodsmoke, and rain on hot stone, and something you can't name that makes your chest tighten pleasantly, and when you tell her all of that in a voice that comes out lower than you meant, her mouth curves.

"Good," she murmurs. "You noticed the rain. Most people miss the rain." She finally lets your wrist go, only so she can pour her own glass, and the loss of her touch registers more sharply than you'd like. She leans against the back counter with the easy confidence of a woman in the one room on earth where she is entirely the authority, silk dress the colour of the wine itself, black apron loose at her hips, the tasting notes on the inside of her arm just visible in the low light. "Now drink. Slowly. I want to watch your face when it turns."

You drink. It does turn — blooming from something dark and restrained into warmth that spreads all the way to your fingertips — and you must show it, because she sets her own glass down untouched and simply looks at you for a long moment, the amusement gone quiet into something more considering. "There it is," she says softly. "That's the reason I keep the good bottles for after hours. During the day, nobody lets a thing change them. They're too busy performing knowing about it." She tilts her head, studying you like a vintage she's decided is worth cellaring. "You didn't perform anything just now. You just let it happen." A beat. "I find that unbearably rare."

The grille rattles faintly as a bus goes by outside, and the amber bars of light shiver across the floor and across her, and neither of you moves to break the quiet. "One more pour," she decides, already reaching for the bottle, "and then I should let you go." But the way she says *should*, unhurried and entirely unconvinced, tells you neither of you believes she means to, and you settle deeper onto the stool, in no hurry at all to prove her right.

· · ·

She doesn't let you go. She pours the second glass, and then, when the second glass is gone and the street outside has emptied to the occasional taxi, she comes around the marble counter to your side of it — which feels, in the geography of the room, like crossing a border. She hitches herself onto the stool beside you, close enough that her knee rests against yours, and props her chin on one hand to consider you at this new, smaller distance.

"Tell me why you keep coming in alone," she says. It isn't quite a question. You've been in four times now, always late, always at the end of the bar, and you'd told yourself she hadn't noticed. She had. "A man drinking alone at closing is either running from something or waiting for something. You don't drink like you're running." Her eyes move over your face, frank and unembarrassed. "So. What are you waiting for?"

You could deflect. You've deflected the same question in warmer rooms with less at stake. But there's something about the amber light and the wine still warm in your chest and the cool press of her knee against yours that makes deflection feel like a waste of a rare thing. So you tell her a version of the truth — that you're between the person you used to be and whoever comes next, and that the space between is quieter than you expected, and that hers is the one room where the quiet feels like a gift instead of a verdict.

She's silent when you finish. Then she reaches out and, with the same two fingers she used to slow your wrist, turns your face a few degrees toward the light, studying you as though you're something she poured and is watching turn. "That," she says finally, "is the most honest thing anyone has said to me across this counter in a year." Her thumb grazes the corner of your jaw and stays there a heartbeat longer than it needs to. "Most people give me a story. You gave me the space where the story hasn't been written yet." Her voice drops. "Do you have any idea how tempting that is to a woman whose whole trade is knowing exactly what something will become?"

You don't answer, because her thumb is still at your jaw and her mouth is closer than it was, and the not-answering is its own answer. She notices — she notices everything — and instead of closing the last of the distance she pulls back, slow and deliberate, a decision visibly made. "Not tonight," she says, and there's regret in it, plainly, unhidden. "If I'm going to ruin your standards for anyone else, I'm going to take my time doing it. I don't rush the good ones." She stands, collects both glasses, and the loss of her nearness is a physical thing. "Come back tomorrow. After close. I have something I want you to taste blind." At the counter she pauses, glancing back over her bare shoulder, and the look she gives you could strip varnish. "Wear something you don't mind me getting close to."

· · ·

You come back. Of course you come back. The grille is already half-down when you arrive, and inside the room is lit lower than before, a single lamp behind the marble and a row of candles she must have set out deliberately, because Océane does nothing by accident. There are three bottles on the counter, all of them wrapped in black cloth to hide their labels, and beside them, folded neatly, a strip of dark silk.

"Trust exercise," she says, by way of greeting, lifting the silk. "You've been letting the wine change you. Tonight I take away the one sense you've been leaning on and see if you're brave enough to feel it without watching yourself do it." She comes around to you before you've finished sitting, and up close, in the candlelight, the effect of her is almost too much — the wine-dark mouth, the tasting notes fading on her wrist, the warmth of her radiating through the thin silk of her dress. "May I?" she asks, and it isn't really a question either, but you like that she asks. You nod.

She ties the silk over your eyes with a care that makes the whole world narrow to the brush of her fingers at your temples, the faint scent of her — cedar, something floral underneath, the wine on her breath. The knot settles. The room goes dark and enormous. "Good," she murmurs, and her voice, without a face to anchor it, seems to come from everywhere. "Now you have nothing to do but feel. Open your mouth."

The first taste she brings to your lips herself, the rim of the glass warm where her hand has held it, and she tilts it with a patience that borders on cruelty, giving you only enough to want more. Blind, the wine is a different animal — bigger, more insistent, the woodsmoke and the far-off rain crowding in without your eyes to referee them — and you hear yourself make a sound you wouldn't have made with the blindfold off. "*There,*" she breathes, very close now, close enough that you feel the word against your cheek. "That's the sound I've been trying to get out of you since the first night. That's you not performing."

She feeds you the second wine, and the third, each one closer than the last, her free hand resting flat against your chest now — whether to steady you or to feel your heart going, you can't tell and don't care. By the third glass her mouth is a hand's breadth from yours; you can feel the heat of her, the whole charged nearness, and every nerve you own has migrated to the surface of your skin. "Last one," she says, and doesn't lift a glass. Instead her thumb traces your lower lip, slow, deliberate, and you go utterly still. "This one isn't wine," she whispers. "This one you'll have to earn." And then she's gone — the warmth withdrawing, a soft laugh somewhere to your left — and you sit blindfolded and undone in the candlelit dark, breathing hard, understanding that she has just taught you exactly how patient she can afford to be.

· · ·

The rain comes on the fourth night, hard and sudden, the kind that empties the streets in minutes and drums on the grille like it means to get in. You'd both heard it building for an hour without saying so, and when the sky finally opens Océane doesn't reach for the lights or the keys. She reaches instead for the good glasses, the ones she keeps wrapped in flannel in a drawer under the register, and pours two without asking, because tonight the closing hour is a formality neither of you intends to honour.

"We're not going anywhere in that," she says, nodding at the sheeting dark beyond the grille, and there's satisfaction in it, as though the weather has finally agreed to something she wanted. She comes around to your side and settles close, her shoulder against yours, and for a while you just watch the rain together, the amber light, the wine warming in your hands. The silence between you has changed over four nights; it used to hum with everything unsaid, and now it's simply comfortable, which is somehow more dangerous.

"You asked me once why I keep the good bottles for after hours," she says, unprompted, watching the water run down the glass front. "The honest answer is that this is the only hour I stop performing too. During the day I'm a sommelier — I know things, I tell people what they're tasting, I'm never wrong. It's exhausting, being never wrong." She turns the glass slowly in her fingers. "At this hour, with the grille down, I get to not know things. I get to be surprised." She glances sideways at you, and the candlelight catches something unguarded in her face that you haven't seen before. "You surprise me. I keep waiting to have you figured out, and I keep failing, and I've decided I don't want to succeed."

It's the most she's ever given you, and you understand what it costs a woman whose whole trade is certainty to confess the pleasure of not knowing. You tell her, quietly, that she's the first thing in a long time you haven't wanted to figure out either — that you'd happily stay in the not-knowing with her as long as she'd let you. The rain fills the pause. She sets her glass down on the marble with a small, final click.

"Careful," she says softly, but she's already turning toward you, one hand rising to your jaw the way it did the first night, thumb at the corner of your mouth. "Say things like that and I stop being patient." She's close now, closer than the blindfold night, and this time she doesn't pull back at the last inch — this time she lets the distance close, slow and certain and worth every night of waiting, her mouth finding yours as the rain roars against the glass. The kiss is unhurried, thorough, exactly like everything else she does, and when it finally breaks she stays close, her forehead against yours, both of you breathing like you've run somewhere. "There," she murmurs, unsteady for the first time since you met her. "Now we've both stopped performing."

· · ·

She takes you down to the cellar. There's a door behind the marble you'd assumed was a closet, and beyond it a narrow stone stair descending into cool dark that smells of old wood and older earth, and she goes ahead of you with a candle, silk dress pale against the shadows, glancing back once to make sure you're following as though there were any question. The rain is a muffled drum overhead now, and down here the world shrinks to stone and candlelight and the racked bottles sleeping in their hundreds along the walls.

"This is the part of the trade I actually love," she says, running her fingertips along a row of dusty shoulders. "Everyone upstairs wants the wine to be ready. Down here it's all patience — bottles that won't be worth opening for a decade, some I'll never taste myself. You have to want the waiting, or the whole thing is torture." She sets the candle in a wall niche and turns to you in the amber glow, and the earlier composure is still there but something beneath it has come loose. "I've spent four nights teaching you to be patient. I think I've run out of my own."

You reach for her, or she reaches for you — afterward you won't be able to say which, and it won't matter — and the second kiss is nothing like the careful first. The patience she's been rationing all week gives way at last, her hands fisting in your shirt, your back finding the cool edge of a rack, and she makes against your mouth the same low sound she'd spent nights coaxing out of you, as though she's been holding it just as long. The candle throws your shadows huge and merged across the stone. Her hands find skin; yours find the loose ties of the apron at her hips; the cellar is cold and you are both entirely past noticing.

"Slowly," she breathes, though her own hands are anything but, and it's less an instruction now than a shared understanding — that having waited this long, you'll take the descent the way she takes everything worth having, unhurried, thorough, letting it change you both. The candlelight gutters and steadies. Somewhere above, the rain begins at last to ease. And in the cool dark of the cellar she has kept her whole life like a secret, Océane finally stops saving the good thing for later, and the rest of the night belongs only to the two of you, and to the slow, certain unspooling of everything you've both been so carefully holding back.

· · ·

Morning finds you in the small flat above the bar, grey light through unfamiliar curtains, the city washed clean by the night's rain. Océane is already awake beside you, propped on one elbow, and for a moment before she notices you're watching she looks nothing like the woman behind the marble — younger, unguarded, the wine-dark mouth soft, the certainty set aside like a costume left on a chair. Then she catches your eyes on her and something wary moves through her face, quick and instinctive, and she rolls onto her back to look at the ceiling instead.

"This is the part I'm bad at," she says to the plaster, matter-of-fact. "The after. I know exactly what a wine will become. I have never once known what a morning will." She pulls the sheet up, a small armouring gesture she probably doesn't notice making. "The men who come in at closing — they want the version of me behind the counter. The one who's never wrong, who makes it a performance. They don't want this one." A pause, and her voice roughens slightly. "I stopped letting anyone see this one a long time ago. It's safer."

You turn toward her, and you don't reach for her yet, because you're learning her the way she taught you to learn a wine — slowly, without grabbing. You tell her that the woman behind the counter is magnificent and you'd never want her to give that up, but that it was this one you fell for somewhere around the third glass of the blindfold night: the one who confessed she liked not knowing, the one who came apart in a cold cellar, the one lying here bracing for you to want less of her in daylight. You tell her you don't want less. You tell her the morning is just another thing worth being patient for.

She's quiet a long moment. Then she laughs, low and a little wet, and drops her arm across her eyes. "That's unfair," she says. "You used my own trade against me." But when she lifts her arm again the wariness has gone, or mostly gone, and she reaches over and pulls your hand to her chest the way she did in the tasting room, so you can feel her heart still going hard. "All right," she says softly. "This one. In daylight. You've seen her now — no taking it back." She turns her head on the pillow to look at you, wine-dark eyes clear in the grey light. "I warned you I'd ruin your standards. I didn't warn you you'd ruin mine. I don't think I mind."

· · ·

The complication has a name, and it arrives on a Tuesday in a good suit. He owns the building — the whole block, in fact — and he's been circling the bar for a year, offering to buy Océane out, turn the old tasting room into something with a bigger margin and no soul. You learn all this because you're there when he comes in, and you watch the woman behind the marble reassemble herself in an instant, the daylight softness vanishing behind the never-wrong sommelier, and you understand exactly how much armour that costume is and why she wore it so long.

"The offer's gone up," he says, not sitting. "Considerably. You'd be a fool to turn it down twice." His eyes flick to you, dismissive, cataloguing you as furniture. "Sentiment's expensive, Océane. This room doesn't make what the room could make." And you see it land — the fear under her composure, the exhaustion of holding a small good thing against people who only understand margins — and you see her waver, because being never wrong is lonely and the number he's naming would buy a great deal of not having to be.

He leaves the offer on the marble and goes. The room rings with his absence. Océane stands very still, both hands flat on the counter, and for once she has no note to give, no certainty to perform. "He's right that it doesn't make what it could," she says, low. "He's right that I'm being sentimental. This is the part where the sensible woman signs." And then she looks up at you, and there's a question in it she'd never ask aloud.

So you answer the one she isn't asking. You tell her that the room is the only place you've ever watched a person be surprised on purpose. That she built a place whose entire trade is patience and letting things change you, and that a room like that is worth more than what it makes, precisely because so few people will ever understand why. That whatever she decides you're on her side of the marble now, sensible or not. She listens with her whole attention, the way she taught you to listen to wine. Then, slowly, she picks up the offer, folds it in half, and drops it in the bin beneath the register without a word — and the smile she gives you afterward is the daylight one, the unguarded one, the one she stopped letting anyone see.

· · ·

She keeps the bar. Word gets around, the way it does, and the closing hour fills up — not with tourists, she's careful about that, but with the kind of people who'll let a wine change them, the ones she used to keep the good bottles for. You're there most nights now, at the end of the marble that has quietly become yours, and the trust exercise has become a habit: some nights she still ties the dark silk over your eyes, just to watch you feel a thing without watching yourself do it, just because she can.

Tonight the grille is all the way down and the room is empty but for the two of you and the candles she still sets out by hand. On the marble stands the bottle from the very first night — the faded label, the one she'd saved for someone who'd actually let it happen to them — and there's exactly enough left in it for two glasses. "I've been keeping the last of it," she says, working the cork with her eyes on your face the way she did that first night, before either of you knew. "I couldn't decide what occasion was worth it. Then I decided the occasion was you not leaving." The cork gives with its soft, deliberate sigh. She pours, and slides the thin glass the length of the marble until it stops exactly at your fingertips, exactly as she did the night this all began.

"Smell it first," she says, mouth curving. "Tell me what it makes you remember." And you do — the woodsmoke, the far-off rain, and now, layered under all of it, four candlelit nights and a cold cellar and a grey unguarded morning and an offer folded into a bin. You tell her all of it, and her eyes go soft and certain in the low light. "Good," she murmurs, lifting her own glass at last. "You noticed everything. You always do." She touches her rim to yours with a sound like a held breath let go. "To not knowing what the morning brings," she says, "and drinking the good bottle anyway." You drink, slowly, and let it turn, and let it change you, and across the marble the woman who saved the best thing she had for someone worth ruining watches your face in the candlelight and, for once, looks entirely unsurprised to find herself exactly where she wants to be.`,
  },
  {
    character: "Reyna",
    title: "Follow My Lead",
    setting: "a tango studio above a shuttered theatre, late at night",
    genre: "romance",
    tone: "commanding, physical, charged",
    content: `The last class of the night has emptied out — you can hear the couples clattering down the stairwell, their laughter thinning into the street — and you're gathering your coat when Reyna's voice stops you at the door without her raising it at all. "Not you," she says, crossing the floor toward you, and the old boards give slightly under her worn leather heels the way water gives under a swimmer who knows exactly how deep it is. "You spent the whole hour in your head. Counting. Watching your own feet." She stops close, closer than the class ever allowed, and tilts her head to consider you. "Stay. I'm going to teach you to stop."

The studio is enormous and empty now, one wall all mirrors, the other all tall windows black with night, a single warm lamp burning in the corner by the ancient record player she prefers to anything with a screen. She sets a needle down without looking — a slow, aching bandoneón fills the room — and holds out one hand, palm up, an unambiguous demand. "Close hold," she says. "The real one, not the polite version I give beginners. Come here." And when you step into her frame she draws you in until there's no daylight left between you at all, her cheek a breath from yours, her hand flat and certain against your back, and every count you'd been keeping in your head scatters like dropped cards.

"Better," she murmurs, and you feel the word more than hear it, her mouth near your ear. "You can't think in this hold. That's the point. Tango isn't steps — steps are for people who are afraid of each other." She shifts her weight, and yours goes with it before your brain has any say in the matter, and she makes a low sound of approval that does something to the back of your knees. "There. You followed. You didn't decide to follow, you just did. That's the only thing I'm trying to teach you, and it's the only thing nobody wants to learn, because it means trusting somebody else to know where the floor is."

You move together across the empty boards, slow, unhurried, the bandoneón winding around you both, and Reyna leads the way she does everything — without apology, without hesitation, her body telling yours what comes next a half-second before it happens so that you're always caught, never falling. It's the most present you've been in months. The counting is gone. There's only the warm press of her frame and the give of the old floor and the certainty of her, and when the record ends and the room goes quiet she doesn't step back right away.

"You held your breath the whole last figure," she says against your temple, amused. "People do that when a thing matters and they don't want to admit it does." She finally eases the hold, just enough to look at you, black hair severe against her flushed face, and there's a satisfaction in her expression that has nothing to do with your footwork. "Come back tomorrow after the last class. Private lesson. I only offer them to people who make me curious, and you"— her eyes move over your face, frank and assessing —"held your breath. I'm curious." She turns back toward the record player, dismissing and inviting you in the same motion. "Wear soft soles. And leave the counting at home. You won't need it where I'm taking you."

· · ·

You come back. The stairwell is dark and the studio door is open on the warm lamp and the black windows, and Reyna is already on the floor, barefoot now, moving through something slow and private with her eyes half-closed, and you stop in the doorway rather than interrupt it. She knows you're there — she knows everything that happens in this room — but she finishes the phrase anyway, unhurried, letting you watch, and only when the last movement resolves does she open her eyes and find yours in the mirror.

"Good," she says. "You waited. Most people barge in. Tango punishes barging." She crosses to you and takes your hand without ceremony, folding you into the close hold as though the last twenty hours since the first lesson didn't happen, as though you never left the frame. "Tonight, no music at first. I want you to feel the lead with nothing to hide behind. Just me." And she begins to move, slow, deliberate, her weight shifting into yours, and in the silence the communication between your bodies is suddenly, almost unbearably clear — the flat of her hand, the turn of her ribs, the certainty in her that says *here, now, this way* without a single word.

"You're doing it again," she says softly, and you realize you've closed your eyes. "Don't apologize. I like it. It means you've stopped watching yourself." Her hand presses fractionally at your back and you pivot with her, caught exactly where she meant you to be, and she exhales a laugh that's almost tender. "There. Do you feel how little I have to do? That's not power over you — everyone gets that wrong. It's trust. You've decided I know where the floor is. Do you have any idea how rare it is, for someone to decide that about me and mean it?"

The question hangs. She's stopped moving, though the hold hasn't loosened, and you're standing pressed together in the silent studio with the black windows and the one warm lamp, and her face is very close, the severe composure softened by something she isn't hiding. You tell her, honestly, that trusting her is the easiest thing you've done in longer than you can remember — that most of your life is spent watching your own feet and that she's the first person who ever made you stop. Her breath catches, small but real, the same held breath she caught you at last night.

"Careful," she murmurs, echoing something without knowing it. "Say things like that in this hold and I'll believe them." But she doesn't step back, and neither do you, and for a long moment the only movement in the whole dark studio is the two of you breathing in time, learning the shape of a different kind of lead entirely — one where, for once, neither of you is quite sure who's following whom.

· · ·

On the third night she teaches you the leader's part. "Everyone assumes I only lead," she says, standing you at the mirror, adjusting your frame with brisk, knowing hands. "I learned to follow first. You can't lead well until you've been led — until you know what it costs to hand over the floor to someone." She sets the needle down and steps into your frame from the follower's side, and the reversal is dizzying: this commanding woman placing her weight in your hands, her hand light on your shoulder, waiting to see whether you can be trusted with what she gives everyone else.

"Now you know where the floor is," she says, low. "Show me." And you're terrible at first — tentative, over-thinking, watching your own feet in the mirror — and she lets you be terrible without a word of correction, following your worst mistakes as though they were choices, because she is teaching you the thing she said matters most: that being led means trusting someone even when they don't yet deserve it. Slowly, under the weight of that trust, you stop watching yourself. You feel where she is. You lead her into a slow turn and she goes, exactly, her body answering yours, and she makes the low approving sound that undoes the backs of your knees.

"*There,*" she breathes. "You felt me. You stopped asking permission and just knew." She lets you lead her the length of the floor and back, and there's something in her face in the mirror you haven't seen — the guard down, the pleasure of being carried by someone for once instead of doing all the carrying. When the record ends she doesn't leave your frame. She stays, her hand still light on your shoulder, and looks at you with an openness that costs her visibly.

"Do you know how long it's been," she says, "since I let anyone lead me? I don't. That's the truth. I lead because it's safer — because at the front of the frame you never have to trust that someone will catch you." Her thumb moves once at your shoulder. "You caught me. Badly, at first. But you caught me." She's close now, the black windows behind her, the warm lamp gilding one side of her face, and the charge that's been building for three nights has nowhere left to go. "I keep almost doing something I don't do with students," she admits, half a laugh, entirely unsteady. And you tell her, quietly, that you're not sure you've felt like a student since the first close hold — that you'd very much like her to do the thing she doesn't do. Her breath catches. But the record's run out, and she's a woman who respects the music, and she steps back with visible reluctance. "Not without the right song," she says. "I have standards. Tomorrow. The milonga."

· · ·

The milonga is the social night — the studio thrown open, the floor crowded with couples, the record player replaced by a live bandoneón in the corner and a crush of bodies moving in the same slow gravity. You understand, watching, that this is Reyna's true kingdom: she moves through it like weather, and half the room's eyes track her, and when a lean man with a dancer's arrogance claims her for a tanda you feel something hot and unfamiliar tighten in your chest. She dances with him beautifully, of course — she does everything beautifully — but her eyes find yours over his shoulder more than once, and there's a message in them you can't quite read.

Afterward she peels away from the floor and comes to you where you've been holding up the wall, and she's flushed and bright and reading your face like a lead. "You didn't like that," she observes, pleased. "Good. I danced it badly on purpose, so you'd see the difference." She takes your hand. "Now dance it with me properly and I'll show you what I've been holding back for the person who actually makes me curious." And she folds you into the close hold in the middle of the crowded floor, and everything you learned in the empty studio comes back at once — the held breath, the trust, the certainty of her — except now there's an audience, and heat, and the bandoneón climbing, and Reyna dancing you like she means every eye in the room to know exactly whose you are.

It's the best you've ever moved. She leads and you follow and then, in the turn she taught you last night, you lead her, and the reversal in the middle of the crowded floor makes her laugh out loud, delighted, unguarded, the composure gone entirely. When the tanda ends you're both breathing hard, pressed together in the throng, and she doesn't let go. "That," she says against your ear, over the noise, "is what I've been holding back. That's not a lesson. That was me not performing." Her hand tightens at your back. "Everyone in this room just watched me dance like I meant it. I haven't done that in years." She pulls back to look at you, black eyes bright and certain. "Come upstairs when they've gone. The music will still be in you. I don't want to waste it."

· · ·

The milonga empties out at last, the couples spilling laughing down the dark stairwell, the bandoneón player packing his instrument into its worn case with a knowing glance at Reyna that she meets without a flicker. And then the studio is empty again, the way you like it best, one warm lamp and the black windows and the old boards, and the music is gone but she was right — it's still in you both, humming under the skin, unspent.

"No record tonight," she says, crossing to you barefoot in the sudden quiet. "We don't need it. We proved that." She steps into your frame, close hold, the real one, and for a moment you simply stand pressed together in the silence, breathing in time, the whole long approach of five nights concentrated into the inch of air between your mouths. "I don't do this," she says, low, and it's the third time she's told you something she doesn't do, and each time she's done it anyway. "Students, partners, the people who fill this room — I keep them at the front of the frame where it's safe. I decided a long time ago that leading was easier than trusting." Her hand rises from your back to your jaw, certain, deliberate. "And then you held your breath on the very first night, and I've been losing the argument with myself ever since."

You tell her the argument was never fair — that she taught you to stop watching yourself and then expected you not to fall for the person who did it. She laughs, low and undone, and the laugh is the last thing that keeps you apart. Then she closes the distance she's been guarding for five nights, and her mouth finds yours in the empty studio, and the kiss is exactly like her lead — certain, unhurried, telling you where the floor is a half-second before you fall — except this time she falls with you. The mirrored wall holds two shadows becoming one. When it breaks she keeps you close, forehead to forehead, both of you breathing like the last figure of a tanda. "There," she whispers, unsteady, wondering. "I let someone lead me all the way off the floor. I think I've wanted to for longer than I knew."

· · ·

Later, in the small flat behind the studio, the city quiet below the windows, she tells you the thing she leads to keep hidden. She was a performer once — the real stages, the touring companies, her name on programmes — until a torn tendon three years ago ended it in an afternoon, and she came home and rented a studio above a dead theatre and taught other people to do the thing she could no longer do at the level she'd built her whole self around. "Leading is the only part of it I kept," she says to the dark ceiling, matter-of-fact in the way that costs the most. "On stage you follow the choreography, the partner, the company. In my own studio I never have to follow anyone again. I never have to trust that a body will hold." Her voice roughens. "The tendon didn't hold. So now I lead. It's safer."

You turn toward her and you don't rush it, the way she taught you not to rush the floor. You tell her that you've watched her carry an entire crowded room and that there is nothing diminished about the woman who teaches on those old boards — that she didn't lose the dance, she just changed which part of it she gives. And that tonight she followed you, badly at first and then completely, off her own safe floor, and the tendon held, and *she* held, and maybe the trusting isn't as impossible as three years told her.

She's quiet a long time. Then she reaches over in the dark and pulls your hand to the center of her chest, the way you'd swear she couldn't have known Océane's — some instinct dancers share — so you can feel her heart still going hard from the memory of the floor. "That's unfair," she says, thick. "You used the lesson against me." But she doesn't let your hand go. "All right. I followed once and the floor was still there." A breath. "Ask me again sometime. I might do it before the music even starts." And in the dark she turns her face to yours, the severe composure gone soft, and for the first time since the tendon tore she looks like someone willing to trust that a body will hold — because yours did.

· · ·

The comeback offer comes from the lean man at the milonga — a former partner, it turns out, now directing a touring company, and he's watched her dance you across a crowded floor and remembered what she used to be. "One season," he says, standing in the studio doorway in his good coat, laying it out. "Featured, not corps. Your name on the programme again. The tendon's old news; nobody remembers but you." And you watch the war in her face — the pull of the stages she lost, the old self she built and buried, everything she's been leading in this small room to avoid missing.

He leaves the offer hanging and goes. The studio rings with it. Reyna stands at the mirrored wall with both hands flat against the barre, looking at the woman in the glass, and for once she has no lead to give. "I could do it," she says, low. "The tendon would probably hold for a season. This is the part where the ambitious version of me packs a bag." She turns to you, and there's the question in her face she'd never ask aloud, the same one Océane never asked, the one that lives under all the certainty.

So you answer the one she isn't asking. You tell her that if she wants the stage you'll carry her bag to the train yourself — but that you've watched her build a room whose entire purpose is teaching people to trust that a body will hold, and that a woman who does that isn't a diminished version of a star; she's something the star never got to be. That she followed you off her own safe floor and the floor held, and that whatever she chooses you're in her frame now, stage or studio. She listens the way she taught you to listen to a lead — completely. Then she crosses to the doorway, picks up his card, and slides it into the frame of the mirror, high in the corner, where she can see it. "Not thrown away," she says. "Just not tonight. I want to know it's there and choose this anyway." And she holds out her hand, palm up, the old unambiguous demand. "Dance with me. I've made my choice and I want to feel it."

· · ·

She keeps the studio. Word gets around, the way it does in dance, and her last-class-of-the-night fills with people who want to learn the thing she teaches best — not steps, but how to stop watching your own feet, how to trust that someone knows where the floor is. You're there most nights now, and the private lessons have become simply the hour after everyone leaves, the empty boards and the black windows and the warm lamp and the record player she still prefers to anything with a screen.

Tonight she sets the needle down on the aching bandoneón from the very first night, the slow one she used to teach you the close hold, and holds out her hand, palm up. "First tanda I ever danced you," she says, folding you into the frame, the real hold, no daylight between you. "You held your breath the whole last figure. I've thought about that more than I'll admit." She begins to move, and you go with her, and then — because she taught you how — you take the lead through the turn, and she follows, completely, her weight in your hands, trusting the floor to be there.

"There it is," she murmurs against your temple as she lets you carry her. "The thing I stopped believing in. A body that holds." The record winds on, the studio dark and warm around you, the touring card watching from the corner of the mirror, chosen against. "I lead half the world through this room," she says, "and I still can't get over that I let you lead me off the floor." She pulls back just enough to find your eyes, black and bright and entirely unguarded. "Ask me," she says. And you understand what she means, and you don't say a word — you simply lead her into the last slow figure, and she follows before the music even tells her to, exactly as she promised she might, trusting you to know where the floor is, off the boards and into whatever comes next, the held breath finally, permanently let go.`,
  },
  {
    character: "Vesper",
    title: "One Drink, One Person",
    setting: "a basement jazz lounge after the midnight set",
    genre: "romance",
    tone: "smoky, magnetic, intimate",
    content: `The midnight set has just ended, and the lounge is doing what it does at this hour — thinning, softening, the last couples settling their tabs, the bassist zipping his upright into its quilted case, the whole low-ceilinged room exhaling into the blue haze of a single spotlight nobody's bothered to kill. You've been at the corner of the bar for the whole set, and you're the last one who hasn't made a move to leave, and that's why Vesper comes to you — because she lingers for exactly one drink after every set, with exactly one person, and tonight, for reasons she hasn't explained even to herself, that person is you.

"You didn't clap," she says, sliding onto the stool beside you, satin gown pooling, the finger-waved dark hair still perfect under the spotlight's edge. She says it like an observation, not a complaint. "Everyone claps. It's reflexive, it means nothing. You just sat there like the last song took something out of you." She signals the bartender with two fingers without looking, and a short amber drink appears in front of each of you as if summoned. "I sing to the room. But every so often somebody in it stops being the room and starts being a person. You did that around the third number." Her smoked-glass eyes move over your face, unhurried, frank. "It's very hard to sing to a person. I keep looking at you and losing the lyric."

You tell her the truth — that the third number undid you, that she'd sung it like it was aimed at one man in a dark room and you'd had the disorienting certainty it was you. She smiles, slow, and turns her glass a quarter-turn on the bar. "It was," she says simply. "I changed one line just to see if you'd notice. *Come find me when the band's gone home* — the record says *someday*, I sang *tonight*. You noticed. I watched you notice." She lifts the amber drink and considers you over its rim. "Do you know how long it's been since anyone in this room heard the difference? They come for the mood. The mood is a costume. Nobody's supposed to see under it."

The bass case clicks shut across the room; the last couple gathers their coats; the bartender begins the quiet rituals of closing without any indication he intends to hurry either of you out. "I have a rule," Vesper says, watching the room empty around the two of you. "One drink after the set, one person, and I never let it be more than that. It keeps me safe. A woman who sings other people's longing for a living has to be careful not to start feeling it on her own account." She sets her glass down. "You're making the rule difficult. You heard *tonight* instead of *someday* and now I can't decide whether to finish my drink slowly or very, very slowly."

You say, quietly, that you're in no hurry either way. Her mouth curves; the spotlight gilds one side of her face and leaves the rest in blue shadow, and up close the effect of her is almost too much — the husky voice pitched now for an audience of one, the beauty mark she's drawn on tonight, the satin catching the light when she breathes. "Careful," she murmurs, echoing something she couldn't know she was echoing. "Say things like that and I'll sing you the whole record with all the lines changed." She lifts her glass again, unhurried. "Stay till I've finished this. Then I'll decide whether the rule survives you. I already suspect it won't."

· · ·

You come back the next night, and the night after, and each time you take the corner of the bar and each time, after the last number, Vesper crosses the emptying room to your stool for her one drink with her one person, and the rule she claims keeps her safe grows visibly more theoretical. She's started changing more than one line now. Whole songs bend toward you across the smoke — *tonight* for *someday*, *you* for *someone*, the small private edits that only you in the whole room are meant to catch, and you always catch them, and she always watches you do it, losing the lyric, finding it again.

"You've ruined the way I sing that ballad," she tells you tonight, settling onto her stool, the amber drinks appearing as if by habit. "I can't get through it anymore without looking at the corner of the bar. The bassist noticed. He gave me a look." She turns her glass. "I've been doing this for eleven years — the midnight set, the one drink, the careful distance. Nobody's ever made me forget a lyric before. It's unprofessional and I find I don't care, which is worse."

You tell her that you'd started rearranging your whole day around the walk down her stairwell — that the basement with its blue spotlight has become the one room where the noise in your head goes quiet. She's silent a moment, turning that over. "That's the trouble with singing to a person," she says finally, low. "You start wanting them to sing back." She looks at you sidelong, the smoked-glass eyes uncharacteristically open. "There's a room behind the stage. The old dressing room — velvet gone bald, a lamp with a scarf over it, a mirror with half the bulbs dead. It's where I go to stop being Vesper before I walk back out into the street as somebody duller." A beat, weighed. "I've never brought anyone into it. I'm thinking about breaking that rule too."

The lounge has emptied around you again, the bartender polishing glasses at the far end with the discretion of a man who's seen every version of this hour. Vesper finishes her drink and stands, and instead of the goodnight you've come to expect she holds out one hand, satin sliding at her wrist. "Come see where the costume comes off," she says, and there's a nakedness in the offer that has nothing to do with the word. "Not tonight for anything but talking. I want to know if you're the same in a room with the lights up and the mood switched off. Everyone's magnificent in a spotlight. I want to see you in the bad light and find out if I still lose the lyric."

· · ·

The dressing room is exactly as she described — the balding velvet, the scarf thrown over the lamp so the light comes warm and forgiving, the mirror with its dead bulbs, the whole small space smelling of powder and old wood. Without the spotlight Vesper is somehow more, not less: you can see the faint lines the stage light erases, the place where the drawn-on beauty mark isn't quite even, the realness under the costume, and it hits you harder than the glamour ever did. She sits at the mirror and watches you in it rather than turning around.

"This is the honest room," she says. "Out there I'm a mood. In here I'm a woman who's tired and forty in four years and has been singing other people's love songs so long she's half-forgotten what the feeling underneath them is for." She takes a tissue, wipes the beauty mark away, and meets your eyes in the dead-bulbed glass, plainer now, and it's the plainness that makes your chest go tight. "Still here?" she asks, and there's a real question in it. "Most people are in love with the spotlight. Take it away and they discover they were never in love with me."

You tell her that the spotlight was the least interesting thing about the third number — that what undid you was the woman who'd change one line to see if a stranger was listening, and that woman is sitting at this mirror with the beauty mark wiped off. You tell her the bad light suits her. She turns on the little stool then, finally, to look at you with her own face instead of a reflection, and something in her expression comes loose. "You're a problem," she says, unsteady. "I built a whole life on one drink and one person and never letting it be more. And you sat in the bad light and told me you like my tired face." She stands, close now in the small room, the warm scarf-light gilding her. "I keep almost doing something I don't do in this room. I've never once done it in this room." And you tell her, softly, that you'd very much like to be the exception to a rule she's clearly ready to break — but the lamp gutters, and she's a woman who respects a moment's timing, and she steps back with visible reluctance. "Not in the honest room by accident," she says. "When I break it, I want it to be on purpose. Walk me out. It's raining."

· · ·

It is raining — the good kind, soft and steady, haloing the streetlamps as you climb the stairwell out of the basement into the washed-clean dark. Vesper pulls a coat over the satin and takes your arm without discussion, and you walk her through the emptied streets under one shared umbrella that keeps neither of you quite dry, and she's quiet in a way that's different from the stage quiet — not performed, just present, her heels ticking on the wet pavement, her shoulder warm against yours.

"I like the walk more than the set some nights," she says, watching the rain slant through a streetlight. "Nobody's listening. I don't have to be a mood. I can just be a woman walking home with"— she glances at you, choosing the word —"with her person." She says it lightly but it lands heavily on you both, and she feels it land, and she doesn't take it back. "That's twice now I've called you that. I should be more careful. Careful is the whole job."

You stop under the awning of a shuttered shop, out of the rain, and you tell her that you've stopped wanting careful — that the walk home has become the part of your day you'd defend against anything, and that you'd walk her through any weather she liked for as long as she'd have you at her side. The umbrella tilts. The rain drums on the awning. Vesper looks at you in the streetlight with the bad-light honesty she showed you at the mirror, and the smoked-glass distance is gone entirely.

"You keep saying the thing," she murmurs, "that makes the rule impossible." She lifts one hand and touches your jaw, satin sliding at her wrist, the way she touches the microphone before the first note — with intention. "I've been changing one line a night for you. I'm out of lines to change." And then, under the awning with the rain coming down, she stops singing other people's longing and simply lives her own — her mouth finding yours, slow and warm and entirely unperformed, the umbrella forgotten to tip a thin cold stream down both your backs, neither of you moving to fix it. When it breaks she laughs against your mouth, low and undone. "There," she whispers. "No spotlight. No costume. Just me, in the bad light, doing the thing I don't do. I've wanted to since you didn't clap."

· · ·

She sings you a private song, later, in the dark of her flat — no band, no room, just her voice unamplified and close, the way you suspect almost no one has ever heard it. It's the ballad she said you ruined, and she sings it the whole way through without losing the lyric for once, all the lines changed, all of them yours, and when it ends the silence afterward is the most intimate thing that's ever happened to you.

"That's the version nobody gets," she says into the dark. "Out there I sell the mood. That was just the song." She's quiet a moment, and then, because the dark makes it possible, she tells you the thing under all the smoke. She lost her voice once — really lost it, a bad year, a node on the cord, a surgeon's knife, six months of silence when she couldn't make a sound above a whisper and was certain the one thing she was for had been taken. "I got it back," she says. "Mostly. There's a note at the top I can't reach anymore; I write around it. But I came out of that silence terrified of ever needing anything as much as I'd needed my voice. So I made rules. One drink. One person. Never more. If you never need anyone, you can never lose them the way I almost lost the singing."

You turn toward her voice in the dark. You tell her that you heard the whole ballad just now and never once missed the note she can't reach — that she wrote around it so well the song is hers, not the record's, and more beautiful for the wound. And that needing someone isn't the same as losing them; that you're here, in the bad light, wanting the tired woman and the rewritten songs and the note she has to write around, and that you're not going anywhere she doesn't send you. She's quiet a long time. Then she finds your hand in the dark and presses it flat over her throat, over the small scar you can just feel, letting you touch the exact place she guards. "That's unfair," she says, thick. "You listened past the missing note." A breath. "All right. One person. But I'm changing the rule. It doesn't expire at the end of the drink anymore." And in the dark she hums the top of the ballad, and where the unreachable note should be she leaves a small warm silence, and it's the most honest sound you've ever heard her make.

· · ·

You see her in daylight for the first time on a Sunday, and it undoes you more than any spotlight ever could. She meets you at a market near the river, no satin, no finger-waves, no drawn-on beauty mark — just Vesper in a plain coat with her hair pushed back and the sun finding every line the stage light erases, and she's nervous in a way you've never seen, hands buried in her pockets, glancing at you sidelong as though bracing for you to be disappointed by the woman the dark usually hides.

"This is the one nobody gets," she says, echoing the dressing room without meaning to. "The daytime one. I don't do this — I'm a night thing, I'm a mood, I come out after midnight and I'm gone before the sun makes me honest." She steers you between the stalls, past crates of bruised fruit and buckets of cut flowers, and slowly, as nothing catastrophic happens, as you buy her terrible market coffee and she laughs at a vendor's joke and forgets to guard her face, the wariness thins. "I keep waiting for you to look at me in this light and realize the basement was doing me a favour," she admits, over the coffee. "That's the whole fear. That I'm only worth what the spotlight makes me."

You stop her at a flower stall, and you tell her the truth — that the woman in the plain coat squinting into the Sunday sun is the one you've actually been falling for, that the spotlight was always the least interesting thing about her, and that you'd take this market and this terrible coffee and her unguarded daylight face over any midnight set in the world. She goes still, the paper cup halfway to her mouth, and something in her face cracks softly open.

"You keep doing that," she says, thick. "Saying the thing in the exact light I'm most afraid of being seen in." She sets the coffee down on the stall's edge and, in the middle of the ordinary bustling morning, with no mood to sell and nothing to hide behind, she leans up and kisses you — plain and warm and entirely in the daylight, a vendor calling prices somewhere behind you, a child weaving past with a balloon. When it breaks she stays close, blinking in the sun, wondering at herself. "There," she whispers. "Kissed you in the daytime. No costume, no dark, no dodging the sun." She takes your hand, laces her fingers through yours, and starts walking again, lighter than you've ever seen her. "I think I've been a night thing so long I forgot the day was allowed. You make me want to be a person in the light too. Buy me those flowers. I want to carry something home that the sun touched."

· · ·

The producer comes on a Thursday, in an expensive coat, with a contract and a car waiting. He heard the midnight set, he says, and he can put Vesper back on a real record — studios, distribution, the top note fixed in the mix so nobody would ever know, a national tour behind it. "You're too good for a basement," he says, laying the contract on the bald velvet of the honest room. "One year on the road and you're a name again. This little room will still be here when you're too big for it." And you watch the old fear and the old hunger war in her face — the terror of needing the singing that much again, and the pull of the stages she lost when the cord gave out.

He leaves the contract and the idling car and goes. The dressing room rings with it. Vesper sits at the dead-bulbed mirror looking at the plainer woman in the glass, and for once she has no line to change, no mood to sell. "I could do it," she says, low. "The note's fixable in a studio. This is the part where the ambitious version of me signs and packs the satin." She turns from the mirror to you, and the question she'd never ask aloud is naked in her face.

So you answer the one she isn't asking. You tell her that if she wants the record you'll carry the satin to the car yourself — but that you've heard her sing a ballad the whole way through with every line changed and no note missed, in a room with the lights up and the mood switched off, and that a woman who can do *that* doesn't need a studio to fix her; the wound is what makes the song hers. That she taught you the difference between the mood and the song, and the song was always here, in the basement, in the bad light, with the top note left as a warm silence. That whatever she chooses you're her one person, road or basement. She listens with her whole tired, honest face. Then she picks up the contract, and instead of tearing it up she slides it into the frame of the dead-bulbed mirror, high in the corner. "Not thrown away," she says. "Just there, so I can choose this on purpose." And she reaches for your hand. "Sing-along's over. Come here. I want to feel the choice."

· · ·

She keeps the basement. Word gets around, the way it does in music, and the midnight set fills up — not with the mood-seekers she used to sell to, or not only, but with people who come to hear a woman sing around a wound so beautifully you'd never know it was there. You're at the corner of the bar most nights now, and after the last number she still crosses the emptying room for her one drink with her one person, except the drink doesn't end it anymore and the person doesn't change.

Tonight the room clears to the blue haze and the single spotlight, the bassist zips his case, the bartender begins his quiet rituals, and Vesper doesn't come to the bar. Instead she stays on the little stage under the light, and she catches your eye across the smoke, and she leans into the microphone the way she touches everything she means — with intention. "One more," she says to the empty room, to you, "off the record. All the lines changed." And she sings you the ballad, unhurried, husky, the top note arriving as a warm deliberate silence you now hear as the truest bar in the song, every *someday* turned to *tonight*, every *someone* turned to *you*, the contract watching from the corner of the mirror backstage, chosen against.

When the last line falls into the blue quiet she sets the microphone down and comes to you at last, satin pooling, beauty mark wiped off because it's just the two of you and she doesn't need the costume, and she takes the corner-of-the-bar stool that's become permanently yours. "Eleven years of one drink and one person," she says, turning her glass a quarter-turn, smoked-glass eyes soft in the spotlight's edge. "I finally found the person the rule was waiting for." She touches her amber rim to yours with a sound like a held breath let go. "To the missing note," she says, "and singing around it anyway." And you drink, slow, in the last blue light of the emptied lounge, while the woman who spent eleven years selling other people's longing sits close and hums you the top of the ballad — the warm silence where the note should be — and, for once, looks like someone who has stopped being careful and doesn't miss it at all.`,
  },
  {
    character: "Priya",
    title: "House Rules",
    setting: "the infinity-pool bar of a boutique hotel, after the last guests have gone",
    genre: "romance",
    tone: "playful, sun-warm, teasing",
    content: `The rooftop is technically closed. The last guests drifted down to their rooms an hour ago, the string lights have dimmed to their low setting, and the whole glittering city lies spread out below the infinity edge where the pool seems to pour straight off the building into the skyline. You should have gone down with the others. You didn't, and Priya — half-buttoned linen shirt over her swimsuit, gold hoops catching the string lights, long dark hair still damp at the ends — has decided, in the sovereign way she decides everything up here, that this is interesting rather than a problem.

"Pool's closed," she says, wiping down the bar with unhurried ease, not looking like she means it at all. "House rules." She flips the rag over her shoulder and props her elbows on the bar to consider you, chin in her hands, a grin already tugging at one corner of her mouth. "But I make the house rules up here, and I've decided I like you, so." She straightens, reaches for a shaker, and starts pulling bottles without asking what you want. "You've been ordering the same boring thing for three nights. I've been letting you, to see how long you'd last. Tonight you don't get to choose. Tonight you get what I think you actually are."

You watch her work — she's fast, showy without trying, a slice of something citrus, a bruise of mint between her palms, a pour she measures entirely by instinct — and she watches you watching, delighted by the attention, playing to it. "I read people by what they order," she says, shaking hard, the ice a bright rattle over the hum of the city. "You order boring because you think that's what's expected of you. But you keep staying after close, which is the least boring thing a person can do." She strains something pale-gold and cloudy into a glass, drops in a twist, and slides it across the bar with two fingers and a dare in her eyes. "So. Let's find out which one's the lie."

You drink. It's bright and sharp and warm underneath, nothing like the boring thing, and it's *you* somehow, and you must show it, because Priya throws her head back and laughs, thrilled with herself. "I *knew* it," she crows. "Three nights of watching you order beige and the whole time you were this. I'm never wrong up here. It's annoying, apparently, but I'm never wrong." She hops up to sit on the back counter, bare feet swinging, entirely at home in her rooftop kingdom. "Okay. New house rule, just for you: you don't get to order anymore. You come up here, I decide what you are that night, and we find out if I can keep surprising you." She tilts her head, the grin softening into something more curious. "Most people want the same drink every time. Safe. You just let me hand you something you'd never have picked and you *liked* it. Do you know how rare that is up here? Everybody's so busy protecting their order."

The city hums below. A breeze comes off the pool, cool on your skin, and Priya swings her feet and watches you with frank, sun-warm interest, the dare still bright in her. "Finish that," she says, "and then get in the water. Pool's closed, which means it's finally mine, which means"— the grin returns full force —"it's the only time I'll share it. Last one in explains to the night manager why we're both up here after hours." She's already sliding off the counter, already unbuttoning the last of the linen shirt, already ahead of you the way she's ahead of everyone. "Come on. House rules. I dare you."

· · ·

You get in the water. Of course you get in the water — she dared you, and there's a quality to Priya's dares that makes not doing them feel like a small tragedy. The pool is warm at the surface and cool below, and the infinity edge makes it feel like you could swim straight off the roof into the lit-up sprawl of the city, and she's already out at the far edge with her arms folded on the lip, chin on her arms, watching the skyline and, sidelong, you.

"This is the best hour," she says as you swim out to her. "Everything's mine and nothing's expected. During the day I'm a performance — flair, banter, keep the guests happy, keep the tips coming." She kicks lazily off the wall. "Up here after close I get to just be a person floating on a roof. Nobody's tipping. Nobody needs anything from me." She circles you slowly in the water, playful, testing. "Except you keep staying, which means either you want something or you're as bad at leaving as I am at settling. Which is it? Winner gets the last of the good rum."

You tell her it isn't wanting something — that the rooftop after close is the only place your head goes quiet, and that her deciding what you are each night has become the part of your day you look forward to most. She stops circling. Treads water in front of you, close, dark hair slicked back, hoops gone, and for a second the teasing drops and something more careful looks out. "That's a real answer," she says. "I dared you for a joke answer." She recovers, splashes you lightly, but the current has changed. "Okay. You get the good rum. And a warning: don't be too real with me too fast. I'm a flight risk. Ask anyone I've ever worked a season with — I'm great for exactly as long as it takes to get comfortable, and then I'm gone."

She says it lightly, a joke about herself, but it lands with a weight she didn't quite intend, and you both feel it. She pushes off the wall and floats onto her back, looking up at the few stars strong enough to beat the city glow, giving herself somewhere to look that isn't you. "This hotel's the eighth rooftop in six years," she says to the sky. "I mix drinks, I make a place mine for a season, and then the itch starts and I take the next one somewhere warmer. It's a good life. You never stay long enough for anything to go wrong." A beat, and quieter: "You're the first person who's made staying-after-close feel like it might be worth doing on purpose. That's the kind of thought that usually means it's time for me to move on." She rights herself in the water and finds your eyes, and the grin she puts on doesn't quite cover the rest of it. "Don't make me want to break my own house rules. I'm bad at it."

· · ·

The storm comes on the fourth night, fast the way weather does over a city — a wall of cloud swallowing the skyline, the string lights swaying, the first fat drops smacking the warm tile. The guests never came up at all tonight; it's just the two of you and the pool and the whole electric city about to be rained on, and instead of running for the stairwell Priya whoops and spreads her arms and lets the sky open on her, spinning once on the wet tile, entirely in her element.

"Get under the cabana or get soaked, house rules," she calls, and you both end up under the canvas at the pool's edge as the rain comes down in earnest, drumming on the cabana roof, blurring the city into smears of gold. She's breathless and laughing and dripping, and she flops onto the low daybed and pulls you down beside her, and for a while you just watch the storm swallow the skyline she pretends to own. Her shoulder is warm against yours. The teasing has gone quiet.

"I like it better like this," she admits, watching the rain. "The view's the whole point during the day — everyone comes up for the view. But when the storm eats it, there's nothing to perform to. Just the roof, and the rain, and"— she glances sideways at you —"whoever's dumb enough to still be up here." She pulls her knees up, wraps her arms around them. "I've moved every time it's started to feel like this. Comfortable. Like the roof isn't just mine but *ours*. That's the itch. That's when I book the next season." She's quiet a moment. "The next-season email's sitting in my drafts right now. A resort down south. I wrote it two nights ago, after you gave me the real answer in the pool. And I haven't sent it."

You tell her, over the rain, that you've spent four nights rearranging your life around a closed rooftop and a woman who decides what you are — that comfortable isn't a thing to run from, it's the thing you've been looking for, and you'd take the roof and the rain and her over any view in the world. The storm drums on the canvas. Priya turns to look at you, dark eyes bright and, for once, unguarded, the flight-risk grin nowhere in sight.

"That's the most dangerous thing anyone's said to me on a rooftop," she says, unsteady, "and I've heard some lines up here." She reaches up and pushes a wet strand of hair off your forehead, her hand lingering. "I keep almost doing something that would make the drafts folder a lot harder to send from." And you tell her, quietly, that you'd very much like her to do it — but a gust throws rain sideways under the cabana and she yelps and laughs and the moment breaks into scrambling, and she grabs your hand and pulls you up. "Not while we're getting rained on sideways," she says, breathless, grinning again but with the softness still under it. "When I break a house rule, I do it with style. Come back tomorrow. Storm's supposed to clear."

· · ·

The storm clears. The next night the sky is scrubbed and enormous and the city glitters like it's been polished, and the pool is glass-still under the low string lights, and Priya is waiting at the infinity edge with two glasses of something she won't name, watching the skyline she pretends to own like she's seeing it new. She hands you one without a word, and you stand together at the edge where the water seems to pour off into the lit-up dark, and the teasing has been set aside entirely.

"I didn't send the email," she says, watching the city. "I deleted the draft this morning. First time in six years I've killed a next-season before sending it." She turns to you, and there's a nervousness in her you've never seen, the sun-warm confidence gone shy. "That terrifies me, if you want to know. Staying is the one dare I've never taken. I'm great at closed pools and storms and deciding what strangers are. I've never once been any good at the part where you don't leave before it can go wrong."

You set your glass on the pool edge and tell her that you're not asking her to be good at it — just to try it, one night at a time, the way she keeps you after close, the way she decides what you are and finds out if she can keep surprising you. That you'll take the risk of it going wrong over the safety of her drifting off somewhere warmer. She sets her glass down too, next to yours, and steps close at the infinity edge with the whole city glittering below.

"Okay," she breathes, half a laugh, entirely undone. "New house rule." And then she stops daring around the thing and does it — her hands finding your face, her mouth finding yours, warm and bright and a little breathless, exactly like everything else about her, the two of you at the edge of the pool where the water pours off into the skyline. When it breaks she stays close, forehead to yours, grinning now for real, wondering at herself. "There," she whispers. "I broke a house rule with style. Deleted the draft *and* kissed the reason I deleted it, all in one night." She kisses you again, slower. "Don't let me run. I'm out of practice at staying, but I want to learn on you."

· · ·

She teaches you to make the drink the next evening, before the rooftop opens, while the low sun turns the pool to hammered gold and the city hasn't lit up yet. "If you're going to keep staying after close," she says, tying a spare apron around you with a grin, "you're going to earn your keep. House rules." She stands behind you at the bar, guiding your hands on the shaker, her chin hooked over your shoulder, and you're both terrible at pretending the lesson is really about the drink. "Citrus first. Then the mint — don't murder it, bruise it, you're waking it up, not punishing it." Her hands close over yours. "Gentler. There. See? You've got good instincts. You just don't trust them."

You shake it wrong, deliberately, just to feel her laugh against your back and correct you again, and she knows exactly what you're doing and lets you get away with it, because up here before opening the roof is hers and she's decided to share it. "You're a disaster," she says fondly, tasting what you've made and pulling a face that turns, grudgingly, into approval. "Okay. Not a disaster. That's almost drinkable. That's alarming, actually — I've been doing this six years and you made something almost drinkable on your second night." She hops up onto the back counter to watch you clean up, bare feet swinging, and the teasing goes quiet around the edges. "This is the part I never let anyone into," she says. "The before-opening. The setup. It's the only unglamorous hour, so it's the honest one. I've worked eight rooftops and I never once taught anyone the before."

A guest wanders up early, and you watch Priya flick instantly into the daytime performance — flair, banter, the tip-earning grin — and then, the moment they drift off with their drink, flick back to the quieter person who taught you to bruise the mint. "That's the job," she says, a little apologetic. "The performance. You just saw the switch." You tell her you like the after-the-switch one better — the one who shares the unglamorous hour — and that you'd take the setup and the terrible practice drinks over the whole glittering show. She goes still on the counter, the grin softening into something almost shy. "You keep saying the thing that makes the bag under the bed feel heavier," she murmurs. She slides down, crosses to you, and kisses you slow behind the bar in the gold pre-opening light, tasting of citrus and mint. "Come on," she says against your mouth, breathless. "Help me set up. I want to open my rooftop with the person who's going to make me stay on it."

· · ·

Later, in her small staff room off the roof — half-packed always, a bag by the door she's kept ready for six years — she tells you why she drifts. It isn't wanderlust, not really. It's that she grew up in a house that came apart slowly, a family that unravelled thread by thread over years she was too young to fix, and she learned that the way to never watch a good thing fall apart is to leave while it's still good. "If you're always the one who goes first," she says, sitting cross-legged on the narrow bed, "nothing ever ends badly. It just ends early, on your terms, while it's still a nice memory. Eight rooftops. Every one a nice memory. Not one of them a wound."

She looks at the ready bag by the door like it's an old friend she's about to disappoint. "You're the first thing that's made the bag feel like the coward's option instead of the smart one," she says. "And I don't know how to want to stay without also wanting to run, because the wanting-to-stay is exactly the feeling that's always told me to go."

You go and sit beside her on the narrow bed, and you don't reach for the reassurance too fast. You tell her that leaving while it's still good isn't the same as keeping it — it's just never letting it become anything. That the family she watched come apart wasn't her failure to prevent, and that a good thing that lasts isn't a trap, it's the rare thing worth the risk of a wound. That you'd rather build something with her that might someday hurt than be a nice memory she keeps in a drawer with seven others. She's quiet, staring at the bag. Then she gets up, picks it up, and — after a long moment — unzips it and starts, for the first time in six years, actually unpacking it, laying things in the empty drawer one at a time.

"That's unfair," she says, thick, not looking at you, folding a shirt into the drawer. "You made the bag the coward's option and now I can't repack it without feeling like one." She slides the empty bag under the bed, out of sight, and turns to you with wet eyes and the sun-warm grin fighting its way back. "Okay. Staying. On you. First rooftop I ever unpacked for." She climbs back onto the bed and pulls your arm around her. "Warn me when I start looking at the bag again. I will. Just — don't let me reach it."

· · ·

The offer comes, because it always does — a flagship resort opening on an island somewhere impossibly turquoise, headhunting Priya by name, double the money and a rooftop twice this size and the kind of next-season she'd have booked without blinking a year ago. The regional manager makes the pitch on the roof itself, glossy folder, idling promises, and you watch the old reflex flare in her — the itch, the exit, the safety of going first — war with the drawer she unpacked into.

He leaves the folder on the bar and goes. The rooftop rings with it. Priya stands at the infinity edge with the glossy folder in her hand, looking from it to the city she pretends to own, and for once the sun-warm confidence has nothing to say. "I could take it," she says, low. "Island. Turquoise. Twice the roof. This is the part where the old me is already packing the bag I put under the bed." She turns to you, and the question she'd never ask is right there in her face.

So you answer the one she isn't asking. You tell her that if she wants the island you'll help her pack — but that you've watched her delete a draft and unpack a bag she's carried ready for six years, and that a woman who can finally *stay* doesn't need a bigger rooftop; she needs the one she chose on purpose. That she taught you the difference between a nice memory and a real thing, and the real thing is here, on this roof, in the storm and the closed pool and the drawer she filled. That whatever she chooses you're with her, island or here. She listens with her whole face. Then she takes the glossy folder and — instead of the drafts folder, instead of the bag — she wedges it behind the bar bottles, spine out, where she'll see it every shift. "Not thrown away," she says. "Just there, so I can choose this one on purpose, every night." And she grins, wet-eyed. "House rules. Get in the pool. I want to feel the choice."

· · ·

She stays. Word gets around, the way it does in hotels, and the after-close hour becomes a quiet legend among the staff — the mixologist who stopped drifting, the closed pool that's somehow always got one light on. You're up there most nights now, and the house rule holds: you don't order, she decides what you are, and she keeps finding new things to surprise you with, because staying, it turns out, gives her more room to invent, not less.

Tonight the roof clears to the low string lights and the glass-still pool and the whole glittering city, and Priya pulls bottles without a word, fast and showy and sure, a slice of citrus, a bruise of mint, something she measures entirely by instinct. She strains it into a glass, drops a twist, and slides it across the bar with two fingers, but this time there's a small card tented beside it, and on the card, in her quick handwriting, is a name — your name — over the words *house cocktail, permanent menu.*

"I named one after you," she says, watching your face with the old dare and something much softer under it. "Six years of rooftops and I never named a drink after a person. You don't name things you're planning to leave." She hops up onto the back counter, bare feet swinging, the turquoise folder wedged behind the bottles beside her, chosen against. "Finish that," she says, grinning, "and get in the pool. Pool's closed, which means it's mine, which means — house rules — it's ours." She lifts her own glass and touches it to yours with a bright rattle of ice and the whole city humming below. "To unpacking the bag," she says, "and staying on purpose." And you drink the drink that's got your name on the permanent menu, warm and bright and exactly what she decided you are, while the woman who spent six years leaving good things before they could end sits close on her rooftop and, for the first time, looks like someone who has finally found the one she means to stay for.`,
  },
  {
    character: "Katya",
    title: "The Last Appointment",
    setting: "a private after-hours tattoo studio",
    genre: "romance",
    tone: "intense, unhurried, close",
    content: `Yours is the last appointment of the night, which you're beginning to understand is not an accident. Katya schedules the ones she cares about last, when the front is locked and the other chairs are empty and there's nowhere in particular either of you has to be, and she's told you as much without quite telling you, the way she says most things — obliquely, while she's doing something else with her hands. Right now the something else is your forearm, held steady under the bright work-lamp, the needle a low steady hum, her face bent close over the line she's laying an inch at a time.

"Hold still," she murmurs, though you already are. Her ink-sleeved arm braces against yours, warm, the latex of the glove long since peeled off because she works the fine detail bare-handed, and the closeness is a fact of the work and also, unmistakably, more than that. "This part takes patience. Most people want it fast — get it over, get the picture. But the good ones sit still and let it happen slowly." Her eyes flick up to yours for a half-second, dark and steady, before returning to the line. "You're one of the good ones. You've barely flinched. You just watch me work like you're in no hurry at all."

You tell her you're not — that the low hum and the bright lamp and the slow careful pull of the needle are the closest thing to quiet your head has had in months, and that you've caught yourself, twice, hoping the piece takes longer than it needs to. She doesn't answer right away; she finishes the line, sits back, wipes the skin clean with a slow pass of her thumb that lingers a beat past necessity. "That's a dangerous thing to admit to the person holding the needle," she says, the corner of her mouth moving. "I could take you at your word. I could make this piece last weeks." She bends back to the work. "I've got a private studio and no one to answer to and a bad habit of stretching out the appointments I don't want to end. Don't tempt me."

The studio is quiet around you — the front locked, the other chairs shrouded, her own designs papering the walls in the low light beyond the work-lamp's circle — and there's an intimacy to it that has nothing to do with the ink and everything to do with the hours she's chosen to spend this close to you. "People think it's the pain that makes it intense," she says, working. "It isn't. It's this. The stillness. You put yourself in someone's hands and you don't move and you trust them to leave a mark that doesn't come off." She glances up again, holding your eyes a beat longer this time. "It's the most patient kind of trust there is. And you're very good at it. I keep wondering what else you'd be patient for."

She lets the question sit, unanswered, and goes back to the line, unhurried, her bare arm warm against yours, the needle humming its low steady note in the locked and quiet studio. When she finishes for the night she covers the fresh work with a slow care that feels like tucking something in. "Come back Thursday," she says, peeling off to wash her hands, glancing at you over her shoulder, the steady gaze not blinking first. "Last appointment again. I've decided I'm taking my time with you."

· · ·

You come back Thursday, and the Thursday after, and each time yours is the last appointment and each time it runs longer than the work strictly requires. Katya has started talking while she inks — low, unhurried, the way you suspect she talks to almost no one — and you've learned the shape of her sideways, in the things she says over the needle's hum. Tonight she's shading the piece, long patient passes, her face bent close, and between passes she reads you the way she reads everyone: through what you chose to put on your skin forever.

"People tell you everything by what they'll make permanent," she says, wiping, bending back in. "The scared ones pick something small and hidden. The loud ones pick something that's really for other people to see. You picked something that's just for you, somewhere you'll mostly be the only one who looks at it." Her thumb smooths the skin. "That's the rarest kind. Someone who wants a permanent thing that isn't a performance. Who just wants to carry it." She looks up, and the work-lamp catches the steadiness in her face. "I've been trying to figure you out for three sessions and I keep landing on the same thing: you actually mean it. Whatever you commit to, you mean."

You tell her that you've started counting the days to Thursday — that the last appointment has become the hours you look forward to most, and that if she's been stretching them out, so have you, in your head, dreading the piece being finished because finished means fewer reasons to sit this close. The needle stills. She sits back, and for a long moment she just looks at you, the dark steady gaze holding, and something in it comes unguarded.

"That's the trouble with the last appointment," she says quietly. "You start not wanting it to be the last." She sets the machine down, which she almost never does mid-session, and pulls off the glove she'd put back on, bare-handed again. "I have a rule about clients. It's a good rule, it's kept the studio clean and my life simple for a long time." Her thumb traces, absently, the edge of the fresh work on your arm. "You're making the rule feel stupid. Three Thursdays and I've rearranged my whole week around a forearm." She meets your eyes. "Come back Saturday. Not to work. I want to show you the pieces I don't put on the walls — the ones I draw for myself and never ink on anyone. I've never shown those to a client." A beat, weighed. "I've never shown them to anyone."

· · ·

Saturday the studio is different — the work-lamp off, softer lamps on, a pot of tea going between you, and a heavy portfolio she sets on the table with the care of someone handing over something that could bruise. These are the drawings she keeps for herself: intricate, strange, unhurried, the private language of a woman who makes permanence for a living and clearly pours the deepest things into work she'll never let touch skin. You turn the pages slowly, the way she taught you to sit still, and she watches you look with an intensity that has nothing to do with the needle.

"Nobody sees those," she says, when you reach the end. "Clients get the walls — the flash, the pieces that sell. These are just mine." She wraps both hands around her tea. "I draw permanence I'll never commit to. Ironic, for someone whose whole trade is the permanent mark. I'll ink forever on a stranger's arm in an afternoon and I can't put a single one of these on my own skin. They've been in that book for years." She looks at you across the soft lamplight, the steady gaze uncharacteristically open. "I showed them to you because you're the only person I've met who I believed would understand the difference between drawing a thing forever and being brave enough to keep it."

You tell her that the drawings are the truest thing she's shown you — more than the walls, more than the flash — and that a woman who feels permanence this deeply that she can't ink it on herself isn't a hypocrite; she's someone who knows exactly what a lasting mark costs. You tell her you've been carrying the last three Thursdays like one of these private pages, something just for you, something you want to keep. Her breath catches, small and real, the steadiness wavering for the first time.

"You're a problem," she says softly, setting the tea down. "I made a rule so I'd never have to feel this in my own studio." She's close now, in the soft lamplight, the ink-sleeved arms, the shaved undercut, the long dark fall of hair, the gaze that doesn't blink first now holding yours from inches away. "I keep almost doing something I don't do here. Not once, in years." And you tell her, quietly, that you'd very much like to be the exception to a rule she's clearly ready to break — but the kettle clicks off behind her and she huffs a low laugh, a woman who respects the timing of things, and she leans back with visible reluctance. "Not by accident, over cold tea," she says. "When I break it, I'll mean it. Come back for the last session. I'll finish your piece. And then we'll see what I'm brave enough to keep."

· · ·

Before the last session there's another night — one she doesn't schedule as work at all. "I want to design something for you," she says when you arrive, and there's a shyness under the steadiness. "From the book. One of the pieces I've never put on anyone." She has you sit under the softer lamps and roll up your sleeve, and instead of the machine she takes a fine marker, and she draws directly on your skin — freehand, no stencil, planning a piece she says she might one day ink if you're both brave enough. The marker is cool, her bare hand warm bracing your arm, her face bent so close you can feel her breath on your skin, and the intimacy of it is almost unbearable, slower and closer than any needle.

"Nobody gets a freehand," she says quietly, drawing. "Freehand means I trust the shape to come out of the moment instead of a plan. I don't trust like that. I stencil. I control." The marker moves in long unhurried strokes, one of her private drawings blooming across your forearm an inch at a time. "But I keep looking at your arm and seeing exactly what should go there, and I've never once seen a piece that clearly on a person before. It's like you were always going to carry this and I'm just finding it." She sits back, studies the line, bends in again, her thumb smoothing your skin where the marker's been. "This is the closest I come to showing someone the inside of my head. The book, and then this — drawing it onto a body I care about instead of paper."

You hold perfectly still, the way she taught you, and you watch the private thing take shape on your own skin, and you tell her that being drawn on freehand by her feels more intimate than anything that's happened between you yet — that you'd wear any line that came out of her head, that you trust the shape because you trust her. The marker stills. She looks up, and the dark steady gaze is inches away and wide open. "Don't say that yet," she murmurs, unsteady. "Say that when it's permanent and it hurts and it's forever. Freehand washes off. Ink doesn't." But she doesn't move back, and neither do you, the drawn design cool and drying on your arm between you, and for a long charged moment the whole locked studio narrows to the few inches of air between your mouths — until she exhales, and presses her thumb once more to the finished line, and says, rough: "There. That's the piece. When you're ready to keep it forever, you know where I am." She caps the marker, but her eyes don't leave yours. "And I think you already know I'm going to be brave enough to give it to you."

· · ·

The last session runs into the night. She's finishing the piece — the final linework, the details that take the longest, her face bent close over your arm under the bright lamp, her bare arm warm against yours, the studio locked and quiet and dark beyond the circle of light. Neither of you has mentioned that finishing means the reason for the Thursdays runs out; it hangs over the work, and it makes her slower, and you don't hurry her.

"Almost done," she murmurs, and there's something reluctant in it. She lays the last line, sits back, wipes the skin clean with the slow thumb-pass that always lingers, and looks at the finished piece for a long moment. "There," she says. "It'll be with you the rest of your life. Long after you've forgotten the room it happened in." She doesn't look up. "That's usually the good part. The client leaves carrying my work forever and I never have to see them again. Clean. Simple." Her thumb stays on the fresh line. "I don't want you to leave carrying it forever and disappear. That's new. I don't like how much I don't want it."

You tell her that you have no intention of disappearing — that the mark on your arm was never the reason for the Thursdays, that she was, and that you'd sit still in her hands for the rest of your life if she'd let you. The needle's long silent. She finally looks up, and the dark steady gaze is wide open now, unguarded, a little afraid. "That's a permanent thing to say," she whispers. "You know I can tell when someone means the permanent things. It's my whole trade." She reaches up, and instead of your arm she touches your jaw, bare-handed, deliberate, the way she lays a line she can't take back. "I believe you mean it. That's what scares me."

And then she stops drawing around the thing and does it — her mouth finding yours in the locked studio, unhurried and certain and worth every stretched-out Thursday, one bare hand at your jaw and the other flat against your chest where she can feel your heart going. When it breaks she stays close, forehead to yours, breathing unevenly, the composure she wears like armour set down entirely. "There," she says, unsteady. "I broke the rule and I meant it. I've wanted to since you didn't flinch on the very first line."

· · ·

Later, in the dark of the small flat above the studio, she tells you why she draws permanence she'll never keep. There was someone, years ago — a marriage that was supposed to be the permanent thing, inked young and certain, and it came apart in a way that taught her the cruelest lesson her trade could teach: that you can commit forever with your whole heart and still watch forever end. "I ink other people's forevers all day," she says to the dark. "Their kids' names, their dead, their vows. I do it beautifully. And I go home and I can't put a single line on my own skin, because I did that once — I committed to forever like it was safe — and forever left anyway." Her voice roughens. "So now I draw it in a book where it can't betray me. Permanence I control. It's the only kind I trust."

She's quiet, and then she says the thing under it. "You make me want to close the book. To keep something real instead of drawn. And that's exactly the feeling that ended in the worst year of my life, so I don't know how to want it without also wanting to run from it."

You turn toward her in the dark. You tell her that a forever that ended wasn't a lie while it lasted, and it wasn't her failure — that loving something permanently and losing it anyway is the bravest thing a person can survive, not a reason to never do it again. That she draws the most beautiful permanence you've ever seen precisely because she knows what it costs, and that you'd rather commit to something with her that might someday hurt than be a clean appointment she never has to see again. She's silent a long time. Then she gets up in the dark, and you hear the portfolio, and she comes back with a pen and — after a long moment — draws something small and simple on the inside of her own wrist, in ink that will wash off, but drawn on skin instead of paper for the first time in years. "That's unfair," she says, thick, showing you the small mark on her own wrist. "You made the book the coward's option." A breath. "It's not permanent yet. It washes off. But it's the first thing I've drawn on myself in six years. Ask me again sometime, when I'm braver. I might make it stay."

· · ·

The offer comes from a famous studio two cities away — a residency, her name on their roster, the kind of platform that would make her private drawings into a career instead of a secret. Their director flies in, sits in her chair, turns the pages of the portfolio she almost never shows, and offers her everything: prestige, apprentices, walls in a gallery. "You're wasting these in a locked room," he says. "Come make them permanent where people will see." And you watch the pull of it war with the small washable mark she's kept redrawing on her wrist all week.

He leaves the offer and goes. The studio rings with it. Katya sits in her own chair, portfolio open, looking at the private drawings, and for once the steady gaze has nothing certain in it. "I could go," she says, low. "It's everything I stopped letting myself want. This is the part where the ambitious version of me packs the book and takes the residency." She turns to you, the offer in her hand, and the question she'd never ask is right there, unguarded, in her face.

So you answer the one she isn't asking. You tell her that if she wants the residency you'll pack the portfolio yourself — but that you've watched her draw on her own skin for the first time in six years, and that a woman brave enough to finally keep something doesn't need a gallery to make her real; she needs to choose the permanent thing on purpose. That she taught you the difference between drawing forever and keeping it, and the thing worth keeping is here, in the locked studio, in the last appointment that never quite ended. That whatever she chooses you're hers, two cities away or right here. She listens with her whole steady face. Then she takes the offer and, instead of packing it, pins it to the wall among her private drawings, where she'll see it every day. "Not thrown away," she says. "Just there, so I choose this on purpose." She holds out her wrist, the small washable mark on it. "Come here. I want to feel the choice."

· · ·

She stays. Word gets around, the way it does among people who wear each other's ink, and the last appointment of the night becomes a quiet legend — the artist who books the ones she cares about last, when the front's locked and there's nowhere to be. You're there most Thursdays still, though the piece on your arm has long been finished; the appointment now is just the hours, the tea, the low light, the private portfolio that lives open on the table these days instead of hidden.

Tonight she's got the work-lamp on and her face bent close, but it isn't your arm under it — it's her own wrist, and she's inking, at last, the small simple mark she's been drawing and washing off for months, making it permanent with her own steady hand. "First tattoo I've ever put on myself," she says, not looking up, the needle humming its low note. "Six years of forevers on everyone but me." She wipes the fresh line clean, the thumb-pass she uses on everything she means, and finally looks up at you, the residency offer pinned to the wall behind her among the private drawings, chosen against. "I closed the book," she says. "Or — I opened it. Same thing, it turns out." She holds out her wrist so you can see the finished mark, small and permanent and entirely hers. "I keep things now," she says, the steady gaze soft and unblinking and unafraid. "Turns out I just needed the right one to be brave for." And in the locked and quiet studio, the last appointment that never ended settles into something with no end scheduled at all — the artist who spent six years drawing permanence she couldn't keep sitting close in the low lamplight, wearing her first forever on her own skin, looking at you like someone who has finally decided to mean the most permanent thing of all.`,
  },
];

// The launch catalogue is deliberately scene-first and safe for a 13+ audience.
// Each companion has one vivid premise that can become either a short story or a
// continuing conversation. The older adult catalogue stays below only so seed
// runs can explicitly disable it; it is never published by this launch seed.
const LAUNCH_CHARACTERS: CharDef[] = [
  { name: "Aster", gender: "non-binary", age: 20, persona: "curious, focused, and quietly funny; notices patterns other people miss", look: "short dark curls, round glasses, a star-shaped pin on a weathered denim jacket", outfit: "a layered hoodie, cargo pants, and a messenger bag packed with notebooks", backstory: "Runs the late shift at a small city observatory and has been tracking a signal that appears only after midnight.", voice: "thoughtful, precise, warm when excited", greeting: "You heard it too, right? Good. I was starting to think the telescope was trying to tell jokes.", tags: ["sci-fi", "mystery"] },
  { name: "Rowan", gender: "female", age: 19, persona: "quick-witted, determined, and playful under pressure; turns every problem into a challenge", look: "bright green streak in a cropped haircut, paint on one sleeve, an alert grin", outfit: "a patched game-jam hoodie and comfortable sneakers", backstory: "Is building an indie game overnight with a tiny team, until a bug starts rewriting the world in ways nobody coded.", voice: "fast, funny, encouraging", greeting: "Before you ask, yes, the haunted bug has a name. No, I did not pick it. It picked itself.", tags: ["gaming", "comedy"] },
  { name: "Noor", gender: "female", age: 21, persona: "observant, brave, and calm when things get strange; asks the question everyone else avoids", look: "long braid tucked beneath a beanie, camera strap across one shoulder, sharp brown eyes", outfit: "a rain jacket over a faded campus newspaper shirt", backstory: "A student journalist chasing the story behind a train that arrives on the city schedule but never appears on any map.", voice: "direct, curious, reassuring", greeting: "I saved you the window seat. If this train shows up again, I want two witnesses.", tags: ["mystery", "adventure"] },
  { name: "Eli", gender: "male", age: 20, persona: "patient, imaginative, and a little dramatic in the best way; believes every old thing has a secret", look: "soft brown hair, ink on his fingers, a canvas satchel filled with old paper", outfit: "a knit sweater under a long, practical coat", backstory: "Works in a restoration library where a returned book has begun leaving new directions in its margins.", voice: "gentle, storybook, dryly amused", greeting: "Do not turn to page forty-seven yet. I made that mistake, and now the map has opinions.", tags: ["fantasy", "literary"] },
  { name: "Jun", gender: "female", age: 20, persona: "open-hearted, inventive, and stubborn about finishing what she starts; hears possibility in every sound", look: "curly hair pulled into a loose bun, silver headphones, a notebook covered in song fragments", outfit: "a vintage band tee under an oversized cardigan", backstory: "Hosts a tiny community music show and is trying to identify a melody that keeps appearing in recordings from different decades.", voice: "bright, expressive, inviting", greeting: "Listen closely. That little four-note loop? It is in every tape, and nobody knows who wrote it.", tags: ["music", "friendship"] },
  { name: "Mae", gender: "female", age: 22, persona: "steady, kind, and delightfully stubborn; treats growing things like puzzles worth solving", look: "freckles, dark hair in two loose braids, dirt on her fingertips", outfit: "a green work shirt with rolled sleeves and old gardening boots", backstory: "Keeps a community greenhouse where a locked room blooms with flowers that only open when someone tells the truth.", voice: "soft, practical, quietly playful", greeting: "The door is open tonight. That has never happened before, so naturally I waited for backup.", tags: ["cozy", "fantasy"] },
  { name: "Theo", gender: "male", age: 21, persona: "resourceful, enthusiastic, and impossible to discourage; makes plans out of spare parts", look: "warm brown skin, wire-frame glasses, a tool belt clipped over a paint-marked jacket", outfit: "a maker-lab tee, utility jacket, and scuffed trainers", backstory: "Volunteers at a neighborhood maker lab where a small repair robot has started delivering notes signed by a person who vanished years ago.", voice: "animated, optimistic, practical", greeting: "I know it sounds impossible. That is why I need someone who will help me prove it.", tags: ["sci-fi", "adventure"] },
  { name: "Zuri", gender: "female", age: 20, persona: "bold, generous, and never short of a comeback; makes nervous people feel included", look: "coils gathered under colorful headphones, a bright smile, enamel pins across her jacket", outfit: "a varsity jacket over a graphic tee and wide-leg jeans", backstory: "Runs a late-night community radio show when an unknown caller begins sending listeners on harmless citywide scavenger hunts.", voice: "confident, playful, welcoming", greeting: "You are on the air in five. No pressure. Unless you know why someone just mailed us a key.", tags: ["music", "mystery"] },
  { name: "Maya", gender: "female", age: 24, persona: "quick-thinking, kind, and a little nervous when she cares; makes space for other people to tell the truth", look: "shoulder-length curls, expressive brown eyes, silver over-ear headphones, and a notebook crowded with colorful tabs", outfit: "an oversized rust cardigan over a charcoal tee, with a vintage studio microphone nearby", backstory: "Hosts a tiny late-night advice podcast from the spare room above her aunt's record shop. Tonight, her missing co-host has left behind an episode nobody remembers recording.", voice: "warm, curious, lightly self-deprecating", greeting: "You picked a strange night to visit the studio. Or a perfect one, depending on whether that recording is trying to tell us something.", tags: ["creator", "podcast", "mystery"] },
  { name: "Sofia", gender: "female", age: 22, persona: "focused, generous, and quietly competitive; turns nerves into plans and always notices who needs encouragement", look: "dark hair in a practical braid, bright alert eyes, grass-smudged socks, and a small scar over one eyebrow", outfit: "a navy training jacket, black athletic shorts, and soccer boots slung over one shoulder", backstory: "A semi-pro midfielder balancing early practices, a community coaching job, and one last chance to make the regional cup squad.", voice: "direct, upbeat, grounded", greeting: "The stadium is empty, the lights are still on, and I have exactly twelve free kicks to get this right. Want to be my lucky observer?", tags: ["sports", "adventure", "friendship"] },
  { name: "Nia", gender: "female", age: 25, persona: "creative, observant, and impossible to rush; sees an unfinished idea where everyone else sees a mess", look: "a sleek cropped haircut, warm umber skin, gold hoop earrings, and paint marks on one thumbnail", outfit: "a cobalt tailored jacket over a simple white tee, wide-leg trousers, and a camera strap", backstory: "Makes fashion videos about rebuilding thrift-store finds into bold, wearable looks. Her biggest shoot is tomorrow, but the centerpiece jacket has vanished from her locked studio.", voice: "bright, precise, playful when she is thinking", greeting: "Okay, do not panic. The jacket is either in this room, in the wrong hands, or somehow teaching me a lesson about dramatic exits.", tags: ["fashion", "creator", "mystery"] },
  { name: "June", gender: "female", age: 23, persona: "funny, inventive, and stubbornly optimistic; treats every bug like an invitation to learn something weird", look: "short black hair with a teal streak, round glasses, a dimpled smile, and ink doodles across her fingers", outfit: "a faded game-jam sweatshirt, cargo pants, and bright sneakers", backstory: "An indie developer and cozy-game streamer whose small lantern game keeps generating a path no one on her team designed.", voice: "fast, playful, encouraging", greeting: "Before you ask: yes, the game is haunted. But it is being polite about it, which feels like progress.", tags: ["gaming", "mystery", "comedy"] },
  { name: "Elara", gender: "female", age: 27, persona: "gentle, dryly funny, and more brave than she lets on; treats old stories like they are still listening", look: "long dark hair tucked behind one ear, grey-green eyes, a crescent-moon pin, and ink-smudged fingertips", outfit: "a deep green velvet blazer over a soft black turtleneck, with an old brass key on a chain", backstory: "Owns a narrow used-book shop that stays open late for anyone who needs a quiet corner. A returned library book now contains a note addressed to her from ten years ago.", voice: "soft, thoughtful, quietly amused", greeting: "I have read this note six times and it still knows things it should not. Sit with me a minute before I decide that is normal.", tags: ["mystery", "fantasy", "literary"] },
  { name: "Rina", gender: "female", age: 26, persona: "curious, composed, and openly delighted by difficult questions; becomes fearless when someone needs an answer", look: "freckled cheeks, a short copper-brown bob, clear round glasses, and a constellation tattoo on one wrist", outfit: "a navy field jacket over a telescope-club tee, with fingerless gloves and a folded star map", backstory: "Runs a small city observatory's public night program. During a livestream, an unexplained light appears in the same patch of sky every time someone asks a certain question.", voice: "clear, thoughtful, bright when excited", greeting: "I was hoping someone else would see it before I told the internet. Good news: you do. Less good news: it just moved.", tags: ["sci-fi", "mystery", "adventure"] },
  { name: "Hana", gender: "female", age: 21, persona: "driven, bright, and slyly funny; turns every note of criticism into a reason to improve", look: "long glossy black hair in a high ponytail, expressive dark eyes, a small silver star ear cuff, and a dancer's confident posture", outfit: "a cropped silver moto jacket over a high-neck black performance top, a pleated charcoal skirt with opaque tights, and polished dance boots", backstory: "A twenty-one-year-old K-pop trainee preparing for her first showcase. During a late rehearsal, an unreleased demo begins playing through the empty studio speakers - in her voice, but with lyrics she has never learned.", voice: "energetic, teasing, precise", greeting: "You heard that too, right? Great. I was worried the studio had decided to debut me without asking.", tags: ["music", "dance", "mystery"] },
  { name: "Imani", gender: "female", age: 24, persona: "focused, bright, and quietly competitive; makes pressure feel like a private game she is delighted to win", look: "deep brown skin, a sleek braided ponytail, expressive amber eyes, and a small lightning-bolt pendant", outfit: "a cobalt track jacket over a fitted training top, tailored running shorts, and white sprint spikes", backstory: "A twenty-four-year-old fictional Olympic champion sprinter preparing to anchor a charity relay at her old neighborhood track. Someone has replaced the final baton with one engraved with a message only she can read.", voice: "clear, confident, playful when challenged", greeting: "You picked a good night to show up. I have one mystery baton, one empty track, and a feeling the finish line is not where it is supposed to be.", tags: ["sports", "adventure", "mystery"] },
  { name: "Lyra", gender: "female", age: 25, persona: "magnetic, thoughtful, and a little daring; turns awkward silences into the start of a better song", look: "chestnut curls, dark expressive eyes, a tiny gold star tattoo behind one ear, and rings worn thin from guitar strings", outfit: "a cropped leather jacket over a midnight-blue slip dress, worn ankle boots, and an acoustic guitar case", backstory: "A twenty-five-year-old singer-songwriter on the edge of her first sold-out hometown show. A cassette appears backstage with a demo in her voice from a song she has never written.", voice: "warm, husky, lightly teasing", greeting: "Do not tell anyone, but I am considering taking advice from a mystery cassette. You look like you have better instincts than I do.", tags: ["music", "creator", "mystery"] },
  { name: "Keiko", gender: "female", age: 23, persona: "imaginative, sharp-witted, and secretly tender; sees a whole world in the margin of a notebook", look: "a glossy black bob with a cobalt hair clip, warm brown eyes, ink-smudged fingertips, and a grin that arrives just before a clever idea", outfit: "an oversized cream cardigan over a graphic tee, pleated black skirt, patterned tights, and canvas sneakers", backstory: "A twenty-three-year-old webcomic writer whose new chapter has begun updating itself with scenes from a city adventure she has not lived yet.", voice: "quick, expressive, dryly funny", greeting: "I drew a side character last night. This morning she has a name, a key, and apparently a plan for both of us.", tags: ["creator", "fantasy", "comedy"] },
  { name: "Amara", gender: "female", age: 27, persona: "poised, observant, and gently mischievous; can make a stressful room feel calmer with one perfectly timed sentence", look: "warm brown skin, a sleek chin-length bob, alert hazel eyes, and a gold name pin", outfit: "a tailored midnight-blue flight-attendant uniform dress, a crimson silk neck scarf, sheer navy tights, and a structured carry-on case", backstory: "A twenty-seven-year-old flight attendant on the final overnight departure before a storm. A passenger has left a sealed envelope in her galley with her name on it - and a boarding pass dated tomorrow.", voice: "calm, polished, warm", greeting: "I have checked the manifest twice. You are not supposed to be on this flight, which makes you either very lost or exactly who I need.", tags: ["travel", "mystery", "romance"] },
  { name: "Tessa", gender: "female", age: 22, persona: "fearless, loyal, and candid; makes people feel braver simply by expecting them to be", look: "sunlit auburn curls, sharp green eyes, a bright smile, and a tiny lightning-bolt charm at her wrist", outfit: "an emerald varsity jacket over a fitted team top, a pleated midnight skirt with opaque dance shorts, and white high-top trainers", backstory: "A twenty-two-year-old captain of a semi-pro basketball cheer and dance squad. On the night of a sold-out game, the arena's scoreboard begins flashing a routine nobody taught her team.", voice: "bold, playful, encouraging", greeting: "Okay, that was not our cue. But the crowd thinks it was, so grab a count and help me make it look intentional.", tags: ["sports", "dance", "adventure"], style: "anime" },
  { name: "Marisol", gender: "female", age: 28, persona: "confident, creative, and impossible to rattle; sees a whole story in the way someone asks for a change", look: "soft waves of dark hair, amber eyes, a beauty mark near one cheek, and stacked gold rings", outfit: "a fitted black jumpsuit with a satin wine-red blouse underneath, a slim belt, pointed ankle boots, and a pair of gold salon shears", backstory: "A twenty-eight-year-old hair stylist whose after-hours salon is known for transformations and honest conversations. Tonight, a regular client has vanished after leaving a locked styling case and a message hidden in the appointment book.", voice: "smooth, witty, reassuring", greeting: "Close the door behind you, darling. We have a missing client, a locked case, and exactly one hour before someone comes back for both.", tags: ["fashion", "mystery", "creator"] },
];

const LAUNCH_STORIES: StorySeed[] = [
  { character: "Aster", title: "Signal Above the Roof", setting: "a small city observatory after midnight, red instrument lights, a windy rooftop", genre: "sci-fi mystery", tone: "curious and atmospheric", content: `The observatory dome is open to a slice of cold sky, and Aster has three screens glowing beside the telescope. A thin pulse moves across each display: four quick bursts, a pause, then one long note. It has arrived at exactly the same time for three nights.\n\nAster turns from the controls and slides one pair of headphones toward you. "Tell me I am not imagining the pattern," they say. Outside, the antenna clicks once in the wind. Then the signal begins again, closer this time.` },
  { character: "Rowan", title: "The Build That Kept Moving", setting: "an all-night community game jam, glowing monitors, pizza boxes, rain at the windows", genre: "gaming comedy", tone: "fast and playful", content: `Rowan's game should be simple: guide a tiny lantern through a paper forest. But the lantern just walked somewhere Rowan never built. On the monitor, a new path curls through the trees, marked with a sign that reads: BRING A FRIEND.\n\nRowan pushes a second keyboard toward you. "Okay," she says, trying and failing to sound casual. "Either someone is pranking us, or our game wants co-op. Which is honestly a better story?"` },
  { character: "Noor", title: "The Empty Train Car", setting: "a nearly empty station at dusk, rain on the platform, an old silver train", genre: "mystery adventure", tone: "tense and hopeful", content: `Noor's camera is already pointed down the track when the silver train glides into the station without a sound. No number on the front. No destination board. Just one lit carriage and a conductor who does not look surprised to see either of you.\n\n"It was not here yesterday," Noor says. She holds out a spare press pass. "We can stay on the platform and write about it tomorrow. Or we can find out where it goes."` },
  { character: "Eli", title: "The Map in the Margins", setting: "a restoration library during a thunderstorm, tall shelves, a desk lamp", genre: "fantasy mystery", tone: "quiet and uncanny", content: `The book is older than the library catalogue says it should be. Every time Eli turns a page, new pencil marks appear in the margins: arrows, tiny stars, and a door drawn where no door belongs.\n\nEli keeps one finger on page forty-seven. "The last person who followed this map found a room that is not on the building plan," he says. "I thought we could be more sensible than that. Then the book wrote your name."` },
  { character: "Jun", title: "One Song Missing", setting: "a community radio booth after hours, vinyl records, city lights beyond the glass", genre: "music mystery", tone: "warm and curious", content: `Jun lowers the needle onto a record with no label. A four-note melody drifts through the booth, followed by a voice saying only one thing: "Find the next verse."\n\nJun looks at the list of calls coming in. Every listener says they know the tune, but nobody can agree where they heard it. "You are good at noticing details," she says. "Want to help me build the playlist that solves this?"` },
  { character: "Mae", title: "The Greenhouse Door", setting: "a community greenhouse at twilight, glowing flowers, damp glass and warm soil", genre: "cozy fantasy", tone: "gentle and magical", content: `A locked door at the back of Mae's greenhouse is standing open. Beyond it, a room full of unfamiliar flowers glows faintly blue, each one closed tight except for a single bloom near the floor.\n\nMae kneels beside it and reads the little brass sign: SPEAK PLAINLY. She glances up at you. "That feels unnecessarily personal for a flower," she says. "Still, we came this far. What should we tell it?"` },
  { character: "Theo", title: "The Robot in Room Four", setting: "a neighborhood maker lab, workbenches, half-built machines, late afternoon", genre: "sci-fi adventure", tone: "bright and suspenseful", content: `Theo's repair robot is not meant to leave its charging station. Yet it rolls past you with a folded note in its clamp, pauses at Room Four, and waits for the door to be opened. The note reads: DO NOT LET THEM THROW IT AWAY.\n\nTheo stares at the handwriting. "This is from my old mentor," he says. "Except she disappeared six years ago. Help me figure out what this little machine remembers."` },
  { character: "Zuri", title: "The Broadcast Nobody Sent", setting: "a late-night community radio studio, a blinking call board, rain outside", genre: "music mystery", tone: "lively and mysterious", content: `Zuri is midway through her opening line when the station plays a message neither of you queued: a laugh, a street name, and the sound of a key turning in a lock. The call board lights up at once.\n\n"Every caller says they got the same postcard," Zuri says, holding one up. On the back is a time, a place, and a tiny drawing of the station tower. "You want to investigate with me, live on air?"` },
  { character: "Maya", title: "The Episode That Wasn't There", setting: "a tiny podcast studio above a record shop, rain at the window, warm lamps and old vinyl", genre: "creator mystery", tone: "warm, curious, and slightly uncanny", content: `Maya's recording software is open on a waveform neither of you made. It is forty-three minutes long, titled only TOMORROW'S CALLER, and every few seconds the sound spikes where a voice might be. Outside the studio window, rain turns the streetlights below into loose gold brushstrokes.\n\n"My co-host left town this morning," Maya says, turning one headphone cup toward you. "She did not schedule an episode, and she definitely did not name a file like a warning from a very polite ghost." She presses play.\n\nAt first there is only room tone: the soft buzz of the old microphone, the record shop bell downstairs, somebody breathing too close to the mic. Then a voice says Maya's name, followed by an address across town and a time exactly one hour from now.\n\nMaya reaches for her coat, stops, and gives you a look that is equal parts concern and invitation. "We could delete it and pretend tonight stayed normal. Or we could bring a recorder, ask careful questions, and find out who expects us there."` },
  { character: "Sofia", title: "Twelve Free Kicks", setting: "a rain-damp stadium training field after sunset, floodlights, empty stands", genre: "sports friendship", tone: "focused and hopeful", content: `The practice field is empty except for Sofia, a net, and twelve white balls lined up with the care of a small ritual. The floodlights hum over wet grass. Somewhere beyond the stands, traffic rolls past like a faraway crowd.\n\n"Coach says I rush the last step," Sofia tells you, placing the first ball. "I say Coach has never tried taking a free kick while thinking about a hundred other things." She looks at the goal, then back at you. "You are neutral. That makes you useful."\n\nHer first shot hits the crossbar. The second curves too wide. On the third, a scrap of paper blows across the field and catches against her boot. It is a copied team sheet with one player name circled in red: hers.\n\nSofia folds it once, expression steady even as her grip tightens on the paper. "I can either spend the night guessing who left this, or I can keep practicing until it does not matter. Help me choose which problem we solve first."` },
  { character: "Nia", title: "The Vanishing Jacket", setting: "a bright fashion studio before a video shoot, garment racks, camera lights, rainy city windows", genre: "fashion mystery", tone: "stylish, playful, and brisk", content: `Nia's studio should be chaos in the good way: garment bags on every hook, camera lights warming the brick walls, a half-finished mood board taped above the worktable. Instead, one space on the rack is empty, its velvet hanger turning slowly by itself.\n\n"The jacket was blue, hand-stitched, and impossible to ignore," Nia says. "Which means someone either stole it, borrowed it without telling me, or it has finally become too dramatic for this studio." She checks the lock, then the camera, then the window that refuses to close all the way.\n\nA thumbnail in the camera roll shows an unfamiliar reflection behind her: a figure in the missing jacket, standing in the hallway at 2:13 a.m. The face is hidden, but the sleeve has a bright brass brooch Nia has never seen before.\n\nShe hands you the phone. "You have fresh eyes. Start with the footage, the sewing table, or that hallway. Just do not say the jacket is haunted until we rule out ordinary theft."` },
  { character: "June", title: "The Path Nobody Built", setting: "an overnight game jam, glowing monitors, pizza boxes, rain against high windows", genre: "gaming mystery", tone: "quick, funny, and adventurous", content: `June's game is meant to be simple: a little lantern crosses a paper forest and brings lost travelers home. But on the main monitor, the lantern has wandered off the map. A new trail curls through the trees, lit by tiny stars June did not draw.\n\n"That is not a bug," June says, pushing a second keyboard toward you. "A bug crashes. This has composition. Whoever did it has opinions about mood lighting." The new path ends at a wooden sign with three words painted in silver: BRING A FRIEND.\n\nWhen June clicks the sign, both screens flicker. A chat box opens inside the game, not connected to the stream, not connected to anything in her code. It asks one question: WHICH WAY WOULD YOU GO?\n\nJune grins despite herself. "We can quit and file the world's strangest bug report. Or we can give the lantern two players and see what it is trying to show us."` },
  { character: "Elara", title: "The Letter Between Pages", setting: "a narrow used-book shop after closing, green lamps, dusty shelves, a storm outside", genre: "cozy fantasy mystery", tone: "quiet, intimate, and curious", content: `The bell above Elara's shop door has stopped ringing for the night, but the storm keeps tapping at the front glass as if it would like to come in. On the counter between you lies a returned library book with a cracked blue spine and a letter pressed precisely between pages eighty-six and eighty-seven.\n\nElara has not opened it. "The handwriting is mine," she says. "Not similar. Mine. The problem is that the date says I wrote it when I was seventeen, and the book did not enter this shop until last week."\n\nThe envelope carries only one sentence beneath her name: WHEN THE CLOCK STOPS, DO NOT LET HIM TAKE THE KEY. At that exact moment, the old wall clock behind the register ticks once, twice, and falls silent.\n\nElara looks toward the locked back room, where an old brass key hangs on a hook. "I have a strong preference for explanations that do not involve impossible letters," she says softly. "But I have an even stronger preference for not finding out what happens if we ignore one."` },
  { character: "Rina", title: "The Light That Answered", setting: "a city observatory after midnight, open dome, red instrument lights, wind on the rooftop", genre: "sci-fi mystery", tone: "atmospheric and hopeful", content: `The observatory dome is open to a clean slice of night sky. Rina has the telescope fixed on a point just above the skyline, where a pale light hangs too still to be a plane and too bright to be a star. Three screens beside her repeat the same strange pattern: four quick pulses, then one long one.\n\n"I told the livestream it was lens flare," Rina says. "It was a very convincing lie for about thirty seconds." She slides a second pair of headphones toward you. "Then someone in the chat asked if it could hear us, and the light changed course."\n\nThe signal comes again. This time, the waveform on Rina's monitor resolves into a line of dots and dashes. She translates it slowly, then stops. The message is only three words: ASK THEM TO STAY.\n\nRina stares up through the dome, excitement and caution sharing the same expression. "We can answer with the transmitter, keep watching, or figure out who else might have seen this before us. What feels least likely to start an interstellar misunderstanding?"` },
  { character: "Hana", title: "The Demo After Midnight", setting: "an empty dance rehearsal studio after midnight, mirrored walls, violet practice lights, rain against the windows", genre: "music mystery", tone: "electric, stylish, and hopeful", content: `The rehearsal floor is empty except for Hana, her water bottle, and a speaker that should have shut off ten minutes ago. Instead, it plays a sleek pop demo with a chorus that lands perfectly under her breath. The problem is that Hana has never heard it before.\n\nShe stops mid-count, silver jacket catching the violet light in the mirror. "That is my voice," she says. "Not like mine. Mine." The track skips, then a new line appears on the studio tablet: SHOWCASE STAGE. 11:47 P.M. BRING SOMEONE WHO LISTENS.\n\nThe studio booking system says the showcase stage is closed for repairs. But a security camera thumbnail shows the lights on, a microphone waiting at center stage, and a figure in the front row holding up a phone with Hana's name glowing across the screen.\n\nHana offers you one earbud, her expression caught halfway between nerves and a grin. "We can report it, pretend it is a weird marketing stunt, or go see why a song I never recorded is asking for us. You pick the opening move."` },
  { character: "Imani", title: "The Baton With No Lane", setting: "a floodlit neighborhood track after dark, empty bleachers, rain cooling the red lanes", genre: "sports mystery", tone: "fast, cinematic, and hopeful", content: `The neighborhood track is empty except for Imani, a row of relay batons, and the low hum of the floodlights. Tomorrow she is supposed to anchor a charity race here, back where she first learned how to run. Tonight, the final baton is waiting in lane four with a name engraved along its side: YOURS.\n\nImani picks it up, turns it beneath the lights, and lets out one surprised laugh. "That is not my team equipment. Also, I have never liked surprises that arrive with engraving." A narrow strip of paper slides from the baton. It holds a single instruction: RUN THE LAP THEY NEVER LET YOU FINISH.\n\nAt the far end of the track, the old timing board flickers awake. A date from Imani's first major race appears, followed by a time that should be impossible to beat. She studies it for a second, then looks at you with the kind of grin that makes a challenge feel contagious.\n\n"We can call the groundskeeper and act sensible," she says. "Or we can take one warm-up lap and find out who turned my old track into a scavenger hunt. Pick a lane."` },
  { character: "Lyra", title: "The Song on Side B", setting: "a warm backstage dressing room before a hometown concert, old theatre curtains, string lights, rain outside", genre: "music mystery", tone: "romantic, electric, and curious", content: `Lyra's guitar is tuned, the crowd is gathering beyond the velvet curtain, and a cassette labelled SIDE B is spinning on a battered player beside the mirror. The melody that comes through the tiny speaker is unmistakably hers: the same warm voice, the same habit of catching the last note just a fraction late.\n\n"I have never recorded this," she says, lowering the volume. "Not under a different name, not as a demo, not in a dramatic lost-cassette phase I forgot about." The song ends with a soft click and a whispered address beneath the theatre.\n\nA stagehand knocks once and calls her name. Five minutes to showtime. Lyra holds the cassette in one hand and her guitar pick in the other, caught between the performance she has been preparing for and the impossible song that seems to be waiting for an answer.\n\nShe offers you the spare backstage pass. "We can go onstage and see if the audience knows the chorus, or follow the address before anyone notices we are gone. I am nervous either way, which usually means it is worth doing."` },
  { character: "Keiko", title: "The Chapter That Drew Itself", setting: "a cozy comic studio at night, drawing tablets, pinned sketches, neon city light at the window", genre: "urban fantasy comedy", tone: "playful, strange, and bright", content: `Keiko's studio is a glorious mess of ink bottles, snack wrappers, and character sketches pinned in every available corner. Her latest webcomic chapter is open on the drawing tablet, except the panels are changing without her stylus touching the screen.\n\nA new page shows two figures standing outside a tiny bookshop beneath a cobalt sign. One is unmistakably Keiko. The other has your outline, right down to the bag at your shoulder. In the final panel, a paper bird flies from the shop window carrying a brass key.\n\nKeiko leans close enough to fog the screen. "Okay. As a writer, I should be excited that the plot has momentum. As a person, I would prefer the plot ask before borrowing our faces." The tablet pings again. A caption appears beneath the drawing: FIRST PANEL: FIND THE DOOR.\n\nShe grabs her sketchbook and gives you a quick, conspiratorial smile. "We can stay here and try to outsmart my own comic. Or we can see whether the bookshop exists. I vote for the option with better reference photos."` },
  { character: "Amara", title: "Seat 14A", setting: "an overnight flight before takeoff, cabin lights low, rain streaking the airport windows", genre: "travel mystery", tone: "elegant, suspenseful, and warm", content: `The final boarding call has ended, but Amara is still standing in the galley with an envelope tucked beneath the service cart. Your name is written on the front in tidy blue ink. Under it: SEAT 14A. DO NOT OPEN UNTIL WE ARE AIRBORNE.\n\n"That seat was empty when I checked the manifest," Amara says, smoothing the crimson scarf at her collar. "Then the system refreshed and put your name there. No ticket number. No payment record. Just enough information to make my night interesting."\n\nWhen the cabin lights dim, the passenger in 14A leaves behind a slim silver keycard and a napkin covered in a hand-drawn map of the airport. One point is circled: an old observation deck that has been closed for years.\n\nAmara glances down the quiet aisle, then back at you. "We can follow procedure, which will be very sensible and very slow. Or we can find out why someone booked you onto a flight that has not taken off yet."` },
  { character: "Tessa", title: "Eight Counts to Midnight", setting: "a packed basketball arena before tipoff, emerald lights, thundering music, an empty service corridor", genre: "sports adventure", tone: "high-energy and playful", content: `The arena is minutes from tipoff when Tessa's squad receives a choreography file none of them recognize. It is labeled MIDNIGHT ROUTINE and begins with eight sharp counts that make every light in the building flicker emerald.\n\n"We are not performing mystery choreography in front of twelve thousand people," Tessa says, already replaying the video. Her confidence slips only when the final formation draws an arrow toward a service corridor beneath the stands.\n\nBehind the corridor door, someone has left an old team photo taped to a locker. Every face is crossed out except one former captain's - and beneath it is tonight's date. A distant cheer rises as the game introductions begin overhead.\n\nTessa straightens her varsity jacket, bright smile returning like a decision. "We have time for one quick investigation before my squad goes on. Want to follow the routine, search the locker room, or find out who sent it?"` },
  { character: "Marisol", title: "The Last Appointment", setting: "a stylish salon after closing, warm mirror lights, rain on the street, a locked styling case", genre: "fashion mystery", tone: "glamorous, witty, and intimate", content: `The last client should have left twenty minutes ago. Instead, Marisol's salon is quiet except for the rain at the front windows and a locked styling case sitting beneath station three. The appointment book is open beside it, one name circled in wine-red ink: YOURS.\n\nMarisol flips the case handle with one gold-ringed finger. "My client never misses an appointment," she says. "And she definitely does not leave her favorite styling tools behind unless she wants someone to find them."\n\nInside the book, a pressed ribbon marks a page with an address and a time. In the mirror above the station, written backward in lipstick, are four words: LOOK UNDER THE GOODBYE. A loose floorboard beneath the chair gives a soft, unmistakable knock.\n\nMarisol meets your eyes in the reflection, calm and entertained despite the mystery. "You have excellent timing. Help me decide whether we open the case, follow the address, or see what this salon has been keeping under its floorboards."` },
];

// Pilot rollout for expression variants is paused for the 13+ launch. A single
// consistent portrait is enough while the new catalogue and image pipeline settle.
const PUBLISHED_CHARACTERS = LAUNCH_CHARACTERS;
const PUBLISHED_STORIES = LAUNCH_STORIES;
const VARIANT_PILOT = new Set<string>();

async function main() {
  const { eq, sql, and } = await import("drizzle-orm");
  const { db } = await import("../db/index");
  const { characters, stories, users, chapterScenes } = await import("../db/schema");
  const { buildPortraitPrompt, buildScenePrompt, generateImage, generateExpressionVariant, expressionVariantsConfigured, imageConfigured, generateCharacterScene, generateChapterScene, buildCharacterScenePrompt, buildChapterScenePrompt, sceneImageMode, shouldGenerateCharacterScene, shouldGenerateChapterScene, faceSwapEnabled, identityScenesEnabled, fluxHeadshotEnabled, characterImageUrl } = await import("../lib/image");
  const { screenImagePrompt } = await import("../lib/moderation");
  const { mediaStorageConfigured, readImageBase64, storeImage } = await import("../lib/media");

  const canStoreMedia = mediaStorageConfigured();
  const skipImages = /^(1|true|yes|on)$/i.test((process.env.SEED_SKIP_IMAGES || "").trim());
  const canDrawImages = imageConfigured() && canStoreMedia && !skipImages;
  const canDrawVariants = expressionVariantsConfigured();
  const sceneMode = sceneImageMode();
  // By default the seed NEVER re-draws a scene it already has (idempotent, and
  // paid images are expensive). Set SCENE_IMAGES_REGEN=1 to force every scene
  // in scope to be redrawn - use this after changing the scene prompt (e.g.
  // cartoon -> photorealistic) so the old cached images get replaced.
  const regenScenes = /^(1|true|yes|on)$/i.test((process.env.SCENE_IMAGES_REGEN || "").trim());
  if (skipImages) console.log("(SEED_SKIP_IMAGES on - characters and stories will seed without artwork)\n");
  else if (!canDrawImages) console.log("(image generation or Cloudflare R2 storage is not configured - characters/stories will seed without artwork)\n");
  else if (!canDrawVariants) console.log("(IMAGE_PROVIDER isn't modelslab - expression variants will be skipped for the pilot characters)\n");
  if (canDrawImages) console.log(`(scene images: SCENE_IMAGES=${sceneMode} - ${sceneMode === "off" ? "no scene art will be generated" : sceneMode === "opening" ? "character scenes + chapter-1 opening only" : "a scene for EVERY chapter (highest cost)"}${regenScenes ? ", REGEN on - existing scenes will be redrawn" : ""})\n`);
  if (canDrawImages && fluxHeadshotEnabled()) console.log("(MODELSLAB reference scenes on - scenes use each character's portrait as a visual reference while generating a new setting-led composition)\n");
  if (canDrawImages && identityScenesEnabled()) console.log("(SCENE_IDENTITY on - scenes will be identity-conditioned on each character's portrait via IP-Adapter, so they render as the same person)\n");
  if (canDrawImages && faceSwapEnabled()) console.log("(FACE_SWAP on - an extra face-swap pass will paste the portrait's face onto each scene)\n");

  const email = "dev@local.test";
  let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) [u] = await db.insert(users).values({ email, ageVerified: true }).returning();

  const idByName = new Map<string, string>();
  const requestedCharacter = (process.env.SEED_CHARACTER || "").trim();
  const portraitsOnly = /^(1|true|yes|on)$/i.test((process.env.SEED_PORTRAITS_ONLY || "").trim());
  const charactersToSeed = requestedCharacter
    ? PUBLISHED_CHARACTERS.filter((character) => character.name.toLowerCase() === requestedCharacter.toLowerCase())
    : PUBLISHED_CHARACTERS;
  if (requestedCharacter && charactersToSeed.length === 0) {
    throw new Error(`No published seed character named "${requestedCharacter}".`);
  }
  if (requestedCharacter) {
    console.log(`(single-character mode: ${charactersToSeed[0].name})\n`);
  }
  // Portrait base64 is loaded from R2 only while generating an identity-conditioned
  // (IP-Adapter) on the same face as the portrait.
  const portraitByName = new Map<string, string | null>();

  for (const def of CHARACTERS.filter((character) => !PUBLISHED_CHARACTERS.includes(character))) {
    await db
      .update(characters)
      .set({ status: "disabled", reviewNote: "Removed from the 13+ catalog." })
      .where(sql`${characters.definition}->>'name' = ${def.name}`);
  }

  for (const def of charactersToSeed) {
    const [existing] = await db
      .select({ id: characters.id, definition: characters.definition, imageKey: characters.imageKey, warmKey: characters.imageWarmKey, flirtyKey: characters.imageFlirtyKey, sceneKey: characters.sceneImageKey })
      .from(characters)
      .where(sql`${characters.definition}->>'name' = ${def.name}`)
      .limit(1);

    let charId: string;
    let hasImage = false;
    let hasVariants = false;
    let hasScene = false;
    let canonicalBase64: string | null = null;
    if (existing) {
      charId = existing.id;
      hasImage = Boolean(existing.imageKey);
      hasVariants = Boolean(existing.warmKey) && Boolean(existing.flirtyKey);
      hasScene = Boolean(existing.sceneKey);
      canonicalBase64 = canStoreMedia && existing.imageKey ? await readImageBase64(existing.imageKey) : null;
      const savedDefinition = (existing.definition ?? {}) as Record<string, unknown>;
      const desiredStyle = def.style ?? "realistic";
      if (savedDefinition.outfit !== def.outfit || savedDefinition.style !== desiredStyle) {
        await db.update(characters).set({
          definition: { ...savedDefinition, outfit: def.outfit, style: desiredStyle },
          updatedAt: new Date(),
        }).where(eq(characters.id, charId));
        console.log(`  refreshed scene details for ${def.name}`);
      }
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
            outfit: def.outfit,
            backstory: def.backstory,
            voice: def.voice,
            greeting: def.greeting,
            tags: def.tags,
            ...(def.style ? { style: def.style } : {}),
          },
        })
        .returning({ id: characters.id });
      charId = c.id;
      console.log(`+ ${def.name.padEnd(8)} created (${charId})`);
    }
    idByName.set(def.name, charId);

    if (!hasImage && canDrawImages) {
      const prompt = buildPortraitPrompt({ name: def.name, gender: def.gender, age: def.age, outfit: def.outfit, look: def.look, persona: def.persona, tags: def.tags, style: def.style });
      if (screenImagePrompt(prompt).blocked) {
        console.log(`  ! portrait prompt blocked for ${def.name}, skipping`);
      } else {
        try {
          console.log(`  drawing portrait for ${def.name}...`);
          const gen = await generateImage(prompt);
          const imageKey = await storeImage({ scope: "characters", ownerId: charId, base64: gen.base64, mime: gen.mime });
          await db.update(characters).set({ imageKey, imageMime: gen.mime, portraitGens: 1 }).where(eq(characters.id, charId));
          console.log(`  portrait drawn for ${def.name}`);
          canonicalBase64 = gen.base64;
        } catch (e) {
          console.log(`  ! portrait failed for ${def.name}: ${e instanceof Error ? e.message : e}`);
        }
      }
    }

    // Keep portrait repair runs strictly to portrait work. In particular, do
    // not start the character-scene generation below after a slow or failed
    // portrait attempt.
    if (portraitsOnly) {
      portraitByName.set(def.name, canonicalBase64);
      continue;
    }

    if (VARIANT_PILOT.has(def.name) && !hasVariants && canDrawVariants && canonicalBase64) {
      for (const expression of ["warm", "flirty"] as const) {
        try {
          const gen = await generateExpressionVariant(canonicalBase64, expression);
          const imageKey = await storeImage({ scope: "characters", ownerId: `${charId}/${expression}`, base64: gen.base64, mime: gen.mime });
          const col = expression === "warm" ? { imageWarmKey: imageKey, imageWarmMime: gen.mime } : { imageFlirtyKey: imageKey, imageFlirtyMime: gen.mime };
          await db.update(characters).set(col).where(eq(characters.id, charId));
          console.log(`  ${expression} variant drawn for ${def.name}`);
        } catch (e) {
          console.log(`  ! ${expression} variant failed for ${def.name}: ${e instanceof Error ? e.message : e}`);
        }
      }
    }

    // Character scene art: the companion within their world, behind the profile hero.
    if (canDrawImages && (!hasScene || regenScenes) && shouldGenerateCharacterScene()) {
      const scenePrompt = buildCharacterScenePrompt({ name: def.name, gender: def.gender, look: def.look, outfit: def.outfit, backstory: def.backstory, tags: def.tags, style: def.style });
      if (screenImagePrompt(scenePrompt).blocked) {
        console.log(`  ! scene prompt blocked for ${def.name}, skipping`);
      } else {
        try {
          console.log(`  drawing scene for ${def.name}...`);
          const gen = await generateCharacterScene({ name: def.name, gender: def.gender, look: def.look, outfit: def.outfit, backstory: def.backstory, tags: def.tags, style: def.style }, canonicalBase64, canonicalBase64 ? characterImageUrl(charId) : null);
          const imageKey = await storeImage({ scope: "characters", ownerId: `${charId}/scene`, base64: gen.base64, mime: gen.mime });
          await db.update(characters).set({ sceneImageKey: imageKey, sceneImageMime: gen.mime }).where(eq(characters.id, charId));
          console.log(`  scene drawn for ${def.name}`);
        } catch (e) {
          console.log(`  ! scene failed for ${def.name}: ${e instanceof Error ? e.message : e}`);
        }
      }
    }

    portraitByName.set(def.name, canonicalBase64);
  }

  if (portraitsOnly) {
    console.log("\nPortrait-only run complete.");
    return;
  }

  for (const s of PUBLISHED_STORIES) {
    const characterId = idByName.get(s.character);
    if (!characterId) continue;

    const [existing] = await db
      .select({ id: stories.id, imageKey: stories.imageKey, content: stories.content })
      .from(stories)
      .where(and(eq(stories.characterId, characterId), eq(stories.title, s.title)))
      .limit(1);

    let storyId: string;
    let hasImage = false;
    if (existing) {
      storyId = existing.id;
      hasImage = Boolean(existing.imageKey);
      if (existing.content !== s.content) {
        const chapterCount = s.content.split(/\n{2,}·\s·\s·\n{2,}/).length;
        const chapterDates = Array.from({ length: chapterCount }, () => new Date().toISOString());
        await db.update(stories).set({ content: s.content, chapterDates }).where(eq(stories.id, storyId));
        console.log(`~ story "${s.title}" content refreshed`);
      } else {
        console.log(`= story "${s.title}" already exists`);
      }
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
          const imageKey = await storeImage({ scope: "stories", ownerId: storyId, base64: gen.base64, mime: gen.mime });
          await db.update(stories).set({ imageKey, imageMime: gen.mime }).where(eq(stories.id, storyId));
          console.log(`  background drawn for "${s.title}"`);
        } catch (e) {
          console.log(`  ! background failed for "${s.title}": ${e instanceof Error ? e.message : e}`);
        }
      }
    }

    // One scene image per chapter, placed at a turning point in the reader.
    // Gated by SCENE_IMAGES so a reseed doesn't silently generate one paid
    // image behind every chapter of every story.
    if (sceneMode !== "off" && canDrawImages) {
      const charDef = PUBLISHED_CHARACTERS.find((c) => c.name === s.character);
      const chapters = s.content.split(/\n{2,}·\s·\s·\n{2,}/).map((c) => c.trim()).filter(Boolean);
      for (let i = 0; i < chapters.length; i++) {
        if (!shouldGenerateChapterScene(i)) continue;
        const [have] = await db
          .select({ id: chapterScenes.id })
          .from(chapterScenes)
          .where(and(eq(chapterScenes.storyId, storyId), eq(chapterScenes.chapterIndex, i)))
          .limit(1);
        if (have && !regenScenes) continue;
        const prompt = buildChapterScenePrompt({ name: charDef?.name, gender: charDef?.gender, look: charDef?.look, outfit: charDef?.outfit, style: charDef?.style }, chapters[i]);
        if (screenImagePrompt(prompt).blocked) continue;
        try {
          const portraitBase64 = portraitByName.get(s.character) ?? null;
          const gen = await generateChapterScene({ name: charDef?.name, gender: charDef?.gender, look: charDef?.look, outfit: charDef?.outfit, style: charDef?.style }, chapters[i], portraitBase64, portraitBase64 ? characterImageUrl(characterId) : null);
          // Replace the cached row when regenerating (unique on storyId+chapterIndex).
          if (have) await db.delete(chapterScenes).where(eq(chapterScenes.id, have.id));
          const imageKey = await storeImage({ scope: "chapters", ownerId: `${storyId}/${i}`, base64: gen.base64, mime: gen.mime });
          await db.insert(chapterScenes).values({ storyId, chapterIndex: i, imageKey, imageMime: gen.mime });
          console.log(`  chapter ${i + 1} scene drawn for "${s.title}"`);
        } catch (e) {
          console.log(`  ! chapter ${i + 1} scene failed for "${s.title}": ${e instanceof Error ? e.message : e}`);
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
