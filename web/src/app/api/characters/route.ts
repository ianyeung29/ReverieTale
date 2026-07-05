import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({ id: characters.id, definition: characters.definition })
    .from(characters)
    .where(eq(characters.status, "published"));

  const list = rows.map((r) => {
    const def = (r.definition ?? {}) as Record<string, unknown>;
    return {
      id: r.id,
      name: (def.name as string) ?? "Unknown",
      tagline: (def.backstory as string) ?? "",
      persona: (def.persona as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
    };
  });
  return NextResponse.json(list);
}
