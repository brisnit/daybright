"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Mic, PenLine, Sparkle } from "lucide-react";
import type { CardDesign, SendDraft } from "@/lib/types";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { Segmented } from "@/components/ui/controls";
import { DemoPhoto } from "./demo-photos";

/** Live preview: front + inside side by side (desktop) or toggled (mobile). */
export function SendPreview({ card, draft, className }: { card: CardDesign; draft: SendDraft; className?: string }) {
  const [side, setSide] = useState<"front" | "inside">("inside");
  const inside = (
    <CardInside
      message={draft.message}
      font={draft.messageFont}
      recipientName={draft.recipientName}
      senderName={draft.senderName}
      accent={card.palette.a}
      placeholder="Your message will appear here as you type."
    />
  );
  const front = <CardFront card={card} headline={draft.headline} live={!!draft.extras.animatedReveal || card.animated} />;
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">Live preview</p>
        <Segmented
          size="sm"
          ariaLabel="Preview side"
          value={side}
          onChange={setSide}
          options={[
            { value: "front", label: "Front" },
            { value: "inside", label: "Inside" },
          ]}
        />
      </div>
      <div className="mt-3 lg:hidden">
        <div className="mx-auto w-[min(50%,200px)]">{side === "front" ? front : inside}</div>
      </div>
      <div className="hidden lg:block">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">Live preview</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>{front}</div>
          <div>{inside}</div>
        </div>
      </div>
      <ExtrasSummary draft={draft} />
    </div>
  );
}

export function ExtrasSummary({ draft, className }: { draft: SendDraft; className?: string }) {
  const x = draft.extras;
  const sigs = (x.groupSignatures ?? []).filter((s) => s.name.trim());
  const photos = x.photoMemories ?? [];
  if (!x.animatedReveal && !x.recordedGreeting && !sigs.length && !photos.length) return null;
  return (
    <div className={clsx("mt-4 rounded-2xl bg-white/80 p-3.5 ring-1 ring-inset ring-line", className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">Also inside</p>
      <ul className="mt-2 flex flex-col gap-1.5 text-[13px] text-ink-2">
        {x.animatedReveal && (
          <li className="flex items-center gap-2">
            <Sparkle className="size-3.5 text-butter-deep" aria-hidden /> Animated reveal when they open it
          </li>
        )}
        {x.recordedGreeting && (
          <li className="flex items-center gap-2">
            <Mic className="size-3.5 text-coral-deep" aria-hidden /> {x.recordedGreeting.label} · 0:{String(x.recordedGreeting.durationSec).padStart(2, "0")}
          </li>
        )}
        {sigs.length > 0 && (
          <li className="flex items-center gap-2">
            <PenLine className="size-3.5 text-cobalt" aria-hidden /> Signed by {sigs.map((s) => s.name.trim()).join(", ")}
          </li>
        )}
      </ul>
      {photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {photos.map((p, i) => (
            <DemoPhoto key={p} id={p} caption="" tilt={[-4, 3, -2][i] ?? 0} className="w-16" />
          ))}
        </div>
      )}
    </div>
  );
}
