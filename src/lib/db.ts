import "server-only";

import { neon } from "@neondatabase/serverless";

let sql: ReturnType<typeof neon> | undefined;

export function getSql() {
  if (sql) return sql;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  sql = neon(databaseUrl);
  return sql;
}
