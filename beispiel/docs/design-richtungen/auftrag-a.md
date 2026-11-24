# Richtungs-Auftrag A · Werkbank

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
- Rolle: sicher – präzise wie eine Werkzeichnung, warm durch helles Holz und ruhige Sprache, handwerklich durch Maßlinien und Fugen.
- Leitsatz: Die Seite ist eine Werkzeichnung: Maßlinien, Fugen und ein klarer Weg zum Möbel.
- Standardlösung der Branche: Werkstattfoto über die volle Breite mit weißem Satz darauf, darunter drei Leistungskarten mit Symbolen, Holzbraun und Beige – hier trägt eine Werkzeichnung mit Maßlinien die Seite, die Leistungen stehen als Zeilen wie in einer Stückliste.
- Farbwelt: Birkenweiß `#F2EEE4` (Grund), Nussbraun `#33251A` (Text), Tannengrün `#1F5C4A` (Hauptaktion, Maßlinien), Fugengrau `#C9C1B2` (Linien), Ahorn `#E3D3B5` (Wechselfläche)
- Schrift: Überschriften `@fontsource-variable/fraunces` (optische Größe hoch, Gewicht 500), Text `@fontsource-variable/work-sans` (400/600); große Rangfolge zwischen Titel und Text
- Erster Bildschirm: links zwei Drittel die Überschrift über drei Zeilen mit einer waagerechten Maßlinie samt Maßzahl „Platzhalter: Maß“ darunter, rechts ein Drittel Bildersatz (Schichten); Hauptaktion unter der Überschrift
- Abfolge: Leistungen als Stückliste mit Positionsnummern und feinen Linien → Ablauf in vier Schritten entlang einer senkrechten Maßlinie → Holz und Werkstatt halb Fläche, halb Bildersatz → Fragen als aufklappbare Liste → Aufruf auf Ahorn-Fläche
- Bewegung: Maßlinien zeichnen sich beim Erscheinen von links nach rechts (`maskieren`), der Bildersatz im Einstieg wandert beim Scrollen leicht (`ausschnitt`)
- Tonfall: „Möbel, die auf den Millimeter in Ihren Raum passen.“
- Verbote: kein Vollbild-Foto als Einstieg, keine Karten mit Symbolen, keine dunklen Flächen
- Referenzseite: `docs/design-bibliothek/referenzen/maison-seventy-seven/` – Abschnitte geteilt in schmale Textspalte und große Fläche, Farbwechsel je Abschnitt
- Vorlage: `docs/design-bibliothek/claude.md` – warme Cremefläche, Serifen-Überschriften mit ruhiger Grotesk, gedeckter Akzent nur für Aktionen, kleine Ecken, kaum Schatten
- Kopfzeile, Fußleiste, Formen, Knöpfe: Name mittig, Links darunter · Fuß zweizeilig mit Kontakt groß, darunter Rechtslinks · rechte Winkel ohne Rundung · Hauptaktion als gefüllte Tannengrün-Fläche
- Achsen: komposition=asymmetrisch · farbwelt=hell-warm · schrift=serife-und-grotesk · element=linien-und-raster · dichte=luftig-mit-verdichtung · kopfzeile=zentriert · bildersatz=schichten · fussleiste=zweizeilig-mit-kontakt · formen=eckig-hart · knoepfe=flaeche-voll · effekte=einblenden-beim-scrollen · flaechen=getoent-abschnittsweise · abschnitte=gleich-gebaut
