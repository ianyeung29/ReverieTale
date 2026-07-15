import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse companions",
  description: "Explore 13+ interactive fiction companions across mystery, fantasy, sci-fi, music, gaming, comedy, and adventure.",
  openGraph: { title: "Browse companions | ReverieTale", description: "Open a short story, then decide what happens next." },
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
