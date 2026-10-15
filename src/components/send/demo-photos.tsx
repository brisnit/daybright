import { clsx } from "clsx";

/**
 * Illustrated stand-ins for "photo memories". Drawn in SVG so the prototype never uses real personal photos.
 * Ids are stored in `extras.photoMemories`.
 */
export const DEMO_PHOTOS = [
  { id: "photo-picnic", label: "Park picnic" },
  { id: "photo-beach", label: "Beach day" },
  { id: "photo-peaks", label: "Trail summit" },
  { id: "photo-cake", label: "Last year's cake" },
  { id: "photo-dog", label: "Walk with the dog" },
  { id: "photo-city", label: "City lights" },
] as const;

export type DemoPhotoId = (typeof DEMO_PHOTOS)[number]["id"];

const SCENES: Record<DemoPhotoId, React.ReactNode> = {
  "photo-picnic": (
    <>
      <rect width="120" height="90" fill="#CFEFDF" />
      <circle cx="96" cy="20" r="11" fill="#FFD45C" />
      <path d="M0 58 Q40 44 120 56 V90 H0Z" fill="#6FD8B1" />
      <path d="M22 66 L78 60 L96 82 L30 88Z" fill="#FF6B57" />
      <path d="M36 65 L46 86 M52 63 L64 84 M30 74 L86 69" stroke="#FFF9F0" strokeWidth="3" />
      <circle cx="62" cy="62" r="6" fill="#FFD45C" />
      <path d="M14 58 V34 M14 38 c-8-10 4-18 0-26 c-4 8 8 16 0 26" fill="#13795A" stroke="#13795A" strokeWidth="2" />
    </>
  ),
  "photo-beach": (
    <>
      <rect width="120" height="90" fill="#E4E9FF" />
      <circle cx="30" cy="26" r="13" fill="#FFD45C" />
      <path d="M0 48 Q30 42 60 48 T120 48 V64 H0Z" fill="#2446D8" />
      <path d="M0 56 Q30 50 60 56 T120 56" stroke="#FFF9F0" strokeWidth="2" fill="none" opacity=".7" />
      <path d="M0 62 H120 V90 H0Z" fill="#F3E7D3" />
      <path d="M84 84 L92 50" stroke="#1C1838" strokeWidth="2" />
      <path d="M70 52 Q92 30 112 52Z" fill="#FF6B57" />
    </>
  ),
  "photo-peaks": (
    <>
      <rect width="120" height="90" fill="#FFF3C7" />
      <path d="M0 80 L36 30 L58 60 L80 24 L120 80Z" fill="#2446D8" />
      <path d="M80 24 L90 38 L84 36 L78 42 L72 35Z" fill="#FFF9F0" />
      <path d="M0 90 V74 Q60 62 120 74 V90Z" fill="#6FD8B1" />
      <path d="M80 24 V12 L92 16 L80 20" fill="#FF6B57" stroke="#1C1838" strokeWidth="1" />
    </>
  ),
  "photo-cake": (
    <>
      <rect width="120" height="90" fill="#FFE4DD" />
      <rect x="30" y="46" width="60" height="30" rx="4" fill="#FFF9F0" />
      <path d="M30 54 Q45 62 60 54 T90 54" fill="none" stroke="#FF6B57" strokeWidth="4" />
      <rect x="22" y="76" width="76" height="5" rx="2.5" fill="#BBA6F6" />
      {[44, 60, 76].map((x) => (
        <g key={x}>
          <rect x={x - 2} y="32" width="4" height="14" fill="#2446D8" />
          <path d={`M${x} 22 q4 5 0 9 q-4 -4 0 -9`} fill="#FFD45C" />
        </g>
      ))}
    </>
  ),
  "photo-dog": (
    <>
      <rect width="120" height="90" fill="#EFE9FF" />
      <path d="M0 70 H120 V90 H0Z" fill="#6FD8B1" />
      <ellipse cx="62" cy="60" rx="24" ry="12" fill="#C98A3E" />
      <circle cx="88" cy="46" r="10" fill="#C98A3E" />
      <path d="M84 40 q-6 -8 -2 10" fill="#8A5A22" />
      <circle cx="92" cy="45" r="1.6" fill="#1C1838" />
      <path d="M44 66 v12 M54 68 v10 M70 68 v10 M80 66 v12" stroke="#C98A3E" strokeWidth="5" strokeLinecap="round" />
      <path d="M38 56 q-10 -8 -6 -16" stroke="#C98A3E" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M96 52 L112 30" stroke="#FF6B57" strokeWidth="2" />
    </>
  ),
  "photo-city": (
    <>
      <rect width="120" height="90" fill="#1C1838" />
      {[[8, 12], [30, 22], [52, 8], [96, 16], [74, 26]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#FFD45C" />
      ))}
      <path d="M0 90 V54 H14 V40 H28 V60 H38 V30 H54 V58 H66 V44 H82 V62 H92 V36 H108 V56 H120 V90Z" fill="#3B3658" />
      {[42, 46, 50].map((y) => (
        <g key={y}>
          <rect x="42" y={y - 6} width="3" height="3" fill="#FFD45C" />
          <rect x="48" y={y - 2} width="3" height="3" fill="#FFD45C" opacity=".7" />
          <rect x="96" y={y} width="3" height="3" fill="#FFD45C" />
        </g>
      ))}
      <circle cx="100" cy="14" r="7" fill="#FFF9F0" />
    </>
  ),
};

/** A single illustrated "photo" in a polaroid frame. */
export function DemoPhoto({ id, className, tilt = 0, caption }: { id: string; className?: string; tilt?: number; caption?: string }) {
  const photo = DEMO_PHOTOS.find((p) => p.id === id);
  if (!photo) return null;
  return (
    <figure
      className={clsx("bg-white p-[6%] pb-[4%] shadow-[0_6px_16px_-8px_rgb(28_24_56/0.45)] ring-1 ring-black/5", className)}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      <svg viewBox="0 0 120 90" className="block w-full" role="img" aria-label={`Illustrated photo: ${photo.label}`}>
        {SCENES[photo.id]}
      </svg>
      {caption !== "" && <figcaption className="mt-[5%] truncate text-center font-hand text-[15px] leading-none text-ink-2">{caption ?? photo.label}</figcaption>}
    </figure>
  );
}
