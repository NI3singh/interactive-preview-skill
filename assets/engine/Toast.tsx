import type { CSSProperties } from "react";
import type { EngineTheme } from "./tour-types";

interface ToastProps {
  message: string;
  t: EngineTheme;
}

/**
 * The reward toast — the little "Nitin's in your circle 🎉" that fires when a step completes.
 * It's small but important: that hit of feedback is what makes the visitor feel they *did*
 * something real, which is the feeling the signup CTA then converts.
 */
export function Toast({ message, t }: ToastProps) {
  const style: CSSProperties = {
    position: "fixed",
    bottom: 28,
    left: "50%",
    transform: "translateX(-50%)",
    background: t.surface,
    color: t.text,
    border: `1px solid ${t.border}`,
    borderRadius: t.radius,
    boxShadow: t.shadow,
    padding: "12px 18px",
    fontFamily: t.font,
    fontSize: 14,
    fontWeight: 600,
    zIndex: 1003,
    maxWidth: "90vw",
    textAlign: "center",
  };
  return (
    <div className="pf-pop" style={style} role="status" aria-live="polite">
      {message}
    </div>
  );
}
