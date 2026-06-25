#!/usr/bin/env node
/**
 * npx installer for the `interactive-preview` Claude Code skill.
 *
 * Copies the bundled skill into your Claude skills directory:
 *   npx interactive-preview-skill            →  ~/.claude/skills/interactive-preview
 *   npx interactive-preview-skill --project  →  ./.claude/skills/interactive-preview
 *
 * Re-running performs a clean reinstall (replaces the existing copy). The dev-only test
 * suite (evals/) is skipped. No dependencies.
 */
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(pkgRoot, "skills", "interactive-preview");

if (!existsSync(src)) {
  console.error(`[interactive-preview] Could not find the bundled skill at ${src}`);
  process.exit(1);
}

const projectScoped = process.argv.includes("--project");
const baseDir = projectScoped
  ? join(process.cwd(), ".claude", "skills")
  : join(homedir(), ".claude", "skills");
const dest = join(baseDir, "interactive-preview");

mkdirSync(baseDir, { recursive: true });
if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, {
  recursive: true,
  // skip the dev-only test suite — the installed skill doesn't need it
  filter: (s) => !s.replace(/\\/g, "/").includes("/evals"),
});

console.log("\n  ✅ interactive-preview installed");
console.log(`     → ${dest}`);
console.log("\n  Open a React/Next.js project in Claude Code and ask:");
console.log('     "add an interactive demo to my landing page"\n');
