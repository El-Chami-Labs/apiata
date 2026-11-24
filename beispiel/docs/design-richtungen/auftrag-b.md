# Richtungs-Auftrag B · Zuschnitt

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
- Rolle: mutig – handwerklich durch harte Schnittkanten und Gehrungen, warm durch Räuchereiche und Kupfer, präzise durch exakte 45-Grad-Winkel.
- Leitsatz: Jeder Abschnitt ist ein Zuschnitt: harte Kanten, Gehrungen, dunkles Holz neben hellem Span.
- Standardlösung der Branche: Werkstattfoto über die volle Breite mit weißem Satz darauf, darunter drei Leistungskarten mit Symbolen – hier wechseln dunkle und helle Flächen mit schrägen Gehrungskanten, Schrift und Flächen überlappen.
- Farbwelt: Räuchereiche `#1E1813` (dunkle Flächen), Hobelspan `#EFE2C2` (helle Flächen), Kupfer `#B5651D` (Akzent, nur Linien und große Ziffern; Hauptaktion in Kupfer mit Text Räuchereiche, Kontrast prüfen), Kreideweiß `#FAF7F0` (Text auf dunkel)
- Schrift: Überschriften `@fontsource-variable/big-shoulders-display` (schmal, 800, Versalien), Text `@fontsource/ibm-plex-sans` (400/600)
- Erster Bildschirm: dunkle Fläche, übergroße schmale Überschrift über zwei Drittel der Breite, die rechts in eine schräg angeschnittene helle Fläche mit Bildersatz (Ausschnitt) hineinragt; unten eine feste Leiste mit „Anfrage stellen“ und Telefon „Platzhalter: Telefonnummer“
- Abfolge: Leistungen als drei große versetzte Zeilen mit Gehrungskante → Ablauf als vier Zuschnitt-Streifen mit großen Kupfer-Ziffern 1–4 → Holz und Werkstatt auf heller Fläche mit überlappendem Titel → Fragen → Aufruf auf dunkler Fläche
- Bewegung: Abschnitt „So entsteht Ihr Möbel“ bleibt stehen, die vier Schritte wechseln beim Scrollen (`stehen`); Titel schieben sich wortweise ein (`woerter`)
- Tonfall: „Wir schneiden zu, was es so nicht zu kaufen gibt.“
- Verbote: keine Maßlinien und Stücklisten (gehören A), keine zentrierte Kopfzeile, keine Serifenschrift, kein Birkenweiß
- Referenzseite: `docs/design-bibliothek/referenzen/era-residence/` – Abschnitte über wechselnde Grundflächen gliedern, Schrift und Flächen überlappen versetzt
- Vorlage: `docs/design-bibliothek/bmw-m.md` – fast schwarze Flächen, große Versal-Überschriften, sparsamer Farbakzent, harte Kanten, keine Schatten, kräftige Hauptaktion
- Kopfzeile, Fußleiste, Formen, Knöpfe: Leiste unten mit Name, Menü und Hauptaktion · Fuß als schmale Zeile mit Rechtslinks · schräge Gehrungskanten an Flächen und Knöpfen · Hauptaktion als breites Kupferband
- Achsen: komposition=rasterbruch-ueberlappung · farbwelt=hell-dunkel-wechsel · schrift=kondensiert-plakativ · element=geometrische-formen · dichte=wechselnd-laut-leise · kopfzeile=leiste-unten · bildersatz=ausschnitt · fussleiste=schmal-einzeilig · formen=schraeg-gehrung · knoepfe=gross-als-band · effekte=scroll-gesteuert · flaechen=einfarbig · abschnitte=wechselnd-zwei-arten
