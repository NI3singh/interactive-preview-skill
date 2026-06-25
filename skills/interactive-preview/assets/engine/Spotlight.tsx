import type { CSSProperties } from "react";
import type { Rect } from "./tour-types";

const PAD = 6;

interface SpotlightProps {
  rect: Rect | null;
  ring: string;
  radius: string;
  /** Bump on every step change and nudge to replay the pulse animation. */
  pulseKey: number;
  onNudge: () => void;
}

/**
 * Dims the page except for a "hole" around the target, and enforces the soft rails.
 *
 * The dim is a single element with a huge box-shadow spread and pointer-events:none, so clicks
 * pass straight through to the real target underneath. Around that hole we lay four transparent
 * "shield" rectangles that DO capture clicks — tapping anywhere off-target calls onNudge (which
 * re-pulses the spotlight and shows a hint) instead of doing nothing. The target hole has no
 * shield over it, so the actual button/input stays fully clickable and typeable. That's the whole
 * trick: guidance without caging.
 */
export function Spotlight({ rect, ring, radius, pulseKey, onNudge }: SpotlightProps) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  // No target resolved yet (e.g. mid screen-transition): dim everything; any click nudges.
  if (!rect) {
    return (
      <div
        onClick={onNudge}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000 }}
      />
    );
  }

  const hole = {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };

  const dim: CSSProperties = {
    position: "fixed",
    top: hole.top,
    left: hole.left,
    width: hole.width,
    height: hole.height,
    borderRadius: radius,
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
    outline: `2px solid ${ring}`,
    pointerEvents: "none",
    zIndex: 1000,
    ["--pf-ring" as never]: ring,
  };

  const shield = (s: CSSProperties): CSSProperties => ({
    position: "fixed",
    background: "transparent",
    pointerEvents: "auto",
    zIndex: 1001,
    ...s,
  });

  return (
    <>
      <div key={pulseKey} className="pf-anim pf-pulsing" style={dim} />
      {/* Four shields around the hole. Together they cover the whole viewport except the target. */}
      <div onClick={onNudge} style={shield({ top: 0, left: 0, width: vw, height: Math.max(0, hole.top) })} />
      <div
        onClick={onNudge}
        style={shield({ top: hole.top + hole.height, left: 0, width: vw, height: Math.max(0, vh - (hole.top + hole.height)) })}
      />
      <div onClick={onNudge} style={shield({ top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height })} />
      <div
        onClick={onNudge}
        style={shield({ top: hole.top, left: hole.left + hole.width, width: Math.max(0, vw - (hole.left + hole.width)), height: hole.height })}
      />
    </>
  );
}
