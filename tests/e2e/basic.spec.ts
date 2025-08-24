import { test, expect } from '@playwright/test';

test.describe('Seller Console Basic E2E', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    
    // Verify page title
    await expect(page).toHaveTitle(/Seller Console/);
  });

  test('displays main application', async ({ page }) => {
    await page.goto('/');
    
    // Check that the app root element is visible
    await expect(page.locator('#root')).toBeVisible();
    
    // Check that main content loaded (any text content exists)
    const content = await page.locator('#root').textContent();
    expect(content?.length).toBeGreaterThan(0);
  });
});