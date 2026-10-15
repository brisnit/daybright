"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { Languages, Loader2, Sparkles, Undo2 } from "lucide-react";
import {
  LANGUAGES,
  draftMessages,
  rewriteMessage,
  type LanguageCode,
  type MessageContext,
  type MessageOption,
  type RewriteAction,
} from "@/lib/ai/messages";
import { AIDemoLabel } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";

const ACTIONS: { id: RewriteAction; label: string }[] = [
  { id: "warmer", label: "Warmer" },
  { id: "shorter", label: "Shorter" },
  { id: "playful", label: "More playful" },
  { id: "professional", label: "More professional" },
  { id: "no-sales", label: "Remove sales language" },
];

/**
 * AI Message Assistant, embedded directly in a card editor.
 * Drafts three tones from the user's own notes and rewrites the current message.
 * Uses only supplied facts (see lib/ai/messages.ts).
 */
export function MessageAssistant({
  value,
  onChange,
  context,
  notes: controlledNotes,
  onNotesChange,
  compact,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  context: Omit<MessageContext, "notes">;
  notes?: string;
  onNotesChange?: (v: string) => void;
  compact?: boolean;
  className?: string;
}) {
  const [localNotes, setLocalNotes] = useState("");
  const notes = controlledNotes ?? localNotes;
  const setNotes = onNotesChange ?? setLocalNotes;
  const [options, setOptions] = useState<MessageOption[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [lang, setLang] = useState<LanguageCode>("es");

  const ctx: MessageContext = { ...context, notes };

  async function draft() {
    setBusy("draft");
    const res = await draftMessages(ctx);
    setOptions(res);
    setBusy(null);
  }

  async function rewrite(action: RewriteAction) {
    if (!value.trim()) {
      await draft();
      return;
    }
    setBusy(action);
    const next = await rewriteMessage(value, action, ctx);
    setHistory((h) => [value, ...h].slice(0, 10));
    onChange(next);
    setBusy(null);
  }

  return (
    <div className={clsx("rounded-2xl bg-lilac-soft/60 p-4 ring-1 ring-inset ring-lilac/50", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold text-lilac-deep">
          <Sparkles className="size-4" aria-hidden /> Message assistant
        </p>
        <AIDemoLabel />
      </div>

      <label className="mt-3 block text-[13px] font-semibold text-ink-2" htmlFor="ma-notes">
        What would make this feel personal? <span className="font-normal text-ink-3">Optional</span>
      </label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <input
          id="ma-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Longtime client, loves hiking, helped us launch our business."
          className={clsx(inputClass, "bg-white")}
        />
        <Button variant="ink" onClick={draft} disabled={!!busy} className="shrink-0" icon={busy === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}>
          {options ? "Redraft" : "Draft 3 options"}
        </Button>
      </div>
      <p className="mt-1.5 text-[12px] text-ink-3">We only use what you write here. Nothing is invented about the recipient.</p>

      <AnimatePresence initial={false}>
        {busy === "draft" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 grid gap-2 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-xl skeleton" />
            ))}
          </motion.div>
        )}
        {options && busy !== "draft" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={clsx("mt-3 grid gap-2", !compact && "sm:grid-cols-3")}>
            {options.map((o, i) => (
              <motion.button
                key={o.id + o.text}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => {
                  setHistory((h) => [value, ...h].slice(0, 10));
                  onChange(o.text);
                }}
                className={clsx(
                  "flex flex-col rounded-xl bg-white p-3 text-left ring-1 ring-inset transition hover:ring-lilac-deep",
                  value === o.text ? "ring-2 ring-lilac-deep" : "ring-line",
                )}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-lilac-deep">{o.label}</span>
                <span className="mt-1 text-[13px] leading-snug text-ink-2">{o.text}</span>
                <span className="mt-2 text-[12px] font-semibold text-cobalt">{value === o.text ? "In use" : "Use this"}</span>
              </motion.button>
            ))}
            {options[0]?.usedFacts.length > 0 && (
              <p className={clsx("text-[12px] text-ink-3", !compact && "sm:col-span-3")}>
                Used from your notes: {options[0].usedFacts.map((f) => `“${f}”`).join(", ")}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[12px] font-semibold text-ink-3">Rewrite:</span>
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={!!busy}
            onClick={() => rewrite(a.id)}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-white px-3 text-[12px] font-semibold text-ink-2 ring-1 ring-inset ring-line-2 transition hover:text-ink hover:ring-lilac-deep disabled:opacity-50"
          >
            {busy === a.id && <Loader2 className="size-3 animate-spin" />}
            {a.label}
          </button>
        ))}
        <span className="inline-flex h-8 items-center rounded-full bg-white pl-2 ring-1 ring-inset ring-line-2">
          <Languages className="size-3.5 text-ink-3" aria-hidden />
          <select
            aria-label="Translation language"
            value={lang}
            onChange={(e) => setLang(e.target.value as LanguageCode)}
            className="h-full bg-transparent pl-1 pr-1 text-[12px] font-semibold text-ink-2 focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => rewrite(`translate:${lang}`)}
            className="h-full rounded-r-full border-l border-line px-3 text-[12px] font-semibold text-cobalt hover:bg-cobalt-soft disabled:opacity-50"
          >
            {busy?.startsWith("translate") ? <Loader2 className="size-3 animate-spin" /> : "Translate"}
          </button>
        </span>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange(history[0]);
              setHistory((h) => h.slice(1));
            }}
            className="ml-auto inline-flex h-8 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-ink-3 hover:text-ink"
          >
            <Undo2 className="size-3.5" aria-hidden /> Undo
          </button>
        )}
      </div>
    </div>
  );
}
