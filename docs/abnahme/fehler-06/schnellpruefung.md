# Schnellprüfung wegwerf-06

2026-11-05T23:20:12.285Z · Ergebnis: ROT

- ok: build (2 s)
- ok: typen (4 s)
- ok: lint (1 s)
- muss: logik: ❯ tests/logik/anfrage.test.ts (7 tests | 1 failed) 10ms
- ok: datenschutz (0 s)
- ok: fakten (0 s)
- ok: pakete (0 s)
- muss: e2e: Anfrage: leer absenden zeigt Hinweis, ausgefüllt erzeugt mailto-Link [handy]: Error: expect(locator).toBeVisible() failed
- muss: e2e: Anfrage: leer absenden zeigt Hinweis, ausgefüllt erzeugt mailto-Link [desktop]: Error: expect(locator).toBeVisible() failed
- ok: messung (0 Tests, 3 s)

## logik

```
      Tests  1 failed | 6 passed (7)
   Start at  23:19:48
   Duration  177ms (transform 56%, import 20%, tests 17%, worker 6%)


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/logik/anfrage.test.ts > anfragePruefen > meldet leere Pflichtfelder einzeln
AssertionError: expected undefined to be 'Bitte Ihren Namen angeben' // Object.is equality

- Expected:
"Bitte Ihren Namen angeben"

+ Received:
undefined

 ❯ tests/logik/anfrage.test.ts:10:20
      8|   it("meldet leere Pflichtfelder einzeln", () => {
      9|     const f = anfragePruefen({ ...ok, name: " ", email: "", beschreibu…
     10|     expect(f.name).toBe("Bitte Ihren Namen angeben");
       |                    ^
     11|     expect(f.kontakt).toBeTruthy();
     12|     expect(f.beschreibung).toBeTruthy();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯
```

## e2e

```












[18/17] [layout] › tests/e2e/layout.spec.ts:7:3 › Layout 768 px
[19/17] [layout] › tests/e2e/layout.spec.ts:7:3 › Layout 1280 px

```
