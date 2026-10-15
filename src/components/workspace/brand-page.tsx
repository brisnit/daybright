"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import { ImagePlus, Trash2 } from "lucide-react";
import type { BrandVoice, Business } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { getCard } from "@/lib/cards";
import { COLOR_SWATCHES } from "@/data/cards";
import { AppPage, PageHeader, Panel } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { renderTemplate } from "@/lib/ai/messages";
import { CardPicker } from "./automations-card-picker";
import { Eyebrow, TemplateEditor } from "./automations-shared";
import { BrandVoiceEditor } from "./brand-voice";

const BRAND_SWATCHES = ["#1F5C4A", "#2446D8", "#C9402C", "#5B3FB8", "#8A6400", "#1C1838", COLOR_SWATCHES.coral.hex, COLOR_SWATCHES.mint.hex];

export function BrandPage() {
  const business = useDemo((s) => s.business);
  const updateBusiness = useDemo((s) => s.updateBusiness);
  const savedCards = useDemo((s) => s.savedCards);
  const customers = useDemo((s) => s.customers);
  const toast = useToast();
  const [draft, setDraft] = useState<Business>(() => ({ ...business, voice: { ...business.voice } }));
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(business);
  const patch = (p: Partial<Business>) => setDraft((d) => ({ ...d, ...p }));
  const patchVoice = (v: Partial<BrandVoice>) => setDraft((d) => ({ ...d, voice: { ...d.voice, ...v } }));

  const card = getCard(draft.defaultCardId, savedCards);
  const brand = { name: draft.name || "Your business", color: draft.brandColor, logo: draft.logoDataUrl };
  const sampleName = customers.find((c) => c.id === "c-rosa")?.firstName ?? customers[0]?.firstName ?? "Rosa";
  const sample = { firstName: sampleName, companyName: draft.name, senderName: draft.senderName };

  const onLogo = (file: File | undefined) => {
    setLogoError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setLogoError("Choose an image file (PNG, JPG, SVG).");
    if (file.size > 600_000) return setLogoError("Please use an image under 600 KB for this demo.");
    const reader = new FileReader();
    reader.onload = () => patch({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const save = () => {
    updateBusiness(draft);
    toast({ title: "Brand settings saved", body: "New cards, messages and suggestions use these settings.", tone: "success" });
  };

  const saveBar = (
    <div className="flex flex-wrap items-center gap-2">
      {dirty && (
        <Button variant="ghost" onClick={() => setDraft({ ...business, voice: { ...business.voice } })}>
          Discard
        </Button>
      )}
      <Button onClick={save} disabled={!dirty || !draft.name.trim()}>
        {dirty ? "Save brand settings" : "All changes saved"}
      </Button>
    </div>
  );

  return (
    <AppPage>
      <PageHeader eyebrow="Brand settings" title="Brand settings" description="How your cards look and sound. Changes preview live; save when you're happy." actions={saveBar} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel className="flex flex-col gap-5">
            <div>
              <Eyebrow>Identity</Eyebrow>
              <h2 className="font-display text-xl font-semibold tracking-tight">Name, logo and color</h2>
            </div>
            <Input label="Business name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} error={!draft.name.trim() ? "Add your business name." : null} />

            <div>
              <p className="text-[13px] font-semibold text-ink-2">Logo</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="grid size-16 place-items-center overflow-hidden rounded-2xl ring-1 ring-line" style={{ background: draft.logoDataUrl ? "#fff" : draft.brandColor }}>
                  {draft.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.logoDataUrl} alt="Logo preview" className="size-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">{(draft.name || "?").replace(/&/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" id="logo-upload" onChange={(e) => onLogo(e.target.files?.[0])} />
                <Button variant="outline" size="sm" icon={<ImagePlus className="size-4" />} onClick={() => fileRef.current?.click()}>
                  {draft.logoDataUrl ? "Replace logo" : "Upload logo"}
                </Button>
                {draft.logoDataUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="size-4" />}
                    onClick={() => {
                      patch({ logoDataUrl: null });
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className={clsx("mt-2 text-[13px]", logoError ? "text-coral-deep" : "text-ink-3")}>
                {logoError ?? "Square images work best. Without a logo, your initials appear in your brand color. Stored only in this browser."}
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-ink-2">Brand color</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {BRAND_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => patch({ brandColor: c })}
                    aria-label={`Use color ${c}`}
                    aria-pressed={draft.brandColor.toLowerCase() === c.toLowerCase()}
                    className={clsx("size-9 rounded-full ring-offset-2 ring-offset-white transition", draft.brandColor.toLowerCase() === c.toLowerCase() ? "ring-2 ring-ink" : "ring-1 ring-line hover:scale-105")}
                    style={{ background: c }}
                  />
                ))}
                <label className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-2 py-1 text-[13px] font-semibold text-ink-2 ring-1 ring-line-2">
                  <input type="color" value={draft.brandColor} onChange={(e) => patch({ brandColor: e.target.value })} className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0" aria-label="Custom brand color" />
                  {draft.brandColor.toUpperCase()}
                </label>
              </div>
            </div>
          </Panel>

          <Panel className="flex flex-col gap-5">
            <div>
              <Eyebrow>Sender</Eyebrow>
              <h2 className="font-display text-xl font-semibold tracking-tight">Who the cards are from</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Sender name" value={draft.senderName} onChange={(e) => patch({ senderName: e.target.value })} hint="Fills the Sender name token." />
              <Input label="Default signature" value={draft.signature} onChange={(e) => patch({ signature: e.target.value })} hint="Used under one-off messages." />
            </div>
            <TemplateEditor id="default-message" label="Default birthday message" value={draft.defaultMessage} onChange={(v) => patch({ defaultMessage: v })} sample={sample} />
          </Panel>

          <Panel>
            <Eyebrow>Default card</Eyebrow>
            <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">Your go-to design</h2>
            <CardPicker value={draft.defaultCardId} onChange={(id) => patch({ defaultCardId: id })} onlyApproved label="Used for new rules and customers without a preference" />
          </Panel>

          <BrandVoiceEditor draft={draft} patchVoice={patchVoice} />
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Panel className="flex flex-col gap-4">
            <Eyebrow>Live card preview</Eyebrow>
            <div className="mx-auto grid w-full max-w-[280px] grid-cols-2 gap-3 lg:grid-cols-1 lg:max-w-[220px]">
              <CardFront card={card} brandMark={brand} live />
              <CardInside message={renderTemplate(draft.defaultMessage, sample)} font="classic" brand={brand} recipientName={sampleName} />
            </div>
            <div className="border-t border-line pt-4">{saveBar}</div>
          </Panel>
        </aside>
      </div>
    </AppPage>
  );
}
