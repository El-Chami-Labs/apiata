# Prüfung 2-2 · lauf-1
Grundlage: Nachbesserung zu laeufe/lauf-1/pruefung-2-1.md, Diff 6980796..HEAD (cad0388) in src und tests; nur die Änderung geprüft (Punkt 7). Keine neuen Bilder, Oberfläche unverändert bis auf Fehlermarkierung.
## Befunde
- kann: tests/e2e/ablauf.spec.ts – die behobene Fehlermarkierung (aria-invalid an E-Mail bei ungültiger Adresse, an E-Mail und Telefon bei fehlendem Kontaktweg) ist weiterhin durch keinen Browsertest abgesichert; der Nachweis stützt sich nur auf den Code. (Beleg: Testdatei, Zeilen 11–24 prüfen nur Name-Hinweis und mailto)
## Nachbesserung zu Prüfung 2-1
- behoben (sollte): src/pages/anfrage.astro Z. 78–80 – `felder` ordnet jetzt Fehler zu ID-Listen zu; erst werden alle vier Felder entmarkiert, dann jedes fehlerhafte gesetzt. `f.email` → `a-email` wird nicht mehr überschrieben, denn `anfragePruefen` setzt `f.kontakt` nur im `else`-Zweig (src/logik/anfrage.ts Z. 28–29), und Setzen erfolgt nur additiv. Fehlender Kontaktweg markiert E-Mail und Telefon. Darstellung über `.feld [aria-invalid]` (src/styles/grund.css Z. 254, kupferner Rand). Fokus geht auf `erstes[1][0]`, bei Kontaktfehler auf E-Mail. (Beleg: Code-Lesung; `npx playwright test tests/e2e/ablauf.spec.ts --project=handy` → 2 passed, ohne eigene aria-invalid-Prüfung)
- behoben (kann): Testweiche `location.search.includes("test")` entfernt, e2e-Test ruft `/anfrage/` auf und besteht weiter (Beleg: e2e 2 passed).
- behoben (kann): `anfrageText` liefert `undefined` statt "" und filtert `!== undefined`; keine Leerzeilen mehr, die gewollte Leerzeile vor „Beschreibung:“ bleibt. (Beleg: neuer Test „lässt leere freiwillige Felder samt Zeile weg“, `npm run test` → 7 passed)
- offen (kann): fehlende Browserprüfung der weiteren Hinweise, siehe Befund oben.
## Abnahmekriterien
- erfüllt: 1–5 und Vorauswahl unverändert gegenüber Prüfung 2-1; Änderung berührt nur Fehlermarkierung, Mailtext und Testweiche (Beleg: Diff, `npm run build` erfolgreich, 6 Seiten; `npm run test` 7 passed; e2e handy 2 passed)
## Nicht geprüft
- aria-invalid im echten Browser (kein Test vorhanden, kein eigener Test erlaubt); Bilder nicht neu aufgenommen; Desktop-Projekt der e2e-Tests nicht ausgeführt.
- Öffnen eines echten E-Mail-Programms über `location.href = link`.
