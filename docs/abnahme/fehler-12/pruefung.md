# Fehler 12 · Google-Fonts-Einbettung statt selbst gehosteter Schrift

Wegwerf-Branch `wegwerf-12` (lokal, Commit 298239b), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Eingebauter Fehler
```diff
+    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" />
```

## Ergebnis
```
muss: datenschutz: Datenschutz: /404/: Google Fonts eingebunden (Schriften selbst hosten mit @fontsource)
muss: datenschutz: Datenschutz: /404/: <link> zu fremdem Server: https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap
muss: datenschutz: Datenschutz: /anfrage/: Google Fonts eingebunden (Schriften selbst hosten mit @fontsource)
muss: datenschutz: Datenschutz: /anfrage/: <link> zu fremdem Server: https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap
muss: datenschutz: Datenschutz: /datenschutz/: Google Fonts eingebunden (Schriften selbst hosten mit @fontsource)
muss: datenschutz: Datenschutz: /datenschutz/: <link> zu fremdem Server: https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap
muss: datenschutz: Datenschutz: /impressum/: Google Fonts eingebunden (Schriften selbst hosten mit @fontsource)
muss: datenschutz: Datenschutz: /impressum/: <link> zu fremdem Server: https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap
muss: datenschutz: Datenschutz: /: Google Fonts eingebunden (Schriften selbst hosten mit @fontsource)
muss: datenschutz: Datenschutz: /: <link> zu fremdem Server: https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap
muss: datenschutz: Datenschutz: /leistungen/: Google Fonts eingebunden (Schriften selbst hosten mit @fontsource)
muss: datenschutz: Datenschutz: /leistungen/: <link> zu fremdem Server: https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap
SCHNELLPRÜFUNG ROT → docs/abnahme/fehler-12/schnellpruefung.md
Exit 1
```
