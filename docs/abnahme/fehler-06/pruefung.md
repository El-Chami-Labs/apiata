# Fehler 06 · Rückschritt: früheres Feature kaputt (Pflichtfeld Name im Anfrageformular)

Wegwerf-Branch `wegwerf-06` (lokal, Commit 11900a6), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Eingebauter Fehler
```diff
-  if (!d.name.trim()) f.name = "Bitte Ihren Namen angeben";
```

## Ergebnis
```
muss: logik: ❯ tests/logik/anfrage.test.ts (7 tests | 1 failed) 10ms
muss: e2e: Anfrage: leer absenden zeigt Hinweis, ausgefüllt erzeugt mailto-Link [handy]: Error: expect(locator).toBeVisible() failed
muss: e2e: Anfrage: leer absenden zeigt Hinweis, ausgefüllt erzeugt mailto-Link [desktop]: Error: expect(locator).toBeVisible() failed
SCHNELLPRÜFUNG ROT → docs/abnahme/fehler-06/schnellpruefung.md
Exit 1
```
