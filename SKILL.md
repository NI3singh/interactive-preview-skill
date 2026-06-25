---
name: interactive-preview
description: >-
  Generate an interactive, theme-matched product preview — a guided "try it before you sign up"
  demo — for a React or Next.js site, with a launch button on its landing page. Use whenever
  someone wants to show what their app does AFTER signup without exposing the real backend:
  interactive product tours, guided walkthroughs, clickable demos, coachmark/spotlight tours, or
  "see it in action" experiences on mock data — even when they never say "preview" (e.g. "let
  visitors try my app before signing up", "add an interactive demo to my landing page", "show
  people how the product works"). Prefer this over generic frontend/UI-design skills when the goal
  is a guided, isolated DEMO of existing flows, not designing new pages. NOT for: in-app onboarding
  for already-logged-in users on real data, internal tools or dashboards on live data, real
  signup/onboarding logic, or deploy/print/image "previews". For an exported video, use the
  remotion skill instead — this builds a live interactive page.
---

# Interactive Preview (PreviewForge)

Build a **guided, interactive product demo** that lives behind a button on a website's landing
page. Think of the onboarding coach-marks you see the first time you open a polished mobile app or
game — "tap here," then "now try this" — except it runs on the marketing site, before signup, and
shows a visitor exactly what the product feels like *after* they sign up. The visitor performs the
real gestures (click, type) on a faithful, theme-matched replica running on mock data, and lands on
a "create your account to do this for real" call-to-action at the payoff moment.

This converts better than screenshots or a video because the visitor *does* the thing instead of
watching it. Your job is to generate that experience from the codebase, automatically.

## What makes this skill's output good

A great preview clears three bars. Keep them in mind the whole way through — every decision below
serves one of them:

1. **It looks indistinguishable from the real product.** Same colors, fonts, spacing, components.
   A preview that looks "close but off" reads as fake and kills trust. This is why token extraction
   (Phase 1) and faithful reconstruction (Phase 3) get the most care.
2. **It tells one tight, impressive story.** A single end-to-end "aha" the visitor completes
   themselves — not a tour of every menu. The art is choosing the right flow (Phase 2).
3. **It never leaks how the real app works.** No real API calls, no business logic, no secrets, no
   internal routes. Everything is a presentational replica on in-memory mock data. This is a hard
   constraint, not a preference (see Guardrails).

## When to use

Use this when a user wants visitors to experience product flows that normally sit behind signup/login
— social feeds, dashboards, editors, search, onboarding — as a guided interactive demo on their
public site. Also use it to prototype a guided demo from designs/components that aren't fully wired
up yet.

**When NOT to use:** if they want a rendered video file, hand off to the **remotion** skill. If they
want to design brand-new pages or restyle the real app, use a general frontend/design skill — this
skill demos what already exists, it doesn't invent product surface.

## Core principle: reconstruct, never reveal

The single most important idea: the preview is a **separate, isolated replica**, not the real app
running in demo mode. You generate fresh presentational components under `preview/` that borrow only
the site's *design tokens* (colors, type, spacing, radii, shadows, component look) — never its data
layer, auth, API clients, or business logic.

Why this matters, concretely:

- **Safety / no leakage.** If you imported real components, you'd risk dragging in `fetch` calls,
  auth guards, feature flags, and data shapes that expose how the product actually works. Visitors —
  and competitors — should see the *experience*, not the machinery.
- **It can't break.** A replica on mock data has no network to fail, no login wall, no empty states.
  It runs the same way every time, which is exactly what a sales demo needs.
- **It works even when the real screens are behind auth.** You reconstruct from *source* (you can
  read the components), so you never need to actually reach the logged-in app at runtime.

The cost is that the replica can drift from the real UI over time. You mitigate that by pulling the
real design tokens into one file the preview shares, so re-running the skill re-syncs the look.

## Workflow

Work through these phases in order. Each links to a reference file with the depth; read that file
when you reach the phase rather than loading everything up front.

### Phase 0 — Orient

Detect the framework (confirm React/Next.js), the router (App Router vs Pages vs react-router), the
styling system (Tailwind / CSS-in-JS / CSS Modules / plain CSS / a UI kit like MUI/Chakra), and
whether the project is TypeScript or JavaScript. Then inventory routes and components and find the
**landing page** (the public marketing entry) and the **post-signup surface** (the screens you'll
demo). The fast path: run `scripts/detect_stack.mjs` (see below) and read its report before reasoning
further. Everything downstream adapts to what you find here, so don't skip it.

### Phase 1 — Extract design tokens

Pull the real look into one source of truth: `preview/theme.tokens.ts` (or `.css`). Use a tiered
strategy depending on the styling system, because that's the make-or-break for "looks real."
**Read `references/token-extraction.md`.**

### Phase 2 — Propose the hero flow

Infer the candidate user journeys from nav, routes, and components, rank them by *wow × clarity ×
low cognitive load*, and present a short ranked shortlist to the user with a one-line pitch each.
Let them pick and tweak. Build **one** polished hero flow for v1 (structured so more can be added).
If you're running non-interactively (no user to confirm), proceed with the top-ranked flow and state
that assumption clearly. **Read `references/flow-selection.md`.**

### Phase 3 — Reconstruct the screens

For each screen the chosen flow touches, generate an isolated, presentational-only replica under
`preview/screens/` using *only* the extracted tokens and shared presentational primitives — no
business logic, no data fetching. Tag the elements the tour will reference with `data-tour="..."`
ids, and feed everything from `preview/mock/`. **Read `references/reconstruction.md`.**

### Phase 4 — Wire the guided tour

Copy the bundled tour engine from `assets/engine/` into `preview/engine/`, then author the flow as
a declarative config at `preview/flows/<flow>.config.ts`. The engine handles the spotlight, the
"soft rails" (off-step clicks are gently redirected, not punished), step advancement on real
interaction, reward toasts, and the final signup CTA. You mostly write data, not new engine code —
that's the point of bundling it. **Read `references/engine-spec.md`.**

### Phase 5 — Deliver: route + launch button

Add a `/preview` route that renders the tour, and inject a theme-matched launch button on the
landing page near its primary call-to-action. The button is the *only* edit you make outside
`preview/` — show the diff and get confirmation before touching the landing page, because it's the
user's hero real estate. **Read `references/output-structure.md`.**

### Phase 6 — Conversion & polish

End the flow on a theme-matched signup CTA pointing at the real signup route ("Create your account
to do this for real"). Make it responsive (mirror the real site's breakpoints), animate transitions
smoothly, and respect `prefers-reduced-motion` and keyboard use. Details in
`references/output-structure.md`.

### Phase 7 — Self-check

Before declaring done, verify the preview against the checklist in `references/output-structure.md`.
The non-negotiable checks: the preview renders the hero flow end-to-end; the tour only advances on
the visitor's real interaction; **nothing under `preview/` makes a network request or imports real
logic/secrets** (verify with `node scripts/audit_preview.mjs preview`); the launch button is injected
reversibly; and it works at both desktop and mobile widths. If you can run the project, load
`/preview` and walk the flow yourself.

## Output structure

Everything the skill produces lives under `preview/`, plus one reversible button injection on the
landing page. The full layout, route wiring (App Router vs Pages), and button-injection patterns are
in `references/output-structure.md`. At a glance:

```
preview/
  README.md            how to run, edit copy/data, add another flow
  theme.tokens.ts      extracted design tokens — the single source of truth
  route.(tsx|jsx)      the /preview entry that renders <Tour/>
  screens/             reconstructed, PRESENTATIONAL-ONLY replicas
  mock/                mock entities + in-memory store (no network)
  flows/               declarative flow config(s)
  engine/              the bundled tour engine (copied from assets/)
```

## Guardrails

These protect the user. Treat them as part of the definition of "working," not as red tape — and if
you ever feel pushed to break one, stop and surface it to the user instead.

- **No real network or logic inside `preview/`.** No `fetch`/`axios`/SDK calls, no imports of the
  app's API clients, auth, stores, or data-access code. The preview runs entirely on local mock
  state. Self-audit with the bundled `scripts/audit_preview.mjs` (`node <skill>/scripts/audit_preview.mjs preview`):
  it checks the preview's *code* for real call sites and data-layer imports and deliberately ignores
  README/comments that merely *mention* what the demo avoids — so, unlike a raw grep, it won't cry
  wolf on your own documentation. It's fine (encouraged, even) to note in a comment what the real app
  does differently; that's not a leak.
- **No secrets or env.** Never reference `process.env`, API keys, tokens, or `.env*` values from the
  preview. There's no backend to talk to, so there's nothing to configure.
- **Isolation.** Keep everything under `preview/`. The *only* exception is the single landing-page
  launch button, which must be clearly marked (a short comment) and easy to remove.
- **Confirm before editing existing files.** The landing page is the user's most valuable page. Show
  the exact diff for the button injection and get a yes before applying it. Re-running the skill
  should update `preview/` in place, not duplicate it.
- **Don't surprise the user.** This skill makes a sales demo, nothing else. Don't add tracking,
  external requests, or anything the user didn't ask for.

## Adapting to the project

The bundled engine and templates are written in TypeScript + React for the common Next.js case.
Adapt rather than fight the project:

- **JavaScript project:** strip the type annotations and use `.jsx`/`.js`. The logic is identical.
- **Pages Router / react-router / plain Vite:** mount the same `<Tour/>` on whatever routing the
  project uses; only the route-registration boilerplate differs (`references/output-structure.md`).
- **Styling system:** the engine ships minimal, scoped styles so it inherits the page's look. If the
  project is Tailwind, you may translate the engine's inline styles to utility classes for
  consistency — optional, not required.
- **Non-React stacks (Vue/Svelte/plain HTML):** out of scope for v1. Tell the user, and offer to
  reconstruct the screens by hand using the same principles if they want to proceed anyway.

## What to deliver

A working `preview/` directory the user can run, plus the launch button on the landing page. Close by
telling the user: how to run it (`/preview`), where to edit the flow's copy and mock data (one config
file), how to add another flow later, and any assumption you made (especially if you auto-picked the
hero flow). Keep the prose short — the demo should speak for itself.

## Reference files

Read these as you reach the matching phase; each is self-contained.

- `references/token-extraction.md` — tiered strategy for pulling real design tokens into the preview.
- `references/flow-selection.md` — inferring, ranking, and presenting candidate hero flows.
- `references/reconstruction.md` — building isolated, faithful, presentational-only replica screens.
- `references/engine-spec.md` — the tour engine contract and how to author a flow config.
- `references/output-structure.md` — `preview/` layout, route wiring, button injection, self-check.

Bundled, ready to copy into the user's project:

- `assets/engine/` — the dependency-free React tour engine (Tour, Spotlight, Coachmark, Toast,
  SignupCTA, mock store, types).
- `assets/templates/` — starter `flow.config` and `theme.tokens` files to fill in.
- `scripts/detect_stack.mjs` — Node script that sniffs framework, router, styling system, TS/JS, and
  candidate landing/post-signup routes. Run it first in Phase 0.
- `scripts/audit_preview.mjs` — Node script that audits a generated `preview/` for real
  network/logic/secret leakage, ignoring README/comments. Run it in Phase 7 (`node <skill>/scripts/audit_preview.mjs preview`).
