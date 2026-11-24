// Ein End-zu-End-Prüfschritt je Feature (aus der Spezifikation). Zusammen mit kern.spec.ts höchstens 10 Tests.
import { expect, test } from "@playwright/test";

test("Startseite: Link bei Innenausbau führt zur Leistungen-Seite", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Mehr zu Innenausbau" }).click();
  await expect(page).toHaveURL(/\/leistungen\/#innenausbau$/);
  await expect(page.getByRole("heading", { name: "Innenausbau", level: 2 })).toBeVisible();
});

test("Anfrage: leer absenden zeigt Hinweis, ausgefüllt erzeugt mailto-Link", async ({ page }) => {
  await page.goto("/anfrage/");
  await page.getByRole("button", { name: "Anfrage absenden" }).click();
  await expect(page.getByText("Bitte Ihren Namen angeben")).toBeVisible();
  await expect(page.getByLabel("Name")).toBeFocused();
  await page.getByLabel("Name").fill("Erika Muster");
  await page.getByLabel("E-Mail").fill("erika@beispiel.de");
  await page.getByLabel("Art des Vorhabens").selectOption("innenausbau");
  await page.getByLabel("Beschreibung").fill("Einbauschrank im Flur");
  await page.getByRole("button", { name: "Anfrage absenden" }).click();
  const href = await page.getByRole("link", { name: "E-Mail mit Ihren Angaben" }).getAttribute("href");
  expect(href).toContain("mailto:");
  expect(decodeURIComponent(href!)).toContain("subject=Anfrage: Innenausbau – Erika Muster");
});
