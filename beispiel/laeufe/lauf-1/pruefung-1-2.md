# Prüfung 2 · lauf-1
Grundlage: Nachbesserung zu laeufe/lauf-1/pruefung-1-1.md, Diff fdd2412..HEAD -- src (src/pages/leistungen.astro, src/styles/grund.css), npm run build grün, Bilder laeufe/lauf-1/bilder/pruefung-2/ (390 und 1280, Fenster und ganz, /leistungen/ und /)
## Befunde
- kann: / (Startseite) – die neuen Regeln `.hell .ersatz[data-form="2"]` und `.dunkel .ersatz` in grund.css sind nicht auf `.leist` begrenzt; auf der Startseite ist dadurch der Bildersatz der Karte „Möbel nach Maß“ farblich umgekehrt (heller Keil oben links statt unten rechts). Nicht kaputt, weiter erkennbar, nur unbeabsichtigte Nebenwirkung (Beleg: start-1280-ganz.png gegen pruefung-1/start-1280-ganz.png; grund.css:232-238)
- kann: /leistungen/ (1280) – das Band über „Möbel nach Maß“ ist kleiner (rund 180 px statt rund 250 px), Rest kommt aus der senkrechten Mittelung neben dem Bild; wirkt nicht mehr leer (Beleg: leistungen-1280-ganz.png)
## Nachbesserung aus Runde 1
- erledigt: Bildersatz auf dunkler Fläche erkennbar – Reparatur-Bildersatz hat Grundton span-2 mit 2 px hellem Rand, klar als Bildfläche abgesetzt; auf hell und hell-2 ebenfalls kontrastreich (Beleg: leistungen-1280-ganz.png, leistungen-390-ganz.png)
- erledigt: kleineres Band über Überschriften – `.leist { padding-block-start: calc(var(--gehrung) * 0.4 + 1.5rem) }` (Beleg: grund.css:230, leistungen-1280-ganz.png)
- erledigt: unterscheidbare Anfrage-Links – „Anfrage zu Möbel nach Maß / Innenausbau / Reparatur und Restaurierung“ (Beleg: leistungen.astro:56, beide Bilder)
## Weitere Prüfung
- Keine Überlappung, nichts abgeschnitten auf 390 und 1280; die über dem Text liegende Leiste in den Ganzseitenbildern ist die feste Leiste (wie Runde 1).
- Recht und Datenschutz: keine neue Datenverarbeitung, keine Einbettungen; Impressum und Datenschutz im Fuß.
## Nicht geprüft
- Bildfolge, Tastatur, Kontrastmessung, ohne JavaScript; Tests nicht erneut ausgeführt (nur CSS und Linktext geändert; e2e prüft „Anfrage stellen“ in der Leiste, nicht im Textlink, nicht nachgeprüft).
