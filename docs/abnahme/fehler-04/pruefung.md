# Fehler 04 · Kaputter interner Link

Wegwerf-Branch `wegwerf-04` (lokal, Commit 55173fb), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Eingebauter Fehler
```diff
-      <li><a href="/#fragen">Fragen</a></li>
+      <li><a href="/fragen-und-antworten/">Fragen</a></li>
```

## Ergebnis
```
muss: e2e: keine kaputten internen Links [handy]: Error: 404 http://127.0.0.1:4321/fragen-und-antworten/
muss: e2e: Navigation führt zu Seiten mit genau einer Hauptüberschrift [handy]: Error: /fragen-und-antworten/: 404
muss: e2e: keine kaputten internen Links [desktop]: Error: 404 http://127.0.0.1:4321/fragen-und-antworten/
muss: e2e: Navigation führt zu Seiten mit genau einer Hauptüberschrift [desktop]: Error: /fragen-und-antworten/: 404
SCHNELLPRÜFUNG ROT → docs/abnahme/fehler-04/schnellpruefung.md
Exit 1
```
