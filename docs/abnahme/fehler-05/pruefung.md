# Fehler 05 · Text am Handy abgeschnitten oder waagerechtes Scrollen

Wegwerf-Branch `wegwerf-05` (lokal, Commit de785cd), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Eingebauter Fehler
```diff
+<p style="width:34rem;white-space:nowrap">Platzhalter: Hinweis zur Werkstattbesichtigung nach Vereinbarung</p>
```

## Ergebnis
```
muss: e2e: Layout 390 px [layout]: Error: /leistungen/ @390: waagerechtes Scrollen: Seite 544 px bei 390 px Fenster (p „Platzhalter: Hinweis zur Werks“)
SCHNELLPRÜFUNG ROT → docs/abnahme/fehler-05/schnellpruefung.md
Exit 1
```
