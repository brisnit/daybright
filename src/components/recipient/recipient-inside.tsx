"use client";

import { MESSAGE_FONTS, initials } from "@/components/cards/card-art";
import type { CardDesign, MessageFont } from "@/lib/types";

/**
 * The inside of the card as the recipient sees it: the message set large in the chosen font,
 * a few motifs from the card's palette, and the sender's branding at the foot.
 */
export function RecipientInside({
  card,
  message,
  font,
  recipientName,
  senderName,
  brand,
  accent,
}: {
  card: CardDesign;
  message: string;
  font: MessageFont;
  recipientName: string;
  senderName: string;
  brand: { name: string; color: string; logo: string | null } | null;
  accent: string;
}) {
  const len = message.length;
  const base = len < 110 ? 6.6 : len < 170 ? 5.9 : len < 240 ? 5.2 : len < 340 ? 4.6 : 4;
  const scale = font === "handwritten" ? 0.92 : font === "typewriter" ? 0.95 : 1;
  const first = senderName.split(" ")[0]?.toLowerCase() ?? "";
  const signed = !first || message.toLowerCase().includes(first);
  const p = card.palette;

  return (
    <div className="relative flex aspect-[5/7] w-full flex-col overflow-hidden rounded-[6%/4.3%] bg-[#FFFDF8] text-ink shadow-[0_1px_1px_rgb(28_24_56/0.08),0_14px_30px_-14px_rgb(28_24_56/0.45)] [container-type:inline-size]">
      {/* fold shadow on the left edge, like the inside of a folded card */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-ink/[0.06] to-transparent" aria-hidden />
      <svg viewBox="0 0 100 140" className="pointer-events-none absolute inset-0 size-full" aria-hidden preserveAspectRatio="none">
        <circle cx="92" cy="6" r="2.2" fill={p.a} />
        <circle cx="86" cy="11" r="1.1" fill={p.b} />
        <rect x="94" y="14" width="2.6" height="2.6" rx=".5" fill={p.c} transform="rotate(20 95 15)" />
        <circle cx="7" cy="134" r="1.6" fill={p.b} />
        <rect x="11" y="130" width="2.4" height="2.4" rx=".5" fill={p.a} transform="rotate(-18 12 131)" />
      </svg>
      <div className="relative flex flex-1 flex-col px-[10%] pb-[8%] pt-[11%]">
        <p className="text-[3.4cqw] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
          For {recipientName.split(" ")[0]}
        </p>
        <div className="flex flex-1 flex-col justify-center py-[5cqw]" style={{ fontSize: `${base * scale}cqw` }}>
          <p className="whitespace-pre-line text-pretty text-ink" style={MESSAGE_FONTS[font].style}>
            {message}
          </p>
          {!signed && (
            <p className="mt-[0.6em] text-ink-2" style={MESSAGE_FONTS[font].style}>
              {senderName}
            </p>
          )}
        </div>
        {brand && (
          <div className="flex items-center gap-[2.4cqw] border-t border-line pt-[4cqw]">
            {brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt="" className="size-[9cqw] rounded-[2.4cqw] object-cover" />
            ) : (
              <span className="grid size-[9cqw] place-items-center rounded-[2.4cqw] text-[3.6cqw] font-bold text-white" style={{ background: brand.color }}>
                {initials(brand.name)}
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[3.8cqw] font-semibold text-ink">{brand.name}</p>
              <p className="truncate text-[3.2cqw] text-ink-3">{senderName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
