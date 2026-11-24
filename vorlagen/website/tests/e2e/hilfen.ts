// Gemeinsame Hilfen der Kern-Tests: Seiten aus dem Build, Projektwerte.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const projekt = JSON.parse(existsSync("projekt.json") ? readFileSync("projekt.json", "utf8") : "{}") as {
  pruefstufe?: number;
  hauptaktion?: { selektor: string; ziel?: string };
};

/** Alle Seiten des Builds außer 404 und Gestaltungsentwürfen */
export function seiten(dist = "dist"): string[] {
  const raus: string[] = [];
  const gehen = (ordner: string) => {
    for (const e of readdirSync(ordner)) {
      const p = join(ordner, e);
      if (statSync(p).isDirectory()) gehen(p);
      else if (e === "index.html") raus.push("/" + relative(dist, ordner).replace(/\\/g, "/") + (ordner === dist ? "" : "/"));
    }
  };
  if (existsSync(dist)) gehen(dist);
  return raus.map((s) => s.replace(/^\/\/$/, "/")).filter((s) => !s.startsWith("/gestaltung/")).sort();
}
