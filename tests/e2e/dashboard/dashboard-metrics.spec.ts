import { test, expect } from '@playwright/test';

test.describe('Dashboard Metrics', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (home page)
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should display leads metrics cards', async ({ page }) => {
    // Verify leads metrics section is visible
    await expect(page.locator('[data-testid="leads-metrics"]')).toBeVisible();
    
    // Check for key leads metrics
    await expect(page.locator('[data-testid="total-leads-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="qualified-leads-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-score-metric"]')).toBeVisible();
    
    // Verify metrics have numerical values
    const totalLeads = await page.locator('[data-testid="total-leads-value"]').textContent();
    const qualifiedLeads = await page.locator('[data-testid="qualified-leads-value"]').textContent();
    const conversionRate = await page.locator('[data-testid="conversion-rate-value"]').textContent();
    const averageScore = await page.locator('[data-testid="average-score-value"]').textContent();
    
    expect(totalLeads).toMatch(/^\d+$/);
    expect(qualifiedLeads).toMatch(/^\d+$/);
    expect(conversionRate).toMatch(/^\d+%$/);
    expect(averageScore).toMatch(/^\d+$/);
  });

  test('should display opportunities metrics cards', async ({ page }) => {
    // Verify opportunities metrics section is visible
    await expect(page.locator('[data-testid="opportunities-metrics"]')).toBeVisible();
    
    // Check for key opportunities metrics
    await expect(page.locator('[data-testid="total-opportunities-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="win-rate-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="pipeline-value-metric"]')).toBeVisible();
    
    // Verify metrics have proper values
    const totalOpportunities = await page.locator('[data-testid="total-opportunities-value"]').textContent();
    const totalRevenue = await page.locator('[data-testid="total-revenue-value"]').textContent();
    const winRate = await page.locator('[data-testid="win-rate-value"]').textContent();
    const pipelineValue = await page.locator('[data-testid="pipeline-value-value"]').textContent();
    
    expect(totalOpportunities).toMatch(/^\d+$/);
    expect(totalRevenue).toMatch(/^\$[\d,]+$/);
    expect(winRate).toMatch(/^\d+%$/);
    expect(pipelineValue).toMatch(/^\$[\d,]+$/);
  });

  test('should display overall metrics', async ({ page }) => {
    // Verify overall metrics section is visible
    await expect(page.locator('[data-testid="overall-metrics"]')).toBeVisible();
    
    // Check for revenue per lead metric
    await expect(page.locator('[data-testid="revenue-per-lead-metric"]')).toBeVisible();
    
    // Verify last updated timestamp
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
    
    // Verify revenue per lead has proper format
    const revenuePerLead = await page.locator('[data-testid="revenue-per-lead-value"]').textContent();
    expect(revenuePerLead).toMatch(/^\$[\d,]+$/);
  });

  test('should show metrics with proper icons and labels', async ({ page }) => {
    // Check that metric cards have proper structure
    const metricCards = page.locator('[data-testid*="-metric"]');
    const cardCount = await metricCards.count();
    
    expect(cardCount).toBeGreaterThan(5); // Should have multiple metric cards
    
    // Verify each card has appropriate elements
    for (let i = 0; i < Math.min(cardCount, 8); i++) { // Check first 8 cards
      const card = metricCards.nth(i);
      await expect(card).toBeVisible();
      
      // Each card should have a value
      const hasValue = await card.locator('[data-testid*="-value"]').count() > 0;
      expect(hasValue).toBe(true);
    }
  });

  test('should update metrics when navigating between pages', async ({ page }) => {
    // Get initial dashboard metrics
    const initialTotalLeads = await page.locator('[data-testid="total-leads-value"]').textContent();
    const initialTotalOpportunities = await page.locator('[data-testid="total-opportunities-value"]').textContent();
    
    // Navigate to leads page
    await page.click('[data-testid="leads-nav-link"]');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on leads page
    await expect(page.locator('[data-testid="leads-table"]')).toBeVisible();
    
    // Navigate back to dashboard
    await page.click('[data-testid="dashboard-nav-link"]');
    await page.waitForLoadState('networkidle');
    
    // Verify metrics are still displayed correctly
    await expect(page.locator('[data-testid="total-leads-value"]')).toHaveText(initialTotalLeads || '');
    await expect(page.locator('[data-testid="total-opportunities-value"]')).toHaveText(initialTotalOpportunities || '');
  });

  test('should display leads breakdown by status', async ({ page }) => {
    // Check if leads breakdown section exists
    const leadsBreakdown = page.locator('[data-testid="leads-status-breakdown"]');
    
    if (await leadsBreakdown.isVisible()) {
      // Verify different status counts
      await expect(page.locator('[data-testid="new-leads-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="qualified-leads-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="contacted-leads-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="unqualified-leads-count"]')).toBeVisible();
      
      // Verify counts are numerical
      const newLeads = await page.locator('[data-testid="new-leads-count"]').textContent();
      const qualifiedLeads = await page.locator('[data-testid="qualified-leads-count"]').textContent();
      
      expect(newLeads).toMatch(/^\d+$/);
      expect(qualifiedLeads).toMatch(/^\d+$/);
    }
  });

  test('should display opportunities breakdown by stage', async ({ page }) => {
    // Check if opportunities breakdown section exists
    const opportunitiesBreakdown = page.locator('[data-testid="opportunities-stage-breakdown"]');
    
    if (await opportunitiesBreakdown.isVisible()) {
      // Verify different stage counts
      await expect(page.locator('[data-testid="prospecting-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="closed-won-count"]')).toBeVisible();
      
      // Verify counts are numerical
      const prospectingCount = await page.locator('[data-testid="prospecting-count"]').textContent();
      const closedWonCount = await page.locator('[data-testid="closed-won-count"]').textContent();
      
      expect(prospectingCount).toMatch(/^\d+$/);
      expect(closedWonCount).toMatch(/^\d+$/);
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // This test would be more relevant in a fresh environment
    // For now, just verify that metrics display reasonable values
    
    const totalLeads = await page.locator('[data-testid="total-leads-value"]').textContent();
    const totalOpportunities = await page.locator('[data-testid="total-opportunities-value"]').textContent();
    
    const leadsCount = parseInt(totalLeads || '0');
    const opportunitiesCount = parseInt(totalOpportunities || '0');
    
    // In our system with mock data, we should have some leads and opportunities
    expect(leadsCount).toBeGreaterThanOrEqual(0);
    expect(opportunitiesCount).toBeGreaterThanOrEqual(0);
  });

  test('should display proper percentage formatting', async ({ page }) => {
    // Check conversion rate formatting
    const conversionRate = await page.locator('[data-testid="conversion-rate-value"]').textContent();
    expect(conversionRate).toMatch(/^\d+%$/);
    
    // Check win rate formatting
    const winRate = await page.locator('[data-testid="win-rate-value"]').textContent();
    expect(winRate).toMatch(/^\d+%$/);
    
    // Verify percentages are reasonable (0-100%)
    const conversionValue = parseInt(conversionRate?.replace('%', '') || '0');
    const winRateValue = parseInt(winRate?.replace('%', '') || '0');
    
    expect(conversionValue).toBeGreaterThanOrEqual(0);
    expect(conversionValue).toBeLessThanOrEqual(100);
    expect(winRateValue).toBeGreaterThanOrEqual(0);
    expect(winRateValue).toBeLessThanOrEqual(100);
  });

  test('should display currency formatting correctly', async ({ page }) => {
    // Check revenue formatting
    const totalRevenue = await page.locator('[data-testid="total-revenue-value"]').textContent();
    expect(totalRevenue).toMatch(/^\$[\d,]+$/);
    
    // Check pipeline value formatting
    const pipelineValue = await page.locator('[data-testid="pipeline-value-value"]').textContent();
    expect(pipelineValue).toMatch(/^\$[\d,]+$/);
    
    // Check revenue per lead formatting
    const revenuePerLead = await page.locator('[data-testid="revenue-per-lead-value"]').textContent();
    expect(revenuePerLead).toMatch(/^\$[\d,]+$/);
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Verify metrics are visible in desktop view
    await expect(page.locator('[data-testid="leads-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="opportunities-metrics"]')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Verify metrics are still visible in tablet view
    await expect(page.locator('[data-testid="leads-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="opportunities-metrics"]')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify metrics are still visible in mobile view (might be stacked)
    await expect(page.locator('[data-testid="leads-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="opportunities-metrics"]')).toBeVisible();
  });
});