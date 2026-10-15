"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { EXAMPLE_SEARCHES, interpret, search, searchSync, type Interpretation, type SearchResults } from "@/lib/ai/search";
import { Button } from "@/components/ui/button";
import { InterpretationChips } from "./interpretation-chips";
import { Results } from "./search-results";

/** Natural-language search over the seeded cards and gifts. Reads and writes `?q=`. */
export function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = (params.get("q") ?? "").trim();
  const [text, setText] = useState(q);
  const [interp, setInterp] = useState<Interpretation | null>(() => (q ? interpret(q) : null));
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(!!q);
  const [lastQ, setLastQ] = useState(q);

  // A new ?q= resets the page (adjusting state during render, per React guidance).
  if (q !== lastQ) {
    setLastQ(q);
    setText(q);
    setInterp(q ? interpret(q) : null);
    setResults(null);
    setLoading(!!q);
  }

  useEffect(() => {
    if (!q) return;
    let live = true;
    search(q).then((r) => {
      if (!live) return;
      setResults(r);
      setInterp(r.interpretation);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [q]);

  function submit(value: string) {
    const v = value.trim();
    if (!v) return;
    if (v === q && results) {
      // Same query: reset any chip edits back to the original reading.
      const i = interpret(v);
      setInterp(i);
      setResults(searchSync(i));
      return;
    }
    router.replace(`${pathname}?q=${encodeURIComponent(v)}`, { scroll: false });
  }

  function editChips(i: Interpretation) {
    setInterp(i);
    setResults(searchSync(i));
  }

  const budgetChip = interp?.chips.find((c) => c.kind === "budget");
  const budget = budgetChip ? Number(budgetChip.value) : null;

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className="flex flex-col gap-2 rounded-[2rem] bg-white p-2 shadow-lift ring-1 ring-line sm:flex-row sm:items-center sm:pl-6"
      >
        <SearchIcon className="ml-3 mt-3 hidden size-6 shrink-0 text-ink-3 sm:ml-0 sm:mt-0 sm:block" aria-hidden />
        <label htmlFor="nl-search" className="sr-only">
          Describe what you’re looking for
        </label>
        <input
          id="nl-search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A gardening gift under $40."
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 font-display text-xl tracking-tight placeholder:text-ink-3/50 focus:outline-none sm:px-1 sm:text-2xl"
        />
        <Button type="submit" size="lg" disabled={!text.trim()} iconRight={<ArrowRight className="size-4" aria-hidden />}>
          Search
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold text-ink-3">Try:</span>
        {EXAMPLE_SEARCHES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setText(s);
              submit(s);
            }}
            className="rounded-full bg-white/70 px-3 py-1.5 text-left text-[13px] font-medium text-ink-2 ring-1 ring-inset ring-line-2 transition hover:text-ink hover:ring-ink/40"
          >
            {s}
          </button>
        ))}
      </div>

      {interp && (
        <section aria-labelledby="interp-h" className="mt-10 rounded-3xl bg-cream/70 p-4 ring-1 ring-line sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="interp-h" className="text-[13px] font-bold text-ink-2">
              Here’s how we read “{interp.query}”
            </h2>
            <p className="text-[12px] text-ink-3">Remove, edit or add filters. Results update as you go.</p>
          </div>
          <div className="mt-3">
            <InterpretationChips interp={interp} onChange={editChips} />
          </div>
        </section>
      )}

      <div className="mt-10" aria-live="polite" aria-busy={loading}>
        {loading && <ResultsSkeleton />}
        {!loading && results && <Results results={results} budget={budget} />}
        {!q && !loading && <EmptyIntro />}
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Searching">
      <div className="h-8 w-48 rounded-lg skeleton" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[5/7] rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  );
}

function EmptyIntro() {
  return (
    <div className="grid gap-6 rounded-3xl border border-dashed border-line-2 p-6 sm:grid-cols-3 sm:p-8">
      {[
        ["Say it like you'd say it to a friend.", "Who it's for, what they love, your budget. We turn it into filters you can see and change."],
        ["Cards, gifts and pairings.", "Results come back grouped, each with a short reason it matched."],
        ["Totals you can trust.", "Pairings itemize the card, gift and shipping, and show whether they fit your budget."],
      ].map(([t, b]) => (
        <div key={t}>
          <p className="font-display text-lg font-semibold tracking-tight">{t}</p>
          <p className="mt-1 text-[14px] text-ink-2">{b}</p>
        </div>
      ))}
    </div>
  );
}
