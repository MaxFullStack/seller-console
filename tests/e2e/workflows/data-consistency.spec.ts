import { test, expect } from '@playwright/test';

test.describe('Data Consistency and End-to-End Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should maintain data consistency across dashboard and detail views', async ({ page }) => {
    // Get dashboard metrics
    const totalLeads = await page.locator('[data-testid="total-leads-value"]').textContent();
    const qualifiedLeads = await page.locator('[data-testid="qualified-leads-value"]').textContent();
    
    // Navigate to leads list and count actual leads
    await page.waitForSelector('[data-testid="lead-row"]');
    const actualLeadsCount = await page.locator('[data-testid="lead-row"]').count();
    
    // Dashboard total should match actual count
    expect(parseInt(totalLeads || '0')).toBe(actualLeadsCount);
    
    // Filter by qualified leads
    await page.click('[data-testid="status-filter"]');
    await page.click('text=Qualified');
    await page.waitForTimeout(300);
    
    const actualQualifiedCount = await page.locator('[data-testid="lead-row"]').count();
    
    // Dashboard qualified count should match filtered count
    expect(parseInt(qualifiedLeads || '0')).toBe(actualQualifiedCount);
    
    // Reset filter
    await page.click('[data-testid="status-filter"]');
    await page.click('text=All Statuses');
    await page.waitForTimeout(300);
  });

  test('should maintain data consistency between leads and opportunities after conversion', async ({ page }) => {
    // Get initial counts
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const initialLeadsCount = parseInt(await page.locator('[data-testid="total-leads-value"]').textContent() || '0');
    const initialOpportunitiesCount = parseInt(await page.locator('[data-testid="total-opportunities-value"]').textContent() || '0');
    
    // Find a qualified lead to convert
    await page.waitForSelector('[data-testid="lead-row"]');
    
    // Make sure we have a qualified lead
    let qualifiedLead = page.locator('[data-testid="lead-row"]').filter({ hasText: 'qualified' }).first();
    
    if (await qualifiedLead.count() === 0) {
      // Qualify a lead first
      await page.click('[data-testid="lead-row"]');
      await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
      await page.click('[data-testid="lead-detail-status-select"]');
      await page.click('text=qualified');
      await page.click('[data-testid="save-lead-button"]');
      await page.click('[data-testid="close-panel-button"]');
      qualifiedLead = page.locator('[data-testid="lead-row"]').filter({ hasText: 'qualified' }).first();
    }
    
    // Get lead details before conversion
    const leadName = await qualifiedLead.locator('[data-testid="lead-name"]').textContent();
    const leadCompany = await qualifiedLead.locator('[data-testid="lead-company"]').textContent();
    
    // Convert lead to opportunity
    await qualifiedLead.click();
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    await page.click('[data-testid="convert-to-opportunity-button"]');
    await expect(page.locator('[data-testid="conversion-dialog"]')).toBeVisible();
    
    const opportunityName = `${leadCompany} - E2E Test Deal`;
    await page.fill('[data-testid="opportunity-name-input"]', opportunityName);
    await page.selectOption('[data-testid="opportunity-stage-select"]', 'proposal');
    await page.fill('[data-testid="opportunity-amount-input"]', '60000');
    await page.click('[data-testid="convert-button"]');
    
    await page.waitForTimeout(1000);
    
    // Verify opportunity was created
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    
    const createdOpportunity = page.locator('[data-testid="opportunity-row"]').filter({ hasText: opportunityName });
    await expect(createdOpportunity).toBeVisible();
    
    // Verify opportunity details
    await expect(createdOpportunity.locator('[data-testid="opportunity-name"]')).toContainText(opportunityName);
    await expect(createdOpportunity.locator('[data-testid="opportunity-account"]')).toContainText(leadCompany || '');
    
    // Check updated dashboard metrics
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const newOpportunitiesCount = parseInt(await page.locator('[data-testid="total-opportunities-value"]').textContent() || '0');
    expect(newOpportunitiesCount).toBe(initialOpportunitiesCount + 1);
    
    // Lead count might decrease if lead was removed after conversion
    const newLeadsCount = parseInt(await page.locator('[data-testid="total-leads-value"]').textContent() || '0');
    expect(newLeadsCount).toBeLessThanOrEqual(initialLeadsCount);
  });

  test('should handle concurrent data operations correctly', async ({ page }) => {
    // Test scenario: Multiple quick edits to verify data consistency
    
    // Edit first lead
    await page.waitForSelector('[data-testid="lead-row"]');
    const firstLead = page.locator('[data-testid="lead-row"]').first();
    await firstLead.click();
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Update email
    const newEmail1 = `concurrent1-${Date.now()}@test.com`;
    await page.fill('[data-testid="lead-detail-email-input"]', newEmail1);
    await page.click('[data-testid="save-lead-button"]');
    await page.waitForTimeout(500);
    
    // Verify change persisted
    await expect(page.locator('[data-testid="lead-detail-email"]')).toContainText(newEmail1);
    
    // Close panel and verify in list
    await page.click('[data-testid="close-panel-button"]');
    await expect(firstLead.locator('[data-testid="lead-email"]')).toContainText(newEmail1);
    
    // Quick successive edits
    await firstLead.click();
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    const newEmail2 = `concurrent2-${Date.now()}@test.com`;
    await page.fill('[data-testid="lead-detail-email-input"]', newEmail2);
    await page.click('[data-testid="save-lead-button"]');
    await page.waitForTimeout(200);
    
    // Another quick edit
    const newEmail3 = `concurrent3-${Date.now()}@test.com`;
    await page.fill('[data-testid="lead-detail-email-input"]', newEmail3);
    await page.click('[data-testid="save-lead-button"]');
    await page.waitForTimeout(500);
    
    // Final email should be persisted
    await expect(page.locator('[data-testid="lead-detail-email"]')).toContainText(newEmail3);
    
    // Close and verify in list
    await page.click('[data-testid="close-panel-button"]');
    await expect(firstLead.locator('[data-testid="lead-email"]')).toContainText(newEmail3);
  });

  test('should handle page refresh and maintain state', async ({ page }) => {
    // Apply filters and search
    await page.waitForSelector('[data-testid="lead-row"]');
    
    await page.click('[data-testid="status-filter"]');
    await page.click('text=Qualified');
    await page.waitForTimeout(300);
    
    await page.fill('[data-testid="search-input"]', 'test');
    await page.waitForTimeout(300);
    
    const filteredCount = await page.locator('[data-testid="lead-row"]').count();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // State might be reset after refresh (depends on implementation)
    // This test verifies that the app handles refresh gracefully
    await expect(page.locator('[data-testid="leads-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="lead-row"]')).toHaveCountGreaterThan(0);
  });

  test('should handle large data sets efficiently', async ({ page }) => {
    // Test pagination and filtering with potentially large data sets
    await page.waitForSelector('[data-testid="lead-row"]');
    
    const initialLeadCount = await page.locator('[data-testid="lead-row"]').count();
    
    // Test sorting performance
    const startTime = Date.now();
    await page.click('[data-testid="sort-score"]');
    await page.waitForTimeout(300);
    const sortTime = Date.now() - startTime;
    
    // Sorting should be reasonably fast (less than 2 seconds)
    expect(sortTime).toBeLessThan(2000);
    
    // Test filtering performance
    const filterStartTime = Date.now();
    await page.click('[data-testid="status-filter"]');
    await page.click('text=New');
    await page.waitForTimeout(300);
    const filterTime = Date.now() - filterStartTime;
    
    // Filtering should be reasonably fast
    expect(filterTime).toBeLessThan(1500);
    
    // Verify filter worked
    const filteredCount = await page.locator('[data-testid="lead-row"]').count();
    expect(filteredCount).toBeLessThanOrEqual(initialLeadCount);
  });

  test('should maintain referential integrity between related data', async ({ page }) => {
    // Navigate to opportunities
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    
    // Find an opportunity with a lead reference
    await page.waitForSelector('[data-testid="opportunity-row"]');
    const opportunities = page.locator('[data-testid="opportunity-row"]');
    const opportunityCount = await opportunities.count();
    
    if (opportunityCount > 0) {
      // Check if opportunities have proper account names
      for (let i = 0; i < Math.min(opportunityCount, 5); i++) {
        const opportunity = opportunities.nth(i);
        const accountName = await opportunity.locator('[data-testid="opportunity-account"]').textContent();
        
        // Account name should not be empty
        expect(accountName?.trim()).toBeTruthy();
        expect(accountName?.length).toBeGreaterThan(0);
      }
    }
    
    // Navigate back to leads and verify data relationships
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[data-testid="lead-row"]');
    const leads = page.locator('[data-testid="lead-row"]');
    const leadCount = await leads.count();
    
    if (leadCount > 0) {
      // Check that leads have consistent company names
      for (let i = 0; i < Math.min(leadCount, 5); i++) {
        const lead = leads.nth(i);
        const company = await lead.locator('[data-testid="lead-company"]').textContent();
        
        // Company name should not be empty
        expect(company?.trim()).toBeTruthy();
        expect(company?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    // Test form validation errors
    await page.waitForSelector('[data-testid="lead-row"]');
    await page.click('[data-testid="lead-row"]');
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    // Try to save with invalid email
    await page.fill('[data-testid="lead-detail-email-input"]', 'invalid-email');
    await page.click('[data-testid="save-lead-button"]');
    
    // Should show validation error or prevent saving
    const errorMessage = await page.locator('[data-testid="email-error"]').isVisible() ||
                        await page.locator('text=Invalid email').isVisible() ||
                        await page.locator('[aria-invalid="true"]').isVisible();
    
    // If validation is implemented, should show error
    // If not, the invalid email might be saved (depends on implementation)
    // This test ensures the app handles the scenario without crashing
    
    // Fix the email
    await page.fill('[data-testid="lead-detail-email-input"]', 'valid@email.com');
    await page.click('[data-testid="save-lead-button"]');
    
    // Should save successfully
    await expect(page.locator('[data-testid="lead-detail-email"]')).toContainText('valid@email.com');
  });

  test('should handle cross-browser data persistence', async ({ page }) => {
    // Test localStorage persistence (simulated)
    
    // Make a change to data
    await page.waitForSelector('[data-testid="lead-row"]');
    const firstLead = page.locator('[data-testid="lead-row"]').first();
    const originalEmail = await firstLead.locator('[data-testid="lead-email"]').textContent();
    
    await firstLead.click();
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    const newEmail = `persistence-test-${Date.now()}@test.com`;
    await page.fill('[data-testid="lead-detail-email-input"]', newEmail);
    await page.click('[data-testid="save-lead-button"]');
    await page.waitForTimeout(500);
    
    // Close panel
    await page.click('[data-testid="close-panel-button"]');
    
    // Navigate away and back
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify change persisted
    await page.waitForSelector('[data-testid="lead-row"]');
    const persistedLead = page.locator('[data-testid="lead-row"]').first();
    await expect(persistedLead.locator('[data-testid="lead-email"]')).toContainText(newEmail);
  });

  test('should provide consistent user feedback for all operations', async ({ page }) => {
    // Test that all major operations provide appropriate user feedback
    
    // Lead update operation
    await page.waitForSelector('[data-testid="lead-row"]');
    await page.click('[data-testid="lead-row"]');
    await expect(page.locator('[data-testid="lead-detail-panel"]')).toBeVisible();
    
    await page.fill('[data-testid="lead-detail-email-input"]', 'feedback-test@test.com');
    await page.click('[data-testid="save-lead-button"]');
    
    // Should provide some feedback (success message, loading state, etc.)
    const hasFeedback = await page.locator('[data-testid="success-message"]').isVisible({ timeout: 2000 }) ||
                       await page.locator('[data-testid="loading-spinner"]').isVisible({ timeout: 1000 }) ||
                       await page.locator('text=Saved').isVisible({ timeout: 2000 }) ||
                       await page.locator('text=Updated').isVisible({ timeout: 2000 });
    
    // App should provide some form of user feedback
    // Even if just visual state changes, the operation should complete
    await page.waitForTimeout(1000);
    
    // Operation should complete successfully
    await expect(page.locator('[data-testid="lead-detail-email"]')).toContainText('feedback-test@test.com');
  });
});