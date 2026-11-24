// Kleiner statischer Server für den lokalen Build (Fotos, Prüfungen). starten(dist, port) → { url, stoppen }
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const TYPEN = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".webm": "video/webm", ".ico": "image/x-icon", ".txt": "text/plain" };

export function starten(dist = "dist", port = 0) {
  const server = createServer((req, res) => {
    let pfad = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
    let datei = join(dist, pfad);
    if (existsSync(datei) && statSync(datei).isDirectory()) datei = join(datei, "index.html");
    if (!existsSync(datei) && existsSync(datei + ".html")) datei += ".html";
    if (!existsSync(datei)) {
      res.writeHead(404, { "content-type": TYPEN[".html"] });
      res.end(existsSync(join(dist, "404.html")) ? readFileSync(join(dist, "404.html")) : "404");
      return;
    }
    res.writeHead(200, { "content-type": TYPEN[extname(datei)] ?? "application/octet-stream" });
    res.end(readFileSync(datei));
  });
  return new Promise((ok) =>
    server.listen(port, "127.0.0.1", () => ok({ url: `http://127.0.0.1:${server.address().port}`, stoppen: () => new Promise((z) => server.close(z)) })),
  );
}

/** Chromium laden: Projekt-Playwright, sonst globales, sonst vorinstallierter Browser */
export async function browserStarten() {
  let pw;
  try { pw = await import("@playwright/test"); } catch { pw = await import("playwright"); }
  const pfad = process.env.CHROMIUM_PFAD;
  try {
    return await pw.chromium.launch(pfad ? { executablePath: pfad } : {});
  } catch (f) {
    for (const p of ["/opt/pw-browsers/chromium", "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"])
      if (existsSync(p)) return pw.chromium.launch({ executablePath: p });
    throw f;
  }
}
