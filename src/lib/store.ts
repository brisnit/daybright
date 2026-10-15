"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AutomationRule,
  Business,
  CardDesign,
  Customer,
  DemoState,
  Send,
  SendDraft,
} from "@/lib/types";
import type { PlanId } from "@/config/brand";
import { CONSUMER } from "@/config/brand";
import { createSeedState, STATE_VERSION } from "@/data/seed";
import { GIFT_MAP } from "@/data/gifts";
import { uid } from "@/lib/ai/simulate";
import { giftSpendThisMonth } from "@/lib/selectors";

/**
 * Prototype state. Everything lives in localStorage under `daybright-demo`.
 * There is no backend; "sending", "billing" and "delivery" are simulated.
 */

type Actions = {
  reset: () => void;
  set: (partial: Partial<DemoState>) => void;

  // business
  updateBusiness: (b: Partial<Business>) => void;
  setPlan: (id: PlanId) => void;
  completeOnboarding: () => void;

  // customers
  addCustomer: (c: Omit<Customer, "id" | "createdAt" | "history"> & Partial<Pick<Customer, "history">>) => string;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  importCustomers: (cs: Omit<Customer, "id" | "createdAt" | "history">[]) => number;

  // sends
  addSend: (s: Omit<Send, "id" | "events"> & Partial<Pick<Send, "events">>) => string;
  updateSend: (id: string, s: Partial<Send>, eventLabel?: string) => void;
  approveSends: (ids: string[]) => void;
  approveGift: (sendId: string, opts?: { force?: boolean }) => { ok: boolean; reason?: string };
  declineGift: (sendId: string) => void;
  skipSend: (id: string) => void;
  resend: (id: string) => void;

  // recipient (simulated)
  markOpened: (id: string) => void;
  claimGift: (id: string) => void;
  submitAddress: (id: string) => void;

  // automations
  updateAutomation: (id: string, a: Partial<AutomationRule>) => void;
  addAutomation: (a: Omit<AutomationRule, "id">) => string;
  deleteAutomation: (id: string) => void;

  // cards
  saveCard: (c: CardDesign) => string;
  updateCard: (id: string, c: Partial<CardDesign>) => void;
  removeCard: (id: string) => void;

  // consumer flow
  setDraft: (d: SendDraft | null) => void;
  patchDraft: (d: Partial<SendDraft>) => void;
  placeOrder: () => string | null;
};

export type Store = DemoState & Actions & { hydrated: boolean };

const now = () => new Date().toISOString();

export const useDemo = create<Store>()(
  persist(
    (set, get) => ({
      ...createSeedState(),
      hydrated: false,

      reset: () => set({ ...createSeedState() }),
      set: (partial) => set(partial),

      updateBusiness: (b) => set((s) => ({ business: { ...s.business, ...b } })),
      setPlan: (planId) => set({ planId }),
      completeOnboarding: () => set({ onboarded: true }),

      addCustomer: (c) => {
        const id = uid("c");
        set((s) => ({ customers: [{ history: [], ...c, id, createdAt: now() }, ...s.customers] }));
        return id;
      },
      updateCustomer: (id, c) =>
        set((s) => ({ customers: s.customers.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      deleteCustomer: (id) => set((s) => ({ customers: s.customers.filter((x) => x.id !== id) })),
      importCustomers: (cs) => {
        const created = cs.map((c) => ({ ...c, id: uid("c"), createdAt: now(), history: [] }));
        set((s) => ({ customers: [...created, ...s.customers] }));
        return created.length;
      },

      addSend: (s) => {
        const id = uid("s");
        set((st) => ({ sends: [{ events: [{ at: now(), label: "Created" }], ...s, id }, ...st.sends] }));
        return id;
      },
      updateSend: (id, patch, eventLabel) =>
        set((s) => ({
          sends: s.sends.map((x) =>
            x.id === id
              ? { ...x, ...patch, events: eventLabel ? [...x.events, { at: now(), label: eventLabel }] : x.events }
              : x,
          ),
        })),
      approveSends: (ids) =>
        set((s) => ({
          sends: s.sends.map((x) =>
            ids.includes(x.id) && x.status === "pending-review"
              ? { ...x, status: "scheduled", approved: true, events: [...x.events, { at: now(), label: `Card approved by ${s.business.senderName}` }] }
              : x,
          ),
        })),
      approveGift: (sendId, opts) => {
        const s = get();
        const send = s.sends.find((x) => x.id === sendId);
        if (!send?.gift) return { ok: false, reason: "No gift on this send." };
        const rule = s.automations.find((a) => a.id === send.automationId);
        const cost = send.gift.amount + send.gift.shipping;
        const spent = giftSpendThisMonth(s.sends, true);
        if (!opts?.force && rule && rule.monthlyGiftBudget > 0 && spent + cost > rule.monthlyGiftBudget) {
          get().updateSend(sendId, { gift: { ...send.gift, status: "held-budget", note: "Approving this gift would go over this month's gift budget. The card stays scheduled." } }, "Gift held: monthly gift budget reached");
          return { ok: false, reason: "This gift would exceed the monthly gift budget, so it's held for review. The card is still scheduled." };
        }
        get().updateSend(sendId, { gift: { ...send.gift, status: "approved", note: undefined } }, opts?.force ? `Gift approved over budget by ${s.business.senderName}` : `Gift approved by ${s.business.senderName}`);
        return { ok: true };
      },
      declineGift: (sendId) => {
        const send = get().sends.find((x) => x.id === sendId);
        if (!send?.gift) return;
        get().updateSend(sendId, { gift: { ...send.gift, status: "declined" } }, "Gift removed; card only");
      },
      skipSend: (id) => get().updateSend(id, { status: "skipped" }, "Skipped this birthday"),
      resend: (id) => get().updateSend(id, { status: "sent", issue: undefined, scheduledFor: now() }, "Resent (simulated)"),

      markOpened: (id) => {
        const send = get().sends.find((x) => x.id === id);
        if (send && (send.status === "sent" || send.status === "scheduled")) get().updateSend(id, { status: "opened" }, "Opened");
      },
      claimGift: (id) => {
        const send = get().sends.find((x) => x.id === id);
        if (!send?.gift) return;
        get().updateSend(id, { status: "gift-claimed", gift: { ...send.gift, status: "claimed" } }, "Gift claimed");
      },
      submitAddress: (id) => {
        const send = get().sends.find((x) => x.id === id);
        if (!send?.gift) return;
        get().updateSend(id, { status: "gift-claimed", gift: { ...send.gift, status: "shipped" } }, "Delivery address received");
      },

      updateAutomation: (id, a) =>
        set((s) => ({ automations: s.automations.map((x) => (x.id === id ? { ...x, ...a } : x)) })),
      addAutomation: (a) => {
        const id = uid("auto");
        set((s) => ({ automations: [...s.automations, { ...a, id }] }));
        return id;
      },
      deleteAutomation: (id) => set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })),

      saveCard: (c) => {
        const exists = get().savedCards.some((x) => x.id === c.id);
        set((s) => ({
          savedCards: exists ? s.savedCards.map((x) => (x.id === c.id ? c : x)) : [{ ...c, createdAt: c.createdAt ?? now() }, ...s.savedCards],
        }));
        return c.id;
      },
      updateCard: (id, c) => set((s) => ({ savedCards: s.savedCards.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      removeCard: (id) => set((s) => ({ savedCards: s.savedCards.filter((x) => x.id !== id) })),

      setDraft: (draft) => set({ draft }),
      patchDraft: (d) => set((s) => (s.draft ? { draft: { ...s.draft, ...d } } : {})),
      placeOrder: () => {
        const d = get().draft;
        if (!d) return null;
        const gift = d.gift ? GIFT_MAP[d.gift.giftId] : null;
        const sendNow = d.when === "now";
        const scheduledFor = sendNow ? now() : new Date(`${d.date}T${d.time || "09:00"}`).toISOString();
        const id = get().addSend({
          source: "consumer",
          customerId: null,
          automationId: null,
          recipientName: d.recipientName,
          recipientEmail: d.recipientEmail,
          cardId: d.cardId,
          headline: d.headline,
          message: d.message,
          messageFont: d.messageFont,
          senderName: d.senderName,
          fromLabel: d.senderName,
          scheduledFor,
          status: sendNow ? "sent" : "scheduled",
          gift: d.gift
            ? { ...d.gift, status: gift?.addressRequired && d.addressMode === "ask-recipient" ? "awaiting-address" : "approved" }
            : null,
          extras: d.extras,
          events: [{ at: now(), label: sendNow ? "Sent (simulated)" : "Scheduled" }],
        });
        const total = CONSUMER.digitalCardPrice + (d.gift ? d.gift.amount + d.gift.shipping : 0);
        set((s) => ({ orders: [{ id: uid("o"), sendId: id, createdAt: now(), total }, ...s.orders] }));
        return id;
      },
    }),
    {
      name: "daybright-demo",
      version: STATE_VERSION,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hydrated, ...rest } = s;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== "function")) as unknown as Store;
      },
      migrate: () => createSeedState() as unknown as Store,
      onRehydrateStorage: () => () => {
        useDemo.setState({ hydrated: true });
      },
    },
  ),
);
