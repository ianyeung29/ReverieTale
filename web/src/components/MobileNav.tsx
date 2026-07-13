"use client";

import { usePathname } from "next/navigation";

// Fixed bottom navigation, mobile only (hidden on desktop via CSS, where the
// top nav stays the primary navigation). Create is the raised central action,
// so starting something new is always a thumb-reach away.
const ITEMS = [
  { href: "/", label: "Discover", icon: "🧭" },
  { href: "/stories", label: "Stories", icon: "📖" },
  { href: "/create", label: "Create", icon: "✦", center: true },
  { href: "/chat", label: "Chats", icon: "💬" },
  { href: "/library", label: "Library", icon: "❤" },
];

export function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="rv-mobilenav" aria-label="Primary">
      {ITEMS.map((it) =>
        it.center ? (
          <a key={it.href} href={it.href} className="rv-mobilenav-center" aria-label={it.label}>
            <span className="rv-mobilenav-center-btn" aria-hidden>{it.icon}</span>
            <span className="rv-mobilenav-center-label">{it.label}</span>
          </a>
        ) : (
          <a key={it.href} href={it.href} className={`rv-mobilenav-item${isActive(it.href) ? " rv-mobilenav-on" : ""}`}>
            <span className="rv-mobilenav-icon" aria-hidden>{it.icon}</span>
            <span>{it.label}</span>
          </a>
        ),
      )}
    </nav>
  );
}
