import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");

// One shared connection pool. `prepare: false` keeps it compatible with
// Supabase/pgBouncer transaction-mode pooling used on serverless.
const client = postgres(url, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
