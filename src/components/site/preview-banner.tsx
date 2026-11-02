import Link from "next/link";

/**
 * Thin notice on every prototype surface (consumer flows, recipient view, product preview).
 * These pages run in the browser with sample data: nothing is sent, charged, shipped or connected.
 */
export function PreviewBanner({ variant = "consumer" }: { variant?: "consumer" | "app" | "recipient" }) {
  const text = {
    consumer: "Prototype preview. Nothing is sent, charged or shipped, and AI suggestions are demo examples.",
    app: "Product preview with sample data saved in your browser. Nothing is sent, charged or connected, and plan prices are illustrative.",
    recipient: "Sample card from the Daybright prototype. Gifts and codes shown here have no real value.",
  }[variant];
  return (
    <div role="note" className="border-b border-butter/50 bg-butter-soft px-4 py-2 text-center text-[12.5px] font-medium leading-snug text-butter-deep">
      {text}{" "}
      {variant !== "recipient" && (
        <Link href="/pricing" className="whitespace-nowrap font-semibold underline underline-offset-2 hover:no-underline">
          See Founding Charter pricing
        </Link>
      )}
    </div>
  );
}
