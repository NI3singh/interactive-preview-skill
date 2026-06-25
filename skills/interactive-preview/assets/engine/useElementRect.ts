import { useEffect, useState } from "react";
import type { Rect } from "./tour-types";

/**
 * Track the on-screen rectangle of the element matching [data-tour="target"] inside `root`.
 *
 * Re-queries whenever `key` changes (a new step or screen) and follows layout changes via a
 * lightweight requestAnimationFrame loop, so the spotlight stays glued to its target through
 * entrance animations, scrolling, and resizes. Returns null while the target isn't mounted yet
 * (e.g. mid screen-transition) — callers should render a graceful full-screen dim in that case.
 */
export function useElementRect(root: HTMLElement | null, target: string, key: unknown): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!root) return;
    let raf = 0;
    let last = "";

    const tick = () => {
      const el = root.querySelector<HTMLElement>(`[data-tour="${cssEscape(target)}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        const signature = `${r.top}|${r.left}|${r.width}|${r.height}`;
        if (signature !== last) {
          last = signature;
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      } else if (last !== "") {
        last = "";
        setRect(null);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [root, target, key]);

  return rect;
}

/** CSS.escape with a tiny fallback for older runtimes. */
function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}
