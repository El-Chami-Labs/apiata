# Abnahmelauf · Ergebnis (Kit 3.0.0)

Beispielprojekt `beispiel/`: Website „Tischlerei Kernholz“ (ausgedacht), Prüfstufe 3, Gestaltungsstufe 4. Gespielt:
Setup mit Gestaltungswahl, ein Lauf mit 2 Features, ein Feinschliff mit 3 Optik-Änderungen. Ahmads Antworten:
`docs/abnahme/setup-antworten.md`, `beispiel/laeufe/lauf-1/fragenblock.md`. Gewählt: Vorschlag B „Zuschnitt“.
Danach jeder Fehler einzeln auf einem Wegwerf-Branch (lokal, nach dem Beleg gelöscht).

## Fehler gefunden?

| Nr | Eingebauter Fehler | gefunden | von | Beleg (Bericht) | Zitat der muss-Einstufung |
|---|---|---|---|---|---|
| 1 | Hauptaktion am Handy an einer Scrollposition verdeckt | ja (2. Versuch*) | Kern-Test | `fehler-01/schnellpruefung.md` | „muss: e2e: Hauptaktion … [handy]: Error: / bei 60 %: feste Hauptaktion verdeckt von a.chat-blase“ |
| 2 | Impressum-Link fehlt im Fuß | ja | Kern-Test | `fehler-02/schnellpruefung.md` | „muss: e2e: Impressum und Datenschutz im Fuß jeder Seite verlinkt [handy]: Error: /: impressum fehlt im Fuß“ |
| 3 | Konsolenfehler auf einer Seite | ja | Kern-Test | `fehler-03/schnellpruefung.md` | „muss: e2e: Seiten laden ohne Konsolenfehler [handy]: … /leistungen/: Cannot read properties of undefined (reading 'start')“ |
| 4 | Kaputter interner Link | ja | Kern-Test | `fehler-04/schnellpruefung.md` | „muss: e2e: keine kaputten internen Links [handy]: Error: 404 …/fragen-und-antworten/“ |
| 5 | Waagerechtes Scrollen am Handy | ja | Layout-Wächter | `fehler-05/schnellpruefung.md` | „muss: e2e: Layout 390 px [layout]: … waagerechtes Scrollen: Seite 544 px bei 390 px Fenster“ |
| 6 | Rückschritt: Pflichtfeld Name im Anfrageformular kaputt | ja | Logik-Test + Ablauf-Test | `fehler-06/schnellpruefung.md` | „muss: logik: tests/logik/anfrage.test.ts (7 tests \| 1 failed)“; „muss: e2e: Anfrage: leer absenden zeigt Hinweis … failed“ |
| 7 | Erfundener Fakt ohne „Platzhalter: …“ | ja | Fakten-Skript | `fehler-07/schnellpruefung.md` | „muss: fakten: möglicher erfundener Fakt … Telefon „0341 2345678““; „… Zahl „300 zufriedene““ |
| 8 | Neues Paket ohne Freigabe | ja | Hook (2×) + Paket-Prüfung | `fehler-08/pruefung.md` | „permissionDecision: deny … Paket left-pad@1.3.0 ist nicht freigegeben“; „muss: Paket ohne Freigabe: left-pad@1.3.0“ |
| 9 | Hässlicher Fehler (Neon-Kante, grauer Kasten, Ziffer „0“) | ja | pruefer, blind, mit dem Auge | `fehler-09/pruefbericht.md` | „muss: Startseite – neongrüner Balken (#39ff14, 3rem) … harte Farbkante“; „muss: … grauer Kasten“; „muss: … verirrte Ziffer „0““ |
| 10 | Abschnitt im KI-Einheitslook | ja | pruefer, blind, Sperrliste | `fehler-10/pruefbericht.md` | „muss: … neuer Abschnitt … ist austauschbarer KI-Einheitslook, sieben Treffer der Sperrliste“ |
| 11 | Zwei fast gleiche Gestaltungsvorschläge | ja | Achsen-Skript | `fehler-11/pruefung.md` | „muss: auftrag-a und auftrag-b zu ähnlich: nur 2 von 7 Achsen verschieden“ |
| 12 | Google-Fonts-Einbettung | ja | Fremdquellen-Skript | `fehler-12/schnellpruefung.md` | „muss: datenschutz: … Google Fonts eingebunden (Schriften selbst hosten mit @fontsource)“ |

\* Fehler 1, erster Versuch: Der Störer lag in einem Abschnitt mit `isolation: isolate` und verdeckte den Knopf tatsächlich
nicht (Screenshot und `elementFromPoint` belegen das); die Prüfung war zu Recht grün. Zweiter Einbau (Chat-Blase
zwischen 30 und 70 % Scrollweg) wurde gefunden. Im Lauf habe ich zusätzlich den Kern-Test „Hauptaktion“ präzisiert,
weil er Inhalt, der unter die mitlaufende Leiste scrollt, fälschlich als verdeckt meldete (`docs/annahmen.md`, Nr. 8).

Zu 9: Der pruefer fand die Ziffer „0“ im Ganzseitenbild nur als „winzigen Fleck“ und bestätigte sie im Quelltext –
das Auge allein hätte sie knapp verpasst.

## Blockiert nicht / endet nicht vor dem Pull Request

| Nachweis | Ergebnis | Beleg |
|---|---|---|
| Absichtlich wackelnder Zeittest (Kern-Projekt) | „wackelt: … (grün in der Wiederholung, blockiert nicht)“, Schnellprüfung **GRÜN**, Exit 0 | `fehler-wackelt/schnellpruefung.md` |
| Rote Zeitmessung (Projekt `messung`) | „gemeldet: messung: Startseite in unter 1 ms geladen …“, blockiert nicht; in GitHub Actions `continue-on-error` | `fehler-wackelt/schnellpruefung.md`, `.github/workflows/pruefung.yml` |
| Lauf endet nicht vor dem Pull Request | Stop-Hook antwortet `{"decision":"block" …}` ohne PR, lässt nach `status.mjs pr` anhalten | `lauf-ende/ausgabe.txt`, Kit-Test „Lauf endet nicht vor dem Pull Request“ |
| Keine Rückfrage nach der Freigabe | Frage-Sperre lehnt Fragen nach der Freigabe ab | `frage-sperre/ausgabe.txt` |

## Zeiten (aus `status.json`)

| Ablauf | Dauer | Quelle |
|---|---|---|
| Gestaltungswahl (Aufträge, 3 Vorschläge parallel gebaut, fotografiert, Vorschau-Seite) | 8,7 min | `beispiel/laeufe/setup/status.json`, Phase `gestaltung` |
| Setup gesamt (inkl. Übertragen, Prüfung, 1 Nachbesserung) | 18,8 min | dieselbe Datei |
| Lauf mit 2 Features (Leistungen, Anfrageformular) inkl. je 2 Prüfrunden | 15,6 min | `beispiel/laeufe/lauf-1/status.json` |
| Feinschliff mit 3 Optik-Änderungen inkl. Prüfung | 3,0 min (Änderungen nach 0,8 / 0,9 / 1,3 min fertig) | `beispiel/laeufe/feinschliff-1/status.json` |
| Rückfragen nach der Freigabe | 0 – nach `status.mjs freigabe` stellte keine Rolle eine Frage (Verlauf dieser Bau-Sitzung); dass das Fragewerkzeug danach gesperrt ist, belegt `frage-sperre/ausgabe.txt`. Der Fragenblock selbst war gespielt, nicht über das Fragewerkzeug gestellt (`status.json`: `fragen` 0). | `frage-sperre/ausgabe.txt` |

Die Zeiten enthalten nicht Ahmads Antwortzeit im Fragenblock und bei der Wahl (beides gespielt) und keinen
Cloudflare-Build.

## Vorschläge der Gestaltungswahl
`docs/abnahme/vorschlaege/vorschlag-<a|b|c>-<390|1280|390-ganz|1280-bildfolge>.png` – A „Werkbank“ (sicher),
B „Zuschnitt“ (mutig, gewählt), C „Jahresringe“ (überraschend).

## Was der Abnahmelauf am Kit verbessert hat
- Shell-Zerleger der Hooks: Heredoc-Inhalte, `2>&1` und Zeilenumbrüche (eine echte Lücke: mehrzeilige Befehle umgingen
  die Grenze) – jeweils mit Kit-Test.
- Workflows: `hashFiles()` auf Job-Ebene ist ungültig, ersetzt.
- `actions.mjs` liest über `gh api` (Node-`fetch` geht nicht über den Proxy der Cloud-Umgebung).
- Layout-Wächter: Text nur für Screenreader und geschlossene Fragen sind nicht sichtbar (vorher Fehlalarm, der den
  bauer zu schlechterer Zugänglichkeit drängte).
- Kern-Test „Hauptaktion“ präzisiert; Lizenz-Ausnahme für Astros Bildwerkzeug (LGPL, nur beim Build).
- Offen in `beispiel/kit-feedback.md`: Wortzerfall in großen Titeln erkennt nur der pruefer; zwei pruefer-Durchgänge
  urteilten über denselben Stand verschieden.
