
import { test, expect } from '@playwright/test';

test.describe('Mobile Carousel Management', () => {
  test('should allow a superadmin to view the mobile carousel dashboard', async ({ page }) => {
    // Set a long timeout for the entire test
    test.setTimeout(120000);

    // Navigate to the login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

    // Fill in the login form
    await page.fill('input[name="email"]', 'rezadhu615@gmail.com');
    await page.fill('input[name="password"]', 'Temp@1374');

    // Click the sign-in button
    await page.click('button[type="submit"]');

    // Wait for navigation to the dashboard
    await page.waitForURL('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });

    // Navigate to the mobile carousel page
    await page.goto('http://localhost:3000/dashboard/mobile-carousel', { waitUntil: 'networkidle' });

    // Wait for the main content to be visible
    await page.waitForSelector('h1:has-text("Mobile Carousel Management")');

    // Take a screenshot of the dashboard
    await page.screenshot({ path: 'mobile-carousel-dashboard.png', fullPage: true });

    // Assert that the page title is correct
    await expect(page.locator('h1')).toHaveText('Mobile Carousel Management');
  });
});
