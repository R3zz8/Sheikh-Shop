// verification/verify_mobile_layouts.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const widths = [320, 360, 375, 390, 412, 430];
  const targetUrl = 'http://localhost:3000/';

  console.log('Starting viewport verification for target URL:', targetUrl);

  for (const width of widths) {
    console.log(`Verifying layout at width: ${width}px`);
    await page.setViewportSize({ width, height: 750 });
    await page.goto(targetUrl, { waitUntil: 'load' });

    // Wait 2 seconds for animations to settle
    await page.waitForTimeout(2000);

    // Take screenshot of the Hero section and CTA buttons
    const heroScreenshotPath = path.join(__dirname, `mobile-hero-${width}px.png`);
    await page.screenshot({ path: heroScreenshotPath });
    console.log(`✅ Saved hero screenshot for ${width}px to ${heroScreenshotPath}`);

    // Scroll down to the Mobile Carousel section
    // Let's scroll by 500px to see the Mobile Carousel and Amazing Deals
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    const carouselScreenshotPath = path.join(__dirname, `mobile-carousel-${width}px.png`);
    await page.screenshot({ path: carouselScreenshotPath });
    console.log(`✅ Saved carousel screenshot for ${width}px to ${carouselScreenshotPath}`);
  }

  await browser.close();
  console.log('Viewport verification completed successfully.');
}

run().catch(err => {
  console.error('Error during viewport verification:', err);
  process.exit(1);
});
