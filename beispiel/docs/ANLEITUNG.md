# Anleitung für Ahmad

Jeder Abschnitt ist ein Einfügetext (in Claude Code eintippen) oder ein Klickweg. Was in `<spitzen Klammern>` steht,
ersetzt du durch deinen Text.

**Fünf Wörter, die vorkommen:** *Repo* = der Projektordner bei GitHub. *Branch* = eine Arbeitskopie für eine Änderung,
die Hauptfassung heißt `main`. *Pull Request* = der Vorschlag, eine Arbeitskopie in die Hauptfassung zu übernehmen –
mit Vorschau-Link und Bericht; du übernimmst ihn mit „Merge“. *Worker* = der Name deiner Website bei Cloudflare.
*Subdomain* = dein Kontoname in der Vorschau-Adresse (`<name>.workers.dev`).

## 1. Neues Projekt aus der Vorlage anlegen
Einmalig im Kit-Repo: **Settings → General → „Template repository“ ankreuzen.**
Für jedes Projekt: Kit-Repo öffnen → grüner Knopf **„Use this template“ → „Create a new repository“** → Name eintragen
(klein, mit Bindestrich, z. B. `malerei-muster`) → **Private** → **Create repository**. Dann
**Settings → Actions → General → „Allow all actions“** prüfen.

## 2. Cloudflare verbinden (nur du kannst das)
[Stand 06.11.2026, Bezeichnungen im Dashboard können abweichen]
1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository** → GitHub verbinden → dein Repo wählen.
2. **Project name**: der Worker-Name aus dem Setup (steht in `projekt.json` bei `worker`).
3. **Build command**: `npm run build` · **Deploy command**: `npx wrangler deploy`.
4. **Save and Deploy.** Der erste Bau auf main wird rot; das ist richtig (die Unfertig-Sperre hält die unfertige Seite
   zurück).
5. Im Worker **Settings → Build → „Previews Base“ → „Builds for Preview branches“** einschalten. **Preview command**
   bleibt `npx wrangler preview` (Cloudflares Voreinstellung, nicht ändern).
6. **Settings → Domains → Worker URL** für **Production** und **Preview** einschalten.
7. Deine Subdomain steht unter **Workers & Pages → rechts „Subdomain“** (`<name>.workers.dev`). Hast du sie im Setup
   nicht gewusst, schreib im Chat: `Subdomain ist <name>`.

Danach baut Cloudflare jeden Branch selbst. Die Vorschau eines Branchs heißt
`https://<branch>-<worker>.<subdomain>.workers.dev`; Claude schreibt sie dir fertig in jeden Pull Request.

## 3. Projekt starten
Neue Claude-Code-Sitzung mit deinem Projekt-Repo öffnen, dann einfügen:
```
/setup-starten <was das Projekt ist, z. B. Website für meinen Malerbetrieb in Köln, Telefon 0221 …, Leistungen: …>
```

## 4. Interview beantworten
1. Claude bittet dich, dein Projekt zu beschreiben, am besten zu 10 Punkten (Name, Nutzer, wichtigste Dinge, Seiten,
   Hauptaktion, Fakten, Daten, Wirkung, Vorbilder, Besonderheiten). Antworte in normalem Text; ein fertiger Steckbrief
   geht auch.
2. Dann kommen Fenster mit Fragen, nur zu dem, was noch offen ist: zuerst die Projektart, dann Wichtigkeit, Technik,
   Inhalte, Gestaltung und Cloudflare. Je Frage ist der Vorschlag die erste Möglichkeit. Tippe **`ok`**, wenn alle
   Vorschläge passen.
3. Zum Schluss zeigt Claude eine Zusammenfassung mit jeder Antwort. Stimmt alles, tippe **`ok`**. Danach fragt Claude
   bis zum Ergebnis nichts mehr; nur die Gestaltungswahl kommt noch.

## 5. Gestaltungsvorschlag wählen
Du bekommst einen Link auf eine Seite mit drei Vorschlägen (Handy und Computer, ab Stufe 4 mit Bewegung). Antworte mit
dem Buchstaben, z. B. **`B`**, oder gemischt: **`B, aber die Schrift von A`**. **`keiner`** bringt drei neue.

## 6. Autopilot starten (neue Features)
```
/autopilot-starten <Feature 1>; <Feature 2>
```
Beispiel: `/autopilot-starten Anfrageformular mit Terminwunsch; Seite „So arbeiten wir“`. Bis zu 8 Features je Lauf;
weitere stehen im Bericht unter „Nächster Lauf“. Claude fragt nur, was die Liste offen lässt, zeigt eine
Zusammenfassung, und nach deinem **`ok`** kommt am Ende ein Pull Request mit Vorschau-Link und kurzem Bericht oben.

## 7. Autopilot fortsetzen (nach Abbruch)
Neue Sitzung im selben Repo, dann:
```
/autopilot-fortsetzen
```

## 8. Feinschliff (mehrere kleine Änderungen)
```
/feinschliff <Änderung 1>; <Änderung 2>; <Änderung 3>
```
Optional am Ende: `auf Branch <name>`. Jede Änderung ist nach wenigen Minuten in der Vorschau.

## 9. Fremden Branch prüfen
```
/pruefen <branchname>
```

## 10. Paket freigeben
Meldet ein Bericht „offen: braucht PAKET-FREIGABE …“, tippe die Zeile genau so in den Chat, z. B.:
```
PAKET-FREIGABE: zod@4.1.0 MIT
```

## 11. Fotos und Videos
Dateien in der Sitzung anhängen, dann: `/medien <wo sie hin sollen>`. Nie Fotos selbst bei GitHub hochladen.

## 12. Team holen (Projekt auf neue Kit-Version)
```
/team-holen https://github.com/El-Chami-Labs/dev-agents
```

## 13. Team verbessern
Neue Sitzung im **Kit-Repo**, dann:
```
/team-verbessern <Inhalt aus kit-feedback.md eines Projekts>
```

## Mergen
Pull Request öffnen → unten alle Haken grün → Vorschau angesehen → **„Merge pull request“** → **„Confirm merge“**.
Ein rotes Kreuz heißt: nicht mergen, Claude im Chat sagen: `Prüfung rot im Pull Request <Link>, bitte beheben`.
