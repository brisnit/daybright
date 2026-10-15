import type { Palette } from "@/lib/types";
import { H, W, cos, rng, sin, sparklePath, starPath } from "./shared";

type ArtProps = { p: Palette; id: string };

/* 1 ─ Confetti Parade ─────────────────────────────────────────── */
export function ConfettiParade({ p }: ArtProps) {
  const r = rng(42);
  const colors = [p.a, p.b, p.c, p.d];
  const pieces = Array.from({ length: 70 }).map((_, i) => {
    let x = r() * W;
    let y = r() * H;
    // keep a calm oval in the middle for the headline
    const dx = (x - W / 2) / 190;
    const dy = (y - H / 2) / 150;
    if (dx * dx + dy * dy < 1) {
      y = y < H / 2 ? y - 170 : y + 170;
      x = x + (x < W / 2 ? -40 : 40);
    }
    return { x, y, rot: r() * 360, kind: i % 5, c: colors[i % 4], s: 0.7 + r() * 0.9 };
  });
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      {pieces.map((pc, i) => (
        <g key={i} transform={`translate(${pc.x} ${pc.y}) rotate(${pc.rot}) scale(${pc.s})`} className={i % 9 === 0 ? "anim-twinkle" : undefined}>
          {pc.kind === 0 && <rect x="-9" y="-4" width="18" height="8" rx="2" fill={pc.c} />}
          {pc.kind === 1 && <circle r="6" fill={pc.c} />}
          {pc.kind === 2 && <path d="M0 -9 L8 6 L-8 6Z" fill={pc.c} />}
          {pc.kind === 3 && <path d="M-14 0 c4 -8 8 8 12 0 s8 8 12 0" fill="none" stroke={pc.c} strokeWidth="4" strokeLinecap="round" />}
          {pc.kind === 4 && <path d={starPath(0, 0, 9)} fill={pc.c} />}
        </g>
      ))}
      <g className="anim-drift" style={{ animationDuration: "7s" }}>
        <rect x="120" y="-20" width="16" height="7" rx="2" fill={p.a} transform="rotate(30 128 -16)" />
        <circle cx="390" cy="-60" r="6" fill={p.b} />
      </g>
    </g>
  );
}

/* 2 ─ Garden Arch (watercolor) ───────────────────────────────── */
export function GardenArch({ p, id }: ArtProps) {
  const cx = 250, cy = 400, R = 190;
  const items = Array.from({ length: 15 }).map((_, i) => {
    const t = Math.PI + (i / 14) * Math.PI;
    return { x: cx + R * cos(t), y: cy + R * 1.18 * sin(t), a: (t * 180) / Math.PI + 90, i };
  });
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <g filter={`url(#wash-${id})`} opacity="0.14">
        <ellipse cx="250" cy="300" rx="170" ry="150" fill={p.c} />
      </g>
      <g filter={`url(#wc-${id})`}>
        {items.map(({ x, y, a, i }) =>
          i % 3 === 1 ? (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(1.55)`} opacity="0.92">
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx="0" cy="-18" rx="16" ry="22" fill={i % 2 ? p.a : p.d} opacity="0.75" transform={`rotate(${r})`} />
              ))}
              <circle r="9" fill={p.c} />
            </g>
          ) : (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a + (i % 2 ? 35 : -35)}) scale(1.45)`}>
              <path d="M0 0 C-14 -20 -12 -44 0 -60 C12 -44 14 -20 0 0Z" fill={p.b} opacity="0.8" />
              <path d="M0 0 C-10 -26 14 -30 22 -50 C26 -30 16 -10 0 0Z" fill={p.b} opacity="0.55" />
            </g>
          ),
        )}
        <g transform="translate(250 166)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
            <ellipse key={r} cx="0" cy="-24" rx="20" ry="30" fill={p.a} opacity="0.6" transform={`rotate(${r})`} />
          ))}
          {[20, 110, 200, 290].map((r) => (
            <ellipse key={r} cx="0" cy="-12" rx="12" ry="18" fill={p.a} opacity="0.8" transform={`rotate(${r})`} />
          ))}
          <circle r="8" fill={p.c} />
        </g>
      </g>
      <g opacity="0.7">
        {[[70, 640], [430, 650], [90, 120], [410, 110]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={p.b} />
        ))}
      </g>
    </g>
  );
}

/* 3 ─ Big Day Energy (bold type) ─────────────────────────────── */
export function BigType({ p }: ArtProps) {
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <circle cx="420" cy="90" r="80" fill={p.a} />
      <g stroke={p.a} strokeWidth="6" strokeLinecap="round">
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d="M420 -20 V-46" transform={`rotate(${i * 36} 420 90)`} />
        ))}
      </g>
      <path d="M0 700 V560 A140 140 0 0 1 140 700Z" fill={p.b} />
      <rect x="-30" y="610" width="560" height="10" fill={p.c} opacity=".9" transform="rotate(-6 250 615)" />
      <g fill={p.d}>
        <circle cx="300" cy="640" r="10" />
        <circle cx="340" cy="640" r="10" />
        <circle cx="380" cy="640" r="10" />
      </g>
    </g>
  );
}

/* 4 ─ One Candle (minimal) ───────────────────────────────────── */
export function CandleGlow({ p, id }: ArtProps) {
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <rect x="40" y="40" width="420" height="620" rx="8" fill="none" stroke={p.c} strokeWidth="2" />
      <circle cx="250" cy="170" r="70" fill={p.a} opacity=".35" filter={`url(#glow-${id})`} />
      <g className="anim-flicker">
        <path d="M250 112 C270 140 268 170 250 182 C232 170 230 140 250 112Z" fill={p.a} />
        <path d="M250 140 C259 155 258 170 250 176 C242 170 241 155 250 140Z" fill={p.b} opacity=".85" />
      </g>
      <path d="M250 182 V198" stroke={p.ink} strokeWidth="3" strokeLinecap="round" />
      <rect x="222" y="198" width="56" height="210" rx="6" fill="none" stroke={p.ink} strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M222 ${222 + i * 32} L278 ${206 + i * 32}`} stroke={p.ink} strokeWidth="2" opacity=".55" />
      ))}
      <path d="M170 418 H330" stroke={p.ink} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="250" cy="418" rx="100" ry="12" fill="none" stroke={p.ink} strokeWidth="2" opacity=".35" />
      {[[150, 140], [352, 120], [330, 250], [168, 280]].map(([x, y], i) => (
        <path key={i} d={sparklePath(x, y, 10)} fill={p.a} className="anim-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </g>
  );
}

/* 5 ─ Tall Order (layer cake) ────────────────────────────────── */
export function LayerCake({ p }: ArtProps) {
  const layers = [p.b, p.c, p.a, p.d, p.b, p.c];
  const top = 330;
  const lh = 40;
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <circle cx="250" cy="470" r="200" fill="#FFFFFF" opacity=".45" />
      <ellipse cx="250" cy="625" rx="190" ry="22" fill={p.ink} opacity=".12" />
      <path d="M70 610 H430 L410 628 H90Z" fill={p.ink} opacity=".85" />
      {layers.map((c, i) => {
        const y = top + i * lh;
        const w = 220 + i * 8;
        return <rect key={i} x={250 - w / 2} y={y} width={w} height={lh} fill={c} />;
      })}
      {layers.map((_, i) => {
        const y = top + i * lh;
        const w = 220 + i * 8;
        return (
          <path
            key={`f${i}`}
            d={`M${250 - w / 2} ${y} h${w} v8 ${Array.from({ length: 8 }).map((__, k) => `q${-w / 16} ${k % 2 ? 6 : 14} ${-w / 8} 0`).join(" ")} z`}
            fill="#FFF9F0"
            opacity=".95"
          />
        );
      })}
      <path d="M138 330 h224 v-12 q-112 -26 -224 0z" fill="#FFF9F0" />
      {[200, 250, 300].map((x, i) => (
        <g key={x}>
          <rect x={x - 5} y={262} width="10" height="52" rx="3" fill={[p.a, p.b, p.d][i]} />
          <path d={`M${x} 236 c10 12 8 24 0 26 c-8 -2 -10 -14 0 -26z`} fill={p.c} className="anim-flicker" />
        </g>
      ))}
      {[[90, 300], [410, 260], [70, 470], [430, 520]].map(([x, y], i) => (
        <path key={i} d={starPath(x, y, 12)} fill={[p.a, p.c, p.d, p.b][i]} />
      ))}
    </g>
  );
}

/* 6 ─ Balloon Bouquet ───────────────────────────────────────── */
export function BalloonBouquet({ p }: ArtProps) {
  const balloons = [
    { x: 160, y: 200, c: p.a, d: "0s" },
    { x: 260, y: 150, c: p.b, d: ".8s" },
    { x: 350, y: 230, c: p.c, d: "1.6s" },
    { x: 240, y: 290, c: p.d, d: "2.2s" },
  ];
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      {[[80, 90, 60], [400, 70, 40], [440, 380, 50]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.45} fill="#FFFFFF" opacity=".8" />
      ))}
      {balloons.map((b, i) => (
        <g key={i} className="anim-float" style={{ animationDelay: b.d }}>
          <path d={`M${b.x} ${b.y + 78} C${b.x + 10} ${b.y + 140} ${250 - 20} 420 250 470`} fill="none" stroke={p.ink} strokeWidth="1.6" opacity=".6" />
          <ellipse cx={b.x} cy={b.y} rx="60" ry="74" fill={b.c} />
          <ellipse cx={b.x - 22} cy={b.y - 28} rx="12" ry="22" fill="#FFFFFF" opacity=".45" transform={`rotate(25 ${b.x - 22} ${b.y - 28})`} />
          <path d={`M${b.x - 8} ${b.y + 82} L${b.x} ${b.y + 72} L${b.x + 8} ${b.y + 82}Z`} fill={b.c} />
        </g>
      ))}
      <path d="M232 470 c-20 -14 -30 6 -8 10 M268 470 c20 -14 30 6 8 10" fill="none" stroke={p.a} strokeWidth="5" strokeLinecap="round" />
      <circle cx="250" cy="472" r="7" fill={p.a} />
    </g>
  );
}

/* 7 ─ Seventies Sunburst ─────────────────────────────────────── */
export function Sunburst({ p }: ArtProps) {
  const rays = 22;
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <g transform="translate(250 760)">
        {Array.from({ length: rays }).map((_, i) => {
          const a1 = (Math.PI * i) / rays + Math.PI;
          const a2 = (Math.PI * (i + 0.5)) / rays + Math.PI;
          const R = 1000;
          return (
            <path key={i} d={`M0 0 L${R * cos(a1)} ${R * sin(a1)} L${R * cos(a2)} ${R * sin(a2)}Z`} fill={p.c} opacity=".35" />
          );
        })}
      </g>
      {[300, 250, 200, 150].map((r, i) => (
        <circle key={r} cx="250" cy="760" r={r} fill={[p.d, p.b, p.a, p.c][i]} />
      ))}
      <g fill="none" strokeWidth="14" strokeLinecap="round">
        <path d="M-10 120 Q120 60 250 120 T510 120" stroke={p.a} />
        <path d="M-10 150 Q120 90 250 150 T510 150" stroke={p.b} />
        <path d="M-10 180 Q120 120 250 180 T510 180" stroke={p.d} />
      </g>
    </g>
  );
}

/* 8 ─ Cut & Paste (collage) ──────────────────────────────────── */
export function PaperCollage({ p, id }: ArtProps) {
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <g filter={`url(#torn-${id})`}>
        <path d="M300 40 L480 30 L490 260 L320 280Z" fill={p.d} />
        <circle cx="390" cy="150" r="78" fill={p.a} />
        <path d="M260 470 C300 430 340 500 380 460 C420 420 460 490 500 450 L500 700 L240 700Z" fill={p.b} />
        <path d="M-10 560 L200 520 L230 700 L-10 700Z" fill={p.c} />
        <path d={starPath(130, 120, 52, 0.5)} fill={p.c} />
      </g>
      <rect x="350" y="62" width="90" height="26" fill="#FFFFFF" opacity=".55" transform="rotate(14 395 75)" />
      <rect x="40" y="520" width="80" height="24" fill="#FFFFFF" opacity=".5" transform="rotate(-10 80 532)" />
      <g stroke={p.ink} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M360 340 c20 -20 40 20 60 0 s40 20 60 0" />
        <path d="M60 230 l20 20 M80 230 l-20 20" />
      </g>
      <circle cx="430" cy="600" r="18" fill={p.c} />
    </g>
  );
}

/* 9 ─ Midnight Sparkler ──────────────────────────────────────── */
export function MidnightSparkler({ p, id }: ArtProps) {
  const r = rng(9);
  const stars = Array.from({ length: 50 }).map(() => ({ x: r() * W, y: r() * H, s: 0.6 + r() * 1.8, d: r() * 3 }));
  const bursts = [
    { x: 170, y: 210, s: 1 },
    { x: 340, y: 150, s: 0.75 },
    { x: 330, y: 330, s: 0.55 },
  ];
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <circle cx="250" cy="230" r="200" fill={p.a} opacity=".12" filter={`url(#glow-${id})`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={p.d} opacity=".7" className={i % 4 === 0 ? "anim-twinkle" : undefined} style={{ animationDelay: `${s.d}s` }} />
      ))}
      {bursts.map((b, k) => (
        <g key={k} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          {Array.from({ length: 28 }).map((_, i) => {
            const a = (i / 28) * Math.PI * 2;
            const len = 70 + ((i * 37) % 50);
            return (
              <path
                key={i}
                d={`M${cos(a) * 14} ${sin(a) * 14} L${cos(a) * len} ${sin(a) * len}`}
                stroke={i % 3 === 0 ? p.b : p.a}
                strokeWidth={i % 2 ? 2 : 3}
                strokeLinecap="round"
              />
            );
          })}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + 0.3;
            return <path key={i} d={sparklePath(cos(a) * 120, sin(a) * 120, 8)} fill={p.a} className="anim-twinkle" style={{ animationDelay: `${i * 0.2}s` }} />;
          })}
          <circle r="10" fill="#FFF4DA" />
        </g>
      ))}
      <path d="M170 210 L120 520" stroke={p.c} strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </g>
  );
}

/* 10 ─ Little Wildflowers (fine line) ───────────────────────── */
export function WildflowerRow({ p }: ArtProps) {
  const stems = [40, 95, 150, 205, 260, 315, 370, 425, 470];
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <path d="M0 690 C120 670 380 676 500 688" stroke={p.d} strokeWidth="2" fill="none" />
      {stems.map((x, i) => {
        const h = 160 + ((i * 53) % 110);
        const top = 690 - h;
        const c = [p.a, p.b, p.c][i % 3];
        const bend = i % 2 ? 14 : -14;
        return (
          <g key={x} fill="none" stroke={p.ink} strokeWidth="2" strokeLinecap="round">
            <path d={`M${x} 690 C${x + bend} ${690 - h / 2} ${x - bend} ${top + 40} ${x} ${top}`} stroke={p.d} />
            <path d={`M${x + bend / 2} ${690 - h / 2.5} c14 -6 22 -20 18 -30 c-12 4 -18 16 -18 30z`} stroke={p.d} fill={p.d} fillOpacity=".25" />
            {i % 3 === 0 && (
              <g transform={`translate(${x} ${top})`}>
                {[0, 60, 120, 180, 240, 300].map((r) => (
                  <ellipse key={r} cx="0" cy="-13" rx="6.5" ry="12" transform={`rotate(${r})`} fill={c} fillOpacity=".35" />
                ))}
                <circle r="5" fill={p.c} stroke={p.ink} />
              </g>
            )}
            {i % 3 === 1 && (
              <path transform={`translate(${x} ${top})`} d="M0 6 C-14 2 -16 -16 -10 -24 L-4 -14 L0 -26 L4 -14 L10 -24 C16 -16 14 2 0 6Z" fill={c} fillOpacity=".35" />
            )}
            {i % 3 === 2 && (
              <g transform={`translate(${x} ${top})`}>
                {[-14, 0, 14].map((dx, k) => (
                  <circle key={k} cx={dx * 0.6} cy={-k * 8} r="5" fill={c} fillOpacity=".4" />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* 11 ─ Hats On (pattern) ─────────────────────────────────────── */
export function PartyHats({ p }: ArtProps) {
  const cols = 5, rows = 7;
  const colors = [p.a, p.b, p.c, p.d];
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const x = 50 + c * 100 + (r % 2 ? 50 : 0);
          const y = 60 + r * 100;
          const col = colors[(r + c) % 4];
          const rot = ((r * 3 + c * 7) % 5) * 9 - 18;
          return (
            <g key={`${r}-${c}`} transform={`translate(${x} ${y}) rotate(${rot})`} className={(r + c) % 6 === 0 ? "anim-float" : undefined}>
              <path d="M0 -34 L24 26 H-24Z" fill={col} />
              <path d="M-10 -8 L12 4 M-16 10 L18 22" stroke="#FFFFFF" strokeWidth="4" opacity=".7" />
              <circle cy="-36" r="7" fill={colors[(r + c + 2) % 4]} />
              <path d="M-28 26 H28" stroke={p.ink} strokeWidth="4" strokeLinecap="round" opacity=".25" />
            </g>
          );
        }),
      )}
      <rect x="60" y="230" width="380" height="240" rx="28" fill={p.bg} />
      <rect x="60" y="230" width="380" height="240" rx="28" fill="none" stroke={p.ink} strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
    </g>
  );
}

/* 12 ─ Special Delivery (postmark) ───────────────────────────── */
export function Postmark({ p, id }: ArtProps) {
  const sx = 120, sy = 90, sw = 260, sh = 320;
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <g filter={`url(#shadow-${id})`}>
        <rect x={sx} y={sy} width={sw} height={sh} fill="#FFFDF7" />
      </g>
      {/* perforations */}
      <g fill={p.bg}>
        {Array.from({ length: 14 }).map((_, i) => (
          <g key={i}>
            <circle cx={sx + 10 + i * 18.6} cy={sy} r="7" />
            <circle cx={sx + 10 + i * 18.6} cy={sy + sh} r="7" />
          </g>
        ))}
        {Array.from({ length: 17 }).map((_, i) => (
          <g key={i}>
            <circle cx={sx} cy={sy + 10 + i * 18.8} r="7" />
            <circle cx={sx + sw} cy={sy + 10 + i * 18.8} r="7" />
          </g>
        ))}
      </g>
      <rect x={sx + 22} y={sy + 22} width={sw - 44} height={sh - 44} fill={p.b} />
      <g transform={`translate(${sx + sw / 2} ${sy + 170})`}>
        <circle r="62" fill={p.c} />
        <path d="M-40 40 L-40 -6 L0 -40 L40 -6 L40 40Z" fill={p.a} />
        <rect x="-12" y="10" width="24" height="30" fill={p.bg} />
        <path d="M-56 40 H56" stroke={p.bg} strokeWidth="4" />
      </g>
      <text x={sx + sw / 2} y={sy + 68} textAnchor="middle" fill={p.bg} style={{ font: "600 15px var(--font-instrument)", letterSpacing: "0.3em" }}>
        BIRTHDAY POST
      </text>
      <text x={sx + sw - 36} y={sy + sh - 36} textAnchor="end" fill={p.bg} style={{ font: "700 34px var(--font-fraunces)" }}>
        50¢
      </text>
      {/* cancellation */}
      <g opacity=".75" fill="none" stroke={p.ink} strokeWidth="2.5">
        <circle cx="350" cy="420" r="62" />
        <circle cx="350" cy="420" r="48" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M400 ${392 + i * 18} c25 -12 45 12 70 0 s45 12 70 0`} />
        ))}
      </g>
      <defs>
        <path id={`pm-${id}`} d="M350 420 m-55 0 a55 55 0 1 1 110 0 a55 55 0 1 1 -110 0" />
      </defs>
      <text fill={p.ink} opacity=".75" style={{ font: "700 11px var(--font-instrument)", letterSpacing: "0.25em" }}>
        <textPath href={`#pm-${id}`}>ANOTHER GREAT YEAR · MANY HAPPY RETURNS · </textPath>
      </text>
    </g>
  );
}

/* 13 ─ Citrus Toast ──────────────────────────────────────────── */
export function CitrusToast({ p }: ArtProps) {
  const glass = (x: number, rot: number, fill: string) => (
    <g transform={`translate(${x} 430) rotate(${rot})`}>
      <path d="M-70 -90 Q0 -40 70 -90 Q60 10 0 20 Q-60 10 -70 -90Z" fill={fill} opacity=".85" />
      <path d="M-70 -90 Q0 -110 70 -90" fill="none" stroke={p.ink} strokeWidth="3" />
      <path d="M-70 -90 Q-60 10 0 20 Q60 10 70 -90" fill="none" stroke={p.ink} strokeWidth="3" />
      <path d="M0 20 V140 M-44 140 H44" stroke={p.ink} strokeWidth="4" strokeLinecap="round" />
      {[[-20, -40], [14, -22], [-6, -6], [24, -56]].map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r="4" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      ))}
    </g>
  );
  const slice = (x: number, y: number, r: number, c: string) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={c} />
      <circle r={r - 6} fill="#FFFBEA" />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M0 0 L${(r - 9) * cos((i * Math.PI) / 4 + 0.15)} ${(r - 9) * sin((i * Math.PI) / 4 + 0.15)} A${r - 9} ${r - 9} 0 0 1 ${(r - 9) * cos(((i + 1) * Math.PI) / 4 - 0.15)} ${(r - 9) * sin(((i + 1) * Math.PI) / 4 - 0.15)}Z`} fill={c} opacity=".75" />
      ))}
    </g>
  );
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <circle cx="250" cy="430" r="190" fill={p.c} opacity=".25" />
      {glass(180, -14, p.a)}
      {glass(320, 14, p.b)}
      {slice(118, 330, 34, p.a)}
      {slice(388, 316, 30, p.c)}
      {slice(80, 620, 26, p.c)}
      <g stroke={p.d} strokeWidth="4" strokeLinecap="round">
        <path d="M250 290 V262 M222 298 L206 276 M278 298 L294 276" />
      </g>
      {[[430, 600], [60, 470], [450, 470]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill={p.d} opacity=".7" />
      ))}
    </g>
  );
}

/* 14 ─ Glad You Were Born (orbit circles) ────────────────────── */
export function OrbitCircles({ p }: ArtProps) {
  return (
    <g>
      <rect width={W} height={H} fill={p.bg} />
      <g style={{ mixBlendMode: "multiply" }}>
        <circle cx="330" cy="180" r="130" fill={p.a} opacity=".8" />
        <circle cx="420" cy="290" r="110" fill={p.b} opacity=".7" />
        <circle cx="300" cy="320" r="90" fill={p.c} opacity=".75" />
        <circle cx="420" cy="560" r="70" fill={p.d} opacity=".7" />
      </g>
      <circle cx="210" cy="120" r="12" fill={p.ink} />
      <path d="M60 620 H260" stroke={p.ink} strokeWidth="2" />
    </g>
  );
}
