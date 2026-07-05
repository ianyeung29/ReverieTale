import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Lightweight readiness check: reports which integrations are configured,
// without exposing any secret values. Verifies DB connectivity if configured.
export async function GET() {
  const configured = {
    database: Boolean(process.env.DATABASE_URL),
    model_provider: process.env.MODEL_PROVIDER || "deepseek",
    model_key:
      (process.env.MODEL_PROVIDER || "deepseek") === "grok"
        ? Boolean(process.env.XAI_API_KEY)
        : Boolean(process.env.DEEPSEEK_API_KEY),
    embeddings: Boolean(process.env.EMBEDDINGS_API_KEY),
    redis: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    payment_provider: process.env.PAYMENT_PROVIDER || "stub",
    age_verify_provider: process.env.AGE_VERIFY_PROVIDER || "attest",
  };

  let dbOk: boolean | null = null;
  if (configured.database) {
    try {
      const { db } = await import("@/db");
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`select 1`);
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  return NextResponse.json({ ok: true, dbOk, configured });
}
