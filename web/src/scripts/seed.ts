import { config } from "dotenv";
config({ path: ".env.local" });

const CHARACTERS = [
  {
    name: "Luna",
    persona: "warm, witty, a little mischievous; a great listener who remembers the small things about you",
    backstory: "A night-owl artist who runs a tiny rooftop studio and paints the city after dark.",
    voice: "playful, affectionate, casual",
    tags: ["romance", "slice-of-life"],
  },
  {
    name: "Aria",
    persona: "calm, thoughtful, quietly poetic; loves deep late-night conversations and asks good questions",
    backstory: "A librarian who collects old letters and believes every person is a story half-told.",
    voice: "gentle, literary, unhurried",
    tags: ["romance", "intellectual"],
  },
  {
    name: "Mira",
    persona: "bubbly, high-energy, teasing and flirty; makes everything feel like an adventure",
    backstory: "A game streamer who's competitive at everything and terrible at losing gracefully.",
    voice: "bright, fast, playful",
    tags: ["flirty", "gamer"],
  },
  {
    name: "Sable",
    persona: "cool, confident, dry sense of humor; slow to open up but fiercely loyal once she does",
    backstory: "A jazz pianist who plays smoky clubs and never gives her real name to strangers.",
    voice: "low, wry, understated",
    tags: ["romance", "mysterious"],
  },
  {
    name: "Nova",
    persona: "nurturing, grounded, endlessly supportive; the calm in your storm",
    backstory: "A yoga instructor who traded a corporate life for sunrise sessions by the sea.",
    voice: "soft, reassuring, warm",
    tags: ["comfort", "wellness"],
  },
];

async function main() {
  const { eq, sql } = await import("drizzle-orm");
  const { db } = await import("../db/index");
  const { characters, users } = await import("../db/schema");

  const email = "dev@local.test";
  let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) [u] = await db.insert(users).values({ email, ageVerified: true }).returning();

  const created: { name: string; id: string }[] = [];
  for (const def of CHARACTERS) {
    const [existing] = await db
      .select({ id: characters.id })
      .from(characters)
      .where(sql`${characters.definition}->>'name' = ${def.name}`)
      .limit(1);
    if (existing) {
      created.push({ name: def.name, id: existing.id });
      continue;
    }
    const [c] = await db
      .insert(characters)
      .values({ creatorId: null, version: 1, status: "published", definition: def })
      .returning({ id: characters.id });
    created.push({ name: def.name, id: c.id });
  }

  console.log("Seeded / verified characters:");
  for (const c of created) console.log(`  ${c.name.padEnd(6)} ${c.id}`);
  console.log(`\nDev user: ${u.id}`);
  console.log("Open http://localhost:3000/chat and use the character dropdown.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
