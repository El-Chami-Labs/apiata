// Kit-Test: Prüfskripte (Achsen, Unfertig-Sperre, Fremdquellen, Fakten, Status, Kit holen, Schnellprüfung, Vorschau-Link).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auftragLesen, pruefen, werteLesen } from "../achsen.mjs";
import { befunde, produktion } from "../unfertig-sperre.mjs";
import { fremdeQuellen } from "../fremdquellen.mjs";
import { faktenFinden, faktenInWerten, ziffern } from "../fakten.mjs";
import { linkUndAttributWerte } from "../build-text.mjs";
import { MAX_FEATURES, featureFinden, hakenEintragen, neu, phaseWechseln, weiter, zeiten } from "../status.mjs";
import { auswerten } from "../actions.mjs";
import { falschEingestuft, SICHTBAR } from "../bericht.mjs";
import { entscheiden } from "../../.claude/hooks/lauf-ende.mjs";
import { feedbackAufraeumen, freigabenZusammen, holen } from "../kit-holen.mjs";
import { playwrightAuswerten } from "../schnellpruefung.mjs";
import { linksPruefen, vorschauLink } from "../vorschau-link.mjs";
import { alteNamen, beispielAbweichungen, beispielKonfiguration, laufreste, pruefen as aufraeumenPruefen, toteVerweise, verwaist } from "../aufraeumen.mjs";
import { execFileSync, spawnSync } from "node:child_process";

const wurzel = new URL("../../", import.meta.url).pathname;
const werte = werteLesen(readFileSync(join(wurzel, "docs/gestaltung/achsen.md"), "utf8"));
const QUELLEN = { a: ["granola", "stripe"], b: ["salon-64", "vercel"], c: ["era-residence", "figma"] };
const quellen = (name, [ref, vorlage] = QUELLEN[name] ?? QUELLEN.a) =>
  `- Referenzseite: \`docs/design-bibliothek/referenzen/${ref}/\` – Aufbau\n- Vorlage: \`docs/design-bibliothek/${vorlage}.md\` – Werte`;
const auftrag = (name, achsen, stufe = 4, art = "Website", q = quellen(name)) =>
  auftragLesen(`- Projekt: ${art} – x\n- Gestaltungsstufe: ${stufe}\n- Fotos: folgen später\n${q}\n- Achsen: ${Object.entries(achsen).map(([k, v]) => `${k}=${v}`).join(" · ")}`, name);
const pruefenK = (auftraege) => pruefen(auftraege, werte, wurzel);
const a = { komposition: "geteilt", farbwelt: "hell-warm", schrift: "serife-klassisch", element: "typografie", dichte: "luftig-gleichmaessig", kopfzeile: "zentriert", bildersatz: "zwei-ton-form",
  fussleiste: "schmal-einzeilig", formen: "eckig-hart", knoepfe: "flaeche-voll", effekte: "keine-ruhig", flaechen: "einfarbig", abschnitte: "gleich-gebaut" };
const b = { komposition: "asymmetrisch", farbwelt: "dunkel-neutral", schrift: "grotesk-sachlich", element: "zahlen-und-fakten", dichte: "dicht-kompakt", kopfzeile: "leiste-unten", bildersatz: "schichten",
  fussleiste: "gross-mehrspaltig", formen: "stark-rund-pillen", knoepfe: "umriss", effekte: "hover-farbwechsel", flaechen: "verlauf-weich", abschnitte: "wechselnd-zwei-arten" };
const c = { komposition: "rasterbruch-ueberlappung", farbwelt: "grosse-farbflaechen", schrift: "schrift-als-bild", element: "farbflaechen", dichte: "wechselnd-laut-leise", kopfzeile: "nur-menue", bildersatz: "schriftbild",
  fussleiste: "abschlussflaeche-mit-aktion", formen: "schraeg-gehrung", knoepfe: "gross-als-band", effekte: "scroll-gesteuert", flaechen: "verlauf-kraeftig", abschnitte: "jeder-abschnitt-eigen" };

test("Achsen: 13 Achsen, drei im Aufbau verschiedene Vorschläge bestehen, fast gleiche werden abgelehnt", () => {
  assert.equal(werte.size, 13);
  for (const [achse, w] of werte) assert.ok(w.size >= 3, `Achse ${achse} hat zu wenige Werte`);
  assert.deepEqual(pruefenK([auftrag("a", a), auftrag("b", b), auftrag("c", c)]), []);
  const nurFarbeSchriftDichte = { ...a, farbwelt: "dunkel-neutral", schrift: "grotesk-sachlich", dichte: "dicht-kompakt" };
  const f = pruefenK([auftrag("a", a), auftrag("b", nurFarbeSchriftDichte)]);
  assert.ok(f.some((x) => /zu ähnlich: nur 3 von 13/.test(x)), f.join("\n"));
  assert.ok(f.some((x) => /zu ähnlich im Aufbau: gleich in komposition, kopfzeile, formen, knoepfe/.test(x)), f.join("\n"));
  const gleicheFormen = { ...b, formen: a.formen };
  assert.deepEqual(pruefenK([auftrag("a", a), auftrag("b", gleicheFormen)]), ["a und b zu ähnlich im Aufbau: gleich in formen"]);
  const sechs = { ...a, komposition: "asymmetrisch", kopfzeile: "nur-menue", formen: "stark-rund-pillen", knoepfe: "umriss", farbwelt: "hell-kuehl", bildersatz: "schichten" };
  assert.deepEqual(pruefenK([auftrag("a", a), auftrag("b", sechs)]), []);
  const fuenf = { ...sechs, farbwelt: a.farbwelt };
  assert.ok(pruefenK([auftrag("a", a), auftrag("b", fuenf)]).some((x) => /nur 5 von 13/.test(x)));
  const { knoepfe: _, ...ohneKnoepfe } = a;
  assert.ok(pruefenK([auftrag("a", ohneKnoepfe)]).some((x) => /Achse „knoepfe“ fehlt/.test(x)));
  const umbrochen = auftragLesen(`- Projekt: Website – x\n- Achsen: ${Object.entries(a).slice(0, 7).map(([k, v]) => `${k}=${v}`).join(" · ")} ·\n  ${Object.entries(a).slice(7).map(([k, v]) => `${k}=${v}`).join(" · ")}\n- Vorlage: keine`, "a");
  assert.deepEqual(umbrochen.achsen, a);
  assert.ok(pruefenK([auftrag("c", c, 2)]).some((x) => /erst ab Stufe/.test(x)));
  assert.ok(pruefenK([auftrag("a", { ...a, farbwelt: "lila" })]).some((x) => /kein erlaubter Wert/.test(x)));
  const technisch = { ...b, schrift: "mono-technisch", komposition: "redaktionell", kopfzeile: "inhaltsverzeichnis" };
  assert.equal(pruefenK([auftrag("b", technisch)]).filter((x) => /passt nicht zu website/.test(x)).length, 3);
  assert.deepEqual(pruefenK([auftrag("b", technisch, 4, "Tool")]), []);
});

test("Achsen: Referenzseite und Vorlage Pflicht, vorhanden, je Vorschlag andere", () => {
  const ohne = pruefenK([auftrag("a", a, 4, "Website", "- Vorlage: keine")]);
  assert.ok(ohne.some((x) => /„Referenzseite“ mit Pfad in Backticks fehlt/.test(x)), ohne.join("\n"));
  assert.ok(ohne.some((x) => /„Vorlage“ mit Pfad in Backticks fehlt/.test(x)), ohne.join("\n"));
  for (const geloescht of ["wired", "dell-1996", "README"])
    assert.ok(pruefenK([auftrag("a", a, 4, "Website", quellen("a", ["granola", geloescht]))]).some((x) => /Vorlage .* gibt es nicht/.test(x)), geloescht);
  assert.ok(pruefenK([auftrag("a", a, 4, "Website", quellen("a", ["gibt-es-nicht", "stripe"]))]).some((x) => /Referenzseite .* gibt es nicht/.test(x)));
  const ohneSatz = pruefenK([auftrag("a", a, 4, "Website", "- Referenzseite: `docs/design-bibliothek/referenzen/granola/`\n- Vorlage: `docs/design-bibliothek/stripe.md` – Werte")]);
  assert.deepEqual(ohneSatz, ["a: Referenzseite ohne Satz, was übernommen wird"]);
  const gleich = pruefenK([auftrag("a", a), auftrag("b", b, 4, "Website", quellen("b", ["granola", "stripe"]))]);
  assert.deepEqual(gleich, ["a und b: gleiche Referenzseite docs/design-bibliothek/referenzen/granola", "a und b: gleiche Vorlage docs/design-bibliothek/stripe.md"]);
});

function build(seiten) {
  const d = mkdtempSync(join(tmpdir(), "kit-dist-"));
  for (const [pfad, html] of Object.entries(seiten)) {
    mkdirSync(join(d, pfad), { recursive: true });
    writeFileSync(join(d, pfad, "index.html"), html);
  }
  return d;
}

test("Unfertig-Sperre: Platzhalter und fehlende Rechtsseiten sperren nur main", () => {
  const d = build({ "": "<html><body><p>Telefon: Platzhalter: Telefonnummer</p></body></html>", impressum: "<p>x</p>" });
  const f = befunde(d, { pruefstufe: 3 });
  assert.ok(f.some((x) => /Platzhalter/.test(x)));
  assert.ok(f.some((x) => /Datenschutz/.test(x)));
  assert.ok(produktion({ WORKERS_CI_BRANCH: "main" }, {}));
  assert.ok(!produktion({ WORKERS_CI_BRANCH: "kontakt" }, {}));
  assert.ok(!produktion({}, {}));
});

test("Unfertig-Sperre: Platzhalter in mailto:/tel: und alt, title, aria-label macht die Sperre rot", () => {
  const recht = { impressum: "<p>x</p>", datenschutz: "<p>x</p>" };
  const fall = (html) => befunde(build({ "": `<html><body>${html}</body></html>`, ...recht }), { pruefstufe: 3 });
  assert.deepEqual(fall('<a href="tel:+4930123456">Anrufen</a><p>Schreiben Sie uns.</p>'), []);
  for (const html of ['<a href="mailto:platzhalter@example.invalid">E-Mail schreiben</a>', '<a href="tel:Platzhalter">Anrufen</a>',
    '<a href="mailto:info@example.com?subject=Anfrage">E-Mail</a>', '<a href="mailto:kontakt&#64;beispiel.de">E-Mail</a>',
    '<form action="mailto:platzhalter%40example.invalid"></form>', '<img src="/a.webp" alt="Platzhalter: Foto Werkstatt">', '<a href="/" aria-label="Platzhalter: Name">x</a>'])
    assert.ok(fall(html).some((x) => /Platzhalter in/.test(x)), `nicht erkannt: ${html}`);
  const d = build({ "": '<html><body><p>Kontakt</p><a href="mailto:platzhalter@example.invalid">E-Mail</a><a href="tel:platzhalter">Anrufen</a></body></html>', ...recht });
  const r = spawnSync(process.execPath, [join(wurzel, "scripts/unfertig-sperre.mjs"), d, "--main"], { encoding: "utf8" });
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /Platzhalter in mailto[\s\S]*Platzhalter in tel[\s\S]*UNFERTIG-SPERRE ROT/);
});

test("Fremdquellen: Google Fonts und fremde Skripte werden gefunden, normale Links nicht", () => {
  assert.ok(fremdeQuellen('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">').length > 0);
  assert.ok(fremdeQuellen('<script src="https://cdn.example.com/x.js"></script>').length > 0);
  assert.ok(fremdeQuellen('<iframe src="https://www.youtube.com/embed/x"></iframe>').length > 0);
  assert.deepEqual(fremdeQuellen('<a href="https://example.com">x</a><link rel="stylesheet" href="/_astro/a.css"><img src="/bild.webp">'), []);
});

test("Fakten: erfundene Telefonnummer, Preis, Kundenzahl werden gefunden; Platzhalter und bekannte Fakten nicht", () => {
  assert.ok(faktenFinden("Rufen Sie an: 030 12345678").length);
  assert.ok(faktenFinden("Ab 49 € pro Stunde").length);
  assert.ok(faktenFinden("Über 500 zufriedene Kunden").length);
  assert.ok(faktenFinden("Gartenstraße 12, 10115 Berlin").length);
  assert.deepEqual(faktenFinden("Telefon: Platzhalter: Telefonnummer"), []);
  assert.deepEqual(faktenFinden("Rufen Sie an: 030 12345678", ["030 12345678"]), []);
  assert.deepEqual(faktenFinden("Wir streichen Wände in drei Schritten."), []);
});

test("Fakten: auch in mailto:/tel:-Zielen und alt, title, aria-label; platzhalter und bekannte Fakten nicht", () => {
  const werte = (html) => faktenInWerten(linkUndAttributWerte(html), ["030 12345678", "info@kernholz.de"]);
  assert.deepEqual(werte('<a href="mailto:anna@kernholz.de">Schreiben</a>'), ["E-Mail „anna@kernholz.de“ in mailto"]);
  assert.deepEqual(werte('<a href="tel:+4940999888">Anrufen</a>'), ["Telefon „+4940999888“ in tel"]);
  assert.deepEqual(werte('<a href="tel:0">Anrufen</a>'), ["Telefon „0“ in tel"]);
  assert.deepEqual(werte('<img alt="Werkstatt, seit 1990 in Familienhand">'), ["Jahr „seit 1990“ in alt"]);
  assert.deepEqual(werte('<a title="Über 500 zufriedene Kunden" href="/">x</a>'), ["Zahl „500 zufriedene“ in title"]);
  assert.deepEqual(werte('<a href="tel:+493012345678">x</a><a href="mailto:info@kernholz.de?subject=Hallo">y</a>'), [], "bekannte Fakten, +49 = 0");
  assert.deepEqual(werte('<a href="mailto:platzhalter@example.invalid">x</a><a href="tel:platzhalter">y</a><img alt="Platzhalter: Foto">'), []);
  assert.deepEqual(werte('<a href="/leistungen/" title="Leistungen">x</a><div data-title="seit 1990"></div>'), []);
  assert.equal(ziffern("+49 (0) 30 123"), ziffern("030 123"));
});

test("Status: Phasen mit Zeitstempeln, Zeiten in Minuten", () => {
  const s = neu("autopilot", "kontakt", ["A", "B"], "2026-11-05T10:00:00Z");
  s.freigabe = "2026-11-05T10:05:00Z";
  phaseWechseln(s, "bauen", s.freigabe);
  phaseWechseln(s, "fertig", "2026-11-05T11:35:00Z");
  s.ende = "2026-11-05T11:35:00Z";
  const z = zeiten(s).join("\n");
  assert.match(z, /fragen: 5 min/);
  assert.match(z, /bauen: 90 min/);
  assert.match(z, /gesamt: 95 min/);
});

test("Autopilot: höchstens 8 Features, Rest für den nächsten Lauf; Fortsetzen nach Abbruch mitten in Feature 5 von 8", () => {
  const namen = ["Anfrageformular", "Seite „Über uns“", "Preise", "Galerie", "Öffnungszeiten-Karte", "FAQ", "Team", "Blog", "Newsletter", "Jobs"];
  const s = neu("autopilot", "zehn", namen, "2026-11-05T10:00:00Z");
  assert.equal(s.features.length, MAX_FEATURES);
  assert.deepEqual(s.naechsterLauf, ["Newsletter", "Jobs"]);
  assert.deepEqual(s.features.map((f) => f.nr), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(featureFinden(s, 5).spec, "laeufe/zehn/spec-5-oeffnungszeiten-karte.md");
  assert.equal(new Set(s.features.map((f) => f.spec)).size, 8);
  assert.equal(neu("feinschliff", "f", namen).features.length, 10, "Feinschliff ohne Grenze");
  // Abbruch: 1–4 fertig, 5 im Bau mit Basis-Commit, Spezifikation geschrieben
  for (const n of [1, 2, 3, 4]) featureFinden(s, n).status = "fertig";
  Object.assign(featureFinden(s, 5), { status: "bau", basis: "abc123" });
  const gespeichert = JSON.parse(JSON.stringify(s)); // neue Sitzung liest status.json
  const w = weiter(gespeichert, (p) => p === "laeufe/zehn/spec-5-oeffnungszeiten-karte.md");
  assert.deepEqual([w.nr, w.von, w.name, w.basis], [5, 8, "Öffnungszeiten-Karte", "abc123"]);
  assert.match(w.schritt, /bauer.*Schnellprüfung/);
  assert.match(weiter({ ...gespeichert, features: gespeichert.features.map((f) => (f.nr === 5 ? { ...f, status: "pruefung" } : f)) }).schritt, /pruefer/);
  assert.match(weiter({ ...gespeichert, features: gespeichert.features.map((f) => (f.nr === 5 ? { ...f, status: "offen" } : f)) }, () => true).schritt, /Spezifikation liegt vor/);
  assert.match(weiter({ ...gespeichert, features: gespeichert.features.map((f) => (f.nr === 5 ? { ...f, status: "offen" } : f)) }, () => false).schritt, /Spezifikation schreiben/);
  const ende = entscheiden({ ...gespeichert, phase: "bauen" }, false, "", "h");
  assert.equal(ende.sperren, true);
  for (const name of ["Öffnungszeiten-Karte", "FAQ", "Team", "Blog"]) assert.match(ende.grund, new RegExp(name));
  assert.doesNotMatch(ende.grund, /Anfrageformular|Newsletter/);
  assert.match(weiter({ features: gespeichert.features.map((f) => ({ ...f, status: "fertig" })) }).schritt, /Abschluss/);
});

test("Kit holen: Kit-Dateien ersetzt, Projektdateien und Freigaben bleiben, alte Kit-Dateien weg", () => {
  const quelle = mkdtempSync(join(tmpdir(), "kit-q-"));
  const ziel = mkdtempSync(join(tmpdir(), "kit-z-"));
  writeFileSync(join(quelle, "kit-manifest.json"), JSON.stringify({ kit: ["CLAUDE.md", "scripts"], zusammenfuehren: ["docs/pakete-freigegeben.md"], nurKit: ["scripts/kit-test"], projekt: [] }));
  writeFileSync(join(quelle, "KIT-VERSION"), "3.1.0\n");
  writeFileSync(join(quelle, "CLAUDE.md"), "neu");
  mkdirSync(join(quelle, "scripts/kit-test"), { recursive: true });
  mkdirSync(join(quelle, "docs"));
  writeFileSync(join(quelle, "scripts/a.mjs"), "a");
  writeFileSync(join(quelle, "scripts/kit-test/x.test.mjs"), "x");
  writeFileSync(join(quelle, "docs/pakete-freigegeben.md"), "| Paket | Version | Lizenz | Quelle |\n|---|---|---|---|\n| astro | * | MIT | Kit |\n");
  mkdirSync(join(ziel, "scripts"));
  mkdirSync(join(ziel, ".claude"));
  mkdirSync(join(ziel, "docs"));
  writeFileSync(join(ziel, "CLAUDE.md"), "alt");
  writeFileSync(join(ziel, "scripts/alt.mjs"), "alt");
  writeFileSync(join(ziel, ".claude/kit-dateien.json"), JSON.stringify(["CLAUDE.md", "scripts/alt.mjs"]));
  writeFileSync(join(ziel, "projekt.json"), "{}");
  writeFileSync(join(ziel, "docs/pakete-freigegeben.md"), "| astro | * | MIT | Kit |\n| zod | 3.25.0 | MIT | Ahmad 2026-11-01 |\n");
  const r = holen(quelle, ziel);
  assert.equal(readFileSync(join(ziel, "CLAUDE.md"), "utf8"), "neu");
  assert.ok(!existsSync(join(ziel, "scripts/alt.mjs")));
  assert.ok(!existsSync(join(ziel, "scripts/kit-test/x.test.mjs")));
  assert.ok(existsSync(join(ziel, "projekt.json")));
  assert.match(readFileSync(join(ziel, "docs/pakete-freigegeben.md"), "utf8"), /zod \| 3\.25\.0/);
  assert.equal(r.version, "3.1.0");
  assert.match(freigabenZusammen("| a | * | MIT | Kit |\n", "| b | 1.0.0 | MIT | Ahmad |\n"), /\| b \| 1\.0\.0/);
});

test("Kit holen: erledigte Zeilen aus kit-feedback.md fallen weg, offene bleiben", () => {
  const kopf = "# Kit-Feedback\n\nEine Zeile je Beobachtung: Datum · was hakte · Vorschlag.\n\n";
  const erledigt = JSON.parse(readFileSync(join(wurzel, "kit-erledigt.json"), "utf8"));
  const zeilen = ["2026-11-06 · Platzhalter-E-Mail hinter mailto:-Link nicht erkannt · Sperre prüft Links",
    "2026-11-06 · Browser installieren hing über 10 Minuten · Zeitgrenze", "2026-11-06 · Vorschau-Link ohne die letzten zwei Zeichen des Branchs · Skript",
    "2026-11-06 · Commit nach grünen Haken startete die Prüfung neu · sperren", "2026-11-06 · /team-holen lässt erledigte Einträge in kit-feedback.md stehen · entfernen"];
  const offen = readFileSync(join(wurzel, "beispiel/kit-feedback.md"), "utf8").split("\n").filter((z) => /^\d{4}-/.test(z));
  const r = feedbackAufraeumen(kopf + [...zeilen, ...offen].join("\n") + "\n", erledigt);
  assert.deepEqual(r.entfernt.map((e) => e.zeile), zeilen);
  assert.equal(r.text, kopf + offen.join("\n") + "\n");
  const spaeter = ["2026-12-01 · Vorschau-Link zeigt 404 nach Merge · prüfen", "Vorschau-Link zeigt 404 nach Merge · ohne Datum",
    "2026-13-45 · Browser installieren hing · kaputtes Datum"];
  assert.deepEqual(feedbackAufraeumen(kopf + spaeter.join("\n") + "\n", erledigt), { text: kopf + spaeter.join("\n") + "\n", entfernt: [] });
  assert.deepEqual(feedbackAufraeumen("2026-11-06 · Browser install hing\n", [{ version: "1", merkmale: [["browser"], ["install"]] }]).entfernt, []);
  const quelle = mkdtempSync(join(tmpdir(), "kq-"));
  const ziel = mkdtempSync(join(tmpdir(), "kz-"));
  writeFileSync(join(quelle, "kit-manifest.json"), JSON.stringify({ kit: ["KIT-VERSION"], nurKit: [] }));
  writeFileSync(join(quelle, "KIT-VERSION"), "9.9.9\n");
  writeFileSync(join(quelle, "kit-erledigt.json"), JSON.stringify([{ version: "9.9.9", datum: "2026-11-06", merkmale: [["browser"], ["install"]] }]));
  mkdirSync(join(ziel, ".claude"));
  writeFileSync(join(ziel, "kit-feedback.md"), kopf + zeilen[1] + "\n" + offen[0] + "\n");
  assert.deepEqual(holen(quelle, ziel).erledigt, [{ version: "9.9.9", zeile: zeilen[1] }]);
  assert.equal(readFileSync(join(ziel, "kit-feedback.md"), "utf8"), kopf + offen[0] + "\n");
});

test("Schnellprüfung: wackelnder Test blockiert nicht, roter Test ist muss", () => {
  const bericht = { suites: [{ title: "kern.spec.ts", specs: [
    { title: "zeit unter 1 s", tests: [{ projectName: "handy", status: "flaky", results: [] }] },
    { title: "Links", tests: [{ projectName: "handy", status: "unexpected", results: [{ error: { message: "Error: 404 /x/" } }] }] },
    { title: "Laden", tests: [{ projectName: "desktop", status: "expected", results: [] }] },
  ] }] };
  const a = playwrightAuswerten(bericht);
  assert.deepEqual(a.wackelt, ["zeit unter 1 s [handy]"]);
  assert.equal(a.muss.length, 1);
  assert.equal(a.ok, 1);
});

test("Vorschau-Link nach Muster Branch-Worker-Subdomain", () => {
  assert.equal(vorschauLink("kontakt", { worker: "malerei", subdomain: "ahmad" }), "https://kontakt-malerei.ahmad.workers.dev");
  assert.equal(vorschauLink("Feinschliff_3", { worker: "m", subdomain: "s" }), "https://feinschliff-3-m.s.workers.dev");
  assert.equal(vorschauLink("x", { worker: "m", subdomain: "offen" }), null);
  const lang = "kontaktformular-und-preisliste1";
  assert.equal(vorschauLink(lang, { worker: "ki-transformation", subdomain: "s" }), `https://${lang}-ki-transformation.s.workers.dev`, "Branch nie gekürzt");
  assert.equal(vorschauLink("a".repeat(50), { worker: "ki-transformation", subdomain: "s" }), null, "über 63 Zeichen: Link aus dem Cloudflare-Kommentar");
});

test("Vorschau-Link im Report stimmt mit dem Branchnamen überein", () => {
  const p = { worker: "ki-transformation", subdomain: "ahmad" };
  const branch = "kontaktformular-und-preisliste1";
  const report = (host) => `**Vorschau:** https://${host}.ahmad.workers.dev\n1. https://${host}.ahmad.workers.dev/kontakt/ – ansehen`;
  assert.deepEqual(linksPruefen(report(`${branch}-ki-transformation`), branch, p), []);
  const gekuerzt = linksPruefen(report(`${branch.slice(0, -2)}-ki-transformation`), branch, p);
  assert.equal(gekuerzt.length, 1);
  assert.match(gekuerzt[0], /passt nicht zum Branch/);
  assert.deepEqual(linksPruefen("Vorschau folgt", branch, p), ["kein Vorschau-Link (workers.dev) gefunden"]);
  const lang = "b".repeat(50);
  assert.deepEqual(linksPruefen(report(`${"b".repeat(40)}--a1b2-ki-transformation`), lang, p), [], "langer Branch: Link aus dem Cloudflare-Kommentar");
  assert.equal(linksPruefen(report(`${"b".repeat(40)}-ki-transformation`), lang, p).length, 1);
  const beispiel = JSON.parse(readFileSync(join(wurzel, "beispiel/projekt.json"), "utf8"));
  for (const lauf of ["setup", "lauf-1", "feinschliff-1"])
    assert.deepEqual(linksPruefen(readFileSync(join(wurzel, `beispiel/laeufe/${lauf}/report.md`), "utf8"), lauf, beispiel), [], `Beispiel-Report ${lauf}`);
});

const speicher = (dateien) => ({ liste: Object.keys(dateien), lesen: (d) => dateien[d], gibtEs: (p) => p in dateien || Object.keys(dateien).some((d) => d.startsWith(p + "/")) });

test("Aufräumen a: tote Pfade und Befehle werden gefunden, vorhandene nicht", () => {
  const s = speicher({ "CLAUDE.md": "Siehe `docs/da.md`, `docs/weg.md`, `/setup-starten` und `/gibts-nicht`.", "docs/da.md": "x",
    ".claude/skills/setup-starten/SKILL.md": "Start: `node scripts/status.mjs start setup`", "scripts/status.mjs": "" });
  assert.deepEqual(toteVerweise(s.liste, s.lesen, s.gibtEs), ["CLAUDE.md: Pfad docs/weg.md gibt es nicht", "CLAUDE.md: Befehl /gibts-nicht gibt es nicht"]);
});

test("Aufräumen b: verwaiste Skripte, Skills, Rollen, Hooks und Vorlagen werden gefunden", () => {
  const s = speicher({ "CLAUDE.md": "`/genutzt`, `node scripts/genutzt.mjs`", "scripts/genutzt.mjs": "", "scripts/allein.mjs": "",
    ".claude/skills/genutzt/SKILL.md": "bauer baut", ".claude/skills/vergessen/SKILL.md": "", ".claude/agents/bauer.md": "", ".claude/agents/niemand.md": "",
    ".claude/hooks/los.mjs": "", "docs/design-bibliothek/README.md": "`stripe`", "docs/design-bibliothek/stripe.md": "", "docs/design-bibliothek/alt.md": "" });
  assert.deepEqual(verwaist(s.liste, s.lesen).sort(), [".claude/agents/niemand.md: Rolle wird in keinem Skill verwendet", ".claude/hooks/los.mjs: Hook wird nirgends verwendet",
    ".claude/skills/vergessen: Skill wird nirgends genannt", "docs/design-bibliothek/alt.md: Vorlage fehlt im Index docs/design-bibliothek/README.md", "scripts/allein.mjs: Skript wird nirgends verwendet"]);
});

test("Aufräumen c: Laufreste im Kit-Repo und gemergte Läufe im Projekt, offene Läufe und erlaubte Bilder bleiben", () => {
  const dateien = ["laeufe/alt/status.json", "laeufe/neu/status.json", "beispiel/laeufe/setup/status.json", "public/foto.webp", "laeufe/neu/bilder/a.png", "start.png", "fehler.log"];
  const kit = laufreste(dateien, { kit: true, branch: "neu" });
  assert.ok(kit.includes("laeufe/alt: Laufrest im Kit-Repo (Belege gehören in die Pull-Request-Beschreibung)") && kit.some((b) => b.startsWith("laeufe/neu:")));
  const projekt = laufreste(dateien, { kit: false, branch: "neu", aufMain: (l) => l === "alt" });
  assert.deepEqual(projekt, ["laeufe/alt: Laufrest eines gemergten Laufs (node scripts/status.mjs start räumt ihn weg)", "start.png: Zwischenbild außerhalb von laeufe/, public/, src/", "fehler.log: Laufrest"]);
  assert.deepEqual(laufreste(["laeufe/alt/status.json"], { kit: false, branch: "main", aufMain: () => true }), []);
});

test("Aufräumen d: alte Befehlsnamen ohne Ausnahme, auch in Belegen", () => {
  const alt = (n) => `/${n}`; // zusammengesetzt, damit diese Datei selbst keinen alten Namen enthält
  const s = speicher({ "docs/abnahme/x.md": `Startsatz \`${alt("lauf")} A; B\``, "beispiel/laeufe/l/fragen.md": "/setup-starten ist neu", "docs/y.txt": `weiter mit ${alt("kit-holen")}` });
  assert.deepEqual(alteNamen(s.liste, s.lesen), [`docs/abnahme/x.md: alter Befehlsname (\`${alt("lauf")})`, `docs/y.txt: alter Befehlsname (${alt("kit-holen")})`]);
});

test("Aufräumen e: Beispiel hat jede Kit-Datei wie das Kit, Projektdateien und Referenzbilder zählen nicht", () => {
  const manifest = { kit: ["CLAUDE.md", "scripts", "docs/design-bibliothek"], nurKit: ["scripts/kit-test"], zusammenfuehren: ["docs/pakete-freigegeben.md"] };
  const frei = "| Paket | Lizenz | Quelle |\n|---|---|---|\n| astro | MIT | Kit |\n";
  const kit = { "CLAUDE.md": "c", "scripts/a.mjs": "a", "scripts/kit-test/t.mjs": "t", "docs/design-bibliothek/referenzen/x/1.webp": "b",
    "docs/pakete-freigegeben.md": frei };
  const gleich = { ...kit, "beispiel/CLAUDE.md": "c", "beispiel/scripts/a.mjs": "a", "beispiel/wrangler.jsonc": "projekt",
    "beispiel/docs/pakete-freigegeben.md": frei + "| zod | MIT | Ahmad |\n" };
  const s = speicher(gleich);
  assert.deepEqual(beispielAbweichungen(s.liste, s.lesen, s.gibtEs, manifest), []);
  const t = speicher({ ...kit, "scripts/neu.mjs": "n", "beispiel/CLAUDE.md": "alt", "beispiel/scripts/a.mjs": "a", "beispiel/scripts/weg.mjs": "w",
    "beispiel/docs/pakete-freigegeben.md": "| zod | MIT | Ahmad |\n" });
  assert.deepEqual(beispielAbweichungen(t.liste, t.lesen, t.gibtEs, manifest), [
    "beispiel/CLAUDE.md: weicht vom Kit ab",
    "beispiel/scripts/neu.mjs: fehlt (Kit-Datei)",
    "beispiel/scripts/weg.mjs: gibt es im Kit nicht",
    "beispiel/docs/pakete-freigegeben.md: Kit-Freigaben fehlen",
  ]);
});

test("Aufräumen f: Beispiel-Konfiguration gleich der Vorlage, Name und Worker zählen nicht", () => {
  const w = (name, extra = "") => `{\n  "name": "${name}",\n  "workers_dev": true${extra}\n}\n`;
  const gleich = { "beispiel/wrangler.jsonc": w("kernholz"), "vorlagen/website/wrangler.jsonc": w("__WORKER__"),
    "beispiel/astro.config.mjs": "a", "vorlagen/website/astro.config.mjs": "a" };
  const s = speicher(gleich);
  assert.deepEqual(beispielKonfiguration(s.lesen, s.gibtEs), []);
  const t = speicher({ ...gleich, "vorlagen/website/wrangler.jsonc": w("__WORKER__", ',\n  "previews": {}'), "beispiel/astro.config.mjs": "b",
    "vorlagen/website/eslint.config.mjs": "e" });
  assert.deepEqual(beispielKonfiguration(t.lesen, t.gibtEs), [
    "beispiel/wrangler.jsonc: weicht von vorlagen/website/wrangler.jsonc ab (Zeile 3)",
    "beispiel/astro.config.mjs: weicht von vorlagen/website/astro.config.mjs ab (Zeile 1)",
    "beispiel/eslint.config.mjs: fehlt in Beispiel oder Vorlage (vorlagen/website/eslint.config.mjs)",
  ]);
});

test("Aufräumen: das Kit-Repo selbst ist sauber", () => {
  assert.deepEqual(aufraeumenPruefen(wurzel, { branch: "kit-test" }), []);
});

test("Laufstart räumt gemergte Läufe in einem eigenen Commit weg, der eigene Lauf entsteht", () => {
  const d = mkdtempSync(join(tmpdir(), "kit-aufraeumen-"));
  const git = (...a) => execFileSync("git", ["-C", d, ...a], { encoding: "utf8" });
  git("init", "-q", "-b", "main");
  git("config", "user.email", "kit@test"); git("config", "user.name", "Kit-Test");
  for (const l of ["alt", "feinschliff-1"]) { mkdirSync(join(d, "laeufe", l), { recursive: true }); writeFileSync(join(d, "laeufe", l, "status.json"), "{}\n"); }
  git("add", "laeufe"); git("commit", "-q", "-m", "gemergt");
  git("checkout", "-q", "-b", "neu");
  const aus = execFileSync("node", [join(wurzel, "scripts/status.mjs"), "start", "feinschliff"], { cwd: d, encoding: "utf8", env: { ...process.env, PROJEKT_ORDNER: d, LAUF_BRANCH: "neu" } });
  assert.match(aus, /AUFGERÄUMT: laeufe\/alt, laeufe\/feinschliff-1/);
  assert.ok(!existsSync(join(d, "laeufe/alt")) && existsSync(join(d, "laeufe/neu/status.json")));
  assert.match(git("log", "-1", "--format=%s"), /^Aufräumen: Läufe gemergter Branches entfernt/);
  assert.equal(git("status", "--porcelain", "--", "laeufe/alt"), "");
});

test("GitHub-Haken: Auswertung und Lauf erst mit grünen Haken fertig", () => {
  const l = (conclusion, status = "completed") => ({ name: "pruefung", status, conclusion });
  assert.equal(auswerten([]).stand, "keine");
  assert.equal(auswerten([l("success"), l(null, "in_progress")]).stand, "läuft");
  assert.equal(auswerten([l("success"), l("failure"), l(null, "queued")]).stand, "rot");
  assert.equal(auswerten([l("success"), l("skipped"), l("neutral")]).stand, "grün");
  const s = neu("feinschliff", "f", ["A"]);
  s.pr = "https://x/pull/2";
  phaseWechseln(s, "haken");
  hakenEintragen(s, "rot", "abc");
  assert.equal(s.phase, "haken");
  hakenEintragen(s, "grün", "def");
  assert.deepEqual([s.phase, s.haken.stand, s.haken.commit, Boolean(s.ende)], ["fertig", "grün", "def", true]);
  const ohnePr = hakenEintragen(neu("pruefen", "p"), "grün", "x");
  assert.notEqual(ohnePr.phase, "fertig", "grün ohne Pull Request beendet nichts");
});

test("Gerüst schreibt .claude/kit-dateien.json; Aufräum-Wächter im frischen Projekt grün", () => {
  const ziel = mkdtempSync(join(tmpdir(), "kit-setup-"));
  const dateien = execFileSync("git", ["-C", wurzel, "ls-files", "-co", "--exclude-standard"], { encoding: "utf8" })
    .split("\n").filter((d) => d && !/^beispiel\/(node_modules|dist)\//.test(d) && existsSync(join(wurzel, d)));
  for (const d of dateien) {
    mkdirSync(join(ziel, d, ".."), { recursive: true });
    writeFileSync(join(ziel, d), readFileSync(join(wurzel, d)));
  }
  execFileSync("node", ["scripts/geruest.mjs", "--name", "Test", "--worker", "test", "--subdomain", "konto", "--pruefstufe", "3",
    "--gestaltungsstufe", "5", "--3d", "--aufraeumen"], { cwd: ziel, encoding: "utf8" });
  assert.ok(existsSync(join(ziel, ".claude/kit-dateien.json")));
  assert.ok(!existsSync(join(ziel, "beispiel")));
  const liste = JSON.parse(readFileSync(join(ziel, ".claude/kit-dateien.json"), "utf8"));
  assert.ok(liste.includes("scripts/aufraeumen.mjs") && !liste.some((d) => d.startsWith("scripts/kit-test/")));
  assert.deepEqual(aufraeumenPruefen(ziel, { branch: "setup" }), []);
});

test("pruefer: sichtbare Fehler sind immer muss, das Bericht-Skript lehnt sollte/kann ab", () => {
  const bericht = [
    "# Prüfung 1 · setup",
    "- muss: Startseite – HUD-Ring oben abgeschnitten (Beleg: 390-start.png)",
    "- sollte: Szene 4 – Platte verdeckt den Text halb",
    "- **sollte**: Kopf – Ring am Rand abgeschnitten",
    "- kann: Fuß – Datum unleserlich klein",
    "- sollte: Bühne – leere Fläche rechts wirkt wie ein Fehler",
    "- sollte: Abstand im Fuß etwas eng",
    "- kann: Linkfarbe beim Darüberfahren",
  ].join("\n");
  const falsch = falschEingestuft(bericht);
  assert.equal(falsch.length, 4, falsch.join("\n"));
  assert.ok(falsch.every((z) => /sollte|kann/.test(z)));
  const ziel = mkdtempSync(join(tmpdir(), "kit-bericht-"));
  const skript = join(wurzel, "scripts/bericht.mjs");
  const lauf = (text) => spawnSync("node", [skript, "laeufe/x/pruefung-1.md"], { cwd: ziel, input: text, encoding: "utf8" });
  const rot = lauf(bericht);
  assert.equal(rot.status, 1);
  assert.match(rot.stdout, /immer „muss“/);
  assert.ok(!existsSync(join(ziel, "laeufe/x/pruefung-1.md")), "falsch eingestufter Bericht wird nicht geschrieben");
  const gut = lauf(bericht.replace(/- (\*\*)?(sollte|kann)(\*\*)?: (.*(verdeckt|abgeschnitten|unleserlich|leere Fläche))/g, "- muss: $4"));
  assert.equal(gut.status, 0, gut.stdout);
  assert.match(gut.stdout, /muss 5, sollte 1, kann 1/);
});

test("Rundengrenze gilt nie für sichtbare Fehler: status.mjs offen nimmt sie nicht an", () => {
  for (const t of ["Ring abgeschnitten", "Platte verdeckt Text", "Zahl unleserlich", "leere Fläche unter dem Kopf", "Bild überdeckt den Knopf"]) assert.match(t, SICHTBAR);
  for (const t of ["Ladezeit 3,1 s auf dem Handy", "Abstand im Fuß etwas eng", "Abdeckung der Tests"]) assert.doesNotMatch(t, SICHTBAR);
  const ordner = mkdtempSync(join(tmpdir(), "kit-offen-"));
  const umg = { ...process.env, PROJEKT_ORDNER: ordner, LAUF_BRANCH: "rund" };
  mkdirSync(join(ordner, "laeufe/rund"), { recursive: true });
  writeFileSync(join(ordner, "laeufe/rund/status.json"), JSON.stringify(neu("autopilot", "rund", ["A"])));
  const status = (...a) => spawnSync("node", [join(wurzel, "scripts/status.mjs"), ...a], { env: umg, encoding: "utf8" });
  const rot = status("offen", "Ring oben abgeschnitten");
  assert.equal(rot.status, 1);
  assert.match(rot.stdout, /bleibt nie offen/);
  assert.equal(status("offen", "Ladezeit 3,1 s").status, 0);
  assert.deepEqual(JSON.parse(readFileSync(join(ordner, "laeufe/rund/status.json"), "utf8")).offen, ["Ladezeit 3,1 s"]);
  assert.match(readFileSync(join(wurzel, "CLAUDE.md"), "utf8"), /Die Grenze gilt nie für sichtbare Fehler/);
  assert.match(readFileSync(join(wurzel, ".claude/agents/pruefer.md"), "utf8"), /immer „muss“, nie\s+„sollte“ oder „kann“/);
});
