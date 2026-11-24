# Prüfung 1 · lauf-1
Grundlage: laeufe/lauf-1/spec-1-leistungen.md, Diff 6cb79e1...HEAD (55f3cdf, fdd2412), Bilder laeufe/lauf-1/bilder/pruefung-1/ (390 und 1280, Fenster, ganz, Bildfolge), Schnellprüfung GRÜN
## Befunde
- kann: /leistungen/ (1280) – über jeder Leistungs-Überschrift steht ein hohes leeres Band (rund 250 px), weil Flächen-Innenabstand und senkrechte Mittelung im Raster zusammenkommen; wirkt auf dem Computer etwas leer, auf dem Handy unauffällig (Beleg: leistungen-1280-ganz.png, leistungen-1280.png)
- kann: src/pages/leistungen.astro:55 – „Anfrage stellen“ übergibt ?leistung=<id>, src/pages/anfrage.astro wertet den Wert nicht aus; keine Vorauswahl, harmlos (Beleg: grep "leistung" src/pages/anfrage.astro ohne Treffer)
- kann: /leistungen/ – drei gleichlautende Links „Anfrage stellen“ plus Leiste; für Screenreader ohne Bezug zur Leistung (Zugänglichkeit, Stufe 3) (Beleg: src/pages/leistungen.astro:55)
## Abnahmekriterien
- erfüllt: 1 Drei Leistungen im Design-System (Gehrungen, Flächenwechsel hell / hell-2 / dunkel, Bildersatz je eigene Form mit „Foto folgt“), Handy und Computer ohne Überlappung oder abgeschnittenen Text; die Leiste über dem Inhalt ist die mitlaufende feste Leiste (Beleg: leistungen-390-ganz.png, leistungen-1280-ganz.png, beide Bildfolgen)
- erfüllt: 2 Anker #moebel, #innenausbau, #reparatur vorhanden, Startseite verlinkt je Leistung dorthin, Leiste und Fuß auf /leistungen/ (Beleg: grep in dist/leistungen/index.html und dist/index.html; e2e ablauf.spec.ts grün laut Schnellprüfung)
- erfüllt: 3 „Anfrage stellen“ in der festen Leiste in jedem Bild der Bildfolge sichtbar und am Ende jeder Leistung als Textlink (Beleg: leistungen-390-bildfolge.png, leistungen-1280-bildfolge.png)
- erfüllt: 4 Keine erfundenen Fakten: Dauer und Preisrahmen als „Platzhalter: …“, Beispiele ohne Zahlen (Beleg: src/pages/leistungen.astro:13,23,33; node scripts/fakten.mjs → FAKTEN OK)
- erfüllt: End-zu-End-Schritt Startseite → „Mehr zu Innenausbau“ → /leistungen/#innenausbau, Überschrift sichtbar (Beleg: tests/e2e/ablauf.spec.ts, e2e 15 Tests grün)
## Weitere Prüfung
- Recht und Datenschutz: keine neue Datenverarbeitung, keine fremden Einbettungen, Impressum und Datenschutz im Fuß verlinkt (leistungen-390-ganz.png).
- Sperrliste: kein Treffer gehäuft; abwechselnde Text-Bild-Abschnitte mit Gehrungen und Flächenwechsel aus dem Design-System, Floskeln keine.
- Code: Änderung am Kern-Test (fdd2412) wertet Inhalt unter der festen Leiste nicht mehr als verdeckt, prüft aber weiter, dass die feste Hauptaktion nie verdeckt ist; nachvollziehbar, kein Befund.
## Nicht geprüft
- Fehlerfall „ohne JavaScript“ und „Bewegung reduzieren“ nicht im Browser fotografiert; nur aus dem Code: Bewegung wirkt nur unter html.bewegt, das KOPF_SKRIPT bei reduzierter Bewegung nicht setzt; Anker sind statisches HTML.
- Tastaturbedienung und Kontrast nicht gemessen.
