"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { CHARTER, CRM_OPTIONS, SALES_EMAIL, getTier, tierSavings, type TierId } from "@/config/charter";
import { emailFallbackHref, validateLead, type FieldErrors, type LeadKind, type LeadSubmission } from "@/lib/reservations";
import { track } from "@/lib/analytics";

export type LeadRequest = { kind: LeadKind; tier: TierId | null; source: string; key: string };

type Status = { state: "idle" } | { state: "submitting" } | { state: "success"; id: string } | { state: "error"; reason: string };

const RESERVATION_TIERS: TierId[] = ["agency", "solo"];
const INQUIRY_TIERS: TierId[] = ["sponsor", "enterprise"];

function tierLabel(id: TierId) {
  const t = getTier(id);
  if (t.charter && (id === "solo" || id === "agency")) return `${t.id === "agency" ? "Agency" : "Solo"} Founding Charter — $${t.charter.amount}/year`;
  return t.name;
}

export function LeadModal({ request, onClose }: { request: LeadRequest | null; onClose: () => void }) {
  return (
    <Modal open={!!request} onClose={onClose} width="max-w-2xl" bare>
      {request && <LeadForm key={request.key} request={request} onClose={onClose} />}
    </Modal>
  );
}

function LeadForm({ request, onClose }: { request: LeadRequest; onClose: () => void }) {
  const isInquiry = request.kind === "inquiry";
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [data, setData] = useState<Partial<LeadSubmission>>({
    kind: request.kind,
    tier: request.tier ?? (isInquiry ? "enterprise" : "agency"),
    fullName: "",
    title: "",
    firm: "",
    website: "",
    email: "",
    crm: "",
    seats: "",
    message: "",
    consent: false,
    company_url: "",
    idempotencyKey: request.key,
    source: request.source,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof LeadSubmission, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const errors = { ...validateLead(data), ...serverErrors };
  delete errors.idempotencyKey;
  delete errors.kind;
  const show = (k: keyof LeadSubmission) => ((submitted || touched[k]) && errors[k]) || null;

  const set = <K extends keyof LeadSubmission>(k: K, v: LeadSubmission[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (serverErrors[k]) setServerErrors((e) => ({ ...e, [k]: undefined }));
  };
  const blur = (k: keyof LeadSubmission) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status.state === "submitting") return;
    setSubmitted(true);
    const errs = validateLead(data);
    delete errs.idempotencyKey;
    if (Object.keys(errs).length) {
      // Wait for the error state to render, then move focus to the first invalid control.
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>("input[aria-invalid='true'], select[aria-invalid='true'], textarea[aria-invalid='true']")?.focus();
      });
      return;
    }
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 201 && body.ok && body.id) {
        setStatus({ state: "success", id: body.id });
        track(isInquiry ? "inquiry_submit_success" : "reservation_submit_success", { tier: data.tier, crm: data.crm, source: request.source });
        return;
      }
      if (res.status === 422 && body.fields) {
        setServerErrors(body.fields);
        setStatus({ state: "idle" });
        return;
      }
      const reason =
        body.error === "not_configured"
          ? "Online reservations aren't connected yet, so we couldn't save your request."
          : "We couldn't save your request just now.";
      setStatus({ state: "error", reason });
      track("reservation_submit_error", { code: body.error ?? res.status, tier: data.tier });
    } catch {
      setStatus({ state: "error", reason: "We couldn't reach our server. Check your connection and try again." });
      track("reservation_submit_error", { code: "network", tier: data.tier });
    }
  }

  const tierOptions = isInquiry ? INQUIRY_TIERS : RESERVATION_TIERS;
  const fallback = emailFallbackHref(SALES_EMAIL, data, tierLabel(data.tier as TierId));

  if (status.state === "success") {
    return (
      <div className="px-6 pb-8 pt-10 text-center sm:px-10">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto grid size-14 place-items-center rounded-full bg-mint-soft text-mint-deep"
        >
          <CheckCircle2 className="size-7" aria-hidden />
        </motion.span>
        <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight" role="status">
          {isInquiry ? "Request received" : "Your request is in"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">
          {isInquiry
            ? `Thanks, ${data.fullName?.split(" ")[0]}. We'll reply to ${data.email} to find a time that works.`
            : `Thanks, ${data.fullName?.split(" ")[0]}. We've recorded your ${tierLabel(data.tier as TierId).replace(" — ", " (")}) reservation request and will reply to ${data.email} to confirm your seat.`}
        </p>
        <p className="mx-auto mt-3 max-w-md text-[13px] text-ink-3">
          No payment has been taken. {isInquiry ? "" : "Charter pricing is confirmed only when we follow up with an agreement."}
        </p>
        <p className="mt-4 font-mono text-[12px] text-ink-3">Reference {status.id.slice(0, 8).toUpperCase()}</p>
        <Button variant="ink" className="mt-6" onClick={onClose}>
          Done
        </Button>
      </div>
    );
  }

  const tier = getTier(data.tier as TierId);
  const savings = tierSavings(tier);

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-labelledby={`${uid}-title`}>
      <div className="linen rounded-t-3xl border-b border-line px-6 pb-5 pt-6 sm:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3">
          {isInquiry ? "Talk to our team" : `${CHARTER.programName} · Limited to ${CHARTER.seats} founding firms`}
        </p>
        <h2 id={`${uid}-title`} className="mt-1 pr-10 font-display text-[26px] font-semibold leading-tight tracking-tight sm:text-3xl">
          {isInquiry ? (data.tier === "sponsor" ? "Apply for a Sponsor account" : "Schedule an Enterprise demo") : "Reserve Your Founding Charter Access"}
        </h2>
        <p className="mt-2 text-[14px] text-ink-2">
          {isInquiry
            ? "Tell us about your team. We'll reply by email to set up a conversation."
            : "Reserving holds your place in line. No payment is collected now."}
        </p>
      </div>

      <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
        <fieldset className="sm:col-span-2">
          <legend className="text-[13px] font-semibold text-ink-2">{isInquiry ? "Account type" : "Tier selected"}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-invalid={!!show("tier") || undefined}>
            {tierOptions.map((id) => {
              const t = getTier(id);
              const s = tierSavings(t);
              const checked = data.tier === id;
              return (
                <label
                  key={id}
                  className={clsx(
                    "relative flex cursor-pointer flex-col rounded-2xl bg-white p-4 ring-1 ring-inset transition focus-within:ring-2 focus-within:ring-cobalt",
                    checked ? "ring-2 ring-ink" : "ring-line hover:ring-ink/30",
                  )}
                >
                  <input
                    type="radio"
                    name={`${uid}-tier`}
                    value={id}
                    checked={checked}
                    onChange={() => set("tier", id)}
                    className="peer sr-only"
                  />
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold text-ink">{isInquiry ? t.name : tierLabel(id)}</span>
                    <span
                      className={clsx("grid size-5 place-items-center rounded-full ring-1", checked ? "bg-ink ring-ink" : "ring-line-2")}
                      aria-hidden
                    >
                      {checked && <span className="size-2 rounded-full bg-paper" />}
                    </span>
                  </span>
                  <span className="mt-1 text-[12.5px] text-ink-3">
                    {t.audience}
                    {s && !isInquiry ? ` · Save ${s.pct}% vs. standard` : ""}
                  </span>
                </label>
              );
            })}
          </div>
          {show("tier") && <FieldError>{errors.tier}</FieldError>}
        </fieldset>

        <TextField id={`${uid}-name`} label="Full name" required value={data.fullName} onChange={(v) => set("fullName", v)} onBlur={blur("fullName")} error={show("fullName")} autoComplete="name" />
        <TextField id={`${uid}-title`} label="Title" optional value={data.title} onChange={(v) => set("title", v)} onBlur={blur("title")} error={show("title")} autoComplete="organization-title" placeholder="e.g. Principal, Agency Owner" />
        <TextField id={`${uid}-firm`} label="Agency / firm name" required value={data.firm} onChange={(v) => set("firm", v)} onBlur={blur("firm")} error={show("firm")} autoComplete="organization" />
        <TextField id={`${uid}-site`} label="Website" optional value={data.website} onChange={(v) => set("website", v)} onBlur={blur("website")} error={show("website")} autoComplete="url" inputMode="url" placeholder="yourfirm.com" />
        <TextField id={`${uid}-email`} label="Work email" required type="email" value={data.email} onChange={(v) => set("email", v)} onBlur={blur("email")} error={show("email")} autoComplete="email" inputMode="email" />

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${uid}-crm`} className="text-[13px] font-semibold text-ink-2">
            Primary CRM used <span className="text-coral-deep" aria-hidden>*</span>
          </label>
          <div className="relative">
            <select
              id={`${uid}-crm`}
              required
              aria-required
              aria-invalid={!!show("crm") || undefined}
              aria-describedby={show("crm") ? `${uid}-crm-err` : undefined}
              value={data.crm}
              onChange={(e) => set("crm", e.target.value)}
              onBlur={blur("crm")}
              className={clsx(inputClass, "appearance-none pr-9")}
            >
              <option value="">Select your CRM</option>
              {CRM_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {show("crm") && <FieldError id={`${uid}-crm-err`}>{errors.crm}</FieldError>}
        </div>

        {isInquiry && (
          <>
            <TextField
              id={`${uid}-seats`}
              label={data.tier === "sponsor" ? "Referral partners to sponsor" : "Approximate seats"}
              optional
              value={data.seats}
              onChange={(v) => set("seats", v)}
              onBlur={blur("seats")}
              error={show("seats")}
              inputMode="numeric"
              placeholder={data.tier === "sponsor" ? "e.g. 12" : "e.g. 250"}
            />
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor={`${uid}-msg`} className="text-[13px] font-semibold text-ink-2">
                What would you like to cover? <span className="font-normal text-ink-3">Optional</span>
              </label>
              <textarea
                id={`${uid}-msg`}
                value={data.message}
                onChange={(e) => set("message", e.target.value)}
                rows={3}
                className={clsx(inputClass, "resize-y")}
              />
            </div>
          </>
        )}

        {/* Honeypot: hidden from people and assistive tech */}
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
          <label>
            Company URL
            <input tabIndex={-1} autoComplete="off" value={data.company_url} onChange={(e) => set("company_url", e.target.value)} />
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ink-2">
            <input
              type="checkbox"
              checked={!!data.consent}
              onChange={(e) => set("consent", e.target.checked)}
              onBlur={blur("consent")}
              aria-invalid={!!show("consent") || undefined}
              className="mt-0.5 size-4 shrink-0 rounded accent-ink"
            />
            <span>
              I agree that {""}
              <span className="font-semibold text-ink">Daybright</span> may store these details and contact me by email about
              this {isInquiry ? "request" : "reservation"}. We use them only to respond and won&rsquo;t sell them. Please don&rsquo;t include client
              information. See our{" "}
              <a href="/privacy" target="_blank" rel="noopener" className="font-semibold text-cobalt underline-offset-2 hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {show("consent") && <FieldError>{errors.consent}</FieldError>}
        </div>
      </div>

      <AnimatePresence>
        {status.state === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-6 sm:px-8"
          >
            <div role="alert" className="flex gap-3 rounded-2xl bg-coral-soft p-4 text-[14px] text-ink">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-coral-deep" aria-hidden />
              <div>
                <p className="font-semibold">{status.reason}</p>
                <p className="mt-1 text-ink-2">Your details are still here. Try again, or send them to us by email so nothing is lost.</p>
                <a href={fallback} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-cobalt hover:underline">
                  <Mail className="size-4" aria-hidden /> Email your {isInquiry ? "request" : "reservation"} to {SALES_EMAIL}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse gap-3 border-t border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[12px] text-ink-3">
          {isInquiry ? "We'll reply by email; there's no automatic booking." : savings ? `${tier.name}: $${tier.charter!.amount}/year prepaid when confirmed. Nothing is charged today.` : ""}
        </p>
        <Button type="submit" variant="ink" size="lg" disabled={status.state === "submitting"} aria-busy={status.state === "submitting"}>
          {status.state === "submitting" && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {status.state === "submitting" ? "Sending…" : status.state === "error" ? "Try again" : isInquiry ? "Send request" : "Reserve my seat"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p id={id} className="mt-1.5 text-[13px] font-medium text-coral-deep" role="alert">
      {children}
    </p>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  optional,
  ...rest
}: {
  id: string;
  label: string;
  value?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error: string | null | undefined;
  required?: boolean;
  optional?: boolean;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "onBlur" | "id">) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-semibold text-ink-2">
        <span>
          {label} {required && <span className="text-coral-deep" aria-hidden>*</span>}
        </span>
        {optional && <span className="font-normal text-ink-3">Optional</span>}
      </label>
      <input
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        aria-required={required || undefined}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={inputClass}
        {...rest}
      />
      {error && <FieldError id={`${id}-err`}>{error}</FieldError>}
    </div>
  );
}
