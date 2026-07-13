// Postgres error 42P01 = undefined_table. We deliberately let several optional,
// migration-gated features (ratings, bookmarks, blocks, reports, image columns)
// degrade gracefully when their table/column doesn't exist yet, so a pending
// migration never breaks the surrounding page. But swallowing EVERY error the
// same way would also hide real failures - a genuinely broken trust/safety
// check (blocks, reports) failing silently in production is worse than a
// missing-table hiccup during rollout. Callers should use this to silence only
// the expected case and log anything else.
export function isMissingRelation(e: unknown): boolean {
  const err = e as { cause?: { code?: string }; code?: string } | undefined;
  return err?.cause?.code === "42P01" || err?.code === "42P01";
}

// Logs anything that ISN'T the expected missing-table case, so ops can tell a
// pending migration apart from a real, silently-failing check.
export function logUnlessMissingRelation(context: string, e: unknown): void {
  if (!isMissingRelation(e)) {
    console.error(`[${context}] unexpected error:`, e instanceof Error ? e.message : e);
  }
}
