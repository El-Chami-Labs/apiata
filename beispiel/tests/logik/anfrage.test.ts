import { describe, expect, it } from "vitest";
import { anfragePruefen, anfrageText, mailtoLink, type Anfrage } from "../../src/logik/anfrage";

const ok: Anfrage = { name: "Erika Muster", email: "erika@beispiel.de", telefon: "", art: "innenausbau", beschreibung: "Einbauschrank im Flur", zeitraum: "" };

describe("anfragePruefen", () => {
  it("akzeptiert vollständige Angaben", () => expect(anfragePruefen(ok)).toEqual({}));
  it("meldet leere Pflichtfelder einzeln", () => {
    const f = anfragePruefen({ ...ok, name: " ", email: "", beschreibung: "" });
    expect(f.name).toBe("Bitte Ihren Namen angeben");
    expect(f.kontakt).toBeTruthy();
    expect(f.beschreibung).toBeTruthy();
  });
  it("lässt Telefon statt E-Mail genügen", () => expect(anfragePruefen({ ...ok, email: "", telefon: "0170 123" })).toEqual({}));
  it("benennt eine ungültige E-Mail-Adresse", () => {
    const f = anfragePruefen({ ...ok, email: "erika@" });
    expect(f.email).toContain("ungültig");
    expect(f.kontakt).toBeUndefined();
  });
});

describe("anfrageText und mailtoLink", () => {
  it("bildet Betreff und Text mit allen Angaben", () => {
    const { betreff, text } = anfrageText({ ...ok, zeitraum: "Frühjahr" });
    expect(betreff).toBe("Anfrage: Innenausbau – Erika Muster");
    expect(text).toContain("Einbauschrank im Flur");
    expect(text).toContain("Wunschzeitraum: Frühjahr");
  });
  it("lässt leere freiwillige Felder samt Zeile weg", () => {
    const { text } = anfrageText(ok);
    expect(text).toBe("Name: Erika Muster\nE-Mail: erika@beispiel.de\nArt des Vorhabens: Innenausbau\n\nBeschreibung:\nEinbauschrank im Flur");
  });
  it("kodiert den mailto-Link", () => {
    const link = mailtoLink(ok);
    expect(link.startsWith("mailto:")).toBe(true);
    expect(decodeURIComponent(link.split("subject=")[1].split("&")[0])).toBe("Anfrage: Innenausbau – Erika Muster");
  });
});
