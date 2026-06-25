import type { CSSProperties } from "react";
import type { EngineTheme, SignupConfig } from "./tour-types";

interface SignupCTAProps {
  signup: SignupConfig;
  onReplay: () => void;
  onExit: () => void;
  t: EngineTheme;
}

/**
 * The payoff. It appears right after the visitor completes the satisfying final action, while the
 * result of what they just did is still on screen behind it. The headline should connect the demo
 * to the real thing ("Create your account to build your real circle") and the primary button goes
 * straight to the actual signup route — turning the demo into a conversion at its peak moment.
 */
export function SignupCTA({ signup, onReplay, onExit, t }: SignupCTAProps) {
  const backdrop: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: t.backdrop,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1004,
    padding: 20,
  };
  const card: CSSProperties = {
    background: t.surface,
    color: t.text,
    border: `1px solid ${t.border}`,
    borderRadius: t.radius,
    boxShadow: t.shadow,
    padding: 28,
    maxWidth: 380,
    width: "100%",
    textAlign: "center",
    fontFamily: t.font,
  };
  const link: CSSProperties = {
    background: "none",
    border: "none",
    color: t.textMuted,
    cursor: "pointer",
    textDecoration: "underline",
    fontFamily: t.font,
    fontSize: 13,
  };

  return (
    <div className="pf-fade-up" style={backdrop}>
      <div className="pf-pop" style={card} role="dialog" aria-label={signup.headline}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{signup.headline}</div>
        {signup.subtext && (
          <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 20, lineHeight: 1.5 }}>{signup.subtext}</div>
        )}
        <a
          href={signup.href}
          style={{
            display: "block",
            padding: "12px 16px",
            background: t.primary,
            color: t.primaryForeground,
            borderRadius: t.radius,
            fontWeight: 700,
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          {signup.cta}
        </a>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <button onClick={onReplay} style={link}>Replay demo</button>
          <button onClick={onExit} style={link}>Close</button>
        </div>
      </div>
    </div>
  );
}
