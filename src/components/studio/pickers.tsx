"use client";

import { clsx } from "clsx";
import { Check } from "lucide-react";
import type { CardDesign, Motif, Palette, PaletteId, StudioStyle } from "@/lib/types";
import { STUDIO_STYLES, resolvePalette } from "@/lib/ai/studio";
import { PALETTES, PALETTE_ORDER } from "@/data/palettes";
import { CardArtwork } from "@/components/cards/card-art";

const STYLE_PREVIEW_PALETTE: Record<StudioStyle, Exclude<PaletteId, "brand">> = {
  "bold-type": "cobalt-pop",
  editorial: "sunny",
  watercolor: "garden",
  collage: "linen",
  retro: "sorbet",
  minimal: "midnight",
};

/** Visual style picker with live mini artwork swatches that follow the chosen motif. */
export function StylePicker({
  value,
  onChange,
  motif = "star",
  auto,
}: {
  value: StudioStyle | "any";
  onChange: (v: StudioStyle | "any") => void;
  motif?: Motif;
  /** Style that was picked up from the sentence (shown with a small marker). */
  auto?: StudioStyle | null;
}) {
  return (
    <div role="radiogroup" aria-label="Visual style" className="grid grid-cols-3 gap-2 sm:grid-cols-7">
      <button
        type="button"
        role="radio"
        aria-checked={value === "any"}
        onClick={() => onChange("any")}
        className={clsx(
          "group flex flex-col items-stretch gap-1.5 rounded-2xl p-1.5 text-left ring-1 ring-inset transition",
          value === "any" ? "bg-ink text-paper ring-ink" : "bg-white ring-line hover:ring-ink/30",
        )}
      >
        <span className={clsx("grid aspect-[5/7] place-items-center rounded-xl border border-dashed text-center", value === "any" ? "border-paper/40" : "border-line-2")}>
          <span className="px-1 font-display text-[13px] italic leading-tight">Mix of three</span>
        </span>
        <span className="px-0.5 text-[11.5px] font-semibold leading-tight">Studio picks</span>
      </button>
      {STUDIO_STYLES.map((s) => {
        const active = value === s.id;
        const card: CardDesign = {
          id: `swatch-${s.id}`,
          name: s.label,
          tagline: "",
          art: `studio:${s.id}`,
          motif,
          variant: 0,
          palette: resolvePalette(STYLE_PREVIEW_PALETTE[s.id]),
          headline: "",
          headlineFont: "display",
          headlineLayout: "top",
          styles: [],
          recipients: [],
          animated: false,
          color: "cobalt",
          description: "",
          keywords: [],
        };
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={s.blurb}
            onClick={() => onChange(s.id)}
            className={clsx(
              "group relative flex flex-col items-stretch gap-1.5 rounded-2xl p-1.5 text-left ring-1 ring-inset transition",
              active ? "bg-ink text-paper ring-ink" : "bg-white ring-line hover:ring-ink/30",
            )}
          >
            <span className="relative block aspect-[5/7] overflow-hidden rounded-xl transition-transform duration-300 group-hover:-rotate-2">
              <CardArtwork card={card} />
            </span>
            <span className="px-0.5 text-[11.5px] font-semibold leading-tight">{s.label}</span>
            {active && (
              <span className="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-white text-ink shadow">
                <Check className="size-3" aria-hidden />
              </span>
            )}
            {!active && auto === s.id && (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-1.5 py-px text-[9.5px] font-bold uppercase tracking-wide text-lilac-deep shadow-sm">
                From your idea
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function PaletteDots({ p, className }: { p: Palette; className?: string }) {
  return (
    <span className={clsx("relative inline-block size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-ink/10", className)} style={{ background: p.bg }} aria-hidden>
      <span className="absolute left-[18%] top-[22%] size-[34%] rounded-full" style={{ background: p.a }} />
      <span className="absolute right-[16%] top-[30%] size-[26%] rounded-full" style={{ background: p.b }} />
      <span className="absolute bottom-[14%] left-[38%] size-[28%] rounded-full" style={{ background: p.c }} />
    </span>
  );
}

/** Palette swatches. `includeAny` adds "Studio's choice"; `brandColor` adds "Our brand colors". */
export function PalettePicker({
  value,
  onChange,
  brandColor,
  includeAny = true,
  auto,
  size = "md",
}: {
  value: PaletteId | "any" | null;
  onChange: (v: PaletteId | "any") => void;
  brandColor?: string;
  includeAny?: boolean;
  auto?: PaletteId | null;
  size?: "sm" | "md";
}) {
  const options: { id: PaletteId | "any"; label: string; p: Palette | null }[] = [
    ...(includeAny ? [{ id: "any" as const, label: "Studio's choice", p: null }] : []),
    ...(brandColor ? [{ id: "brand" as const, label: "Our brand colors", p: resolvePalette("brand", brandColor) }] : []),
    ...PALETTE_ORDER.map((id) => ({ id, label: PALETTES[id].label, p: resolvePalette(id) })),
  ];
  return (
    <div role="radiogroup" aria-label="Color palette" className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[12.5px] font-semibold ring-1 ring-inset transition",
              active ? "bg-ink text-paper ring-ink" : "bg-white text-ink-2 ring-line hover:ring-ink/30",
              size === "sm" && "py-0.5 pr-2.5 text-[12px]",
            )}
          >
            {o.p ? (
              <PaletteDots p={o.p} className={size === "sm" ? "size-7" : undefined} />
            ) : (
              <span className={clsx("grid shrink-0 place-items-center rounded-full border border-dashed border-current/40 font-display text-[11px] italic", size === "sm" ? "size-7" : "size-9")}>
                Any
              </span>
            )}
            {o.label}
            {o.id === "brand" && brandColor && <span className="size-2.5 rounded-full ring-1 ring-white/50" style={{ background: brandColor }} aria-hidden />}
            {!active && auto === o.id && <span className="text-[10px] font-bold uppercase tracking-wide text-lilac-deep">From your idea</span>}
          </button>
        );
      })}
    </div>
  );
}
