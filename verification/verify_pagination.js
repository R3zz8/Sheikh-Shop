const { chromium } = require('@playwright/test');

async function run() {
  const browser = await chromium.launch({ headless: true });

  // Set up viewports to test according to requested viewports:
  // - Desktop (1920px)
  // - Laptop (1440px)
  // - Tablet (768px)
  // - Mobile (430px)
  // - Mobile Small (320px)
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'laptop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 430, height: 932 },
    { name: 'small_mobile', width: 320, height: 568 },
  ];

  for (const vp of viewports) {
    console.log(`\n==================================================`);
    console.log(`Verifying viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    console.log(`==================================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: 'fa-IR',
      isMobile: vp.name.includes('mobile'),
    });

    const page = await context.newPage();

    // Set 6-second timeouts so it never hangs
    page.setDefaultNavigationTimeout(6000);
    page.setDefaultTimeout(6000);

    // Enable console and error logging from the browser
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER CONSOLE ERROR] ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      console.log(`[BROWSER UNCAUGHT ERROR] ${err.message}`);
    });

    // Go to sheikh-digital page (with fallback catch)
    try {
      await page.goto('http://localhost:3000/sheikh-digital', { waitUntil: 'domcontentloaded' });
    } catch (e) {
      console.log(`Navigation reached timeout or failed, proceeding with fallback content checks: ${e.message}`);
    }

    // Wait for the products grid or container to render
    try {
      await page.waitForSelector('#product-list-container', { timeout: 4000 });
    } catch (e) {
      console.log(`Product list container selector timeout: ${e.message}`);
    }

    // Wait a brief moment to stabilize layout
    await page.waitForTimeout(1000);

    // Get debug text
    const debugText = await page.locator('p:has-text("دیباگ")').first().textContent().catch(() => 'Debug text not found');
    console.log(`Debug text on page: ${debugText}`);

    // Capture initial screenshot
    const screenshotPath = `verification/${vp.name}_page1.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(err => console.log(`Screenshot failed: ${err.message}`));
    console.log(`Saved screenshot to ${screenshotPath}`);

    // Count exact products rendered in the main products grid
    const isMobile = vp.name.includes('mobile') || vp.name === 'small_mobile';
    let visibleProductsCount = 0;

    try {
      if (isMobile) {
        // Look for the product item components in the mobile container
        const gridItems = await page.$$('div.md\\:hidden div.grid > div');
        visibleProductsCount = gridItems.length;
      } else {
        // Look for the product item components in the desktop container
        const gridItems = await page.$$('div.hidden.md\\:block div.grid > div');
        visibleProductsCount = gridItems.length;
      }
    } catch (err) {
      console.log(`Product counting failed: ${err.message}`);
    }

    console.log(`Viewport ${vp.name} shows ${visibleProductsCount} products on page 1.`);

    // Check pagination exists
    let paginationExists = false;
    try {
      paginationExists = await page.isVisible('nav[role="navigation"]');
    } catch (err) {}
    console.log(`Pagination visible: ${paginationExists}`);

    // Click on page 2 if pagination exists
    if (paginationExists) {
      const page2Button = page.locator('nav[role="navigation"] button', { hasText: '2' }).first();
      try {
        if (await page2Button.isVisible()) {
          // Use force click to bypass any fixed header overlaps!
          await page2Button.click({ timeout: 3000, force: true });

          // Wait for page transition and scroll
          await page.waitForTimeout(1000);

          // Capture page 2 screenshot
          const screenshotPage2Path = `verification/${vp.name}_page2.png`;
          await page.screenshot({ path: screenshotPage2Path, fullPage: false }).catch(() => {});
          console.log(`Clicked Page 2 successfully. Saved to ${screenshotPage2Path}. URL updated to: ${page.url()}`);
        }
      } catch (err) {
        console.log(`Page 2 interaction failed/timed out: ${err.message}`);
      }
    }

    await context.close();
  }

  await browser.close();
}

run().catch(console.error);
