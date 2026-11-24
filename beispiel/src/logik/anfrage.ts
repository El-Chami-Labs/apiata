// Reine Funktionen für das Anfrageformular (keine Speicherung, Versand per mailto).
export const EMPFAENGER = "platzhalter@example.invalid"; // Platzhalter: E-Mail-Adresse

export const ARTEN = {
  moebel: "Möbel nach Maß",
  innenausbau: "Innenausbau",
  reparatur: "Reparatur",
  sonstiges: "Sonstiges",
} as const;
export type Art = keyof typeof ARTEN;

export interface Anfrage {
  name: string;
  email: string;
  telefon: string;
  art: string;
  beschreibung: string;
  zeitraum: string;
}
export type Fehler = Partial<Record<"name" | "kontakt" | "email" | "beschreibung", string>>;

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function anfragePruefen(d: Anfrage): Fehler {
  const f: Fehler = {};
  if (!d.name.trim()) f.name = "Bitte Ihren Namen angeben";
  const mail = d.email.trim();
  if (mail && !EMAIL.test(mail)) f.email = "Diese E-Mail-Adresse ist ungültig. Bitte prüfen Sie sie, zum Beispiel name@beispiel.de";
  else if (!mail && !d.telefon.trim()) f.kontakt = "Bitte E-Mail-Adresse oder Telefonnummer angeben";
  if (!d.beschreibung.trim()) f.beschreibung = "Bitte beschreiben Sie Ihr Vorhaben";
  return f;
}

export function anfrageText(d: Anfrage): { betreff: string; text: string } {
  const art = ARTEN[d.art as Art] ?? ARTEN.sonstiges;
  const zeilen = [
    `Name: ${d.name.trim()}`,
    d.email.trim() ? `E-Mail: ${d.email.trim()}` : undefined,
    d.telefon.trim() ? `Telefon: ${d.telefon.trim()}` : undefined,
    `Art des Vorhabens: ${art}`,
    d.zeitraum.trim() ? `Wunschzeitraum: ${d.zeitraum.trim()}` : undefined,
    "",
    "Beschreibung:",
    d.beschreibung.trim(),
  ].filter((z): z is string => z !== undefined);
  return { betreff: `Anfrage: ${art} – ${d.name.trim()}`, text: zeilen.join("\n") };
}

export function mailtoLink(d: Anfrage): string {
  const { betreff, text } = anfrageText(d);
  return `mailto:${EMPFAENGER}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(text)}`;
}
