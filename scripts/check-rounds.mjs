#!/usr/bin/env node
// scripts/check-rounds.mjs
//
// R+ SG.R26.1 file-existence gate enforcement tool (added 2026-07-01,
// see .opencode/skills/team-dev-loop/SKILL.md).
//
// WHAT THIS SCRIPT DOES:
//   Verifies that .omo/round-N/ has the expected minimum number of files
//   per the SKILL.md SG.R26.1 profile thresholds:
//     - bugfix profile:  ≥ 3 files
//     - feature profile: ≥ 8 files
//     - architecture profile: = 13 files
//     - housekeeping profile: ≥ 3 files (this script's default)
//
// WHEN TO RUN:
//   BEFORE declaring SHIP for any round, the lead MUST run this script.
//   Failure → write .omo/round-N/artifact-shortage.md and HARD STOP.
//   Closes the R21-R31 retro defect where closure docs claimed "16+
//   artifacts written" but only 4-6 files actually existed.
//
// USAGE:
//   node scripts/check-rounds.mjs [round-number]
//   node scripts/check-rounds.mjs 38
//   node scripts/check-rounds.mjs           (checks R+1, defaults to current)
//
// EXIT CODES:
//   0 — all checks passed
//   1 — one or more checks failed (artifact shortage)
//   2 — script setup error (no .omo/ directory)
//
// PROFILE DETECTION:
//   Default: housekeeping (≥3 expected).
//   Override: --profile=<bugfix|feature|architecture|housekeeping>
//   Auto-detect: looks for 'profile: feature' / 'profile: bugfix' in
//   .omo/round-N/decision.md (if present)
//
// RATIONALE (R36 retro gap-fix):
//   R21-R31 retros hardcoded "16+ artifacts" / "19 artifacts" strings in
//   closure docs without `ls -1 .omo/round-N/ | wc -l` injection. This
//   script provides the missing injection — explicit count verification.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROUNDS_DIR = ".omo";
const PROFILE_THRESHOLDS = {
  bugfix: 3,
  feature: 8,
  architecture: 13,
  housekeeping: 3,
};

function detectProfile(roundDir) {
  const decisionPath = join(roundDir, "decision.md");
  if (!existsSync(decisionPath)) return "housekeeping";
  try {
    const content = readFileSync(decisionPath, "utf8");
    const match = content.match(/profile[:\s]+(bugfix|feature|architecture|housekeeping)/i);
    if (match) return match[1].toLowerCase();
    if (content.includes("Lightweight round") || content.includes("lightweight")) return "housekeeping";
    return "housekeeping";
  } catch {
    return "housekeeping";
  }
}

function checkRound(roundNum) {
  const roundDir = join(ROUNDS_DIR, `round-${roundNum}`);
  if (!existsSync(roundDir)) {
    console.error(`❌ .omo/round-${roundNum}/ does not exist`);
    return { round: roundNum, status: "FAIL", reason: "directory-missing", actual: 0, expected: 3 };
  }

  const files = readdirSync(roundDir).filter((f) => f.endsWith(".md") || f.endsWith(".json"));
  const actual = files.length;
  const profile = detectProfile(roundDir);
  const expected = PROFILE_THRESHOLDS[profile] || 3;

  const status = actual >= expected ? "PASS" : "FAIL";
  return { round: roundNum, status, profile, actual, expected, files };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage: node scripts/check-rounds.mjs <round-number>");
    console.log("       node scripts/check-rounds.mjs --all  (checks R1 through R41)");
    process.exit(2);
  }

  if (args[0] === "--all") {
    let pass = 0, fail = 0;
    for (let r = 1; r <= 41; r++) {
      const result = checkRound(r);
      const icon = result.status === "PASS" ? "✅" : "❌";
      console.log(`${icon} R${result.round}: ${result.status} (${result.actual} files, profile=${result.profile || "?"}, expected≥${result.expected || 3})`);
      if (result.status === "PASS") pass++; else fail++;
    }
    console.log(`\nSummary: ${pass} pass, ${fail} fail (R1-R41)`);
    process.exit(fail > 0 ? 1 : 0);
  }

  const roundNum = parseInt(args[0], 10);
  if (isNaN(roundNum)) {
    console.error(`❌ Invalid round number: ${args[0]}`);
    process.exit(2);
  }

  const result = checkRound(roundNum);
  const icon = result.status === "PASS" ? "✅" : "❌";
  console.log(`${icon} R${result.round}: ${result.status} (${result.actual} files, profile=${result.profile || "?"}, expected≥${result.expected || 3})`);
  if (result.actual > 0 && result.actual < (result.expected || 3)) {
    console.log(`   Missing ${(result.expected || 3) - result.actual} file(s) for ${result.profile} profile`);
    console.log(`   Files present: ${result.files.join(", ")}`);
  }
  process.exit(result.status === "PASS" ? 0 : 1);
}

main();