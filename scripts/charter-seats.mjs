// Reads CHARTER.seats from src/config/charter.ts so the scripts share the app's single source for the cap.
import { readFileSync } from "node:fs";

export function charterSeats() {
  const src = readFileSync(new URL("../src/config/charter.ts", import.meta.url), "utf8");
  const seats = Number(src.match(/^\s*seats:\s*(\d+),/m)?.[1]);
  if (!Number.isInteger(seats) || seats < 1) throw new Error("Couldn't read CHARTER.seats from src/config/charter.ts");
  return seats;
}
