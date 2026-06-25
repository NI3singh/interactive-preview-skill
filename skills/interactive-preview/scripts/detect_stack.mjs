#!/usr/bin/env node
/**
 * detect_stack.mjs — Phase 0 reconnaissance for the interactive-preview skill.
 *
 * Sniffs framework, router, styling system, TS/JS, likely token sources, and candidate
 * landing / post-signup / signup routes, then prints a JSON report. Run this first and read the
 * report before reasoning about the codebase — everything downstream adapts to what it finds.
 *
 * Usage:  node detect_stack.mjs [projectDir]      (defaults to the current directory)
 * No dependencies — pure Node fs.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] || process.cwd();

const readJSON = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};
const exists = (p) => existsSync(join(root, p));
const firstDir = (cands) => cands.find(exists) || null;

const pkg = readJSON(join(root, "package.json")) || {};
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const has = (name) => Object.prototype.hasOwnProperty.call(deps, name);

// --- Framework -------------------------------------------------------------
let framework = "unknown";
if (has("next")) framework = "next";
else if (has("react")) framework = "react";
else if (has("nuxt") || has("vue")) framework = "vue";
else if (has("@sveltejs/kit") || has("svelte")) framework = "svelte";

// --- Language --------------------------------------------------------------
const typescript = exists("tsconfig.json") || has("typescript");

// --- Router ----------------------------------------------------------------
const appDir = firstDir(["app", "src/app"]);
const pagesDir = firstDir(["pages", "src/pages"]);
let router = "unknown";
if (framework === "next") {
  if (appDir && pagesDir) router = "next-hybrid";
  else if (appDir) router = "next-app";
  else if (pagesDir) router = "next-pages";
  else router = "next-unknown";
} else if (has("react-router-dom") || has("react-router")) router = "react-router";
else if (has("vite")) router = "vite";

// --- Styling system --------------------------------------------------------
const styling = [];
if (has("tailwindcss")) styling.push("tailwind");
if (has("styled-components")) styling.push("styled-components");
if (has("@emotion/react") || has("@emotion/styled")) styling.push("emotion");
if (has("@stitches/react")) styling.push("stitches");
if (has("@vanilla-extract/css")) styling.push("vanilla-extract");
if (has("@mui/material")) styling.push("mui");
if (has("@chakra-ui/react")) styling.push("chakra");
if (has("@mantine/core")) styling.push("mantine");

const tailwindConfig =
  ["tailwind.config.js", "tailwind.config.ts", "tailwind.config.cjs", "tailwind.config.mjs"].find(exists) || null;

const globalCss = [
  "app/globals.css",
  "src/app/globals.css",
  "styles/globals.css",
  "src/styles/globals.css",
  "src/index.css",
  "app/global.css",
].filter(exists);

const themeFiles = [
  "theme.ts",
  "theme.js",
  "src/theme.ts",
  "src/theme.js",
  "styles/theme.ts",
  "src/styles/theme.ts",
  "src/theme/index.ts",
].filter(exists);

// --- Route discovery -------------------------------------------------------
function walk(dir, onFile, depth = 0) {
  if (depth > 6) return;
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next" || e.name.startsWith(".git")) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, onFile, depth + 1);
    else onFile(full);
  }
}

const routes = new Set();

if (appDir) {
  walk(join(root, appDir), (file) => {
    const base = file.split(/[\\/]/).pop();
    if (!/^page\.(t|j)sx?$/.test(base)) return;
    const segs = relative(join(root, appDir), file)
      .replace(/\\/g, "/")
      .split("/")
      .slice(0, -1)
      .filter((s) => s && !s.startsWith("(")); // drop route groups like (marketing)
    routes.add("/" + segs.join("/"));
  });
}

if (pagesDir) {
  walk(join(root, pagesDir), (file) => {
    const rel = relative(join(root, pagesDir), file).replace(/\\/g, "/");
    const base = rel.split("/").pop();
    if (base.startsWith("_")) return; // _app, _document
    if (rel.startsWith("api/")) return; // API routes
    if (!/\.(t|j)sx?$/.test(base)) return;
    let r = "/" + rel.replace(/\.(t|j)sx?$/, "");
    r = r.replace(/\/index$/, "");
    routes.add(r || "/");
  });
}

const routeList = Array.from(routes).sort();

// --- Heuristic guesses -----------------------------------------------------
const LANDING = ["/", "/home", "/index"];
const POST_SIGNUP_HINTS = [
  "dashboard", "feed", "app", "home", "profile", "account", "inbox", "projects",
  "explore", "search", "settings", "workspace", "board", "editor", "chat", "library",
];
const landing = routeList.find((r) => LANDING.includes(r)) || routeList[0] || null;
const postSignup = routeList.filter(
  (r) => r !== landing && POST_SIGNUP_HINTS.some((h) => r.toLowerCase().includes(h))
);
const signupRoute = routeList.find((r) => /sign[-_]?up|register|join|get[-_]?started/i.test(r)) || "/signup";

// --- Report ----------------------------------------------------------------
const report = {
  root,
  framework,
  typescript,
  router,
  appDir,
  pagesDir,
  styling: styling.length ? styling : ["plain-css-or-unknown"],
  tailwindConfig,
  tokenSources: { globalCss, themeFiles },
  routes: routeList,
  guesses: { landing, postSignup, signupRoute },
  supportedByV1: framework === "next" || framework === "react",
};

console.log(JSON.stringify(report, null, 2));

if (!report.supportedByV1) {
  console.error(
    `\n[interactive-preview] Note: v1 targets React/Next.js, but detected "${framework}". ` +
      `Confirm with the user before proceeding, or reconstruct screens by hand using the same principles.`
  );
}
