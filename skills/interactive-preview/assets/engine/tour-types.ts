import type { ComponentType, ReactNode } from "react";

/** How the visitor completes a step. "none" advances via the coachmark's Next button. */
export type StepAction = "click" | "input" | "none";

export interface TourStep {
  /** Stable id — handy for debugging and (later) analytics. */
  id: string;
  /** Which screen must be visible for this step. Must be a key in the screens registry. */
  screen: string;
  /** data-tour id of the element to spotlight and listen on. */
  target: string;
  /** Coachmark heading. */
  title: string;
  /** Coachmark body — keep it to one short, do-able instruction. */
  body: string;
  /** How the visitor completes this step. */
  action: StepAction;
  /** For action "input": complete once the field's value contains this (case-insensitive). */
  expect?: string;
  /** Preferred coachmark placement relative to the target. Defaults to "auto". */
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  /** Reward toast shown when the step completes (e.g. "Nitin's in your circle 🎉"). */
  toast?: string;
  /** Demo consequence applied on completion — usually a mock-store write. Keep it side-effect-light. */
  mutate?: () => void;
}

export interface SignupConfig {
  headline: string;
  subtext?: string;
  cta: string;
  href: string;
}

export interface Flow {
  id: string;
  name: string;
  /** Screen shown before the first step and as a fallback. */
  startScreen: string;
  steps: TourStep[];
  signup: SignupConfig;
}

/** Maps a step's `screen` string to the component that renders it. */
export type ScreenRegistry = Record<string, ComponentType<any>>;

/**
 * The handful of visual values the engine itself needs. Map these from your extracted
 * `theme.tokens` so the spotlight, coachmark, toast, and CTA match the host site. Every field
 * has a sane default, so you only override what you care about.
 */
export interface EngineTheme {
  ring: string;             // spotlight outline + pulse color — usually tokens.color.primary
  surface: string;          // coachmark / toast / card background
  text: string;
  textMuted: string;
  primary: string;
  primaryForeground: string;
  border: string;
  radius: string;
  font: string;
  shadow: string;
  backdrop: string;         // dim behind the final signup card
}

export interface TourProps {
  flow: Flow;
  screens: ScreenRegistry;
  /** Visual tokens for the engine chrome. Map from your theme.tokens. */
  theme?: Partial<EngineTheme>;
  /** Called when the visitor exits before finishing (e.g. route back to the landing page). */
  onExit?: () => void;
  /** Optional overlay content rendered above everything (rarely needed). */
  children?: ReactNode;
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
