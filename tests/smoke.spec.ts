import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests', () => {
  test('should load the homepage and have the correct title', async ({ page }) => {
    // Note: The base URL for this test will be set in the Playwright config
    // or passed as an environment variable in the CI/CD pipeline.
    // Example: process.env.DEPLOYED_URL
    await page.goto('/');

    // Check for a key element that should be visible on the homepage.
    // Using a regular expression to make it flexible.
    const heading = page.getByRole('heading', { name: /Welcome to Sheikh Shop/i });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Verify the page title for SEO and correctness.
    await expect(page).toHaveTitle(/Sheikh Shop/);
  });
});
