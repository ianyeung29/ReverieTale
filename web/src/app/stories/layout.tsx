import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories",
  description: "Read interactive stories with AI companions — pick up any chapter, steer what happens next, and stay to chat with a character who remembers it all.",
  alternates: { canonical: "/stories" },
  openGraph: { title: "Stories · ReverieTale", description: "Read and continue interactive stories with AI companions.", url: "/stories" },
};

export default function StoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
