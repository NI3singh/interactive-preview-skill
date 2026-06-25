/**
 * Theme tokens template — copy to preview/theme.tokens.ts and fill from the REAL site.
 *
 * This is the single source of truth for the preview's look. Every reconstructed screen pulls from
 * here, so getting these right once makes every screen look like production. See
 * references/token-extraction.md for the tiered strategy (Tailwind / CSS-in-JS / CSS vars / UI kit /
 * plain CSS). Replace every REPLACE with the real value.
 */
export const tokens = {
  color: {
    background: "#REPLACE",        // page background
    surface: "#REPLACE",           // cards / panels / inputs
    text: "#REPLACE",              // primary text
    textMuted: "#REPLACE",         // secondary text
    border: "#REPLACE",            // hairlines / dividers
    primary: "#REPLACE",           // brand / primary action
    primaryForeground: "#REPLACE", // text on primary
    success: "#REPLACE",
    danger: "#REPLACE",
  },
  font: {
    sans: "REPLACE, system-ui, sans-serif", // load the same web font the site uses
    display: "REPLACE, sans-serif",
  },
  text: { sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.5rem", "2xl": "2rem" },
  radius: { sm: "8px", md: "12px", lg: "20px", pill: "999px" },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.2)", md: "0 8px 24px rgba(0,0,0,.35)" },
  space: (n: number) => `${n * 4}px`,
} as const;

export type Tokens = typeof tokens;
