import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Luxury Unboxing Experience Visual Verification', () => {
  const targetUrl = 'http://localhost:3000/products/luxury-x9-speaker';

  test.beforeAll(() => {
    // Ensure luxury unboxing verification directories exist
    const dir = path.join(process.cwd(), 'verification', 'luxury-unboxing');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('Desktop Cinematic Unboxing Sequence', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Listen to console and page errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected third party external CDN issues or CSP blocks
        if (!text.includes('email-decode') &&
            !text.includes('sentry') &&
            !text.includes('chunks') &&
            !text.includes('googletagmanager') &&
            !text.includes('google') &&
            !text.includes('Content Security Policy') &&
            !text.includes('Failed to load resource')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // 1. Locate the luxury unboxing section and its CTA
    const unboxTrigger = page.locator('button', { hasText: 'مشاهده تجربه آنباکس کالا' });
    await unboxTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await unboxTrigger.scrollIntoViewIfNeeded();

    // Take screenshot of detail page layout with the unboxing trigger
    await page.waitForTimeout(1000);

    // 2. Click the trigger to start unboxing modal (in Closed Box status)
    console.log('Clicking unbox trigger...');
    await unboxTrigger.click();

    // Wait for the modal box overlay to fade in
    const unboxingTitle = page.locator('#unboxing-title');
    await unboxingTitle.waitFor({ state: 'visible', timeout: 10000 });

    // Save Closed Box Screenshot
    await page.screenshot({ path: 'verification/luxury-unboxing/desktop-closed-box.png' });
    console.log('✅ Desktop Closed Box screenshot saved.');

    // 3. Trigger the actual opening sequence
    const startButton = page.locator('button', { hasText: 'باز کردن جعبه کادو شیخ' });
    await startButton.waitFor({ state: 'visible', timeout: 5000 });
    await startButton.click();

    // Brief timeout to capture the "Opening" phase
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'verification/luxury-unboxing/desktop-opening.png' });
    console.log('✅ Desktop Opening screenshot saved.');

    // 4. Wait for full animation and product rise (approx 3.5 seconds)
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'verification/luxury-unboxing/desktop-product-reveal.png' });
    console.log('✅ Desktop Product Reveal screenshot saved.');

    // 5. Ensure sequential CTAs and Fast Purchase are visible
    const fastPurchaseBtn = page.locator('button', { hasText: 'خرید سریع' });
    await fastPurchaseBtn.waitFor({ state: 'visible', timeout: 5000 });
    await expect(fastPurchaseBtn).toBeVisible();

    await page.screenshot({ path: 'verification/luxury-unboxing/desktop-final-cta.png' });
    console.log('✅ Desktop Final CTA screenshot saved.');

    // Close modal
    const closeBtn = page.locator('button[aria-label="بستن"]');
    await closeBtn.click();
    await expect(unboxingTitle).not.toBeVisible();

    // Check for critical JS console errors during unboxing sequence
    expect(consoleErrors).toHaveLength(0);
  });

  test('Tablet Visual Verification', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const unboxTrigger = page.locator('button', { hasText: 'مشاهده تجربه آنباکس کالا' });
    await unboxTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await unboxTrigger.click();

    // Open box immediately
    const startButton = page.locator('button', { hasText: 'باز کردن جعبه کادو شیخ' });
    await startButton.waitFor({ state: 'visible', timeout: 5000 });
    await startButton.click();

    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'verification/luxury-unboxing/tablet-view.png' });
    console.log('✅ Tablet view screenshot saved.');
  });

  test('Mobile Visual Verification', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const unboxTrigger = page.locator('button', { hasText: 'مشاهده تجربه آنباکس کالا' });
    await unboxTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await unboxTrigger.click();

    // Open box immediately
    const startButton = page.locator('button', { hasText: 'باز کردن جعبه کادو شیخ' });
    await startButton.waitFor({ state: 'visible', timeout: 5000 });
    await startButton.click();

    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'verification/luxury-unboxing/mobile-view.png' });
    console.log('✅ Mobile view screenshot saved.');
  });
});
