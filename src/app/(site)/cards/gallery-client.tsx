"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowRight, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { CardDesign, CardRecipient, CardStyle, ColorFamily } from "@/lib/types";
import { CARDS, COLOR_SWATCHES, RECIPIENT_LABELS, STYLE_LABELS } from "@/data/cards";
import { CONSUMER, money } from "@/config/brand";
import { useDemo } from "@/lib/store";
import { STUDIO_EXAMPLES } from "@/lib/cards";
import { CardTile } from "@/components/cards/card-tile";
import { CardFront } from "@/components/cards/card-art";
import { HydrationGate } from "@/components/hydration-gate";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/controls";
import { Drawer } from "@/components/ui/overlay";
import { Badge } from "@/components/ui/badges";

type Format = "animated" | "static";
type Filters = { style: CardStyle[]; recipient: CardRecipient[]; format: Format[]; color: ColorFamily[] };
type Group = keyof Filters;

const EMPTY: Filters = { style: [], recipient: [], format: [], color: [] };

const STYLES = Object.keys(STYLE_LABELS) as CardStyle[];
const RECIPIENTS = Object.keys(RECIPIENT_LABELS) as CardRecipient[];
const FORMATS: { id: Format; label: string }[] = [
  { id: "animated", label: "Animated" },
  { id: "static", label: "Still" },
];
const COLORS = Object.keys(COLOR_SWATCHES) as ColorFamily[];

function matches(card: CardDesign, f: Filters, skip?: Group) {
  if (skip !== "style" && f.style.length && !f.style.some((s) => card.styles.includes(s))) return false;
  if (skip !== "recipient" && f.recipient.length && !f.recipient.some((r) => card.recipients.includes(r))) return false;
  if (skip !== "format" && f.format.length && !f.format.includes(card.animated ? "animated" : "static")) return false;
  if (skip !== "color" && f.color.length && !f.color.includes(card.color)) return false;
  return true;
}

function countFor(f: Filters, group: Group, value: string) {
  return CARDS.filter((c) => {
    if (!matches(c, f, group)) return false;
    if (group === "style") return c.styles.includes(value as CardStyle);
    if (group === "recipient") return c.recipients.includes(value as CardRecipient);
    if (group === "format") return (c.animated ? "animated" : "static") === value;
    return c.color === value;
  }).length;
}

function labelFor(group: Group, value: string) {
  if (group === "style") return STYLE_LABELS[value as CardStyle];
  if (group === "recipient") return `For a ${RECIPIENT_LABELS[value as CardRecipient].toLowerCase()}`;
  if (group === "format") return FORMATS.find((x) => x.id === value)?.label ?? value;
  return COLOR_SWATCHES[value as ColorFamily].label;
}

export function CardGallery() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);

  const results = useMemo(() => CARDS.filter((c) => matches(c, filters)), [filters]);
  const active = (Object.keys(filters) as Group[]).flatMap((g) => filters[g].map((v) => ({ group: g, value: v as string })));

  function toggle<G extends Group>(group: G, value: Filters[G][number]) {
    setFilters((f) => {
      const list = f[group] as string[];
      const next = list.includes(value as string) ? list.filter((v) => v !== value) : [...list, value as string];
      return { ...f, [group]: next };
    });
  }
  const clear = () => setFilters(EMPTY);

  const panel = <FilterPanel filters={filters} toggle={toggle} />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      {/* Masthead */}
      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-grotesk text-[13px] font-bold uppercase tracking-[0.18em] text-coral-deep">The card collection</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl">
            A card for every kind of <span className="italic text-cobalt">birthday person.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-2">
            {CARDS.length} original designs, each with room for your own words. {money(CONSUMER.digitalCardPrice)} to send one, or included with every business plan.
          </p>
        </div>
        <Link
          href="/search"
          className="group flex h-14 w-full items-center gap-3 rounded-full bg-white px-5 text-left text-[15px] text-ink-3 shadow-soft ring-1 ring-inset ring-line-2 transition hover:ring-ink/30 lg:w-[380px]"
        >
          <Search className="size-5 shrink-0 text-ink-2" aria-hidden />
          <span className="flex-1 truncate">Describe who it&rsquo;s for&hellip;</span>
          <span className="hidden rounded-full bg-ink/5 px-2.5 py-1 text-[12px] font-semibold text-ink-2 sm:inline">Search cards &amp; gifts</span>
        </Link>
      </header>

      <HydrationGate fallback={null}>
        <MyCards />
      </HydrationGate>

      {/* Mobile filter bar */}
      <div className="sticky top-16 z-30 -mx-4 mt-10 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <Button variant="ink" size="sm" onClick={() => setSheet(true)} icon={<SlidersHorizontal className="size-3.5" aria-hidden />} className="shrink-0">
            Filters{active.length ? ` · ${active.length}` : ""}
          </Button>
          {active.length === 0 &&
            STYLES.map((s) => (
              <Chip key={s} onClick={() => toggle("style", s)} className="shrink-0">
                {STYLE_LABELS[s]}
              </Chip>
            ))}
          {active.map((a) => (
            <Chip key={a.group + a.value} active onRemove={() => toggle(a.group, a.value as never)} className="shrink-0">
              {labelFor(a.group, a.value)}
            </Chip>
          ))}
        </div>
      </div>
      <Drawer
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filter cards"
        description={`${results.length} of ${CARDS.length} designs`}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={clear} disabled={!active.length}>
              Clear all
            </Button>
            <Button onClick={() => setSheet(false)}>Show {results.length} cards</Button>
          </div>
        }
      >
        {panel}
      </Drawer>

      <div className="mt-6 grid gap-10 lg:mt-14 lg:grid-cols-[232px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24">
            <div className="flex items-baseline justify-between">
              <p className="font-grotesk text-sm font-bold text-ink">Filter</p>
              <button
                type="button"
                onClick={clear}
                disabled={!active.length}
                className="text-[13px] font-semibold text-cobalt underline-offset-4 hover:underline disabled:text-ink-3/60 disabled:no-underline"
              >
                Clear all
              </button>
            </div>
            <div className="mt-4">{panel}</div>
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-heading" className="text-[15px] text-ink-2" aria-live="polite">
              <span className="font-grotesk text-lg font-bold text-ink">{results.length}</span> {results.length === 1 ? "design" : "designs"}
              {active.length > 0 && <span className="text-ink-3"> match your filters</span>}
            </h2>
            {active.length > 0 && (
              <div className="hidden flex-wrap items-center gap-2 lg:flex">
                {active.map((a) => (
                  <Chip key={a.group + a.value} active onRemove={() => toggle(a.group, a.value as never)}>
                    {labelFor(a.group, a.value)}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState onClear={clear} />
          ) : (
            <motion.ul layout className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
              <AnimatePresence initial={false} mode="popLayout">
                {results.flatMap((card, i) => {
                  const tile = (
                    <motion.li
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.22 }}
                    >
                      <CardTile card={card} href={`/cards/${card.id}`} />
                    </motion.li>
                  );
                  return i === Math.min(4, results.length - 1) ? [tile, <StudioTile key="studio-tile" />] : [tile];
                })}
              </AnimatePresence>
            </motion.ul>
          )}

          <StudioBanner />
        </section>
      </div>
    </div>
  );
}

function FilterPanel({ filters, toggle }: { filters: Filters; toggle: <G extends Group>(g: G, v: Filters[G][number]) => void }) {
  return (
    <div className="flex flex-col gap-7">
      <FilterGroup title="Style">
        {STYLES.map((s) => (
          <CheckRow key={s} checked={filters.style.includes(s)} onChange={() => toggle("style", s)} count={countFor(filters, "style", s)}>
            {STYLE_LABELS[s]}
          </CheckRow>
        ))}
      </FilterGroup>
      <FilterGroup title="Recipient">
        {RECIPIENTS.map((r) => (
          <CheckRow key={r} checked={filters.recipient.includes(r)} onChange={() => toggle("recipient", r)} count={countFor(filters, "recipient", r)}>
            {RECIPIENT_LABELS[r]}
          </CheckRow>
        ))}
      </FilterGroup>
      <FilterGroup title="Format">
        {FORMATS.map((f) => (
          <CheckRow key={f.id} checked={filters.format.includes(f.id)} onChange={() => toggle("format", f.id)} count={countFor(filters, "format", f.id)}>
            {f.label}
            {f.id === "animated" && <span className="ml-1.5 text-[12px] text-ink-3">gentle motion</span>}
          </CheckRow>
        ))}
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map((c) => {
            const on = filters.color.includes(c);
            const n = countFor(filters, "color", c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => toggle("color", c)}
                disabled={n === 0 && !on}
                className={clsx(
                  "flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-[12px] font-semibold transition disabled:opacity-35",
                  on ? "bg-white text-ink shadow-soft ring-2 ring-ink" : "text-ink-2 hover:bg-white/70",
                )}
              >
                <span
                  className="size-8 rounded-full ring-1 ring-inset ring-black/10"
                  style={{ background: COLOR_SWATCHES[c].hex }}
                  aria-hidden
                />
                <span>
                  {COLOR_SWATCHES[c].label} <span className="font-normal text-ink-3">{n}</span>
                </span>
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">{title}</legend>
      <div className="flex flex-col gap-0.5">{children}</div>
    </fieldset>
  );
}

function CheckRow({ checked, onChange, count, children }: { checked: boolean; onChange: () => void; count: number; children: React.ReactNode }) {
  const disabled = count === 0 && !checked;
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-[15px] transition hover:bg-white/80",
        disabled && "cursor-default opacity-40 hover:bg-transparent",
      )}
    >
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} disabled={disabled} />
      <span
        aria-hidden
        className={clsx(
          "grid size-5 shrink-0 place-items-center rounded-md ring-1 ring-inset transition peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt",
          checked ? "bg-ink ring-ink" : "bg-white ring-line-2",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3 text-paper">
            <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex-1 font-medium text-ink">{children}</span>
      <span className="font-grotesk text-[13px] tabular-nums text-ink-3">{count}</span>
    </label>
  );
}

function StudioTile() {
  const sample = CARDS.find((c) => c.id === "garden-arch") ?? CARDS[0];
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Link
        href="/studio"
        className="group relative flex aspect-[5/7] flex-col justify-between overflow-hidden rounded-[6%/4.3%] bg-ink p-5 text-paper shadow-[0_14px_30px_-14px_rgb(28_24_56/0.6)] transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="pointer-events-none absolute -right-[12%] -top-[3%] w-[52%] rotate-[12deg] transition-transform duration-500 group-hover:rotate-[5deg]" aria-hidden>
          <CardFront card={sample} headline={"Yours,\nonly"} shadow={false} />
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-butter px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
            <Sparkles className="size-3" aria-hidden /> Card Studio
          </span>
        </div>
        <div className="relative">
          <p className="font-display text-[26px] font-semibold leading-[1] tracking-tight sm:text-[30px]">Create an original with AI</p>
          <p className="mt-2 text-[13px] leading-snug text-paper/70">Describe them in a sentence. Get three designs made for them.</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-butter">
            Start creating <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

const PROMPTS = [
  "A card for a coworker who lives on cold brew",
  "Something elegant for a longtime client",
  "My sister, who is restoring a 1970s camper",
];

function StudioBanner() {
  return (
    <div className="relative mt-20 overflow-hidden rounded-[2rem] bg-cobalt px-6 py-10 text-white sm:px-12 sm:py-14">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-butter/90" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-40 size-56 rounded-full bg-coral/80" />
      <div className="relative max-w-2xl">
        <p className="font-hand text-2xl text-butter">Not quite them?</p>
        <h2 className="mt-1 font-display text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl">
          Describe the person. We&rsquo;ll draft three cards that could only be theirs.
        </h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <Link
              key={p}
              href={`/studio?prompt=${encodeURIComponent(p)}`}
              className="rounded-full bg-white/12 px-3.5 py-1.5 text-[13px] font-medium text-white ring-1 ring-inset ring-white/30 transition hover:bg-white/20"
            >
              &ldquo;{p}&rdquo;
            </Link>
          ))}
        </div>
        <ButtonLink href="/studio" variant="white" size="lg" className="mt-8" iconRight={<ArrowRight className="size-4" aria-hidden />}>
          Create a card with AI
        </ButtonLink>
      </div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-6 rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-line">
      <p className="font-display text-3xl font-semibold tracking-tight text-ink">Nothing matches all of those.</p>
      <p className="mx-auto mt-2 max-w-md text-ink-2">Loosen a filter or two, or describe exactly what you have in mind and Card Studio will draft it.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={onClear} icon={<X className="size-4" aria-hidden />}>
          Clear all filters
        </Button>
        <ButtonLink href="/studio" icon={<Sparkles className="size-4" aria-hidden />}>
          Create an original
        </ButtonLink>
      </div>
    </div>
  );
}

function MyCards() {
  const saved = useDemo((s) => s.savedCards);
  // Seeded business originals belong to the demo workspace, not the shopper.
  const mine = saved.filter((c) => c.source === "studio" && !STUDIO_EXAMPLES.some((e) => e.id === c.id));
  if (!mine.length) return null;
  return (
    <section aria-labelledby="my-cards" className="mt-12 rounded-[2rem] bg-lilac-soft/70 p-5 ring-1 ring-inset ring-lilac/40 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-hand text-xl text-lilac-deep">made by you</p>
          <h2 id="my-cards" className="font-display text-3xl font-semibold tracking-tight text-ink">
            My cards
          </h2>
        </div>
        <ButtonLink href="/studio" variant="outline" size="sm" icon={<Sparkles className="size-3.5" aria-hidden />}>
          Make another
        </ButtonLink>
      </div>
      <ul className="no-scrollbar -mx-5 mt-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
        {mine.map((c) => (
          <li key={c.id} className="w-40 shrink-0 snap-start sm:w-48">
            <CardTile card={c} href={`/send?card=${encodeURIComponent(c.id)}`} badge={<Badge tone="lilac">Original</Badge>} />
            <div className="mt-2 flex gap-3 px-0.5 text-[13px] font-semibold">
              <Link href={`/send?card=${encodeURIComponent(c.id)}`} className="text-cobalt hover:underline">
                Send
              </Link>
              <Link href={`/studio?card=${encodeURIComponent(c.id)}`} className="text-ink-3 hover:text-ink hover:underline">
                Edit in Studio
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
