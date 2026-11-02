// Lead database schema, as ordered migrations. Plain JS so both the app (src/lib/lead-store.ts) and the
// admin scripts (scripts/db-migrate.mjs, scripts/leads-admin.mjs) share one definition.
// Every statement is idempotent, so re-running a migration is safe. Never edit an applied migration; add a new one.

/**
 * Follow-up status of a lead. Only `accepted` reservations count toward the Founding Charter cap.
 * new → contacted → accepted | waitlisted | declined; `withdrawn` when the person opts out.
 */
export const LEAD_STATUSES = ["new", "contacted", "accepted", "waitlisted", "declined", "withdrawn"];

/** @type {{ id: string; statements: string[] }[]} */
export const MIGRATIONS = [
  {
    id: "001_reservations",
    statements: [
      `create table if not exists reservations (
        id              uuid primary key,
        received_at     timestamptz not null default now(),
        kind            text not null check (kind in ('reservation','inquiry')),
        tier            text not null,
        full_name       text not null,
        title           text not null default '',
        firm            text not null,
        website         text not null default '',
        email           text not null,
        crm             text not null,
        seats           text not null default '',
        message         text not null default '',
        consent         boolean not null,
        consent_text    text not null,
        source          text not null default '',
        idempotency_key text not null unique,
        ip_hash         text not null default '',
        status          text not null default 'new'
      )`,
      `create index if not exists reservations_ip_recent on reservations (ip_hash, received_at desc)`,
      `create index if not exists reservations_email_recent on reservations (email, received_at desc)`,
    ],
  },
  {
    id: "002_status_tracking",
    statements: [
      `alter table reservations add column if not exists status_updated_at timestamptz`,
      `alter table reservations add column if not exists status_note text not null default ''`,
      `update reservations set status = 'new' where status not in (${LEAD_STATUSES.map((s) => `'${s}'`).join(",")})`,
      `do $$ begin
        if not exists (select 1 from pg_constraint where conname = 'reservations_status_check') then
          alter table reservations add constraint reservations_status_check
            check (status in (${LEAD_STATUSES.map((s) => `'${s}'`).join(",")}));
        end if;
      end $$`,
      `create index if not exists reservations_kind_status on reservations (kind, status)`,
    ],
  },
];

/**
 * Applies any migrations not yet recorded in `schema_migrations`. Each runs in one transaction.
 * @param {import("@neondatabase/serverless").NeonQueryFunction<false, false>} sql
 * @returns {Promise<string[]>} ids of the migrations applied by this call
 */
export async function migrate(sql) {
  await sql.query(`create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())`);
  const done = new Set((await sql.query(`select id from schema_migrations`)).map((r) => r.id));
  const applied = [];
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    await sql.transaction([
      ...m.statements.map((s) => sql.query(s)),
      sql.query(`insert into schema_migrations (id) values ($1) on conflict do nothing`, [m.id]),
    ]);
    applied.push(m.id);
  }
  return applied;
}
