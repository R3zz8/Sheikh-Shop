import { test, expect } from '@playwright/test';

const mobileViewports = [
  { width: 320, height: 600, name: '320' },
  { width: 360, height: 640, name: '360' },
  { width: 390, height: 844, name: '390' },
  { width: 430, height: 932, name: '430' },
];

test.describe('Mobile Sheikh Radial Category Network & Desktop Regression Verification', () => {
  for (const vp of mobileViewports) {
    test(`Mobile radial network render at ${vp.width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

      const radialSection = page.locator('section[aria-label="دسته‌بندی‌های اکوسیستم شیخ"]');
      await radialSection.scrollIntoViewIfNeeded();
      await expect(radialSection).toBeVisible();

      // Ensure Sheikh central text is visible
      const sheikhText = radialSection.getByText('شیخ', { exact: true });
      await expect(sheikhText).toBeVisible();

      // Ensure all 8 categories are rendered
      const categoryNames = [
        'شیخ دیجیتال',
        'مواد غذایی شیخ',
        'شیخ اسمارت',
        'شیخ پرفیوم',
        'لوازم خانگی شیخ',
        'شیخ امنیت',
        'شیخ وب',
        'شیخ نوا',
      ];

      for (const catName of categoryNames) {
        const catLink = radialSection.getByRole('link', { name: catName });
        await expect(catLink).toBeVisible();
      }

      // Check no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

      // Capture screenshot
      await page.screenshot({
        path: `verification/mobile-sheikh-network-${vp.name}.png`,
        animations: 'disabled',
      });
    });
  }

  test('Desktop regression check at 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Ensure desktop section is loaded (hero card with title)
    const desktopTitle = page.getByRole('heading', { name: 'به دنیای فروشگاه شیخ' });
    await expect(desktopTitle).toBeVisible();

    // Verify mobile-only radial network is NOT present on desktop
    const radialSection = page.locator('section[aria-label="دسته‌بندی‌های اکوسیستم شیخ"]');
    await expect(radialSection).toBeHidden();

    // Capture screenshot of desktop showcase
    await page.screenshot({
      path: 'verification/desktop-regression.png',
      fullPage: false,
    });
  });
});
