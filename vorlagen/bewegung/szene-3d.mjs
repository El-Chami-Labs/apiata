// 3D im Browser (docs/gestaltung/stufen.md, „3D“), im Projekt unter src/bewegung/. Three.js wird erst geladen, wenn die Szene
// gebraucht wird (Bühne nahe am sichtbaren Bereich). Ohne WebGL, ohne JavaScript und bei „Bewegung reduzieren“ bleibt
// der Ersatz stehen ([data-szene-ersatz]: ruhiges Standbild aus bewegung.css oder eigenes); die Seite ist ohne Szene vollständig.
// Inhalte (Text, Knöpfe) stehen nie nur in der Szene. Formen, Farben und Licht entstehen im Code (keine fremden Modelle
// oder Texturen ohne klare Lizenz).
// Bild: Leuchten (EffectComposer + UnrealBloomPass), ACES-Tone-Mapping, sRGB-Ausgabe. Handy: Pixeldichte höchstens 1,5,
// Leuchten mit halber Auflösung, weniger Partikel, weniger Rauschen im Shader.
// Einsatz: <div data-szene style="--szene-format: 1 / 1"><div data-szene-ersatz></div></div>
//   import { szeneStarten } from "./szene-3d.mjs"; szeneStarten(document.querySelector("[data-szene]"));
// HUD-Ringe (optional, zeigen den Scrollweg): HUD_RINGE als drittes Kind in [data-szene], in Astro
//   <Fragment set:html={HUD_RINGE} />. Der Scrollweg 0 … 1 steht als --szene-weg an der Bühne und als eingabe.weg in bild().
// Eigene Szene: szeneStarten(el, { bauen: (THREE, { szene, kamera, handy, partikel }) => ({ bild(zeit, eingabe) { … } }) })
// Eigene Szenen halten dieselbe Mindestqualität: leuchtende Farben über 1 (Bloom), Randlicht, Tiefe, keine flachen
// Standard-Materialien als einziger Stoff, keine leeren Flächen um die Form.

// Browser-Objekte über globalThis: dieselbe Datei besteht ESLint mit Node- und mit Browser-Globals
const {
  document,
  window,
  matchMedia,
  IntersectionObserver,
  ResizeObserver,
  requestAnimationFrame,
} = globalThis;

/** WebGL verfügbar? */
export function webglDa() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false; // ignoriert: Browser ohne Canvas-Kontext, dann gilt der Ersatz
  }
}

// Rand, ab dem die Bühne „nahe“ ist und die Szene lädt
export const SZENE_RAND = "200px";
// Handy: schmal oder Touch
export const HANDY = "(width < 48rem), (pointer: coarse)";
// Leuchten: Stärke, Radius, Schwelle (nur Farben über der Schwelle leuchten)
export const LEUCHTEN = { staerke: 0.6, radius: 0.6, schwelle: 0.7 };
// Hintergrund der Bühne (linear); die Szene füllt die Bühne immer ganz
export const GRUND = 0x020306;

/** Pixeldichte: Handy höchstens 1,5, sonst höchstens 2. */
export const pixelDichte = (dpr, handy) => Math.min(dpr || 1, handy ? 1.5 : 2);
/** Partikel für Sternenstaub und Funken: auf dem Handy etwa ein Viertel. */
export const partikelZahl = (handy) => (handy ? 400 : 1600);

/**
 * Scrollweg 0 … 1 einer Strecke: ist sie höher als das Fenster (Abschnitt bleibt stehen), zählt die Zeit des
 * Stehens, sonst der Weg vom Eintritt unten bis zum Austritt oben.
 */
export function wegAnteil(oben, hoehe, fenster) {
  const w =
    hoehe > fenster
      ? -oben / (hoehe - fenster)
      : (fenster - oben) / (hoehe + fenster);
  return Math.max(0, Math.min(1, w));
}

/** HUD-Ringe (SVG, nur Zierde): feine Skala, Strichmarken und ein Bogen, der mit --szene-weg wächst. */
export const HUD_RINGE = `<svg class="szene-hud" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
<circle class="hud-duenn" r="35" pathLength="100"/>
<g class="hud-dreh"><circle class="hud-skala" r="40.5" pathLength="100"/></g>
<circle class="hud-duenn" r="42" pathLength="100"/>
<circle class="hud-marken" r="44.5" pathLength="100" transform="rotate(-90)"/>
<circle class="hud-duenn" r="47" pathLength="100"/>
<circle class="hud-bogen" r="47" pathLength="100" transform="rotate(-90)"/>
</svg>`;

// wartet, bis el nahe am sichtbaren Bereich ist
function nahe(el, rand = SZENE_RAND) {
  return new Promise((ok) => {
    const io = new IntersectionObserver(
      (e) => {
        if (!e.some((x) => x.isIntersecting)) return;
        io.disconnect();
        ok();
      },
      { rootMargin: rand },
    );
    io.observe(el);
  });
}

// gibt den Hauptthread frei
const pause = () => new Promise((ok) => setTimeout(ok, 0));
const weich = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Simplex-Rauschen 3D nach Ashima Arts / Stefan Gustavson (MIT-Lizenz) und FBM für die bewegte Oberfläche
const RAUSCHEN = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=1.79284291400159-0.85373472095314*vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float a=0.5;float f=0.0;for(int i=0;i<OKTAVEN;i++){f+=a*snoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return f;}
`;
// Oberfläche wölbt sich mit uUnruhe (Anfang des Scrollwegs) und kommt zur Ruhe
const VERTEX = `
uniform float uZeit; uniform float uUnruhe;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${RAUSCHEN}
void main(){
  float d=snoise(position*1.4+vec3(0.0,uZeit*0.25,uZeit*0.15))*uUnruhe*0.22;
  vec3 pos=position+normal*d;
  vec4 w=modelMatrix*vec4(pos,1.0);
  vN=normalize(mat3(modelMatrix)*normal); vV=cameraPosition-w.xyz; vP=pos;
  gl_Position=projectionMatrix*viewMatrix*w;
}`;
// Fresnel-Randlicht, heller Kern, feine bewegte Adern; Farben linear, Werte über 1 leuchten im Bloom
const FRAGMENT = `
uniform float uZeit; uniform float uAlpha; uniform vec3 uLicht; uniform vec3 uKern;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${RAUSCHEN}
void main(){
  vec3 n=normalize(vN); vec3 v=normalize(vV);
  float nv=clamp(dot(n,v),0.0,1.0);
  float rand=pow(1.0-nv,3.4);
  vec3 q=vP*2.4+vec3(0.0,uZeit*0.035,uZeit*0.02);
  float f=fbm(q+0.8*vec3(snoise(q*0.7+uZeit*0.03)));
  float wolke=0.5+0.5*f;
  float ader=smoothstep(0.05,0.0,abs(f))*(0.2+0.8*pow(nv,1.5));
  vec3 farbe=uLicht*(0.03+0.14*wolke)*(0.3+0.7*nv);
  farbe+=uLicht*0.22*pow(nv,2.6)*(0.6+0.6*wolke);
  farbe+=uKern*0.95*pow(nv,14.0)*(0.8+0.4*wolke);
  farbe+=uLicht*2.1*rand*(0.75+0.5*wolke);
  farbe+=uKern*ader*0.35;
  gl_FragColor=vec4(farbe,uAlpha);
}`;
// weicher Schein hinter der Form: füllt die Fläche um die Form
const SCHEIN = `
uniform float uAlpha; uniform vec3 uLicht; varying vec2 vU;
void main(){
  float d=length(vU-0.5)*2.0;
  float g=pow(smoothstep(1.0,0.25,d),3.2)*0.32+pow(smoothstep(0.62,0.4,d),2.0)*0.25;
  gl_FragColor=vec4(uLicht*g*uAlpha,1.0);
}`;

// Punkte in einer Kugelschale (Radius von … bis), Helligkeit linear; wenige helle Punkte leuchten
function punkteWolke(THREE, zahl, von, bis, zufall, farbe) {
  const lage = new Float32Array(zahl * 3);
  const ton = new Float32Array(zahl * 3);
  for (let i = 0; i < zahl; i++) {
    const h = zufall() * 2 - 1;
    const phi = zufall() * Math.PI * 2;
    const k = Math.sqrt(1 - h * h);
    const r = von + zufall() * (bis - von);
    lage.set([Math.cos(phi) * k * r, h * r, Math.sin(phi) * k * r], i * 3);
    const hell = zufall() < 0.06 ? 1.6 : 0.18 + zufall() * 0.3;
    ton.set([farbe.r * hell, farbe.g * hell, farbe.b * hell], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(lage, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(ton, 3));
  return geo;
}

/**
 * Standard-Szene: leuchtende Kugel mit Randlicht und bewegter Oberfläche, Schein und Sternenstaub.
 * Verwandlung über den Scrollweg: Funken sammeln sich zur Kugel, die unruhige Oberfläche kommt zur Ruhe.
 */
export function standardSzene(
  THREE,
  { szene, kamera, handy = false, partikel = partikelZahl(handy), licht = 0x7aa2ff, kern = 0xeaf1ff },
) {
  let saat = 7;
  const zufall = () => {
    saat = (saat * 16807) % 2147483647;
    return (saat - 1) / 2147483646;
  };
  const farbeLicht = new THREE.Color(licht);
  const gruppe = new THREE.Group();
  szene.add(gruppe);
  const kugel = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, handy ? 48 : 96, handy ? 32 : 64),
    new THREE.ShaderMaterial({
      uniforms: {
        uZeit: { value: 0 },
        uAlpha: { value: 1 },
        uUnruhe: { value: 1 },
        uLicht: { value: farbeLicht },
        uKern: { value: new THREE.Color(kern) },
      },
      defines: { OKTAVEN: handy ? 3 : 5 },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
    }),
  );
  gruppe.add(kugel);
  const schein = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6),
    new THREE.ShaderMaterial({
      uniforms: { uAlpha: { value: 0.5 }, uLicht: { value: farbeLicht.clone().multiplyScalar(0.55) } },
      vertexShader:
        "varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: SCHEIN,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  schein.position.z = -0.6;
  szene.add(schein);
  const punkt = (groesse) =>
    new THREE.PointsMaterial({
      size: groesse,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
    });
  // Sternenstaub weit hinten: Tiefe, leicht verschoben mit Maus und Scrollweg
  const staub = new THREE.Points(
    punkteWolke(THREE, partikel, 7, 25, zufall, new THREE.Color(0.8, 0.88, 1)),
    punkt(handy ? 1.3 : 1.5),
  );
  staub.position.z = -6;
  szene.add(staub);
  // Funken nahe der Form: verteilt am Anfang, liegen am Ende auf der Kugel
  const funkenGeo = punkteWolke(THREE, Math.round(partikel / 4), 1.6, 3.4, zufall, farbeLicht);
  const start = funkenGeo.attributes.position.array.slice();
  const funken = new THREE.Points(funkenGeo, punkt(handy ? 1.8 : 2.2));
  gruppe.add(funken);
  let drehung = 0;
  return {
    bild(zeit, { maus, weg }) {
      const t = zeit * 0.001;
      kamera.position.set(0, 0, 8.5 / Math.min(1, kamera.aspect)); // Form füllt die kürzere Seite gleich, Platz für Ringe
      const ruhe = weich(0.1, 0.8, weg);
      const um = kugel.material.uniforms;
      um.uZeit.value = t;
      um.uUnruhe.value = 1 - ruhe;
      kugel.scale.setScalar(0.82 + 0.18 * ruhe + 0.012 * Math.sin(t) * ruhe);
      schein.material.uniforms.uAlpha.value = 0.3 + 0.5 * ruhe;
      const lage = funkenGeo.attributes.position.array;
      for (let i = 0; i < lage.length; i += 3) {
        const x = start[i];
        const y = start[i + 1];
        const z = start[i + 2];
        const s = 1 + (1.32 / Math.hypot(x, y, z) - 1) * ruhe;
        lage[i] = x * s;
        lage[i + 1] = y * s;
        lage[i + 2] = z * s;
      }
      funkenGeo.attributes.position.needsUpdate = true;
      funken.material.opacity = 1 - 0.7 * ruhe;
      staub.rotation.y = weg * 0.4 + t * 0.004 + maus.x * 0.03;
      staub.rotation.x = -weg * 0.1 - maus.y * 0.02;
      const ziel = weg * 2.4 + t * 0.12 + maus.x * 0.3;
      drehung += (ziel - drehung) * 0.06;
      gruppe.rotation.y = drehung;
      gruppe.rotation.x += (maus.y * 0.2 - gruppe.rotation.x) * 0.05;
    },
    weg() {
      for (const o of [kugel, schein, staub, funken]) {
        o.geometry.dispose();
        o.material.dispose();
      }
    },
  };
}

// Maus (−1 … 1), Lage der Bühne im Fenster (−1 … 1) und Scrollweg der Strecke (0 … 1, auch als --szene-weg)
function eingabeVerfolgen(el, strecke) {
  const eingabe = { maus: { x: 0, y: 0 }, scroll: 0, weg: 0 };
  const maus = (e) => {
    eingabe.maus.x = (e.clientX / window.innerWidth) * 2 - 1;
    eingabe.maus.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const scroll = () => {
    const r = el.getBoundingClientRect();
    const mitte =
      (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight;
    eingabe.scroll = Math.max(-1, Math.min(1, mitte));
    const s = strecke.getBoundingClientRect();
    eingabe.weg = wegAnteil(s.top, s.height, window.innerHeight);
    el.style.setProperty("--szene-weg", eingabe.weg.toFixed(4));
  };
  scroll();
  window.addEventListener("pointermove", maus, { passive: true });
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", scroll, { passive: true });
  return {
    eingabe,
    weg: () => {
      window.removeEventListener("pointermove", maus);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    },
  };
}

/**
 * Startet eine Szene in el ([data-szene]). Rückgabe { aktiv, grund, stoppen }.
 * strecke: Element, dessen Scrollweg die Verwandlung steuert (Standard: umgebender [data-bewegung="stehen"] oder el).
 * @param {HTMLElement} el
 * @param {{ bauen?: Function, rand?: string, leuchten?: typeof LEUCHTEN, grund?: number, strecke?: HTMLElement }} [optionen]
 */
export async function szeneStarten(
  el,
  { bauen = standardSzene, rand = SZENE_RAND, leuchten = LEUCHTEN, grund = GRUND, strecke } = {},
) {
  if (!el) return { aktiv: false, grund: "keine-buehne", stoppen: () => {} };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches)
    return { aktiv: false, grund: "bewegung-reduzieren", stoppen: () => {} };
  if (!webglDa())
    return { aktiv: false, grund: "kein-webgl", stoppen: () => {} };
  await nahe(el, rand);
  const [THREE, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] =
    await Promise.all([
      import("three"),
      import("three/addons/postprocessing/EffectComposer.js"),
      import("three/addons/postprocessing/RenderPass.js"),
      import("three/addons/postprocessing/UnrealBloomPass.js"),
      import("three/addons/postprocessing/OutputPass.js"),
    ]);
  await pause(); // Start in Schritten: keine lange Aufgabe im Hauptthread, auch auf dem Handy
  const handy = matchMedia(HANDY).matches;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // Kanten glättet das Leuchten; spart auf dem Handy viel
    powerPreference: handy ? "low-power" : "high-performance",
  });
  const dichte = pixelDichte(window.devicePixelRatio, handy);
  renderer.setPixelRatio(dichte);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  await pause();
  const szene = new THREE.Scene();
  szene.background = new THREE.Color(grund);
  const kamera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
  const inhalt = bauen(THREE, { szene, kamera, handy, partikel: partikelZahl(handy) });
  await pause();
  // Shader im Hintergrund übersetzen (parallel, wo der Browser es kann), statt im ersten Bild
  await renderer.compileAsync?.(szene, kamera);
  await pause();
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dichte);
  composer.addPass(new RenderPass(szene, kamera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(256, 256),
    leuchten.staerke,
    leuchten.radius,
    leuchten.schwelle,
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass()); // Tone-Mapping und sRGB am Ende der Kette
  const groesse = () => {
    const { width, height } = el.getBoundingClientRect();
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    if (handy) bloom.setSize(Math.ceil(w / 2), Math.ceil(h / 2)); // Leuchten mit halber Auflösung
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();
  };
  groesse();
  el.prepend(canvas);
  const { eingabe, weg: eingabeWeg } = eingabeVerfolgen(
    el,
    strecke ?? el.closest('[data-bewegung="stehen"]') ?? el,
  );
  const ro = new ResizeObserver(groesse);
  ro.observe(el);
  let erstes = true;
  const zeichnen = (zeit) => {
    inhalt.bild(zeit, eingabe);
    composer.render();
    if (erstes) requestAnimationFrame(() => el.classList.add("szene-laeuft"));
    erstes = false;
  };
  // nur zeichnen, solange die Bühne sichtbar ist
  const sicht = new IntersectionObserver((e) =>
    renderer.setAnimationLoop(
      e.some((x) => x.isIntersecting) ? zeichnen : null,
    ),
  );
  sicht.observe(el);
  return {
    aktiv: true,
    grund: null,
    stoppen: () => {
      sicht.disconnect();
      ro.disconnect();
      eingabeWeg();
      renderer.setAnimationLoop(null);
      inhalt.weg?.();
      composer.dispose();
      renderer.dispose();
      canvas.remove();
      el.classList.remove("szene-laeuft");
    },
  };
}
