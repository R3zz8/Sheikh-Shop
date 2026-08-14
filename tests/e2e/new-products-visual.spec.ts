import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.join(process.cwd(), 'verification', 'new-products');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

const viewports = [
  { name: 'desktop-large', width: 1920, height: 1080 },
  { name: 'desktop-homepage', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile-390px', width: 390, height: 844 },
  { name: 'mobile-375px', width: 375, height: 667 },
  { name: 'mobile-320px', width: 320, height: 568 },
];

for (const vp of viewports) {
  test(`Capture visual screenshot for view ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // Wait for the New Products section to be present in DOM
    const newProductsSection = page.locator('section[aria-label="محصولات جدید"]');
    await expect(newProductsSection).toBeVisible({ timeout: 15000 });

    // Scroll into view gently
    await newProductsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const screenshotPath = path.join(screenshotDir, `${vp.name}.png`);

    // Use direct Chrome DevTools Protocol to capture screenshot instantly
    const client = await page.context().newCDPSession(page);
    const { data } = await client.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    fs.writeFileSync(screenshotPath, Buffer.from(data, 'base64'));

    console.log(`Saved verification screenshot: ${screenshotPath}`);
  });
}
