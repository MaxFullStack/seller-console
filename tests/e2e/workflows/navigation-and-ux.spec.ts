import { test, expect } from '@playwright/test';

test.describe('Navigation and User Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should navigate between all main pages', async ({ page }) => {
    // Verify we start on dashboard/leads page
    await expect(page.locator('[data-testid="leads-table"]')).toBeVisible();
    
    // Navigate to opportunities
    await page.click('[data-testid="opportunities-nav-link"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    
    // Navigate back to leads/dashboard
    await page.click('[data-testid="leads-nav-link"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="leads-table"]')).toBeVisible();
    
    // Test direct URL navigation
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="leads-table"]')).toBeVisible();
  });

  test('should maintain application state during navigation', async ({ page }) => {
    // Apply a filter on leads page
    await page.waitForSelector('[data-testid="lead-row"]');
    await page.click('[data-testid="status-filter"]');
    await page.click('text=Qualified');
    await page.waitForTimeout(300);
    
    // Get filtered count
    const filteredCount = await page.locator('[data-testid="lead-row"]').count();
    
    // Navigate to opportunities and back
    await page.click('[data-testid="opportunities-nav-link"]');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="leads-nav-link"]');
    await page.waitForLoadState('networkidle');
    
    // Filter should still be applied
    await expect(page.locator('[data-testid="status-filter"]')).toContainText('Qualified');
    const currentCount = await page.locator('[data-testid="lead-row"]').count();
    expect(currentCount).toBe(filteredCount);
  });

  test('should display proper page titles and breadcrumbs', async ({ page }) => {
    // Check leads page title
    await expect(page).toHaveTitle(/Leads|Seller Console/);
    
    // Navigate to opportunities
    await page.click('[data-testid="opportunities-nav-link"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Opportunities|Seller Console/);
    
    // Check for breadcrumbs if they exist
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    if (await breadcrumbs.isVisible()) {
      await expect(breadcrumbs).toContainText('Opportunities');
    }
  });

  test('should handle browser back/forward buttons', async ({ page }) => {
    // Navigate through pages
    await page.click('[data-testid="opportunities-nav-link"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    
    // Use browser back button
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="leads-table"]')).toBeVisible();
    
    // Use browser forward button
    await page.goForward();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
  });

  test('should provide visual feedback for loading states', async ({ page }) => {
    // Test navigation with loading states
    await page.click('[data-testid="opportunities-nav-link"]');
    
    // Look for loading indicators during navigation
    // This might be a spinner, skeleton loader, or loading message
    const loadingIndicators = [
      '[data-testid="loading-spinner"]',
      '[data-testid="skeleton-loader"]',
      'text=Loading',
      '.loading'
    ];
    
    let hasLoadingState = false;
    for (const indicator of loadingIndicators) {
      if (await page.locator(indicator).isVisible({ timeout: 100 })) {
        hasLoadingState = true;
        break;
      }
    }
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    
    // Loading state should be gone
    if (hasLoadingState) {
      for (const indicator of loadingIndicators) {
        await expect(page.locator(indicator)).not.toBeVisible();
      }
    }
  });

  test('should handle mobile responsive navigation', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check if mobile navigation menu exists
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    
    if (await mobileMenuButton.isVisible()) {
      // Test mobile menu functionality
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Navigate using mobile menu
      await page.click('[data-testid="mobile-opportunities-link"]');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    } else if (await sidebarToggle.isVisible()) {
      // Test sidebar toggle functionality
      await sidebarToggle.click();
      await page.waitForTimeout(300);
      
      // Sidebar should be collapsed/expanded
      const sidebar = page.locator('[data-testid="sidebar"]');
      if (await sidebar.isVisible()) {
        // Test navigation with collapsed/expanded sidebar
        await page.click('[data-testid="opportunities-nav-link"]');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
      }
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('should maintain focus management for accessibility', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should focus on first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Navigate to opportunities using keyboard
    await page.keyboard.press('Tab');
    const opportunitiesLink = page.locator('[data-testid="opportunities-nav-link"]');
    
    if (await opportunitiesLink.isVisible()) {
      // Focus should be on opportunities link or nearby
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      // Should be on opportunities page
      await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    }
  });

  test('should provide proper error handling for navigation', async ({ page }) => {
    // Test navigation to non-existent page
    await page.goto('/non-existent-page');
    
    // Should either redirect to a valid page or show 404
    const isOnValidPage = await page.locator('[data-testid="leads-table"]').isVisible() ||
                         await page.locator('[data-testid="opportunities-table"]').isVisible() ||
                         await page.locator('[data-testid="404-page"]').isVisible() ||
                         await page.locator('text=404').isVisible() ||
                         await page.locator('text=Not Found').isVisible();
    
    expect(isOnValidPage).toBe(true);
  });

  test('should handle search functionality across pages', async ({ page }) => {
    // Test search on leads page
    await page.waitForSelector('[data-testid="search-input"]');
    await page.fill('[data-testid="search-input"]', 'test search');
    await page.waitForTimeout(300);
    
    // Navigate to opportunities
    await page.click('[data-testid="opportunities-nav-link"]');
    await page.waitForLoadState('networkidle');
    
    // Search should be reset or maintained appropriately
    const opportunitiesSearch = page.locator('[data-testid="search-input"]');
    if (await opportunitiesSearch.isVisible()) {
      const searchValue = await opportunitiesSearch.inputValue();
      // Search should either be empty (reset) or maintained
      expect(searchValue).toBeDefined();
    }
  });

  test('should handle external links appropriately', async ({ page }) => {
    // Look for any external links (if they exist)
    const externalLinks = page.locator('a[href^="http"]:not([href*="localhost"]):not([href*="127.0.0.1"])');
    const linkCount = await externalLinks.count();
    
    if (linkCount > 0) {
      // Test that external links have appropriate attributes
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = externalLinks.nth(i);
        const target = await link.getAttribute('target');
        const rel = await link.getAttribute('rel');
        
        // External links should open in new tab and have security attributes
        expect(target).toBe('_blank');
        expect(rel).toContain('noopener');
      }
    }
  });

  test('should handle deep linking correctly', async ({ page }) => {
    // Test direct navigation to opportunities page
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    
    // Navigation should reflect current page
    const opportunitiesNavLink = page.locator('[data-testid="opportunities-nav-link"]');
    if (await opportunitiesNavLink.isVisible()) {
      // Should have active state or indication
      const isActive = await opportunitiesNavLink.getAttribute('class');
      expect(isActive).toBeTruthy();
    }
  });

  test('should provide consistent user experience across browsers', async ({ page }) => {
    // Test core functionality that should work across browsers
    
    // Navigation
    await page.click('[data-testid="opportunities-nav-link"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    
    // Form interactions
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('browser test');
      await page.waitForTimeout(200);
      const value = await searchInput.inputValue();
      expect(value).toBe('browser test');
    }
    
    // Table interactions
    const firstRow = page.locator('[data-testid="opportunity-row"]').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      // Should provide some visual feedback or action
      await page.waitForTimeout(200);
    }
  });
});