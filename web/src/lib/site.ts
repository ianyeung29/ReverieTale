export const SITE_URL = (process.env.APP_URL || "https://reverie-tale.vercel.app").replace(/\/$/, "");

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
