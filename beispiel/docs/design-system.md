# Design-System

Status: gewählt

## Gewählt
- Vorschlag: b · Zuschnitt · Leitsatz: Jeder Abschnitt ist ein Zuschnitt: harte Kanten, Gehrungen, dunkles Holz neben hellem Span.
- Auftrag: `docs/design-richtungen/auftrag-b.md`
- Referenzseite (Aufbau, bauer und pruefer bei jedem sichtbaren Feature): `docs/design-bibliothek/referenzen/era-residence/`
- Vorlage (Werte, bauer und pruefer bei jedem sichtbaren Feature): `docs/design-bibliothek/bmw-m.md`
- Gemischt: nichts
- Gestaltungsstufe: 4 · Fotos: folgen später

## Tokens (Datei: `src/styles/tokens.css`)
| Token | Wert | Verwendung |
|---|---|---|
| `--eiche` | `#1e1813` | dunkle Flächen (Räuchereiche) |
| `--eiche-2` | `#2d241b` | dunkle Nebenflächen |
| `--span` | `#efe2c2` | helle Flächen (Hobelspan), Text auf dunkel nur `--kreide` |
| `--span-2` | `#dcc994` | helle Nebenflächen |
| `--kupfer` | `#b5651d` | Hauptaktion (große Schrift, Text `--eiche`), Linien, große Ziffern |
| `--kreide` | `#faf7f0` | Text auf dunklen Flächen |
| `--schrift-kopf` | Big Shoulders Display Variable 800, Versalien | Überschriften (`@fontsource-variable/big-shoulders-display`) |
| `--schrift-text` | IBM Plex Sans 400/600 | Fließtext (`@fontsource/ibm-plex-sans`) |
| `--rand` | 1,25 rem / bis 5 rem | Seitenrand Handy / Desktop |
| `--gehrung` | clamp(2,5 rem, 9 vw, 7 rem) | 45-Grad-Schnitt an Flächenwechseln |
| `--leiste` | 4,5 rem / 4 rem | Höhe der festen Leiste unten; Innenabstand unten am body mindestens so hoch |

## Bauteile
- Kopfzeile und Navigation: feste Leiste unten (Name, Sprungmarken am Desktop, Telefon, Knopf „Anfrage stellen“), keine Kopfzeile oben.
- Knöpfe: Kupfer, Versal-Kopfschrift 1,5 rem, eckig.
- Bildersatz (Machart): „Ausschnitt“ – Fläche mit großem Ausschnitt in zweitem Ton, je Stelle andere Form, Hinweis „Foto folgt: …“.
- Bewegung (ein Gedanke): Zuschnitt – Titel schieben sich wortweise ein (`woerter`), Ablauf bleibt stehen und wechselt Schritte (`stehen`).
