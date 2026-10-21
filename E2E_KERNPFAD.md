# E2E-Test Kernpfad (Playwright)

**Ergebnis: PASS** (1 Lauf, dazu 3 Wiederholungen, alle grün).

Hier die Eingaben:

- URL: https://melaniew238.github.io/Supportanfrage-Triage/
- Testdaten: `Mein Konto ist seit heute gesperrt. Ich kann mich trotz Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen.`
- Aktionen: Text eingeben, "Anfrage einordnen" klicken, auf Ergebnis warten.

## Erwartung: mittel statt hoch

Der ursprüngliche Auftrag nannte "hoch". Ein erster Lauf mit dieser Erwartung war FAIL: Playwright fand in `getByRole('region', { name: 'Ergebnis' }).getByText('hoch', { exact: true })` kein Element, der Screenshot zeigte das Badge "mittel". Alle anderen Kriterien waren schon damals grün. Ein Kontrolllauf mit "mittel" war grün.

Die Erwartung ist jetzt auf **mittel** gesetzt, weil Prüfvertrag (Regel D1) und Protokoll M5.3.2 genau das festlegen: "dringend" allein ist kein Auslöser, ein einzelnes gesperrtes Konto ist keine komplette Blockade, kein Sicherheitsrisiko und kein unmittelbar drohender finanzieller Schaden. Das ist eine bewusste Anpassung des Tests an die dokumentierte Regel, nicht an das zufällige Verhalten der App.

## Testdatei

`e2e/kernpfad.spec.js` (Konfiguration: `playwright.config.js`)

```js
const { test, expect } = require('@playwright/test');

const EINGABE = 'Mein Konto ist seit heute gesperrt. Ich kann mich trotz Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen.';

test.afterEach(async ({ page }) => {
  await page.getByLabel('Supportanfrage').clear();
});

test('Kernpfad: gesperrtes Konto wird als Zugang, mittel eingeordnet', async ({ page }) => {
  // Relativ, damit der Pfad /Supportanfrage-Triage/ aus der baseURL erhalten bleibt ('/' würde ihn verwerfen).
  await page.goto('./');

  const feld = page.getByLabel('Supportanfrage');
  const ergebnis = page.getByRole('region', { name: 'Ergebnis' });
  const status = page.getByRole('status');

  await expect(feld).toHaveValue('');
  await expect(ergebnis).toBeHidden();

  await feld.fill(EINGABE);
  await page.getByRole('button', { name: 'Anfrage einordnen' }).click();

  await expect(ergebnis).toBeVisible();
  await expect(status).toContainText('Erfolg');

  // Soft: alle Bestanden-Kriterien werden gemeldet, nicht nur das erste fehlgeschlagene.
  await expect.soft(ergebnis.getByText('Zugang', { exact: true })).toBeVisible();
  await expect.soft(ergebnis.getByText('mittel', { exact: true })).toBeVisible();
  await expect.soft(ergebnis.getByText(/^Absender per Rückfrage identifizieren/)).toBeVisible();

  const zitat = ergebnis.getByRole('blockquote');
  await expect.soft(zitat).toBeVisible();
  const zitatText = ((await zitat.textContent()) ?? '').trim();
  expect.soft(zitatText.length).toBeGreaterThan(0);
  expect.soft(EINGABE).toContain(zitatText);

  // Heuristik gegen Erfindungen: Die Eingabe enthält keine Ziffern, Beträge oder Vertragsbegriffe.
  await expect.soft(ergebnis).not.toContainText(/\d|€|vertrag|kundennummer|bestellung/i);
});
```

Kein `sleep` und kein `waitForTimeout`: Die 350 ms Verarbeitungspause der App fängt das automatische Warten der Assertions ab. Trace und Screenshot (ganze Seite) werden bei Fehlern gespeichert (`retain-on-failure`, `only-on-failure`). Bei einem grünen Lauf entstehen sie absichtlich nicht.

## Ausgeführtes Ergebnis

Befehl (Chromium aus dem lokalen Cache, siehe Annahmen):

```bash
CHROMIUM_PATH=$(ls -d ~/Library/Caches/ms-playwright/chromium_headless_shell-1243/*/chrome-headless-shell) npx playwright test
```

Report, Einzellauf:

```
Running 1 test using 1 worker

  ✓  1 e2e/kernpfad.spec.js:9:1 › Kernpfad: gesperrtes Konto wird als Zugang, mittel eingeordnet (1.7s)

  1 passed (2.4s)
```

Report, Stabilitätslauf (`npx playwright test --repeat-each=3`):

```
Running 3 tests using 3 workers

  ✓  3 e2e/kernpfad.spec.js:9:1 › Kernpfad: gesperrtes Konto wird als Zugang, mittel eingeordnet (1.4s)
  ✓  1 e2e/kernpfad.spec.js:9:1 › Kernpfad: gesperrtes Konto wird als Zugang, mittel eingeordnet (1.4s)
  ✓  2 e2e/kernpfad.spec.js:9:1 › Kernpfad: gesperrtes Konto wird als Zugang, mittel eingeordnet (1.5s)

  3 passed (2.1s)
```

Die Unit-Tests (`npm test`) sind unverändert: 27 Tests, 26 bestanden, 0 fehlgeschlagen, 1 `todo` (bekannter Fehler 4b).

Ein HTML-Report liegt nach dem Lauf in `playwright-report/` (`npx playwright show-report`). Ordner und `test-results/` sind in `.gitignore`.

## Annahmen

- Die Seite wird nur lesend geprüft, es gibt keinen Login und keine persistenten Daten. Das Leeren des Felds im `afterEach` ist reine Vorsicht, jeder Lauf startet in einem frischen Browserkontext.
- Die App hat keine beschrifteten Ergebnisfelder. Kategorie und Dringlichkeit werden deshalb über `getByText` im Ergebnisbereich gesucht, der Bereich selbst über `getByRole('region', { name: 'Ergebnis' })`, das Zitat über `getByRole('blockquote')`. Reines `getByRole` für jedes Feld ist ohne Änderung der App nicht möglich.
- "Konkreter nächster Schritt" ist als der v1-Text für Zugang geprüft (`Absender per Rückfrage identifizieren …`). Ändert sich der Wortlaut, muss der Test mit.
- Das Paket `@playwright/test` 1.64.1 erwartet Browser-Revision 1248, lokal liegt 1243. Statt sie herunterzuladen, zeigt `CHROMIUM_PATH` auf den vorhandenen Browser. Das lief ohne Auffälligkeiten. Auf einem frischen Rechner ist `npx playwright install chromium` der normale Weg.
- Der Test läuft gegen die öffentliche URL, nicht gegen lokale Dateien.

## Was der Test beweist und was nicht

Er beweist:

- Die öffentliche Seite lädt mit leerem Feld und ohne Ergebnis.
- Der Kernpfad (eingeben, klicken, Ergebnis) läuft in einem echten Browser ohne Fehlerzustand durch.
- Kategorie "Zugang", Dringlichkeit "mittel", der erwartete nächste Schritt und ein Zitat erscheinen, und das Zitat steht wörtlich in der Eingabe.
- Im Ergebnis tauchen keine Ziffern, Beträge oder Begriffe wie Vertrag, Kundennummer oder Bestellung auf.

Er beweist nicht:

- Dass andere Eingaben richtig eingeordnet werden. Es ist ein einziger Fall.
- Dass nichts erfunden wird. Die Heuristik erkennt nur Ziffern und vier Begriffe, keine erfundenen Namen oder Zusagen in Worten.
- Dass der nächste Schritt inhaltlich gut ist, nur dass der erwartete Text erscheint.
- Dass "mittel" fachlich die richtige Dringlichkeit ist. Der Test hält die dokumentierte Regel D1 fest, die Regel selbst bleibt eine Entscheidung. Ein Wechsel auf "hoch" würde den Test rot machen, und das ist gewollt.
- Verhalten bei Leerfall, Überlänge, Angriff oder auf dem Handy. Dafür gibt es die Tests in `test/` und das Protokoll.
- Stabilität über längere Zeit oder in anderen Browsern: vier grüne Läufe in einem Chromium.
- Dass die Seite für Nutzer nachvollziehbar ist. Das prüft die Aufgabe mit der fremden Person.
