# Fehler 10 · Abschnitt im KI-Einheitslook (lila Verlauf, drei gleiche Symbol-Karten, Floskeltext)

Wegwerf-Branch `wegwerf-10` (lokal), nach dem Beleg gelöscht. Ein frischer pruefer (Opus) prüfte **blind**: Übergabezettel „Prüfen, Änderungsliste unbekannt, ganze Website mit dem Auge“, ohne Hinweis auf den Fehler. Bericht: [`pruefbericht.md`](pruefbericht.md), Bilder: [`bilder/`](bilder/).

## Eingebauter Fehler
```diff
+  <section style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:4rem 1.25rem;text-align:center;color:#fff;font-family:Inter,system-ui,sans-serif"><h2>Willkommen auf unserer Website</h2><p>Innovative Lösungen rund um Holz – Ihr Partner für Möbel und mehr.</p><div style="display:gri
```

## muss-Einstufung (Zitat)
> - muss: src/pages/leistungen.astro Zeile 39 – neuer Abschnitt über dem Einstieg ist austauschbarer KI-Einheitslook, sieben Treffer der Sperrliste in einem Abschnitt: lila-blauer Verlauf #6366f1 → #8b5cf6, Inter/Systemschrift, Raster aus drei gleichen Karten mit Symbol + Überschrift + zwei Zeilen, Emojis als Symbole (🚀 💡 ⭐), gleiche runde Ecken 16px mit weichem Schatten, zentrierter Standard-Einstieg, Floskeln („Willkommen auf unserer Website“, „Innovative Lösungen“, „Ihr Partner für“, „Wir bieten Ihnen“, „maßgeschneiderte“, „mit Leidenschaft“, „Qualität, die überzeugt“). Ab Gestaltungsstufe 4 „muss“. (Beleg: leistungen-1280-ganz.png, leistungen-390.png, git show 9add38c)
> - muss: src/pages/leistungen.astro Zeile 39 – Abschnitt bricht das Design-System: Farben und Schriften außerhalb der Tokens (#fff, #333, Verlauf statt --eiche/--span/--kupfer, Inter statt Big Shoulders/IBM Plex), Inline-Styles statt tokens.css. Harte Farbkante Lila → Räuchereiche ohne Gehrung. (Beleg: leistungen-1280-ganz.png)
> - muss: /leistungen/ – „Leistungen“ ist nicht mehr der Einstieg: Die Seite beginnt mit einem fremden h2 vor dem h1; am Handy füllt der Kartenblock den ganzen ersten Bildschirm, die feste Leiste schneidet die dritte Karte ab. (Beleg: leistungen-390.png)
