#!/usr/bin/env node
/**
 * audit_preview.mjs — confirm a generated preview/ leaks no real network, logic, or secrets.
 *
 * Reconstructed previews must run on local mock state only. This audits the preview's CODE for
 * real call sites (fetch/axios/process.env/.../api paths) and data-layer imports — while correctly
 * IGNORING README files and comments, which often legitimately *mention* what the demo avoids
 * (e.g. a JSDoc note: "the real page calls lib/api.fetchFeed(); this replica reads the mock store").
 * A naive grep flags those mentions and cries wolf; this does not.
 *
 * Usage:
 *   node audit_preview.mjs [previewDir]                  (defaults to ./preview)
 *   node audit_preview.mjs ./preview --deny stripe,segment   (extra import substrings to flag)
 *
 * Exit code 0 = clean, 1 = potential leak(s) found (review each).
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const argv = process.argv.slice(2);
let previewDir = "preview";
const extraDeny = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--deny") extraDeny.push(...(argv[++i] || "").split(",").map((s) => s.trim()).filter(Boolean));
  else previewDir = argv[i];
}
if (!existsSync(previewDir)) {
  console.error(`[audit] preview directory not found: ${previewDir}`);
  process.exit(1);
}

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".css"]);

// Real usage — call sites / env access. These must never appear in preview CODE.
const USAGE = [
  { re: /\bfetch\s*\(/, label: "fetch(" },
  { re: /\baxios\b/, label: "axios" },
  { re: /\bXMLHttpRequest\b/, label: "XMLHttpRequest" },
  { re: /process\.env/, label: "process.env" },
  { re: /import\.meta\.env/, label: "import.meta.env" },
  { re: /["'`][^"'`]*\/api\//, label: "/api/ path" },
];

// Data-layer / auth modules. Importing one into a demo means it could reach real logic.
const DENY = ["api", "auth", "supabase", "prisma", "firebase", "trpc", "graphql", "db", "drizzle", "mongoose", ...extraDeny];

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (CODE_EXT.has(extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

// Blank out block comments but keep newlines so reported line numbers stay accurate.
const stripBlocks = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
const stripLine = (line) => line.replace(/\/\/.*$/, "");
const importPath = (line) => {
  const m = line.match(/(?:from|import|require\()\s*["'`]([^"'`]+)["'`]/);
  return m ? m[1] : null;
};

const hits = [];
for (const file of walk(previewDir)) {
  const src = stripBlocks(readFileSync(file, "utf8"));
  src.split(/\r?\n/).forEach((raw, i) => {
    const line = stripLine(raw);
    if (!line.trim()) return;
    for (const u of USAGE) if (u.re.test(line)) hits.push({ file, ln: i + 1, what: u.label, text: line.trim() });
    const ip = importPath(line);
    if (ip) {
      const low = ip.toLowerCase();
      const safe = /(^|\/)(mock|engine|screens|flows)(\/|$)/.test(low) || low.includes("theme.tokens") ||
        low === "react" || low.startsWith("react/") || low.startsWith("next/");
      const denied = DENY.find((d) => new RegExp(`(^|[\\/.@-])${d}([\\/.-]|$)`).test(low));
      if (!safe && denied) hits.push({ file, ln: i + 1, what: `import "${ip}"`, text: line.trim() });
    }
  });
}

const rel = (f) => relative(process.cwd(), f).replace(/\\/g, "/");
if (hits.length === 0) {
  console.log(`[audit] CLEAN — no real network, logic, or secret usage in ${previewDir}/ code (README & comments ignored).`);
  process.exit(0);
}
console.log(`[audit] ${hits.length} potential leak(s) in ${previewDir}/ — review each (a demo must run on mock state only):\n`);
for (const h of hits) console.log(`  ${rel(h.file)}:${h.ln}  [${h.what}]  ${h.text.slice(0, 100)}`);
process.exit(1);
