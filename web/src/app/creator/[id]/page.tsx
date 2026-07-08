import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { listCharacters } from "@/lib/discovery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const [u] = await db.select({ dn: users.displayName }).from(users).where(eq(users.id, id)).limit(1);
    const name = u?.dn?.trim() || "Creator";
    return { title: `${name} · Reverie`, description: `Companions by ${name} on Reverie.` };
  } catch {
    return { title: "Creator · Reverie" };
  }
}

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let name = "Anonymous creator";
  let chars: Awaited<ReturnType<typeof listCharacters>> = [];
  try {
    const [u] = await db.select({ dn: users.displayName }).from(users).where(eq(users.id, id)).limit(1);
    if (u) name = u.dn?.trim() || "Anonymous creator";
    chars = await listCharacters({ creatorId: id });
  } catch {
    /* fall through to empty state */
  }

  const totalReads = chars.reduce((s, c) => s + c.reads, 0);

  if (chars.length === 0) {
    return (
      <main style={S.wrap}>
        <a href="/browse" style={S.back}>← Companions</a>
        <h1 style={S.h1}>{name}</h1>
        <p style={{ color: "#AC9CB0", marginTop: 12 }}>No published companions yet. <a href="/browse" style={S.link}>Browse others →</a></p>
      </main>
    );
  }

  return (
    <main style={S.wrap}>
      <a href="/browse" style={S.back}>← Companions</a>
      <p style={S.eyebrow}>Creator</p>
      <h1 style={S.h1}>{name}</h1>
      <p style={S.sub}>{chars.length} companion{chars.length === 1 ? "" : "s"} · {totalReads} total read{totalReads === 1 ? "" : "s"}</p>

      <div style={S.grid}>
        {chars.map((c) => (
          <a key={c.id} href={`/c/${c.id}`} className="rv-card" style={S.card}>
            <div style={S.head}><CharacterAvatar characterId={c.id} name={c.name} size={44} /><div style={S.name}>{c.name}</div></div>
            {c.persona ? <p style={S.persona}>{c.persona}</p> : null}
            {c.tags.length ? <div style={S.tags}>{c.tags.slice(0, 4).map((t) => <span key={t} style={S.tag}>{t}</span>)}</div> : null}
            <span style={S.meta}>{c.reads} read{c.reads === 1 ? "" : "s"} · {c.stories} stor{c.stories === 1 ? "y" : "ies"}</span>
          </a>
        ))}
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 900, margin: "0 auto", padding: "40px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: "22px 0 0" },
  h1: { fontFamily: "Georgia, serif", fontSize: 40, margin: "8px 0 6px" },
  sub: { color: "#AC9CB0", margin: "0 0 28px", fontSize: 14.5, fontVariantNumeric: "tabular-nums" },
  link: { color: "#E9A06B" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 15 },
  card: { display: "flex", flexDirection: "column", gap: 9, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 16, textDecoration: "none", color: "#F4EAF0" },
  head: { display: "flex", alignItems: "center", gap: 11 },
  name: { fontFamily: "Georgia, serif", fontSize: 19, lineHeight: 1.1 },
  persona: { color: "#AC9CB0", fontSize: 13.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11.5, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  meta: { color: "#8A7A90", fontSize: 12, marginTop: "auto", fontVariantNumeric: "tabular-nums" },
};
