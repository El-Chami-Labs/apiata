#!/usr/bin/env node
// PreToolUse (Bash): Sicherheitsgrenzen. Nie main pushen, nie mergen, nie deployen, Historie nie umschreiben,
// nur benannte Dateien stagen, keine Schlüssel setzen, nichts veröffentlichen. Nach grünen Haken (Lauf fertig) kein
// Commit und kein Push mehr, auch kein Status-Vermerk: jeder Push startet die Prüfung neu.
import { fileURLToPath } from "node:url";
import { ablehnen, aktuellerBranch, befehle, eingabeLesen, projektOrdner, statusLesen } from "./hilfen.mjs";

/** GitHub-Werkzeuge, die Commits anlegen */
export const GITHUB_SCHREIBEN = /^mcp__.*github.*__(push_files|create_or_update_file|delete_file)$/;

/** Lauf mit Pull Request und grünen Haken abgeschlossen */
export const gruenFertig = (lauf) => Boolean(lauf && lauf.phase === "fertig" && lauf.haken?.stand === "grün");

const GESCHUETZT = /^(main|master|production|produktion)$/i;
const GEHEIM = /(^|\/)(\.env(\..*)?|.*\.(pem|key|p12|pfx)|id_(rsa|ed25519)[^/]*)$/i;
const GIT_OPTIONEN_MIT_WERT = ["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"];

function gitTeile(b) {
  let i = 1;
  while (i < b.length && b[i].startsWith("-")) {
    if (GIT_OPTIONEN_MIT_WERT.includes(b[i])) i += 2;
    else i += 1;
  }
  return { sub: b[i], args: b.slice(i + 1) };
}

const kurz = (args, buchstabe) => args.some((a) => /^-[a-zA-Z]+$/.test(a) && a.includes(buchstabe));
const ziel = (ref) => ref.replace(/^\+/, "").split(":").pop().replace(/^refs\//, "").replace(/^heads\//, "");

/** Grund für eine Sperre oder null. */
export function pruefeBefehl(b, branch = "", lauf = null) {
  const kopf = b[0]?.split("/").pop();
  const rest = b.slice(1);
  if (kopf === "git") {
    if (b.some((w, j) => b[j - 1] === "-c" && /^alias\./i.test(w)) || b.some((w) => /^-calias\./i.test(w))) return "git -c alias.… ist gesperrt.";
    const { sub, args } = gitTeile(b);
    if (["commit", "push"].includes(sub) && gruenFertig(lauf))
      return `Lauf „${lauf.branch}“ ist fertig, Haken grün für ${lauf.haken.commit.slice(0, 7)}. Nichts mehr committen oder pushen, auch keinen Status-Vermerk (startet die Prüfung neu). Neue Änderungen: /feinschliff.`;
    const optionen = args.filter((a) => a.startsWith("-"));
    const werte = args.filter((a) => !a.startsWith("-"));
    if (sub === "push") {
      if (optionen.some((o) => /^--(force|force-with-lease|force-if-includes|mirror|all|delete|prune)/.test(o)) || kurz(optionen, "f") || kurz(optionen, "d"))
        return "git push mit Zwang, Löschen oder allen Branches ist gesperrt.";
      const refs = werte.slice(1);
      if (refs.some((r) => /\$|`/.test(r))) return "Push-Ziele mit Variablen sind gesperrt; Branch ausschreiben.";
      if (refs.some((r) => r.startsWith(":"))) return "Löschen eines Remote-Branchs ist gesperrt.";
      if (refs.some((r) => r.startsWith("+"))) return "Erzwungenes Pushen ist gesperrt.";
      if (refs.some((r) => GESCHUETZT.test(ziel(r)) || (/^(HEAD|@)$/.test(ziel(r)) && GESCHUETZT.test(branch))))
        return "Pushen auf main ist gesperrt. Arbeite auf einem eigenen Branch und öffne einen Pull Request.";
      if (!refs.length && GESCHUETZT.test(branch)) return "Du stehst auf main; Pushen ist gesperrt.";
      return null;
    }
    if (["merge", "rebase", "filter-branch", "filter-repo", "replace", "stash", "update-ref", "cherry-pick"].includes(sub))
      return `git ${sub} ist gesperrt (kein Mergen, Historie nie umschreiben, kein Stash).`;
    if (sub === "pull" && !optionen.includes("--ff-only")) return "git pull nur mit --ff-only.";
    if (sub === "commit" && (optionen.some((o) => /^--(amend|all|fixup|squash)(=|$)/.test(o)) || kurz(optionen, "a")))
      return "git commit nur mit einzeln gestagten Dateien, ohne --amend.";
    if (sub === "reset" && (optionen.some((o) => /^--(hard|soft|keep|merge|mixed)$/.test(o)) || werte.some((w) => /[~^]|^@|^(ORIG_HEAD|FETCH_HEAD|HEAD)$|^origin\/|^[0-9a-f]{7,40}$/.test(w))))
      return "git reset auf einen anderen Stand ist gesperrt (Historie). Zum Zurücknehmen: git revert.";
    if (sub === "add") {
      if (optionen.some((o) => /^--(all|update|no-ignore-removal)$/.test(o)) || kurz(optionen, "A") || kurz(optionen, "u"))
        return "Nur einzeln benannte Dateien oder Ordner stagen (kein -A, -u, --all).";
      if (werte.some((w) => /^(\.|\.\/|\*|:\/|:\/:|\/)$/.test(w) || w === "-")) return "Nur einzeln benannte Dateien oder Ordner stagen (kein „.“ oder „*“).";
      if (werte.some((w) => GEHEIM.test(w))) return "Schlüsseldateien (.env, .pem, .key) kommen nie ins Repo.";
      return null;
    }
    if (["checkout", "switch"].includes(sub)) {
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        const angehaengt = a.match(/^(?:-[a-zA-Z]*[BC]|--force-create=|--force-create)(.*)$/);
        if (!angehaengt) continue;
        const name = angehaengt[1] || args[i + 1] || "";
        if (GESCHUETZT.test(name)) return "main neu setzen ist gesperrt.";
      }
      return null;
    }
    if (sub === "branch") {
      const gefaehrlich = optionen.some((o) => /^(-[a-zA-Z]*[fDMC]|--force|--delete|--move|--copy)/.test(o));
      if (gefaehrlich && werte.some((w) => GESCHUETZT.test(w))) return "main verändern oder löschen ist gesperrt.";
      return null;
    }
    if (sub === "tag" && werte.length) return "Tags setzen ist dem Nutzer vorbehalten.";
    return null;
  }
  if (kopf === "gh") {
    let i = 0;
    while (i < rest.length && rest[i].startsWith("-")) i += /^(-R|--repo|--hostname)$/.test(rest[i]) ? 2 : 1;
    const t = rest.slice(i);
    const text = t.join(" ");
    if (/^pr (merge|review)/.test(text)) return "Mergen und Freigeben macht Ahmad selbst.";
    if (/^(repo (delete|edit|rename|archive)|secret|variable|release create|workflow (run|enable|disable)|run (rerun|cancel))/.test(text)) return `gh ${t.slice(0, 2).join(" ")} ist gesperrt.`;
    if (t[0] === "api") {
      const args = t.slice(1);
      const methode = args.map((x, j) => (/^(-X|--method)$/.test(x) ? args[j + 1] : x.match(/^(?:-X|--method=)(.+)$/)?.[1])).find(Boolean);
      const felder = args.some((x) => /^(-f|-F|--field|--raw-field|--input)(=|$)/.test(x));
      if (args[0] === "graphql") {
        const q = args.join(" ");
        if (/mutation|@|\$\(|`/i.test(q) || args.includes("--input")) return "gh api graphql nur für Abfragen im Befehl selbst, ohne mutation und ohne Datei.";
        return null;
      }
      if ((methode && !/^get$/i.test(methode)) || felder) return "gh api nur zum Lesen (GET ohne Felder); Änderungen über git oder die gh-Befehle.";
    }
    return null;
  }
  const ohneVersion = (w) => w.replace(/(.)@.*$/, "$1");
  const werkzeugAb = rest.findIndex((w) => ohneVersion(w) === "wrangler");
  const startet = ["npx", "pnpm", "yarn", "bunx", "npm"].includes(kopf) && werkzeugAb >= 0 && rest.slice(0, werkzeugAb).every((w) => w.startsWith("-") || ["exec", "x", "dlx"].includes(w));
  const wrangler = kopf === "wrangler" ? rest : startet ? rest.slice(werkzeugAb + 1) : null;
  if (wrangler && /^(deploy|publish|secret|delete|rollback|versions deploy|triggers)/.test(wrangler.filter((w) => !w.startsWith("-")).join(" ")))
    return "Deployen und Cloudflare-Einstellungen ändern macht Cloudflare bzw. Ahmad, nie das Kit.";
  if (["npm", "pnpm", "yarn"].includes(kopf) && ["publish", "unpublish", "deprecate", "owner", "token", "login", "adduser"].includes(rest[0]))
    return `${kopf} ${rest[0]} ist gesperrt.`;
  if (["npm", "pnpm", "yarn"].includes(kopf) && ["run", "run-script", "rum", "urn"].includes(rest[0]) && /^(deploy|publish|release)/.test(rest[1] ?? ""))
    return "Deploy-Skripte sind gesperrt.";
  if (kopf === "rm" && rest.some((a) => /^(\/|~|\.git|\.|\.\/|\*)$/.test(a.replace(/\/$/, "") || "/"))) return "Dieses rm ist gesperrt.";
  return null;
}

export function pruefeZeile(zeile, branch = "", lauf = null) {
  for (const b of befehle(zeile)) {
    const grund = pruefeBefehl(b, branch, lauf);
    if (grund) return grund;
  }
  return null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const e = eingabeLesen();
  if (GITHUB_SCHREIBEN.test(e.tool_name ?? "")) {
    const lauf = statusLesen(projektOrdner(e))?.status;
    if (gruenFertig(lauf)) ablehnen(`Lauf „${lauf.branch}“ ist fertig, Haken grün. Nichts mehr committen oder pushen, auch nicht über das GitHub-Werkzeug.`);
  }
  if (e.tool_name === "Bash" && e.tool_input?.command) {
    const ordner = projektOrdner(e);
    const grund = pruefeZeile(e.tool_input.command, aktuellerBranch(ordner), statusLesen(ordner)?.status);
    if (grund) ablehnen(grund);
  }
}
