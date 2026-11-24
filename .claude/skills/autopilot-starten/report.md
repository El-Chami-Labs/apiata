# Vorlage Report (Beschreibung des Pull Requests)

Der obere Teil passt auf eine Bildschirmseite. Einfache Worte, Links fertig zum Antippen.

```markdown
**Vorschau:** <Link aus node scripts/vorschau-link.mjs>

**Gebaut:** <ein bis drei Sätze>

**Bitte ansehen:**
1. <vollständige Vorschau-Adresse der Seite, z. B. https://…workers.dev/leistungen/> – <worauf achten>

**Offen:** <Liste oder „nichts“>  ·  **Annahmen:** <Liste oder „keine“>

**GitHub-Haken:** <letzte Zeile von `node scripts/actions.mjs --warten`, z. B. „ACTIONS GRÜN (abc1234)“>

**Nächster Lauf:** <Features über 8 aus `naechsterLauf` in `status.json` oder „nichts“>

**Nächster Schritt:** <genau einer, z. B. „Vorschau ansehen, dann Merge-Knopf“>

---
<details><summary>Details</summary>

- Prüfberichte: <Pfade laeufe/<branch>/pruefung-*.md>, Schnellprüfung: <Pfad>
- Tests: <Zeile aus node scripts/zeilen.mjs>; wackelt: <Liste oder „nichts“>
- Zeiten: <Ausgabe von node scripts/status.mjs zeiten>
- Rückfragen nach der Freigabe: 0
</details>
```
