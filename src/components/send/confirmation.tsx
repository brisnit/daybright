"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarCheck, Eye, MailCheck, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CardDesign, Send } from "@/lib/types";
import { money } from "@/config/brand";
import { GIFT_MAP } from "@/data/gifts";
import { CardFront } from "@/components/cards/card-art";
import { Envelope, type EnvelopeStage } from "@/components/cards/envelope";
import { Button, ButtonLink } from "@/components/ui/button";
import { SimulatedNote } from "@/components/ui/badges";
import { firstName } from "./lib";

const CONFETTI = ["#FF6B57", "#2446D8", "#FFD45C", "#6FD8B1", "#BBA6F6"];

export function Confirmation({ send, card, total, onSendAnother }: { send: Send; card: CardDesign; total: number | null; onSendAnother: () => void }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [stage, setStage] = useState<EnvelopeStage>(reduce ? "closed" : "open");
  const [burst, setBurst] = useState(false);
  const name = firstName(send.recipientName);
  const scheduled = send.status === "scheduled";
  const d = new Date(send.scheduledFor);
  const whenLabel = `${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  const gift = send.gift ? GIFT_MAP[send.gift.giftId] : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (reduce) return;
    const b = setTimeout(() => setStage("closed"), 1000);
    const c = setTimeout(() => setBurst(true), 1500);
    return () => [b, c].forEach(clearTimeout);
  }, [reduce]);

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 py-4 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <div className="relative mx-auto w-full max-w-[380px] pt-[82%]">
        <div className="absolute inset-x-0 bottom-0">
          <Envelope
            stage={stage}
            label={
              <span className="block font-hand text-[clamp(16px,4vw,22px)] leading-none text-ink">
                For {name || "you"}
              </span>
            }
          >
            <CardFront card={card} headline={send.headline} />
          </Envelope>
        </div>
        {burst && !reduce && (
          <div className="pointer-events-none absolute left-1/2 top-[62%]" aria-hidden>
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = (i / 30) * Math.PI * 2;
              const dist = 110 + (i % 4) * 34;
              return (
                <motion.span
                  key={i}
                  className="absolute block"
                  style={{
                    width: i % 3 ? 8 : 6,
                    height: i % 3 ? 14 : 6,
                    borderRadius: i % 3 ? 2 : 999,
                    background: CONFETTI[i % CONFETTI.length],
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: [0, Math.sin(angle) * dist - 40, Math.sin(angle) * dist + 70],
                    opacity: [1, 1, 0],
                    rotate: (i % 2 ? 1 : -1) * (180 + i * 12),
                    scale: 1,
                  }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          </div>
        )}
      </div>

      <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 1.1, duration: 0.4 }}>
        <p className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1 text-[13px] font-semibold text-mint-deep">
          {scheduled ? <CalendarCheck className="size-4" aria-hidden /> : <MailCheck className="size-4" aria-hidden />}
          {scheduled ? `Scheduled for ${whenLabel}` : "Sent"}
        </p>
        <h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-6xl">
          {scheduled ? (
            <>
              Sealed and <span className="italic text-cobalt">ready.</span>
            </>
          ) : (
            <>
              On its <span className="italic text-cobalt">way.</span>
            </>
          )}
        </h2>
        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-2">
          {scheduled
            ? `${name || "They"} will get your card at ${send.recipientEmail} on ${whenLabel}.`
            : `${name || "They"} will find your card at ${send.recipientEmail} in a moment.`}
          {gift && (gift.addressRequired && send.gift?.status === "awaiting-address"
            ? ` They'll add a shipping address for the ${gift.name.toLowerCase()} when they open it.`
            : ` The ${gift.name.toLowerCase()} comes with it.`)}
        </p>
        {total != null && <p className="mt-3 text-[14px] text-ink-3">Demo order total {money(total, { cents: true })}. No payment was taken.</p>}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/open?id=${encodeURIComponent(send.id)}`} size="lg" icon={<Eye className="size-4" aria-hidden />}>
            View recipient experience
          </ButtonLink>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              onSendAnother();
              router.push("/cards");
            }}
            icon={<RotateCcw className="size-4" aria-hidden />}
          >
            Send another card
          </Button>
        </div>
        <SimulatedNote className="mt-6">Delivery is simulated. No email is sent from this prototype.</SimulatedNote>
        <p className="mt-6 text-[14px] text-ink-3">
          Remembering birthdays for a whole client list?{" "}
          <Link href="/business" className="inline-flex items-center gap-1 font-semibold text-cobalt hover:underline">
            See business plans <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
