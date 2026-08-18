import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outputDir = path.join(process.cwd(), 'verification', 'luxury-product-arch');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const viewports = [
  { name: '01-desktop-1920.png', width: 1920, height: 1080 },
  { name: '02-desktop-1280.png', width: 1280, height: 800 },
  { name: '03-tablet-768.png', width: 768, height: 1024 },
  { name: '04-mobile-390.png', width: 390, height: 844 },
  { name: '05-mobile-375.png', width: 375, height: 812 },
  { name: '06-mobile-360.png', width: 360, height: 800 },
  { name: '07-mobile-320.png', width: 320, height: 800 },
];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of viewports) {
    const filePath = path.join(outputDir, vp.name);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      locale: 'fa-IR',
    });

    const page = await context.newPage();
    page.setDefaultNavigationTimeout(20000);

    console.log(`Navigating to http://localhost:3000 for ${vp.name} (${vp.width}x${vp.height})...`);
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Inject override style so custom web fonts do not stall Playwright screenshot rendering
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        * {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    });

    // Wait for the carousel section element
    const section = page.locator('section[aria-label="محصولات منتخب شیخ"]');
    await section.waitFor({ state: 'visible', timeout: 15000 });
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: filePath, fullPage: false, timeout: 5000 });
    console.log(`Saved screenshot: ${filePath}`);

    await context.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
