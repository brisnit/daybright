"use client";

import { HomeHero } from "./hero";
import { IdeaToDelight } from "./idea-to-delight";
import { GiftsSection, OneBrandSection, PricingPreview, ShopCards, WorkflowAndDashboard } from "./home-sections";
import { FaqSection } from "./faq";
import { FinalCTA } from "./final-cta";

export function HomePage() {
  return (
    <>
      <HomeHero />
      <IdeaToDelight />
      <ShopCards />
      <GiftsSection />
      <OneBrandSection />
      <WorkflowAndDashboard />
      <PricingPreview />
      <FaqSection />
      <FinalCTA />
    </>
  );
}
