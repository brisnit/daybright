"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { money } from "@/config/brand";
import { GIFT_MAP } from "@/data/gifts";
import { CARD_MAP } from "@/data/cards";
import { STUDIO_STYLES, briefFromText, generateConceptsSync, type Concept } from "@/lib/ai/studio";
import { draftMessagesSync } from "@/lib/ai/messages";
import type { StudioStyle } from "@/lib/types";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { GiftArt } from "@/components/gifts/gift-art";
import { AIDemoLabel } from "@/components/ui/badges";
import { Container, Display, Eyebrow, Reveal, StepNumber } from "./primitives";

export const GARDEN_PROMPT =
  "Create a birthday card for a customer who loves gardening. Colorful, warm, and a little funny.";

/** Style chips shown under the sample prompt. Each one maps to a Studio visual style. */
const CHIP_STYLES: StudioStyle[] = ["watercolor", "editorial", "collage", "retro"];
const STYLE_PHRASE: Record<StudioStyle, string> = {
  watercolor: "Watercolor botanicals.",
  editorial: "Editorial illustration.",
  collage: "Playful collage.",
  retro: "Retro celebration.",
  "bold-type": "Bold typography.",
  minimal: "Elegant minimalism.",
};

function withStyle(prompt: string, style: StudioStyle | null) {
  let base = prompt;
  for (const phrase of Object.values(STYLE_PHRASE)) base = base.replace(` ${phrase}`, "").replace(phrase, "");
  base = base.trim();
  return style ? `${base} ${STYLE_PHRASE[style]}` : base;
}

export function IdeaToDelight() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(GARDEN_PROMPT);
  const [style, setStyle] = useState<StudioStyle | null>(null);
  const [concepts, setConcepts] = useState<Concept[] | null>(null);

  // Concepts use uid()/dates, so compute only on the client, debounced while typing.
  useEffect(() => {
    const t = setTimeout(() => {
      const text = prompt.trim() || GARDEN_PROMPT;
      setConcepts(generateConceptsSync(briefFromText(text, style ? { style } : {})));
    }, concepts ? 450 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, style]);

  const message = useMemo(
    () =>
      draftMessagesSync({
        recipientName: "Rosa",
        senderName: "Maya",
        notes: "Talks about her tomato beds every time we see her.",
        interests: ["gardening"],
        relationship: "customer",
      })[0].text,
    [],
  );
  const gift = GIFT_MAP["garden-kit"];
  const finalCard = concepts?.[0] ?? CARD_MAP["garden-arch"];

  const open = () => {
    const text = withStyle(prompt.trim() || GARDEN_PROMPT, style);
    router.push(`/studio?prompt=${encodeURIComponent(text)}`);
  };

  return (
    <section aria-labelledby="idea-title" className="relative py-20 sm:py-28">
      <Container>
        <Reveal className="max-w-4xl">
          <Eyebrow tone="lilac">AI Card Studio</Eyebrow>
          <Display id="idea-title" className="mt-4 text-[2.6rem] leading-[0.98] text-ink sm:text-6xl lg:text-7xl">
            From <span className="italic text-mint-deep">&ldquo;they love gardening&rdquo;</span> to{" "}
            <span className="italic text-coral-deep">&ldquo;you absolutely nailed it.&rdquo;</span>
          </Display>
          <p className="mt-5 max-w-2xl text-lg text-ink-2">
            Start with one sentence about the person. You get three original designs, a message that sounds like you, and a gift
            idea if you want one. Try it right here.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          {/* 1. Idea (working sample) */}
          <Reveal className="rounded-[2rem] bg-ink p-6 text-paper sm:p-8 lg:col-span-5">
            <StepHead n={1} title="A short idea" dark />
            <form
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                open();
              }}
            >
              <label htmlFor="idea-prompt" className="text-[13px] font-semibold text-paper/70">
                Describe who it&rsquo;s for
              </label>
              <textarea
                id="idea-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-2xl bg-white/10 p-4 font-display text-xl leading-snug text-paper ring-1 ring-white/15 placeholder:text-paper/40 focus:outline-none focus:ring-2 focus:ring-butter"
              />
              <fieldset className="mt-4">
                <legend className="text-[13px] font-semibold text-paper/70">Pick a style (optional)</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CHIP_STYLES.map((s) => {
                    const label = STUDIO_STYLES.find((x) => x.id === s)?.label ?? s;
                    const active = style === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setStyle(active ? null : s)}
                        className={clsx(
                          "h-9 rounded-full px-3.5 text-[13px] font-semibold ring-1 ring-inset transition",
                          active ? "bg-butter text-ink ring-butter" : "bg-transparent text-paper/85 ring-white/25 hover:ring-white/60",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <button
                type="submit"
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-butter px-6 text-[15px] font-semibold text-ink transition hover:bg-[#ffdd7a] sm:w-auto"
              >
                <Sparkles className="size-4" aria-hidden />
                Open in Card Studio
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <p className="mt-3 text-[13px] text-paper/60">Opens the full studio with this idea. Nothing is sent.</p>
            </form>
          </Reveal>

          {/* 2. Three concepts */}
          <Reveal delay={0.08} className="relative overflow-hidden rounded-[2rem] bg-lilac-soft p-6 sm:p-8 lg:col-span-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <StepHead n={2} title="Three original concepts" />
              <AIDemoLabel />
            </div>
            <p className="mt-2 max-w-md text-[15px] text-ink-2">
              Different styles from the same idea. Change the sentence or pick a style and they update.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-5" aria-live="polite">
              {[0, 1, 2].map((i) => {
                const c = concepts?.[i];
                return (
                  <div key={i} className={clsx(i === 1 && "sm:-translate-y-3", i === 2 && "sm:translate-y-2")}>
                    <AnimatePresence mode="wait">
                      {c ? (
                        <motion.div
                          key={`${c.art}-${c.motif}-${c.headline}-${c.palette.bg}`}
                          initial={{ opacity: 0, y: 10, rotate: i === 1 ? 0 : i === 0 ? -2 : 2 }}
                          animate={{ opacity: 1, y: 0, rotate: i === 1 ? 0 : i === 0 ? -2 : 2 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.35, delay: i * 0.06 }}
                        >
                          <CardFront card={c} live />
                          <p className="mt-2 line-clamp-2 text-[12px] font-semibold leading-snug text-ink-2 sm:text-[13px]">{c.name}</p>
                        </motion.div>
                      ) : (
                        <div className="aspect-[5/7] w-full rounded-[6%/4.3%] skeleton" />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* 3. Personalized message */}
          <Reveal className="rounded-[2rem] bg-butter-soft p-6 sm:p-8 lg:col-span-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <StepHead n={3} title="A personalized message" />
              <AIDemoLabel />
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-line">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">From your note</p>
                <p className="mt-1 text-[14px] text-ink-2">&ldquo;Talks about her tomato beds every time we see her.&rdquo;</p>
                <p className="mt-3 font-hand text-[22px] leading-[1.15] text-ink">{message}</p>
              </div>
              <div className="hidden w-28 rotate-3 sm:block">
                <CardInside message={message} font="handwritten" recipientName="Rosa" accent="#FF6B57" />
              </div>
            </div>
            <p className="mt-4 text-[13px] text-ink-3">Uses only what you told it. Edit every word before it goes anywhere.</p>
          </Reveal>

          {/* 4. Optional gift */}
          <Reveal delay={0.06} className="rounded-[2rem] bg-mint-soft p-6 sm:p-8 lg:col-span-3">
            <StepHead n={4} title="A matching gift, if you like" />
            <GiftArt gift={gift} className="mt-5 shadow-soft" />
            <p className="mt-3 font-semibold text-ink">{gift.name}</p>
            <p className="text-[14px] text-ink-2">
              {money(gift.price ?? 0)} + {money(gift.shipping)} shipping
            </p>
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[13px] font-medium text-mint-deep">
              Or skip it. The card on its own is the whole gift.
            </p>
          </Reveal>

          {/* 5. Recipient experience */}
          <Reveal delay={0.12} className="relative flex flex-col overflow-hidden rounded-[2rem] bg-coral-soft p-6 sm:p-8 lg:col-span-4">
            <StepHead n={5} title="The moment they open it" />
            <div className="relative mx-auto mt-5 w-44 rounded-[1.75rem] bg-ink p-2 shadow-lift">
              <div className="overflow-hidden rounded-[1.35rem] bg-paper px-3 pb-4 pt-5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">A little birthday something</p>
                <div className="mx-auto mt-3 w-[78%] -rotate-2">
                  <CardFront card={finalCard} live />
                </div>
                <p className="mt-3 font-hand text-lg leading-none text-ink">Tap to open</p>
              </div>
            </div>
            <Link
              href="/open?id=demo-gift"
              className="mt-6 inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft ring-1 ring-line transition hover:ring-ink/30"
            >
              See the recipient experience
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function StepHead({ n, title, dark }: { n: number; title: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <StepNumber n={n} tone={dark ? "butter" : "ink"} />
      <h3 className={clsx("font-display text-xl font-semibold tracking-tight sm:text-2xl", dark ? "text-paper" : "text-ink")}>{title}</h3>
    </div>
  );
}
