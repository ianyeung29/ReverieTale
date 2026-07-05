import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reverie - Phase 0",
  description: "AI companion with persistent memory (Phase 0 foundation).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#150F1A",
          color: "#F4EAF0",
        }}
      >
        {children}
      </body>
    </html>
  );
}
