import { expect, test, type Page } from '@playwright/test';

const noHorizontalScroll = async (page: Page) => {
  const { scroll, client } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(scroll).toBeLessThanOrEqual(client);
};

test('lekcja 1: od teorii do zaliczenia i odblokowania lekcji 2; postęp po przeładowaniu', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Kurs szkata' })).toBeVisible();
  await noHorizontalScroll(page);
  await page.getByRole('link', { name: 'Zacznij naukę' }).click();

  await expect(page.getByRole('heading', { name: 'Lekcja 1: Czym jest szkat?' })).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Dalej' }).click();

  for (const answer of ['3', '61', '120', 'Razem, jako drużyna']) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await expect(page.getByText('Dobrze!')).toBeVisible();
    await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'Lekcja zaliczona!' })).toBeVisible();
  await noHorizontalScroll(page);

  await page.getByRole('link', { name: 'Następna lekcja' }).click();
  await expect(page.getByRole('heading', { name: 'Lekcja 2: Talia' })).toBeVisible();

  await page.reload();
  await page.goto('./#/');
  await expect(page.getByRole('link', { name: 'Kontynuuj' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Czym jest szkat\?.*Zaliczona/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Talia.*Dostępna/ })).toBeVisible();
});

test('karty: grafiki obu talii wczytują się, układ mieści się w 375 px', async ({ page }) => {
  await page.goto('./#/ustawienia');
  const images = page.locator('img.card__img');
  await expect(images).toHaveCount(4);
  for (const img of await images.all()) {
    await expect(img).toHaveAttribute('src', /cards\/altenburg\//);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await noHorizontalScroll(page);

  await page.getByLabel('Francuska').check();
  await expect(images.first()).toHaveAttribute('src', /cards\/french\//);
  await expect.poll(() => images.first().evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);

  await page.getByRole('link', { name: 'O kartach i licencjach' }).click();
  await expect(page.getByRole('heading', { name: 'O kartach' })).toBeVisible();
  await noHorizontalScroll(page);
});
