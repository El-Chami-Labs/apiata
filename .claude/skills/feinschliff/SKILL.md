---
name: feinschliff
description: Eine Liste kleiner Änderungen (Optik, Texte, Scrollwege, Effekte, auch kleine Logik) am Stück umsetzen, nach jeder Änderung Push, am Ende eine Prüfung.
disable-model-invocation: true
argument-hint: "<Änderung 1>; <Änderung 2>; …  [auf Branch <name>]"
---

Kein Interview: Ahmads Liste ist die Freigabe. Keine Spezifikation, keine Umwandlung in ein Feature.

1. Branch: der genannte (`git checkout -B <name> origin/<name>`) oder `git checkout -b feinschliff-<datum> origin/main`.
   `node scripts/status.mjs start feinschliff --features "<Ä1>;<Ä2>;…"`, dann `node scripts/status.mjs freigabe`.
2. Ein bauer bekommt die ganze Liste mit Übergabezettel: je Änderung umsetzen, `npm run build`, die eine betroffene
   Seite mit `node scripts/fotos.mjs` ansehen, einzeln committen und pushen (Ahmad sieht jede Änderung in der
   Vorschau), `node scripts/status.mjs feature "<Ä>" fertig`. Keine Schnellprüfung zwischen den Änderungen.
3. Danach einmal `node scripts/schnellpruefung.mjs`; rote Tests, die eine gewollte Änderung abbilden, passt der bauer
   an die Änderung an.
4. Ein pruefer über den ganzen Diff seit `origin/main` (Logik-Änderungen eingeschlossen). bauer behebt „muss“;
   höchstens eine Nachrunde nur auf die Änderung, bei sichtbaren Fehlern weitere, bis sie behoben sind.
5. Pull Request (oder Kommentar im bestehenden) mit Report nach `.claude/skills/autopilot-starten/report.md`, Liste der
   Änderungen mit je einem Commit-Link, `node scripts/status.mjs pr <link>`.
