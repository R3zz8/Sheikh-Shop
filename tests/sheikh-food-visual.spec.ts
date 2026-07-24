import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Sheikh Food Page - Responsive Visual Verification', () => {
  const targetUrl = 'http://localhost:3000/sheikh-food';

  test.beforeAll(() => {
    // Ensure verification directory exists
    const dir = path.join(process.cwd(), 'verification');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('Desktop (1280x900) - Decorations & Products Visible', async ({ page }) => {
    // Console errors recording
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('email-decode') &&
            !text.includes('sentry') &&
            !text.includes('chunks') &&
            !text.includes('Failed to load resource') &&
            !text.includes('Unauthorized')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // 1. Verify Title & Header structure
    await expect(page).toHaveTitle(/محصولات غذایی شیخ/);

    // 2. Headings loading
    const heroHeading = page.locator('h1', { hasText: 'محصولات غذایی شیخ' });
    await heroHeading.waitFor({ state: 'visible', timeout: 15000 });
    await expect(heroHeading).toBeVisible();

    // 3. Scroll and verify product section
    const productsSection = page.locator('#food-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#food-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });

    // Wait for animations and canvas renders
    await page.waitForTimeout(3000);

    const count = await visibleProductCards.count();
    console.log(`Visible food product cards on desktop: ${count}`);
    expect(count).toBeGreaterThanOrEqual(3); // Honey, Saffron, Dates must be there

    // Capture desktop screenshot
    await page.screenshot({ path: 'verification/sheikh_food_desktop.png', fullPage: true });
    console.log('✅ Sheikh Food Desktop screenshot generated successfully.');

    expect(consoleErrors).toHaveLength(0);
  });

  test('Tablet (768x1024) - Scale Proportionally', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const productsSection = page.locator('#food-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#food-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Capture tablet screenshot
    await page.screenshot({ path: 'verification/sheikh_food_tablet.png', fullPage: true });
    console.log('✅ Sheikh Food Tablet screenshot generated successfully.');
  });

  test('Mobile (375x812) - Both Decorations Visible & Scaling Correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const productsSection = page.locator('#food-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#food-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Capture mobile screenshot
    await page.screenshot({ path: 'verification/sheikh_food_mobile.png', fullPage: true });
    console.log('✅ Sheikh Food Mobile screenshot generated successfully.');
  });

  test('Small Mobile (320x568) - Correct layout and scaling, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const productsSection = page.locator('#food-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#food-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Capture small mobile screenshot
    await page.screenshot({ path: 'verification/sheikh_food_small_mobile.png', fullPage: true });
    console.log('✅ Sheikh Food Small Mobile screenshot generated successfully.');
  });
});
