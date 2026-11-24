// Layout-Wächter: jede Seite in 390, 768 und 1280 px.
import { expect, test } from "@playwright/test";
import { BREITEN, layoutPruefen } from "../../scripts/layout-waechter.mjs";
import { seiten } from "./hilfen";

for (const breite of BREITEN) {
  test(`Layout ${breite} px`, async ({ page }) => {
    const alle = seiten();
    test.setTimeout(30_000 + alle.length * 10_000);
    const befunde: string[] = [];
    for (const s of alle) befunde.push(...(await layoutPruefen(page, s, breite)));
    expect(befunde, befunde.join("\n")).toEqual([]);
  });
}
