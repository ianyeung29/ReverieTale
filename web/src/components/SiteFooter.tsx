const FOOTER_LINKS = [
  { href: "/browse", label: "Companions" },
  { href: "/stories", label: "Stories" },
  { href: "/create", label: "Create" },
  { href: "/credits", label: "Credits" },
  { href: "/feedback", label: "Feedback" },
  { href: "/guidelines", label: "Guidelines" },
  { href: "/legal", label: "Legal" },
];

export function SiteFooter() {
  return (
    <footer className="rv-site-footer">
      <span>ReverieTale · interactive fiction</span>
      <nav className="rv-site-footer-links" aria-label="Footer navigation">
        {FOOTER_LINKS.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>
    </footer>
  );
}
