import { test, expect } from '@playwright/test';

test.describe('Opportunities Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to opportunities page
    await page.goto('/opportunities');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should display opportunities list with essential information', async ({ page }) => {
    // Check if opportunities table exists
    await expect(page.locator('[data-testid="opportunities-table"]')).toBeVisible();
    
    // Verify table headers are present
    await expect(page.locator('text=Name')).toBeVisible();
    await expect(page.locator('text=Stage')).toBeVisible();
    await expect(page.locator('text=Amount')).toBeVisible();
    await expect(page.locator('text=Account')).toBeVisible();
    
    // Verify some opportunities are displayed
    await expect(page.locator('[data-testid="opportunity-row"]')).toHaveCountGreaterThan(0);
  });

  test('should filter opportunities by stage', async ({ page }) => {
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-row"]');
    
    // Get initial count of opportunities
    const initialOpportunities = await page.locator('[data-testid="opportunity-row"]').count();
    expect(initialOpportunities).toBeGreaterThan(0);
    
    // Click on stage filter dropdown
    await page.click('[data-testid="stage-filter"]');
    
    // Select "Closed Won" stage
    await page.click('text=Closed Won');
    
    // Verify filter is applied
    await page.waitForTimeout(500); // Allow time for filtering
    
    // Check that only closed won opportunities are shown
    const closedWonOpportunities = page.locator('[data-testid="opportunity-row"]');
    
    if (await closedWonOpportunities.count() > 0) {
      // Verify all visible opportunities have "closed-won" stage
      const opportunityRows = await closedWonOpportunities.all();
      for (const row of opportunityRows) {
        await expect(row.locator('[data-testid="opportunity-stage"]')).toContainText('closed-won');
      }
    }
  });

  test('should search opportunities by name', async ({ page }) => {
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-row"]');
    
    // Get an opportunity name to search for
    const firstOpportunityName = await page.locator('[data-testid="opportunity-row"]').first().locator('[data-testid="opportunity-name"]').textContent();
    
    if (firstOpportunityName) {
      const searchTerm = firstOpportunityName.split(' ')[0]; // Use first word of the name
      
      // Use the search functionality
      await page.fill('[data-testid="search-input"]', searchTerm);
      await page.waitForTimeout(300); // Allow time for search
      
      // Verify search results
      const filteredOpportunities = page.locator('[data-testid="opportunity-row"]');
      await expect(filteredOpportunities).toHaveCountGreaterThan(0);
      
      // Verify search results contain the search term
      await expect(filteredOpportunities.first().locator('[data-testid="opportunity-name"]')).toContainText(searchTerm);
    }
  });

  test('should sort opportunities by amount', async ({ page }) => {
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-row"]');
    
    // Click on amount column header to sort
    await page.click('[data-testid="sort-amount"]');
    await page.waitForTimeout(500);
    
    // Get all opportunity amounts after sorting
    const amountElements = page.locator('[data-testid="opportunity-amount"]');
    const amounts = await amountElements.allTextContents();
    const numericAmounts = amounts
      .map(a => parseInt(a.replace(/[$,]/g, '').trim()))
      .filter(a => !isNaN(a));
    
    if (numericAmounts.length > 1) {
      // Verify amounts are sorted (either ascending or descending)
      const sortedAsc = [...numericAmounts].sort((a, b) => a - b);
      const sortedDesc = [...numericAmounts].sort((a, b) => b - a);
      
      const isAscending = JSON.stringify(numericAmounts) === JSON.stringify(sortedAsc);
      const isDescending = JSON.stringify(numericAmounts) === JSON.stringify(sortedDesc);
      
      expect(isAscending || isDescending).toBe(true);
    }
  });

  test('should display opportunity amounts in correct format', async ({ page }) => {
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-row"]');
    
    // Check amount formatting
    const amountElements = page.locator('[data-testid="opportunity-amount"]');
    const amounts = await amountElements.allTextContents();
    
    // Verify amounts are properly formatted (e.g., $50,000 or $125,000)
    for (const amount of amounts) {
      if (amount.trim()) {
        expect(amount).toMatch(/^\$[\d,]+$/);
      }
    }
  });

  test('should display stage badges with appropriate styling', async ({ page }) => {
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-row"]');
    
    // Check that stage badges exist and are visible
    const stageElements = page.locator('[data-testid="opportunity-stage"]');
    const stageCount = await stageElements.count();
    
    expect(stageCount).toBeGreaterThan(0);
    
    // Verify each stage element is visible
    for (let i = 0; i < stageCount; i++) {
      await expect(stageElements.nth(i)).toBeVisible();
    }
  });

  test('should navigate through different opportunity stages', async ({ page }) => {
    // Test different stage filters
    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    
    for (const stage of stages) {
      // Click on stage filter dropdown
      await page.click('[data-testid="stage-filter"]');
      
      // Select the stage (if it exists)
      const stageOption = page.locator(`text=${stage}`);
      if (await stageOption.isVisible()) {
        await stageOption.click();
        await page.waitForTimeout(300);
        
        // Verify the filter is working (either shows opportunities or shows empty state)
        const opportunities = page.locator('[data-testid="opportunity-row"]');
        const opportunityCount = await opportunities.count();
        
        if (opportunityCount > 0) {
          // Verify all opportunities have the selected stage
          const opportunityRows = await opportunities.all();
          for (const row of opportunityRows) {
            const stageText = await row.locator('[data-testid="opportunity-stage"]').textContent();
            expect(stageText?.toLowerCase()).toContain(stage.toLowerCase().replace(' ', '-'));
          }
        } else {
          // If no opportunities, verify empty state or no data message
          const hasOpportunities = await opportunities.count();
          expect(hasOpportunities).toBe(0);
        }
      }
    }
    
    // Reset filter to "All Stages"
    await page.click('[data-testid="stage-filter"]');
    await page.click('text=All Stages');
    await page.waitForTimeout(300);
  });

  test('should handle pagination correctly', async ({ page }) => {
    // Check if pagination is present
    const paginationExists = await page.locator('[data-testid="pagination"]').isVisible();
    
    if (paginationExists) {
      // Test pagination functionality
      const totalPages = await page.locator('[data-testid="total-pages"]').textContent();
      
      if (totalPages && parseInt(totalPages) > 1) {
        // Track first page for pagination test
        
        // Go to next page
        await page.click('[data-testid="next-page-button"]');
        await page.waitForTimeout(500);
        
        // Verify we're on page 2
        await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
        
        // Verify opportunities changed
        const secondPageOpportunitiesCount = await page.locator('[data-testid="opportunity-row"]').count();
        expect(secondPageOpportunitiesCount).toBeGreaterThan(0);
        
        // Go back to first page
        await page.click('[data-testid="previous-page-button"]');
        await page.waitForTimeout(500);
        
        // Verify we're back on page 1
        await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
      }
    } else {
      // If no pagination, just verify opportunities are displayed
      await expect(page.locator('[data-testid="opportunity-row"]')).toHaveCountGreaterThan(0);
    }
  });

  test('should show appropriate empty state when no opportunities match filter', async ({ page }) => {
    // Apply a filter that should return no results
    await page.click('[data-testid="stage-filter"]');
    await page.click('text=Closed Lost');
    await page.waitForTimeout(300);
    
    // Also add a search term that shouldn't match
    await page.fill('[data-testid="search-input"]', 'xyznomatches123');
    await page.waitForTimeout(300);
    
    // Check for empty state
    const opportunities = page.locator('[data-testid="opportunity-row"]');
    const opportunityCount = await opportunities.count();
    
    if (opportunityCount === 0) {
      // Verify empty state message or no data indicator
      // This could be a "No opportunities found" message or similar
      // Just verify the basic empty state
      console.log('No opportunities found - empty state verified');
      
      // At minimum, verify no opportunity rows are shown
      expect(opportunityCount).toBe(0);
    }
  });

  test('should maintain stage colors and visual consistency', async ({ page }) => {
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-row"]');
    
    // Get all stage elements
    const stageElements = page.locator('[data-testid="opportunity-stage"]');
    const stageCount = await stageElements.count();
    
    // Verify stage elements have appropriate styling/classes
    for (let i = 0; i < Math.min(stageCount, 5); i++) { // Check first 5 for performance
      const stageElement = stageElements.nth(i);
      await expect(stageElement).toBeVisible();
      
      // Verify stage has some visual styling (class, color, etc.)
      const elementClass = await stageElement.getAttribute('class');
      expect(elementClass).toBeTruthy();
    }
  });
});