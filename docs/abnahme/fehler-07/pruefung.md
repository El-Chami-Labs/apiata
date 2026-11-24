# Fehler 07 · Erfundener Fakt ohne „Platzhalter: …“

Wegwerf-Branch `wegwerf-07` (lokal, Commit 9b0affd), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Eingebauter Fehler
```diff
+<p>Seit 1998 haben wir über 300 zufriedene Kunden in der Region beraten. Rufen Sie an: 0341 2345678.</p>
```

## Ergebnis
```
muss: fakten: möglicher erfundener Fakt ohne „Platzhalter: …“: /leistungen/: Telefon „0341 2345678“ (echt? dann in inhalte/fakten.json)
muss: fakten: möglicher erfundener Fakt ohne „Platzhalter: …“: /leistungen/: Zahl „300 zufriedene“ (echt? dann in inhalte/fakten.json)
SCHNELLPRÜFUNG ROT → docs/abnahme/fehler-07/schnellpruefung.md
Exit 1
```
