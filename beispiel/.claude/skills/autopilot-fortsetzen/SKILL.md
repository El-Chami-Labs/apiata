---
name: autopilot-fortsetzen
description: Einen unterbrochenen Lauf (Setup, Autopilot, Feinschliff, Prüfen) in einer neuen Sitzung aus status.json weiterführen.
disable-model-invocation: true
argument-hint: "[Branch]"
---

1. `node scripts/laeufe.mjs` listet offene Läufe aller Branches. Ohne Angabe nimm den jüngsten.
2. `git fetch origin <branch>` und `git checkout -B <branch> origin/<branch>`.
3. `node scripts/status.mjs zeige` und `node scripts/status.mjs weiter`. Die Freigabe gilt weiter: keine neue Frage,
   außer die Phase ist `fragen` oder `wahl`.
4. Mach mit dem Skill der Art weiter (`setup` → `setup-starten`, `autopilot` → `autopilot-starten`, `feinschliff`,
   `pruefen`) ab dem Feature und Schritt, die `weiter` nennt. Fertige Features bleiben fertig; Spezifikation und
   Basis-Commit des laufenden Features stehen in `status.json`.
