# Gestaltungsachsen (Daten für `scripts/achsen.mjs`)

Jeder Vorschlag nennt in `docs/design-richtungen/auftrag-<a|b|c>.md` die Zeile
`- Achsen: komposition=… · farbwelt=… · schrift=… · element=… · dichte=… · kopfzeile=… · bildersatz=… · fussleiste=… ·
formen=… · knoepfe=… · effekte=… · flaechen=… · abschnitte=…`
mit genau einem Wert je Achse aus dieser Datei. Wie weit sich zwei Vorschläge unterscheiden müssen, prüft
`scripts/achsen.mjs`.
Form je Wert: `` - `<wert>` · ab Stufe <n> · <für> · <Beschreibung> ``. Neue Werte als neue Zeile.

## Komposition
Wie der erste Bildschirm und die Seite aufgeteilt sind.
- `einspaltig-mittig` · ab Stufe 1 · alle · eine Spalte, mittig gesetzt, Abschnitte untereinander
- `linksbuendig-raster` · ab Stufe 1 · alle · strenges Raster, Inhalt an einer linken Kante
- `geteilt` · ab Stufe 1 · alle · erster Bildschirm in zwei Hälften (Text und Bild oder Fläche)
- `kacheln` · ab Stufe 1 · tool, app, plattform · modulare Kacheln im Raster, kein langer Fließtext (auf Websites ein Standardlayout)
- `werkzeug-zuerst` · ab Stufe 1 · tool, app, plattform · die Bedienung steht sofort im ersten Bildschirm, kein Werbeteil
- `seitenleiste-arbeitsflaeche` · ab Stufe 1 · tool, app, plattform · feste Seitenleiste für Navigation oder Filter, daneben die Arbeitsfläche
- `schritt-fuer-schritt` · ab Stufe 1 · alle · ein Schritt je Bildschirm oder Abschnitt, mit sichtbarem Fortschritt
- `asymmetrisch` · ab Stufe 2 · alle · ungleiche Spalten (etwa ein Drittel zu zwei Dritteln), versetzte Kanten
- `redaktionell` · ab Stufe 2 · tool, app, plattform · Spalten wie in einer Zeitschrift, Zitate und Zwischentitel gliedern
- `freie-abschnitte` · ab Stufe 3 · alle · jeder Abschnitt mit eigenem Aufbau, kein durchgehendes Raster
- `rasterbruch-ueberlappung` · ab Stufe 4 · alle · Bilder, Flächen oder Schrift überlappen sich, das Raster bricht
- `vollbild-szenen` · ab Stufe 5 · website · jeder Abschnitt füllt den Bildschirm, eigene Navigation zwischen Szenen

## Farbwelt
Welche Farben die Flächen tragen (nicht die Akzentfarbe der Aktionen allein).
- `hell-neutral` · ab Stufe 1 · alle · weiße oder graue Flächen, eine Akzentfarbe nur für Aktionen
- `hell-warm` · ab Stufe 1 · alle · Creme-, Sand- oder Papiertöne, gedeckter Akzent
- `hell-kuehl` · ab Stufe 1 · alle · bläuliche oder grünliche helle Töne, klarer Akzent
- `dunkel-neutral` · ab Stufe 1 · alle · dunkle Flächen, helle Schrift, ein Akzent
- `ton-in-ton` · ab Stufe 2 · alle · eine Farbe in mehreren Helligkeiten, Flächen und Schrift aus derselben Familie
- `akzentflaechen` · ab Stufe 2 · alle · ruhige Grundfläche mit einzelnen farbigen Abschnitten oder Bändern
- `hell-dunkel-wechsel` · ab Stufe 3 · alle · Abschnitte wechseln zwischen hellen und dunklen Flächen
- `kraeftig` · ab Stufe 3 · alle · gesättigte Farben auf großen Teilen der Seite
- `grosse-farbflaechen` · ab Stufe 4 · alle · ganze Bildschirme in kräftiger Farbe oder mit Verlauf

## Schriftcharakter
Wie die Schrift wirkt (Familie und Rangfolge, nicht die genaue Schrift).
- `grotesk-sachlich` · ab Stufe 1 · alle · serifenlose, neutrale Schrift, wenige Größen
- `grotesk-rund` · ab Stufe 1 · alle · serifenlose, runde und freundliche Schrift
- `serife-klassisch` · ab Stufe 1 · alle · Serifenschrift für Überschriften und Text, ruhige Rangfolge
- `mono-technisch` · ab Stufe 1 · tool, app, plattform · Monospace oder technisch wirkende Schrift, Zahlen gut lesbar
- `serife-und-grotesk` · ab Stufe 2 · alle · Serifenschrift für Überschriften, serifenlose für Text, deutliche Rangfolge
- `kondensiert-plakativ` · ab Stufe 3 · alle · schmale, kräftige Überschriften, oft in Versalien
- `ausdrucksstark` · ab Stufe 3 · alle · Anzeigeschrift mit Charakter, großer Abstand zwischen Titel und Text
- `schrift-als-bild` · ab Stufe 4 · alle · die Schrift selbst ist die Fläche oder das Bild

## Tragendes Element
Was die Seite ohne Foto trägt, also auch dann, wenn Fotos fehlen oder noch folgen.
- `typografie` · ab Stufe 1 · alle · die Überschriften und ihr Satz tragen die Seite
- `linien-und-raster` · ab Stufe 1 · alle · feine Linien, Tabellen- oder Listenraster gliedern
- `zahlen-und-fakten` · ab Stufe 1 · alle · große Kennzahlen, Preise, Zeiten oder Daten als Blickfang
- `inhaltsliste` · ab Stufe 1 · alle · Liste oder Karten der Angebote, Einträge oder Objekte
- `datenansicht` · ab Stufe 1 · tool, app, plattform · Tabelle, Diagramm oder Übersicht mit echten Werten
- `bedienelement` · ab Stufe 1 · tool, app, plattform · ein großes Eingabe- oder Bedienelement (Suche, Rechner, Formular)
- `farbflaechen` · ab Stufe 2 · alle · farbige Flächen und Bänder geben Gewicht und Rhythmus
- `geometrische-formen` · ab Stufe 2 · alle · Kreise, Bögen, Balken oder Rahmen als Schmuck (keine Icons, kein Fotoersatz)
- `muster-textur` · ab Stufe 3 · alle · Muster oder Struktur auf Flächen (kein Fotoersatz)
- `bewegte-grafik` · ab Stufe 4 · alle · eine Grafik, die sich bewegt und etwas erzählt (Rückfall ohne Bewegung)

## Dichte und Rhythmus
Wie viel auf einem Bildschirm steht und wie sich die Abschnitte abwechseln.
- `luftig-gleichmaessig` · ab Stufe 1 · alle · viel Weißraum, alle Abschnitte im selben Takt
- `mittel-gleichmaessig` · ab Stufe 1 · alle · mittlerer Weißraum, gleichmäßiger Takt
- `dicht-kompakt` · ab Stufe 1 · alle · viel Inhalt je Bildschirm, kleine Abstände, schnell zu überblicken
- `luftig-mit-verdichtung` · ab Stufe 2 · alle · ruhige, luftige Abschnitte und einzelne dichte Stellen (Liste, Tabelle)
- `wechselnd-laut-leise` · ab Stufe 3 · alle · große, laute Abschnitte wechseln mit kleinen, leisen

## Kopfzeile und Navigation
Wie man sich auf der Seite bewegt. Die Kopfzeile mit Logo links und Links rechts ist der Standard, den
die Richtungs-Aufträge meiden; darum steht sie hier nicht.
- `zentriert` · ab Stufe 1 · alle · Name mittig, Links darunter oder zu beiden Seiten verteilt
- `nur-menue` · ab Stufe 1 · alle · nur Name und ein Menüknopf; die Navigation öffnet sich als eigene Fläche
- `seitenleiste` · ab Stufe 1 · alle · Navigation als feste Leiste am linken oder rechten Rand
- `leiste-unten` · ab Stufe 1 · alle · Navigation oder Hauptaktion als Leiste am unteren Rand, auch am Computer
- `werkzeugleiste` · ab Stufe 1 · tool, app, plattform · Leiste mit Werkzeugen, Filtern und Konto über der Arbeitsfläche
- `im-einstieg` · ab Stufe 2 · website · die Navigation ist Teil des Einstiegs, etwa als große Liste oder Zeilen
- `inhaltsverzeichnis` · ab Stufe 2 · tool, app, plattform · Liste der Abschnitte, die beim Scrollen mitläuft und den Ort zeigt
- `szenen-zaehler` · ab Stufe 5 · website · Zähler oder Punkte zwischen Vollbild-Szenen statt einer Linkliste

## Bildersatz
Was an einer Bildstelle steht, solange Fotos fehlen (Fotos folgen später): eine gestaltete
Fläche aus der Palette des Vorschlags mit dem kleinen Hinweis „Foto folgt: <Motiv>“. Der Wert ist die Machart; an
jeder Bildstelle hat der Ersatz eine andere Form (dazu wechseln Ausschnitt oder Töne). Nie ein grauer oder einfarbiger
Kasten, nie eine Raster- oder Gitterfläche. Bei „Fotos folgen später“ hat jeder der drei Vorschläge eine andere Machart.
- `zwei-ton-form` · ab Stufe 1 · alle · eine große geometrische Form in zwei Tönen der Palette, je Bildstelle eine andere (Kreis, Bogen, Schnitt)
- `schichten` · ab Stufe 1 · alle · zwei bis drei versetzte Flächen in Tönen der Palette, übereinander wie Papier, je Bildstelle andere Umrisse
- `ausschnitt` · ab Stufe 1 · alle · eine Fläche mit großem Ausschnitt, der einen zweiten Ton zeigt, je Bildstelle ein anderer (Bogen, Fenster, Kreis)
- `schriftbild` · ab Stufe 2 · alle · ein großes Wort oder eine Initiale in der Schrift des Vorschlags füllt die Fläche, je Bildstelle ein anderes
- `farbband` · ab Stufe 2 · alle · breite Farbbänder über die Stelle, Teil des Rhythmus der Abschnitte, je Bildstelle in anderer Richtung oder Breite
- `verlauf` · ab Stufe 3 · alle · weicher Verlauf aus zwei bis drei Farben der Palette, je Bildstelle mit anderer Richtung oder anderem Anschnitt
- `muster` · ab Stufe 3 · alle · frei gesetzte, wiederholte Formen der Palette, je Bildstelle andere, kein Raster, kein Clipart
- `eigene-fotos` · ab Stufe 1 · alle · eigene Fotos sind da, kein Ersatz nötig (Fotos: mit Fotos)
- `ohne-bildstellen` · ab Stufe 1 · alle · der Aufbau hat keine Bildstellen (Fotos: ohne Fotos)

## Fußleiste
Wie die Seite unten endet (Rechtslinks, Kontakt, letzte Aktion).
- `schmal-einzeilig` · ab Stufe 1 · alle · eine schmale Zeile mit Name, Rechtslinks und Kontakt
- `zweizeilig-mit-kontakt` · ab Stufe 1 · alle · oben Kontakt und Öffnungszeiten groß, darunter eine Zeile Rechtslinks
- `gross-mehrspaltig` · ab Stufe 1 · alle · breite Fläche mit mehreren Spalten (Seiten, Kontakt, Rechtliches)
- `in-seitenleiste` · ab Stufe 1 · tool, app, plattform · Rechtslinks und Kontakt stehen unten in der Seitenleiste, keine eigene Fußfläche
- `statuszeile` · ab Stufe 1 · tool, app, plattform · schmale Zeile mit Stand oder Speicherhinweis und Rechtslinks
- `abschlussflaeche-mit-aktion` · ab Stufe 2 · website · große Abschlussfläche mit Hauptaktion, darunter klein das Rechtliche
- `verteilt-in-letzter-szene` · ab Stufe 5 · website · Kontakt und Rechtliches sind Teil der letzten Vollbild-Szene

## Formen
Ecken und Kanten von Knöpfen, Karten, Bildern und Feldern.
- `eckig-hart` · ab Stufe 1 · alle · rechte Winkel ohne Rundung, harte Kanten
- `leicht-gerundet` · ab Stufe 1 · alle · kleine Rundung (2–6 px), überall gleich
- `stark-rund-pillen` · ab Stufe 1 · alle · Knöpfe und Marken als Pillen, Karten stark gerundet
- `organisch-boegen` · ab Stufe 3 · alle · Bögen und weiche, ungleiche Rundungen an Flächen und Bildern
- `schraeg-gehrung` · ab Stufe 3 · alle · schräge Kanten und abgeschnittene Ecken an Flächen und Knöpfen

## Knöpfe
Wie die Hauptaktion und weitere Knöpfe aussehen.
- `flaeche-voll` · ab Stufe 1 · alle · gefüllte Fläche in der Akzentfarbe, Text hell
- `umriss` · ab Stufe 1 · alle · nur Rahmen in Akzent- oder Textfarbe, innen leer
- `text-mit-linie` · ab Stufe 1 · alle · Text mit Linie darunter oder davor, keine Fläche
- `gross-als-band` · ab Stufe 2 · alle · die Hauptaktion als breites Band über die ganze Breite
- `rund-mit-pfeil` · ab Stufe 2 · alle · runder Knopf mit Pfeil, Text daneben

## Effekte
Was sich bei Bedienung und beim Scrollen bewegt; die Stufe ist die Obergrenze.
- `keine-ruhig` · ab Stufe 1 · alle · nur Fokus und Farbwechsel ohne Bewegung
- `hover-farbwechsel` · ab Stufe 1 · alle · Knöpfe und Links wechseln Farbe oder Fläche beim Zeigen
- `hover-verschiebung-linie` · ab Stufe 1 · alle · beim Zeigen verschiebt sich ein Element leicht oder eine Linie wächst
- `einblenden-beim-scrollen` · ab Stufe 2 · alle · einzelne Elemente blenden beim Scrollen ein oder gleiten
- `scroll-gesteuert` · ab Stufe 4 · alle · Bildausschnitt, Fläche oder Abschnitt folgt dem Scrollweg

## Flächen
Woraus die großen Flächen bestehen.
- `einfarbig` · ab Stufe 1 · alle · jede Fläche in einer Farbe
- `getoent-abschnittsweise` · ab Stufe 1 · alle · Abschnitte wechseln zwischen zwei Tönen derselben Farbfamilie
- `verlauf-weich` · ab Stufe 2 · alle · weiche Verläufe aus zwei nahen Tönen
- `muster-textur` · ab Stufe 3 · alle · Muster oder Struktur auf großen Flächen
- `verlauf-kraeftig` · ab Stufe 4 · alle · kräftige Verläufe über ganze Bildschirme
- `foto-oder-bildersatz-vollflaechig` · ab Stufe 2 · website · Foto oder Bildersatz füllt ganze Abschnitte, Text darauf

## Abschnittsfolge
Wie die Abschnitte der Seite untereinander gebaut sind.
- `gleich-gebaut` · ab Stufe 1 · alle · alle Abschnitte folgen demselben Aufbau
- `wechselnd-zwei-arten` · ab Stufe 1 · alle · zwei Aufbauten wechseln sich ab (etwa Bild links, dann rechts, oder breit und schmal)
- `jeder-abschnitt-eigen` · ab Stufe 3 · alle · jeder Abschnitt hat einen eigenen Aufbau
