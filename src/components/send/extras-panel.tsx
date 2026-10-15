"use client";
/* eslint-disable react-hooks/set-state-in-effect -- one-time URL/timer initialisation after local state loads */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { Check, Mic, Plus, RotateCcw, Square, Trash2 } from "lucide-react";
import type { CardDesign, Extras } from "@/lib/types";
import { Toggle } from "@/components/ui/controls";
import { Button } from "@/components/ui/button";
import { SimulatedNote } from "@/components/ui/badges";
import { inputClass } from "@/components/ui/field";
import { DEMO_PHOTOS, DemoPhoto } from "./demo-photos";

const MAX_SECONDS = 30;
const MAX_PHOTOS = 3;

/** Optional extras. Every one is off by default; a simple card is complete without them. */
export function ExtrasPanel({
  card,
  extras,
  senderName,
  onChange,
}: {
  card: CardDesign;
  extras: Extras;
  senderName: string;
  onChange: (x: Extras) => void;
}) {
  const set = (patch: Partial<Extras>) => onChange({ ...extras, ...patch });
  const [greetingOn, setGreetingOn] = useState(!!extras.recordedGreeting);
  const [sigOn, setSigOn] = useState(!!extras.groupSignatures?.length);
  const [photosOn, setPhotosOn] = useState(!!extras.photoMemories?.length);

  return (
    <section aria-labelledby="extras-heading" className="rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="extras-heading" className="font-display text-2xl font-semibold tracking-tight text-ink">
          Little extras
        </h3>
        <p className="text-[13px] text-ink-3">All optional. Included at no extra cost in this demo.</p>
      </div>

      <div className="mt-5 divide-y divide-line">
        <div className="pb-4">
          <Toggle
            checked={!!extras.animatedReveal && card.animated}
            disabled={!card.animated}
            onChange={(v) => set({ animatedReveal: v })}
            label="Animated reveal"
            description={card.animated ? "The artwork comes to life as they open the envelope." : "This design is a still card. Choose an animated design to add a reveal."}
          />
        </div>

        <div className="py-4">
          <Toggle
            checked={greetingOn}
            onChange={(v) => {
              setGreetingOn(v);
              if (!v) set({ recordedGreeting: null });
            }}
            label="Short recorded greeting"
            description="Up to 30 seconds, in your own voice."
          />
          <Collapse open={greetingOn}>
            <Recorder
              value={extras.recordedGreeting ?? null}
              senderName={senderName}
              onSave={(g) => set({ recordedGreeting: g })}
            />
          </Collapse>
        </div>

        <div className="py-4">
          <Toggle
            checked={sigOn}
            onChange={(v) => {
              setSigOn(v);
              set({ groupSignatures: v ? (extras.groupSignatures?.length ? extras.groupSignatures : [{ name: "", note: "" }]) : [] });
            }}
            label="Group signatures"
            description="Let a few more people sign alongside you."
          />
          <Collapse open={sigOn}>
            <Signatures rows={extras.groupSignatures ?? []} onChange={(rows) => set({ groupSignatures: rows })} />
          </Collapse>
        </div>

        <div className="pt-4">
          <Toggle
            checked={photosOn}
            onChange={(v) => {
              setPhotosOn(v);
              if (!v) set({ photoMemories: [] });
            }}
            label="Photo memories"
            description={`Add up to ${MAX_PHOTOS} snapshots to a small page inside the card.`}
          />
          <Collapse open={photosOn}>
            <PhotoPicker value={extras.photoMemories ?? []} onChange={(ids) => set({ photoMemories: ids })} />
          </Collapse>
        </div>
      </div>
    </section>
  );
}

function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <div className="pt-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Recorder({
  value,
  senderName,
  onSave,
}: {
  value: { durationSec: number; label: string } | null;
  senderName: string;
  onSave: (g: { durationSec: number; label: string } | null) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [sec, setSec] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = (finalSec: number) => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRecording(false);
    const d = Math.max(1, finalSec);
    onSave({ durationSec: d, label: `A greeting from ${senderName.trim().split(/\s+/)[0] || "me"}` });
  };

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  useEffect(() => {
    if (recording && sec >= MAX_SECONDS) stop(MAX_SECONDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, recording]);

  const start = () => {
    setSec(0);
    setRecording(true);
    onSave(null);
    timer.current = setInterval(() => setSec((s) => s + 1), 1000);
  };

  const clock = (s: number) => `0:${String(s).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl bg-coral-soft/60 p-4 ring-1 ring-inset ring-coral/30">
      <div className="flex flex-wrap items-center gap-4">
        {recording ? (
          <button
            type="button"
            onClick={() => stop(sec)}
            className="relative grid size-14 shrink-0 place-items-center rounded-full bg-coral text-ink shadow-soft"
            aria-label="Stop recording"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-coral/40" aria-hidden />
            <Square className="relative size-5 fill-current" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-paper shadow-soft transition hover:bg-ink-2"
            aria-label={value ? "Record again" : "Start recording"}
          >
            {value ? <RotateCcw className="size-5" aria-hidden /> : <Mic className="size-5" aria-hidden />}
          </button>
        )}
        <div className="min-w-0 flex-1">
          {recording ? (
            <>
              <p className="font-grotesk text-2xl font-bold tabular-nums text-ink" aria-live="polite">
                {clock(sec)} <span className="text-[13px] font-semibold text-ink-3">/ {clock(MAX_SECONDS)}</span>
              </p>
              <Waveform active />
            </>
          ) : value ? (
            <>
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <Check className="size-4 text-mint-deep" aria-hidden /> {value.label} · {clock(value.durationSec)}
              </p>
              <div className="mt-1 flex items-center gap-3 text-[13px]">
                <button type="button" onClick={start} className="font-semibold text-cobalt hover:underline">
                  Re-record
                </button>
                <button type="button" onClick={() => onSave(null)} className="font-semibold text-ink-3 hover:text-ink hover:underline">
                  Remove
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">Tap to record a quick hello</p>
              <p className="text-[13px] text-ink-3">Tap again to stop. Thirty seconds is plenty.</p>
            </>
          )}
        </div>
      </div>
      <SimulatedNote className="mt-3">Simulated in this prototype. No microphone is used and nothing is recorded.</SimulatedNote>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="mt-1 flex h-6 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-coral-deep/70"
          animate={active ? { height: [4, 6 + ((i * 7) % 16), 4] } : { height: 4 }}
          transition={{ duration: 0.8 + (i % 5) * 0.1, repeat: Infinity, delay: (i % 7) * 0.05 }}
        />
      ))}
    </div>
  );
}

function Signatures({ rows, onChange }: { rows: { name: string; note: string }[]; onChange: (r: { name: string; note: string }[]) => void }) {
  const update = (i: number, patch: Partial<{ name: string; note: string }>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[160px_1fr_auto]">
          <input
            aria-label={`Signer ${i + 1} name`}
            value={r.name}
            onChange={(e) => update(i, { name: e.target.value })}
            placeholder="Name"
            className={inputClass}
          />
          <input
            aria-label={`Signer ${i + 1} note`}
            value={r.note}
            onChange={(e) => update(i, { note: e.target.value })}
            placeholder="A short note (optional)"
            className={clsx(inputClass, "col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto")}
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            className="grid size-11 place-items-center rounded-xl text-ink-3 hover:bg-coral-soft hover:text-coral-deep sm:col-start-3 sm:row-start-1"
            aria-label={`Remove signer ${i + 1}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        disabled={rows.length >= 12}
        onClick={() => onChange([...rows, { name: "", note: "" }])}
        icon={<Plus className="size-3.5" aria-hidden />}
      >
        Add a signer
      </Button>
    </div>
  );
}

function PhotoPicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const full = value.length >= MAX_PHOTOS;
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {DEMO_PHOTOS.map((p, i) => {
          const on = value.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => onChange(on ? value.filter((x) => x !== p.id) : [...value, p.id])}
              className={clsx(
                "relative rounded-lg p-1 transition disabled:opacity-40",
                on ? "bg-cobalt-soft ring-2 ring-cobalt" : "hover:bg-ink/5",
              )}
            >
              <DemoPhoto id={p.id} tilt={i % 2 ? 1.5 : -1.5} />
              {on && (
                <span className="absolute right-0 top-0 grid size-6 place-items-center rounded-full bg-cobalt font-grotesk text-[12px] font-bold text-white shadow">
                  {value.indexOf(p.id) + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] text-ink-3">
        {value.length}/{MAX_PHOTOS} chosen. These are illustrated demo snapshots; uploading your own photos comes later.
      </p>
    </div>
  );
}
