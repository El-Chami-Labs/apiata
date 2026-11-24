# 2 · Anfrageformular
Ziel: Besucher beschreiben ihr Vorhaben in einem kurzen Formular und schicken es ab, ohne dass die Website Daten speichert.
Normalfall: `/anfrage/` zeigt ein Formular mit Name, E-Mail oder Telefon (eins davon nötig), Art des Vorhabens (Möbel nach Maß, Innenausbau, Reparatur, Sonstiges), Beschreibung und Wunschzeitraum (optional). „Anfrage absenden“ öffnet das E-Mail-Programm mit fertig ausgefülltem Betreff und Text an „Platzhalter: E-Mail-Adresse“ (mailto). Darunter alternativ Telefon „Platzhalter: Telefonnummer“.
Fehlerfall: Fehlen Name, Kontaktweg oder Beschreibung, erscheint je Feld ein Hinweis in Worten direkt am Feld, der Fokus springt zum ersten Fehler; nichts wird geöffnet. Eine ungültige E-Mail-Adresse wird als solche benannt.
Nicht im Umfang: Versand über einen Server, Datei-Upload, Speicherung.
Betroffene Dateien: `src/pages/anfrage.astro`, neu `src/logik/anfrage.ts`, neu `tests/logik/anfrage.test.ts`, `src/pages/datenschutz.astro` (Abschnitt Kontakt per E-Mail), `tests/e2e/ablauf.spec.ts`.
Sichtbar: ja
Tests: Logik: `anfragePruefen(daten)` (Pflichtfelder, E-Mail-Form) und `anfrageText(daten)` (Betreff und Text der E-Mail)
Datenverarbeitung: Anfrage per E-Mail; die Website speichert nichts; Datenschutzerklärung erhält den Abschnitt „Kontakt per E-Mail“.
Abnahmekriterien:
1. Das Formular passt ins Design-System und ist auf dem Handy bequem bedienbar (große Felder, sichtbare Labels).
2. Leeres Absenden zeigt verständliche Hinweise an den Pflichtfeldern, Fokus auf dem ersten Fehler.
3. Gültige Angaben öffnen eine E-Mail mit Betreff „Anfrage: <Art> – <Name>“ und allen Angaben im Text.
4. Die Datenschutzerklärung erklärt die Kontaktaufnahme per E-Mail.
5. Ohne JavaScript bleibt das Formular nutzbar (mailto-Formular) und Telefon ist sichtbar.
End-zu-End-Prüfschritt: `/anfrage/` öffnen, leer absenden → Hinweis „Bitte Ihren Namen angeben“ sichtbar; Felder ausfüllen und absenden → es wird ein mailto-Link mit Betreff „Anfrage: Innenausbau – Erika Muster“ erzeugt.
Annahmen: mailto statt Server-Versand (kein Konto, keine Kosten, keine Speicherung).
