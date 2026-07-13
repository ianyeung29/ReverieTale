import type { MetadataRoute } from "next";

const SITE_URL = (process.env.APP_URL || "https://reverie-brown.vercel.app").replace(/\/$/, "");

// Let crawlers index the public discovery surface (home, companions, stories,
// tags, legal) but keep private/authed and API routes out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/chat",
        "/credits",
        "/profile",
        "/library",
        "/create",
        "/verify-email",
        "/reset-password",
        "/forgot-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
