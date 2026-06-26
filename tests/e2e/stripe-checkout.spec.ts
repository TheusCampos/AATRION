import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout Flow', () => {
  test('Should display pricing page and have checkout buttons', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing');
    
    // Check if the title is correct
    await expect(page.locator('h1').first()).toContainText(/Investimento|Planos/i);
    
    // Check if there is a 'Pro' plan card
    const proPlan = page.locator('text=Pro').first();
    await expect(proPlan).toBeVisible();
    
    // Check for CTA button inside the Pro plan card
    // We expect a button or link with text like 'Assinar' or 'Escolher Plano Pro'
    const proButton = page.locator('text=/Escolher Plano Pro|Assinar/i').first();
    await expect(proButton).toBeVisible();
    
    // If we click it without being logged in, it should probably redirect to Clerk login
    // Let's just assert the link points to the checkout route or auth route
    const href = await proButton.getAttribute('href');
    if (href) {
      expect(href).toMatch(/\/(api\/stripe\/checkout|login|signup|dashboard)/i);
    }
  });
});
