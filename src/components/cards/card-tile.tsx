"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { CardDesign } from "@/lib/types";
import { CardFront } from "./card-art";
import { Tilt } from "./tilt";
import { Badge } from "@/components/ui/badges";

/** Gallery tile: tilting card with name, tagline and quick badges. */
export function CardTile({
  card,
  href,
  onClick,
  selected,
  className,
  showMeta = true,
  badge,
}: {
  card: CardDesign;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  showMeta?: boolean;
  badge?: React.ReactNode;
}) {
  const inner = (
    <>
      <Tilt>
        <div className={clsx("relative transition-transform duration-300 group-hover:-translate-y-1", selected && "ring-4 ring-cobalt ring-offset-4 ring-offset-paper rounded-[6%/4.3%]")}>
          <CardFront card={card} live />
          {card.animated && (
            <span className="absolute left-2.5 top-2.5 z-[3] rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink shadow-sm">
              Animated
            </span>
          )}
        </div>
      </Tilt>
      {showMeta && (
        <div className="mt-3 flex items-start justify-between gap-2 px-0.5">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{card.name}</p>
            <p className="line-clamp-1 text-[13px] text-ink-3">{card.tagline}</p>
          </div>
          {badge ?? (card.source === "studio" ? <Badge tone="lilac">Original</Badge> : null)}
        </div>
      )}
    </>
  );
  const cls = clsx("group block text-left focus-visible:outline-none [&:focus-visible_.relative]:ring-4 [&:focus-visible_.relative]:ring-cobalt", className);
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} aria-pressed={selected} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}
