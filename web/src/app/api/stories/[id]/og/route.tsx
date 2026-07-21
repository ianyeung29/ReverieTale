import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const size = { width: 1200, height: 630 };

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [story] = await db
    .select({ title: stories.title, content: stories.content, definition: characters.definition })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.id, id))
    .limit(1);
  const definition = (story?.definition ?? {}) as Record<string, unknown>;
  const name = typeof definition.name === "string" ? definition.name : "a companion";
  const excerpt = (story?.content ?? "A new interactive story is waiting.").replace(/\s+/g, " ").trim().slice(0, 210);
  return new ImageResponse(
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "70px 76px", color: "#F7EDF2", background: "linear-gradient(125deg, #160F1B 8%, #332040 55%, #612D4E 115%)" }}>
      <div style={{ display: "flex", color: "#F0A773", fontSize: 25, letterSpacing: 6, textTransform: "uppercase" }}>ReverieTale · Interactive story</div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
        <div style={{ display: "flex", fontFamily: "serif", fontSize: 74, lineHeight: 1.05, fontWeight: 700 }}>{story?.title ?? "A story to enter"}</div>
        <div style={{ display: "flex", marginTop: 22, color: "#E8CDD9", fontSize: 31, lineHeight: 1.35 }}>with {name}</div>
        <div style={{ display: "flex", marginTop: 34, color: "#D1BCD0", fontSize: 26, lineHeight: 1.45 }}>{excerpt}</div>
      </div>
      <div style={{ display: "flex", color: "#E9A06B", fontSize: 24 }}>Read the opening. Decide what happens next.</div>
    </div>,
    size,
  );
}
