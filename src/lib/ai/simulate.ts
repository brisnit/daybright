/** Simulated latency for demo AI calls. Real providers replace the functions that call this. */
export function simulate(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** Small deterministic hash so the same input yields the same "generation". */
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pick<T>(arr: readonly T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

export const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
