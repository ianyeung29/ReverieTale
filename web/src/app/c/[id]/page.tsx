import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { Avatar } from "@/components/Avatar";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

function chapterCount(content: string): number {
  const n = content.split(/\n{2,}·\s·\s·\n{2,}/).map((s) => s.trim()).filter(Boolean).length;
  return Math.max(1, n);
}

type Profile = {
  id: string;
  name: string;
  look: string;
  persona: string;
  backstory: string;
  tags: string[];
  isOwner: boolean;
  stories: { id: string; title: string; snippet: string; chapters: number }[];
};

async function loadProfile(id: string): Promise<Profile | null> {
  try {
    const [char] = await db
      .select({ id: characters.id, definition: characters.definition, status: characters.status, creatorId: characters.creatorId })
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);
    if (!char) return null;

    const userId = await getCurrentUserId();
    const isOwner = Boolean(char.creatorId && userId && char.creatorId === userId);
    // Unpublished companions are only visible to their creator.
    if (char.status !== "published" && !isOwner) return null;

    const def = (char.definition ?? {}) as Record<string, unknown>;
    const rows = await db
      .select({ id: stories.id, title: stories.title, content: stories.content })
      .from(stories)
      .where(and(eq(stories.characterId, id), eq(stories.isPublic, true)))
      .orderBy(desc(stories.createdAt))
      .limit(24);

    return {
      id: char.id,
      name: (def.name as string) ?? "Unknown",
      look: (def.look as string) ?? "",
      persona: (def.persona as string) ?? "",
      backstory: (def.backstory as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      isOwner,
      stories: rows.map((r) => ({
        id: r.id,
        title: r.title,
        snippet: r.content.replace(/\s+/g, " ").slice(0, 140),
        chapters: chapterCount(r.content),
      })),
    };
  } catch {
    return null;
  }
}

export default async function CharacterProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await loadProfile(id);

  if (!p) {
    return (
      <main style={S.wrap}>
        <a href="/browse" style={S.back}>← Companions</a>
        <p style={{ color: "#AC9CB0", marginTop: 24 }}>This companion isn&apos;t available. <a href="/browse" style={S.link}>Browse others →</a></p>
      </main>
    );
  }

  return (
    <main style={S.wrap}>
      <a href="/browse" style={S.back}>← Companions</a>

      <div style={S.head}>
        <Avatar name={p.name} size={72} />
        <div style={S.headText}>
          <h1 style={S.name}>{p.name}</h1>
          {p.look ? <p style={S.look}>{p.look}</p> : null}
          {p.tags.length ? <div style={S.tags}>{p.tags.map((t) => <span key={t} style={S.tag}>{t}</span>)}</div> : null}
        </div>
      </div>

      <div style={S.cta}>
        <a href={`/story?characterId=${p.id}`} style={S.primary}>Begin a story with {p.name} →</a>
        <a href={`/chat?characterId=${p.id}`} style={S.secondary}>Chat</a>
        {p.isOwner ? <a href={`/create?id=${p.id}`} style={S.secondary}>Edit</a> : null}
      </div>

      {p.persona ? (<><p style={S.section}>About</p><p style={S.body}>{p.persona}</p></>) : null}
      {p.backstory ? (<><p style={S.section}>Backstory</p><p style={S.body}>{p.backstory}</p></>) : null}

      <p style={S.section}>Stories with {p.name}{p.stories.length ? ` · ${p.stories.length}` : ""}</p>
      {p.stories.length === 0 ? (
        <p style={S.muted}>No stories yet. <a href={`/story?characterId=${p.id}`} style={S.link}>Write the first →</a></p>
      ) : (
        <div style={S.grid}>
          {p.stories.map((s) => (
            <a key={s.id} href={`/story/${s.id}`} style={S.card}>
              <div style={S.cardTitle}>{s.title}</div>
              <p style={S.cardSnip}>{s.snippet}…</p>
              <span style={S.cardMeta}>{s.chapters} chapter{s.chapters === 1 ? "" : "s"}</span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 760, margin: "0 auto", padding: "36px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  link: { color: "#E9A06B" },
  head: { display: "flex", alignItems: "center", gap: 18, margin: "24px 0 20px" },
  headText: { display: "flex", flexDirection: "column", gap: 8 },
  name: { fontFamily: "Georgia, serif", fontSize: 36, margin: 0, lineHeight: 1.1 },
  look: { color: "#AC9CB0", margin: 0, fontSize: 14.5 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11.5, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  cta: { display: "flex", flexWrap: "wrap", gap: 10, margin: "0 0 30px" },
  primary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "12px 20px", borderRadius: 11, fontWeight: 650, textDecoration: "none", fontSize: 15 },
  secondary: { color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "12px 18px", borderRadius: 11, fontWeight: 600, textDecoration: "none", fontSize: 15 },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "28px 0 12px" },
  body: { color: "#EadFe6", fontSize: 15.5, margin: 0, whiteSpace: "pre-wrap" },
  muted: { color: "#AC9CB0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 },
  card: { display: "flex", flexDirection: "column", gap: 8, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: 16, textDecoration: "none", color: "#F4EAF0" },
  cardTitle: { fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.2 },
  cardSnip: { color: "#AC9CB0", fontSize: 13.5, margin: 0, lineHeight: 1.5 },
  cardMeta: { color: "#8A7A90", fontSize: 12, marginTop: "auto" },
};
