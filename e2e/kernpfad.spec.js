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

  // Soft: alle vier Bestanden-Kriterien werden gemeldet, nicht nur das erste fehlgeschlagene.
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
