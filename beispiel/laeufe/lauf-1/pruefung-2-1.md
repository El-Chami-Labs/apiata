# Prüfung 2-1 · lauf-1
Grundlage: laeufe/lauf-1/spec-2-anfrage.md, Diff fab63ce...e78f99f (src, tests), Prüfstufe 3, Gestaltungsstufe 4, Bilder laeufe/lauf-1/bilder/pruefung-2-1 (390/1280, ganz, Bildfolge)
## Befunde
- sollte: src/pages/anfrage.astro (Skript, Schleife über `felder`) – `aria-invalid` am E-Mail-Feld wird vom zweiten Eintrag `[f.kontakt, "a-email"]` wieder entfernt: bei ungültiger E-Mail-Adresse bekommt das Feld keine Fehlermarkierung (kupferner Rand), der Hinweis steht trotzdem da; fehlt der Kontaktweg, wird nur E-Mail markiert, Telefon nie. Zugänglichkeit nach Stufe 3 „sollte“. (Beleg: Code-Lesung anfrage.astro, Zeilen mit `felder` und `toggleAttribute`)
- kann: src/pages/anfrage.astro – Testweiche `if (!location.search.includes("test"))` im ausgelieferten Code; jede Adresse mit „test“ in der Abfrage öffnet kein E-Mail-Programm. Besser über eigenen Schalter/Testumgebung lösen. (Beleg: Code)
- kann: src/logik/anfrage.ts `anfrageText` – `filter(typeof z === "string")` behält leere Zeichenketten; fehlen E-Mail, Telefon oder Zeitraum, stehen Leerzeilen mitten im Mailtext. (Beleg: Code-Lesung, `d.email.trim() && …` ergibt "")
- kann: tests/e2e/ablauf.spec.ts – prüft nur den Namenshinweis; Hinweise zu Kontaktweg, Beschreibung und ungültiger E-Mail im Browser sind ungeprüft (Logik-Tests decken die Texte ab). (Beleg: Testdatei)
## Abnahmekriterien
- erfüllt: 1 Formular im Design-System, auf dem Handy bequem (Felder ≥ 3,25 rem hoch, Labels sichtbar, Kupferknopf mit Gehrung, Plex/Big Shoulders) (Beleg: anfrage-390.png, anfrage-390-bildfolge.png, anfrage-1280-ganz.png)
- erfüllt: 2 Leeres Absenden zeigt „Bitte Ihren Namen angeben“, Fokus auf Name (Beleg: `npx playwright test tests/e2e/ablauf.spec.ts -g Anfrage` → 2 passed, handy und desktop; Code `anfragePruefen`)
- erfüllt: 3 mailto mit Betreff „Anfrage: Innenausbau – Erika Muster“ und allen Angaben (Beleg: e2e-Test, tests/logik/anfrage.test.ts)
- erfüllt: 4 Datenschutzerklärung mit Abschnitt „Kontakt per E-Mail“, Zweck, Rechtsgrundlage, Löschung, Platzhalter für Anbieter (Beleg: datenschutz-390-ganz.png, datenschutz-1280-ganz.png)
- erfüllt: 5 Ohne JavaScript: `<form action="mailto:…" enctype="text/plain">` mit `required` an Name und Beschreibung; Telefon im Abschnitt „Lieber anrufen?“ sichtbar (Beleg: Code anfrage.astro, anfrage-1280-ganz.png)
- erfüllt: Vorauswahl über `?leistung=reparatur` (Beleg: anfrage-?leistung=reparatur-390.png); IDs in leistungen.astro passen zu den Optionen
## Weitere Prüfpunkte
- Auge: nichts kaputt, verdeckt oder abgeschnitten; die Leiste mitten in den „ganz“-Bildern ist die feste Leiste der Aufnahme. Sperrliste: keine Treffer.
- Recht: nur Platzhalter, Impressum und Datenschutz im Fuß verlinkt, keine fremden Einbettungen, Empfänger `platzhalter@example.invalid`.
- Schnellprüfung lauf-1: GRÜN, keine „muss“-Zeilen.
## Nicht geprüft
- Öffnen eines echten E-Mail-Programms (nur mailto-Link geprüft).
- Formular mit abgeschaltetem JavaScript im Browser (nur per Code belegt).
