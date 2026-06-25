# Tour Engine Spec

The engine is bundled under `assets/engine/` — copy the whole folder to `preview/engine/`. It's
dependency-free apart from React. Your job in Phase 4 is mostly to **write a flow config** (data),
not to write engine code. This file is the contract.

## What's in the engine

| File | Role |
|------|------|
| `Tour.tsx` | Orchestrator: owns the active step, swaps screens, advances on real interaction, fires toasts + consequences, shows the signup CTA. You pass it a flow + screens + theme. |
| `Spotlight.tsx` | Dim + highlight + the **soft-rail shield** (off-target clicks nudge, target stays live). |
| `Coachmark.tsx` | The instruction bubble with progress and (for `none` steps) a Next button. |
| `Toast.tsx` | The reward toast. |
| `SignupCTA.tsx` | The final conversion card. |
| `useElementRect.ts` | Tracks the target element's rectangle, following layout/scroll/animation. |
| `createStore.ts` | A tiny in-memory store factory for mock state (no network). |
| `tour-types.ts` | `Flow`, `TourStep`, `EngineTheme`, etc. Read this for the exact shapes. |

## The targeting model

Steps reference elements by the `data-tour="id"` attributes you added during reconstruction. The
engine finds the element, draws the spotlight on it, and listens on it for the completing gesture.
Use descriptive ids tied to the flow (`nav-search`, `search-input`, `add-nitin`). This keeps the
config readable and survives restyling — see `references/reconstruction.md`.

## The flow config

A flow is plain data (with a couple of tiny functions for consequences). The full types are in
`tour-types.ts`; the shape:

```ts
import type { Flow } from "../engine";
import { store } from "../mock/store";

export const heroFlow: Flow = {
  id: "find-a-friend",
  name: "Find & add a friend",
  startScreen: "feed",
  steps: [
    { id: "open-search", screen: "feed", target: "nav-search", action: "click",
      title: "Find people", body: "Looking for someone? Open Search." },
    { id: "type-name", screen: "search", target: "search-input", action: "input", expect: "Nitin",
      title: "Search a name", body: "Type a name — try “Nitin”." },
    { id: "add", screen: "search", target: "add-nitin", action: "click",
      title: "Add them", body: "Tap Add to put Nitin in your circle.",
      toast: "Nitin's in your circle 🎉", mutate: () => store.addFriend("nitin") },
    { id: "back", screen: "feed", target: "nav-feed", action: "click",
      title: "Back to your feed", body: "See what changed." },
  ],
  signup: {
    headline: "Build your real circle",
    subtext: "Create your account to find friends and see their posts for real.",
    cta: "Create your account",
    href: "/signup",
  },
};
```

A fill-in-the-blanks starter is in `assets/templates/flow.config.template.ts`.

## How steps complete

- **`click`** — completes when the visitor clicks the target element.
- **`input`** — completes when the target field's value contains `expect` (case-insensitive). The
  field is a real input in your replica with its own local state, so typing shows normally; the
  engine just watches it.
- **`none`** — completes when the visitor presses **Next** in the coachmark. Use for read-only
  "look at this" moments; prefer `click`/`input` so the visitor stays active.

When a step completes, the engine runs `mutate?.()`, shows `toast?`, and advances. If the next
step's `screen` differs, the engine swaps screens automatically — so navigation is tour-driven and
foolproof.

## Soft rails

The visitor can only meaningfully act on the highlighted element. Clicking anywhere else doesn't do
nothing (which feels broken) and doesn't hard-block (which feels caged) — it **re-pulses the
spotlight and re-shows the instruction**. This is deliberate: a stray click becomes a gentle "over
here" instead of a dead end, which keeps a first-timer moving without frustration. It's implemented
with four transparent shields around the target hole (see `Spotlight.tsx`).

## Where consequences live

Keep screens dumb. Put demo state changes in the step's `mutate` (writing to the mock store), and
let screens *read* from the store to reflect them. So "add Nitin" works like this: the Add button is
just a click target with an empty/no-op handler; the step's `mutate` calls `store.addFriend("nitin")`;
the Feed screen reads `store` and now shows Nitin's post. One source of truth, easy to edit by
changing data. (If you'd rather the button's own `onClick` do the mutation, that's fine too — just
don't do it in both places, or it'll apply twice.)

## Theme mapping

The engine chrome (spotlight ring, coachmark, toast, CTA) takes an `EngineTheme`. Map it from your
extracted tokens in the route file so it matches the site:

```ts
const theme = {
  ring: tokens.color.primary, surface: tokens.color.surface, text: tokens.color.text,
  textMuted: tokens.color.textMuted, primary: tokens.color.primary,
  primaryForeground: tokens.color.primaryForeground, border: tokens.color.border,
  radius: tokens.radius.md, font: tokens.font.sans, shadow: tokens.shadow.md,
  backdrop: "rgba(0,0,0,.6)",
};
```

Every field has a default, so override only what you have.

## Mounting it

```tsx
<Tour flow={heroFlow} screens={{ feed: FeedScreen, search: SearchScreen }} theme={theme}
      onExit={() => history.back()} />
```

`screens` maps each step's `screen` string to a component. `onExit` fires on Esc / the × / Close —
route back to the landing page. Full route wiring is in `references/output-structure.md`.

## Adapting

- **JavaScript project:** rename the engine files to `.jsx`/`.js` and strip type annotations; logic
  is unchanged. Drop the `import type {...}` lines.
- **Reduced motion / keyboard:** handled — the engine honors `prefers-reduced-motion`, supports Esc
  to exit, and drives real focusable DOM elements so keyboard works. Keep your replicas semantic.
- **Styling:** the engine uses inline styles from the theme so it won't fight the host CSS. If you
  prefer Tailwind classes, you may translate them, but it's optional.
