import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, companionPosts } from "@/db/schema";
import { characterImageUrl, generateMomentImage } from "@/lib/image";
import { mediaStorageConfigured, readImageBase64, storeImage } from "@/lib/media";
import { screenImagePrompt } from "@/lib/moderation";

type Definition = {
  name?: string;
  gender?: string;
  look?: string;
  outfit?: string;
  persona?: string;
  backstory?: string;
  tags?: string[];
  style?: string;
};

type MomentIdea = { scene: string; caption: string };

export function companionPhotoRevealPrice(): number {
  return Math.max(1, Number(process.env.COMPANION_PHOTO_REVEAL_PRICE || 5));
}

function normalizedTags(tags?: string[]): string[] {
  return (tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean);
}

function ideaFor(definition: Definition): MomentIdea {
  const name = definition.name?.trim() || "Your companion";
  const tags = normalizedTags(definition.tags);
  const backstory = definition.backstory?.replace(/\s+/g, " ").trim().slice(0, 180) || "their everyday world";

  if (tags.some((tag) => /music|singer|k-pop|podcast|artist/.test(tag))) {
    return {
      scene: `${name} takes a quiet break in a creative studio after rehearsal, adjusting headphones beside a notebook full of ideas, warm practical lights and an active creative workspace around them.`,
      caption: "I caught a small quiet moment between ideas. What would you put on the playlist?",
    };
  }
  if (tags.some((tag) => /sport|dance|cheer|gaming/.test(tag))) {
    return {
      scene: `${name} winds down after practice in a bright community space, carrying a water bottle and laughing at an encouraging message on a phone, friends and activity softly out of focus nearby.`,
      caption: "Practice ran long, but I think it was worth it. How did your day go?",
    };
  }
  if (tags.some((tag) => /fantasy|angel|mermaid|supernatural|adventure|mystery/.test(tag))) {
    return {
      scene: `${name} pauses in a vivid story-world location connected to ${backstory}, noticing a small clue or glimmer in the environment, cinematic wide composition with a sense of wonder.`,
      caption: "I found something strange on my way home. Want to help me figure it out?",
    };
  }
  return {
    scene: `${name} has a candid, safe day-in-the-life moment in a place connected to ${backstory}, enjoying a small pause and looking toward the viewer as if about to share what happened.`,
    caption: "A small moment from my day. I was hoping you would be around to hear about it.",
  };
}

export async function publishCompanionPost(characterId: string, automated = false) {
  if (!mediaStorageConfigured()) throw new Error("Cloudflare R2 media storage is not configured");

  const [character] = await db
    .select({ id: characters.id, definition: characters.definition, portraitKey: characters.imageKey })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);
  if (!character) throw new Error("companion not found");
  if (!character.portraitKey) throw new Error("Generate the companion portrait first");

  const definition = ((character.definition ?? {}) as Definition);
  const idea = ideaFor(definition);
  if (screenImagePrompt(idea.scene).blocked) throw new Error("moment prompt was blocked by safety screening");

  const portrait = await readImageBase64(character.portraitKey);
  if (!portrait) throw new Error("Could not read the companion portrait");
  const image = await generateMomentImage(definition, idea.scene, portrait, characterImageUrl(character.id));
  const imageKey = await storeImage({ scope: "companion-posts", ownerId: character.id, base64: image.base64, mime: image.mime });
  const [post] = await db.insert(companionPosts).values({
    characterId: character.id,
    caption: idea.caption,
    scene: idea.scene,
    imageKey,
    imageMime: image.mime,
    isLocked: true,
    revealPrice: companionPhotoRevealPrice(),
    automated,
  }).returning({ id: companionPosts.id, postedAt: companionPosts.postedAt });
  return post;
}

export async function nextCompanionForDailyPost(): Promise<string | null> {
  const candidates = await db
    .select({ id: characters.id, portraitKey: characters.imageKey })
    .from(characters)
    .where(eq(characters.status, "published"))
    .orderBy(asc(characters.createdAt));
  const available = candidates.filter((character) => Boolean(character.portraitKey));
  if (!available.length) return null;

  const latest = await db
    .select({ characterId: companionPosts.characterId, postedAt: companionPosts.postedAt })
    .from(companionPosts)
    .orderBy(desc(companionPosts.postedAt));
  const latestByCharacter = new Map<string, Date>();
  for (const row of latest) if (!latestByCharacter.has(row.characterId)) latestByCharacter.set(row.characterId, row.postedAt);

  return available
    .slice()
    .sort((a, b) => (latestByCharacter.get(a.id)?.getTime() ?? 0) - (latestByCharacter.get(b.id)?.getTime() ?? 0))[0]?.id ?? null;
}
