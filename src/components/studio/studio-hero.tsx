import type { CardDesign } from "@/lib/types";
import { STUDIO_EXAMPLES } from "@/lib/cards";
import { PALETTES } from "@/data/palettes";
import { CardFront } from "@/components/cards/card-art";

const THIRD: CardDesign = {
  ...STUDIO_EXAMPLES[0],
  id: "hero-coffee",
  art: "studio:bold-type",
  motif: "coffee",
  variant: 0,
  palette: { ...PALETTES["cobalt-pop"] },
  headline: "Espresso\nyourself",
  headlineFont: "bold",
  headlineLayout: "stacked",
};

/** Editorial intro for the public Card Studio page. */
export function StudioHero() {
  return (
    <div className="grid items-end gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_380px]">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-coral-deep">AI Card Studio</p>
        <h1 className="mt-3 font-display text-[44px] font-semibold leading-[0.95] tracking-tight sm:text-7xl">
          Describe the card.
          <br />
          <span className="font-display-wonk italic text-cobalt">We’ll sketch three.</span>
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-2">
          One sentence about who it’s for and what they love. You get three original directions to compare, then refine the one that
          feels right. Every headline, color and word stays yours to change.
        </p>
      </div>
      <div className="relative hidden h-[250px] md:block lg:h-[290px]" aria-hidden>
        <div className="absolute bottom-2 left-0 w-[34%] -rotate-[8deg]">
          <CardFront card={STUDIO_EXAMPLES[1]} />
        </div>
        <div className="absolute bottom-8 left-[33%] z-[1] w-[34%] rotate-[1deg]">
          <CardFront card={THIRD} />
        </div>
        <div className="absolute bottom-0 right-0 w-[34%] rotate-[8deg]">
          <CardFront card={STUDIO_EXAMPLES[0]} />
        </div>
        <span className="absolute -top-2 left-[8%] font-hand text-2xl text-ink-2 -rotate-6">three ways to say it</span>
      </div>
    </div>
  );
}

export function StudioFallback() {
  return (
    <div aria-busy="true" aria-label="Loading Card Studio">
      <div className="h-56 rounded-[2rem] skeleton" />
      <div className="mt-4 h-72 rounded-[2rem] skeleton" />
    </div>
  );
}
