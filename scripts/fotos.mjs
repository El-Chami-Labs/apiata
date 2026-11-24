#!/usr/bin/env node
// Screenshots vom lokalen Build. node scripts/fotos.mjs --ziel <ordner> [--dist dist] [--seiten /,/leistungen/]
//   [--breiten 390,1280] [--ganz] [--bildfolge] [--video] [--name vorschlag-a]
// --bildfolge: fünf Scroll-Positionen (0, 25, 50, 75, 100 %) nebeneinander in einem Bild (Bewegung sichtbar machen)
// --video: kurzes Scroll-Video (webm) je Breite
import { mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { browserStarten, starten } from "./server.mjs";

const args = process.argv.slice(2);
const wert = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const ziel = wert("--ziel", "laeufe/bilder");
const dist = wert("--dist", "dist");
const seiten = wert("--seiten", "/").split(",");
const breiten = wert("--breiten", "390,1280").split(",").map(Number);
const name = wert("--name", "");
mkdirSync(ziel, { recursive: true });

const dateiName = (seite, breite, zusatz = "") =>
  `${name ? name + "-" : ""}${seite.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "start"}-${breite}${zusatz}.png`;

const { url, stoppen } = await starten(dist);
const browser = await browserStarten();
const ergebnis = [];
try {
  for (const breite of breiten) {
    const hoehe = breite < 700 ? 844 : 800;
    const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe }, ...(args.includes("--video") ? { recordVideo: { dir: ziel, size: { width: breite, height: hoehe } } } : {}) });
    const page = await ctx.newPage();
    for (const seite of seiten) {
      await page.goto(url + seite, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(800);
      const pfad = join(ziel, dateiName(seite, breite));
      await page.screenshot({ path: pfad, fullPage: false });
      ergebnis.push(pfad);
      if (args.includes("--ganz")) {
        // ganze Seite im Ruhezustand: mit „Bewegung reduzieren“ ist jeder Inhalt sichtbar (Bewegung zeigt --bildfolge)
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(url + seite, { waitUntil: "networkidle" });
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
          scrollTo(0, 0);
        });
        await page.waitForTimeout(600);
        const ganz = join(ziel, dateiName(seite, breite, "-ganz"));
        await page.screenshot({ path: ganz, fullPage: true });
        ergebnis.push(ganz);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.goto(url + seite, { waitUntil: "networkidle" });
      }
      if (args.includes("--bildfolge") || args.includes("--video")) {
        const bilder = [];
        for (const anteil of [0, 0.25, 0.5, 0.75, 1]) {
          await page.evaluate((a) => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * a, behavior: "instant" }), anteil);
          await page.waitForTimeout(900);
          bilder.push((await page.screenshot()).toString("base64"));
        }
        if (args.includes("--bildfolge")) {
          const folge = await browser.newPage({ viewport: { width: Math.min(5 * breite + 80, 6000), height: hoehe + 40 } });
          await folge.setContent(`<body style="margin:0;background:#222;display:flex;gap:16px;padding:20px">${bilder.map((b) => `<img style="height:${hoehe}px" src="data:image/png;base64,${b}">`).join("")}</body>`);
          const pfad2 = join(ziel, dateiName(seite, breite, "-bildfolge"));
          await folge.screenshot({ path: pfad2, fullPage: true });
          await folge.close();
          ergebnis.push(pfad2);
        }
      }
    }
    const video = page.video();
    await ctx.close();
    if (video) {
      const vp = join(ziel, dateiName("video", breite).replace(".png", ".webm"));
      renameSync(await video.path(), vp);
      ergebnis.push(vp);
    }
  }
} finally {
  await browser.close();
  await stoppen();
}
for (const p of ergebnis) console.log(`BILD ${p}`);
