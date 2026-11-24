// Bausteine für Bewegung (docs/gestaltung/stufen.md, „Bewegung“), im Projekt unter src/bewegung/. Ohne Abhängigkeit für Einblenden,
// Gleiten, Maskieren, Wort für Wort und Zählen; Motion nur für Effekte am Scrollweg (Bildausschnitt wandert, Abschnitt
// bleibt stehen) und Lenis nur für sanftes Scrollen mit Maus oder Trackpad, beide erst geladen, wenn die Seite sie
// braucht. Reine CSS-Animation geht vor, wo sie reicht.
// Einsatz:
//   1. KOPF_SKRIPT als erstes <script> in <head> (setzt html.bewegt, nur ohne „Bewegung reduzieren“).
//   2. bewegung.css einbinden, Markup mit data-bewegung (siehe dort).
//   3. import { bewegungStarten } from "./bewegung.mjs"; bewegungStarten({ sanft: true });

// Inline im <head>, vor dem ersten Zeichnen: Ohne JavaScript bleibt alles sichtbar; lädt bewegung.mjs nicht binnen 3 s,
// wird die Klasse wieder entfernt (dann ebenfalls alles sichtbar).
// Browser-Objekte über globalThis: dieselbe Datei besteht ESLint mit Node- und mit Browser-Globals
const {
  document,
  matchMedia,
  IntersectionObserver,
  requestAnimationFrame,
  performance,
} = globalThis;

export const KOPF_SKRIPT =
  '(function(){var h=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;h.classList.add("bewegt");setTimeout(function(){if(!h.classList.contains("bewegung-bereit"))h.classList.remove("bewegt")},3000)})()';

const SICHTBAR = "ist-sichtbar";
const EINTRITT = ["einblenden", "gleiten", "maskieren", "woerter", "zaehlen"];

/** Text in Wörter teilen (je <span class="wort">), Leerzeichen bleiben Text. @param {Element} el */
export function woerterTeilen(el) {
  let i = 0;
  const gehen = (knoten) => {
    for (const kind of [...knoten.childNodes]) {
      if (kind.nodeType === 1) gehen(kind);
      if (kind.nodeType !== 3 || !kind.data.trim()) continue;
      const teile = kind.data.split(/(\s+)/);
      const stueck = document.createDocumentFragment();
      for (const teil of teile) {
        if (!teil) continue;
        if (/^\s+$/.test(teil)) stueck.append(teil);
        else {
          const wort = document.createElement("span");
          wort.className = "wort";
          wort.style.setProperty("--i", String(i++));
          wort.textContent = teil;
          stueck.append(wort);
        }
      }
      kind.replaceWith(stueck);
    }
  };
  gehen(el);
  return i;
}

/** Zahl aus einem Text („1.250 Kunden“, „98 %“): { vor, zahl, nach, stellen } oder null. @param {string} text */
export function zahlLesen(text) {
  const m = String(text).match(
    /^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(\D*)$/,
  );
  if (!m) return null;
  const stellen = m[3]?.length ?? 0;
  return {
    vor: m[1],
    zahl: Number(`${m[2].replace(/\./g, "")}.${m[3] ?? 0}`),
    nach: m[4],
    stellen,
  };
}

function zaehlen(el, dauer) {
  const ziel = zahlLesen(el.textContent.trim());
  if (!ziel) return;
  const format = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: ziel.stellen,
    maximumFractionDigits: ziel.stellen,
  });
  el.style.minInlineSize = `${el.textContent.trim().length}ch`; // feste Breite: kein Sprung beim Zählen
  const beginn = performance.now();
  const schritt = (jetzt) => {
    const t = Math.min(1, (jetzt - beginn) / dauer);
    const wert = ziel.zahl * (1 - (1 - t) ** 3);
    el.textContent = `${ziel.vor}${format.format(t === 1 ? ziel.zahl : wert)}${ziel.nach}`;
    if (t < 1) requestAnimationFrame(schritt);
  };
  el.textContent = `${ziel.vor}${format.format(0)}${ziel.nach}`;
  requestAnimationFrame(schritt);
}

// Versatz je Gruppe: Kinder mit data-bewegung unter data-bewegung-gruppe bekommen --i
function versatzSetzen(wurzel) {
  for (const gruppe of wurzel.querySelectorAll("[data-bewegung-gruppe]"))
    [...gruppe.querySelectorAll("[data-bewegung]")].forEach((el, i) =>
      el.style.setProperty("--i", String(i)),
    );
}

// wartet, bis eines der Elemente höchstens einen halben Bildschirm entfernt ist
function nahe(elemente) {
  return new Promise((ok) => {
    const io = new IntersectionObserver(
      (e) => {
        if (!e.some((x) => x.isIntersecting)) return;
        io.disconnect();
        ok();
      },
      { rootMargin: "50% 0px" },
    );
    for (const el of elemente) io.observe(el);
  });
}

// Effekte am Scrollweg mit Motion (scroll() nutzt ScrollTimeline, wo der Browser sie kann)
async function scrollEffekte(wurzel) {
  const ausschnitte = [
    ...wurzel.querySelectorAll('[data-bewegung="ausschnitt"]'),
  ];
  const stehen = [...wurzel.querySelectorAll('[data-bewegung="stehen"]')];
  if (!ausschnitte.length && !stehen.length) return [];
  // erster Schritt sofort sichtbar, auch wenn Motion noch lädt
  for (const abschnitt of stehen)
    abschnitt.querySelector("[data-schritt]")?.classList.add("ist-aktiv");
  await nahe([...ausschnitte, ...stehen]); // Motion erst laden, wenn der erste Effekt in die Nähe kommt
  const { animate, scroll } = await import("motion");
  const stopp = [];
  for (const rahmen of ausschnitte) {
    const bild = rahmen.firstElementChild;
    if (!bild) continue;
    const weg = Number(rahmen.dataset.weg ?? 7);
    stopp.push(
      scroll(
        animate(
          bild,
          {
            transform: [
              `translate3d(0, ${-weg}%, 0) scale(1.15)`,
              `translate3d(0, ${weg}%, 0) scale(1.15)`,
            ],
          },
          { ease: "linear" },
        ),
        { target: rahmen, offset: ["start end", "end start"] },
      ),
    );
  }
  for (const abschnitt of stehen) {
    const schritte = [...abschnitt.querySelectorAll("[data-schritt]")];
    let aktiv = -1;
    const setzen = (fortschritt) => {
      const n = Math.min(
        schritte.length - 1,
        Math.floor(fortschritt * schritte.length),
      );
      abschnitt.style.setProperty("--fortschritt", fortschritt.toFixed(3));
      if (n === aktiv) return;
      schritte.forEach((s, i) => s.classList.toggle("ist-aktiv", i === n));
      aktiv = n;
    };
    setzen(0);
    stopp.push(
      scroll(setzen, { target: abschnitt, offset: ["start start", "end end"] }),
    );
  }
  return stopp;
}

/**
 * Startet die Bausteine. Ohne html.bewegt (kein KOPF_SKRIPT, „Bewegung reduzieren“) geschieht nichts.
 * sanft: Lenis für Maus und Trackpad (nie auf Touch-Geräten, nie bei „Bewegung reduzieren“).
 * @param {{ wurzel?: ParentNode, sanft?: boolean, dauer?: number }} [optionen]
 */
export async function bewegungStarten({
  wurzel = document,
  sanft = false,
  dauer = 1400,
} = {}) {
  const html = document.documentElement;
  if (
    !html.classList.contains("bewegt") ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    html.classList.remove("bewegt");
    return { aktiv: false, stoppen: () => {} };
  }
  versatzSetzen(wurzel);
  for (const el of wurzel.querySelectorAll('[data-bewegung="woerter"]'))
    woerterTeilen(el);
  const beobachter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        e.target.classList.add(SICHTBAR);
        if (e.target.dataset.bewegung === "zaehlen") zaehlen(e.target, dauer);
        beobachter.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
  );
  for (const el of wurzel.querySelectorAll(
    EINTRITT.map((art) => `[data-bewegung="${art}"]`).join(","),
  ))
    beobachter.observe(el);
  html.classList.add("bewegung-bereit");
  const effekte = scrollEffekte(wurzel); // läuft weiter, während Lenis startet
  let lenis = null;
  if (sanft && matchMedia("(pointer: fine)").matches) {
    const { default: Lenis } = await import("lenis");
    lenis = new Lenis({ autoRaf: true });
  }
  const stopp = await effekte;
  return {
    aktiv: true,
    stoppen: () => {
      beobachter.disconnect();
      for (const s of stopp) s?.();
      lenis?.destroy();
    },
  };
}
