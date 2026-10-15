"use client";

import { ArrowRight } from "lucide-react";
import { PRICING_COPY, STARTING_PRICE, money } from "@/config/brand";
import { CARD_MAP } from "@/data/cards";
import { CardFront } from "@/components/cards/card-art";
import { Envelope } from "@/components/cards/envelope";
import { ButtonLink } from "@/components/ui/button";
import { Container, Display, Reveal } from "./primitives";

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

export function FinalCTA({
  title = "Every customer birthday, remembered.",
  body = "Open a fully stocked demo workspace for a fictional real estate team. No sign-up, nothing is sent.",
  primary = { href: "/app", label: "Explore business demo" },
  secondary = { href: "/pricing", label: "See plans" },
}: {
  title?: string;
  body?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  const card = CARD_MAP["confetti-parade"];
  return (
    <section aria-labelledby="final-cta" className="py-16 sm:py-24">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-cobalt px-6 py-14 text-white sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-10 size-72 rounded-full bg-butter/90" />
          <div aria-hidden className="pointer-events-none absolute -top-16 left-1/3 size-40 rounded-full bg-coral" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <Display id="final-cta" className="text-[2.6rem] leading-[0.98] text-white sm:text-6xl lg:text-7xl">
                {title}
              </Display>
              <p className="mt-5 max-w-xl text-lg text-white/80">{body}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={primary.href} size="lg" variant="white" iconRight={<ArrowRight className="size-4" aria-hidden />}>
                  {primary.label}
                </ButtonLink>
                <ButtonLink href={secondary.href} size="lg" variant="ink">
                  {secondary.label}
                </ButtonLink>
              </div>
              <p className="mt-5 text-[14px] text-white/70">Plans from {money(STARTING_PRICE)}/month. {PRICING_COPY.includes}</p>
            </div>
            <div className="mx-auto hidden w-full max-w-[300px] lg:block" aria-hidden>
              <div className="pt-[70%]">
                <Envelope stage="out" color="#FFF9F0" liner="#FF6B57">
                  <CardFront card={card} />
                </Envelope>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
