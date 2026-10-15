import type { Motif, Palette } from "@/lib/types";

/**
 * Motif glyphs drawn in a 100×100 box.
 * "flat" = filled editorial shapes, "line" = fine-line drawing.
 */
export type MotifMode = "flat" | "line";

type Props = { p: Palette; mode: MotifMode; sw?: number };

export function MotifGlyph({ motif, p, mode, sw = 2.2 }: Props & { motif: Motif }) {
  const G = GLYPHS[motif] ?? GLYPHS.star;
  return <G p={p} mode={mode} sw={sw} />;
}

const line = (p: Palette, sw: number) => ({ fill: "none", stroke: p.ink, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
const f = (mode: MotifMode, color: string, p: Palette, sw: number) =>
  mode === "flat" ? { fill: color } : line(p, sw);

const GLYPHS: Record<Motif, (props: Props) => React.ReactElement> = {
  flower: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M50 58 C50 75 48 86 46 98" {...line(p, sw)} stroke={mode === "flat" ? p.d : p.ink} />
      <path d="M48 80 C38 74 30 76 26 82 C34 86 42 85 48 80Z" {...f(mode, p.d, p, sw)} />
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="50" cy="28" rx="11" ry="17" transform={`rotate(${r} 50 42)`} {...f(mode, p.a, p, sw)} opacity={mode === "flat" ? 0.92 : 1} />
      ))}
      <circle cx="50" cy="42" r="9" {...f(mode, p.c, p, sw)} />
    </g>
  ),
  leaf: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M20 88 C25 45 55 18 88 12 C84 50 60 80 20 88Z" {...f(mode, p.d, p, sw)} />
      <path d="M22 86 C45 62 62 40 84 16" {...line(p, sw * 0.8)} stroke={mode === "flat" ? p.bg : p.ink} />
    </g>
  ),
  coffee: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M40 18c-4 6 4 8 0 14M52 14c-4 6 4 8 0 14M64 18c-4 6 4 8 0 14" {...line(p, sw)} stroke={mode === "flat" ? p.ink : p.ink} opacity={0.7} />
      <path d="M22 40h58l-6 40a10 10 0 01-10 8H38a10 10 0 01-10-8z" {...f(mode, p.a, p, sw)} />
      <path d="M79 48c12 0 14 18 0 20" {...line(p, sw * 1.6)} stroke={mode === "flat" ? p.a : p.ink} />
      <rect x="22" y="38" width="58" height="7" rx="3.5" {...f(mode, p.b, p, sw)} />
      <ellipse cx="51" cy="93" rx="34" ry="4" {...f(mode, p.c, p, sw)} />
    </g>
  ),
  mountain: ({ p, mode, sw = 2 }) => (
    <g>
      <circle cx="74" cy="26" r="10" {...f(mode, p.c, p, sw)} />
      <path d="M4 88 L38 30 L56 58 L66 44 L96 88Z" {...f(mode, p.b, p, sw)} />
      <path d="M38 30 L30 44 L36 42 L41 48 L46 40Z" {...f(mode, p.bg, p, sw)} fill={mode === "flat" ? "#FFFFFF" : "none"} />
      <path d="M4 88 C30 78 60 92 96 82 V92 H4Z" {...f(mode, p.d, p, sw)} />
      <path d="M48 88 C52 80 46 74 52 66" {...line(p, sw * 0.7)} strokeDasharray="2 4" stroke={mode === "flat" ? p.ink : p.ink} />
    </g>
  ),
  book: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M50 28 C38 20 22 20 10 24 V82 C22 78 38 78 50 86Z" {...f(mode, p.a, p, sw)} />
      <path d="M50 28 C62 20 78 20 90 24 V82 C78 78 62 78 50 86Z" {...f(mode, p.b, p, sw)} />
      <path d="M18 36c8-2 16-2 24 2M18 46c8-2 16-2 24 2M58 38c8-4 16-4 24-2M58 48c8-4 16-4 24-2" {...line(p, sw * 0.7)} stroke={mode === "flat" ? p.bg : p.ink} opacity={0.8} />
      <path d="M70 20 V40 L75 35 L80 40 V20" {...f(mode, p.c, p, sw)} />
    </g>
  ),
  music: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M38 72 V22 L82 12 V62" {...line(p, sw * 1.4)} stroke={mode === "flat" ? p.ink : p.ink} />
      <path d="M38 30 L82 20" {...line(p, sw * 3)} stroke={mode === "flat" ? p.ink : p.ink} />
      <ellipse cx="28" cy="74" rx="12" ry="9" transform="rotate(-20 28 74)" {...f(mode, p.a, p, sw)} />
      <ellipse cx="72" cy="64" rx="12" ry="9" transform="rotate(-20 72 64)" {...f(mode, p.b, p, sw)} />
      <path d="M10 30c4-6 10-6 12 0M88 84c4-6 10-6 12 0" {...line(p, sw)} stroke={p.d} />
    </g>
  ),
  paw: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M50 50c14 0 26 14 26 26 0 10-8 14-14 12-6-2-8-4-12-4s-6 2-12 4c-6 2-14-2-14-12 0-12 12-26 26-26z" {...f(mode, p.a, p, sw)} />
      <ellipse cx="24" cy="44" rx="8" ry="11" transform="rotate(-20 24 44)" {...f(mode, p.b, p, sw)} />
      <ellipse cx="40" cy="26" rx="8" ry="11" transform="rotate(-6 40 26)" {...f(mode, p.b, p, sw)} />
      <ellipse cx="60" cy="26" rx="8" ry="11" transform="rotate(6 60 26)" {...f(mode, p.b, p, sw)} />
      <ellipse cx="76" cy="44" rx="8" ry="11" transform="rotate(20 76 44)" {...f(mode, p.b, p, sw)} />
    </g>
  ),
  wave: ({ p, mode, sw = 2 }) => (
    <g>
      <circle cx="70" cy="30" r="14" {...f(mode, p.c, p, sw)} />
      <path d="M4 70 C14 50 30 46 40 56 C48 64 40 74 32 70 C46 82 62 66 70 58 C80 48 92 56 96 64 V96 H4Z" {...f(mode, p.b, p, sw)} />
      <path d="M4 84 C20 76 34 90 50 82 C66 74 80 88 96 80" {...line(p, sw)} stroke={mode === "flat" ? p.bg : p.ink} />
    </g>
  ),
  cake: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M50 12 C46 18 50 22 50 22 C50 22 55 18 50 12Z" {...f(mode, p.c, p, sw)} />
      <rect x="47" y="22" width="6" height="16" rx="2" {...f(mode, p.b, p, sw)} />
      <rect x="18" y="38" width="64" height="22" rx="5" {...f(mode, p.a, p, sw)} />
      <path d="M18 46 c6 6 10-2 16 2 s10 6 16 0 10 6 16 0 10 4 16-2" {...line(p, sw)} stroke={mode === "flat" ? "#FFFFFF" : p.ink} />
      <rect x="10" y="60" width="80" height="26" rx="6" {...f(mode, p.b, p, sw)} />
      <ellipse cx="50" cy="90" rx="46" ry="5" {...f(mode, p.d, p, sw)} />
    </g>
  ),
  balloon: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M36 62 C34 76 44 84 40 98M64 56 C66 74 58 84 62 98" {...line(p, sw * 0.7)} />
      <ellipse cx="36" cy="38" rx="20" ry="25" {...f(mode, p.a, p, sw)} />
      <ellipse cx="64" cy="32" rx="20" ry="25" {...f(mode, p.b, p, sw)} />
      <path d="M33 63l3-4 3 4zM61 57l3-4 3 4z" {...f(mode, p.ink, p, sw)} />
      {mode === "flat" && <ellipse cx="28" cy="28" rx="4" ry="8" fill="#FFFFFF" opacity=".55" transform="rotate(20 28 28)" />}
    </g>
  ),
  star: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M50 8 L61 38 L94 39 L68 58 L77 90 L50 71 L23 90 L32 58 L6 39 L39 38Z" {...f(mode, p.c, p, sw)} />
      <circle cx="84" cy="14" r="4" {...f(mode, p.a, p, sw)} />
      <circle cx="14" cy="86" r="3" {...f(mode, p.b, p, sw)} />
    </g>
  ),
  plant: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M50 64 V30" {...line(p, sw * 1.2)} stroke={mode === "flat" ? p.d : p.ink} />
      <path d="M50 44 C36 44 26 34 24 20 C40 20 50 30 50 44Z" {...f(mode, p.d, p, sw)} />
      <path d="M50 36 C62 36 74 28 78 12 C62 12 52 22 50 36Z" {...f(mode, p.d, p, sw)} opacity={mode === "flat" ? 0.8 : 1} />
      <path d="M26 62 H74 L68 94 H32Z" {...f(mode, p.a, p, sw)} />
      <rect x="22" y="58" width="56" height="10" rx="3" {...f(mode, p.a, p, sw)} opacity={mode === "flat" ? 0.85 : 1} />
      <circle cx="80" cy="54" r="4" {...f(mode, p.c, p, sw)} />
    </g>
  ),
  bike: ({ p, mode, sw = 2 }) => (
    <g>
      <circle cx="24" cy="66" r="18" {...line(p, sw * 1.4)} stroke={mode === "flat" ? p.b : p.ink} />
      <circle cx="78" cy="66" r="18" {...line(p, sw * 1.4)} stroke={mode === "flat" ? p.b : p.ink} />
      <path d="M24 66 L44 38 H70 L78 66 M44 38 L52 66 H24 M52 66 L70 38 M40 30 H52 M66 30 L70 38" {...line(p, sw * 1.2)} stroke={mode === "flat" ? p.a : p.ink} />
    </g>
  ),
  camera: ({ p, mode, sw = 2 }) => (
    <g>
      <rect x="10" y="30" width="80" height="54" rx="10" {...f(mode, p.b, p, sw)} />
      <path d="M34 30 L40 20 H60 L66 30Z" {...f(mode, p.b, p, sw)} />
      <circle cx="50" cy="57" r="17" {...f(mode, p.c, p, sw)} />
      <circle cx="50" cy="57" r="9" {...f(mode, p.ink, p, sw)} />
      <circle cx="76" cy="40" r="4" {...f(mode, p.a, p, sw)} />
    </g>
  ),
  chef: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M28 56 C14 56 12 34 28 34 C28 18 50 14 54 26 C60 14 82 18 78 36 C92 38 88 58 74 56Z" {...f(mode, "#FFFFFF", p, sw)} stroke={mode === "flat" ? p.ink : p.ink} strokeWidth={mode === "flat" ? 1.5 : sw} />
      <rect x="30" y="56" width="42" height="24" rx="4" {...f(mode, p.a, p, sw)} />
      <path d="M38 62 V74 M51 62 V74 M64 62 V74" {...line(p, sw * 0.8)} stroke={mode === "flat" ? p.bg : p.ink} />
    </g>
  ),
  house: ({ p, mode, sw = 2 }) => (
    <g>
      <path d="M14 48 L50 16 L86 48" {...line(p, sw * 1.4)} stroke={mode === "flat" ? p.a : p.ink} />
      <path d="M22 44 L50 20 L78 44 V88 H22Z" {...f(mode, p.b, p, sw)} />
      <rect x="42" y="60" width="16" height="28" rx="2" {...f(mode, p.c, p, sw)} />
      <rect x="28" y="50" width="12" height="12" rx="1.5" {...f(mode, p.bg, p, sw)} />
      <rect x="62" y="50" width="12" height="12" rx="1.5" {...f(mode, p.bg, p, sw)} />
      <rect x="64" y="22" width="8" height="14" {...f(mode, p.a, p, sw)} />
    </g>
  ),
  golf: ({ p, mode, sw = 2 }) => (
    <g>
      <ellipse cx="50" cy="84" rx="44" ry="10" {...f(mode, p.d, p, sw)} />
      <path d="M58 82 V14" {...line(p, sw * 1.2)} />
      <path d="M58 14 L84 22 L58 32Z" {...f(mode, p.a, p, sw)} />
      <circle cx="34" cy="78" r="6" {...f(mode, "#FFFFFF", p, sw)} stroke={p.ink} strokeWidth={1.2} />
    </g>
  ),
  sun: ({ p, mode, sw = 2 }) => (
    <g>
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d="M50 6 V18" transform={`rotate(${i * 30} 50 50)`} {...line(p, sw * 1.3)} stroke={mode === "flat" ? p.a : p.ink} />
      ))}
      <circle cx="50" cy="50" r="24" {...f(mode, p.c, p, sw)} />
    </g>
  ),
};
