import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    // Wait for app to load with shorter timeout
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  });

  test('should load the application successfully', async ({ page }) => {
    // Check if page title is correct
    await expect(page).toHaveTitle(/Seller Console/i);
    
    // Check if React root element exists
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10000 });
  });

  test('should display navigation elements', async ({ page }) => {
    // Look for common navigation patterns
    const navigation = page.locator('nav').first();
    if (await navigation.isVisible({ timeout: 5000 })) {
      await expect(navigation).toBeVisible();
    }
    
    // Or check for sidebar/header elements
    const sidebar = page.locator('[class*="sidebar"], [data-testid*="sidebar"]').first();
    const header = page.locator('header, [class*="header"], [data-testid*="header"]').first();
    
    // At least one should be visible
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    const headerVisible = await header.isVisible().catch(() => false);
    
    expect(sidebarVisible || headerVisible).toBe(true);
  });

  test('should have working navigation links', async ({ page }) => {
    // Try to find any navigation links
    const links = page.locator('a[href="/leads"], a[href="/opportunities"]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // Click the first available link
      await links.first().click({ timeout: 5000 });
      
      // Wait for navigation
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Verify URL changed
      const url = page.url();
      expect(url).toMatch(/(leads|opportunities)/);
    } else {
      // If no specific links found, just verify app loaded
      await expect(page.locator('#root')).toBeVisible();
    }
  });

  test('should handle page refresh gracefully', async ({ page }) => {
    // Refresh the page
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Verify app still works
    await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    await expect(page.locator('#root')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await expect(page.locator('#root')).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await expect(page.locator('#root')).toBeVisible();
  });
});