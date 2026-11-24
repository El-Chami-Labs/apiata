// Kit-Test: Layout-Wächter im echten Browser an Beispielseiten (waagerechtes Scrollen, abgeschnittener Text,
// Überlappung, feste Leiste unten). Braucht Playwright (im Kit-Test-Workflow installiert).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { browserStarten, starten } from "../server.mjs";
import { imBrowserPruefen, TOLERANZ } from "../layout-waechter.mjs";

const kopf = '<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width"><style>body{margin:0;font:16px/1.5 sans-serif}p,h1{margin:16px}</style></head><body>';
const seiten = {
  gut: `${kopf}<h1>Titel</h1><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">Schritt 1: nur für Screenreader</span><details><summary>Frage?</summary><p style="margin-top:-30px">Antwort</p></details><p>Ein normaler Absatz mit <a href="/">Link</a> im Text, der umbricht und umbricht und umbricht.</p><a href="/x" style="display:inline-block;padding:12px">Anfrage</a></body></html>`,
  breit: `${kopf}<h1>Titel</h1><div style="width:900px;height:20px;background:#c00"></div></body></html>`,
  abgeschnitten: `${kopf}<div style="width:120px;height:24px;overflow:hidden"><p style="margin:0">Dieser Text ist viel zu lang für seinen Kasten und wird unten abgeschnitten</p></div></body></html>`,
  ueberlappung: `${kopf}<h1>Große Überschrift hier</h1><p style="margin-top:-40px">Absatz rutscht unter die Überschrift</p></body></html>`,
  leiste: `${kopf}<h1>Titel</h1><p style="height:1200px">Inhalt</p><footer><p>Impressum Datenschutz Fußzeile</p></footer><a href="/anfrage/" style="position:fixed;left:0;right:0;bottom:0;height:64px;background:#222;color:#fff">Anfrage</a></body></html>`,
};

test("Layout-Wächter findet Fehler und lässt eine saubere Seite durch", async () => {
  const dist = mkdtempSync(join(tmpdir(), "kit-layout-"));
  for (const [n, html] of Object.entries(seiten)) {
    mkdirSync(join(dist, n));
    writeFileSync(join(dist, n, "index.html"), html);
  }
  const { url, stoppen } = await starten(dist);
  const browser = await browserStarten();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const pruefe = async (n) => { await page.goto(`${url}/${n}/`); return page.evaluate(imBrowserPruefen, TOLERANZ); };
    assert.deepEqual(await pruefe("gut"), []);
    assert.ok((await pruefe("breit")).some((b) => /waagerechtes Scrollen/.test(b)));
    assert.ok((await pruefe("abgeschnitten")).some((b) => /abgeschnitten/.test(b)));
    assert.ok((await pruefe("ueberlappung")).some((b) => /Überlappung/.test(b)));
    assert.ok((await pruefe("leiste")).some((b) => /feste Leiste/.test(b)));
  } finally {
    await browser.close();
    await stoppen();
  }
});
