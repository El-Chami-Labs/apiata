#!/usr/bin/env node
// PreToolUse (Bash) des pruefer (Frontmatter): nur lesen. Erlaubt sind Lesebefehle, Kit-Skripte (`node scripts/…`) und
// npm-Skripte zum Bauen und Testen; Schreibbefehle, Umleitungen in Dateien und git-Änderungen sind gesperrt.
import { fileURLToPath } from "node:url";
import { ablehnen, befehle, eingabeLesen } from "./hilfen.mjs";

const SCHREIBEND = ["awk", "gawk", "mawk", "rsync", "rm", "mv", "cp", "touch", "mkdir", "rmdir", "tee", "dd", "truncate", "chmod", "chown", "ln", "install", "patch", "unzip", "tar", "curl", "wget"];
const GIT_LESEN = ["status", "diff", "log", "show", "branch", "rev-parse", "ls-files", "blame", "grep", "describe", "shortlog", "cat-file", "merge-base"];
const NPM_ERLAUBT = /^(build|typen|lint|test|e2e|messung|vorschau|check)$/;

export function pruefeLesend(zeile) {
  for (const b of befehle(zeile)) {
    const kopf = b[0]?.split("/").pop();
    const i = b.findIndex((w) => /^(\d*>{1,2}\|?|&>{1,2})$/.test(w));
    if (i >= 0 && !/^\/dev\/(null|stdout|stderr)$/.test(b[i + 1] ?? ""))
      return "Der pruefer schreibt keine Dateien. Bericht über `node scripts/bericht.mjs <pfad> <<'ENDE'` abgeben.";
    if (SCHREIBEND.includes(kopf)) return `${kopf} ist für den pruefer gesperrt (nur lesen).`;
    if (kopf === "find" && b.some((w) => /^-(delete|exec|execdir|ok|okdir|fprint|fprintf|fls)$/.test(w))) return "find mit -delete/-exec ist für den pruefer gesperrt.";
    if (kopf === "sort" && b.some((w) => /^(-o|--output)/.test(w))) return "sort -o schreibt Dateien.";
    if (b.some((w) => /^(-u|--update-snapshots|--update)(=|$)/.test(w)) && ["npx", "vitest", "playwright", "npm"].includes(kopf)) return "Tests aktualisieren ist für den pruefer gesperrt.";
    if (b.some((w) => /^(--fix|--write|--output)(=|$)/.test(w))) return "Optionen, die Dateien schreiben (--fix, --write, --output), sind für den pruefer gesperrt.";
    if (["sed", "perl"].includes(kopf) && b.some((w) => /^-[a-zA-Z]*i/.test(w) || w.startsWith("--in-place"))) return "Ändern mit -i ist gesperrt.";
    if (kopf === "git") {
      const sub = b.slice(1).find((w) => !w.startsWith("-"));
      if (!GIT_LESEN.includes(sub)) return `git ${sub} ist für den pruefer gesperrt (nur lesen).`;
      if (sub === "branch" && b.length > 2 && !b.slice(2).every((w) => /^(--show-current|-a|-r|--list|-v)$/.test(w))) return "git branch nur zum Lesen.";
    }
    if (["npm", "pnpm", "yarn"].includes(kopf)) {
      if (b[1] !== "run" || !NPM_ERLAUBT.test(b[2] ?? "")) return `${b.slice(0, 3).join(" ")} ist für den pruefer gesperrt.`;
    }
    if (kopf === "npx" && !["playwright", "vitest", "astro", "tsc", "eslint"].includes(b[1])) return "npx nur für Prüfwerkzeuge.";
    if (kopf === "npx" && b[1] === "astro" && !["build", "check", "preview"].includes(b[2])) return "npx astro nur build, check, preview.";
    if (kopf === "npx" && b[1] === "eslint" && b.includes("--fix")) return "eslint --fix ändert Dateien.";
    if (["node", "python", "python3", "bash", "sh"].includes(kopf)) {
      const skript = b.slice(1).find((w) => !w.startsWith("-"));
      if (b.some((w) => ["-e", "-c", "--eval", "-p"].includes(w))) return "Code direkt ausführen ist für den pruefer gesperrt.";
      if (!/^(\.\/)?scripts\/[\w-]+\.mjs$/.test(skript ?? "")) return "Der pruefer führt nur Kit-Skripte aus scripts/ aus.";
    }
  }
  return null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const e = eingabeLesen();
  const grund = e.tool_name === "Bash" ? pruefeLesend(e.tool_input?.command ?? "") : null;
  if (grund) ablehnen(grund);
}
