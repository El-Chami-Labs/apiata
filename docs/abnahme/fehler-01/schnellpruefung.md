# Schnellprüfung wegwerf-01

2026-11-05T23:19:14.302Z · Ergebnis: ROT

- ok: build (2 s)
- ok: typen (4 s)
- ok: lint (1 s)
- ok: logik (1 s)
- ok: datenschutz (0 s)
- ok: fakten (0 s)
- ok: pakete (0 s)
- muss: e2e: Hauptaktion auf jeder Seite da und an keiner Scrollposition verdeckt [handy]: Error: / bei 60 %: feste Hauptaktion verdeckt von a.chat-blase
- ok: messung (0 Tests, 2 s)

## e2e

```


[7/17] [handy] › tests/e2e/kern.spec.ts:57:1 › Impressum und Datenschutz im Fuß jeder Seite verlinkt
[8/17] [handy] › tests/e2e/kern.spec.ts:68:1 › Navigation führt zu Seiten mit genau einer Hauptüberschrift
[9/17] [desktop] › tests/e2e/ablauf.spec.ts:4:1 › Startseite: Link bei Innenausbau führt zur Leistungen-Seite
[10/17] [desktop] › tests/e2e/ablauf.spec.ts:11:1 › Anfrage: leer absenden zeigt Hinweis, ausgefüllt erzeugt mailto-Link
[11/17] [desktop] › tests/e2e/kern.spec.ts:7:1 › Seiten laden ohne Konsolenfehler
[12/17] [desktop] › tests/e2e/kern.spec.ts:16:1 › keine kaputten internen Links
[13/17] [desktop] › tests/e2e/kern.spec.ts:28:1 › Hauptaktion auf jeder Seite da und an keiner Scrollposition verdeckt
[14/17] [desktop] › tests/e2e/kern.spec.ts:57:1 › Impressum und Datenschutz im Fuß jeder Seite verlinkt
[15/17] [desktop] › tests/e2e/kern.spec.ts:68:1 › Navigation führt zu Seiten mit genau einer Hauptüberschrift
[16/17] [layout] › tests/e2e/layout.spec.ts:7:3 › Layout 390 px
[17/17] [layout] › tests/e2e/layout.spec.ts:7:3 › Layout 768 px
[18/17] [layout] › tests/e2e/layout.spec.ts:7:3 › Layout 1280 px

```
