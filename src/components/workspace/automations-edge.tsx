"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CalendarDays, UserX } from "lucide-react";
import type { AutomationRule } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { customerIssues } from "@/lib/selectors";
import { daysUntil, fmtDate, formatBirthday, isLeap, nextBirthday, relDays, startOfToday } from "@/lib/dates";
import { renderTemplate } from "@/lib/ai/messages";
import { Button, ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Badge, SimulatedNote } from "@/components/ui/badges";
import { useToast } from "@/components/ui/toast";

function EdgeCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-cream text-ink">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/** Live demonstrations of the tricky birthday cases, driven by the selected rule. */
export function EdgeCases({ rule, patchSaved }: { rule: AutomationRule; patchSaved: (p: Partial<AutomationRule>) => void }) {
  const customers = useDemo((s) => s.customers);
  const sends = useDemo((s) => s.sends);
  const business = useDemo((s) => s.business);
  const addSend = useDemo((s) => s.addSend);
  const toast = useToast();

  const sam = customers.find((c) => c.id === "c-sam") ?? customers.find((c) => c.tags.includes("New client"));
  const elena = customers.find((c) => c.id === "c-elena") ?? customers.find((c) => c.birthMonth === 2 && c.birthDay === 29);
  const missing = customers.filter((c) => customerIssues(c).some((i) => i.includes("birthday")));

  // Sam: this year's birthday vs date added
  const today = startOfToday();
  const samThisYear = sam?.birthMonth && sam.birthDay ? new Date(today.getFullYear(), sam.birthMonth - 1, sam.birthDay) : null;
  const samPassedDays = samThisYear ? -(daysUntil(samThisYear) ?? 0) : 0;
  const samNext = sam ? nextBirthday(sam, rule.feb29) : null;
  const samBelated = sam ? sends.find((s) => s.customerId === sam.id && s.events.some((e) => e.label.toLowerCase().includes("belated"))) : null;

  const sendBelated = () => {
    if (!sam) return;
    const base = renderTemplate(rule.messageTemplate, { firstName: sam.firstName, companyName: business.name, senderName: business.senderName });
    const message = base.replace(/^Happy birthday/i, "Happy belated birthday");
    const now = new Date().toISOString();
    const id = addSend({
      source: "automation",
      customerId: sam.id,
      automationId: rule.id,
      recipientName: `${sam.firstName} ${sam.lastName}`,
      recipientEmail: sam.email,
      cardId: rule.cardId,
      headline: "Happy belated\nbirthday",
      message,
      messageFont: "classic",
      senderName: business.senderName,
      fromLabel: business.name,
      brandColor: business.brandColor,
      logoDataUrl: business.logoDataUrl,
      scheduledFor: now,
      status: "sent",
      approved: true,
      gift: null,
      events: [{ at: now, label: "Belated card sent (simulated)" }],
    });
    toast({ title: `Belated card sent to ${sam.firstName}`, body: "Simulated send. You'll find it in Activity.", tone: "success" });
    return id;
  };

  // Elena: Feb 29
  const elenaNext = elena ? nextBirthday(elena, rule.feb29) : null;
  const elenaYear = elenaNext?.getFullYear();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sam && (
        <EdgeCard icon={<CalendarClock className="size-4" aria-hidden />} title="Added after their birthday">
          <p className="text-[14px] leading-relaxed text-ink-2">
            <strong className="text-ink">
              {sam.firstName} {sam.lastName}
            </strong>{" "}
            was added {relDays(daysUntil(new Date(sam.createdAt)) ?? 0).toLowerCase()}. Their birthday ({formatBirthday(sam)}) was {samPassedDays} day{samPassedDays === 1 ? "" : "s"} ago.
          </p>
          <Segmented
            size="sm"
            ariaLabel="Customers added after their birthday"
            value={rule.lateAdd}
            onChange={(v) => patchSaved({ lateAdd: v })}
            options={[
              { value: "skip", label: "Wait until next year" },
              { value: "belated", label: "Send belated card" },
            ]}
          />
          <p className="text-[13px] text-ink-3">
            {rule.lateAdd === "skip"
              ? `With this rule, ${sam.firstName}'s first card goes out ${samNext ? fmtDate(samNext, { month: "long", day: "numeric", year: "numeric" }) : "next year"}.`
              : `With this rule, ${sam.firstName} gets a “happy belated birthday” card the morning after being added.`}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            {samBelated ? (
              <>
                <Badge tone="mint" dot>
                  Belated card sent
                </Badge>
                <Link href={`/app/activity?id=${samBelated.id}`} className="text-[13px] font-semibold text-cobalt underline-offset-2 hover:underline">
                  View in Activity
                </Link>
              </>
            ) : (
              <Button size="sm" variant="ink" onClick={sendBelated}>
                Send belated card now
              </Button>
            )}
          </div>
          {!samBelated && <SimulatedNote>Demo send. Nothing is delivered.</SimulatedNote>}
        </EdgeCard>
      )}

      {elena && (
        <EdgeCard icon={<CalendarDays className="size-4" aria-hidden />} title="February 29 birthdays">
          <p className="text-[14px] leading-relaxed text-ink-2">
            <strong className="text-ink">
              {elena.firstName} {elena.lastName}
            </strong>{" "}
            was born on Feb 29. In non-leap years, Feb 29 birthdays are celebrated on {rule.feb29 === "feb28" ? "Feb 28" : "Mar 1"}.
          </p>
          <Segmented
            size="sm"
            ariaLabel="February 29 rule"
            value={rule.feb29}
            onChange={(v) => patchSaved({ feb29: v })}
            options={[
              { value: "feb28", label: "Feb 28 (default)" },
              { value: "mar1", label: "Mar 1" },
            ]}
          />
          {elenaNext && (
            <div className="rounded-2xl bg-cream/70 p-3 ring-1 ring-line">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">Next celebration</p>
              <p className="font-grotesk text-xl font-bold">{fmtDate(elenaNext, { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</p>
              <p className="text-[12px] text-ink-3">
                {elenaYear} is {elenaYear && isLeap(elenaYear) ? "a leap year, so it's Feb 29." : "not a leap year."} {relDays(daysUntil(elenaNext))}.
              </p>
            </div>
          )}
        </EdgeCard>
      )}

      <EdgeCard icon={<UserX className="size-4" aria-hidden />} title="Missing birthdays">
        <p className="text-[14px] leading-relaxed text-ink-2">
          {missing.length === 0 ? (
            "Every customer has a birthday on file."
          ) : (
            <>
              <strong className="text-ink">
                {missing.length} customer{missing.length === 1 ? "" : "s"}
              </strong>{" "}
              can’t be celebrated yet: {missing.slice(0, 3).map((c) => c.firstName).join(", ")}
              {missing.length > 3 ? ` and ${missing.length - 3} more` : ""}. Rules skip them until a birthday is added; nothing fails silently.
            </>
          )}
        </p>
        <div className="mt-auto">
          <ButtonLink href="/app/customers?filter=issues" size="sm" variant="outline" iconRight={<ArrowRight className="size-3.5" />}>
            Complete missing details
          </ButtonLink>
        </div>
      </EdgeCard>
    </div>
  );
}
