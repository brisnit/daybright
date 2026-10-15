import { clsx } from "clsx";
import type { Gift } from "@/lib/types";

const BG: Record<Gift["tone"], string> = {
  cobalt: "#E4E9FF",
  coral: "#FFE4DD",
  butter: "#FFF3C7",
  mint: "#DCF6EA",
  lilac: "#EFE9FF",
  ink: "#E9E7F0",
};

/** Original gift illustrations (4:3). */
export function GiftArt({ gift, className, amount }: { gift: Pick<Gift, "art" | "tone" | "merchant">; className?: string; amount?: number }) {
  return (
    <div className={clsx("relative aspect-[4/3] w-full overflow-hidden rounded-2xl", className)} style={{ background: BG[gift.tone] }}>
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden>
        {ART[gift.art]?.(amount)}
      </svg>
    </div>
  );
}

const ink = "#1C1838";

function GiftCard({ bg, fg, label, amount, mark }: { bg: string; fg: string; label: string; amount?: number; mark: React.ReactNode }) {
  return (
    <g transform="translate(200 150) rotate(-6)">
      <rect x="-122" y="-74" width="244" height="150" rx="16" fill={ink} opacity=".15" transform="translate(6 10)" />
      <rect x="-122" y="-78" width="244" height="150" rx="16" fill={bg} />
      <circle cx="80" cy="-40" r="70" fill={fg} opacity=".18" />
      <g transform="translate(-92 -50)">{mark}</g>
      <text x="-96" y="40" fill={fg} style={{ font: "600 16px var(--font-instrument)" }}>{label}</text>
      {amount != null && (
        <text x="96" y="44" textAnchor="end" fill={fg} style={{ font: "700 34px var(--font-fraunces)" }}>${amount}</text>
      )}
      <rect x="-96" y="52" width="60" height="6" rx="3" fill={fg} opacity=".4" />
    </g>
  );
}

const ART: Record<Gift["art"], (amount?: number) => React.ReactNode> = {
  "coffee-card": (amount) => (
    <>
      <circle cx="330" cy="60" r="40" fill="#FF6B57" opacity=".25" />
      <GiftCard
        bg="#3B2414"
        fg="#FFE4C4"
        label="Morning Ritual"
        amount={amount}
        mark={
          <g>
            <path d="M0 10h36l-4 24a6 6 0 01-6 5H10a6 6 0 01-6-5z" fill="#FF6B57" />
            <path d="M35 16c9 0 9 13 0 13" fill="none" stroke="#FF6B57" strokeWidth="4" />
            <path d="M12 0c-3 4 3 5 0 8M22 0c-3 4 3 5 0 8" stroke="#FFE4C4" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        }
      />
    </>
  ),
  "flex-card": (amount) => (
    <>
      <circle cx="60" cy="240" r="50" fill="#FFD45C" opacity=".5" />
      <GiftCard
        bg="#2446D8"
        fg="#FFF9F0"
        label="Choice Card"
        amount={amount}
        mark={
          <g>
            <circle cx="16" cy="16" r="16" fill="#FFD45C" />
            <path d="M16 6 L19 13 L26 14 L21 19 L22 26 L16 22 L10 26 L11 19 L6 14 L13 13Z" fill="#2446D8" />
          </g>
        }
      />
    </>
  ),
  "book-card": (amount) => (
    <GiftCard
      bg="#13795A"
      fg="#EAFBF3"
      label="Dog-Ear Books"
      amount={amount}
      mark={
        <g>
          <path d="M0 6 C10 0 20 0 20 6 V34 C20 28 10 28 0 34Z" fill="#FFD45C" />
          <path d="M40 6 C30 0 20 0 20 6 V34 C20 28 30 28 40 34Z" fill="#FF6B57" />
        </g>
      }
    />
  ),
  "snack-basket": () => (
    <g>
      <ellipse cx="200" cy="262" rx="140" ry="14" fill={ink} opacity=".1" />
      <rect x="150" y="70" width="40" height="110" rx="6" fill="#FF6B57" transform="rotate(-10 170 125)" />
      <rect x="200" y="60" width="50" height="120" rx="8" fill="#2446D8" transform="rotate(8 225 120)" />
      <rect x="248" y="96" width="44" height="80" rx="20" fill="#6FD8B1" />
      <circle cx="140" cy="140" r="26" fill="#BBA6F6" />
      <path d="M86 150 H314 L292 252 a10 10 0 0 1 -10 8 H118 a10 10 0 0 1 -10 -8Z" fill="#E0A458" />
      <g stroke="#B9783A" strokeWidth="5">
        <path d="M96 182 H304 M102 214 H298" />
        {[130, 170, 210, 250, 290].map((x) => <path key={x} d={`M${x - 12} 152 L${x - 20} 258`} />)}
      </g>
      <path d="M86 150 H314" stroke="#B9783A" strokeWidth="10" strokeLinecap="round" />
      <path d="M200 150 c-30 -26 -50 -2 -20 6 M200 150 c30 -26 50 -2 20 6" fill="none" stroke="#FFD45C" strokeWidth="7" strokeLinecap="round" />
    </g>
  ),
  chocolate: () => (
    <g>
      <ellipse cx="200" cy="258" rx="130" ry="12" fill={ink} opacity=".1" />
      <rect x="80" y="70" width="240" height="180" rx="14" fill="#5A2E1E" />
      <rect x="92" y="82" width="216" height="156" rx="8" fill="#7A4630" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <g key={`${r}${c}`} transform={`translate(${122 + c * 52} ${110 + r * 50})`}>
            <circle r="19" fill={["#3B1F14", "#FF6B57", "#E8C27A", "#BBA6F6"][(r + c) % 4]} />
            <path d="M-9 -4 c4 -6 14 -6 18 0" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )),
      )}
      <path d="M60 140 H340" stroke="#FF6B57" strokeWidth="14" opacity=".9" />
      <path d="M200 140 c-34 -34 -60 -4 -22 8 M200 140 c34 -34 60 -4 22 8" fill="none" stroke="#FF6B57" strokeWidth="9" strokeLinecap="round" />
    </g>
  ),
  flowers: () => (
    <g>
      <ellipse cx="200" cy="270" rx="90" ry="10" fill={ink} opacity=".1" />
      {[[-50, 90, "#FF6B57"], [0, 70, "#BBA6F6"], [50, 92, "#FFD45C"], [-26, 120, "#FFC9BE"], [28, 118, "#FF6B57"]].map(([dx, y, c], i) => (
        <g key={i}>
          <path d={`M200 230 L${200 + (dx as number)} ${(y as number) + 10}`} stroke="#3E8E63" strokeWidth="4" />
          <g transform={`translate(${200 + (dx as number)} ${y})`}>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="0" cy="-14" rx="12" ry="17" fill={c as string} transform={`rotate(${r})`} />
            ))}
            <circle r="8" fill="#FFF3C7" />
          </g>
        </g>
      ))}
      <path d="M150 230 L250 230 L232 272 H168Z" fill="#2446D8" />
      <path d="M156 236 H244" stroke="#FFF9F0" strokeWidth="4" opacity=".6" />
      <path d="M120 120 c-20 -10 -30 10 -10 20 M290 140 c20 -10 30 10 10 20" stroke="#3E8E63" strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  ),
  wellness: () => (
    <g>
      <ellipse cx="200" cy="262" rx="140" ry="12" fill={ink} opacity=".1" />
      <rect x="96" y="130" width="90" height="120" rx="12" fill="#FFF9F0" stroke={ink} strokeOpacity=".15" strokeWidth="3" />
      <rect x="96" y="170" width="90" height="40" fill="#BBA6F6" />
      <path d="M141 120 v-14" stroke={ink} strokeWidth="3" />
      <path d="M141 92 c8 8 6 16 0 16 c-6 0 -8 -8 0 -16z" fill="#FFD45C" />
      <rect x="208" y="100" width="64" height="150" rx="22" fill="#6FD8B1" />
      <rect x="220" y="80" width="40" height="26" rx="6" fill="#13795A" />
      <rect x="216" y="160" width="48" height="40" rx="4" fill="#FFF9F0" />
      <path d="M284 210 c30 -10 50 10 40 40 h-60 c-10 -20 0 -34 20 -40z" fill="#E4E9FF" stroke={ink} strokeOpacity=".15" strokeWidth="3" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${120 + i * 70} 70 l6 -12 l6 12 l-6 12z`} fill="#BBA6F6" opacity=".7" />)}
    </g>
  ),
  "garden-kit": () => (
    <g>
      <ellipse cx="200" cy="262" rx="150" ry="12" fill={ink} opacity=".1" />
      {[110, 200, 290].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 170 V${120 - i * 10}`} stroke="#3E8E63" strokeWidth="5" />
          <path d={`M${x} ${150 - i * 6} c-26 0 -40 -16 -40 -36 c24 0 40 14 40 36z`} fill={["#6FD8B1", "#3E8E63", "#9BCB6B"][i]} />
          <path d={`M${x} ${136 - i * 8} c22 0 36 -14 36 -32 c-22 0 -36 12 -36 32z`} fill={["#3E8E63", "#9BCB6B", "#6FD8B1"][i]} />
          <path d={`M${x - 42} 172 H${x + 42} L${x + 32} 250 H${x - 32}Z`} fill="#D9714E" />
          <rect x={x - 46} y="164" width="92" height="20" rx="4" fill="#E8835E" />
        </g>
      ))}
      <rect x="164" y="200" width="72" height="30" rx="4" fill="#FFF9F0" />
      <text x="200" y="221" textAnchor="middle" fill={ink} style={{ font: "700 14px var(--font-instrument)" }}>BASIL</text>
    </g>
  ),
  tea: () => (
    <g>
      <ellipse cx="200" cy="262" rx="150" ry="12" fill={ink} opacity=".1" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${90 + i * 80} ${110 + (i % 2) * 20})`}>
          <rect width="64" height={130 - (i % 2) * 20} rx="8" fill={["#2446D8", "#FFD45C", "#FF6B57"][i]} />
          <rect y="-10" width="64" height="18" rx="5" fill={["#1A2F9E", "#E0B640", "#C9402C"][i]} />
          <rect x="10" y="40" width="44" height="30" rx="3" fill="#FFF9F0" />
          <path d="M22 55 c6 -10 14 -10 20 0" stroke="#3E8E63" strokeWidth="3" fill="none" />
        </g>
      ))}
      <path d="M332 160 h40 l-6 50 a8 8 0 0 1 -8 7 h-12 a8 8 0 0 1 -8 -7z" fill="#FFF9F0" stroke={ink} strokeOpacity=".2" strokeWidth="3" />
      <path d="M342 150 c-3 -6 3 -8 0 -14 M354 150 c-3 -6 3 -8 0 -14" stroke={ink} strokeOpacity=".4" strokeWidth="2" fill="none" />
    </g>
  ),
};
