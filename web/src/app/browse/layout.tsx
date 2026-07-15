import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse companions",
  description: "Browse AI companions to chat and write interactive stories with. Filter by mood, personality, and genre — romance, slice-of-life, and more.",
  openGraph: { title: "Browse companions · ReverieTale", description: "Find an AI companion to chat and write stories with." },
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
