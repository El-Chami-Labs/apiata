---
name: gestaltungswahl
description: Teil des Setups – drei im ganzen Aufbau verschiedene Gestaltungsvorschläge bauen, fotografieren und Ahmad zur Wahl vorlegen.
disable-model-invocation: true
user-invocable: false
---

Vorschläge werden gebaut, nicht geprüft. Geprüft wird nur der gewählte.

1. `node scripts/status.mjs phase gestaltung`.
2. Lies `docs/design-bibliothek/README.md` (nur den Index), `projekt.json` und Ahmads Antworten. Wähle je Richtung
   eine Referenzseite und eine Vorlage; lies je Richtung den Bauplan und die ersten 30 Zeilen der Designsprache.
3. Schreibe drei Aufträge nach `docs/GESTALTUNG-RICHTUNGEN.md`. `node scripts/achsen.mjs docs/design-richtungen` muss
   Exit 0 liefern; bei Rot die Richtungen auseinanderlegen, nie die Prüfung.
4. Installiere alle Schriften der drei Aufträge in einem Befehl (`npm install @fontsource/… @fontsource-variable/…`),
   committe `package.json` und `package-lock.json`.
5. Drei bauer gleichzeitig (eine Nachricht, drei Aufrufe), je Übergabezettel: Pfad des eigenen Auftrags mit seiner Referenzseite und
   Vorlage, Seite `/gestaltung/<x>/`, Ordner `src/gestaltung/<x>/`, Sperrliste, Gestaltungsstufe. Kein bauer sieht die anderen
   Aufträge. Danach committet die Hauptsitzung die drei Vorschläge.
6. `npm run build`, dann `node scripts/fotos.mjs --ziel public/gestaltung --seiten /gestaltung/a/,/gestaltung/b/,/gestaltung/c/
   --ganz` (ab Gestaltungsstufe 4 dazu `--bildfolge`). Sieh jedes Bild an: Ist ein Vorschlag kaputt oder leer, bessert
   sein bauer einmal nach.
7. Augenprüfung: ein frischer pruefer bekommt nur die drei Bilder des ersten Bildschirms und der ganzen Seite (Handy
   und Computer) nebeneinander, neben jedem Vorschlag die Screenshots seiner Referenzseite (`1280-erster-bildschirm`,
   `390-erster-bildschirm`, `1280-ganze-seite`), und beantwortet: „Unterscheiden sie sich auf den ersten Blick in
   Kopfzeile, Aufbau, Formen und Knöpfen?“ und „Wirkt jeder Vorschlag wie eine Website von heute, auf dem Niveau
   seiner Referenzseite? Druck-, Handbuch- oder Retro-Wirkung = muss. Flaches, billiges 3D oder Technik-Demo = muss.“ Bericht `laeufe/<branch>/augenpruefung.md`.
   Jedes Nein ist „muss“: Der betroffene Vorschlag wird einmal neu gebaut (bei zu ähnlich mit neuem Auftrag,
   Achsen-Skript grün) und fotografiert, bevor Ahmad ihn sieht; ein zweites Nein steht im Report.
8. `node scripts/vorschlaege-seite.mjs` schreibt die Vorschau-Seite `public/gestaltung/index.html` (Bilder, Name,
   Leitsatz, Rolle je Vorschlag). `npm run build`, Commit, Push, `node scripts/status.mjs phase wahl`.
9. Nachricht an Ahmad: je Vorschlag Name und Leitsatz in einem Satz, Link `<Vorschau>/gestaltung/`, die Bilder als
   Anhang oder im Pull Request. Frage: „Welcher Vorschlag? Mischen geht auch (z. B. Farben von B, Schrift von A).“
   Dann Halt.

## Nach der Wahl
1. `docs/design-system.md` mit den Werten des gewählten Vorschlags füllen, dazu Referenzseite und Vorlage aus seinem
   Auftrag, `Status: gewählt`; Tokens nach
   `src/styles/tokens.css`. „Keiner davon“: einmal drei neue Aufträge.
2. Die anderen Vorschläge löschen (Seiten, Ordner, Bilder) in einem Commit. `node scripts/status.mjs phase bauen`.
