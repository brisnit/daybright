import type { HeadlineLayout, Motif, Palette, StudioStyle } from "@/lib/types";
import { MotifGlyph } from "./motifs";
import { H, W, cos, rng, sin, sparklePath, starPath } from "./shared";

/**
 * Parametric artwork for AI Card Studio concepts.
 * Style family × motif × layout → genuinely different compositions.
 * The headline is NOT drawn here; it is rendered as editable text by <CardFront>.
 */

type Props = { style: StudioStyle; motif: Motif; layout: HeadlineLayout; variant: number; p: Palette; id: string };

type Zone = { x: number; y: number; size: number; alt: { x: number; y: number; size: number }[] };

/** Where the main motif goes so it never fights the headline. */
function zone(layout: HeadlineLayout): Zone {
  switch (layout) {
    case "top":
      return { x: 250, y: 470, size: 300, alt: [{ x: 70, y: 300, size: 50 }, { x: 430, y: 640, size: 60 }] };
    case "bottom":
      return { x: 250, y: 230, size: 290, alt: [{ x: 70, y: 470, size: 50 }, { x: 440, y: 70, size: 56 }] };
    case "left":
      return { x: 360, y: 300, size: 230, alt: [{ x: 400, y: 600, size: 80 }, { x: 90, y: 90, size: 50 }] };
    case "stacked":
      return { x: 400, y: 600, size: 150, alt: [{ x: 420, y: 90, size: 70 }] };
    default:
      return { x: 250, y: 140, size: 150, alt: [{ x: 90, y: 600, size: 90 }, { x: 410, y: 600, size: 90 }] };
  }
}

function Glyph({ motif, p, x, y, size, mode, sw, className, rotate = 0 }: { motif: Motif; p: Palette; x: number; y: number; size: number; mode: "flat" | "line"; sw?: number; className?: string; rotate?: number }) {
  const s = size / 100;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) rotate(${rotate} ${size / 2} ${size / 2}) scale(${s})`} className={className}>
      <MotifGlyph motif={motif} p={p} mode={mode} sw={sw ?? 2.2 / Math.max(0.6, s * 0.6)} />
    </g>
  );
}

export function StudioArt(props: Props) {
  switch (props.style) {
    case "bold-type":
      return <BoldType {...props} />;
    case "editorial":
      return <Editorial {...props} />;
    case "watercolor":
      return <Watercolor {...props} />;
    case "collage":
      return <Collage {...props} />;
    case "retro":
      return <Retro {...props} />;
    default:
      return <Minimal {...props} />;
  }
}

function BoldType({ motif, layout, p, variant }: Props) {
  const z = zone(layout);
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      {variant === 0 && (
        <>
          <rect x="0" y="560" width={W} height="140" fill={p.a} />
          <rect x="0" y="540" width={W} height="20" fill={p.b} />
        </>
      )}
      {variant === 1 && (
        <>
          <circle cx="0" cy="0" r="170" fill={p.a} />
          <circle cx={W} cy={H} r="190" fill={p.b} />
        </>
      )}
      {variant === 2 && (
        <>
          <rect x="330" y="0" width="170" height={H} fill={p.a} />
          <path d="M330 0 V700" stroke={p.ink} strokeWidth="6" />
        </>
      )}
      <Glyph motif={motif} p={p} x={z.x} y={z.y} size={z.size} mode="flat" />
      {z.alt.slice(0, 1).map((a, i) => (
        <path key={i} d={starPath(a.x, a.y, a.size / 2.4)} fill={p.c} />
      ))}
    </g>
  );
}

function Editorial({ motif, layout, p, variant, id }: Props) {
  const z = zone(layout);
  const r = rng(variant + 3);
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      {/* soft blob backdrop */}
      <path
        transform={`translate(${z.x} ${z.y}) scale(${z.size / 200})`}
        d="M120 -40 C150 40 90 140 -10 130 C-120 120 -160 30 -120 -60 C-80 -150 90 -130 120 -40Z"
        fill={p.c}
        opacity=".55"
      />
      {/* horizon / ground line */}
      {layout === "top" && <path d="M0 640 C150 610 350 650 500 620 V700 H0Z" fill={p.d} opacity=".6" />}
      {layout === "bottom" && <path d="M0 0 H500 V40 C340 70 160 20 0 50Z" fill={p.d} opacity=".5" />}
      {/* sprinkle pattern */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 30 + r() * 440;
        const y = 30 + r() * 640;
        const near = Math.hypot(x - z.x, y - z.y) < z.size * 0.7;
        if (near) return null;
        return i % 2 ? (
          <circle key={i} cx={x} cy={y} r={4 + r() * 4} fill={i % 3 ? p.a : p.b} opacity=".8" />
        ) : (
          <path key={i} d={sparklePath(x, y, 8 + r() * 6)} fill={p.b} opacity=".8" />
        );
      })}
      <g filter={`url(#shadow-${id})`}>
        <Glyph motif={motif} p={p} x={z.x} y={z.y} size={z.size} mode="flat" />
      </g>
      {z.alt.slice(0, 1).map((a, i) => (
        <Glyph key={i} motif={motif} p={p} x={a.x} y={a.y} size={a.size} mode="line" rotate={-12} />
      ))}
    </g>
  );
}

function Watercolor({ motif, layout, p, variant, id }: Props) {
  const bloom = motif === "plant" || motif === "flower" || motif === "leaf" ? motif : motif;
  const sprigs =
    layout === "center"
      ? Array.from({ length: 12 }).map((_, i) => {
          const t = (i / 12) * Math.PI * 2;
          return { x: 250 + 170 * cos(t), y: 360 + 220 * sin(t), a: (t * 180) / Math.PI + 90, i };
        })
      : layout === "bottom"
        ? Array.from({ length: 8 }).map((_, i) => ({ x: 40 + i * 60, y: 90 + (i % 2) * 40, a: 180 + (i % 2 ? 20 : -20), i }))
        : Array.from({ length: 8 }).map((_, i) => ({ x: 40 + i * 60, y: 650 - (i % 2) * 40, a: i % 2 ? 20 : -20, i }));
  const main = layout === "center" ? { x: 250, y: 150, size: 120 } : layout === "bottom" ? { x: 250, y: 260, size: 230 } : { x: 250, y: 470, size: 240 };
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <g filter={`url(#wash-${id})`} opacity=".22">
        <circle cx={main.x - 60} cy={main.y} r={main.size * 0.7} fill={p.a} />
        <circle cx={main.x + 70} cy={main.y + 30} r={main.size * 0.6} fill={p.c} />
        <circle cx={variant === 1 ? 420 : 80} cy={variant === 2 ? 120 : 620} r="90" fill={p.d} />
      </g>
      <g filter={`url(#wc-${id})`}>
        {sprigs.map((s) => (
          <g key={s.i} transform={`translate(${s.x} ${s.y}) rotate(${s.a})`}>
            {s.i % 3 === 0 ? (
              <>
                {[0, 72, 144, 216, 288].map((r) => (
                  <ellipse key={r} cx="0" cy="-14" rx="12" ry="16" fill={s.i % 2 ? p.a : p.b} opacity=".7" transform={`rotate(${r})`} />
                ))}
                <circle r="6" fill={p.c} />
              </>
            ) : (
              <>
                <path d="M0 0 C-12 -18 -10 -38 0 -52 C10 -38 12 -18 0 0Z" fill={p.d} opacity=".75" />
                <path d="M0 0 C-8 -22 12 -26 18 -42 C22 -26 14 -8 0 0Z" fill={p.d} opacity=".5" />
              </>
            )}
          </g>
        ))}
        <g opacity=".92">
          <Glyph motif={bloom} p={p} x={main.x} y={main.y} size={main.size} mode="flat" />
        </g>
      </g>
    </g>
  );
}

function Collage({ motif, layout, p, variant, id }: Props) {
  const z = zone(layout);
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <g filter={`url(#torn-${id})`}>
        {variant !== 1 && <path d={`M${z.x - z.size * 0.7} ${z.y - z.size * 0.6} L${z.x + z.size * 0.65} ${z.y - z.size * 0.7} L${z.x + z.size * 0.7} ${z.y + z.size * 0.6} L${z.x - z.size * 0.6} ${z.y + z.size * 0.65}Z`} fill={p.d} />}
        {variant === 1 && <circle cx={z.x} cy={z.y} r={z.size * 0.62} fill={p.d} />}
        <path d="M-10 600 C80 560 160 640 260 600 L260 710 L-10 710Z" fill={p.b} />
        <circle cx={variant === 2 ? 70 : 430} cy={variant === 2 ? 640 : 70} r="56" fill={p.a} />
        <g transform={`translate(${z.x} ${z.y})`}>
          <rect x={-z.size * 0.45} y={-z.size * 0.45} width={z.size * 0.9} height={z.size * 0.9} rx="10" fill="#FFFDF7" transform="rotate(-5)" />
        </g>
      </g>
      <Glyph motif={motif} p={p} x={z.x} y={z.y} size={z.size * 0.72} mode="flat" rotate={-5} />
      <rect x={z.x - 40} y={z.y - z.size * 0.5 - 12} width="80" height="24" fill="#FFFFFF" opacity=".55" transform={`rotate(-8 ${z.x} ${z.y - z.size * 0.5})`} />
      {z.alt.map((a, i) => (
        <path key={i} d={starPath(a.x, a.y, a.size / 2.2, 0.5)} fill={i ? p.c : p.a} filter={`url(#torn-${id})`} />
      ))}
      <path d="M360 640 c16 -16 32 16 48 0 s32 16 48 0" stroke={p.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Retro({ motif, layout, p, variant }: Props) {
  const badge = layout === "bottom" ? { x: 250, y: 230 } : layout === "top" ? { x: 250, y: 500 } : { x: 250, y: 150 };
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      {variant !== 1 && (
        <g transform={`translate(${badge.x} ${badge.y})`}>
          {Array.from({ length: 24 }).map((_, i) => {
            const a1 = (Math.PI * 2 * i) / 24;
            const a2 = (Math.PI * 2 * (i + 0.5)) / 24;
            return <path key={i} d={`M0 0 L${900 * cos(a1)} ${900 * sin(a1)} L${900 * cos(a2)} ${900 * sin(a2)}Z`} fill={p.c} opacity=".28" />;
          })}
        </g>
      )}
      {variant === 1 &&
        [0, 1, 2, 3].map((i) => (
          <rect key={i} x="0" y={layout === "bottom" ? 0 + i * 26 : 590 + i * 26} width={W} height="16" fill={[p.a, p.b, p.c, p.d][i]} />
        ))}
      {[118, 98, 80].map((r, i) => (
        <circle key={r} cx={badge.x} cy={badge.y} r={layout === "center" ? r * 0.85 : r * 1.1} fill={[p.a, p.c, p.bg][i]} />
      ))}
      <Glyph motif={motif} p={p} x={badge.x} y={badge.y} size={layout === "center" ? 110 : 140} mode="flat" className="anim-float" />
      {layout === "center" && (
        <g fill="none" strokeWidth="12" strokeLinecap="round">
          <path d="M-10 600 Q120 540 250 600 T510 600" stroke={p.a} />
          <path d="M-10 630 Q120 570 250 630 T510 630" stroke={p.b} />
          <path d="M-10 660 Q120 600 250 660 T510 660" stroke={p.d} />
        </g>
      )}
    </g>
  );
}

function Minimal({ motif, layout, p, variant }: Props) {
  const z = zone(layout);
  const size = layout === "center" ? 110 : Math.min(z.size, 190);
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <rect x="32" y="32" width="436" height="636" fill="none" stroke={p.ink} strokeOpacity=".25" strokeWidth="1.5" />
      {variant === 1 && <rect x="44" y="44" width="412" height="612" fill="none" stroke={p.a} strokeWidth="1.5" />}
      <circle cx={z.x + size * 0.18} cy={z.y - size * 0.1} r={size * 0.42} fill={p.a} opacity=".22" />
      <Glyph motif={motif} p={p} x={z.x} y={z.y} size={size} mode="line" sw={1.6} />
      {variant === 2 && <path d={sparklePath(z.x + size * 0.6, z.y - size * 0.5, 12)} fill={p.a} className="anim-twinkle" />}
      <path d={`M${layout === "left" ? 64 : 200} 620 H${layout === "left" ? 180 : 300}`} stroke={p.ink} strokeOpacity=".4" strokeWidth="1.5" />
    </g>
  );
}
