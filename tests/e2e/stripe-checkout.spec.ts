import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout Flow', () => {
  test('Should display pricing page and have checkout buttons', async ({ page }) => {
    await page.goto('/pricing');


    await expect(page.locator('h1').first()).toContainText(/Investimento|Planos/i);

    const proPlan = page.locator('text=Pro').first();
    await expect(proPlan).toBeVisible();

    const proButton = page.locator('text=/Escolher Plano Pro|Assinar/i').first();
    await expect(proButton).toBeVisible();

    const href = await proButton.getAttribute('href');
    if (href) {
      expect(href).toMatch(/\/(api\/stripe\/checkout|login|signup|dashboard)/i);
    }
  });
});
