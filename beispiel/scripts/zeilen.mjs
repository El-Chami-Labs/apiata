#!/usr/bin/env node
// Neue Zeilen Testcode und Code im Lauf (gegen origin/main): node scripts/zeilen.mjs [basis]
import { execFileSync } from "node:child_process";

const basis = process.argv[2] ?? "origin/main";
const ausgabe = execFileSync("git", ["diff", "--numstat", `${basis}...HEAD`], { encoding: "utf8" });
let test = 0;
let code = 0;
for (const zeile of ausgabe.split("\n")) {
  const [plus, , pfad] = zeile.split("\t");
  if (!pfad || plus === "-") continue;
  if (/^tests\//.test(pfad)) test += Number(plus);
  else if (/^src\/.*\.(astro|ts|tsx|js|mjs|css)$/.test(pfad)) code += Number(plus);
}
const verhaeltnis = code ? Math.round((test / code) * 100) : 0;
console.log(`ZEILEN Testcode ${test}, Code ${code} (${verhaeltnis} %)${test > code ? " – Testcode größer als Code: kürzen" : ""}`);
