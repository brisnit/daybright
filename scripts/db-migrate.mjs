// Applies pending lead-database migrations (src/lib/lead-schema.mjs). Safe to re-run.
// Usage: npm run db:migrate                     (DATABASE_URL from .env.local: Preview/Development)
//        node --env-file=.env.production.local scripts/db-migrate.mjs   (Production, at launch only)
// The app also applies pending migrations on its first database request; running this first is the
// explicit, verifiable step for Production.
import { neon } from "@neondatabase/serverless";
import { MIGRATIONS, migrate } from "../src/lib/lead-schema.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(url);
const host = new URL(url).hostname;
const applied = await migrate(sql);
console.log(`Database host: ${host}`);
console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Already up to date.");
const rows = await sql`select id, applied_at from schema_migrations order by id`;
for (const r of rows) console.log(`  ${r.id}  ${new Date(r.applied_at).toISOString()}`);
if (rows.length !== MIGRATIONS.length) {
  console.error(`Expected ${MIGRATIONS.length} migrations, found ${rows.length}.`);
  process.exit(1);
}
