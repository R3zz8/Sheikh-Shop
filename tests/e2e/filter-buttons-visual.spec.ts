import { test, expect } from '@playwright/test';

test.describe('Filter Buttons Visual Regression', () => {
  test('should display the redesigned filter buttons correctly', async ({ page }) => {
    test.setTimeout(60000);
    // Navigate to a page where the EnhancedAISearch component is visible
    await page.goto('http://localhost:3000/search');

    // Wait for the search input to be visible to ensure the component has loaded
    await expect(page.locator('input[placeholder="Search with AI intelligence..."]').first()).toBeVisible();

    // Take a screenshot of the filter buttons area
    const filterButtons = await page.locator('.flex.flex-wrap.items-center.gap-2.mt-2').first();
    await expect(filterButtons).toHaveScreenshot('redesigned-filter-buttons.png');
  });
});
