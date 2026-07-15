import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse companions",
  description: "Explore 13+ interactive fiction companions across mystery, fantasy, sci-fi, music, gaming, comedy, and adventure.",
  alternates: { canonical: "/browse" },
  openGraph: { title: "Browse companions | ReverieTale", description: "Open a short story, then decide what happens next.", url: "/browse" },
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
