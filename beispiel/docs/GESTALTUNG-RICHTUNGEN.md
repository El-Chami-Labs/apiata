# Richtungs-Aufträge

Die Gestaltungswahl schreibt drei Dateien `docs/design-richtungen/auftrag-a.md`, `-b.md`, `-c.md`. Teil 1 und 2 sind in
allen drei wörtlich gleich, nur Teil 3 trennt sie.

```markdown
# Richtungs-Auftrag <A|B|C> · <Name der Richtung>

## 1 Projekt
- Projekt: <Projektart> – <ein Satz>
- Zweck des ersten Bildschirms: <was er leisten muss>
- Zielgruppe und Ansprache: <wer; du oder Sie>
- Wirkung: <drei Adjektive>
- Gestaltungsstufe: <n> (<Name>)
- Fotos: mit Fotos | folgen später | ohne Fotos
- Pflichtinhalte: <Fakten; Fehlendes als „Platzhalter: …“>
- Abschnitte der Startseite: <Liste>
- Hauptaktion: <Text des Knopfs und Ziel>

## 2 Regeln
- Bildstellen ohne Foto: gestalteter Bildersatz nach Achse „Bildersatz“, je Stelle eine andere Form, Hinweis „Foto folgt: <Motiv>“.
- Die Seite wirkt fertig: glaubwürdige, branchentypische Beispielinhalte; Fakten nur als „Platzhalter: …“.
- Keine Bewertungen, Statistiken, Garantien oder Heilversprechen.
- Nichts aus `docs/gestaltung/sperrliste.md`. Keine Kopfzeile mit Logo links und Links rechts.
- Eigene Tokens nur für diesen Vorschlag, in eigenen Dateien unter `src/gestaltung/<x>/`.
- Handy zuerst, Kontrast WCAG AA, Tastatur, „Bewegung reduzieren“; die Stufe ist die Obergrenze.

## 3 Richtung
- Rolle: sicher | mutig | überraschend – <wie sie die Wirkung erfüllt>
- Leitsatz: <ein Satz, der die Richtung trägt>
- Standardlösung der Branche: <was naheliegt> – <was diese Richtung anders macht>
- Farbwelt: <3–5 Farben mit Hex-Wert und Ort>
- Schrift: <Familien mit Paket `@fontsource/<name>` oder `@fontsource-variable/<name>`, Rangfolge>
- Erster Bildschirm: <Aufbau>
- Abfolge: <Abschnitte und ihr Rhythmus>
- Bewegung: <ein Gedanke, passend zur Stufe; Bausteine aus `src/bewegung/`>
- Tonfall: <Beispielsatz der Überschrift>
- Verbote: <was diese Richtung meidet, hergeleitet aus den Richtungen davor>
- Referenzseite: `docs/design-bibliothek/referenzen/<ordner>/` – <ein Satz: welcher Aufbau, welche Anordnung, welche Idee>
- Vorlage: `docs/design-bibliothek/<name>.md` – <ein Satz: welche Farben, Schrift, Abstände, Ecken, Schatten, Knöpfe>
- Kopfzeile, Fußleiste, Formen, Knöpfe: <je ein Satz, wie sie aussehen>
- Achsen: komposition=<w> · farbwelt=<w> · schrift=<w> · element=<w> · dichte=<w> · kopfzeile=<w> · bildersatz=<w> ·
  fussleiste=<w> · formen=<w> · knoepfe=<w> · effekte=<w> · flaechen=<w> · abschnitte=<w>
```

## Die drei Richtungen schreiben
- Rollen je einmal: **sicher** nah an Wirkung und Branche, aber eigenständig; **mutig** weiter weg; **überraschend** am
  weitesten. Jede erfüllt die Wirkung aus Teil 1.
- Zuerst „sicher“ festlegen. „Mutig“ verbietet, was „sicher“ trägt; „überraschend“ verbietet, was beide tragen.
- Zwei Quellen je Richtung, beide Pflicht, je Richtung andere: eine Referenzseite aus dem Index (Stufe wie gewählt
  oder eine darunter oder darüber) für Aufbau, Anordnung und Kreativität; eine Vorlage (Designsprache) für die Werte.
  Farbwelt und Schrift leiten sich aus der Vorlage ab, Schriften frei lizenziert.
- Konkret statt Adjektive: Farben mit Hex, Schrift mit Paket, Aufbau so genau, dass zwei bauer dasselbe bauen.
- Achsenwerte aus `docs/gestaltung/achsen.md`, alle 13 Achsen, höchstens bis zur Stufe, passend zur Projektart. Je
  zwei Richtungen unterscheiden sich im ganzen Aufbau, nicht nur in Farbe und Schrift: in mindestens sechs Achsen,
  immer in komposition, kopfzeile, formen und knoepfe; bei „Fotos folgen später“ hat jede einen anderen
  Bildersatz.
- Die Designsprache übernehmen, nie die Seite, Marke, Logo, Texte oder wiedererkennbare Bilder.
- Gegenprobe: Passt eine Richtung genauso zu einer anderen Branche, ist sie beliebig und wird geschärft.
- Prüfen: `node scripts/achsen.mjs docs/design-richtungen` (Achsen, Referenzseite, Vorlage). Erst bei Exit 0 bauen.
