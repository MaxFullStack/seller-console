# End-to-End Testing with Playwright

This directory contains comprehensive E2E tests for the Seller Console application using Playwright.

## Overview

The E2E test suite covers complete user workflows and ensures the application works correctly from a user's perspective. Tests are organized by feature areas and user workflows.

## Test Structure

### `/leads/`
- **leads-management.spec.ts**: Complete lead management functionality
  - Display and filtering of leads
  - Search and sorting capabilities
  - Lead detail panel interactions
  - Status and email updates
  - Pagination handling

### `/opportunities/`
- **opportunities-management.spec.ts**: Opportunity management features
  - Opportunity listing and filtering
  - Stage-based filtering and sorting
  - Amount formatting and display
  - Search functionality

### `/dashboard/`
- **dashboard-metrics.spec.ts**: Dashboard metrics and analytics
  - Leads and opportunities metrics
  - Revenue calculations
  - Conversion rates and win rates
  - Real-time metric updates

### `/workflows/`
- **lead-to-opportunity-conversion.spec.ts**: Complete conversion workflow
  - End-to-end lead qualification and conversion
  - Form validation and error handling
  - Data consistency after conversion
  - Dashboard metric updates

- **navigation-and-ux.spec.ts**: Navigation and user experience
  - Page navigation and routing
  - Mobile responsiveness
  - Accessibility features
  - Loading states and error handling

- **data-consistency.spec.ts**: Data integrity and consistency
  - Cross-page data consistency
  - Concurrent operations handling
  - State persistence
  - Error scenario handling

## Running Tests

### Prerequisites
1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install`

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with browser visible (headed mode)
npm run test:e2e:headed

# Run tests with Playwright UI (interactive mode)
npm run test:e2e:ui

# Debug tests step by step
npm run test:e2e:debug

# Run both unit and E2E tests
npm run test:all
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test leads-management

# Run specific test case
npx playwright test --grep "should display leads list"

# Run tests for specific browser
npx playwright test --project=chromium
```

## Test Data Strategy

### Mock Data
- Tests use the application's built-in mock data
- Mock data provides consistent baseline for testing
- Tests create additional test data as needed

### Data Isolation
- Each test starts with a clean state
- Tests clean up after themselves when possible
- Local storage is reset between test runs

### Test Data Patterns
- Use descriptive names with timestamps for test data
- Verify data persistence across navigation
- Test both valid and invalid data scenarios

## Browser Coverage

Tests run on multiple browsers:
- **Chromium** (Google Chrome)
- **Firefox**
- **WebKit** (Safari)

Mobile viewports are also tested for responsive design.

## Test Selectors

Tests use `data-testid` attributes for reliable element selection:

```html
<!-- Example test selectors -->
<table data-testid="leads-table">
  <tr data-testid="lead-row">
    <td data-testid="lead-name">John Doe</td>
    <td data-testid="lead-email">john@example.com</td>
    <td data-testid="lead-status">qualified</td>
  </tr>
</table>
```

## Key Testing Patterns

### Page Object Model
Tests use direct page interactions but follow consistent patterns:
- Wait for elements to be visible before interaction
- Use appropriate timeouts for async operations
- Verify state changes after actions

### Error Handling
- Tests verify graceful error handling
- Form validation is thoroughly tested
- Network errors and edge cases are covered

### Performance Testing
- Tests include basic performance checks
- Sorting and filtering operations are timed
- Large data set handling is verified

## Continuous Integration

E2E tests are designed to run in CI/CD environments:
- Tests use headless mode by default
- Retry logic for flaky tests
- Comprehensive reporting with screenshots and videos

## Debugging Tests

### Local Debugging
1. Use `npm run test:e2e:headed` to see browser actions
2. Use `npm run test:e2e:debug` for step-by-step debugging
3. Add `await page.pause()` in tests for manual debugging

### CI Debugging
- Screenshots are captured on test failures
- Videos are recorded for failed test runs
- Trace files provide detailed execution information

## Best Practices

### Writing Tests
1. Keep tests focused on user workflows
2. Use descriptive test names
3. Follow the AAA pattern (Arrange, Act, Assert)
4. Make tests independent and idempotent

### Maintenance
1. Update selectors when UI changes
2. Keep test data realistic but minimal
3. Regular review of test coverage
4. Monitor test execution times

### Reliability
1. Use explicit waits instead of fixed timeouts
2. Handle loading states appropriately
3. Verify state changes after actions
4. Add retry logic for known flaky operations

## Coverage Areas

### Functional Testing
- ✅ Lead management (CRUD operations)
- ✅ Opportunity management
- ✅ Lead to opportunity conversion
- ✅ Dashboard metrics calculation
- ✅ Search and filtering
- ✅ Data persistence

### User Experience Testing
- ✅ Navigation and routing
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Accessibility basics

### Data Integrity Testing
- ✅ Cross-page consistency
- ✅ Concurrent operations
- ✅ State persistence
- ✅ Referential integrity
- ✅ Error recovery

## Future Enhancements

Potential areas for additional E2E testing:
- Advanced dashboard filtering
- Bulk operations
- Export functionality
- Advanced search features
- Integration with external APIs
- Performance under load

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout values
   - Check for loading states
   - Verify selectors are correct

2. **Flaky tests**
   - Add appropriate waits
   - Check for race conditions
   - Verify test isolation

3. **Selector not found**
   - Update test selectors
   - Check if UI has changed
   - Verify element visibility

### Getting Help

- Check Playwright documentation: https://playwright.dev
- Review test logs and screenshots
- Use browser developer tools for selector validation
- Enable debug mode for detailed execution traces