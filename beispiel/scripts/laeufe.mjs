#!/usr/bin/env node
// Offene Läufe aller Branches (aus laeufe/<branch>/status.json auf origin). node scripts/laeufe.mjs
import { execFileSync, spawnSync } from "node:child_process";

spawnSync("git", ["fetch", "origin", "--quiet"]);
const branches = execFileSync("git", ["branch", "-r", "--format=%(refname:short)"], { encoding: "utf8" })
  .split("\n").map((b) => b.trim()).filter((b) => b.startsWith("origin/") && b !== "origin/HEAD" && b !== "origin");
const offen = [];
for (const r of branches) {
  const b = r.slice("origin/".length);
  const s = spawnSync("git", ["show", `${r}:laeufe/${b}/status.json`], { encoding: "utf8" });
  if (s.status !== 0) continue;
  try {
    const st = JSON.parse(s.stdout);
    if (!st.pr && st.phase !== "fertig") offen.push({ b, st });
  } catch { /* unlesbar: überspringen */ }
}
offen.sort((a, b) => String(b.st.phasen?.at(-1)?.start).localeCompare(String(a.st.phasen?.at(-1)?.start)));
for (const { b, st } of offen) console.log(`${b}: ${st.art}, Phase ${st.phase}, Features ${(st.features ?? []).map((f) => `${f.name}=${f.status}`).join(", ") || "-"}`);
console.log(offen.length ? `OFFEN ${offen.length} – jüngster: ${offen[0].b}` : "KEIN OFFENER LAUF");
