# Fehler 03 · Konsolenfehler auf einer Seite

Wegwerf-Branch `wegwerf-03` (lokal, Commit 3a5f054), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Eingebauter Fehler
```diff
+<script is:inline>window.kernholzZaehler.start();</script>
```

## Ergebnis
```
muss: e2e: Seiten laden ohne Konsolenfehler [handy]: Error: http://127.0.0.1:4321/leistungen/: Cannot read properties of undefined (reading 'start')
muss: e2e: Seiten laden ohne Konsolenfehler [desktop]: Error: http://127.0.0.1:4321/leistungen/: Cannot read properties of undefined (reading 'start')
SCHNELLPRÜFUNG ROT → docs/abnahme/fehler-03/schnellpruefung.md
Exit 1
```
