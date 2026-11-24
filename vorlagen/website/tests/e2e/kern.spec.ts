// Kern-Tests (höchstens 10 mit ablauf.spec.ts): laufen auf Handy und Desktop gegen den lokalen Build.
import { expect, test } from "@playwright/test";
import { projekt, seiten } from "./hilfen";

const alle = seiten();

test("Seiten laden ohne Konsolenfehler", async ({ page }) => {
  const fehler: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") fehler.push(`${page.url()}: ${m.text()}`); });
  page.on("pageerror", (f) => fehler.push(`${page.url()}: ${f.message}`));
  page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith("http://127.0.0.1")) fehler.push(`${r.status()} ${r.url()}`); });
  for (const s of alle) await page.goto(s, { waitUntil: "networkidle" });
  expect(fehler, fehler.join("\n")).toEqual([]);
});

test("keine kaputten internen Links", async ({ page, request }) => {
  const links = new Set<string>();
  for (const s of alle) {
    await page.goto(s);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => (a as HTMLAnchorElement).href));
    for (const h of hrefs) if (h.startsWith("http://127.0.0.1")) links.add(h.split("#")[0]);
  }
  const kaputt: string[] = [];
  for (const l of links) { const r = await request.get(l); if (r.status() >= 400) kaputt.push(`${r.status()} ${l}`); }
  expect(kaputt, kaputt.join("\n")).toEqual([]);
});

test("Hauptaktion auf jeder Seite da und an keiner Scrollposition verdeckt", async ({ page }) => {
  const selektor = projekt.hauptaktion?.selektor;
  test.skip(!selektor, "projekt.json: hauptaktion fehlt");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const befunde: string[] = [];
  for (const s of alle) {
    await page.goto(s);
    if ((await page.locator(selektor!).count()) === 0) { befunde.push(`${s}: Hauptaktion fehlt`); continue; }
    for (const anteil of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
      const befund = await page.evaluate(({ sel, a }) => {
        scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * a, behavior: "instant" });
        const fest = (el: Element) => { for (let e: Element | null = el; e; e = e.parentElement) if (["fixed", "sticky"].includes(getComputedStyle(e).position)) return true; return false; };
        const name = (el: Element) => `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""}`;
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.top < 0 || r.bottom > innerHeight || getComputedStyle(el).visibility === "hidden") continue;
          const oben = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (!oben || el.contains(oben) || oben.contains(el)) continue;
          if (fest(el)) return `feste Hauptaktion verdeckt von ${name(oben)}`;
          if (!fest(oben)) return `Hauptaktion verdeckt von ${name(oben)}`;
        }
        return "";
      }, { sel: selektor!, a: anteil });
      if (befund) befunde.push(`${s} bei ${Math.round(anteil * 100)} %: ${befund}`);
    }
  }
  expect(befunde, befunde.join("\n")).toEqual([]);
});

test("Impressum und Datenschutz im Fuß jeder Seite verlinkt", async ({ page }) => {
  test.skip((projekt.pruefstufe ?? 3) < 3, "erst ab Prüfstufe 3");
  const fehlt: string[] = [];
  for (const s of alle) {
    await page.goto(s);
    for (const art of ["impressum", "datenschutz"])
      if ((await page.locator(`footer a[href*="${art}"]`).count()) === 0) fehlt.push(`${s}: ${art} fehlt im Fuß`);
  }
  expect(fehlt, fehlt.join("\n")).toEqual([]);
});

test("Navigation führt zu Seiten mit genau einer Hauptüberschrift", async ({ page }) => {
  await page.goto("/");
  const knopf = page.locator("header button[aria-expanded], header [aria-controls]").first();
  if ((await knopf.count()) && (await knopf.isVisible())) await knopf.click();
  const ziele = await page.$$eval("header nav a[href], nav[aria-label] a[href]", (as) => [...new Set(as.map((a) => (a as HTMLAnchorElement).pathname))]);
  expect(ziele.length, "keine Navigation gefunden").toBeGreaterThan(0);
  const fehler: string[] = [];
  for (const z of ziele) {
    const r = await page.goto(z);
    if (!r || r.status() >= 400) { fehler.push(`${z}: ${r?.status()}`); continue; }
    const h1 = await page.locator("h1").count();
    if (h1 !== 1) fehler.push(`${z}: ${h1} Hauptüberschriften`);
  }
  expect(fehler, fehler.join("\n")).toEqual([]);
});
