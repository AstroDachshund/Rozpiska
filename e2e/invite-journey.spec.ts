import { test, expect } from '@playwright/test';
import { createTrainer, freshClientEmail, createInvite, confirmUrlFor, trackUserByEmail, cleanup } from './helpers';

test.afterAll(async () => {
  await cleanup();
});

test('zaproszenie → rejestracja → klient ląduje w kontekście (client)', async ({ page }) => {
  const trainer = await createTrainer();
  const email = freshClientEmail();
  const { token } = await createInvite(trainer.userId, email);

  // 1. Klient otwiera link — e-mail zablokowany, prefilled.
  await page.goto(`/invite/${token}`);
  const emailInput = page.locator('#invite-email');
  await expect(emailInput).toHaveValue(email);
  await expect(emailInput).toHaveAttribute('readonly', '');

  // 2. „Dołącz do trenera" → sendInviteMagicLinkAction tworzy usera + ustawia cookie invite_token.
  await page.getByRole('button', { name: 'Dołącz do trenera' }).click();
  await expect(page.getByText(/Sprawdź skrzynkę/)).toBeVisible();
  await trackUserByEmail(email); // do sprzątania

  // 3. Domykamy magic link deterministycznie (generateLink) — cookie invite_token wciąż w kontekście.
  const confirmUrl = await confirmUrlFor(email);
  await page.goto(confirmUrl);

  // 4. Ląduje na /today w kontekście klienta (ciemny motyw).
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.locator('[data-context="client"]')).toBeVisible();
  await expect(page.locator('.dark')).toBeVisible();
});

test('granice grup: klient nie wejdzie do (trainer), trener nie wejdzie do (client)', async ({ page, context }) => {
  // Klient: przez pełny flow zaproszenia (jak wyżej), potem próbuje /dashboard.
  const trainer = await createTrainer();
  const email = freshClientEmail();
  const { token } = await createInvite(trainer.userId, email);
  await page.goto(`/invite/${token}`);
  await page.getByRole('button', { name: 'Dołącz do trenera' }).click();
  await expect(page.getByText(/Sprawdź skrzynkę/)).toBeVisible();
  await trackUserByEmail(email);
  await page.goto(await confirmUrlFor(email));
  await expect(page).toHaveURL(/\/today$/);

  // Zalogowany klient → /dashboard → odbity na /today.
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/today$/);

  // Czyścimy sesję klienta i logujemy się jako trener (hasłem przez UI).
  await context.clearCookies();
  await page.goto('/login');
  await page.getByRole('button', { name: 'Zaloguj się hasłem' }).click();
  await page.locator('#pw-email').fill(trainer.email);
  await page.locator('#pw-password').fill(trainer.password);
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // Zalogowany trener → /today → odbity na /dashboard.
  await page.goto('/today');
  await expect(page).toHaveURL(/\/dashboard$/);
});
