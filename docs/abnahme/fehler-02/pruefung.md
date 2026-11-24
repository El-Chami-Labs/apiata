# Fehler 02 · Impressum-Link fehlt im Fuß

Wegwerf-Branch `wegwerf-02` (lokal, Commit 471681c), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Eingebauter Fehler
```diff
-      <li><a href="/impressum/">Impressum</a></li>
```

## Ergebnis
```
muss: e2e: Impressum und Datenschutz im Fuß jeder Seite verlinkt [handy]: Error: /: impressum fehlt im Fuß
muss: e2e: Impressum und Datenschutz im Fuß jeder Seite verlinkt [desktop]: Error: /: impressum fehlt im Fuß
SCHNELLPRÜFUNG ROT → docs/abnahme/fehler-02/schnellpruefung.md
Exit 1
```
