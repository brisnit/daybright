"use client";

import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { Pencil, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import type { CardDesign, CardRecipient, CardStyle, ColorFamily } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { allCards } from "@/lib/cards";
import { CARDS, COLOR_SWATCHES, RECIPIENT_LABELS, STYLE_LABELS } from "@/data/cards";
import { fmtDate } from "@/lib/dates";
import { AppPage, PageHeader } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badges";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip, Segmented } from "@/components/ui/controls";
import { Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { CardFront } from "@/components/cards/card-art";
import { needsApproval } from "./automations-card-picker";

type Tab = "approved" | "originals" | "catalog";

export function LibraryPage() {
  const savedCards = useDemo((s) => s.savedCards);
  const business = useDemo((s) => s.business);
  const automations = useDemo((s) => s.automations);
  const updateBusiness = useDemo((s) => s.updateBusiness);
  const updateCard = useDemo((s) => s.updateCard);
  const removeCard = useDemo((s) => s.removeCard);
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("approved");
  const [style, setStyle] = useState<CardStyle | null>(null);
  const [recipient, setRecipient] = useState<CardRecipient | null>(null);
  const [color, setColor] = useState<ColorFamily | null>(null);
  const [renaming, setRenaming] = useState<CardDesign | null>(null);
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState<CardDesign | null>(null);

  const originals = savedCards.filter((c) => c.source === "studio");
  const approved = allCards(savedCards).filter((c) => !needsApproval(c));
  const catalog = CARDS.filter((c) => (!style || c.styles.includes(style)) && (!recipient || c.recipients.includes(recipient)) && (!color || c.color === color));
  const usedBy = (id: string) => automations.filter((a) => a.cardId === id);

  const setDefault = (c: CardDesign) => {
    updateBusiness({ defaultCardId: c.id });
    toast({ title: "Default card updated", body: `“${c.name}” is now used for new rules and customers without a preference.`, tone: "success" });
  };
  const toggleApproval = (c: CardDesign) => {
    const next = !c.approvedForAutomation;
    if (!next && usedBy(c.id).length) {
      toast({ title: "Still in use", body: `“${c.name}” is used by ${usedBy(c.id).map((a) => a.name).join(", ")}. Pick another card for that rule first.`, tone: "warn" });
      return;
    }
    updateCard(c.id, { approvedForAutomation: next });
    toast({ title: next ? "Approved for automations" : "Approval removed", body: next ? `“${c.name}” can now be used in birthday rules.` : `“${c.name}” won't be offered for automated rules.`, tone: next ? "success" : "default" });
  };

  const tile = (c: CardDesign, actions: React.ReactNode, meta?: React.ReactNode) => (
    <div key={c.id} className="flex flex-col rounded-3xl bg-white p-3 ring-1 ring-line sm:p-4">
      <div className="relative">
        <CardFront card={c} live brandMark={null} />
        {business.defaultCardId === c.id && (
          <span className="absolute left-2 top-2 z-[3] rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">Default</span>
        )}
      </div>
      <div className="mt-3 flex min-w-0 flex-1 flex-col">
        <p className="truncate font-semibold">{c.name}</p>
        <div className="mt-1 flex flex-wrap gap-1">{meta}</div>
        <div className="mt-3 flex flex-wrap gap-1.5">{actions}</div>
      </div>
    </div>
  );

  const counts = { approved: approved.length, originals: originals.length, catalog: CARDS.length };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Cards"
        title="Card library"
        description="Every design your team can send. Catalog cards are ready to use; originals from Card Studio need a one-time approval before automations can use them."
        actions={
          <ButtonLink href="/app/studio" icon={<Sparkles className="size-4" />}>
            Create in Card Studio
          </ButtonLink>
        }
      />

      <div className="mt-6 overflow-x-auto">
        <Segmented
          ariaLabel="Card library sections"
          value={tab}
          onChange={setTab}
          options={[
            { value: "approved", label: `Approved for automations (${counts.approved})` },
            { value: "originals", label: `My originals (${counts.originals})` },
            { value: "catalog", label: `Catalog (${counts.catalog})` },
          ]}
        />
      </div>

      {tab === "approved" && (
        <section className="mt-6">
          <p className="mb-4 text-[14px] text-ink-2">These designs can be picked in any birthday rule. Approved originals appear first.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {[...approved.filter((c) => c.source === "studio"), ...approved.filter((c) => c.source !== "studio")].map((c) =>
              tile(
                c,
                <>
                  {business.defaultCardId !== c.id && (
                    <Button size="sm" variant="outline" onClick={() => setDefault(c)}>
                      Set as default
                    </Button>
                  )}
                  <ButtonLink size="sm" variant="ghost" href={`/app/automations?card=${c.id}`}>
                    Use in rule
                  </ButtonLink>
                </>,
                <>
                  {c.source === "studio" ? <Badge tone="lilac">Original</Badge> : <Badge>Catalog</Badge>}
                  {usedBy(c.id).map((a) => (
                    <Badge key={a.id} tone="mint">
                      {a.name}
                    </Badge>
                  ))}
                </>,
              ),
            )}
          </div>
        </section>
      )}

      {tab === "originals" && (
        <section className="mt-6">
          {originals.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-line">
              <p className="font-display text-xl font-semibold">No originals yet</p>
              <p className="mt-1 text-ink-2">Describe a card in Card Studio and save the one you like.</p>
              <ButtonLink href="/app/studio" className="mt-4" icon={<Sparkles className="size-4" />}>
                Open Card Studio
              </ButtonLink>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {originals.map((c) =>
                tile(
                  c,
                  <>
                    <Button size="sm" variant={c.approvedForAutomation ? "outline" : "ink"} icon={<ShieldCheck className="size-3.5" />} onClick={() => toggleApproval(c)}>
                      {c.approvedForAutomation ? "Unapprove" : "Approve design"}
                    </Button>
                    {c.approvedForAutomation && (
                      <ButtonLink size="sm" variant="ghost" href={`/app/automations?card=${c.id}`}>
                        Use in rule
                      </ButtonLink>
                    )}
                    <ButtonLink size="sm" variant="ghost" href={`/app/studio?card=${c.id}`}>
                      Open in studio
                    </ButtonLink>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Pencil className="size-3.5" />}
                      onClick={() => {
                        setRenaming(c);
                        setNewName(c.name);
                      }}
                      aria-label={`Rename ${c.name}`}
                    >
                      Rename
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
                      Delete
                    </Button>
                  </>,
                  <>
                    {c.approvedForAutomation ? <Badge tone="mint" dot>Approved</Badge> : <Badge tone="butter" dot>Needs approval</Badge>}
                    {c.createdAt && <Badge>Saved {fmtDate(c.createdAt)}</Badge>}
                  </>,
                ),
              )}
            </div>
          )}
          <p className="mt-4 text-[13px] text-ink-3">
            You approve each original design once before automations can use it. Need something new?{" "}
            <Link href="/app/studio" className="font-semibold text-cobalt underline-offset-2 hover:underline">
              Create in Card Studio
            </Link>
            .
          </p>
        </section>
      )}

      {tab === "catalog" && (
        <section className="mt-6">
          <div className="mb-5 flex flex-col gap-3">
            <FilterRow label="Style">
              {(Object.keys(STYLE_LABELS) as CardStyle[]).map((s) => (
                <Chip key={s} active={style === s} onClick={() => setStyle(style === s ? null : s)}>
                  {STYLE_LABELS[s]}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Recipient">
              {(Object.keys(RECIPIENT_LABELS) as CardRecipient[]).map((r) => (
                <Chip key={r} active={recipient === r} onClick={() => setRecipient(recipient === r ? null : r)}>
                  {RECIPIENT_LABELS[r]}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Color">
              {(Object.keys(COLOR_SWATCHES) as ColorFamily[]).map((k) => (
                <Chip
                  key={k}
                  active={color === k}
                  onClick={() => setColor(color === k ? null : k)}
                  icon={<span className="size-3 rounded-full ring-1 ring-black/10" style={{ background: COLOR_SWATCHES[k].hex }} />}
                >
                  {COLOR_SWATCHES[k].label}
                </Chip>
              ))}
            </FilterRow>
          </div>
          {catalog.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-line">
              <p className="text-ink-2">No catalog cards match those filters.</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStyle(null);
                    setRecipient(null);
                    setColor(null);
                  }}
                >
                  Clear filters
                </Button>
                <ButtonLink href="/app/studio" size="sm" icon={<Sparkles className="size-3.5" />}>
                  Create one in Card Studio
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {catalog.map((c) =>
                tile(
                  c,
                  <>
                    {business.defaultCardId !== c.id && (
                      <Button size="sm" variant="outline" onClick={() => setDefault(c)}>
                        Set as default card
                      </Button>
                    )}
                    <ButtonLink size="sm" variant="ghost" href={`/app/automations?card=${c.id}`}>
                      Use in rule
                    </ButtonLink>
                  </>,
                  <>
                    {c.styles.slice(0, 2).map((s) => (
                      <Badge key={s}>{STYLE_LABELS[s]}</Badge>
                    ))}
                    {c.animated && <Badge tone="cobalt">Animated</Badge>}
                  </>,
                ),
              )}
            </div>
          )}
        </section>
      )}

      <Modal
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title="Rename design"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button
              disabled={!newName.trim()}
              onClick={() => {
                if (!renaming) return;
                updateCard(renaming.id, { name: newName.trim() });
                toast({ title: "Design renamed", tone: "success" });
                setRenaming(null);
              }}
            >
              Save name
            </Button>
          </>
        }
      >
        <Input label="Design name" value={newName} onChange={(e) => setNewName(e.target.value)} data-autofocus />
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this design?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="ink"
              disabled={!!deleting && usedBy(deleting.id).length > 0}
              onClick={() => {
                if (!deleting) return;
                removeCard(deleting.id);
                if (business.defaultCardId === deleting.id) updateBusiness({ defaultCardId: CARDS[1].id });
                toast({ title: "Design deleted", body: `“${deleting.name}” was removed from your library.` });
                setDeleting(null);
              }}
            >
              Delete design
            </Button>
          </>
        }
      >
        {deleting && (
          <p className={clsx("text-ink-2")}>
            {usedBy(deleting.id).length
              ? `“${deleting.name}” is used by ${usedBy(deleting.id).map((a) => a.name).join(", ")}. Choose another card for that rule before deleting.`
              : `“${deleting.name}” will be removed from your library. Cards already sent with it aren't affected.`}
          </p>
        )}
      </Modal>
    </AppPage>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-20 shrink-0 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap">{children}</div>
    </div>
  );
}
