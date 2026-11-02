# Lead operations guide

For Daybright's **authorized operator**: the person at Daybright who reviews Founding Charter requests and follows up. Nothing here needs a developer, a terminal or the code repository.

**Ownership.** Daybright's operating entity is still to be confirmed (legal meeting 2026-11-03). Artifact Digital is the **development vendor only**, not the owner or operator. Accounts holding lead data should belong to Daybright, and vendor access should be limited to what development needs and removed when it's no longer needed (see section 6).

## 1. How a lead reaches you
1. Someone submits the reservation or inquiry form. It's saved in the Production lead database (Neon, US East) with status `new`.
2. If alert emails are enabled, you get an email:
   - **Subject:** "New Founding Charter reservation request · 7A136C64". It contains no name or firm.
   - **Body:** reference, received time, tier, name, firm and email only. Notes, website, title, CRM and team size stay in the database. Notes are kept out of email because people sometimes paste client details there.
   - **Replying:** reply directly to the email to reach the person.
3. Visitors who couldn't submit may email `hello@daybright.store` instead, which forwards to the Daybright inbox. Those aren't in the database. Log them by hand if you want them counted (section 4).

## 2. Two ways to open the lead database (no terminal)
| | A. Neon console (owner) | B. Operator database login (recommended for anyone else) |
| --- | --- | --- |
| Who | The person who owns Daybright's Vercel account | A named operator, with their own login |
| Where | Vercel dashboard → **Storage** → `daybright-leads-prod` → **Open in Neon** → **SQL Editor** or **Tables** | A desktop database app, e.g. TablePlus, Postico (Mac) or DBeaver (free) |
| Can do | Everything, including deleting records | Read leads, and change only `status` and `status_note` |
| Can't do | – | Edit contact details, delete or add leads, or change the seat cap |

Either way, the database enforces the 15-seat cap: accepting a 16th reservation fails with "Founding Charter cap reached".

### Setting up option B (done once by the account owner, in the Neon console)
1. In the Neon console, open the **Production** project → **Roles** → **New role**. Name it after the person, e.g. `operator_jordan`. Neon shows the password once; send it to the operator through a password manager, not email.
2. In **SQL Editor**, grant only what's needed:
   ```sql
   grant usage on schema public to operator_jordan;
   grant select on reservations, charter_settings to operator_jordan;
   grant update (status, status_note) on reservations to operator_jordan;
   ```
3. Give the operator the connection details from Neon's **Connect** dialog:
   - **Host:** the pooled host
   - **Database:** `neondb`
   - **User:** their role
   - **SSL:** require
4. Tested on the Preview database (2026-11-02): this role could read leads and change status and notes. Editing email, deleting, inserting and changing the cap were all denied, and the cap still applied.

**To remove access** (when the operator leaves or a vendor engagement ends):
```sql
revoke all on reservations, charter_settings from operator_jordan;
revoke all on schema public from operator_jordan;
drop role operator_jordan;
```

## 3. Statuses and what they mean
| Status | Use when |
| --- | --- |
| `new` | Just arrived (set automatically) |
| `contacted` | You've replied or spoken with them |
| `accepted` | A Founding Charter place has been offered and confirmed in writing. **Counts toward the 15-seat cap.** |
| `waitlisted` | A good fit, but the charter is full or the timing is wrong |
| `declined` | Not a fit, or you've declined |
| `withdrawn` | They asked to stop or withdrew |

- **Timestamp:** `status_updated_at` is set automatically whenever status changes.
- **Notes:** keep `status_note` short and factual, e.g. "Call booked 11/12". Never put client information or anything sensitive in it.
- **What "accepted" means:** a reservation is a nonbinding expression of interest. Accepting doesn't create a contract or a charge. Pricing and terms are agreed separately, in writing.

## 4. Everyday queries (copy into the SQL Editor or your database app)
**Seats used**
```sql
select count(*) filter (where status = 'accepted') as accepted,
       (select seats from charter_settings) as cap
from reservations where kind = 'reservation';
```
**New requests, oldest first** (the site promises review in the order received)
```sql
select upper(left(id::text, 8)) as ref, received_at, kind, tier, full_name, firm, email, crm, seats, message
from reservations where status = 'new' order by received_at;
```
**Find one lead by the reference in the alert email**
```sql
select * from reservations where id::text ilike '7a136c64%';
```
**Change a status** (operators can also edit the cell directly in a table view)
```sql
update reservations set status = 'contacted', status_note = 'Intro call booked 11/12'
where id::text ilike '7a136c64%';
```
**Pipeline overview**
```sql
select kind, status, count(*) from reservations group by kind, status order by kind, status;
```
**Log a request that arrived by email** (owner only; operators can't insert)
```sql
insert into reservations (id, kind, tier, full_name, firm, email, crm, consent, consent_text, source, idempotency_key)
values (gen_random_uuid(), 'reservation', 'solo', 'Full Name', 'Firm', 'person@firm.com', 'Other / CSV', true,
        'Requested by email to hello@daybright.store', 'email', 'email-' || gen_random_uuid());
```

## 5. Handling personal data
- **Exports:** export only what you need, and keep exports out of shared drives and chat. The Neon console can download query results as CSV.
- **Deletion and correction requests:** the account owner deletes the row in the Neon console (`delete from reservations where id::text ilike '…%';`), then confirms by email. Keep a short private log of the date and reference, not the person's details.
- **Retention:** to be set with counsel (the draft suggests 24 months after last contact). Until then, don't keep leads you no longer need.
- **Sharing:** don't forward alert emails outside the people who follow up on leads.

## 6. Account ownership checklist (for Daybright)
- [ ] The Vercel team or account that owns the `daybright` project and the Neon databases belongs to Daybright.
- [ ] Resend, ImprovMX, Spaceship (domain) and GitHub are in Daybright's name. The development vendor has member access only.
- [ ] Each operator has their own database role (section 2). No shared logins.
- [ ] Vendor access is reviewed when development milestones end, and removed when it's no longer needed.

## 7. Later, if needed: a web admin page
A browser-based lead page inside the Daybright site isn't built. It would need real sign-in (ideally with MFA), per-person accounts and an audit log. Without those it would be a new way in to personal data. Options A and B cover launch without it.
