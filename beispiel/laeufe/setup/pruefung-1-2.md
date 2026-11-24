# Prüfung 2 · setup
Grundlage: Befund aus laeufe/setup/pruefung-1-1.md, Diff 5628634..HEAD -- src (nur src/styles/grund.css:209), Bilder laeufe/setup/bilder/pruefung-2/ (390, 768, 1280)
## Befunde
- keine muss, keine sollte, keine kann
## Abnahmekriterien
- erfüllt: muss-Befund Runde 1 behoben – „DATENSCHUTZERKLÄRUNG“ steht auf allen drei Breiten in einer Zeile, kein Umbruch im Wort (Beleg: datenschutz-390.png, datenschutz-768.png, datenschutz-1280.png). Neue Regel `.seite h1 { font-size: clamp(2.2rem, 7.5vw, 3.6rem); hyphens: auto; overflow-wrap: break-word }`, `lang="de"` gesetzt (src/layouts/Grund.astro:22), Silbentrennung greift also bei Bedarf.
- erfüllt: nichts Neues kaputt – `.seite h1` wirkt nur auf Datenschutz, Impressum, Anfrage, 404 (grep `class="seite"`); Impressum-Titel und Abschnitte sauber (impressum-390.png), Startseite vom Diff nicht berührt und unverändert (start-1280.png). Titel bleibt klar größer als h2 (max 3,6 rem gegen 2,3 rem).
- erfüllt: npm run build ohne Fehler (5 Seiten).
## Nicht geprüft
- 404 und Anfrage nicht neu fotografiert (gleiche Regel, kurze Titel).
- Nur Ausschnitt-Bilder, keine Ganzseiten- oder Bildfolge-Aufnahmen in dieser Runde.
