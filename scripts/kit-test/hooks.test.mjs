// Kit-Test: Sicherheitsgrenzen, Prüfer-Schreibschutz, Paket-Sperre, Frage-Sperre, Lauf-Ende.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GITHUB_SCHREIBEN, gruenFertig, pruefeZeile } from "../../.claude/hooks/grenzen.mjs";
import { pruefeLesend } from "../../.claude/hooks/nur-lesen.mjs";
import { freigabeZeilen, pruefeBash } from "../../.claude/hooks/paket-sperre.mjs";
import { pruefeFragen } from "../../.claude/hooks/frage-sperre.mjs";
import { entscheiden } from "../../.claude/hooks/lauf-ende.mjs";
import { freigabenLesen, lizenzErlaubt, ungeprueft } from "../pakete.mjs";

const gesperrt = [
  ["git push origin main"], ["git push origin 'main'"], ['git push origin "main"'], ["git push origin HEAD:main"],
  ["git push origin kontakt:refs/heads/main"], ["git -C . push origin main"], ["git -c x=y push origin main"],
  ["FOO=1 git push origin main"], ["env git push origin main"], ['bash -c "git push origin main"'], ["sh -c 'git push -u origin main'"],
  ["eval git push origin main"], ["echo ok && git push origin kontakt:main"], ["git push origin kontakt; git merge main"],
  ["git push", "main"], ["git push origin HEAD", "main"], ["git push --force origin x"], ["git push -f origin x"],
  ["git push --force-with-lease origin x"], ["git push origin +x"], ["git push origin :x"], ["git push --delete origin x"],
  ["git push --all origin"], ["git push --mirror"], ["gh pr merge 3"], ["gh pr merge 3 --squash"], ["gh api repos/o/r/pulls/3/merge -X PUT"],
  ["git merge x"], ["git rebase main"], ["git stash"], ["git stash pop"], ["git filter-branch"], ["git commit --amend -m x"],
  ["git commit -am x"], ["git commit -a -m x"], ["git commit --all -m x"], ["git reset --hard"], ["git reset --hard HEAD~1"],
  ["git reset --soft HEAD^"], ["git checkout -B main origin/x"], ["git switch -C main"], ["git branch -D main"], ["git branch -f main x"],
  ["git add -A"], ["git add --all"], ["git add ."], ["git add -u"], ["git add ./"], ["git add '*'"], ["git update-ref refs/heads/main x"],
  ["npx wrangler deploy"], ["wrangler deploy"], ["npx wrangler secret put X"], ["npm publish"], ["npm run deploy"], ["rm -rf ."], ["rm -rf .git"],
  ["git push origin HEAD:heads/main"], ["git push origin x:refs/heads/Main"], ["git checkout -Bmain"], ["git switch --force-create=main"],
  ["gh api graphql -f query='mutation{mergePullRequest(input:{pullRequestId:\"x\"}){clientMutationId}}'"], ["git add .env"], ["git add -f .env.local"], ["git add schluessel.pem"],
  ["gh api graphql -F query=@q.graphql"], ["gh api graphql --input q.json"], ["gh api graphql -f query=\"$(cat q.graphql)\""],
  ["gh -R a/b pr merge 1"], ["gh api --method=PATCH repos/a/b/git/refs/heads/main -f sha=x"], ["gh api -X PUT repos/a/b/actions/secrets/X"],
  ["gh api repos/a/b/actions/workflows/x/dispatches -f ref=main"], ["npx wrangler@3 deploy"], ["npm exec wrangler deploy"], ["pnpm dlx wrangler deploy"],
  ["npm run-script deploy"], ["git -c alias.x=push x origin HEAD:main"], ["b=main; git push origin HEAD:$b"], ["git push origin @", "main"],
  ["git reset @~1"], ["git reset kontakt~2"], ["git reset ORIG_HEAD"],
  ["git pull"], ["gh secret set X"], ["echo ok\ngit push origin main"], ["python3 - <<'EOF'\nprint(1)\nEOF\ngit commit -qam x"], ["git tag v1"], ["git cherry-pick abc"],
];
const frei = [
  ["git push -u origin kontakt"], ["git push origin feinschliff-3"], ["git add src/a.ts docs/x.md"], ["git commit -m 'Text mit main drin'"],
  ["git checkout -B kontakt origin/kontakt"], ["git checkout -b neu origin/main"], ["git reset src/a.ts"], ["git pull --ff-only origin main"],
  ["git fetch origin main"], ["rm -rf node_modules dist"], ["wrangler versions upload"], ["node -e \"console.log('wrangler deploy')\""],
  ["gh pr create --title x --body y"], ["gh api repos/a/b/commits/abc/check-runs"], ["gh api graphql -f query='{viewer{login}}'"], ["git commit --allow-empty -m x"], ["git add docs/env.md"], ["git revert --no-edit abc"], ["npm run build"], ["git diff origin/main...HEAD"],
];

test("Grenzen sperren Gefährliches, auch mit Umgehungen", () => {
  for (const [befehl, branch = "kontakt"] of gesperrt) assert.ok(pruefeZeile(befehl, branch), `nicht gesperrt: ${befehl}`);
});

test("Grenzen lassen Normales durch", () => {
  for (const [befehl, branch = "kontakt"] of frei) assert.equal(pruefeZeile(befehl, branch), null, `gesperrt: ${befehl}`);
});

test("pruefer darf nur lesen", () => {
  for (const b of ["echo x > a.txt", "cat a >> b", "tee x", "rm a", "mv a b", "cp a b", "sed -i s/a/b/ x", "git commit -m x", "git add a", "git checkout x",
    "git stash", "npm install x", "npm i", "node -e 'require(\"fs\").writeFileSync(1)'", "python3 -c x", "touch a", "mkdir x", "bash -c 'echo > x'", "node tmp.mjs", "echo x >| a", "find . -delete", "find . -name x -exec rm {} ;", "awk '{print > \"x\"}' a", "sort -o x a", "npx astro add react", "npx playwright test --update-snapshots", "npx vitest -u", "npx eslint --fix .", "npx playwright test --update-snapshots=all", "npx vitest run --update=true", "npm run e2e -- --update-snapshots", "npm run test -- -u", "npm run check -- --fix", "git diff --output=src/a.ts", "git log --output=x"])
    assert.ok(pruefeLesend(b), `nicht gesperrt: ${b}`);
  for (const b of ["git diff main...HEAD", "git log --oneline", "cat src/a.astro", "grep -rn x src", "npm run build", "node scripts/fotos.mjs --ziel laeufe/x/bilder",
    "node scripts/bericht.mjs laeufe/x/pruefung-1.md <<'ENDE'\n# x\nENDE", "npx playwright test", "ls -la 2>/dev/null", "npm run build 2>&1 | tail -5"])
    assert.equal(pruefeLesend(b), null, `gesperrt: ${b}`);
});

test("Paket-Sperre: nur freigegebene Pakete, Freigabezeile wird erkannt", () => {
  const f = freigabenLesen("| astro | * | MIT | Kit |\n| @fontsource/* | * | OFL-1.1 | Kit |\n| zod | 3.25.0 | MIT | Ahmad |\n");
  assert.ok(pruefeBash("npm install left-pad", f));
  assert.ok(pruefeBash("npm i -D left-pad@1.0.0", f));
  assert.ok(pruefeBash("npm install zod@4.0.0", f));
  assert.ok(pruefeBash("npx cowsay hi", f));
  assert.ok(pruefeBash("npm install ./paket", f));
  assert.ok(pruefeBash("npm install astro@npm:evil", f));
  assert.ok(pruefeBash("npm -D install left-pad", f));
  assert.ok(pruefeBash("npm instal left-pad", f));
  assert.ok(pruefeBash("npx astro add react", f));
  assert.deepEqual(ungeprueft({ dependencies: { astro: "npm:evil@1.0.0", three: "github:x/y" } }, f), ["astro@npm:evil@1.0.0", "three@github:x/y"]);
  assert.equal(pruefeBash("npm add astro", f), null);
  for (const b of ["npm install-test left-pad", "npm it left-pad", "npm cit left-pad", "npx -- astro add react", "npx --yes astro add react", "npx astro@latest add react", "npm exec astro add react", "pnpm dlx astro add react", "npx astro@npm:evil", "npm create evil", "npm init evil", "yarn dlx evil", "bunx evil", "npm --prefix . install evil"])
    assert.ok(pruefeBash(b, f), `nicht gesperrt: ${b}`);
  assert.equal(pruefeBash("npx playwright test", f), null);
  assert.equal(pruefeBash("npm init -y", f), null);
  assert.equal(pruefeBash("npm install astro@7.4.7 @fontsource/inter zod@3.25.0", f), null);
  assert.equal(pruefeBash("npm install", f), null);
  assert.equal(pruefeBash("npm install 2>&1 | tail -3", f), null);
  assert.ok(pruefeBash("npm install left-pad 2>&1 | tail -3", f));
  assert.equal(pruefeBash("cat > x.yml <<'ENDE'\nrun: npx cowsay\nENDE", f), null);
  assert.equal(pruefeBash("npx astro build", f), null);
  assert.deepEqual(ungeprueft({ dependencies: { astro: "7.4.7", "left-pad": "1.0.0" } }, f), ["left-pad@1.0.0"]);
  assert.deepEqual(freigabeZeilen("Bitte: PAKET-FREIGABE: zod@4.1.0 MIT"), [{ name: "zod", version: "4.1.0", lizenz: "MIT" }]);
  assert.ok(lizenzErlaubt("(MIT OR Apache-2.0)"));
  assert.ok(!lizenzErlaubt("GPL-3.0"));
  assert.ok(!lizenzErlaubt(undefined));
});

test("Frage-Sperre: nach Freigabe keine Frage, jede Frage mit Vorschlag, höchstens 4 je Fenster, 10 gesamt außer im Setup", () => {
  const frage = (v = true) => ({ question: "?", header: "x", options: [{ label: v ? "A (Vorschlag)" : "A" }, { label: "B" }] });
  assert.equal(pruefeFragen([frage()], { phase: "fragen", freigabe: null, fragen: 0 }), null);
  assert.ok(pruefeFragen([frage()], { phase: "bauen", freigabe: "2026-11-05T00:00:00Z" }));
  assert.equal(pruefeFragen([frage()], { phase: "wahl", freigabe: "2026-11-05T00:00:00Z", fragen: 2 }), null);
  assert.ok(pruefeFragen([frage(false)], { phase: "fragen" }));
  assert.ok(pruefeFragen([frage(), frage(), frage(), frage(), frage()], { phase: "fragen" }));
  assert.ok(pruefeFragen([frage(), frage()], { phase: "fragen", fragen: 9 }));
  assert.ok(pruefeFragen([frage(), frage()], { art: "autopilot", phase: "fragen", fragen: 9 }));
  assert.equal(pruefeFragen([frage(), frage(), frage(), frage()], { art: "setup", phase: "fragen", fragen: 20 }), null, "Setup ohne Grenze von 10");
  assert.ok(pruefeFragen([frage()], { art: "setup", phase: "bauen", freigabe: "2026-11-05T00:00:00Z" }));
});

test("Lauf endet nicht vor dem Pull Request", () => {
  const s = { branch: "kontakt", phase: "bauen", features: [{ name: "A", status: "bau" }], pr: null };
  assert.equal(entscheiden(s, false, "", "h1").sperren, true);
  assert.equal(entscheiden(s, true, "h0", "h1").sperren, true, "Fortschritt seit letzter Sperre: weiter sperren");
  assert.equal(entscheiden(s, true, "h1", "h1").sperren, false, "kein Fortschritt: Schutz gegen Endlosschleife");
  const pr = { ...s, pr: "https://x/pull/1", phase: "haken" };
  const ohne = entscheiden(pr, false, "", "h", "abc1234ff");
  assert.equal(ohne.sperren, true, "Pull Request allein beendet den Lauf nicht");
  assert.match(ohne.grund, /nicht gemessen.*actions\.mjs --warten.*Ursache/);
  const rot = entscheiden({ ...pr, haken: { stand: "rot", commit: "abc1234ff" } }, false, "", "h", "abc1234ff");
  assert.match(rot.grund, /rot für abc1234/);
  assert.match(entscheiden({ ...pr, haken: { stand: "grün", commit: "abc1234ff" } }, false, "", "h", "def5678aa").grund, /neuer Commit seit der Messung/);
  assert.equal(entscheiden({ ...pr, phase: "fertig", haken: { stand: "grün", commit: "abc1234ff" } }, false, "", "h").sperren, false);
  assert.equal(entscheiden(pr, true, "h", "h").sperren, false, "kein Fortschritt: Schutz gegen Endlosschleife auch beim Warten");
  assert.equal(entscheiden({ ...s, phase: "fragen" }, false, "", "h").sperren, false);
  assert.equal(entscheiden({ ...s, phase: "wahl" }, false, "", "h").sperren, false);
  assert.equal(entscheiden(null, false, "", "").sperren, false);
});

test("Nach grünen Haken kein Commit und kein Push mehr, auch kein Status-Vermerk", () => {
  const gruen = { branch: "kontakt", phase: "fertig", pr: "https://x/pull/1", haken: { stand: "grün", commit: "abc1234ff" } };
  assert.ok(gruenFertig(gruen));
  for (const b of ['git commit -m "Status: Lauf beendet, Haken grün" -- laeufe/kontakt/status.json', "git push -u origin kontakt", "git add x && git commit -m x", "git -C . push"])
    assert.match(pruefeZeile(b, "kontakt", gruen) ?? "", /fertig, Haken grün/, `nicht gesperrt: ${b}`);
  for (const b of ["git status", "git diff", "node scripts/actions.mjs", "gh pr edit 1 --body x"]) assert.equal(pruefeZeile(b, "kontakt", gruen), null, `gesperrt: ${b}`);
  for (const lauf of [{ ...gruen, phase: "haken" }, { ...gruen, haken: { stand: "rot", commit: "abc1234ff" } }, { ...gruen, phase: "haken", haken: undefined }, null])
    assert.equal(pruefeZeile("git push -u origin kontakt", "kontakt", lauf), null, "vor Grün: Push erlaubt");
  for (const t of ["mcp__github__push_files", "mcp__github__create_or_update_file", "mcp__plugin_engineering_github__push_files"]) assert.match(t, GITHUB_SCHREIBEN);
  assert.doesNotMatch("mcp__github__update_pull_request", GITHUB_SCHREIBEN);
});
