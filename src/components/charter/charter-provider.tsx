"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { TierId } from "@/config/charter";
import { Modal } from "@/components/ui/overlay";
import { track } from "@/lib/analytics";
import { LeadModal, type LeadRequest } from "./lead-modal";
import { SampleCardExperience } from "./sample-card";

type Ctx = {
  openReservation: (tier: "solo" | "agency" | null, source: string) => void;
  openInquiry: (tier: "sponsor" | "enterprise", source: string) => void;
  openSample: (source: string) => void;
};

const CharterCtx = createContext<Ctx | null>(null);

const newKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random()}`);

/** Owns the reservation / inquiry modal and the sample-card modal for every marketing page. */
export function CharterProvider({ children }: { children: React.ReactNode }) {
  const [lead, setLead] = useState<LeadRequest | null>(null);
  const [sampleOpen, setSampleOpen] = useState(false);

  const openReservation = useCallback((tier: TierId | null, source: string) => {
    track("cta_click", { cta: "reserve", tier: tier ?? "none", source });
    track("reservation_modal_open", { tier: tier ?? "none", source });
    setLead({ kind: "reservation", tier, source, key: newKey() });
  }, []);
  const openInquiry = useCallback((tier: TierId, source: string) => {
    track("cta_click", { cta: "inquire", tier, source });
    track("inquiry_modal_open", { tier, source });
    setLead({ kind: "inquiry", tier, source, key: newKey() });
  }, []);
  const openSample = useCallback((source: string) => {
    track("cta_click", { cta: "sample", source });
    track("sample_demo_open", { source });
    setSampleOpen(true);
  }, []);

  const value = useMemo(() => ({ openReservation, openInquiry, openSample }), [openReservation, openInquiry, openSample]);

  return (
    <CharterCtx.Provider value={value}>
      {children}
      <LeadModal request={lead} onClose={() => setLead(null)} />
      <Modal open={sampleOpen} onClose={() => setSampleOpen(false)} title="Unwrap a sample card" width="max-w-4xl">
        <SampleCardExperience autoOpen />
      </Modal>
    </CharterCtx.Provider>
  );
}

export function useCharter() {
  const ctx = useContext(CharterCtx);
  if (!ctx) throw new Error("useCharter must be used inside <CharterProvider>");
  return ctx;
}
