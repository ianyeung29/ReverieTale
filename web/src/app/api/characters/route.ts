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
    const def = (r.definition ?? {}) as Record<string, string>;
    return { id: r.id, name: def.name ?? "Unknown", tagline: def.backstory ?? "" };
  });
  return NextResponse.json(list);
}
