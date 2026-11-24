# 1 · Seite „Leistungen“
Ziel: Besucher sehen auf einer eigenen Seite, was die Tischlerei macht, und kommen von dort zur Anfrage.
Normalfall: `/leistungen/` zeigt die drei Leistungen (Möbel nach Maß, Innenausbau, Reparatur und Restaurierung) ausführlicher als die Startseite: je Leistung ein Abschnitt mit kurzer Beschreibung, drei bis vier typischen Beispielen als Liste, Bildersatz „Ausschnitt“ und einem Satz „So läuft es ab“. Die Leiste verlinkt „Leistungen“ auf diese Seite; die Startseite verlinkt jede Leistung dorthin (`/leistungen/#<leistung>`).
Fehlerfall: Ohne JavaScript und mit „Bewegung reduzieren“ alles sichtbar; Sprungmarken funktionieren auch beim direkten Aufruf.
Nicht im Umfang: Preise, Referenzprojekte, Fotos.
Betroffene Dateien: neu `src/pages/leistungen.astro`, `src/layouts/Grund.astro` (Navigation), `src/pages/index.astro` (Links), ggf. `src/komponenten/`.
Sichtbar: ja
Tests: keine
Datenverarbeitung: keine
Abnahmekriterien:
1. `/leistungen/` zeigt alle drei Leistungen im Stil des Design-Systems (Gehrungen, Flächenwechsel), auf Handy und Computer ohne Überlappung oder abgeschnittenen Text.
2. Jede Leistung hat einen eigenen Anker (`#moebel`, `#innenausbau`, `#reparatur`), die Startseite verlinkt dorthin.
3. „Anfrage stellen“ ist auf der Seite immer erreichbar (Leiste) und am Ende jeder Leistung als Textlink.
4. Keine erfundenen Fakten: Maße, Dauer, Preise nur als „Platzhalter: …“.
End-zu-End-Prüfschritt: Startseite öffnen, bei „Innenausbau“ auf den Link tippen, auf `/leistungen/#innenausbau` landen und die Überschrift „Innenausbau“ sehen.
Annahmen: Beispiele je Leistung sind branchentypisch und ohne Zahlen.
