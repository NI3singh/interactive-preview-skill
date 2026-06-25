import type { CSSProperties } from "react";
import type { EngineTheme, Rect, TourStep } from "./tour-types";

const WIDTH = 300;
const GAP = 14;

interface CoachmarkProps {
  rect: Rect | null;
  step: TourStep;
  index: number;
  total: number;
  onNext: () => void;
  onExit: () => void;
  t: EngineTheme;
}

/**
 * The instruction bubble. It sits just below the target (or above, if there's no room), tells the
 * visitor the one thing to do, and shows progress. For "none" steps it offers a Next button; for
 * click/input steps it nudges the visitor to act on the highlighted element itself.
 */
export function Coachmark({ rect, step, index, total, onNext, onExit, t }: CoachmarkProps) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  let top: number;
  let left: number;
  if (!rect) {
    top = vh / 2 - 80;
    left = vw / 2 - WIDTH / 2;
  } else {
    const below = rect.top + rect.height + GAP;
    const preferAbove = step.placement === "top" || (step.placement !== "bottom" && below + 170 > vh);
    top = preferAbove ? Math.max(GAP, rect.top - GAP - 160) : below;
    left = Math.min(Math.max(GAP, rect.left + rect.width / 2 - WIDTH / 2), Math.max(GAP, vw - WIDTH - GAP));
  }

  const card: CSSProperties = {
    position: "fixed",
    top,
    left,
    width: WIDTH,
    maxWidth: "92vw",
    zIndex: 1002,
    background: t.surface,
    color: t.text,
    border: `1px solid ${t.border}`,
    borderRadius: t.radius,
    boxShadow: t.shadow,
    padding: 16,
    fontFamily: t.font,
  };

  return (
    <div className="pf-fade-up" style={card} role="dialog" aria-label={step.title}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: t.textMuted }}>
          {index + 1} / {total}
        </span>
        <button
          onClick={onExit}
          aria-label="Exit preview"
          style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{step.title}</div>
      <div style={{ fontSize: 13.5, color: t.textMuted, lineHeight: 1.5 }}>{step.body}</div>
      {step.action === "none" ? (
        <button
          onClick={onNext}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "9px 12px",
            background: t.primary,
            color: t.primaryForeground,
            border: "none",
            borderRadius: t.radius,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: t.font,
          }}
        >
          Next
        </button>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, color: t.textMuted, fontStyle: "italic" }}>
          {step.action === "input" ? "Type in the highlighted field to continue" : "Tap the highlighted item to continue"}
        </div>
      )}
    </div>
  );
}
