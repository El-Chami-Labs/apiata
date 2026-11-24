# Annahmen beim Neubau (Kit 3.0.0)

Ahmad war über Nacht nicht erreichbar. Diese Punkte habe ich selbst entschieden.

## Aufbau
1. **Kit-Repo ist zugleich die Vorlage.** Projekte entstehen über „Use this template“. Das Setup entfernt die nur für
   das Kit gedachten Dateien (`nurKit` in `kit-manifest.json`: Beispielprojekt, Kit-Test, Bauprotokolle).
2. **Läufe liegen im Repo** unter `laeufe/<branch>/` (status.json, Spezifikation, Prüfberichte, Bilder, Report). So
   kann eine neue Sitzung fortsetzen und jeder Beleg hat einen Pfad.
3. **Regeltexte** für Wortzahl, Doppelungs- und Altlasten-Wächter: `CLAUDE.md`, Rollen, Skills (ohne
   `frontend-design`), `docs/pruefstufen.md`, `docs/GESTALTUNG-RICHTUNGEN.md`, `docs/gestaltung/stufen.md`.
   Material (zählt nicht): Design-Bibliothek, Baupläne, Achsenwerte, Sperrliste, Bewegungs-/3D-Bausteine,
   `frontend-design`. `docs/ANLEITUNG.md` ist für Ahmad, kein Regeltext.
4. **frontend-design** (Apache-2.0) bleibt unverändert und ist nicht vorgeladen; der bauer liest ihn bei sichtbaren
   Änderungen. Vorgeladen würde er das Lesebudget (3.000 Wörter) sprengen.
5. **Kern-Tests**: 5 feste Tests plus je Feature ein End-zu-End-Prüfschritt in `tests/e2e/ablauf.spec.ts`, zusammen
   höchstens 10. Werden es mehr, fasst der bauer Prüfschritte zusammen.
6. **„Einmal allein wiederholen“** setzt Playwright mit `retries: 1` um: Grün in der Wiederholung meldet die
   Schnellprüfung als „wackelt“, ohne zu blockieren. Messungen (Zeit, Leistung) laufen nur im Projekt `messung`
   (`*.messung.spec.ts`) und blockieren nie, auch nicht in GitHub Actions (`continue-on-error`).
7. **Erfundene Fakten** findet zusätzlich zum pruefer ein Skript (`scripts/fakten.mjs`: Telefon, E-Mail, Preis,
   Anschrift, Kundenzahl, Bewertung ohne „Platzhalter:“ und ohne Eintrag in `inhalte/fakten.json`).
8. **Hauptaktion** steht als CSS-Selektor in `projekt.json`. Ein Kern-Test prüft auf jeder Seite an sechs
   Scrollpositionen: Sie ist da; eine feste Hauptaktion (Leiste) ist nie verdeckt; eine sichtbare wird nicht von normalem
   Inhalt überdeckt. Inhalt, der unter eine mitlaufende Leiste scrollt, gilt nicht als Fehler.

## Sicherheit und Berechtigungen
9. **Keine Berechtigungsfrage:** `.claude/settings.json` setzt `defaultMode: dontAsk` mit breiter Erlaubnisliste;
   Gefährliches sperren die Hooks. Was nicht erlaubt ist, wird ohne Frage abgelehnt. Wählt Ahmad in der App einen
   anderen Modus, gilt dieser.
10. **Prüfer-Bericht ohne Schreibwerkzeug:** Der pruefer hat kein Write/Edit; seinen Bericht schreibt er über
    `node scripts/bericht.mjs` (nur nach `laeufe/`). Der Hook `nur-lesen` (im Frontmatter des pruefer) lässt nur
    Lesebefehle, Kit-Skripte und Bau-/Test-Skripte zu.
11. **Lauf-Ende:** Stop-Hook mit `stop_hook_active`-Schutz (nicht `/goal`). Hat sich `status.json` seit der letzten
    Sperre nicht verändert, darf die Sitzung anhalten – sonst drohte eine Endlosschleife; der Stand bleibt für
    `/autopilot-fortsetzen`.
12. **Erlaubte Lizenzen** (auch indirekt; Ausnahme: `@img/sharp-*` mit LGPL, nur beim Build, `LIZENZ_AUSNAHMEN` in `scripts/pakete.mjs`): MIT, MIT-0, ISC, BSD-2/3, 0BSD, Apache-2.0, OFL-1.1, BlueOak-1.0.0, CC0-1.0,
    CC-BY-4.0, Unlicense, Python-2.0, MPL-2.0, Zlib, WTFPL. MPL-2.0 und CC-BY-4.0 brauchen Astro-Abhängigkeiten
    (lightningcss, caniuse-lite).
13. **`git pull` nur mit `--ff-only`**, `git reset` nur zum Abwählen von Dateien, Tags nur durch Ahmad.

## Umgebung
14. **Cloudflare:** Vorschau-Builds für alle Branches über „Non-production branch deploy command“
    `npx wrangler versions upload`. Die Klickwege in der Anleitung sind [nicht im Dashboard verifiziert].
15. **Versionen** [Stand 05.11.2026]: Astro 7.4.7, TypeScript 6.0.3 (7.x wird von typescript-eslint noch nicht
    unterstützt), Playwright 1.63.0 (passt zum vorinstallierten Browser der Cloud-Sitzung), Vitest 5.1.0,
    ESLint 10.14.0, Motion 14.9.1, Lenis 1.3.27, Three.js 0.187.0.
16. **Fragewerkzeug:** höchstens 4 Optionen je Frage; Prüfstufe 2 und Gestaltungsstufe 5 sind per Freitext wählbar.

## Abnahmelauf
17. Den Abnahmelauf habe ich als Orchestrator in dieser Bau-Sitzung gespielt; bauer und pruefer liefen als Subagents
    mit dem Inhalt der Rollen-Dateien und dem vorgegebenen Modell (Rollen, die während einer Sitzung entstehen,
    lädt Claude Code erst in der nächsten Sitzung). Ahmads Antworten habe ich selbst gewählt (siehe
    `docs/abnahme/ergebnis.md`).
18. Das Beispielprojekt `beispiel/` enthält die Kit-Dateien als Kopie wie ein echtes Projekt, aber ohne die
    Screenshots der Referenzseiten (12 MB).

## Nachtrag: Befehle, Interview, Autopilot, Gestaltungsachsen
Ahmad war wieder nicht erreichbar; alles im selben Pull Request.
19. **Belege bleiben, wie sie entstanden sind:** `docs/abnahme/` und `beispiel/laeufe/` nennen die Befehle ihrer Zeit.
    Der Kit-Test „Befehlsnamen“ nimmt nur diese Belegordner aus; jeder andere Text ist frei von alten Befehlen.
20. **Umbenannt sind Befehle und Skill-Ordner**, nicht Skripte, Hooks oder der Begriff „Lauf“
    (`scripts/kit-holen.mjs`, Hook `lauf-ende`, `laeufe/`). `kit-manifest.json` nennt keine Skills und blieb gleich.
21. **Gestaltungswahl** bleibt als Skill-Ordner, mit `user-invocable: false`; das Setup führt ihre Schritte aus.
22. **Art im Status:** `lauf` heißt `autopilot`. `/team-holen` und `/team-verbessern` laufen als Art `autopilot`.
23. **Interview:** Die Bitte um die 10 Punkte entfällt, wenn Ahmads Startnachricht schon eine Beschreibung oder einen
    Steckbrief enthält. Prüfstufe 5 und Gestaltungsstufe 5 sind per Freitext wählbar (höchstens 4 Optionen je Frage).
    Technik-Vorschlag: Astro mit TypeScript, Vorschau bei Cloudflare. „Plattform“ steht als `art: plattform` in
    `projekt.json`.
24. **Autopilot-Interview:** Auch ohne offene Frage gibt es die Zusammenfassung mit Halt bis „ok“. Die Grenze von
    10 Fragen gilt weiter für den Autopiloten, nur nicht fürs Setup (Frage-Sperre prüft `art`).
25. **8 Features:** Die Grenze gilt nur für die Art `autopilot`; Feinschliff-Listen bleiben ohne Grenze.
    `node scripts/status.mjs weiter` nennt Feature, Schritt, Spezifikation und Basis-Commit für den Wiedereinstieg;
    den Basis-Commit merkt sich `feature <n> bau`.
26. **Achsen:** Zusätzlich zu den genannten Werten `fussleiste=zweizeilig-mit-kontakt`, `in-seitenleiste`,
    `statuszeile` (damit ein Tool ab Stufe 1 drei verschiedene Fußleisten hat) und `flaechen=getoent-abschnittsweise`
    (Stufe 1). Die Stufen je Wert sind aus `docs/gestaltung/stufen.md` abgeleitet. Die Achsen-Zeile darf umbrechen
    (Folgezeilen eingerückt).
27. **Beispiel:** Die neuen Achsenwerte der drei Beispiel-Aufträge sind aus deren bestehendem Text abgeleitet; die
    gebaute Beispielseite ist nicht neu gebaut. Kit-Dateien im Beispiel mit `node scripts/kit-holen.mjs . beispiel
    --ohne-referenzbilder` nachgezogen.
28. **Augenprüfung:** Bericht `laeufe/<branch>/augenpruefung.md`. Ein zweites „Nein“ führt nicht zu einem dritten Bau,
    sondern steht im Report.
29. **Version:** `KIT-VERSION` bleibt 3.0.0, kein Eintrag im `CHANGELOG.md`, weil der Pull Request 3.0.0 noch offen ist.
