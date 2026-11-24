---
name: medien
description: Fotos und KI-Videos des Nutzers aufbereiten und selbst gehostet einbinden; Originale nie ins Repo.
disable-model-invocation: true
argument-hint: "[wo die Bilder hin sollen]"
---

1. Ahmads Dateien aus der Sitzung nach `medien-eingang/` kopieren (steht in `.gitignore`). Nie über GitHub hochladen
   lassen, nie Originale committen.
2. `node scripts/medien.mjs --quelle "<Herkunft, z. B. eigene Aufnahme, KI-Video aus …>"`. Fehlt ffmpeg: im Report
   „offen: Medien nicht aufbereitet, ffmpeg fehlt“.
3. Einbinden: Fotos mit `srcset` (960 und 1920), `alt`-Text, festem Seitenverhältnis; Videos mit `<video muted
   playsinline loop poster="…-standbild.webp">`, MP4 und WebM, ohne Autoplay bei „Bewegung reduzieren“. Den
   Bildersatz an der Stelle ersetzen.
4. Committen nur `public/medien/` (einzeln benannt) samt `QUELLEN.md`. Fremde Server nie einbinden.
