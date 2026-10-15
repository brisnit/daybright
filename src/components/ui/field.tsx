import { clsx } from "clsx";
import { useId, type ComponentProps, type ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl bg-white px-3.5 py-2.5 text-[15px] text-ink ring-1 ring-inset ring-line-2 placeholder:text-ink-3/70 transition focus:outline-none focus:ring-2 focus:ring-cobalt aria-[invalid=true]:ring-coral";

export function Field({
  label,
  hint,
  error,
  optional,
  children,
  className,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-[13px] font-semibold text-ink-2">
        <span>{label}</span>
        {optional && <span className="font-normal text-ink-3">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] font-medium text-coral-deep" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = ComponentProps<"input"> & { label?: ReactNode; hint?: ReactNode; error?: string | null; optional?: boolean; wrapClassName?: string };

export function Input({ label, hint, error, optional, className, wrapClassName, id, ...rest }: InputProps) {
  const auto = useId();
  const iid = id ?? auto;
  const el = <input id={iid} aria-invalid={!!error || undefined} className={clsx(inputClass, className)} {...rest} />;
  if (!label) return el;
  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={iid} className={wrapClassName}>
      {el}
    </Field>
  );
}

type TextareaProps = ComponentProps<"textarea"> & { label?: ReactNode; hint?: ReactNode; error?: string | null; optional?: boolean; wrapClassName?: string };

export function Textarea({ label, hint, error, optional, className, wrapClassName, id, ...rest }: TextareaProps) {
  const auto = useId();
  const iid = id ?? auto;
  const el = <textarea id={iid} aria-invalid={!!error || undefined} className={clsx(inputClass, "min-h-24 resize-y leading-relaxed", className)} {...rest} />;
  if (!label) return el;
  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={iid} className={wrapClassName}>
      {el}
    </Field>
  );
}

type SelectProps = ComponentProps<"select"> & { label?: ReactNode; hint?: ReactNode; error?: string | null; optional?: boolean; wrapClassName?: string };

export function Select({ label, hint, error, optional, className, wrapClassName, id, children, ...rest }: SelectProps) {
  const auto = useId();
  const iid = id ?? auto;
  const el = (
    <div className="relative">
      <select
        id={iid}
        aria-invalid={!!error || undefined}
        className={clsx(inputClass, "appearance-none pr-9", className)}
        {...rest}
      >
        {children}
      </select>
      <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
  if (!label) return el;
  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={iid} className={wrapClassName}>
      {el}
    </Field>
  );
}
