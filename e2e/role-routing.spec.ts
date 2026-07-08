import { test, expect } from '@playwright/test';

test.describe('middleware — producent next (niezalogowany)', () => {
  test('chroniona trasa trenera przekierowuje na /login?next=', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  });

  test('chroniona trasa klienta przekierowuje na /login?next=', async ({ page }) => {
    await page.goto('/today');
    await expect(page).toHaveURL(/\/login\?next=%2Ftoday$/);
  });

  test('trasa publiczna (/login) przechodzi bez przekierowania', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Zaloguj się' })).toBeVisible();
  });
});
