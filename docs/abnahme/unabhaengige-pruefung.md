# Unabhängige Prüfung (zwei Runden)

Ein frischer Prüfer (Opus), der den Bau nicht kannte, prüfte das Kit gegen den Auftrag, auch gegen „Aufbau und
Lesedisziplin“ und „Was das Kit NICHT hat“. Er änderte nichts und versuchte selbst Umgehungen der Hooks.

## Runde 1: 4 muss · 5 sollte · 6 kann
| Befund | Einstufung | Ergebnis |
|---|---|---|
| Grenzen umgehbar: `HEAD:heads/main`, `-Bmain`, `--force-create=main`, GraphQL-Merge | muss | behoben, Kit-Test |
| pruefer kann schreiben: `>\|`, `find -delete/-exec`, `awk`, `sort -o`, `npx astro add`, Test-Aktualisierung | muss | behoben, Kit-Test |
| Alias-Pakete `astro@npm:evil`, Optionen vor `install`, Tippformen | muss | behoben, Kit-Test |
| Lesebudget: Pflichtlektüre des bauer nicht gezählt (rund 3.750 Wörter) | muss | behoben: deutsche Kurzfassung von frontend-design, Kit-Test zählt Pflichtlektüre + Pauschale |
| Lauf-Ende: Schutz nur über `status.json` | sollte | behoben: Fortschritt auch über Commit und geänderte Dateien |
| `.env` nicht ignoriert, nicht gesperrt | sollte | behoben: `.gitignore`, Hook sperrt Stagen von `.env*`, `*.pem`, `*.key` |
| Beleg „Rückfragen 0“ zu stark formuliert | sollte | umformuliert in `ergebnis.md` |
| Report-Links nicht antippbar, Zeiten „läuft“ | sollte | Vorlage und Beispiel-Reports korrigiert, `status.mjs zeiten` rechnet laufende Phasen |
| Fachbegriffe in der Anleitung | sollte | Erklärung der fünf Wörter am Anfang |
| „veraltete“, Begründung im tester, `--allow-empty`, `--art` im Setup, „confirm with the client“, Kit-Adresse | kann | alle behoben |

## Runde 2: 4 muss · 3 sollte · 2 kann
Runde-1-Befunde: Lesebudget und Alias-Pakete bestätigt behoben; Grenzen und Schreibschutz „teilweise“.
| Befund | Einstufung | Ergebnis |
|---|---|---|
| GraphQL-Merge aus Datei (`-F query=@…`, `--input`, `$(cat …)`) | muss | behoben: `gh api` nur lesend (GET ohne Felder), GraphQL nur inline ohne `mutation`; Kit-Test |
| Test-Aktualisierung mit `=`-Form, über `npm run … --`, `--fix` | muss | behoben; Kit-Test |
| `npm install-test` / `npm it` installieren beliebige Pakete | muss | behoben; Kit-Test |
| `git diff --output=<datei>` überschreibt Dateien | muss | behoben (`--output`, `--fix`, `--write` für den pruefer gesperrt); Kit-Test |
| Weitere Paket-Wege (`npx -- astro add`, `astro@latest add`, `npm create/init`, `dlx`, `bunx`, `--prefix`) | sollte | behoben; Kit-Test |
| Weitere Grenzen-Wege (`gh -R … pr merge`, `--method=PATCH`, Secrets, Dispatch, `wrangler@3`, `npm exec wrangler`, `run-script deploy`, `-c alias.`, `$b`) | sollte | behoben; Kit-Test |
| `git push origin @` auf main | sollte | behoben; Kit-Test |
| `git reset @~1`, `ORIG_HEAD` | kann | behoben; Kit-Test |
| Pauschale von 1.100 Wörtern für Projektdateien ist geschätzt | kann | offen, als Annahme |

Belege, Zeiten und „Was das Kit NICHT hat“: in beiden Runden ohne Befund. Eine dritte Runde fand nicht statt (Auftrag:
höchstens zwei). Die Korrekturen aus Runde 2 sind durch den Kit-Test belegt, nicht durch einen weiteren Prüfer.

Grenze der Hooks [Einschätzung]: Ein Zerleger für Shell-Befehle bleibt eine Annäherung. Die zweite Schicht ist die
Erlaubnisliste mit `dontAsk` (Unerlaubtes wird ohne Frage abgelehnt); die dritte sind die GitHub-Prüfungen.
Empfehlung: in GitHub für `main` „Require a pull request before merging“ einschalten.
