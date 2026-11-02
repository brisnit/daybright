"use client";

import { useEffect, useRef } from "react";

/**
 * Optional Cloudflare Turnstile check for the reservation form.
 * Enabled only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set (with TURNSTILE_SECRET_KEY on the server).
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const TURNSTILE_ENABLED = Boolean(SITE_KEY);

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript() {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Tokens are single-use: bump `resetKey` after every submission that didn't succeed, so a retry gets a fresh token.
 */
export function Turnstile({ onToken, resetKey = 0 }: { onToken: (token: string | undefined) => void; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!SITE_KEY) return;
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id = widget.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          size: "flexible",
          callback: (t: string) => onToken(t),
          "expired-callback": () => onToken(undefined),
          "error-callback": () => onToken(undefined),
        });
      })
      .catch(() => onToken(undefined));
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
      widget.current = undefined;
    };
  }, [onToken]);

  useEffect(() => {
    if (!resetKey || !widget.current || !window.turnstile) return;
    onToken(undefined);
    window.turnstile.reset(widget.current);
  }, [resetKey, onToken]);
  return <div ref={ref} className="min-h-[65px]" />;
}
