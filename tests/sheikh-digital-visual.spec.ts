import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Sheikh Digital Visual Verification', () => {
  const targetUrl = 'http://localhost:3000/sheikh-digital';

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
        // Ignore Sentry chunk 404s/500s or cloudflare static decoders that are unrelated to the local code execution
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

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // 1. Title verification
    await expect(page).toHaveTitle(/شیخ دیجیتال | فروشگاه بزرگ شیخ/);

    // 2. Headings & copy verification (wait for mount of the main title)
    const titleHeading = page.locator('h1', { hasText: 'محصولات دیجیتال شیخ' });
    await titleHeading.waitFor({ state: 'visible', timeout: 15000 });
    await expect(titleHeading).toContainText('محصولات دیجیتال شیخ');

    // 3. Scroll to products section to ensure layout updates and image downloads trigger
    const productsSection = page.locator('#digital-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    // Wait specifically for visible product cards to load
    const visibleProductCards = page.locator('#digital-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });

    // Give a brief moment for layout/animations/images to fully settle
    await page.waitForTimeout(3000);

    // 4. Exactly 2 products should be visible (mock db has 2 digital products seeded)
    await expect(visibleProductCards).toHaveCount(2);

    // Verify product 1: اسپیکر ایستاده شیخ مدل Luxury X9
    const product1 = visibleProductCards.nth(0);
    await expect(product1.locator('h2')).toContainText('اسپیکر ایستاده شیخ مدل Luxury X9');

    // Verify native Toman price rendered correctly in Persian characters
    await expect(product1.locator('p.text-xl')).toContainText('۱۸٬۹۰۰٬۰۰۰ تومان');

    // Verify product 2: اسپیکر هوشمند شیخ مدل Royal Sound Pro
    const product2 = visibleProductCards.nth(1);
    await expect(product2.locator('h2')).toContainText('اسپیکر هوشمند شیخ مدل Royal Sound Pro');
    await expect(product2.locator('p.text-xl')).toContainText('۲۴٬۵۰۰٬۰۰۰ تومان');

    // Capture desktop screenshot
    await page.screenshot({ path: 'verification/desktop-view.png', fullPage: true });
    console.log('✅ Desktop screenshot generated successfully.');

    // Confirm that clicking a product card opens its details page successfully
    console.log('Testing product details navigation...');
    const productLink = product1.locator('a').first();
    await productLink.click();
    await page.waitForURL('**/products/luxury-x9-speaker', { timeout: 10000 });
    console.log('✅ Successfully navigated to product detail page: /products/luxury-x9-speaker');

    // Assert zero critical runtime/console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('tablet screenshot and assertions', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const productsSection = page.locator('#digital-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#digital-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    await expect(visibleProductCards).toHaveCount(2);

    // Capture tablet screenshot
    await page.screenshot({ path: 'verification/tablet-view.png', fullPage: true });
    console.log('✅ Tablet screenshot generated successfully.');
  });

  test('mobile screenshot and assertions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const productsSection = page.locator('#digital-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#digital-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    await expect(visibleProductCards).toHaveCount(2);

    // Capture mobile screenshot
    await page.screenshot({ path: 'verification/mobile-view.png', fullPage: true });
    console.log('✅ Mobile screenshot generated successfully.');
  });

  test('small-mobile screenshot and assertions', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const productsSection = page.locator('#digital-products-section');
    await productsSection.waitFor({ state: 'visible', timeout: 15000 });
    await productsSection.scrollIntoViewIfNeeded();

    const visibleProductCards = page.locator('#digital-products-section .product-card').filter({ visible: true });
    await visibleProductCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    await expect(visibleProductCards).toHaveCount(2);

    // Capture small mobile screenshot
    await page.screenshot({ path: 'verification/small-mobile-view.png', fullPage: true });
    console.log('✅ Small Mobile screenshot generated successfully.');
  });
});
