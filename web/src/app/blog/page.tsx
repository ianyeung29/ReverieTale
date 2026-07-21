import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes on interactive fiction, companion-driven stories, and thoughtful creative moments on ReverieTale.",
  alternates: { canonical: "/blog" },
};

const posts = [
  { href: "/blog/start-an-interactive-story", title: "How to Start an Interactive Story You Actually Want to Finish", intro: "A simple way to choose a character, enter a strong opening moment, and keep the story moving." },
  { href: "/blog/creative-photo-moments", title: "Creative Photo Moments: What an Unlock Means", intro: "How companion photo moments work, what credits unlock, and why each reveal is presented clearly." },
];

export default function BlogIndex() {
  return <main style={S.wrap}><p style={S.eyebrow}>ReverieTale journal</p><h1 style={S.title}>Stories worth stepping into.</h1><p style={S.copy}>Practical notes for people who like characters, scenes, and conversations with somewhere to go.</p><div style={S.list}>{posts.map((post) => <article key={post.href} style={S.post}><h2 style={S.postTitle}><a href={post.href} style={S.postLink}>{post.title}</a></h2><p style={S.postCopy}>{post.intro}</p><a href={post.href} style={S.read}>Read article</a></article>)}</div></main>;
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 820, margin: "0 auto", padding: "58px 24px 88px" }, eyebrow: { color: "#E9A06B", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", margin: 0 }, title: { color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 45, lineHeight: 1.08, margin: "9px 0 12px" }, copy: { color: "#CBBBD0", fontSize: 17, lineHeight: 1.6, maxWidth: 600, margin: 0 }, list: { marginTop: 36, display: "grid", gap: 16 }, post: { padding: "24px", border: "1px solid #3A2E44", borderRadius: 12, background: "#211827" }, postTitle: { fontFamily: "Georgia, serif", fontSize: 25, lineHeight: 1.2, margin: 0 }, postLink: { color: "#F4EAF0", textDecoration: "none" }, postCopy: { color: "#CBBBD0", lineHeight: 1.55, margin: "10px 0 16px" }, read: { color: "#E9A06B", fontSize: 13.5, fontWeight: 700, textDecoration: "none" },
};
