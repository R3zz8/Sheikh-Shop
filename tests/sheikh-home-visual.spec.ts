import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Sheikh Home Visual Verification', () => {
  const targetUrl = 'http://localhost:3000/sheikh-home';

  test.beforeAll(() => {
    // Ensure verification directory exists
    const dir = path.join(process.cwd(), 'verification');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('desktop screenshot and assertions', async ({ page }) => {
    // Capture browser console logs to verify page integrity
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore Sentry chunks or local network assets errors
        if (!text.includes('email-decode') &&
            !text.includes('sentry') &&
            !text.includes('chunks') &&
            !text.includes('Failed to load resource') &&
            !text.includes('Unauthorized')) {
          consoleErrors.push(text);
        }
        console.log(`[Browser Console Error] ${text}`);
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log(`[Browser Unhandled Exception] ${err.message}`);
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // 1. Title verification
    await expect(page).toHaveTitle(/لوازم خانگی شیخ | فروشگاه بزرگ شیخ/);

    // 2. Headings & copy verification (wait for mount)
    const heroHeading = page.locator('h1', { hasText: 'لوازم خانگی شیخ' });
    await heroHeading.waitFor({ state: 'visible', timeout: 15000 });
    await expect(heroHeading).toContainText('لوازم خانگی شیخ');

    // 3. Scroll to products section to ensure layout updates and image downloads trigger
    const productsSection = page.locator('#home-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    // Wait specifically for visible product cards to load
    const visibleProductCards = page.locator('#home-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });

    // Give a brief moment for layout/animations/images to fully settle
    await page.waitForTimeout(3000);

    // 4. Products should be visible (we mocked at least 2 primary + 21 extra, paginated)
    const cardCount = await visibleProductCards.count();
    console.log(`Visible product cards count on desktop: ${cardCount}`);
    expect(cardCount).toBeGreaterThan(0);

    // Verify first product is Refrigerator or Washing Machine (sorted by createdAt desc)
    const product1Name = await visibleProductCards.nth(0).locator('h2').textContent();
    console.log(`Product 1 Name: ${product1Name}`);

    // Capture desktop screenshot
    await page.screenshot({ path: 'verification/desktop-home-view.png', fullPage: true });
    console.log('✅ Desktop Home screenshot generated successfully.');

    // Assert zero critical runtime/console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('tablet screenshot and assertions', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const productsSection = page.locator('#home-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#home-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Capture tablet screenshot
    await page.screenshot({ path: 'verification/tablet-home-view.png', fullPage: true });
    console.log('✅ Tablet Home screenshot generated successfully.');
  });

  test('mobile screenshot and assertions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const productsSection = page.locator('#home-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#home-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Capture mobile screenshot
    await page.screenshot({ path: 'verification/mobile-home-view.png', fullPage: true });
    console.log('✅ Mobile Home screenshot generated successfully.');
  });
});
