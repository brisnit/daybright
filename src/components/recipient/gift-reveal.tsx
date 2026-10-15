"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, MapPin, Truck, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { money } from "@/config/brand";
import { GIFT_MAP } from "@/data/gifts";
import { hash } from "@/lib/ai/simulate";
import type { Send } from "@/lib/types";
import { GiftArt } from "@/components/gifts/gift-art";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { SimulatedNote } from "@/components/ui/badges";
import { ConfettiBurst } from "./confetti";

/** Which gift states a recipient should ever see. Unapproved/declined gifts stay hidden. */
export function visibleGift(send: Send) {
  const g = send.gift;
  if (!g) return null;
  if (!["approved", "claimed", "awaiting-address", "shipped"].includes(g.status)) return null;
  const gift = GIFT_MAP[g.giftId];
  if (!gift) return null;
  return { sel: g, gift };
}

function giftCode(id: string, merchant: string) {
  const prefix = merchant
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => /[A-Za-z]/.test(w[0] ?? ""))
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("");
  const n = hash(id + merchant).toString(36).toUpperCase().padStart(8, "7");
  return `${prefix || "GFT"}-${n.slice(0, 4)}-${n.slice(4, 8)}`;
}

type Addr = { name: string; line1: string; line2: string; city: string; region: string; postal: string };

export function GiftReveal({
  send,
  accent,
  onClaim,
  onAddress,
  preview,
}: {
  send: Send;
  accent: string;
  onClaim: () => void;
  onAddress: () => void;
  preview: boolean;
}) {
  const reduce = useReducedMotion();
  const v = visibleGift(send)!;
  const { gift, sel } = v;
  const [unwrapped, setUnwrapped] = useState(false);
  const [burst, setBurst] = useState(0);

  const initialDigital = sel.status === "claimed" ? "claimed" : "idle";
  const initialPhysical = sel.status === "awaiting-address" ? "form" : "done";
  const [digital, setDigital] = useState<"idle" | "claiming" | "claimed">(initialDigital);
  const [physical, setPhysical] = useState<"form" | "saving" | "done">(initialPhysical);
  const [addr, setAddr] = useState<Addr>({ name: send.recipientName, line1: "", line2: "", city: "", region: "", postal: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Addr, string>>>({});
  const [submitted, setSubmitted] = useState<Addr | null>(null);
  const [copied, setCopied] = useState(false);

  const code = giftCode(send.id, gift.merchant);
  const merchant = gift.merchant.replace(/\s*\(demo\)\s*/i, "");
  const isDigital = gift.kind === "digital";

  const unwrap = () => {
    setUnwrapped(true);
    setBurst((b) => b + 1);
  };

  const claim = () => {
    setDigital("claiming");
    setTimeout(() => {
      setDigital("claimed");
      setBurst((b) => b + 1);
      onClaim();
    }, 1100);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Partial<Record<keyof Addr, string>> = {};
    if (!addr.name.trim()) err.name = "Who should we address it to?";
    if (addr.line1.trim().length < 4) err.line1 = "Add a street address.";
    if (!addr.city.trim()) err.city = "Add a city.";
    if (!/^[A-Za-z]{2,}/.test(addr.region.trim())) err.region = "Add a state.";
    if (!/^\d{5}(-\d{4})?$/.test(addr.postal.trim())) err.postal = "Use a 5-digit ZIP code.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setPhysical("saving");
    setTimeout(() => {
      setSubmitted(addr);
      setPhysical("done");
      setBurst((b) => b + 1);
      onAddress();
    }, 1000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard may be unavailable; the code is still visible */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative">
        <ConfettiBurst burst={burst} count={36} extra={[accent]} />
        <AnimatePresence mode="wait" initial={false}>
          {!unwrapped ? (
            <motion.button
              key="box"
              type="button"
              onClick={unwrap}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group relative mx-auto block w-[78%] max-w-[300px] pt-6"
              aria-label="Unwrap your gift"
            >
              <GiftBox accent={accent} />
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-soft transition group-hover:-translate-y-0.5">
                Tap to unwrap
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="gift"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9, rotate: -3 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
              className="rounded-[28px] bg-white p-3 shadow-lift ring-1 ring-line"
            >
              <GiftArt gift={gift} amount={isDigital ? sel.amount : undefined} className="rounded-[20px]" />
              <div className="px-3 pb-3 pt-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3">{merchant}</p>
                <p className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-tight text-ink">
                  {isDigital ? `${money(sel.amount)} ${gift.name.toLowerCase()}` : gift.name}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{gift.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {unwrapped && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.35 }} className="mt-5">
          {isDigital ? (
            <AnimatePresence mode="wait" initial={false}>
              {digital !== "claimed" ? (
                <motion.div key="claim" exit={{ opacity: 0 }} className="text-center">
                  <Button size="lg" className="w-full" onClick={claim} disabled={digital === "claiming"} icon={<Wallet className="size-4" />}>
                    {digital === "claiming" ? "Adding to your wallet…" : "Claim your gift"}
                  </Button>
                  <p className="mt-2 text-[13px] text-ink-3">{gift.delivery}. No account needed.</p>
                </motion.div>
              ) : (
                <motion.div key="claimed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-mint-soft p-5 ring-1 ring-mint/50">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-mint-deep text-white">
                      <Check className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-mint-deep">Added to your wallet</p>
                      <p className="text-[13px] text-ink-2">Use it at {merchant} whenever you like.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-mint/40">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">Gift code</p>
                      <p className="font-mono text-lg font-bold tracking-wider text-ink">{code}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={copy} icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}>
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <SimulatedNote className="mt-3">Demo gift card. The code has no real value.</SimulatedNote>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {physical !== "done" ? (
                <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} noValidate className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-line">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full text-white" style={{ background: accent }}>
                      <MapPin className="size-5" />
                    </span>
                    <div>
                      <p className="font-display text-xl font-semibold tracking-tight text-ink">Where should we send it?</p>
                      <p className="text-[13px] text-ink-3">{gift.delivery} once we have your address.</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <Input label="Full name" autoComplete="name" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} error={errors.name} />
                    <Input label="Street address" autoComplete="address-line1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} error={errors.line1} />
                    <Input label="Apartment, suite" optional autoComplete="address-line2" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
                    <Input label="City" autoComplete="address-level2" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} error={errors.city} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="State" autoComplete="address-level1" value={addr.region} onChange={(e) => setAddr({ ...addr, region: e.target.value })} error={errors.region} />
                      <Input label="ZIP code" inputMode="numeric" autoComplete="postal-code" value={addr.postal} onChange={(e) => setAddr({ ...addr, postal: e.target.value })} error={errors.postal} />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="mt-5 w-full" disabled={physical === "saving"} icon={<Truck className="size-4" />}>
                    {physical === "saving" ? "Saving…" : "Send it here"}
                  </Button>
                  <SimulatedNote className="mt-3">Demo only. Nothing ships and the address isn&rsquo;t saved.</SimulatedNote>
                </motion.form>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-mint-soft p-5 ring-1 ring-mint/50">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-mint-deep text-white">
                      <Truck className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-mint-deep">{submitted ? "Got it. It's on the way soon." : "It's on the way."}</p>
                      <p className="text-[13px] text-ink-2">{gift.delivery}.</p>
                    </div>
                  </div>
                  {submitted && (
                    <address className="mt-4 rounded-2xl bg-white px-4 py-3 text-[14px] not-italic leading-relaxed text-ink-2 ring-1 ring-mint/40">
                      <span className="font-semibold text-ink">{submitted.name}</span>
                      <br />
                      {submitted.line1}
                      {submitted.line2 ? `, ${submitted.line2}` : ""}
                      <br />
                      {submitted.city}, {submitted.region.toUpperCase()} {submitted.postal}
                    </address>
                  )}
                  <SimulatedNote className="mt-3">Delivery is simulated in this demo.</SimulatedNote>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {preview && <p className="mt-3 text-center text-[12px] text-ink-3">Preview: this won&rsquo;t change the send.</p>}
        </motion.div>
      )}
    </div>
  );
}

function GiftBox({ accent }: { accent: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative mx-auto aspect-square w-full"
      animate={reduce ? undefined : { rotate: [0, -2.5, 2.5, -1.5, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 2.2 }}
    >
      <svg viewBox="0 0 200 200" className="size-full drop-shadow-[0_18px_22px_rgb(28_24_56/0.25)]" aria-hidden>
        {/* box */}
        <rect x="30" y="86" width="140" height="100" rx="8" fill="#FFFDF8" />
        <rect x="30" y="86" width="140" height="100" rx="8" fill={accent} opacity=".14" />
        <rect x="90" y="86" width="20" height="100" fill={accent} />
        {/* lid */}
        <g className="origin-center transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-2">
          <rect x="22" y="64" width="156" height="30" rx="7" fill="#FFFDF8" />
          <rect x="22" y="64" width="156" height="30" rx="7" fill={accent} opacity=".22" />
          <rect x="90" y="64" width="20" height="30" fill={accent} />
          {/* bow */}
          <path d="M100 64 C78 36 54 44 62 58 C68 68 88 66 100 64Z" fill={accent} />
          <path d="M100 64 C122 36 146 44 138 58 C132 68 112 66 100 64Z" fill={accent} />
          <circle cx="100" cy="63" r="7" fill={accent} />
          <circle cx="100" cy="63" r="7" fill="#000" opacity=".15" />
        </g>
        {/* tag */}
        <g transform="translate(140 120) rotate(12)">
          <path d="M0 0 H34 L42 9 L34 18 H0Z" fill="#FFD45C" />
          <circle cx="34" cy="9" r="2" fill="#1C1838" />
        </g>
      </svg>
    </motion.div>
  );
}
