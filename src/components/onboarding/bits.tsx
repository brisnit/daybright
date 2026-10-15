"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { inputClass } from "@/components/ui/field";

export function StepHeader({ step, total, title, children }: { step: number; total: number; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8">
      <p className="font-grotesk text-[13px] font-semibold uppercase tracking-[0.16em] text-coral-deep">
        Step {step} of {total}
      </p>
      <h1 className="mt-2 font-display text-[34px] font-semibold leading-[1] tracking-tight text-ink sm:text-5xl">{title}</h1>
      {children && <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-2">{children}</p>}
    </header>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3", className)}>{children}</p>;
}

/** Simple tag input: type and press Enter or comma to add. */
export function TagInput({
  label,
  values,
  onChange,
  placeholder,
  tone = "mint",
  hint,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  tone?: "mint" | "coral";
  hint?: string;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim().replace(/,$/, "");
    if (t && !values.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...values, t]);
    setText("");
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
        {label}
      </label>
      <div className={clsx(inputClass, "flex min-h-11 flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:ring-2 focus-within:ring-cobalt")}>
        {values.map((v) => (
          <span
            key={v}
            className={clsx(
              "inline-flex items-center gap-1 rounded-full py-0.5 pl-2.5 pr-1 text-[13px] font-semibold",
              tone === "mint" ? "bg-mint-soft text-mint-deep" : "bg-coral-soft text-coral-deep",
            )}
          >
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="grid size-5 place-items-center rounded-full hover:bg-black/10" aria-label={`Remove ${v}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !text && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={values.length ? "" : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-[15px] outline-none placeholder:text-ink-3/70"
        />
      </div>
      {hint && <p className="text-[13px] text-ink-3">{hint}</p>}
    </div>
  );
}
