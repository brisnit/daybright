// Founding Charter lead administration: review requests and track follow-up status.
// Usage (reads DATABASE_URL; default env file is .env.local, i.e. the Preview/Development database):
//   npm run leads:admin -- summary
//   npm run leads:admin -- list [status]
//   npm run leads:admin -- set <reference> <status> ["note"]
// <reference> is the 8-character reference shown to the visitor (or any longer prefix of the id).
// For Production, pull its env into a separate file and pass it explicitly (see docs/PRODUCTION_SETUP.md):
//   node --env-file=.env.production.local scripts/leads-admin.mjs summary
// Output contains personal data: don't paste it into tickets or commit it.
import { neon } from "@neondatabase/serverless";
import { LEAD_STATUSES, migrate } from "../src/lib/lead-schema.mjs";
import { charterSeats } from "./charter-seats.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  process.exit(1);
}
const sql = neon(url);
const cap = charterSeats();
await migrate(sql, { charterSeats: cap });

const [cmd = "summary", ...args] = process.argv.slice(2);
const ref = (id) => String(id).slice(0, 8).toUpperCase();

async function acceptedCount() {
  const [r] = await sql`select count(*)::int as n from reservations where kind = 'reservation' and status = 'accepted'`;
  return r.n;
}

if (cmd === "summary") {
  const rows = await sql`select kind, status, count(*)::int as n from reservations group by kind, status order by kind, status`;
  for (const r of rows) console.log(`${r.kind.padEnd(12)} ${r.status.padEnd(11)} ${r.n}`);
  if (!rows.length) console.log("No leads yet.");
  const accepted = await acceptedCount();
  console.log(`\nFounding Charter: ${accepted} of ${cap} seats accepted, ${Math.max(cap - accepted, 0)} remaining.`);
} else if (cmd === "list") {
  const status = args[0];
  if (status && !LEAD_STATUSES.includes(status)) throw new Error(`Unknown status "${status}". Use one of: ${LEAD_STATUSES.join(", ")}`);
  const rows = status
    ? await sql`select * from reservations where status = ${status} order by received_at`
    : await sql`select * from reservations order by received_at`;
  for (const r of rows) {
    console.log(
      [ref(r.id), new Date(r.received_at).toISOString().slice(0, 16).replace("T", " "), r.kind, r.tier, r.status, r.firm, r.email].join("  |  "),
    );
  }
  console.log(`${rows.length} lead(s).`);
} else if (cmd === "set") {
  const [prefix = "", status, note = ""] = args;
  if (!/^[0-9a-f-]{8,36}$/i.test(prefix) || !LEAD_STATUSES.includes(status)) {
    throw new Error(`Usage: set <reference> <${LEAD_STATUSES.join("|")}> ["note"]`);
  }
  const matches = await sql`select id, kind, status, firm from reservations where id::text like ${prefix.toLowerCase() + "%"}`;
  if (matches.length !== 1) throw new Error(`Reference ${prefix} matched ${matches.length} leads; use a longer prefix.`);
  const lead = matches[0];
  // The database trigger (migration 003) enforces the cap and stamps status_updated_at.
  try {
    await sql`update reservations set status = ${status}, status_note = ${note} where id = ${lead.id}`;
  } catch (err) {
    if (!/cap reached/.test(String(err?.message))) throw err;
    console.error(`Not changed: all ${cap} Founding Charter seats are already accepted. Waitlist this request or raise CHARTER.seats first.`);
    process.exit(2);
  }
  console.log(`${ref(lead.id)} (${lead.firm}): ${lead.status} → ${status}`);
  if (lead.kind === "reservation") console.log(`Founding Charter: ${await acceptedCount()} of ${cap} seats accepted.`);
} else {
  console.error(`Unknown command "${cmd}". Use summary, list or set.`);
  process.exit(1);
}
