import { test, expect } from '@playwright/test';

test.describe('Lead to Opportunity Conversion Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to leads page
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete full lead to opportunity conversion flow', async ({ page }) => {
    // Step 1: Find a qualified lead to convert
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Look for a qualified lead or update a lead to qualified
    let qualifiedLeadRow = page.locator('[data-testid="lead-row"]').filter({ hasText: 'qualified' }).first();
    
    if (await qualifiedLeadRow.count() === 0) {
      // If no qualified leads, qualify the first lead
      await page.click('[data-testid="lead-row"]');
      await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
      
      // Update status to qualified
      await page.click('[data-testid="lead-detail-status-select"]');
      await page.click('text=qualified');
      await page.click('[data-testid="save-lead-button"]');
      
      // Close panel
      await page.click('[data-testid="close-panel-button"]');
      
      // Now find the qualified lead
      qualifiedLeadRow = page.locator('[data-testid="lead-row"]').filter({ hasText: 'qualified' }).first();
    }
    
    // Step 2: Get lead information for conversion
    const leadName = await qualifiedLeadRow.locator('[data-testid="lead-name"]').textContent();
    const leadCompany = await qualifiedLeadRow.locator('[data-testid="lead-company"]').textContent();
    
    expect(leadName).toBeTruthy();
    expect(leadCompany).toBeTruthy();
    
    // Step 3: Open conversion dialog
    await qualifiedLeadRow.click();
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Click convert to opportunity button
    await page.click('[data-testid="convert-to-opportunity-button"]');
    
    // Verify conversion dialog opens
    await expect(page.locator('[data-testid="conversion-dialog"]')).toBeVisible();
    
    // Step 4: Fill opportunity details
    const opportunityName = `${leadCompany} - Sales Deal`;
    const opportunityAmount = '50000';
    
    await page.fill('[data-testid="opportunity-name-input"]', opportunityName);
    await page.selectOption('[data-testid="opportunity-stage-select"]', 'proposal');
    await page.fill('[data-testid="opportunity-amount-input"]', opportunityAmount);
    
    // Step 5: Submit conversion
    await page.click('[data-testid="convert-button"]');
    
    // Wait for conversion to complete
    await page.waitForTimeout(1000);
    
    // Verify conversion success (dialog should close)
    await expect(page.locator('[data-testid="conversion-dialog"]')).not.toBeVisible();
    
    // Step 6: Verify opportunity was created
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    
    // Look for the created opportunity
    const createdOpportunity = page.locator('[data-testid="opportunity-row"]').filter({ hasText: opportunityName });
    await expect(createdOpportunity).toBeVisible();
    
    // Verify opportunity details
    await expect(createdOpportunity.locator('[data-testid="opportunity-name"]')).toContainText(opportunityName);
    await expect(createdOpportunity.locator('[data-testid="opportunity-stage"]')).toContainText('proposal');
    await expect(createdOpportunity.locator('[data-testid="opportunity-amount"]')).toContainText('50,000');
    
    // Step 7: Verify lead was removed from leads list
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // The original lead should no longer exist (or be marked as converted)
    const originalLead = page.locator('[data-testid="lead-row"]').filter({ hasText: leadName || '' });
    
    // Lead should either not exist or be marked differently
    const leadCount = await originalLead.count();
    // In some implementations, lead might be removed, in others it might be marked as converted
    // This test accommodates both approaches
    if (leadCount > 0) {
      // If lead still exists, it should not have 'qualified' status anymore
      const leadStatus = await originalLead.locator('[data-testid="lead-status"]').textContent();
      expect(leadStatus).not.toBe('qualified');
    }
  });

  test('should validate opportunity conversion form', async ({ page }) => {
    // Find and select a lead
    await page.waitForSelector('[data-testid="lead-row"]');
    await page.click('[data-testid="lead-row"]');
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Open conversion dialog
    await page.click('[data-testid="convert-to-opportunity-button"]');
    await expect(page.locator('[data-testid="conversion-dialog"]')).toBeVisible();
    
    // Test form validation - submit empty form
    await page.click('[data-testid="convert-button"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    
    // Fill only name and test amount validation
    await page.fill('[data-testid="opportunity-name-input"]', 'Test Opportunity');
    await page.fill('[data-testid="opportunity-amount-input"]', '-1000'); // Invalid negative amount
    await page.click('[data-testid="convert-button"]');
    
    // Should show amount validation error
    await expect(page.locator('[data-testid="amount-error"]')).toBeVisible();
    
    // Fix amount
    await page.fill('[data-testid="opportunity-amount-input"]', '25000');
    
    // Select stage
    await page.selectOption('[data-testid="opportunity-stage-select"]', 'qualification');
    
    // Now form should be valid
    await page.click('[data-testid="convert-button"]');
    
    // Conversion should proceed
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="conversion-dialog"]')).not.toBeVisible();
  });

  test('should handle conversion cancellation', async ({ page }) => {
    // Find and select a lead
    await page.waitForSelector('[data-testid="lead-row"]');
    await page.click('[data-testid="lead-row"]');
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Open conversion dialog
    await page.click('[data-testid="convert-to-opportunity-button"]');
    await expect(page.locator('[data-testid="conversion-dialog"]')).toBeVisible();
    
    // Fill some data
    await page.fill('[data-testid="opportunity-name-input"]', 'Cancelled Opportunity');
    await page.fill('[data-testid="opportunity-amount-input"]', '75000');
    
    // Cancel conversion
    await page.click('[data-testid="cancel-conversion-button"]');
    
    // Dialog should close
    await expect(page.locator('[data-testid="conversion-dialog"]')).not.toBeVisible();
    
    // Should still be on lead detail panel
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Lead should remain unchanged
    const leadStatus = await page.locator('[data-testid="lead-detail-status"]').textContent();
    expect(leadStatus).toBeTruthy();
  });

  test('should update dashboard metrics after conversion', async ({ page }) => {
    // Get initial metrics
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.locator('[data-testid="total-leads-value"]').textContent();
    const initialOpportunitiesCount = await page.locator('[data-testid="total-opportunities-value"]').textContent();
    const initialRevenue = await page.locator('[data-testid="total-revenue-value"]').textContent();
    
    // Convert a lead
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Find a qualified lead or make one qualified
    let qualifiedLeadRow = page.locator('[data-testid="lead-row"]').filter({ hasText: 'qualified' }).first();
    
    if (await qualifiedLeadRow.count() === 0) {
      await page.click('[data-testid="lead-row"]');
      await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
      await page.click('[data-testid="lead-detail-status-select"]');
      await page.click('text=qualified');
      await page.click('[data-testid="save-lead-button"]');
      await page.click('[data-testid="close-panel-button"]');
      qualifiedLeadRow = page.locator('[data-testid="lead-row"]').filter({ hasText: 'qualified' }).first();
    }
    
    // Convert the lead
    await qualifiedLeadRow.click();
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    await page.click('[data-testid="convert-to-opportunity-button"]');
    await expect(page.locator('[data-testid="conversion-dialog"]')).toBeVisible();
    
    await page.fill('[data-testid="opportunity-name-input"]', 'Metrics Test Opportunity');
    await page.selectOption('[data-testid="opportunity-stage-select"]', 'closed-won');
    await page.fill('[data-testid="opportunity-amount-input"]', '100000');
    await page.click('[data-testid="convert-button"]');
    
    await page.waitForTimeout(1000);
    
    // Navigate back to dashboard and check updated metrics
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Metrics should be updated
    const newOpportunitiesCount = await page.locator('[data-testid="total-opportunities-value"]').textContent();
    const newRevenue = await page.locator('[data-testid="total-revenue-value"]').textContent();
    
    // Opportunities count should increase
    const initialOppCount = parseInt(initialOpportunitiesCount || '0');
    const newOppCount = parseInt(newOpportunitiesCount || '0');
    expect(newOppCount).toBeGreaterThan(initialOppCount);
    
    // Revenue should increase (if we created a closed-won opportunity)
    const initialRevenueValue = parseInt(initialRevenue?.replace(/[$,]/g, '') || '0');
    const newRevenueValue = parseInt(newRevenue?.replace(/[$,]/g, '') || '0');
    expect(newRevenueValue).toBeGreaterThanOrEqual(initialRevenueValue);
  });

  test('should handle multiple conversion attempts gracefully', async ({ page }) => {
    // Find a lead and start conversion
    await page.waitForSelector('[data-testid="lead-row"]');
    await page.click('[data-testid="lead-row"]');
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // First conversion attempt
    await page.click('[data-testid="convert-to-opportunity-button"]');
    await expect(page.locator('[data-testid="conversion-dialog"]')).toBeVisible();
    
    // Fill and submit
    await page.fill('[data-testid="opportunity-name-input"]', 'First Attempt');
    await page.selectOption('[data-testid="opportunity-stage-select"]', 'proposal');
    await page.fill('[data-testid="opportunity-amount-input"]', '30000');
    await page.click('[data-testid="convert-button"]');
    
    await page.waitForTimeout(1000);
    
    // Try to convert the same lead again (should either be prevented or handled gracefully)
    if (await page.locator('[data-testid="lead-detail-panel"]').isVisible()) {
      // If panel is still open, lead conversion might have failed
      // Or the lead might still be available for another conversion
      const convertButton = page.locator('[data-testid="convert-to-opportunity-button"]');
      
      if (await convertButton.isVisible()) {
        // System allows multiple conversions - test that it works
        await convertButton.click();
        await expect(page.locator('[data-testid="conversion-dialog"]')).toBeVisible();
        await page.click('[data-testid="cancel-conversion-button"]');
      }
    }
    
    // Verify system state is consistent
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    
    // Should have at least one opportunity with our test name
    const createdOpportunity = page.locator('[data-testid="opportunity-row"]').filter({ hasText: 'First Attempt' });
    await expect(createdOpportunity).toHaveCountGreaterThanOrEqual(1);
  });
});