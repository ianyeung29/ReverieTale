import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";

const SITE_URL = (process.env.APP_URL || "https://reverie-brown.vercel.app").replace(/\/$/, "");

// Regenerate at most hourly so crawlers get fresh companions/stories without a
// DB hit on every request.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/browse`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/stories`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/guidelines`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/legal`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [chars, strs] = await Promise.all([
      db.select({ id: characters.id, updatedAt: characters.updatedAt }).from(characters).where(eq(characters.status, "published")),
      db.select({ id: stories.id, createdAt: stories.createdAt }).from(stories).where(eq(stories.isPublic, true)),
    ]);
    return [
      ...staticPaths,
      ...chars.map((c): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}/c/${c.id}`, lastModified: c.updatedAt ?? undefined, changeFrequency: "weekly", priority: 0.7 })),
      ...strs.map((s): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}/story/${s.id}`, lastModified: s.createdAt ?? undefined, changeFrequency: "monthly", priority: 0.5 })),
    ];
  } catch {
    // DB unreachable -> still serve the static paths so the sitemap isn't empty.
    return staticPaths;
  }
}
