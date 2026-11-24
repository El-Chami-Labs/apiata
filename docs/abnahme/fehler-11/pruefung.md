# Fehler 11 · Zwei fast gleiche Gestaltungsvorschläge

Wegwerf-Branch `wegwerf-11` (lokal, Commit b4eacc0), nach dem Beleg gelöscht.

## Eingebauter Fehler
```diff
-- Achsen: komposition=rasterbruch-ueberlappung · farbwelt=hell-dunkel-wechsel · schrift=kondensiert-plakativ · element=geometrische-formen · dichte=wechselnd-laut-leise · kopfzeile=leiste-unten · bildersatz=ausschnitt
+- Achsen: komposition=asymmetrisch · farbwelt=hell-neutral · schrift=serife-und-grotesk · element=linien-und-raster · dichte=luftig-mit-verdichtung · kopfzeile=nur-menue · bildersatz=schichten
```

## Prüfbericht (Ausgabe)
```
$ node scripts/achsen.mjs docs/design-richtungen
muss: auftrag-a und auftrag-b zu ähnlich: nur 2 von 7 Achsen verschieden (gleich: komposition, schrift, element, dichte, bildersatz)
muss: auftrag-a und auftrag-b: gleicher Bildersatz „schichten“
ACHSEN ROT (2)
Exit 1
```
