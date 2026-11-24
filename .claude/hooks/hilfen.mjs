// Gemeinsame Hilfen der Hooks: Eingabe lesen, Antworten schreiben, Shell-Befehle zerlegen.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export function eingabeLesen() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

export function ablehnen(grund) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: grund },
    }),
  );
  process.exit(0);
}

export const projektOrdner = (e = {}) => e.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function aktuellerBranch(ordner) {
  try {
    return execFileSync("git", ["-C", ordner, "branch", "--show-current"], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

/** status.json des aktuellen Branchs oder null */
export function statusLesen(ordner) {
  const branch = aktuellerBranch(ordner);
  const pfad = join(ordner, "laeufe", branch, "status.json");
  if (!branch || !existsSync(pfad)) return null;
  try {
    return { pfad, status: JSON.parse(readFileSync(pfad, "utf8")) };
  } catch {
    return null;
  }
}

/** Zerlegt eine Zeile in Wörter wie die Shell (Anführungszeichen, Escapes); Operatoren als eigene Wörter. */
export function woerter(text) {
  const raus = [];
  let wort = "";
  let hat = false;
  let q = null;
  const schieben = () => {
    if (hat) raus.push(wort);
    wort = "";
    hat = false;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === q) q = null;
      else if (c === "\\" && q === '"' && i + 1 < text.length) wort += text[++i];
      else wort += c;
      continue;
    }
    if (c === "'" || c === '"') { q = c; hat = true; continue; }
    if (c === "\\" && i + 1 < text.length) { wort += text[++i]; hat = true; continue; }
    if (c === "\n") { schieben(); raus.push({ op: ";" }); continue; }
    if (/\s/.test(c)) { schieben(); continue; }
    if (";&|()`\n<>".includes(c)) {
      let op = c;
      if ("<>".includes(c) && hat && /^\d+$/.test(wort)) { op = wort + c; wort = ""; hat = false; }
      schieben();
      while (i + 1 < text.length && ";&|<>".includes(text[i + 1]) && op.length < 3) op += text[++i];
      raus.push({ op });
      continue;
    }
    if (c === "$" && text[i + 1] === "(") { schieben(); raus.push({ op: "$(" }); i++; continue; }
    wort += c;
    hat = true;
  }
  schieben();
  return raus;
}

/** Einzelbefehle (Wortlisten) aus einer Befehlszeile, auch aus `bash -c "…"`, `eval`, `$(…)`. */
export function befehle(text, tiefe = 0) {
  text = heredocsWeg(text);
  const liste = [];
  let aktuell = [];
  const ende = () => {
    if (aktuell.length) liste.push(aktuell);
    aktuell = [];
  };
  for (const w of woerter(text)) {
    if (typeof w === "object") {
      if (/^(\d*>{1,2}[&|]?|&>{1,2}|<{1,3}|\d*<)$/.test(w.op)) { aktuell.push(w.op); continue; }
      ende();
      continue;
    }
    aktuell.push(w);
  }
  ende();
  const raus = [];
  for (let b of liste) {
    b = vorspannWeg(b);
    if (!b.length) continue;
    const kopf = b[0].split("/").pop();
    if (tiefe < 3 && ["bash", "sh", "zsh", "dash"].includes(kopf)) {
      const i = b.findIndex((x) => /^-[a-z]*c$/.test(x));
      if (i >= 0 && b[i + 1]) { raus.push(...befehle(b[i + 1], tiefe + 1)); continue; }
    }
    if (tiefe < 3 && kopf === "eval") { raus.push(...befehle(b.slice(1).join(" "), tiefe + 1)); continue; }
    if (tiefe < 3 && kopf === "xargs") { raus.push(b.slice(1).filter((x) => !x.startsWith("-"))); continue; }
    raus.push(b);
  }
  return raus;
}

/** Inhalt von Heredocs ist Text, kein Befehl: `cmd <<'ENDE' … ENDE` wird zu `cmd <<ENDE`. */
export function heredocsWeg(text) {
  return text.replace(/<<-?\s*(['"]?)([A-Za-z_]\w*)\1([^\n]*)\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g, "<<$2$3");
}

// Umgebungs-Zuweisungen und Vorsätze wie env, command, sudo, nohup, time entfernen
function vorspannWeg(b) {
  let i = 0;
  while (i < b.length) {
    const w = b[i];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(w)) { i++; continue; }
    if (["env", "command", "sudo", "nohup", "time", "builtin", "exec", "nice"].includes(w)) { i++; continue; }
    if (i > 0 && ["env", "sudo"].includes(b[i - 1]) && w.startsWith("-")) { i++; continue; }
    break;
  }
  return b.slice(i);
}
