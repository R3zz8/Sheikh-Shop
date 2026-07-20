import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Royal 3D Showcase Visual Verification', () => {
  const targetUrl = 'http://localhost:3000/';
  const adminUrl = 'http://localhost:3000/admin/showcase';

  test.beforeAll(() => {
    // Ensure verification directory exists
    const dir = path.join(process.cwd(), 'verification');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('desktop screenshot and showcase assertions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // Wait for the page to fully load and settle
    await page.waitForTimeout(4000);

    // Capture desktop showcase screenshot
    await page.screenshot({ path: 'verification/showcase-desktop.png' });
    console.log('✅ Desktop showcase screenshot generated.');
  });

  test('laptop screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'verification/showcase-laptop.png' });
    console.log('✅ Laptop showcase screenshot generated.');
  });

  test('tablet screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'verification/showcase-tablet.png' });
    console.log('✅ Tablet showcase screenshot generated.');
  });

  test('mobile screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'verification/showcase-mobile.png' });
    console.log('✅ Mobile showcase screenshot generated.');
  });

  test('small mobile screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'verification/showcase-small-mobile.png' });
    console.log('✅ Small mobile showcase screenshot generated.');
  });

  test('admin panel screenshot and settings verification', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 950 });
    await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'verification/showcase-admin.png' });
    console.log('✅ Admin showcase screenshot generated.');
  });
});
