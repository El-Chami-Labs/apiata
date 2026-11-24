---
name: team-verbessern
description: Im Kit-Repo – Beobachtungen aus kit-feedback.md in genau die betroffenen Zeilen einarbeiten, Kit-Test grün, Pull Request.
disable-model-invocation: true
argument-hint: "[Text aus kit-feedback.md eines Projekts]"
---

1. Nur im Kit-Repo (es hat `scripts/kit-test/`). `git checkout -b kit-<nächste-version> origin/main`. Kein
   `laeufe/` im Kit-Repo: Belege stehen nur in der Pull-Request-Beschreibung.
2. Je Beobachtung: die eine Regel, das Skript oder den Hook finden, der sie behebt. Lieber ein Skript, ein Hook oder
   Frontmatter als neuer Regeltext. Eine Prüfung ersetzt nie eine andere; neue kommen dazu. Jede Änderung ersetzt
   oder ergänzt genau die betroffene Zeile; keine Begründung, keine Versionsgeschichte im Text.
3. Für jedes neue Verhalten ein Fall im Kit-Test. `node --test scripts/kit-test/*.test.mjs` und
   `node scripts/aufraeumen.mjs` müssen grün sein. Braucht eine neue
   Funktion mehr Wörter, steigt der Wert in `docs/wortzahl.json`.
4. `KIT-VERSION` erhöhen, in `CHANGELOG.md` eine Zeile `<version>: <was>` ohne Begründung. Erledigte Zeilen aus
   `kit-feedback.md` löschen. Je erledigte Beobachtung ein Eintrag in `kit-erledigt.json` (Version, Datum des Merges,
   Merkmal-Gruppen, die in der Zeile des Projekts vorkommen).
5. Zuletzt das Beispiel auf den Kit-Stand bringen: `node scripts/kit-holen.mjs . beispiel --ohne-referenzbilder`, dann
   Kit-Test und Aufräum-Wächter erneut grün.
6. Pull Request mit Liste der Änderungen und den Belegen (letzte Zeilen von Kit-Test und Aufräum-Wächter).
