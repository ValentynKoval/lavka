#!/usr/bin/env node
/**
 * Applies supabase/migrations/*.sql in order to the project's Postgres database.
 * Uses the Supabase session pooler (IPv4-friendly) and tracks applied files in
 * public.schema_migrations so it is safe to re-run.
 *
 *   node --env-file=.env.local scripts/migrate.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD. Optionally
 * SUPABASE_DB_URL to override the connection string entirely.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "supabase/migrations");

function connectionString() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!url || !password) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD (or SUPABASE_DB_URL) in .env.local");
    process.exit(1);
  }
  const ref = new URL(url).hostname.split(".")[0];
  const region = process.env.SUPABASE_DB_REGION ?? "eu-central-1";
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
}

const client = new pg.Client({ connectionString: connectionString(), ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query("create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())");
  const { rows } = await client.query("select name from public.schema_migrations");
  const applied = new Set(rows.map((r) => r.name));
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`– ${file} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(dir, file), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public.schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`✓ ${file}`);
    } catch (e) {
      await client.query("rollback");
      console.error(`✗ ${file}`);
      throw e;
    }
  }
  console.log("Migrations up to date.");
} finally {
  await client.end();
}
