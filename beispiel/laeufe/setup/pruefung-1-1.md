# Prüfung 1 · setup
Grundlage: laeufe/setup/spec-1-startseite.md, Diff 14cd019...HEAD (5628634), Bilder laeufe/setup/bilder/pruefung-1/ (390 und 1280, ganz und Bildfolge), Vergleich laeufe/setup/bilder/vorschlag-b/
## Befunde
- muss: /datenschutz/ (Desktop) – Seitentitel bricht mitten im Wort um: „DATENSCHUTZERKLÄRUN“ / „G“. Ursache `src/styles/grund.css:209` `.seite h1 { font-size: clamp(2.4rem, 9vw, 5.5rem); overflow-wrap: anywhere }` in der 46-rem-Spalte; das lange Wort passt bei 5,5 rem nicht. Abhilfe etwa kleinere Obergrenze oder `hyphens: auto` mit `lang="de"` statt `overflow-wrap: anywhere`. (Beleg: datenschutz-1280-ganz.png, datenschutz-1280-bildfolge.png; Handy 390 passt knapp: datenschutz-390-ganz.png)
## Abnahmekriterien
- erfüllt: 1. Startseite sieht aus wie Vorschlag B auf Handy und Computer (Beleg: start-390-ganz.png gegen gestaltung-b-390-ganz.png, start-1280-ganz.png gegen gestaltung-b-1280-ganz.png – deckungsgleich)
- erfüllt: 2. Feste Leiste mit „Anfrage stellen“ (`/anfrage/`) auf jeder Seite, am Seitenende nichts verdeckt (Beleg: src/komponenten/Leiste.astro:16, Grund.astro:38; letztes Bild jeder *-bildfolge.png zeigt den Fuß frei über der Leiste. Die Überdeckung in den *-ganz.png ist ein Aufnahmeeffekt der festen Leiste)
- erfüllt: 3. Impressum und Datenschutz im Fuß jeder Seite verlinkt, im selben Stil lesbar (Beleg: src/komponenten/Fuss.astro:14-15, impressum-*-ganz.png, datenschutz-*-ganz.png) – Einschränkung: Titelumbruch siehe muss
- erfüllt: 4. Keine Entwurfsseiten unter /gestaltung/ (Beleg: `ls src/pages public dist` ohne gestaltung, `grep -rn gestaltung src` leer)
- erfüllt: Fehlerfall 404 im selben Rahmen mit Weg zur Startseite (Beleg: gibt-es-nicht-390-ganz.png, gibt-es-nicht-1280-ganz.png)
- erfüllt: /anfrage/ mit „Platzhalter: Anfrageformular folgt“ und „Platzhalter: Telefonnummer“ (Beleg: src/pages/anfrage.astro:8-9, anfrage-*-ganz.png)
- erfüllt: Ohne JavaScript / Bewegung reduzieren sichtbar – Effekte nur unter html.bewegt (Beleg: src/bewegung/bewegung.css:2-45; Ablauf zeigt im Ganzbild alle 4 Schritte), nicht im Browser ohne JS fotografiert
## Recht und Datenschutz
- Alle Fakten als „Platzhalter: …“ (Ort, Telefon, Preisrahmen, Öffnungszeiten, Impressumsangaben). Keine Bewertungen oder Zahlen erfunden.
- Keine fremden Einbettungen, Schriften über @fontsource, keine externen URLs im Build. Keine neue Datenverarbeitung. Datenschutztext inhaltlich unverändert gegenüber 14cd019 (Cloudflare passt zu wrangler.jsonc).
- Schnellprüfung GRÜN, keine „muss“-Zeile.
## Sperrliste
- Kein Einheitslook: eigene Palette und Schrift laut Design-System, Gehrungen, Bildersatz je Stelle andere Form mit „Foto folgt: …“. Ziffern 1–4 im Ablauf sind echte Abfolge.
## Nicht geprüft
- Tastaturbedienung und sichtbarer Fokus nicht im Browser durchgespielt.
- Seite tatsächlich ohne JavaScript nicht fotografiert (nur aus CSS abgeleitet).
- Kontrast nur rechnerisch für Knopf (Eiche auf Kupfer ≈ 3,0:1, reicht nur für große Schrift, die Knöpfe sind große Versalschrift).
