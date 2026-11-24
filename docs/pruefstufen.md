# Prüfstufen 1–5

Wert in `projekt.json` (`pruefstufe`), im Setup gefragt, jederzeit änderbar. Jede Stufe sagt nur, was zusätzlich
geprüft wird.

| Stufe | Wann | Zusätzlich |
|---|---|---|
| 1 Einfach | nur Ahmad sieht es | pruefer nur Oberfläche, Kurzblick auf Startseite und geänderte Seiten |
| 2 Intern | Bekannte sehen es | pruefer Oberfläche und Fehlerfall (leeres Formular, falsche Eingabe, Seite fehlt) |
| 3 Öffentlich | jeder sieht es | Impressum und Datenschutz Pflicht (Unfertig-Sperre); pruefer auch Code, wenn Logik geändert ist; neue Datenverarbeitung ohne Datenschutzerklärung ist „muss“; Zugänglichkeit (Kontrast, Tastatur, Alt-Texte, sichtbarer Fokus) ist „sollte“ |
| 4 Kunde | jemand zahlt | tester schreibt vorab Tests aus der Spezifikation; pruefer Code und Oberfläche immer; Zugänglichkeit ist „muss“ |
| 5 Höchste Sorgfalt | Geld, Daten, Gesundheit | wie 4, dazu eine kurze Risikoanalyse in der Spezifikation (was kann schiefgehen, wer ist betroffen, was schützt) und Ahmads ausdrückliche Abnahme im Pull Request |

In allen Stufen gleich: Kern-Tests, Layout-Wächter, Sicherheitsgrenzen, Sperrliste gegen KI-Einheitslook, sichtbare
Fehler werden behoben. Keine Stufe führt Budget-Sperren, Größen oder zusätzliche Runden ein.
