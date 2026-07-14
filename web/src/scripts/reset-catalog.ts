import { sql } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

if (process.env.CONFIRM_CATALOG_RESET !== "RESET_REVERIE_CATALOG") {
  console.error("Refusing to reset. Set CONFIRM_CATALOG_RESET=RESET_REVERIE_CATALOG to continue.");
  process.exit(1);
}

async function main() {
  const { db } = await import("../db");
  // Keep user accounts and financial records. This clears the current creative
  // catalogue and related reader activity before reseeding R2-backed media.
  await db.execute(sql.raw(`
    TRUNCATE TABLE
      chapter_scenes,
      bookmarks,
      ratings,
      reports,
      character_blocks,
      moments,
      messages,
      threads,
      stories,
      characters
    RESTART IDENTITY CASCADE;
  `));
  console.log("Catalogue cleared. Run npm run db:seed after R2 is configured.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
