# Fehler 01 · Hauptaktion auf dem Handy an einer Scrollposition verdeckt

Wegwerf-Branch `wegwerf-01` (lokal, Commit 29dbb56), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Erster Versuch (nicht gefunden)
Der erste Einbau (klebender Hinweis im Abschnitt „Werkstatt“) lag in einem Abschnitt mit `isolation: isolate` und konnte die Leiste nicht überdecken: Screenshot bei 3.900 px zeigte den Knopf frei, `elementFromPoint` an allen 14 Prüfpunkten traf den Knopf. Der Fehler war also nicht eingebaut; die Schnellprüfung meldete zu Recht GRÜN. Zweiter Versuch: eine Chat-Blase, die zwischen 30 und 70 % Scrollweg erscheint und den Knopf überdeckt (unten).

## Eingebauter Fehler
```diff
+    <a class="chat-blase" href="/anfrage/#chat" hidden>Chat</a>
+    <style>.chat-blase{position:fixed;right:.75rem;bottom:.5rem;z-index:9999;width:9rem;height:4rem;border-radius:2rem;display:grid;place-items:center;background:#1e1813;color:#faf7f0;border:2px solid #efe2c2}.chat-blas
+    <script is:inline>(function(){var c=document.querySelector(".chat-blase");function z(){var h=document.documentElement.scrollHeight-innerHeight;c.hidden=!(scrollY>h*0.3&&scrollY<h*0.7)}addEventListener("scroll",z,{pa
```

## Ergebnis
```
muss: e2e: Hauptaktion auf jeder Seite da und an keiner Scrollposition verdeckt [handy]: Error: / bei 60 %: feste Hauptaktion verdeckt von a.chat-blase
SCHNELLPRÜFUNG ROT → docs/abnahme/fehler-01/schnellpruefung.md
Exit 1
```
