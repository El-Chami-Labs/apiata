# Fehler 09 · Offensichtlich hässlicher Fehler (harte Farbkante, grauer Kasten, Ziffer „0“)

Wegwerf-Branch `wegwerf-09` (lokal), nach dem Beleg gelöscht. Ein frischer pruefer (Opus) prüfte **blind**: Übergabezettel „Prüfen, Änderungsliste unbekannt, ganze Website mit dem Auge“, ohne Hinweis auf den Fehler. Bericht: [`pruefbericht.md`](pruefbericht.md), Bilder: [`bilder/`](bilder/).

## Eingebauter Fehler
```diff
+  <div style="height:3rem;background:#39ff14"></div>
+  <div style="height:14rem;margin:2rem 1.25rem;background:#c8c8c8"></div>
+  <p style="margin:0 1.25rem;font-size:1rem">0</p>
```

## muss-Einstufung (Zitat)
> - muss: Startseite – neongrüner Balken (#39ff14, 3rem) direkt unter dem Einstieg, harte Farbkante, Farbe nicht im Design-System, Sperrliste „Neon-Akzent“ und „harte Farbkante“ (Beleg: start-390-ganz.png, start-1280-ganz.png; src/pages/index.astro Zeile 54)
> - muss: Startseite – grauer Kasten (#c8c8c8, 14rem) ohne Inhalt und ohne Hinweis „Foto folgt“, Sperrliste „graue Platzhalterkästen“ (Beleg: start-390-ganz.png, start-1280-ganz.png; index.astro Zeile 55)
> - muss: Startseite – verirrte Ziffer „0“ als loser Absatz vor „Leistungen“, auf dunkler Fläche in Standardfarbe kaum lesbar (Beleg: index.astro Zeile 56; im Ganzseitenbild unter dem grauen Kasten nur als winziger Fleck erkennbar)
