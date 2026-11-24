# Richtungs-Auftrag C · Jahresringe

## 1 Projekt
- Projekt: Website – Tischlerei für Möbel nach Maß, Innenausbau sowie Reparatur und Restaurierung; Privatkundinnen und -kunden fragen ein Projekt an.
- Zweck des ersten Bildschirms: zeigen, dass hier präzise mit echtem Holz gearbeitet wird, und den Weg zur Anfrage öffnen.
- Zielgruppe und Ansprache: Eigentümer und Mieter, die ein Möbel für eine schwierige Ecke, einen Einbauschrank oder die Reparatur eines Erbstücks suchen; Sie, ruhig und direkt.
- Wirkung: handwerklich, warm, präzise
- Gestaltungsstufe: 4 (Gewagt)
- Fotos: folgen später
- Pflichtinhalte: Name „Tischlerei Kernholz“; Leistungen Möbel nach Maß, Innenausbau, Reparatur und Restaurierung; Ablauf in vier Schritten (Gespräch und Aufmaß, Entwurf, Fertigung in der Werkstatt, Einbau); Ort „Platzhalter: Ort“; Telefon „Platzhalter: Telefonnummer“; Knopf „Anfrage stellen“ auf `/anfrage/`; Fuß mit Impressum und Datenschutz.
- Abschnitte der Startseite: Einstieg, Leistungen, So entsteht Ihr Möbel, Holz und Werkstatt, Häufige Fragen, Aufruf zur Anfrage, Fuß
- Hauptaktion: „Anfrage stellen“ → `/anfrage/`

## 2 Regeln
- Bildstellen ohne Foto: gestalteter Bildersatz nach Achse „Bildersatz“, je Stelle eine andere Form, Hinweis „Foto folgt: <Motiv>“.
- Die Seite wirkt fertig: glaubwürdige, branchentypische Beispielinhalte; Fakten nur als „Platzhalter: …“.
- Keine Bewertungen, Statistiken, Garantien oder Heilversprechen.
- Nichts aus `docs/gestaltung/sperrliste.md`. Keine Kopfzeile mit Logo links und Links rechts.
- Eigene Tokens nur für diesen Vorschlag, in eigenen Dateien unter `src/gestaltung/<x>/`.
- Handy zuerst, Kontrast WCAG AA, Tastatur, „Bewegung reduzieren“; die Stufe ist die Obergrenze.

## 3 Richtung
- Rolle: überraschend – Holz als Zeit: Jahresringe wachsen beim Scrollen, große Farbflächen wie gebeizte Bretter; warm durch Ocker und Moos, präzise durch exakt gesetzte Ringe.
- Leitsatz: Holz ist gewachsene Zeit – die Seite zeigt sie als Jahresringe, die mit jedem Abschnitt wachsen.
- Standardlösung der Branche: Werkstattfoto über die volle Breite mit weißem Satz darauf, darunter drei Leistungskarten mit Symbolen – hier gibt es weder Foto noch Karten: große einfarbige Flächen, ein wachsendes Ringmotiv und Schrift als Bild.
- Farbwelt: Moosgrün `#2E4527` (Fläche 1), Ocker `#C8962B` (Fläche 2), Holzrot `#6E2A1C` (Fläche 3), Leinen `#F7F1E3` (Text auf dunkel, Pausenfläche), Tinte `#1A1A16` (Text auf hell)
- Schrift: Überschriften `@fontsource/young-serif` in sehr großen Graden als Bildfläche, Text `@fontsource-variable/instrument-sans` (400/600)
- Erster Bildschirm: Moosgrün über den ganzen Bildschirm, das Wort „Kernholz“ füllt die Breite in Leinen, darüber wachsende Jahresringe als SVG; nur Name und Menüknopf oben, „Anfrage stellen“ als großer Leinen-Knopf unten links
- Abfolge: jede Leistung eine eigene Farbfläche über einen Bildschirm (Moos, Ocker, Holzrot) mit einem Satz und dem Bildersatz-Muster → Ablauf als vier Ringe, die nacheinander dazukommen → Holz und Werkstatt auf Leinen → Fragen → Aufruf auf Holzrot
- Bewegung: Die Jahresringe wachsen mit dem Scrollweg (SVG, `transform: scale`), Farbflächen gleiten ein (`gleiten`); bei „Bewegung reduzieren“ stehen alle Ringe fertig da
- Tonfall: „Holz wächst langsam. Ihr Möbel darf es auch.“
- Verbote: keine Maßlinien und Stücklisten (A), keine schrägen Gehrungskanten, keine dunkle Räuchereiche, keine feste Leiste unten (B), keine Kopfzeile mit sichtbaren Links
- Referenzseite: `docs/design-bibliothek/referenzen/grundwerk-legal/` – Wortbild aus Schrift ersetzt das Foto, kräftige Vollflächen
- Vorlage: `docs/design-bibliothek/figma.md` – schwarz-weißer Rahmen mit übergroßen farbigen Flächen je Abschnitt, runde Knöpfe, großzügige Abstände
- Kopfzeile, Fußleiste, Formen, Knöpfe: nur Name und Menüknopf · Fuß als große Holzrot-Abschlussfläche mit Anfrage, darunter klein das Rechtliche · Bögen und Ringe · runder Leinen-Knopf mit Pfeil
- Achsen: komposition=freie-abschnitte · farbwelt=grosse-farbflaechen · schrift=schrift-als-bild · element=bewegte-grafik · dichte=luftig-gleichmaessig · kopfzeile=nur-menue · bildersatz=muster · fussleiste=abschlussflaeche-mit-aktion · formen=organisch-boegen · knoepfe=rund-mit-pfeil · effekte=scroll-gesteuert · flaechen=einfarbig · abschnitte=jeder-abschnitt-eigen
