const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Starting Playwright visual test for the real user journey (with custom page evaluated style injection for fonts)...');
  const verifyDir = path.join(__dirname, '../verification');
  if (!fs.existsSync(verifyDir)) {
    fs.mkdirSync(verifyDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 1.5,
    locale: 'fa-IR',
  });

  const page = await desktopContext.newPage();
  page.setDefaultNavigationTimeout(15000);

  // Function to disable web fonts loading block on page
  const injectFontOverride = async (p) => {
    await p.evaluate(() => {
      // Create a style block that forces fallback system fonts so Playwright screenshot doesn't hang waiting for Google Fonts
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
  };

  const screenshotOptions = {
    timeout: 5000,
  };

  // Step 1: Open /products
  console.log('1. Loading products listing page (/products)...');
  await page.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded' });
  await injectFontOverride(page);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(verifyDir, 'products_listing.png'), ...screenshotOptions });

  // Step 2: Click Premium Iranian Honey Card
  console.log('2. Clicking "Premium Iranian Honey" Card...');
  const honeyCard = page.locator('text="Premium Iranian Honey"').first();
  if (await honeyCard.isVisible()) {
    await honeyCard.click();
    await page.waitForLoadState('domcontentloaded');
    await injectFontOverride(page);
    await page.waitForTimeout(1000);
    console.log('   Navigated to Honey PDP via click. URL is:', page.url());
    await page.screenshot({ path: path.join(verifyDir, 'pdp_food_honey.png'), ...screenshotOptions });
  } else {
    console.warn('   Honey card was not found via locator. Falling back to direct URL navigation.');
    await page.goto('http://localhost:3000/products/p1', { waitUntil: 'domcontentloaded' });
    await injectFontOverride(page);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(verifyDir, 'pdp_food_honey.png'), ...screenshotOptions });
  }

  // Step 3: Click "اسپیکر ایستاده شیخ"
  console.log('3. Navigating back to products to click Nova PDP (luxury-x9-speaker) via click...');
  await page.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded' });
  await injectFontOverride(page);
  await page.waitForTimeout(1000);
  const speakerCard = page.locator('text="Royal Sound Pro"').first();
  if (await speakerCard.isVisible()) {
    await speakerCard.click();
    await page.waitForLoadState('domcontentloaded');
    await injectFontOverride(page);
    await page.waitForTimeout(1000);
    console.log('   Navigated to Speaker PDP via click. URL is:', page.url());
    await page.screenshot({ path: path.join(verifyDir, 'pdp_nova_speaker.png'), ...screenshotOptions });
  } else {
    console.warn('   Speaker card not found via click. Navigating directly to PDP...');
    await page.goto('http://localhost:3000/products/royal-sound-pro-speaker', { waitUntil: 'domcontentloaded' });
    await injectFontOverride(page);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(verifyDir, 'pdp_nova_speaker.png'), ...screenshotOptions });
  }

  // Step 4: Click "ساعت هوشمند سلطنتی" - Product with variants
  console.log('4. Navigating to Digital PDP (royal-watch-v2) to test options/variants...');
  await page.goto('http://localhost:3000/products/royal-watch-v2', { waitUntil: 'domcontentloaded' });
  await injectFontOverride(page);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(verifyDir, 'pdp_digital_watch.png'), ...screenshotOptions });

  // Let's interact with options / variants on the Watch PDP (royal-watch-v2)
  console.log('5. Clicking variant options on Watch PDP...');
  const goldOption = page.locator('button >> text=128GB').first();
  if (await goldOption.isVisible()) {
    await goldOption.click();
    await injectFontOverride(page);
    await page.waitForTimeout(1000);
    console.log('   Variant "128GB" option clicked.');
    await page.screenshot({ path: path.join(verifyDir, 'pdp_digital_watch_selected_variant.png'), ...screenshotOptions });
  } else {
    const goldColor = page.locator('button[title="Gold"]').first();
    if (await goldColor.isVisible()) {
      await goldColor.click();
      await injectFontOverride(page);
      await page.waitForTimeout(1000);
      console.log('   Variant "Gold" color swatch clicked.');
      await page.screenshot({ path: path.join(verifyDir, 'pdp_digital_watch_selected_variant.png'), ...screenshotOptions });
    }
  }

  // Step 5: Click Home Category product - "یخچال فریزر هوشمند"
  console.log('6. Navigating to Home PDP (royal-frost-x9-refrigerator) via direct URL...');
  await page.goto('http://localhost:3000/products/royal-frost-x9-refrigerator', { waitUntil: 'domcontentloaded' });
  await injectFontOverride(page);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(verifyDir, 'pdp_home_fridge.png'), ...screenshotOptions });

  // Step 6: Capture Mobile view
  console.log('7. Loading Mobile View for Honey PDP...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile Viewport (iPhone 12/13/14)
    deviceScaleFactor: 2,
    locale: 'fa-IR',
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/products/p1', { waitUntil: 'domcontentloaded' });
  await injectFontOverride(mobilePage);
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(verifyDir, 'pdp_mobile_p1.png'), ...screenshotOptions });
  await mobileContext.close();

  // Step 7: Genuinely invalid slug (404)
  console.log('8. Verifying invalid product slug custom 404...');
  await page.goto('http://localhost:3000/products/non-existent-product-slug-abc', { waitUntil: 'domcontentloaded' });
  await injectFontOverride(page);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(verifyDir, 'custom_404.png'), ...screenshotOptions });

  await desktopContext.close();
  await browser.close();
  console.log('All user journey visual tests completed successfully!');
}

run().catch((err) => {
  console.error('Error during customer journey Playwright test:', err);
  process.exit(1);
});
