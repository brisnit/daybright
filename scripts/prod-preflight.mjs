// Read-only launch check for a Production environment file. Changes nothing.
// Usage:
//   vercel env pull .env.production.local --environment=production
//   node --env-file=.env.production.local scripts/prod-preflight.mjs
//   rm .env.production.local
// Exit code 1 if any check fails. See docs/PRODUCTION_SETUP.md.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { MIGRATIONS } from "../src/lib/lead-schema.mjs";
import { charterSeats } from "./charter-seats.mjs";

const env = process.env;
const results = [];
const check = (ok, label, detail = "") => results.push({ ok, label, detail });
const warn = (label, detail = "") => results.push({ ok: "warn", label, detail });

// Host of the Preview/Development database, from .env.local, so Production can't silently share it.
let previewHost = "";
try {
  const local = readFileSync(new URL("../.env.local", import.meta.url), "utf8").match(/^DATABASE_URL="?([^"\n]+)"?/m)?.[1];
  if (local) previewHost = new URL(local).hostname;
} catch {
  /* no .env.local: skip the comparison */
}

const url = env.DATABASE_URL;
check(Boolean(url), "DATABASE_URL is set");
const host = url ? new URL(url).hostname : "";
if (url) check(!previewHost || host !== previewHost, "Database is not the Preview/Development database", host);

check(!env.LEAD_TEST_FAULTS, "LEAD_TEST_FAULTS is not set");
check((env.LEAD_IP_HASH_SECRET ?? "").length >= 32, "LEAD_IP_HASH_SECRET is set (32+ characters)");

const resend = [env.RESEND_API_KEY, env.LEAD_NOTIFY_FROM, env.LEAD_NOTIFY_TO].filter(Boolean).length;
check(resend === 0 || resend === 3, "Resend variables are all set or all unset", `${resend} of 3 set`);
if (resend === 3) {
  check(/@daybright\.store>?$/i.test(env.LEAD_NOTIFY_FROM.trim()), "LEAD_NOTIFY_FROM uses the verified daybright.store domain", env.LEAD_NOTIFY_FROM);
} else if (resend === 0) {
  warn("Lead alert emails are off", "nobody is notified of new leads");
}

const turnstile = [env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, env.TURNSTILE_SECRET_KEY].filter(Boolean).length;
check(turnstile === 0 || turnstile === 2, "Turnstile keys are both set or both unset", `${turnstile} of 2 set`);
check(!/^[123]x0000/.test(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "") && !/^[123]x0000/.test(env.TURNSTILE_SECRET_KEY ?? ""), "No Cloudflare Turnstile test keys");
if (turnstile === 0) warn("Turnstile is off", "expected: owner decision 2026-11-02");

if (url) {
  try {
    const sql = neon(url);
    const [tbl] = await sql`select to_regclass('public.schema_migrations') is not null as migrated`;
    if (!tbl.migrated) {
      check(false, "Migrations applied", "none yet: run scripts/db-migrate.mjs with this env file");
    } else {
      const done = (await sql`select id from schema_migrations`).map((r) => r.id);
      const missing = MIGRATIONS.map((m) => m.id).filter((id) => !done.includes(id));
      check(!missing.length, "Migrations applied", missing.length ? `missing: ${missing.join(", ")}` : done.join(", "));
      const [cap] = await sql`select seats from charter_settings`;
      check(cap?.seats === charterSeats(), "Database cap matches CHARTER.seats", `${cap?.seats} vs ${charterSeats()}`);
      const [c] = await sql`select count(*)::int as n, count(*) filter (where firm ilike 'zz%')::int as test from reservations`;
      check(c.test === 0, "No leftover test rows (firm starting with ZZ)", `${c.n} lead(s), ${c.test} test`);
    }
  } catch (err) {
    check(false, "Database reachable", String(err?.message ?? err).split("\n")[0]);
  }
}

for (const r of results) console.log(`${r.ok === "warn" ? "WARN" : r.ok ? "PASS" : "FAIL"}  ${r.label}${r.detail ? `  (${r.detail})` : ""}`);
const failed = results.filter((r) => r.ok === false).length;
console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
