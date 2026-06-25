# Output Structure, Delivery & Self-Check

What the skill leaves behind, how it's wired into the app, and how to know it's done.

## The `preview/` directory

```
preview/
  README.md            how to run, where to edit copy/data, how to add another flow
  theme.tokens.ts      extracted design tokens — single source of truth (Phase 1)
  route.tsx            assembles screens + theme + flow and renders <Tour/> (the "preview app")
  engine/              the bundled tour engine, copied from assets/engine/ (Phase 4)
  screens/             reconstructed, presentational-only replicas (Phase 3)
    FeedScreen.tsx
    SearchScreen.tsx
  mock/
    data.ts            mock entities (current user, "Nitin", posts)
    store.ts           in-memory store built on engine/createStore (no network)
  flows/
    hero.config.ts     declarative flow (Phase 2 → authored in Phase 4)
```

Everything the demo needs lives here. The only edit outside this folder is the launch button.

## `preview/route.tsx` — the assembly point

Keep all preview wiring in one client component so the framework route file stays trivial:

```tsx
"use client";
import { Tour } from "./engine";
import { tokens } from "./theme.tokens";
import { FeedScreen } from "./screens/FeedScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { heroFlow } from "./flows/hero.config";

const screens = { feed: FeedScreen, search: SearchScreen };
const theme = {
  ring: tokens.color.primary, surface: tokens.color.surface, text: tokens.color.text,
  textMuted: tokens.color.textMuted, primary: tokens.color.primary,
  primaryForeground: tokens.color.primaryForeground, border: tokens.color.border,
  radius: tokens.radius.md, font: tokens.font.sans, shadow: tokens.shadow.md,
  backdrop: "rgba(0,0,0,.6)",
};

export default function PreviewApp() {
  return <Tour flow={heroFlow} screens={screens} theme={theme} onExit={() => { window.location.href = "/"; }} />;
}
```

## Registering the `/preview` route

Mount `PreviewApp` on whatever routing the project uses. Only this thin file differs per stack:

- **Next.js App Router** — `app/preview/page.tsx`:
  ```tsx
  "use client";
  import PreviewApp from "../../preview/route";
  export default function Page() { return <PreviewApp />; }
  ```
- **Next.js Pages Router** — `pages/preview.tsx`:
  ```tsx
  import PreviewApp from "../preview/route";
  export default function Preview() { return <PreviewApp />; }
  ```
- **react-router / Vite** — add a route:
  ```tsx
  import PreviewApp from "./preview/route";
  <Route path="/preview" element={<PreviewApp />} />
  ```

Use the project's existing import alias (e.g. `@/preview/route`) if it has one; otherwise relative
paths as shown. Match the project's TS/JS and extension conventions.

## The launch button (the one edit outside `preview/`)

Place a theme-matched button on the landing page near its primary CTA, so visitors discover the demo
at the moment of highest intent. This is the user's hero real estate, so **show the exact diff and
get a yes before applying it.**

- **Match the look:** reuse the landing page's existing button component or classes; make it a
  *secondary* action next to the primary CTA, not a competing primary.
- **Copy that invites a try:** "See it in action", "Try the live demo", "Take a 30-second tour".
- **Link to `/preview`** (simplest and shareable). A modal embed is possible later; the route is the
  v1 default.
- **Make it reversible** by bounding it with comment markers so it's obvious and trivial to remove:

```tsx
{/* >>> interactive-preview launch button (safe to remove) */}
<a href="/preview" data-preview-launch className="btn btn-secondary">
  See it in action
</a>
{/* <<< interactive-preview launch button */}
```

Re-running the skill should update the existing button in place, not add a second one.

## Responsive & accessible

- **Mirror the real breakpoints** captured during token extraction; verify the flow at a desktop
  and a mobile width, since the demo is embedded wherever the landing page is.
- The engine already handles `prefers-reduced-motion`, Esc-to-exit, and keyboard interaction because
  it drives real DOM elements — keep replicas semantic (real `button`/`input`, labels, `alt` text)
  so that keeps working.

## `preview/README.md` to generate

A short README so the user can maintain the demo without re-reading the code:
- **Run it:** start the dev server, open `/preview`.
- **Edit the script:** copy and step order live in `preview/flows/hero.config.ts`.
- **Edit the data:** mock entities live in `preview/mock/data.ts`.
- **Re-skin:** colors/fonts live in `preview/theme.tokens.ts` (re-run the skill to re-sync from the
  real site).
- **Add a flow:** create another `*.config.ts`, add its screens to the registry in `route.tsx`.

## Phase 7 self-check

Walk this before declaring done. The first three are non-negotiable.

1. **No leakage.** Audit the preview with the bundled script. It inspects the preview's *code* for
   real call sites (`fetch`/`axios`/`process.env`/`/api/`) and data-layer imports, while ignoring
   README and comments that merely *mention* what the demo avoids — a raw grep flags those and cries
   wolf, which is misleading because documenting the contrast is good practice:
   ```bash
   node <skill>/scripts/audit_preview.mjs preview
   ```
   It exits 0 when clean and lists any real hits otherwise. The preview must run purely on mock
   state. Pass `--deny <names>` to flag extra data-layer modules (e.g. `--deny stripe,segment`).
2. **Isolation.** The only change outside `preview/` is the launch button (and the one route file).
3. **It runs the story end-to-end.** Each step advances only on the visitor's real gesture; soft
   rails nudge on stray clicks; toasts and state changes fire; the signup CTA appears at the payoff
   and links to the real signup route.
4. **It looks real.** Side-by-side, the replica screens match the site's colors, fonts, radii, and
   spacing. Fix mismatches in `theme.tokens.ts`, not per-screen.
5. **Responsive.** Works at desktop and mobile widths.
6. **Reversible & idempotent.** Button injection is comment-bounded; re-running updates in place.

If you can run the project, actually load `/preview` and complete the flow yourself — nothing
substitutes for walking it once.
