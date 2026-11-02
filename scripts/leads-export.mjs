// Export Founding Charter reservations as CSV.
// Usage: vercel env pull .env.local && npm run leads:export > leads.csv
// Reads DATABASE_URL from the environment; never commit the output (it contains personal data).
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  process.exit(1);
}
const sql = neon(url);
const rows = await sql`
  select received_at, kind, tier, full_name, title, firm, website, email, crm, seats, message, source, status, status_note, status_updated_at, id
  from reservations order by received_at desc`;
const cols = ["received_at", "kind", "tier", "full_name", "title", "firm", "website", "email", "crm", "seats", "message", "source", "status", "status_note", "status_updated_at", "id"];
const esc = (v) => {
  const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  // Neutralize spreadsheet formula injection and quote every cell.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};
console.log(cols.join(","));
for (const r of rows) console.log(cols.map((c) => esc(r[c])).join(","));
console.error(`${rows.length} row(s) exported.`);
