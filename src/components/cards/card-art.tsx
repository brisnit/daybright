"use client";

import { clsx } from "clsx";
import { useId, type CSSProperties } from "react";
import type { CardDesign, HeadlineFont, MessageFont, StudioStyle } from "@/lib/types";
import * as Cat from "./art/catalog";
import { StudioArt } from "./art/studio";
import { Filters, Grain, H, W } from "./art/shared";

const CATALOG_ART = {
  "confetti-parade": Cat.ConfettiParade,
  "garden-arch": Cat.GardenArch,
  "big-type": Cat.BigType,
  "candle-glow": Cat.CandleGlow,
  "layer-cake": Cat.LayerCake,
  "balloon-bouquet": Cat.BalloonBouquet,
  sunburst: Cat.Sunburst,
  "paper-collage": Cat.PaperCollage,
  "midnight-sparkler": Cat.MidnightSparkler,
  "wildflower-row": Cat.WildflowerRow,
  "party-hats": Cat.PartyHats,
  postmark: Cat.Postmark,
  "citrus-toast": Cat.CitrusToast,
  "orbit-circles": Cat.OrbitCircles,
} as const;

/** Artwork only (no text). */
export function CardArtwork({ card, className }: { card: CardDesign; className?: string }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = `a${raw}`;
  let art: React.ReactNode;
  if (card.art.startsWith("studio:")) {
    art = (
      <StudioArt
        style={card.art.slice(7) as StudioStyle}
        motif={card.motif ?? "star"}
        layout={card.headlineLayout}
        variant={card.variant ?? 0}
        p={card.palette}
        id={id}
      />
    );
  } else {
    const Comp = CATALOG_ART[card.art as keyof typeof CATALOG_ART] ?? Cat.ConfettiParade;
    art = <Comp p={card.palette} id={id} />;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={clsx("absolute inset-0 size-full", className)} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <Filters id={id} />
      {art}
      <Grain id={id} opacity={0.5} />
    </svg>
  );
}

export const HEADLINE_FONTS: Record<HeadlineFont, CSSProperties> = {
  display: { fontFamily: "var(--font-fraunces)", fontWeight: 600, letterSpacing: "-0.02em", fontVariationSettings: '"SOFT" 100, "WONK" 1', lineHeight: 0.98 },
  bold: { fontFamily: "var(--font-bricolage)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 0.9 },
  retro: { fontFamily: "var(--font-shrikhand)", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.02 },
  script: { fontFamily: "var(--font-caveat)", fontWeight: 700, lineHeight: 0.95 },
  sans: { fontFamily: "var(--font-instrument)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 },
  "serif-italic": { fontFamily: "var(--font-fraunces)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.02, fontVariationSettings: '"SOFT" 100' },
};

const FONT_SCALE: Record<HeadlineFont, number> = { display: 1, bold: 1.05, retro: 0.95, script: 1.35, sans: 0.95, "serif-italic": 1.05 };

function headlineSize(text: string, font: HeadlineFont, layout: CardDesign["headlineLayout"]) {
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length), 4);
  const width = layout === "left" ? 62 : 84; // % of card width available
  let size = (width / longest) * 1.75 * FONT_SCALE[font];
  if (layout === "stacked") size *= 1.25;
  const maxByLines = 46 / lines.length;
  return Math.max(5.5, Math.min(size, layout === "stacked" ? 26 : 17, maxByLines));
}

const LAYOUT_STYLE: Record<CardDesign["headlineLayout"], CSSProperties> = {
  top: { top: "8%", left: "8%", right: "8%", textAlign: "center" },
  bottom: { bottom: "9%", left: "8%", right: "8%", textAlign: "center" },
  center: { top: "50%", left: "8%", right: "8%", transform: "translateY(-50%)", textAlign: "center" },
  left: { top: "50%", left: "9%", width: "62%", transform: "translateY(-50%)", textAlign: "left" },
  stacked: { top: "7%", left: "8%", right: "8%", textAlign: "left" },
};

/**
 * Card front: artwork + live headline text (kept separate so it's always editable and spelled right).
 */
export function CardFront({
  card,
  headline,
  live = false,
  className,
  rounded = "rounded-[6%/4.3%]",
  brandMark,
  shadow = true,
}: {
  card: CardDesign;
  headline?: string;
  live?: boolean;
  className?: string;
  rounded?: string;
  brandMark?: { name: string; color: string; logo?: string | null } | null;
  shadow?: boolean;
}) {
  const text = (headline ?? card.headline).trim() || " ";
  const size = headlineSize(text, card.headlineFont, card.headlineLayout);
  return (
    <div
      className={clsx(
        "relative aspect-[5/7] w-full overflow-hidden bg-white [container-type:inline-size]",
        rounded,
        shadow && "shadow-[0_1px_1px_rgb(28_24_56/0.08),0_14px_30px_-14px_rgb(28_24_56/0.45)]",
        live && card.animated && "card-live",
        className,
      )}
      role="img"
      aria-label={`${card.name} card: ${text.replace(/\n/g, " ")}`}
    >
      <CardArtwork card={card} />
      <p
        className="pointer-events-none absolute z-[2] whitespace-pre-line text-balance"
        style={{
          ...LAYOUT_STYLE[card.headlineLayout],
          ...HEADLINE_FONTS[card.headlineFont],
          color: card.headlineColor ?? card.palette.ink,
          fontSize: `${size}cqw`,
        }}
      >
        {text}
      </p>
      {brandMark && (
        <div className="absolute bottom-[3%] right-[4%] z-[2] flex items-center gap-[1.5cqw] rounded-full bg-white/85 py-[1cqw] pl-[1cqw] pr-[2.5cqw] shadow-sm backdrop-blur">
          {brandMark.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brandMark.logo} alt="" className="size-[5cqw] rounded-full object-cover" />
          ) : (
            <span className="grid size-[5cqw] place-items-center rounded-full text-[2.6cqw] font-bold text-white" style={{ background: brandMark.color }}>
              {initials(brandMark.name)}
            </span>
          )}
          <span className="text-[2.6cqw] font-semibold text-ink">{brandMark.name}</span>
        </div>
      )}
    </div>
  );
}

export const MESSAGE_FONTS: Record<MessageFont, { label: string; style: CSSProperties }> = {
  handwritten: { label: "Handwritten", style: { fontFamily: "var(--font-caveat)", fontSize: "1.55em", lineHeight: 1.18, fontWeight: 500 } },
  classic: { label: "Classic serif", style: { fontFamily: "var(--font-fraunces)", fontSize: "1.08em", lineHeight: 1.5, fontVariationSettings: '"SOFT" 50' } },
  modern: { label: "Modern", style: { fontFamily: "var(--font-instrument)", fontSize: "1em", lineHeight: 1.55, fontWeight: 500 } },
  typewriter: { label: "Typewriter", style: { fontFamily: "var(--font-courier)", fontSize: "0.95em", lineHeight: 1.55 } },
};

/** Inside of the card: the personal message. */
export function CardInside({
  message,
  font = "handwritten",
  recipientName,
  senderName,
  brand,
  accent,
  className,
  placeholder = "Your message will appear here.",
}: {
  message: string;
  font?: MessageFont;
  recipientName?: string;
  senderName?: string;
  brand?: { name: string; color: string; logo?: string | null } | null;
  accent?: string;
  className?: string;
  placeholder?: string;
}) {
  const hasSignOff = senderName ? message.toLowerCase().includes(senderName.toLowerCase().split(" ")[0]) : true;
  return (
    <div
      className={clsx(
        "relative flex aspect-[5/7] w-full flex-col overflow-hidden rounded-[6%/4.3%] bg-[#FFFDF8] p-[9%] text-ink [container-type:inline-size] shadow-[0_1px_1px_rgb(28_24_56/0.08),0_14px_30px_-14px_rgb(28_24_56/0.45)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[1.6%]" style={{ background: brand?.color ?? accent ?? "#FF6B57" }} />
      {recipientName && (
        <p className="mb-[4cqw] text-[3.6cqw] font-semibold uppercase tracking-[0.18em] text-ink-3">For {recipientName.split(" ")[0]}</p>
      )}
      <div className="flex-1 overflow-hidden text-[4.4cqw]">
        <p className="whitespace-pre-line text-pretty" style={MESSAGE_FONTS[font].style}>
          {message || <span className="text-ink-3/70">{placeholder}</span>}
        </p>
        {senderName && !hasSignOff && (
          <p className="mt-[4cqw]" style={MESSAGE_FONTS[font].style}>
            {senderName}
          </p>
        )}
      </div>
      {brand && (
        <div className="mt-[4cqw] flex items-center gap-[2cqw] border-t border-line pt-[4cqw]">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt="" className="size-[8cqw] rounded-[2cqw] object-cover" />
          ) : (
            <span className="grid size-[8cqw] place-items-center rounded-[2cqw] text-[3.4cqw] font-bold text-white" style={{ background: brand.color }}>
              {initials(brand.name)}
            </span>
          )}
          <span className="text-[3.6cqw] font-semibold">{brand.name}</span>
        </div>
      )}
    </div>
  );
}

export function initials(name: string) {
  return name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter((w) => w && /[A-Za-z]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
