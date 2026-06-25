# Token Extraction

Goal: produce **one** file — `preview/theme.tokens.ts` (plus an optional `:root` CSS variable block) —
that captures the real site's visual language, so every reconstructed screen pulls from it and looks
indistinguishable from production. This is the highest-leverage step: a preview that's even slightly
"off" on color, font, or spacing reads as fake and the whole effect collapses. Spend the care here.

## Strategy: detect the styling system, then pull from its source of truth

Work through these in the order that matches the project. `scripts/detect_stack.mjs` tells you which
system is in play; confirm by looking.

### Tier 1 — Tailwind
- Read `tailwind.config.{js,ts,cjs,mjs}`. Pull `theme.extend` and base `theme`: `colors`,
  `fontFamily`, `fontSize`, `fontWeight`, `borderRadius`, `boxShadow`, `spacing`, `screens`.
- For **Tailwind v4** (no JS config), read the `@theme { --color-*: ...; --font-*: ... }` block in the
  global CSS instead.
- Also scan `globals.css`/`app.css` for CSS variables and `@layer base` defaults (body bg/text,
  default font).
- Don't just copy the whole palette — note *which* colors are actually used for primary actions,
  surfaces, and text by skimming a few real components. The tokens you emit should reflect real usage.

### Tier 2 — CSS-in-JS (styled-components, emotion, stitches, vanilla-extract)
- Find the theme object passed to `<ThemeProvider theme={...}>` (often `theme.ts`, `styles/theme.ts`).
- Copy its palette, typography, spacing, radii, shadows verbatim into the tokens file.

### Tier 3 — CSS variables
- Harvest `:root { --... }` (and any `[data-theme]` / `.dark` blocks) from global stylesheets. These
  are already a clean token set — mirror them into the preview's `:root` and reference them.

### Tier 4 — UI kit (MUI, Chakra, Mantine, Ant)
- Read the theme config (`createTheme`, `extendTheme`, `MantineProvider theme=...`). Extract
  `palette`/`colors`, `typography`/`fonts`, `shape.borderRadius`, `shadows`.
- The preview can either reuse the kit (it's presentational and safe) or mirror the tokens; mirroring
  keeps the preview dependency-light, reusing keeps it pixel-exact. Prefer reusing the kit's
  *presentational* components when the project already depends on it.

### Tier 5 — Plain CSS / inline / unknown
- Inspect the key building blocks directly: `body`, a primary button, a card/panel, an input, the
  nav, an avatar. Record their `font-family`, `font-size`, `font-weight`, text color, background,
  `border`, `border-radius`, `box-shadow`, and padding.
- If you can run the site, reading *computed* styles is the most reliable source.

## What to capture (the token set)

Aim for enough to rebuild any screen convincingly:

- **Color:** `background`, `surface` (cards/panels), `text`, `textMuted`, `border`, `primary` +
  `primaryForeground`, plus `success`/`danger` and any brand accents. Capture dark mode too if the
  site has it (emit both, default to whichever the marketing site uses).
- **Typography:** `fontSans` / `fontDisplay` / `fontMono` families, a size scale (xs→3xl), weights,
  and base line-height. Load the same web fonts the site uses.
- **Spacing & radius & shadow scales** — the rhythm of the UI lives here; getting radius and shadow
  right is what makes cards feel like *their* cards.
- **Component recipes** (optional but powerful): short notes or helper classes for how a button, card,
  input, badge, and avatar look, so replicas are consistent.

## Output format

Emit a typed object and, when the site uses CSS variables, a matching `:root` block the preview root
applies. Keep it human-editable so the user can nudge a color later.

```ts
// preview/theme.tokens.ts
export const tokens = {
  color: {
    background: "#0b0b0f", surface: "#16161d", text: "#f5f5f7", textMuted: "#9a9aa5",
    border: "#26262f", primary: "#6d5efc", primaryForeground: "#ffffff",
    success: "#3ecf8e", danger: "#ff6b6b",
  },
  font: { sans: "'Inter', system-ui, sans-serif", display: "'Inter', sans-serif" },
  text: { sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.5rem", "2xl": "2rem" },
  radius: { sm: "8px", md: "12px", lg: "20px", pill: "999px" },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.2)", md: "0 8px 24px rgba(0,0,0,.35)" },
  space: (n: number) => `${n * 4}px`,
} as const;
export type Tokens = typeof tokens;
```

A starter file is in `assets/templates/theme.tokens.template.ts`.

## Verify the match

Before moving on, sanity-check fidelity: drop a tiny specimen (a button, a card, an input, a heading)
into `/preview` and compare side-by-side with the real site. If anything is visibly off — usually
font weight, border color, or radius — fix the token, not the screen. Getting this right once fixes
every screen at once, which is the whole reason this file exists.

## Pitfalls

- **Capturing values, not scales.** Pull the system (the radius scale), not one button's `12px`.
- **Missing the web font.** A replica in the wrong font is the most common "looks fake" tell — make
  sure the same font is actually loaded in `/preview`.
- **Ignoring dark mode.** Match whatever theme the marketing site presents to visitors.
