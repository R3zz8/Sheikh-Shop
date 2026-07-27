import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Mobile Viewports Visual QA', () => {
  const targetUrl = 'http://localhost:3000/';

  test.beforeAll(() => {
    const dir = path.join(process.cwd(), 'verification');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const widths = [320, 360, 375, 390, 412, 430];

  for (const width of widths) {
    test(`Capture and verify layout at ${width}px`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width, height: 750 });

      // Navigate to homepage
      await page.goto(targetUrl, { waitUntil: 'load' });

      // Wait for components to mount and stabilize
      await page.waitForTimeout(2000);

      // Verify main heading exists
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();

      // Take screenshot of top section (Hero & CTA Buttons)
      await page.screenshot({ path: `verification/mobile-hero-${width}px.png` });
      console.log(`✅ Saved hero screenshot for ${width}px`);

      // Scroll to Mobile Carousel / Slider section
      await page.evaluate(() => {
        // Find categories section height and scroll past it
        window.scrollTo(0, 380);
      });
      await page.waitForTimeout(1000);

      // Take screenshot of Carousel section
      await page.screenshot({ path: `verification/mobile-carousel-${width}px.png` });
      console.log(`✅ Saved carousel screenshot for ${width}px`);
    });
  }
});
