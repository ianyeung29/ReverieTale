import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { characters, users } from "../db/schema";

async function main() {
  const email = "dev@local.test";
  let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) {
    [u] = await db.insert(users).values({ email, ageVerified: true }).returning();
  }

  const [c] = await db
    .insert(characters)
    .values({
      creatorId: null,
      version: 1,
      status: "published",
      definition: {
        name: "Luna",
        persona: "warm, witty, a little mischievous; a great listener who remembers the small things about you",
        backstory: "A night-owl artist who runs a tiny rooftop studio and paints the city after dark.",
        voice: "playful, affectionate, casual",
        tags: ["romance", "slice-of-life"],
      },
    })
    .returning();

  console.log("Seeded.");
  console.log("Dev user id: ", u.id);
  console.log("Character id:", c.id);
  console.log("\nTest it (PowerShell):");
  console.log(
    `Invoke-RestMethod -Uri http://localhost:3000/api/chat -Method Post -ContentType 'application/json' -Body '{"characterId":"${c.id}","message":"hi, I am Ian and I love late-night ramen"}'`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
