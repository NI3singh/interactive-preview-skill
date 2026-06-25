"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EngineTheme, TourProps } from "./tour-types";
import { useElementRect } from "./useElementRect";
import { Spotlight } from "./Spotlight";
import { Coachmark } from "./Coachmark";
import { Toast } from "./Toast";
import { SignupCTA } from "./SignupCTA";

const DEFAULT_THEME: EngineTheme = {
  ring: "#6d5efc",
  surface: "#ffffff",
  text: "#16161d",
  textMuted: "#6b7280",
  primary: "#6d5efc",
  primaryForeground: "#ffffff",
  border: "#e5e7eb",
  radius: "12px",
  font: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  shadow: "0 12px 32px rgba(0,0,0,0.18)",
  backdrop: "rgba(0,0,0,0.6)",
};

// Injected once so the engine carries its own animations and never depends on the host's CSS
// pipeline (which differs between Next App Router, Pages Router, and Vite). See tour.css for the
// readable source of these same keyframes.
const TOUR_CSS = `
@keyframes pf-pulse{0%{box-shadow:0 0 0 0 var(--pf-ring,rgba(109,94,252,.55))}70%{box-shadow:0 0 0 12px rgba(0,0,0,0)}100%{box-shadow:0 0 0 0 rgba(0,0,0,0)}}
@keyframes pf-fade-up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pf-pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
.pf-pulsing{animation:pf-pulse 1s ease-out 2}
.pf-fade-up{animation:pf-fade-up .22s ease-out both}
.pf-pop{animation:pf-pop .2s ease-out both}
.pf-anim{transition:top .32s cubic-bezier(.4,0,.2,1),left .32s cubic-bezier(.4,0,.2,1),width .32s cubic-bezier(.4,0,.2,1),height .32s cubic-bezier(.4,0,.2,1)}
@media (prefers-reduced-motion: reduce){.pf-pulsing,.pf-fade-up,.pf-pop{animation:none!important}.pf-anim{transition:none!important}}
`;

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}

/**
 * The guided-tour orchestrator. It owns which screen is visible (driven by the active step), tracks
 * the target rectangle, advances when the visitor performs the real gesture, fires reward toasts +
 * mock-state mutations, and shows the signup CTA at the end.
 *
 * You normally don't edit this file — you describe the journey in a flow config and pass it in.
 */
export function Tour({ flow, screens, theme, onExit, children }: TourProps) {
  const t: EngineTheme = { ...DEFAULT_THEME, ...(theme ?? {}) };

  const [stepIndex, setStepIndex] = useState(0);
  const [exited, setExited] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finished = stepIndex >= flow.steps.length;
  const activeStep = finished ? null : flow.steps[stepIndex];
  const lastScreen = flow.steps[flow.steps.length - 1]?.screen ?? flow.startScreen;
  const currentScreen = activeStep?.screen ?? lastScreen;
  const ScreenComp = screens[currentScreen];

  const rect = useElementRect(root, activeStep?.target ?? "", `${stepIndex}:${currentScreen}`);
  const targetPresent = rect != null;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // Advance to the next step, applying the step's reward toast and demo consequence.
  const complete = useCallback(() => {
    const step = flow.steps[stepIndex];
    if (!step) return;
    try {
      step.mutate?.();
    } catch {
      /* a demo consequence should never hard-fail the tour */
    }
    if (step.toast) showToast(step.toast);
    setStepIndex((i) => i + 1);
    setPulseKey((k) => k + 1);
  }, [flow, stepIndex, showToast]);

  // Off-step click: re-pulse the spotlight and gently restate the instruction.
  const nudge = useCallback(() => {
    setPulseKey((k) => k + 1);
    if (activeStep) showToast(activeStep.title);
  }, [activeStep, showToast]);

  // Re-pulse whenever the step changes so the new target announces itself.
  useEffect(() => {
    setPulseKey((k) => k + 1);
  }, [stepIndex]);

  // Listen on the real target element for the gesture that completes the step.
  useEffect(() => {
    if (!root || !activeStep || activeStep.action === "none" || !targetPresent) return;
    const el = root.querySelector<HTMLElement>(`[data-tour="${cssEscape(activeStep.target)}"]`);
    if (!el) return;

    if (activeStep.action === "click") {
      const onClick = () => complete();
      el.addEventListener("click", onClick);
      return () => el.removeEventListener("click", onClick);
    }

    // action === "input": complete once the field contains the expected text.
    const onInput = () => {
      const value = (el as HTMLInputElement).value ?? "";
      const expect = activeStep.expect?.toLowerCase() ?? "";
      if (expect && value.toLowerCase().includes(expect)) complete();
    };
    el.addEventListener("input", onInput);
    return () => el.removeEventListener("input", onInput);
  }, [root, activeStep, targetPresent, complete]);

  // Allow Esc to exit the demo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const handleExit = () => {
    setExited(true);
    onExit?.();
  };
  const handleReplay = () => {
    setStepIndex(0);
    setExited(false);
    setPulseKey((k) => k + 1);
  };

  return (
    <div ref={setRoot} style={{ position: "relative", minHeight: "100%", width: "100%" }}>
      <style>{TOUR_CSS}</style>

      {ScreenComp ? <ScreenComp /> : null}

      {!exited && !finished && activeStep && (
        <>
          <Spotlight rect={rect} ring={t.ring} radius={t.radius} pulseKey={pulseKey} onNudge={nudge} />
          <Coachmark
            rect={rect}
            step={activeStep}
            index={stepIndex}
            total={flow.steps.length}
            onNext={complete}
            onExit={handleExit}
            t={t}
          />
        </>
      )}

      {toast && <Toast message={toast} t={t} />}

      {!exited && finished && (
        <SignupCTA signup={flow.signup} onReplay={handleReplay} onExit={handleExit} t={t} />
      )}

      {children}
    </div>
  );
}
