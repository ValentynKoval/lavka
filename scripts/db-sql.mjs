#!/usr/bin/env node
/**
 * Runs a single SQL statement against the project database (same connection rules as migrate.mjs).
 *
 *   node --env-file=.env.local scripts/db-sql.mjs "select count(*) from public.orders"
 */
import pg from "pg";

const sql = process.argv.slice(2).join(" ").trim();
if (!sql) {
  console.error("Usage: node --env-file=.env.local scripts/db-sql.mjs \"<sql>\"");
  process.exit(1);
}

function connectionStrings() {
  if (process.env.SUPABASE_DB_URL) return [process.env.SUPABASE_DB_URL];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!url || !password) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD (or SUPABASE_DB_URL) in .env.local");
    process.exit(1);
  }
  const ref = new URL(url).hostname.split(".")[0];
  const region = process.env.SUPABASE_DB_REGION ?? "eu-central-1";
  return ["aws-1", "aws-0"].map((prefix) => `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${prefix}-${region}.pooler.supabase.com:5432/postgres`);
}

let client;
let lastError;
for (const connectionString of connectionStrings()) {
  const candidate = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10_000 });
  try {
    await candidate.connect();
    client = candidate;
    break;
  } catch (e) {
    lastError = e;
  }
}
if (!client) throw lastError;
try {
  const result = await client.query(sql);
  console.table(result.rows);
} finally {
  await client.end();
}
