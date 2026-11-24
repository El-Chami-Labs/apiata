// Kit-Test: 3D-Baustein vorlagen/bewegung/szene-3d.mjs (Leuchten, Tone-Mapping, Randlicht, Tiefe, Rückfälle, HUD, Standbild).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const wurzel = new URL("../../", import.meta.url).pathname;
const quelle = readFileSync(join(wurzel, "vorlagen/bewegung/szene-3d.mjs"), "utf8");
const css = readFileSync(join(wurzel, "vorlagen/bewegung/bewegung.css"), "utf8");

// Browser-Attrappe vor dem Import: der Baustein liest die Browser-Objekte beim Laden aus globalThis
const lage = { reduziert: false, webgl: true };
Object.assign(globalThis, {
  matchMedia: (q) => ({ matches: /reduce/.test(q) && lage.reduziert }),
  document: { createElement: () => ({ getContext: () => (lage.webgl ? {} : null) }) },
});
const szene = await import("../../vorlagen/bewegung/szene-3d.mjs");

test("3D-Baustein: Leuchten über EffectComposer und UnrealBloomPass, ACES-Tone-Mapping, sRGB", () => {
  for (const muster of [
    /import\("three\/addons\/postprocessing\/EffectComposer\.js"\)/,
    /import\("three\/addons\/postprocessing\/UnrealBloomPass\.js"\)/,
    /import\("three\/addons\/postprocessing\/OutputPass\.js"\)/,
    /toneMapping = THREE\.ACESFilmicToneMapping/,
    /outputColorSpace = THREE\.SRGBColorSpace/,
    /composer\.render\(\)/,
  ])
    assert.match(quelle, muster);
  assert.doesNotMatch(quelle, /renderer\.render\(/, "Bild muss über den Composer laufen");
});

test("3D-Baustein: kein neues Paket, nur three und seine Addons", () => {
  const code = quelle.replace(/^\s*\/\/.*$/gm, "");
  const importe = [...code.matchAll(/import\(["']([^"']+)["']\)|from ["']([^"']+)["']/g)].map((m) => m[1] ?? m[2]);
  assert.ok(importe.length >= 5);
  for (const i of importe) assert.match(i, /^three(\/addons\/.+)?$/, `fremder Import ${i}`);
});

test("3D-Baustein: Standard-Szene mit eigenem Shader (Randlicht, bewegte Oberfläche), Schein und Partikeln", () => {
  assert.match(quelle, /new THREE\.ShaderMaterial/);
  assert.match(quelle, /pow\(1\.0-nv/, "Fresnel-Randlicht fehlt");
  assert.match(quelle, /uZeit/, "bewegte Oberfläche fehlt");
  assert.match(quelle, /new THREE\.Points/, "Partikel fehlen");
  assert.match(quelle, /AdditiveBlending/, "Schein fehlt");
  assert.doesNotMatch(quelle, /flatShading: true|MeshStandardMaterial|MeshLambertMaterial/, "flaches Standard-Material");
  assert.match(quelle, /eingabe\.weg = wegAnteil/, "Verwandlung über den Scrollweg fehlt");
});

test("3D-Baustein: Handy mit begrenzter Pixeldichte, weniger Partikeln, Leuchten mit halber Auflösung", () => {
  assert.equal(szene.pixelDichte(3, true), 1.5);
  assert.equal(szene.pixelDichte(3, false), 2);
  assert.equal(szene.pixelDichte(1, true), 1);
  assert.equal(szene.pixelDichte(undefined, false), 1);
  assert.ok(szene.partikelZahl(true) <= szene.partikelZahl(false) / 2);
  assert.match(quelle, /if \(handy\) bloom\.setSize\(Math\.ceil\(w \/ 2\)/);
  assert.match(quelle, /OKTAVEN: handy \? 3 : 5/);
});

test("3D-Baustein: Rückfälle „Bewegung reduzieren“, ohne WebGL, ohne Bühne", async () => {
  assert.equal((await szene.szeneStarten(null)).grund, "keine-buehne");
  lage.reduziert = true;
  const r = await szene.szeneStarten({});
  assert.deepEqual([r.aktiv, r.grund], [false, "bewegung-reduzieren"]);
  lage.reduziert = false;
  lage.webgl = false;
  const w = await szene.szeneStarten({});
  assert.deepEqual([w.aktiv, w.grund], [false, "kein-webgl"]);
  lage.webgl = true;
});

test("3D-Baustein: Scrollweg 0 … 1 für stehende und durchlaufende Strecken", () => {
  assert.equal(szene.wegAnteil(0, 3000, 1000), 0);
  assert.equal(szene.wegAnteil(-1000, 3000, 1000), 0.5);
  assert.equal(szene.wegAnteil(-5000, 3000, 1000), 1);
  assert.equal(szene.wegAnteil(1000, 500, 1000), 0);
  assert.equal(szene.wegAnteil(250, 500, 1000), 0.5);
});

test("3D-Baustein: ruhiges Standbild ohne JavaScript und HUD-Ringe nur als Zierde", () => {
  const ersatz = css.match(/\[data-szene-ersatz\] \{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(ersatz, /radial-gradient\(circle closest-side/, "Standbild der Kugel fehlt");
  assert.match(css, /\.szene-laeuft > \[data-szene-ersatz\] \{\s*opacity: 0;/);
  assert.match(css, /\.szene-laeuft \.hud-dreh \{\s*animation:/, "HUD dreht nur bei laufender Szene");
  assert.match(css, /stroke-dasharray: calc\(var\(--szene-weg, 0\) \* 100\) 100/);
  assert.match(szene.HUD_RINGE, /aria-hidden="true"/);
  assert.match(szene.HUD_RINGE, /class="hud-bogen"/);
});
