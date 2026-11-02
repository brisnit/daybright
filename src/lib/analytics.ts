/**
 * Minimal analytics hook. No vendor is installed in this repo, so events are pushed to
 * `window.dataLayer` (picked up by Google Tag Manager or similar if added later) and dispatched
 * as a `daybright:analytics` DOM event. Nothing is sent to a third party by this code.
 */

export type AnalyticsEvent =
  | "cta_click"
  | "sample_demo_open"
  | "reservation_modal_open"
  | "reservation_submit_success"
  | "reservation_submit_error"
  | "reservation_fallback_email"
  | "reservation_fallback_copy"
  | "inquiry_modal_open"
  | "inquiry_submit_success"
  | "pricing_view_toggle";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...props };
  (window.dataLayer ??= []).push(payload);
  window.dispatchEvent(new CustomEvent("daybright:analytics", { detail: payload }));
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", payload);
}
