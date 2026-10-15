"use client";

import { clsx } from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { hash } from "@/lib/ai/simulate";
import { DEMO_PHOTOS, DemoPhoto as SendDemoPhoto } from "@/components/send/demo-photos";

/* ------------------------------------------------------------------ */
/* Section frame                                                       */
/* ------------------------------------------------------------------ */

export function SectionHead({ eyebrow, title, accent }: { eyebrow: string; title: string; accent?: string }) {
  return (
    <div className="mb-6 text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: accent ?? "var(--color-ink-3)" }}>
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[30px] font-semibold leading-[1.02] tracking-tight text-ink sm:text-[40px]">{title}</h2>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Recorded greeting (simulated audio)                                 */
/* ------------------------------------------------------------------ */

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function RecordedGreeting({
  durationSec,
  label,
  from,
  accent = "#2446D8",
}: {
  durationSec: number;
  label: string;
  from: string;
  accent?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const dur = Math.max(4, durationSec || 18);

  const bars = useMemo(() => {
    const seed = hash(label + from);
    return Array.from({ length: 44 }).map((_, i) => {
      const x = Math.sin((i + 1) * 12.9898 + seed * 0.0001) * 43758.5453;
      const n = x - Math.floor(x);
      const env = Math.sin((i / 43) * Math.PI) * 0.55 + 0.45;
      return 0.18 + n * 0.82 * env;
    });
  }, [label, from]);

  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    const tick = (now: number) => {
      if (last.current != null) {
        const dt = (now - last.current) / 1000;
        setT((prev) => {
          const next = prev + dt;
          if (next >= dur) {
            setPlaying(false);
            return dur;
          }
          return next;
        });
      }
      last.current = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, dur]);

  const progress = t / dur;
  const done = t >= dur;

  const toggle = () => {
    if (done) {
      setT(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-[28px] bg-white p-5 shadow-lift ring-1 ring-line sm:p-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause recorded greeting" : done ? "Replay recorded greeting" : "Play recorded greeting"}
          className="relative grid size-16 shrink-0 place-items-center rounded-full text-white shadow-soft transition-transform active:scale-95"
          style={{ background: accent }}
        >
          {playing && !reduce && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: accent }}
              animate={{ scale: [1, 1.35], opacity: [0.35, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          {playing ? <Pause className="relative size-6" fill="currentColor" /> : done ? <RotateCcw className="relative size-6" /> : <Play className="relative ml-1 size-6" fill="currentColor" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3">Recorded greeting</p>
          <p className="line-clamp-2 font-display text-xl font-semibold leading-tight tracking-tight text-ink">{label || `A message from ${from}`}</p>
          <p className="text-[13px] text-ink-3">From {from}</p>
        </div>
      </div>

      <div className="mt-5 flex h-14 items-center gap-[3px]" aria-hidden>
        {bars.map((h, i) => {
          const on = i / bars.length < progress;
          const near = playing && Math.abs(i / bars.length - progress) < 0.04;
          return (
            <motion.span
              key={i}
              className="flex-1 rounded-full"
              style={{ background: on ? accent : "rgb(28 24 56 / 0.14)", height: `${h * 100}%` }}
              animate={near && !reduce ? { scaleY: [1, 1.25, 1] } : { scaleY: 1 }}
              transition={{ duration: 0.35 }}
            />
          );
        })}
      </div>

      <div className="mt-3">
        <div
          className="relative h-1.5 overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(dur)}
          aria-valuenow={Math.round(t)}
        >
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress * 100}%`, background: accent }} />
        </div>
        <div className="mt-1.5 flex justify-between font-grotesk text-[12px] tabular-nums text-ink-3">
          <span>{fmt(t)}</span>
          <span>{fmt(dur)}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-[12px] text-ink-3">Audio is simulated in this demo.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Group signatures                                                    */
/* ------------------------------------------------------------------ */

const INKS = ["#2446D8", "#C9402C", "#13795A", "#5B3FB8", "#8A6400", "#1C1838"];

export function SignaturePage({ signatures, recipientFirst }: { signatures: { name: string; note: string }[]; recipientFirst: string }) {
  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] bg-[#FFFDF8] p-6 shadow-lift ring-1 ring-line sm:p-10">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(transparent_0_31px,rgb(28_24_56/0.06)_31px_32px)]" aria-hidden />
      <p className="relative text-center font-hand text-3xl text-ink-2">Signed by the whole crew, {recipientFirst}</p>
      <ul className="relative mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {signatures.map((s, i) => {
          const rot = ((hash(s.name) % 7) - 3) * 0.8;
          return (
            <motion.li
              key={s.name + i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={clsx(i % 2 === 1 && "sm:translate-y-6")}
              style={{ rotate: `${rot}deg` }}
            >
              <p className="font-hand text-[26px] leading-[1.1]" style={{ color: INKS[i % INKS.length] }}>
                {s.note}
              </p>
              <p className="mt-1 font-hand text-[22px] text-ink-2">— {s.name}</p>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Photo memories (illustrated demo photos only)                       */
/* ------------------------------------------------------------------ */

type Scene = "beach" | "mountains" | "cake" | "city" | "garden" | "picnic";
const SCENES: Scene[] = ["beach", "mountains", "cake", "city", "garden", "picnic"];
const SCENE_CAPTION: Record<Scene, string> = {
  beach: "That beach day",
  mountains: "Up the trail",
  cake: "Last year's cake",
  city: "Night out",
  garden: "Garden party",
  picnic: "Park picnic",
};

function sceneFor(id: string): Scene {
  const known = SCENES.find((s) => id.toLowerCase().includes(s));
  return known ?? SCENES[hash(id) % SCENES.length];
}

/** Fallback illustration for photo ids not in the shared DEMO_PHOTOS set. Never a real photo. */
function FallbackPhoto({ id, className }: { id: string; className?: string }) {
  const scene = sceneFor(id);
  return (
    <svg viewBox="0 0 200 160" className={clsx("block size-full", className)} aria-hidden preserveAspectRatio="xMidYMid slice">
      {scene === "beach" && (
        <>
          <rect width="200" height="160" fill="#BFE3F5" />
          <circle cx="150" cy="40" r="18" fill="#FFD45C" />
          <rect y="88" width="200" height="30" fill="#2E8BC0" />
          <path d="M0 96 Q25 90 50 96 T100 96 T150 96 T200 96" stroke="#fff" strokeWidth="3" fill="none" opacity=".7" />
          <rect y="114" width="200" height="46" fill="#F3DDB3" />
          <path d="M40 140 L58 104 L76 140Z" fill="#FF6B57" />
          <rect x="57" y="104" width="2" height="40" fill="#1C1838" />
        </>
      )}
      {scene === "mountains" && (
        <>
          <rect width="200" height="160" fill="#FFE7C2" />
          <circle cx="58" cy="44" r="16" fill="#FF6B57" />
          <path d="M0 120 L60 60 L100 100 L140 50 L200 112 V160 H0Z" fill="#5B3FB8" />
          <path d="M120 72 L140 50 L160 72 L148 68 L140 76 L132 68Z" fill="#fff" />
          <path d="M0 140 Q60 112 120 132 T200 126 V160 H0Z" fill="#13795A" />
        </>
      )}
      {scene === "cake" && (
        <>
          <rect width="200" height="160" fill="#FFE4DD" />
          <rect x="54" y="78" width="92" height="56" rx="6" fill="#fff" />
          <path d="M54 90 Q66 100 77 90 T100 90 T123 90 T146 90" stroke="#FF6B57" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="44" y="132" width="112" height="8" rx="4" fill="#BBA6F6" />
          {[78, 100, 122].map((x) => (
            <g key={x}>
              <rect x={x - 3} y="56" width="6" height="22" rx="2" fill="#2446D8" />
              <path d={`M${x} 42 q6 8 0 13 q-6 -5 0 -13z`} fill="#FFD45C" />
            </g>
          ))}
        </>
      )}
      {scene === "city" && (
        <>
          <rect width="200" height="160" fill="#1C1838" />
          {[20, 70, 130, 170, 40, 110].map((x, i) => (
            <circle key={i} cx={x} cy={14 + (i * 13) % 40} r="1.5" fill="#FFD45C" />
          ))}
          <path d="M0 160 V96 H30 V70 H56 V110 H80 V58 H112 V100 H134 V80 H162 V112 H200 V160Z" fill="#3B3658" />
          {[38, 44, 88, 96, 104, 140, 148].map((x, i) => (
            <rect key={i} x={x} y={80 + (i % 3) * 14} width="5" height="6" fill="#FFD45C" opacity=".85" />
          ))}
          <circle cx="160" cy="34" r="12" fill="#FFF3C7" />
        </>
      )}
      {scene === "garden" && (
        <>
          <rect width="200" height="160" fill="#DCF6EA" />
          <rect y="118" width="200" height="42" fill="#6FD8B1" />
          {[30, 70, 110, 150, 180].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 120 V${84 - (i % 2) * 14}`} stroke="#13795A" strokeWidth="3" />
              <circle cx={x} cy={80 - (i % 2) * 14} r="10" fill={["#FF6B57", "#FFD45C", "#BBA6F6", "#2446D8", "#FF6B57"][i]} />
              <circle cx={x} cy={80 - (i % 2) * 14} r="3.5" fill="#fff" />
            </g>
          ))}
        </>
      )}
      {scene === "picnic" && (
        <>
          <rect width="200" height="160" fill="#E4E9FF" />
          <circle cx="40" cy="36" r="14" fill="#FFD45C" />
          <rect y="100" width="200" height="60" fill="#6FD8B1" />
          <path d="M40 150 L80 104 H170 L150 150Z" fill="#FF6B57" />
          <path d="M60 127 H160 M70 115 H165 M52 139 H155" stroke="#fff" strokeWidth="3" opacity=".7" />
          <rect x="104" y="96" width="30" height="18" rx="4" fill="#8A6400" />
        </>
      )}
    </svg>
  );
}

export function PhotoMemories({ ids }: { ids: string[] }) {
  const reduce = useReducedMotion();
  const shown = ids.slice(0, 4);
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-4 sm:gap-6">
      {shown.map((id, i) => {
        const rot = [-3, 2.5, 1.5, -2][i % 4];
        const known = DEMO_PHOTOS.some((p) => p.id === id);
        return (
          <motion.div
            key={id + i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, rotate: 0 }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, rotate: rot }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 160, damping: 18 }}
            className={clsx(i % 2 === 1 && "mt-8")}
          >
            {known ? (
              <SendDemoPhoto id={id} className="rounded-md shadow-lift [&_figcaption]:text-[20px]" />
            ) : (
              <figure className="rounded-md bg-white p-2.5 pb-3 shadow-lift ring-1 ring-line">
                <div className="aspect-[5/4] overflow-hidden rounded-sm">
                  <FallbackPhoto id={id} />
                </div>
                <figcaption className="mt-2 text-center font-hand text-[20px] leading-none text-ink-2">{SCENE_CAPTION[sceneFor(id)]}</figcaption>
              </figure>
            )}
          </motion.div>
        );
      })}
      <p className="col-span-2 mt-2 text-center text-[12px] text-ink-3">Illustrated demo photos.</p>
    </div>
  );
}
