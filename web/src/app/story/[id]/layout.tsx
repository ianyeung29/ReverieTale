import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

// The reader itself is a client component, so its per-story SEO metadata lives
// here in a server layout (title, description from the opening prose, and the
// companion's portrait as the social share image).
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const [row] = await db
      .select({ title: stories.title, content: stories.content, characterId: stories.characterId, isPublic: stories.isPublic, createdAt: stories.createdAt, definition: characters.definition, characterStatus: characters.status })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(eq(stories.id, id))
      .limit(1);
    if (!row) return { title: "Story", robots: { index: false, follow: false } };
    const name = ((row.definition ?? {}) as Record<string, unknown>).name as string | undefined;
    const title = `${row.title}${name ? ` — with ${name}` : ""}`;
    const description = row.content.replace(/\s+/g, " ").slice(0, 155);
    return {
      title,
      description,
      alternates: { canonical: `/story/${id}` },
      robots: row.isPublic && row.characterStatus === "published" ? undefined : { index: false, follow: false },
      openGraph: { title, description, type: "article", url: `/story/${id}`, images: [`/api/characters/${row.characterId}/image`] },
      twitter: { card: "summary_large_image", title, description, images: [`/api/characters/${row.characterId}/image`] },
    };
  } catch {
    return { title: "Story" };
  }
}

export default async function StoryLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [row] = await db
      .select({ title: stories.title, content: stories.content, characterId: stories.characterId, isPublic: stories.isPublic, createdAt: stories.createdAt, definition: characters.definition, characterStatus: characters.status })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(eq(stories.id, id))
      .limit(1);
    if (!row || !row.isPublic || row.characterStatus !== "published") return children;
    const name = ((row.definition ?? {}) as Record<string, unknown>).name as string | undefined;
    const description = row.content.replace(/\s+/g, " ").slice(0, 155);
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: row.title,
            description,
            datePublished: row.createdAt.toISOString(),
            url: absoluteUrl(`/story/${id}`),
            image: [absoluteUrl(`/api/characters/${row.characterId}/image`)],
            author: { "@type": "Organization", name: "ReverieTale" },
            about: name ? { "@type": "Person", name } : undefined,
          }}
        />
        {children}
      </>
    );
  } catch {
    return children;
  }
}
