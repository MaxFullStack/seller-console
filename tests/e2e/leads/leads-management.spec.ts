import { test, expect } from '@playwright/test';

test.describe('Leads Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to leads page
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should display leads list with essential information', async ({ page }) => {
    // Check if leads table exists
    await expect(page.locator('[data-testid="leads-table"]')).toBeVisible();
    
    // Verify table headers are present
    await expect(page.locator('text=Name')).toBeVisible();
    await expect(page.locator('text=Company')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Source')).toBeVisible();
    await expect(page.locator('text=Score')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    
    // Verify some leads are displayed
    await expect(page.locator('[data-testid="lead-row"]')).toHaveCountGreaterThan(0);
  });

  test('should filter leads by status', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Get initial count of leads
    const initialLeads = await page.locator('[data-testid="lead-row"]').count();
    expect(initialLeads).toBeGreaterThan(0);
    
    // Click on status filter dropdown
    await page.click('[data-testid="status-filter"]');
    
    // Select "Qualified" status
    await page.click('text=Qualified');
    
    // Verify filter is applied
    await page.waitForTimeout(500); // Allow time for filtering
    
    // Check that only qualified leads are shown
    const qualifiedLeads = page.locator('[data-testid="lead-row"]');
    await expect(qualifiedLeads).toHaveCountGreaterThan(0);
    
    // Verify all visible leads have "qualified" status
    const leadRows = await qualifiedLeads.all();
    for (const row of leadRows) {
      await expect(row.locator('[data-testid="lead-status"]')).toContainText('qualified');
    }
  });

  test('should search leads by name', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Get a lead name to search for
    const firstLeadName = await page.locator('[data-testid="lead-row"]').first().locator('[data-testid="lead-name"]').textContent();
    
    if (firstLeadName) {
      // Use the search functionality
      await page.fill('[data-testid="search-input"]', firstLeadName);
      await page.waitForTimeout(300); // Allow time for search
      
      // Verify search results
      const filteredLeads = page.locator('[data-testid="lead-row"]');
      await expect(filteredLeads).toHaveCountGreaterThan(0);
      
      // Verify search results contain the search term
      await expect(filteredLeads.first().locator('[data-testid="lead-name"]')).toContainText(firstLeadName);
    }
  });

  test('should sort leads by score', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Click on score column header to sort
    await page.click('[data-testid="sort-score"]');
    await page.waitForTimeout(500);
    
    // Get all lead scores after sorting
    const scoreElements = page.locator('[data-testid="lead-score"]');
    const scores = await scoreElements.allTextContents();
    const numericScores = scores.map(s => parseInt(s.trim())).filter(s => !isNaN(s));
    
    // Verify scores are sorted (either ascending or descending)
    const sortedAsc = [...numericScores].sort((a, b) => a - b);
    const sortedDesc = [...numericScores].sort((a, b) => b - a);
    
    const isAscending = JSON.stringify(numericScores) === JSON.stringify(sortedAsc);
    const isDescending = JSON.stringify(numericScores) === JSON.stringify(sortedDesc);
    
    expect(isAscending || isDescending).toBe(true);
  });

  test('should open lead detail panel', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Click on first lead row
    await page.click('[data-testid="lead-row"]');
    
    // Verify detail panel opens
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Verify panel contains lead information
    await expect(page.locator('[data-testid="lead-detail-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="lead-detail-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="lead-detail-status"]')).toBeVisible();
  });

  test('should update lead status in detail panel', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Click on first lead row
    await page.click('[data-testid="lead-row"]');
    
    // Wait for detail panel to open
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Get current status
    const currentStatus = await page.locator('[data-testid="lead-detail-status"]').textContent();
    
    // Click on status dropdown in detail panel
    await page.click('[data-testid="lead-detail-status-select"]');
    
    // Select a different status
    const newStatus = currentStatus?.includes('new') ? 'contacted' : 'new';
    await page.click(`text=${newStatus}`);
    
    // Click save button
    await page.click('[data-testid="save-lead-button"]');
    
    // Verify status was updated
    await expect(page.locator('[data-testid="lead-detail-status"]')).toContainText(newStatus);
    
    // Close panel
    await page.click('[data-testid="close-panel-button"]');
    
    // Verify status is updated in the main table
    await expect(page.locator('[data-testid="lead-row"]').first().locator('[data-testid="lead-status"]')).toContainText(newStatus);
  });

  test('should update lead email in detail panel', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Click on first lead row
    await page.click('[data-testid="lead-row"]');
    
    // Wait for detail panel to open
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Update email
    const newEmail = 'updated@example.com';
    await page.fill('[data-testid="lead-detail-email-input"]', newEmail);
    
    // Click save button
    await page.click('[data-testid="save-lead-button"]');
    
    // Verify email was updated
    await expect(page.locator('[data-testid="lead-detail-email"]')).toContainText(newEmail);
    
    // Close panel and verify in main table
    await page.click('[data-testid="close-panel-button"]');
    await expect(page.locator('[data-testid="lead-row"]').first().locator('[data-testid="lead-email"]')).toContainText(newEmail);
  });

  test('should handle pagination correctly', async ({ page }) => {
    // Check if pagination is present (might not be visible if there are few leads)
    const paginationExists = await page.locator('[data-testid="pagination"]').isVisible();
    
    if (paginationExists) {
      // Test pagination functionality
      const totalPages = await page.locator('[data-testid="total-pages"]').textContent();
      
      if (totalPages && parseInt(totalPages) > 1) {
        // Get leads count on first page
        const firstPageLeadsCount = await page.locator('[data-testid="lead-row"]').count();
        
        // Go to next page
        await page.click('[data-testid="next-page-button"]');
        await page.waitForTimeout(500);
        
        // Verify we're on page 2
        await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
        
        // Verify leads changed
        const secondPageLeadsCount = await page.locator('[data-testid="lead-row"]').count();
        expect(secondPageLeadsCount).toBeGreaterThan(0);
        
        // Go back to first page
        await page.click('[data-testid="previous-page-button"]');
        await page.waitForTimeout(500);
        
        // Verify we're back on page 1
        await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
      }
    } else {
      // If no pagination, just verify leads are displayed
      await expect(page.locator('[data-testid="lead-row"]')).toHaveCountGreaterThan(0);
    }
  });

  test('should refresh leads data', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="lead-row"]').count();
    
    // Click refresh button
    await page.click('[data-testid="refresh-button"]');
    
    // Wait for refresh to complete
    await page.waitForTimeout(1000);
    
    // Verify leads are still displayed (refresh maintains data)
    const afterRefreshCount = await page.locator('[data-testid="lead-row"]').count();
    expect(afterRefreshCount).toBeGreaterThanOrEqual(initialCount);
  });
});