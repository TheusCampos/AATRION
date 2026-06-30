import { test, expect } from '@playwright/test';

test.describe('PDF Export Flow', () => {
  test('Should render the application properly before PDF export', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ATRION/);

    const mainHeading = page.locator('text=ATS').first();
    await expect(mainHeading).toBeVisible();

  });
});
