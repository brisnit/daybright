"use client";

import { clsx } from "clsx";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, Sparkles, Upload } from "lucide-react";
import { useDemo } from "@/lib/store";
import { formatBirthday } from "@/lib/dates";
import { Drawer } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badges";
import { Toggle } from "@/components/ui/controls";
import { inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { FIELD_OPTIONS, buildRows, guessField, parseCSV, sampleCSV, type FieldKey } from "./customers-utils";
import { plural } from "./dashboard-utils";

type Step = "source" | "map" | "review" | "done";
const STEPS: { id: Step; label: string }[] = [
  { id: "source", label: "Upload" },
  { id: "map", label: "Match columns" },
  { id: "review", label: "Review rows" },
  { id: "done", label: "Done" },
];

export function CustomerImportDrawer({ open, onClose, onImportDemo }: { open: boolean; onClose: () => void; onImportDemo: () => void }) {
  const customers = useDemo((s) => s.customers);
  const importCustomers = useDemo((s) => s.importCustomers);
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("source");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<FieldKey[]>([]);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ imported: number; duplicates: number; errors: number; manual: number; flagged: number } | null>(null);

  function reset() {
    setStep("source");
    setText("");
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setMapping([]);
    setSkipped(new Set());
    setSummary(null);
    setParseError(null);
  }

  function close() {
    onClose();
    setTimeout(reset, 300);
  }

  function load(csv: string) {
    const parsed = parseCSV(csv);
    if (parsed.length < 2) {
      setParseError("We need a header row and at least one customer row.");
      return;
    }
    setParseError(null);
    const [h, ...body] = parsed;
    setHeaders(h);
    setRows(body.map((r) => h.map((_, i) => r[i] ?? "")));
    setMapping(h.map(guessField));
    setSkipped(new Set());
    setStep("map");
  }

  const results = useMemo(() => (step === "review" || step === "map" ? buildRows(rows, mapping, customers) : []), [rows, mapping, customers, step]);
  const isDup = (r: (typeof results)[number]) => !!r.duplicateOf || r.duplicateInFile;
  const willImport = results.filter((r) => !skipped.has(r.index) && !r.errors.length && !(skipDuplicates && isDup(r)));
  const errorCount = results.filter((r) => r.errors.length && !skipped.has(r.index)).length;
  const dupCount = results.filter(isDup).length;

  const mappedFields = mapping.filter((m) => m !== "ignore");
  const hasName = mappedFields.includes("firstName") || mappedFields.includes("fullName");
  const doubleMapped: FieldKey[] = mappedFields.filter((m, i) => mappedFields.indexOf(m) !== i);

  function doImport() {
    const n = importCustomers(willImport.map((r) => r.input));
    const s = {
      imported: n,
      duplicates: results.filter((r) => skipDuplicates && isDup(r) && !skipped.has(r.index)).length,
      errors: errorCount,
      manual: skipped.size,
      flagged: willImport.filter((r) => !r.input.birthMonth || !r.input.email).length,
    };
    setSummary(s);
    setStep("done");
    toast({ title: `${n} ${plural(n, "customer")} imported`, tone: "success" });
  }

  const editCell = (rowIdx: number, colIdx: number, value: string) =>
    setRows((rs) => rs.map((r, i) => (i === rowIdx ? r.map((c, j) => (j === colIdx ? value : c)) : r)));

  // Columns shown in the review table (mapped ones, in CSV order).
  const reviewCols = mapping.map((m, i) => ({ m, i })).filter((x) => x.m !== "ignore");

  return (
    <Drawer
      open={open}
      onClose={close}
      width="max-w-4xl"
      title="Import customers"
      description="Everything happens in this browser. Nothing is uploaded."
      footer={
        step === "map" ? (
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" icon={<ArrowLeft className="size-4" />} onClick={() => setStep("source")}>
              Back
            </Button>
            <Button iconRight={<ArrowRight className="size-4" />} disabled={!hasName || doubleMapped.length > 0} onClick={() => setStep("review")}>
              Review {rows.length} {plural(rows.length, "row")}
            </Button>
          </div>
        ) : step === "review" ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" icon={<ArrowLeft className="size-4" />} onClick={() => setStep("map")}>
              Back
            </Button>
            <Button disabled={!willImport.length} onClick={doImport}>
              Import {willImport.length} {plural(willImport.length, "customer")}
            </Button>
          </div>
        ) : step === "done" ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
            <Button onClick={close}>Done</Button>
          </div>
        ) : undefined
      }
    >
      {/* Stepper */}
      <ol className="mb-6 flex flex-wrap items-center gap-2 text-[13px]" aria-label="Import steps">
        {STEPS.map((s, i) => {
          const cur = STEPS.findIndex((x) => x.id === step);
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                aria-current={i === cur ? "step" : undefined}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold",
                  i === cur ? "bg-ink text-paper" : i < cur ? "bg-mint-soft text-mint-deep" : "bg-ink/5 text-ink-3",
                )}
              >
                <span className="font-grotesk">{i + 1}</span> {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-4 bg-line-2" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {step === "source" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-dashed border-line-2 bg-white p-5 text-left transition hover:border-cobalt"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-cobalt-soft text-cobalt-deep">
                <Upload className="size-5" aria-hidden />
              </span>
              <span className="font-semibold">Upload a .csv file</span>
              <span className="text-[13px] text-ink-3">Export from your CRM or spreadsheet. One row per customer.</span>
              {fileName && <Badge tone="cobalt">{fileName}</Badge>}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                const t = await file.text();
                setText(t);
                load(t);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => {
                const s = sampleCSV(customers);
                setText(s);
                setFileName("sample-customers.csv");
                load(s);
              }}
              className="flex flex-col items-start gap-2 rounded-2xl bg-butter-soft p-5 text-left ring-1 ring-inset ring-butter/60 transition hover:ring-butter-deep"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-butter text-ink">
                <FileUp className="size-5" aria-hidden />
              </span>
              <span className="font-semibold">Use sample CSV</span>
              <span className="text-[13px] text-ink-2">Eight fictional rows with a few problems to fix: a duplicate, an impossible date, a missing email and a missing birthday.</span>
            </button>
          </div>

          <div>
            <label htmlFor="csv-paste" className="text-[13px] font-semibold text-ink-2">
              Or paste CSV text
            </label>
            <textarea
              id="csv-paste"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={"First name,Last name,Email,Birthday\nJordan,Lee,jordan@example.com,03/14"}
              className={clsx(inputClass, "mt-1.5 font-mono text-[13px]")}
            />
            {parseError && (
              <p className="mt-1.5 text-[13px] font-medium text-coral-deep" role="alert">
                {parseError}
              </p>
            )}
            <div className="mt-2 flex justify-end">
              <Button variant="ink" disabled={!text.trim()} onClick={() => load(text)} iconRight={<ArrowRight className="size-4" />}>
                Continue
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-line sm:flex-row sm:items-center">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lilac-soft text-lilac-deep">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Just exploring?</p>
              <p className="text-[13px] text-ink-3">Add six fictional customers in one click, with birthdays spread over the next few months.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                onImportDemo();
                close();
              }}
            >
              Import demo customers
            </Button>
          </div>
        </div>
      )}

      {step === "map" && (
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-ink-2">
            We matched your columns automatically. Check each one; anything set to &ldquo;Don&apos;t import&rdquo; is left out.
          </p>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <div className="hidden grid-cols-[1fr_1.2fr_1fr] gap-3 border-b border-line bg-paper px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-ink-3 sm:grid">
              <span>Column in your file</span>
              <span>Sample values</span>
              <span>Import as</span>
            </div>
            <ul className="divide-y divide-line">
              {headers.map((h, i) => (
                <li key={i} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_1.2fr_1fr] sm:items-center sm:gap-3">
                  <span className="font-semibold">{h || `Column ${i + 1}`}</span>
                  <span className="truncate text-[13px] text-ink-3">
                    {rows
                      .slice(0, 3)
                      .map((r) => r[i])
                      .filter(Boolean)
                      .join(" · ") || "Empty"}
                  </span>
                  <div className="relative">
                    <select
                      aria-label={`Import ${h} as`}
                      value={mapping[i]}
                      onChange={(e) => setMapping((m) => m.map((x, j) => (j === i ? (e.target.value as FieldKey) : x)))}
                      className={clsx(inputClass, "appearance-none py-2 pr-9", mapping[i] === "ignore" && "text-ink-3", doubleMapped.includes(mapping[i]) && "ring-coral")}
                    >
                      {FIELD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {!hasName && <p className="text-[13px] font-medium text-coral-deep">Match at least one column to a name (first name or full name).</p>}
          {doubleMapped.length > 0 && <p className="text-[13px] font-medium text-coral-deep">Two columns are matched to the same field. Choose one.</p>}
          <p className="text-[13px] text-ink-3">Birthdays can be MM/DD, MM/DD/YYYY, YYYY-MM-DD or written out (March 4). Birth year is optional. Separate multiple tags with semicolons.</p>
        </div>
      )}

      {step === "review" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="mint" dot>
              {willImport.length} ready
            </Badge>
            {errorCount > 0 && (
              <Badge tone="coral" dot>
                {errorCount} need a fix
              </Badge>
            )}
            {dupCount > 0 && (
              <Badge tone="butter" dot>
                {dupCount} possible {plural(dupCount, "duplicate")}
              </Badge>
            )}
            {skipped.size > 0 && <Badge>{skipped.size} skipped</Badge>}
            <div className="ml-auto">
              <Toggle size="sm" checked={skipDuplicates} onChange={setSkipDuplicates} label="Skip duplicates" />
            </div>
          </div>
          <p className="text-[13px] text-ink-3">Edit any cell to fix it. Rows with errors are left out until fixed or skipped. Missing emails and birthdays can be imported and completed later.</p>

          <ul className="flex flex-col gap-3">
            {results.map((r) => {
              const isSkipped = skipped.has(r.index);
              const dup = isDup(r);
              const status = isSkipped
                ? { label: "Skipped", tone: "neutral" as const }
                : r.errors.length
                  ? { label: "Needs a fix", tone: "coral" as const }
                  : dup && skipDuplicates
                    ? { label: "Duplicate, skipped", tone: "butter" as const }
                    : r.warnings.length
                      ? { label: "Ready, with notes", tone: "butter" as const }
                      : { label: "Ready", tone: "mint" as const };
              return (
                <li key={r.index} className={clsx("rounded-2xl bg-white p-3 ring-1 ring-inset", r.errors.length && !isSkipped ? "ring-coral/50" : "ring-line", isSkipped && "opacity-60")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-grotesk text-[12px] font-bold text-ink-3">Row {r.index + 2}</span>
                    <span className="font-semibold">{`${r.input.firstName} ${r.input.lastName}`.trim() || "No name"}</span>
                    {r.input.birthMonth && <span className="text-[12.5px] text-ink-3">{formatBirthday(r.input)}</span>}
                    <Badge tone={status.tone} dot>
                      {status.label}
                    </Badge>
                    <button
                      type="button"
                      onClick={() =>
                        setSkipped((s) => {
                          const n = new Set(s);
                          if (n.has(r.index)) n.delete(r.index);
                          else n.add(r.index);
                          return n;
                        })
                      }
                      className="ml-auto text-[13px] font-semibold text-cobalt hover:underline"
                    >
                      {isSkipped ? "Include row" : "Skip row"}
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {reviewCols.map(({ m, i }) => (
                      <label key={i} className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold uppercase tracking-wide text-ink-3">{FIELD_OPTIONS.find((o) => o.value === m)?.label}</span>
                        <input
                          value={rows[r.index][i] ?? ""}
                          onChange={(e) => editCell(r.index, i, e.target.value)}
                          disabled={isSkipped}
                          className="mt-0.5 w-full rounded-lg bg-paper px-2 py-1.5 text-[13px] ring-1 ring-inset ring-line focus:outline-none focus:ring-2 focus:ring-cobalt"
                        />
                      </label>
                    ))}
                  </div>
                  {(r.errors.length > 0 || r.warnings.length > 0) && !isSkipped && (
                    <ul className="mt-2 flex flex-col gap-1 text-[13px]">
                      {r.errors.map((e) => (
                        <li key={e} className="font-medium text-coral-deep">
                          {e}
                        </li>
                      ))}
                      {r.warnings.map((w) => (
                        <li key={w} className="text-butter-deep">
                          {w}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {step === "done" && summary && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-mint text-ink">
            <CheckCircle2 className="size-7" aria-hidden />
          </span>
          <h3 className="font-display text-3xl font-semibold tracking-tight">
            {summary.imported} {plural(summary.imported, "customer")} imported
          </h3>
          <ul className="mt-2 flex flex-col gap-1 text-[14px] text-ink-2">
            {summary.flagged > 0 && <li>{summary.flagged} imported without an email or birthday, flagged under Needs details</li>}
            {summary.duplicates > 0 && <li>{summary.duplicates} {plural(summary.duplicates, "duplicate")} skipped</li>}
            {summary.errors > 0 && <li>{summary.errors} {plural(summary.errors, "row")} with errors left out</li>}
            {summary.manual > 0 && <li>{summary.manual} {plural(summary.manual, "row")} skipped by you</li>}
          </ul>
          <p className="mt-2 max-w-md text-[13px] text-ink-3">Your automations will prepare their cards about a week before each birthday.</p>
        </div>
      )}
    </Drawer>
  );
}
