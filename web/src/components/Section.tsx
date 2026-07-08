// Collapsible content block. `open` is a static per-call value (never derived
// from state that changes independently), so React never re-forces it after
// the user's own click toggles the native <details> - the chevron rotation
// lives in a real CSS rule ([open] attribute selector, see layout.tsx) since
// that can't be expressed through an inline style at all.
export function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details className="rv-section" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="rv-section-body">{children}</div>
    </details>
  );
}
