# Fehler 8 · Neues Paket ohne Freigabe

Wegwerf-Branch `wegwerf-08` (lokal, Commit 3891b8c), nach dem Beleg gelöscht. Dreifach gesperrt: Hook beim Installieren, Hook beim Bearbeiten von package.json, Paket-Prüfung in Schnellprüfung und GitHub Actions (falls ein anderes Werkzeug das Paket an den Hooks vorbei einträgt).

## Eingebauter Fehler
```diff
-    "motion": "^14.9.1"
+    "motion": "^14.9.1",
+    "left-pad": "1.3.0"
```

## Prüfbericht (Ausgaben)
```
$ Hook paket-sperre bei: npm install left-pad@1.3.0
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Paket left-pad@1.3.0 ist nicht freigegeben. Ohne das Paket bauen oder im Report melden: „offen: braucht PAKET-FREIGABE left-pad@<version> <Lizenz>“. Nicht warten."}}

$ Hook paket-sperre bei: Write package.json mit left-pad in dependencies
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Nicht freigegebene Pakete in package.json: left-pad@1.3.0. Ohne sie bauen oder als „offen: braucht PAKET-FREIGABE …“ melden."}}

$ node scripts/pakete.mjs .   (Schritt der Schnellprüfung und von GitHub Actions)
muss: Paket ohne Freigabe: left-pad@1.3.0 (Ahmad gibt frei mit „PAKET-FREIGABE: left-pad@1.3.0 <Lizenz>“)
PAKETE ROT (1)
Exit 1
```
