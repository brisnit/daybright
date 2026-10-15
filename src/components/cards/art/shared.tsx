/** Shared SVG helpers for card artwork (500×700 viewBox). */

export const W = 500;
export const H = 700;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Common filters, namespaced by a per-instance id. */
export function Filters({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`wc-${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="0.7" />
      </filter>
      <filter id={`wash-${id}`} x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="60" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id={`torn-${id}`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1C1838" floodOpacity="0.18" />
      </filter>
      <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1C1838" floodOpacity="0.18" />
      </filter>
      <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <filter id={`grain-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.15  0 0 0 0.12 0" />
      </filter>
    </defs>
  );
}

/** Subtle paper grain over the whole card. */
export function Grain({ id, opacity = 0.6 }: { id: string; opacity?: number }) {
  return <rect width={W} height={H} filter={`url(#grain-${id})`} opacity={opacity} style={{ mixBlendMode: "multiply" }} />;
}

/** Five-point star path centered at (cx, cy). */
export function starPath(cx: number, cy: number, r: number, inner = 0.45, points = 5) {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(cx + rad * cos(a)).toFixed(1)} ${(cy + rad * sin(a)).toFixed(1)} `;
  }
  return d + "Z";
}

/** 4-point sparkle */
export function sparklePath(cx: number, cy: number, r: number) {
  const k = r * 0.22;
  return `M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r}Z`;
}

/** Rounded trig so server and browser render identical path strings (avoids hydration mismatches). */
export const cos = (a: number) => Math.round(Math.cos(a) * 1e6) / 1e6;
export const sin = (a: number) => Math.round(Math.sin(a) * 1e6) / 1e6;
