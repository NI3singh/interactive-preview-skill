# 🎬 interactive-preview · *PreviewForge*

A **Claude Code / Agent skill** that turns any React or Next.js codebase into an **interactive,
theme-matched “try it before you sign up” demo** — a guided product tour that lives behind a button
on your landing page, runs on mock data, and shows visitors exactly what your app feels like *after*
signup, without exposing a single line of your real backend.

> Think of the coach-marks you see the first time you open a polished mobile app — *“tap here,” then
> “now try this”* — but on your marketing site, before signup, generated automatically from your own UI.

Static screenshots tell. A video shows. An **interactive preview lets the visitor *do* the thing** —
which is why tools like Arcade, Storylane and Navattic convert so well. This skill gives you the same
experience, **auto-generated from your codebase**, embedded natively, and matched to your exact theme.

---

## ✨ Features

| | |
|---|---|
| 🎨 **Looks identical to your app** | Extracts your real design tokens (Tailwind config, CSS vars, CSS-in-JS, or a UI kit) so the demo is pixel-close to production. |
| 🪄 **Guided, hands-on tour** | A spotlight highlights the next step and **waits for the visitor to actually click/type it**, then rewards them with a toast. |
| 🚧 **Soft rails, not cages** | Click off-target and the spotlight gently re-pulses with a hint — guidance without frustration. |
| 🔒 **Leaks nothing** | Reconstructs *presentational* replicas on in-memory mock data. No `fetch`, no API clients, no auth, no secrets. A bundled auditor enforces it. |
| 🧩 **Reusable engine** | Ships a dependency-free React tour engine (just `react`) — drop it in any project. |
| ✏️ **Editable by data** | The whole journey is a declarative flow config — change copy, steps, or mock data without touching engine code. |
| 📱 **Responsive** | Mirrors your real breakpoints; works on desktop and mobile. |
| 🎯 **Converts** | Lands the visitor on a theme-matched “create your account to do this for real” CTA at the payoff moment. |

---

## 🧠 How it works

Point the skill at a repo and it runs a 7-phase workflow:

1. **Orient** — detect framework, router, styling system, TS/JS, and your landing + post-signup screens (`scripts/detect_stack.mjs`).
2. **Extract tokens** — pull your real colors / fonts / radii / shadows into one `theme.tokens` file.
3. **Propose a flow** — infer the candidate user journeys, rank them, and propose the single most compelling “aha” for you to approve.
4. **Reconstruct** — rebuild only the screens that flow touches as isolated, presentational replicas on mock data.
5. **Wire the tour** — author a declarative flow config; the bundled engine handles spotlight, soft-rails, toasts, and the CTA.
6. **Deliver** — add a `/preview` route and inject a reversible, theme-matched launch button on your landing page.
7. **Self-check** — run the leak auditor (`scripts/audit_preview.mjs`) and verify the flow end-to-end.

---

## 🚀 Install

**Claude Code (user-level skill):**
```bash
# copy this folder into your skills directory
cp -r interactive-preview ~/.claude/skills/
```
…or drop the packaged `interactive-preview.skill` bundle into Claude Code. The skill then becomes
available automatically — no config.

---

## 💬 Use it

Just ask naturally in a React/Next.js project — you don’t need to say “preview”:

> “Add an interactive demo to my landing page so visitors can try the app before signing up.”

> “Let people mess around with my feed and search without an account.”

> “Put a ‘see it in action’ walkthrough on the homepage that shows the coolest thing my app does.”

The skill detects your stack, proposes a hero flow for your approval, and generates everything.

---

## 📦 What it generates

```
preview/
├── theme.tokens.ts     # your extracted design tokens — single source of truth
├── route.tsx           # assembles screens + theme + flow → <Tour/>
├── engine/             # the bundled, dependency-free tour engine
├── screens/            # presentational replica screens (mock data only)
├── mock/               # mock entities + in-memory store (no network)
└── flows/              # the declarative flow config (edit copy/steps here)
```
Plus a single, comment-bounded launch button on your landing page (the only edit outside `preview/`).

---

## 🔒 Guardrails

The preview is a **separate, isolated replica** — never your real app in “demo mode.” It borrows
only your design tokens, never your logic. The bundled `audit_preview.mjs` checks the generated code
for real call sites and data-layer imports (while correctly ignoring comments/READMEs that merely
*mention* what the demo avoids) and fails if anything leaks.

---

## ✅ Tested

In a controlled benchmark against a Next.js + Tailwind fixture app, the skill produced a complete,
guardrail-clean, isolated preview in **3/3 scenarios (100% of assertions, across two iterations)** —
versus ad-hoc, non-isolated demos without it. The scenarios and assertions live in
[`evals/evals.json`](evals/evals.json).

---

## 🗺️ Roadmap

- 🎥 **Remotion trailer export** — auto-generate a shareable video from the same flow config
- 🧭 **Multi-flow menu** — more than one hero journey
- 📈 **Drop-off analytics** hooks
- 🧱 **Vue / Svelte / plain-HTML** support

---

## 📁 Repository layout

```
interactive-preview/
├── SKILL.md            # the skill definition Claude loads (workflow + guardrails)
├── README.md           # you are here
├── references/         # deep-dive docs Claude reads per phase
├── assets/
│   ├── engine/         # the reusable React tour engine
│   └── templates/      # starter flow + token templates
├── scripts/            # detect_stack.mjs, audit_preview.mjs
└── evals/              # test suite (scenarios + assertions)
```

---
## License

[MIT](LICENSE) — do whatever you like, just keep the notice.
