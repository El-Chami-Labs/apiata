# Fehler wackelt · Absichtlich wackelnder Zeittest und rote Zeitmessung

Wegwerf-Branch `wegwerf-wackelt` (lokal, Commit 5675f17), nach dem Beleg gelöscht. Prüfbericht: [`schnellpruefung.md`](schnellpruefung.md).

## Eingebauter Fehler
```diff
+test("Startseite antwortet schnell (absichtlich wackelnd)", async ({ page }, info) => {
+  const t0 = Date.now();
+  await page.goto("/");
+  const grenze = info.retry === 0 ? 1 : 60_000; // erster Versuch scheitert sicher, die Wiederholung besteht
+  expect(Date.now() - t0).toBeLessThan(grenze);
+});
+import { expect, test } from "@playwright/test";
+test("Startseite in unter 1 ms geladen (Messung)", async ({ page }) => {
+  const t0 = Date.now();
+  await page.goto("/");
+  expect(Date.now() - t0).toBeLessThan(1);
+});
```

## Ergebnis
```
wackelt: e2e: Startseite antwortet schnell (absichtlich wackelnd) [handy] (grün in der Wiederholung, blockiert nicht)
wackelt: e2e: Startseite antwortet schnell (absichtlich wackelnd) [desktop] (grün in der Wiederholung, blockiert nicht)
gemeldet: messung: Startseite in unter 1 ms geladen (Messung) [messung]: Error: expect(received).toBeLessThan(expected)
SCHNELLPRÜFUNG GRÜN → docs/abnahme/fehler-wackelt/schnellpruefung.md
Exit 0
```
