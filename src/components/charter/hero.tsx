"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileCheck2 } from "lucide-react";
import { CardFront } from "@/components/cards/card-art";
import { Envelope, type EnvelopeStage } from "@/components/cards/envelope";
import { CAPABILITY_PILLS, CHARTER, CLAIM_FLAGS, claimVisible } from "@/config/charter";
import { CharterButton, SampleButton } from "./cta";
import { StatusChip } from "./status";
import { VERTICAL_SAMPLES } from "./samples";

const VERTICALS = ["Financial advisors", "Insurance agencies", "Real estate", "Legal"];

export function CharterHero() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<EnvelopeStage>(reduce ? "out" : "closed");
  const advisor = VERTICAL_SAMPLES[0];

  useEffect(() => {
    if (reduce) return;
    const a = window.setTimeout(() => setStage("open"), 700);
    const b = window.setTimeout(() => setStage("out"), 1600);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduce]);

  return (
    <section aria-labelledby="hero-title" className="linen relative overflow-hidden border-b border-[#E7DDCC]">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="relative z-10">
          <p className="text-[11.5px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-ink-2 text-balance sm:text-[12px]">
            Built for {VERTICALS.join(" • ")}
          </p>
          <h1
            id="hero-title"
            className="mt-5 font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.02em] text-[#16203A] text-balance sm:text-[56px] lg:text-[64px]"
          >
            Automated Client Retention &amp; Milestone Intelligence
            <span className="text-[#8A6A2B]">—</span>
            <span className="italic font-normal text-[#2E4A7A]" style={{ fontVariationSettings: '"SOFT" 100' }}>
              Built for Regulated Industries.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2 sm:text-lg">
            Tactile digital stationery in place of printed mailers and plain CRM emails: animated envelopes, wet-ink-style signatures
            and, once gifting launches, optional micro-gifts. Daybright is being built to turn your client data into timely cards for
            birthdays, policy renewals, housiversaries and the other milestones that matter.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <CharterButton source="hero" className="w-full sm:w-auto" />
            <SampleButton source="hero" />
          </div>
          <p className="mt-3 text-[13px] text-ink-3">
            Limited to {CHARTER.seats} Founding Agencies &amp; Practices · {CHARTER.setupMicrocopy}
          </p>

          <ul className="mt-9 grid gap-2.5" aria-label="Compliance capabilities in development">
            {CAPABILITY_PILLS.filter((p) => claimVisible(p.gate)).map((p) => (
              <li key={p.title} className="emboss flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3">
                <FileCheck2 className="mt-0.5 size-[18px] shrink-0 text-[#2E4A7A]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold leading-snug text-ink">{p.title}</p>
                  <p className="text-[13px] leading-snug text-ink-3">{p.detail}</p>
                </div>
                <StatusChip status={p.status} className="mt-0.5" />
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-ink-3">
            Capabilities marked Planned are in development, not yet available and have no committed release date. Daybright does
            not provide legal or compliance advice, and no regulator has reviewed or approved it.
          </p>
        </div>

        {/* Stationery composition */}
        <div className="relative mx-auto w-full max-w-[460px] lg:mt-6" aria-hidden>
          <div className="absolute -inset-x-10 -top-6 bottom-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgb(201_162_75/0.18),transparent)]" />
          {CLAIM_FLAGS.regulatoryArchiving && (
            <motion.div
              className="emboss absolute -left-4 top-6 z-0 w-[44%] rotate-[-7deg] rounded-xl bg-white p-3 sm:-left-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.6 }}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">Audit snapshot</p>
              <p className="mt-1 font-display text-[13px] font-semibold text-ink">Card delivered</p>
              <div className="mt-2 space-y-1.5">
                {["Timestamp", "Message", "Signature", "CRD #"].map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <span className="w-14 text-[8.5px] uppercase tracking-wide text-ink-3">{r}</span>
                    <span className="h-1.5 flex-1 rounded-full bg-[#EDE5D6]" />
                  </div>
                ))}
              </div>
              <p className="mt-2 inline-block rounded-full bg-butter-soft px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-butter-deep">Planned</p>
            </motion.div>
          )}

          <div className="relative z-10 mx-auto w-[86%] pt-[62%]">
            <Envelope
              stage={stage}
              color="#1E2A44"
              liner="#E9DFCB"
              label={
                <span className="block">
                  <span className="block font-hand text-[22px] leading-none text-ink">{advisor.recipient}</span>
                  <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">Age 59½ milestone</span>
                </span>
              }
            >
              <CardFront card={advisor.card} live brandMark={{ name: advisor.firm, color: advisor.color }} />
            </Envelope>
          </div>

          <motion.div
            className="emboss absolute -right-2 bottom-24 z-20 rounded-2xl bg-white px-4 py-3 sm:-right-8"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">Upcoming milestones</p>
            <ul className="mt-1.5 space-y-1 text-[12px] font-medium text-ink">
              <li className="flex justify-between gap-6">
                <span>Age 59½</span>
                <span className="text-ink-3">Nov 14</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Policy anniversary</span>
                <span className="text-ink-3">Nov 21</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Housiversary</span>
                <span className="text-ink-3">Dec 2</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
