# Prüfung 1 · feinschliff-1
Grundlage: Übergabezettel (3 Punkte), Diff `git diff 7395f5c..HEAD -- src` (af980d5, b0691b6, 5a362dd), Prüfstufe 3, Bilder `laeufe/feinschliff-1/bilder/pruefung/` (390, 1280) und `laeufe/feinschliff-1/bilder/pruefung-ganz/` (320, 390, ganze Seite)
## Befunde
- kann: src/styles/grund.css:90 – Telefon in der Leiste am Handy jetzt 0.8rem (12,8 px), zweizeilig; noch lesbar, aber klein (Beleg: start-320.png, start-390.png)
## Abnahmekriterien
- erfüllt: Einstiegs-Überschrift am Handy ein Viertel kleiner – clamp(3.6rem, 18.5cqw, 7rem) → clamp(2.7rem, 13.9cqw, 5.25rem), alle drei Werte × 0,75 (grund.css:101); bei 390 px 72 → 54 px; Titel ganz sichtbar, nichts abgeschnitten (start-390.png, start-320.png)
- erfüllt: Desktop gleich – Regel ab 48rem `font-size: 10.4cqw` (grund.css:111) unverändert, Diff berührt sie nicht (start-1280.png)
- erfüllt: „Anfrage stellen“ am Handy einzeilig – `white-space: nowrap; flex: none` (grund.css:91); einzeilig bei 320 und 390 px auf allen drei Seiten; Desktop-Knopf mit 1.5rem/1.4rem wie zuvor (grund.css:96, anfrage-1280.png)
- erfüllt: Pfeil dreht beim Öffnen, nur transform, 200 ms – `transition: transform 200ms`, offen `rotate(90deg)`; Dreieck zeigt jetzt nach rechts und offen nach unten (grund.css:189–190); geschlossene Pfeile sichtbar (start-390-ganz.png)
- erfüllt: ohne Übergang bei „Bewegung reduzieren“ – `@media (prefers-reduced-motion: reduce) { … transition: none }` (grund.css:191)
- erfüllt: Schnellprüfung grün (schnellpruefung.md, 17 e2e-Tests ok)
- Sperrliste: keine neuen Treffer; Recht/Datenschutz: keine neue Datenverarbeitung, Platzhalter bleiben, Impressum und Datenschutz im Fuß verlinkt (start-390-ganz.png)
## Nicht geprüft
- Drehung im offenen Zustand und Animation im Browser (keine Fotos von geöffneten Fragen, kein Klick-Test); belegt nur über den Code
- Breiten zwischen 390 und 768 px (Tablet)
