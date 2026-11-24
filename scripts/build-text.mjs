// Gemeinsame Hilfen für Prüfungen am Build: HTML-Dateien finden, sichtbaren Text, Link-Ziele und Attribute lesen, projekt.json lesen.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export function dateien(ordner, endungen = [".html"]) {
  const raus = [];
  if (!existsSync(ordner)) return raus;
  for (const e of readdirSync(ordner)) {
    const p = join(ordner, e);
    if (statSync(p).isDirectory()) raus.push(...dateien(p, endungen));
    else if (endungen.some((x) => e.endsWith(x))) raus.push(p);
  }
  return raus;
}

/** Seitenpfad (/leistungen/) aus einer Datei im Build */
export function seitenPfad(dist, datei) {
  const r = "/" + relative(dist, datei).replace(/\\/g, "/");
  return r.replace(/index\.html$/, "").replace(/\.html$/, "/");
}

/** sichtbarer Text ohne head, script, style, Kommentare; weiche Trennungen entfernt */
export function sichtbarerText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->|<template[\s\S]*?<\/template>/gi, " ")
    .replace(/&shy;|&#173;|­|​|<wbr\s*\/?>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const ZEICHEN = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
const entitaeten = (t) => t.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] !== "#" ? ZEICHEN[e.toLowerCase()] ?? m : String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))));

/** Link-Ziele (href, Formular-action) und Attribute alt, title, aria-label im body: [{ art, wert }].
 *  mailto: und tel: ohne Vorsatz und Parameter, entschlüsselt. */
export function linkUndAttributWerte(html) {
  const body = html.replace(/<head[\s\S]*?<\/head>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, " ");
  const raus = [];
  for (const m of body.matchAll(/\s(href|action|alt|title|aria-label)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const name = m[1].toLowerCase();
    let wert = entitaeten(m[2] ?? m[3] ?? m[4] ?? "").trim();
    if (!wert) continue;
    if (name === "href" || name === "action") {
      const ziel = wert.match(/^(mailto|tel):([^?#]*)/i);
      if (ziel) {
        try { wert = decodeURIComponent(ziel[2]); } catch { wert = ziel[2]; }
        raus.push({ art: ziel[1].toLowerCase(), wert });
      } else raus.push({ art: name, wert });
    } else raus.push({ art: name, wert });
  }
  return raus;
}

export function projektLesen(ordner = ".") {
  const p = join(ordner, "projekt.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
}
