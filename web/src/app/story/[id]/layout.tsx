import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";

// The reader itself is a client component, so its per-story SEO metadata lives
// here in a server layout (title, description from the opening prose, and the
// companion's portrait as the social share image).
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const [row] = await db
      .select({ title: stories.title, content: stories.content, characterId: stories.characterId, isPublic: stories.isPublic, definition: characters.definition })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(eq(stories.id, id))
      .limit(1);
    if (!row) return { title: "Story" };
    const name = ((row.definition ?? {}) as Record<string, unknown>).name as string | undefined;
    const title = `${row.title}${name ? ` — with ${name}` : ""}`;
    const description = row.content.replace(/\s+/g, " ").slice(0, 155);
    return {
      title,
      description,
      robots: row.isPublic ? undefined : { index: false },
      openGraph: { title, description, type: "article", images: [`/api/characters/${row.characterId}/image`] },
      twitter: { card: "summary_large_image", title, description, images: [`/api/characters/${row.characterId}/image`] },
    };
  } catch {
    return { title: "Story" };
  }
}

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
