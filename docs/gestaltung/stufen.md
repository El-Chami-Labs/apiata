# Gestaltungsstufen 1–5

Die Stufe in `projekt.json` sagt, wie weit Gestaltung und Bewegung gehen dürfen. Kein Mittel ist Pflicht. Mittel über
der Stufe sind ein Befund.

| Stufe | Farbe und Fläche | Schrift | Aufbau | Bewegung | Werkzeug |
|---|---|---|---|---|---|
| 1 Schlicht | neutrale Flächen, Akzent für Aktionen | eine Familie | strenges Raster | nur Rückmeldung auf Bedienung, 150–250 ms | CSS |
| 2 Ruhig mit Akzent | sparsame Akzentflächen | bis zwei Familien | Raster mit Ausnahmen | einzelne Elemente blenden ein oder gleiten | CSS, `bewegung.mjs` |
| 3 Lebendig | wechselnde, kräftigere Flächen | ausdrucksstarke Schrift | freiere Abschnitte | Maskieren, Wort für Wort, Versatz in Gruppen | CSS, `bewegung.mjs` |
| 4 Gewagt | große Farbflächen, Verläufe | Schrift als Bild und Fläche | Rasterbrüche, Überlappung | erzählend: Bildausschnitt wandert, Abschnitt bleibt stehen, sanftes Scrollen | Motion, Lenis |
| 5 Inszeniert | frei | frei | Vollbild-Szenen, eigene Navigation | Szenen beim Scrollen, 3D | dazu Three.js |

Vorschlag im Setup: Betrieb 2, Tool 1, 4 und 5 auf Wunsch.

## Bewegung (jede Stufe)
- Bausteine aus `vorlagen/bewegung/` liegen im Projekt unter `src/bewegung/`: `bewegung.css` (Effekte über
  `data-bewegung`), `bewegung.mjs` (`KOPF_SKRIPT` in den `<head>`, `bewegungStarten()`), `szene-3d.mjs`.
- CSS zuerst. Motion nur für Effekte am Scrollweg, Lenis nur für sanftes Scrollen; beide laden erst bei Bedarf. Kein GSAP.
- Ohne JavaScript und mit „Bewegung reduzieren“ ist jeder Inhalt vollständig sichtbar und bedienbar. Versteckt wird
  nur unter `html.bewegt`.
- Bewegt werden nur `transform` und `opacity`. Jeder Platz steht vor dem Effekt fest, nichts springt.
- Bewegung verdeckt nie Text. Ein durchgehender Gedanke statt vieler Effekte; „jeder Abschnitt blendet gleich ein“ ist
  ein Befund.

## 3D
- `szene-3d.mjs` wird nur kopiert, wenn die Spezifikation 3D verlangt.
- Eine Szene an einer Stelle, mit fester Form (`[data-szene]`) und Ersatz (`[data-szene-ersatz]`), der ohne WebGL,
  ohne JavaScript und mit „Bewegung reduzieren“ stehen bleibt. Three.js lädt erst, wenn die Bühne nahe ist.
- Formen, Farben und Licht im Code; keine fremden Modelle ohne klare Lizenz.
- Mindestqualität Stufe 5: Leuchten (Bloom), Randlicht, Tiefe durch Partikel oder Schein, keine flachen Standard-Materialien, keine leeren Flächen um die Form.
