# Prüfung 1 · wegwerf-10
Grundlage: docs/design-system.md (Vorschlag b · Zuschnitt, Gestaltungsstufe 4), docs/gestaltung/sperrliste.md, Prüfstufe 3; Commit 9add38c; Bilder laeufe/wegwerf-10/bilder (Seiten /, /leistungen/, /anfrage/, Breiten 390 und 1280, ganz)
## Befunde
- muss: src/pages/leistungen.astro Zeile 39 – neuer Abschnitt über dem Einstieg ist austauschbarer KI-Einheitslook, sieben Treffer der Sperrliste in einem Abschnitt: lila-blauer Verlauf #6366f1 → #8b5cf6, Inter/Systemschrift, Raster aus drei gleichen Karten mit Symbol + Überschrift + zwei Zeilen, Emojis als Symbole (🚀 💡 ⭐), gleiche runde Ecken 16px mit weichem Schatten, zentrierter Standard-Einstieg, Floskeln („Willkommen auf unserer Website“, „Innovative Lösungen“, „Ihr Partner für“, „Wir bieten Ihnen“, „maßgeschneiderte“, „mit Leidenschaft“, „Qualität, die überzeugt“). Ab Gestaltungsstufe 4 „muss“. (Beleg: leistungen-1280-ganz.png, leistungen-390.png, git show 9add38c)
- muss: src/pages/leistungen.astro Zeile 39 – Abschnitt bricht das Design-System: Farben und Schriften außerhalb der Tokens (#fff, #333, Verlauf statt --eiche/--span/--kupfer, Inter statt Big Shoulders/IBM Plex), Inline-Styles statt tokens.css. Harte Farbkante Lila → Räuchereiche ohne Gehrung. (Beleg: leistungen-1280-ganz.png)
- muss: /leistungen/ – „Leistungen“ ist nicht mehr der Einstieg: Die Seite beginnt mit einem fremden h2 vor dem h1; am Handy füllt der Kartenblock den ganzen ersten Bildschirm, die feste Leiste schneidet die dritte Karte ab. (Beleg: leistungen-390.png)
- kann: Startseite und /anfrage/ ohne Befund; die feste Leiste mitten in den Ganzseitenbildern ist ein Aufnahme-Effekt (position fixed), kein Fehler. (Beleg: start-1280-ganz.png, anfrage-390-ganz.png)
## Abnahmekriterien
- verfehlt: Website entspricht Design-System „Zuschnitt“ und Sperrliste ab Stufe 4 (Beleg: Befunde 1–3)
- erfüllt: Impressum und Datenschutz im Fuß verlinkt, Platzhalter statt erfundener Fakten auf / und /anfrage/ (Beleg: start-1280-ganz.png, anfrage-1280-ganz.png)
## Nicht geprüft
- Schnellprüfung (laeufe/wegwerf-10/schnellpruefung.md fehlt), Bildfolge der Bewegung, Tastatur und Kontrast, Code der Logik (nicht geändert), weitere Seiten (Impressum, Datenschutz).
