# 1 · Gewählte Gestaltung auf die echten Seiten übertragen
Ziel: Die Website zeigt Vorschlag B „Zuschnitt“ als echte Startseite, mit gemeinsamem Rahmen für alle Seiten.
Normalfall: Startseite `/` zeigt den Inhalt von `/gestaltung/b/`; Impressum, Datenschutz und 404 nutzen denselben Rahmen (feste Leiste unten mit „Anfrage stellen“, Fuß mit Impressum und Datenschutz).
Fehlerfall: Ohne JavaScript und mit „Bewegung reduzieren“ ist alles sichtbar; unbekannte Adresse zeigt die 404-Seite im selben Rahmen mit Weg zur Startseite.
Nicht im Umfang: Seite Leistungen und das Anfrageformular (folgen im Lauf). `/anfrage/` gibt es als schlichte Seite im Rahmen mit „Platzhalter: Anfrageformular folgt“ und Telefon „Platzhalter: Telefonnummer“, damit kein Link ins Leere führt.
Betroffene Dateien: `src/layouts/Grund.astro`, `src/pages/index.astro`, neu `src/pages/anfrage.astro`, `src/pages/impressum.astro`, `src/pages/datenschutz.astro`, `src/pages/404.astro`, `src/styles/`, neu `src/komponenten/`; entfernen: `src/pages/gestaltung/`, `src/gestaltung/`, `public/gestaltung/`.
Sichtbar: ja
Tests: keine
Datenverarbeitung: keine
Abnahmekriterien:
1. Die Startseite sieht aus wie Vorschlag B (Bilder `laeufe/setup/bilder/vorschlag-b/`), auf Handy und Computer.
2. Jede Seite hat die feste Leiste mit „Anfrage stellen“ (Link `/anfrage/`), die am Seitenende nichts verdeckt.
3. Impressum und Datenschutz sind im Fuß jeder Seite verlinkt und im selben Stil lesbar gesetzt.
4. Es gibt keine Entwurfsseiten mehr unter `/gestaltung/`.
End-zu-End-Prüfschritt: Startseite öffnen, ganz nach unten scrollen, im Fuß „Impressum“ antippen, dort „Anfrage stellen“ in der Leiste sehen.
Annahmen: Sprungmarken der Leiste zeigen auf Abschnitte der Startseite (`/#leistungen` …), bis eigene Seiten entstehen.
