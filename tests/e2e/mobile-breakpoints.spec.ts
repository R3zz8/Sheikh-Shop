import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Mobile Breakpoints Alignment Verification', () => {
  const targetUrl = 'http://localhost:3000/sheikh-digital';

  test.beforeAll(() => {
    const dir = path.join(process.cwd(), 'verification');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const breakpoints = [320, 360, 390, 430];

  for (const width of breakpoints) {
    test(`verify layout at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 750 });
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

      // Wait for components to mount
      const productsSection = page.locator('#digital-products-section');
      await productsSection.waitFor({ state: 'visible', timeout: 15000 });

      // Take targeted snapshot of search & filter bar
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `verification/mobile-${width}px.png` });
      console.log(`✅ Mobile screenshot for ${width}px generated successfully.`);
    });
  }
});
