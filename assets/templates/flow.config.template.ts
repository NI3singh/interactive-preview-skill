/**
 * Flow config template — copy to preview/flows/<your-flow>.config.ts and fill in.
 *
 * A flow is the ONE guided story your preview tells. Keep it to 3–6 steps, each a single do-able
 * gesture, ending in a satisfying state change. See references/flow-selection.md (how to choose the
 * story) and references/engine-spec.md (what each field means).
 */
import type { Flow } from "../engine";
import { store } from "../mock/store";

export const heroFlow: Flow = {
  id: "REPLACE-flow-id",
  name: "REPLACE — what the visitor accomplishes",
  startScreen: "REPLACE-first-screen", // must be a key in your screens registry (see route.tsx)

  steps: [
    // action "click" → completes when the visitor clicks the highlighted element.
    {
      id: "step-1",
      screen: "REPLACE-screen",
      target: "REPLACE-data-tour-id",
      action: "click",
      title: "Short heading",
      body: "One do-able instruction.",
    },

    // action "input" → completes when the field's value contains `expect` (case-insensitive).
    {
      id: "step-2",
      screen: "REPLACE-screen",
      target: "REPLACE-input-id",
      action: "input",
      expect: "REPLACE",
      title: "Short heading",
      body: "Tell them exactly what to type.",
    },

    // a payoff step with a reward toast and a demo consequence (mock-store write).
    {
      id: "step-3",
      screen: "REPLACE-screen",
      target: "REPLACE-id",
      action: "click",
      title: "Short heading",
      body: "One instruction.",
      toast: "Nice — that worked 🎉",
      mutate: () => {
        /* e.g. store.addFriend("nitin") — the screen reads the store and reflects the change */
      },
    },
  ],

  signup: {
    headline: "REPLACE — connect the demo to the real product",
    subtext: "REPLACE — one line on why to sign up.",
    cta: "Create your account",
    href: "/signup", // the real signup route
  },
};
