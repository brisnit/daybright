import type { Palette, PaletteId } from "@/lib/types";

/** Core brand colors, mirrored in globals.css @theme tokens. */
export const C = {
  ink: "#1C1838",
  paper: "#FFF9F0",
  cream: "#FBF1E2",
  cobalt: "#2446D8",
  cobaltDeep: "#1A2F9E",
  coral: "#FF6B57",
  coralDeep: "#D9442F",
  butter: "#FFD45C",
  mint: "#6FD8B1",
  mintDeep: "#13795A",
  lilac: "#BBA6F6",
  lilacDeep: "#5B3FB8",
  blush: "#FFC9BE",
  sky: "#BFD2FF",
} as const;

export const PALETTES: Record<Exclude<PaletteId, "brand">, Palette & { label: string }> = {
  sunny: { label: "Sunny", bg: "#FFF3C7", ink: C.ink, a: C.coral, b: C.cobalt, c: C.butter, d: C.mint },
  "cobalt-pop": { label: "Cobalt pop", bg: C.cobalt, ink: "#FFF9F0", a: C.butter, b: C.coral, c: "#FFF9F0", d: C.lilac },
  garden: { label: "Garden", bg: "#EEF6EA", ink: "#1F3B2C", a: "#F28C7A", b: "#3E8E63", c: "#F6C64A", d: "#B9A2F5" },
  sorbet: { label: "Sorbet", bg: "#FFE6DF", ink: "#3A1C2C", a: C.coral, b: C.lilac, c: C.butter, d: C.mint },
  midnight: { label: "Midnight", bg: "#1C1838", ink: "#FFF4DA", a: "#F5C451", b: C.coral, c: C.lilac, d: C.mint },
  linen: { label: "Linen", bg: "#F7F0E4", ink: "#2A2622", a: "#C4553F", b: "#2E4A7A", c: "#D9B56A", d: "#8AA38B" },
};

export const PALETTE_ORDER = Object.keys(PALETTES) as Exclude<PaletteId, "brand">[];

/** Build a palette from a single brand color. */
export function brandPalette(hex: string): Palette {
  const dark = isDark(hex);
  return {
    bg: dark ? hex : mix(hex, "#FFFFFF", 0.82),
    ink: dark ? "#FFF9F0" : mix(hex, "#000000", 0.55),
    a: dark ? C.butter : hex,
    b: dark ? mix(hex, "#FFFFFF", 0.55) : C.coral,
    c: dark ? "#FFF9F0" : C.butter,
    d: dark ? C.coral : mix(hex, "#FFFFFF", 0.45),
  };
}

export function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function mix(a: string, b: string, t: number) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  const c = (p: number, q: number) => Math.round(p + (q - p) * t).toString(16).padStart(2, "0");
  return `#${c(x.r, y.r)}${c(x.g, y.g)}${c(x.b, y.b)}`;
}

export function isDark(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}
