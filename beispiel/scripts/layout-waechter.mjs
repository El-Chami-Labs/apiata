// Layout-Wächter (Bibliothek für tests/e2e/layout.spec.ts): kein waagerechtes Scrollen, Text nicht abgeschnitten,
// Text und Bedienelemente überlappen nicht, feste Leiste unten verdeckt ganz unten nichts. Toleranz in Pixeln.
export const BREITEN = [390, 768, 1280];
export const TOLERANZ = 4;

/** Läuft im Browser. Gibt Befunde als Texte zurück. */
export function imBrowserPruefen(T) {
  const befunde = [];
  const doc = document.documentElement;
  const stil = (el) => getComputedStyle(el);
  const name = (el) => {
    const t = (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 30);
    return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.classList[0] ? "." + el.classList[0] : ""}${t ? ` „${t}“` : ""}`;
  };
  // nur für Screenreader (1-px-Kasten mit clip) oder im geschlossenen <details> (außer summary): nicht sichtbar
  const nurVorlesen = (s, r) => (r.width <= 2 || r.height <= 2) && (s.clip !== "auto" || s.clipPath.includes("inset") || s.overflow === "hidden");
  const sichtbar = (el) => {
    for (let e = el; e && e !== doc; e = e.parentElement) {
      const s = stil(e);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      if (e.getAttribute("aria-hidden") === "true" || e.hasAttribute("hidden")) return false;
      if (nurVorlesen(s, e.getBoundingClientRect())) return false;
      const zu = e.parentElement?.closest("details:not([open])");
      if (zu && !e.closest("summary")) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const fest = (el) => {
    for (let e = el; e && e !== doc; e = e.parentElement) if (["fixed", "sticky"].includes(stil(e).position)) return e;
    return null;
  };
  const absolut = (r) => ({ l: r.left + scrollX, r: r.right + scrollX, o: r.top + scrollY, u: r.bottom + scrollY });

  // 1. waagerechtes Scrollen
  if (doc.scrollWidth > doc.clientWidth + T) {
    const breit = [...document.body.querySelectorAll("*")]
      .filter((el) => sichtbar(el) && el.getBoundingClientRect().right > doc.clientWidth + T)
      .filter((el) => !el.parentElement || el.parentElement.getBoundingClientRect().right <= doc.clientWidth + T)
      .slice(0, 3).map(name);
    befunde.push(`waagerechtes Scrollen: Seite ${doc.scrollWidth} px bei ${doc.clientWidth} px Fenster (${breit.join(", ") || "unbekannt"})`);
  }

  // 2. Text abgeschnitten oder aus dem Kasten
  const textTraeger = new Set();
  const lauf = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = lauf.nextNode(); n; n = lauf.nextNode()) {
    const el = n.parentElement;
    if (!n.textContent.trim() || !el || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION"].includes(el.tagName) || !sichtbar(el)) continue;
    textTraeger.add(el);
    const bereich = document.createRange();
    bereich.selectNodeContents(n);
    const zeilen = [...bereich.getClientRects()].filter((r) => r.width > 0);
    const tv = Math.max(T, 0.35 * parseFloat(stil(el).fontSize));
    for (let a = el; a && a !== doc; a = a.parentElement) {
      const s = stil(a);
      const x = ["hidden", "clip"].includes(s.overflowX);
      const y = ["hidden", "clip"].includes(s.overflowY);
      if (!x && !y) continue;
      const r = a.getBoundingClientRect();
      const raus = zeilen.some((z) => (x && (z.right > r.left + a.clientLeft + a.clientWidth + T || z.left < r.left - T)) || (y && (z.bottom > r.top + a.clientTop + a.clientHeight + tv || z.top < r.top - tv)));
      if (raus) { befunde.push(`Text abgeschnitten: ${name(el)} in ${name(a)}`); break; }
    }
    if (stil(el).textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + T) befunde.push(`Text mit „…“ gekürzt: ${name(el)}`);
  }

  // 3. Überlappung von Text und Bedienelementen (feste Leisten ausgenommen, die prüft Schritt 4)
  const block = (el) => {
    for (let e = el; e && e !== doc; e = e.parentElement) if (!stil(e).display.startsWith("inline") || e.tagName === "BUTTON") return e;
    return el;
  };
  const teile = [...textTraeger, ...document.querySelectorAll("a, button, input, select, textarea, [role=button]")]
    .map(block)
    .filter((el, i, alle) => alle.indexOf(el) === i && sichtbar(el) && !fest(el))
    .map((el) => ({ el, b: absolut(el.getBoundingClientRect()) }));
  const schnitt = (a, b) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > T && Math.min(a.u, b.u) - Math.max(a.o, b.o) > T;
  let gezaehlt = 0;
  for (let i = 0; i < teile.length && gezaehlt < 10; i++)
    for (let j = i + 1; j < teile.length; j++) {
      const [a, b] = [teile[i], teile[j]];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (schnitt(a.b, b.b)) { befunde.push(`Überlappung: ${name(a.el)} und ${name(b.el)}`); gezaehlt++; }
    }

  // 4. Feste Leiste unten verdeckt ganz unten gescrollt den letzten Inhalt
  scrollTo(0, doc.scrollHeight);
  const leisten = [...document.querySelectorAll("body *")].filter((el) => stil(el).position === "fixed" && sichtbar(el) && el.getBoundingClientRect().bottom >= innerHeight - 2 && el.getBoundingClientRect().top > innerHeight / 2);
  for (const l of leisten) {
    const r = l.getBoundingClientRect();
    const verdeckt = [...textTraeger].filter((el) => !l.contains(el) && sichtbar(el)).find((el) => {
      const e = el.getBoundingClientRect();
      return e.bottom > r.top + T && e.top < r.bottom - T && Math.min(e.right, r.right) - Math.max(e.left, r.left) > T;
    });
    if (verdeckt) befunde.push(`feste Leiste ${name(l)} verdeckt ganz unten ${name(verdeckt)}`);
  }
  scrollTo(0, 0);
  return befunde;
}

/** Prüft eine Seite in einer Breite. */
export async function layoutPruefen(page, pfad, breite) {
  await page.setViewportSize({ width: breite, height: breite < 700 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(pfad, { waitUntil: "load" });
  await page.evaluate(() => document.fonts?.ready);
  const befunde = await page.evaluate(imBrowserPruefen, TOLERANZ);
  return befunde.map((b) => `${pfad} @${breite}: ${b}`);
}
