const { chromium } = require('@playwright/test');

async function inspectHeights(viewportName, viewport) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000); // wait for all dynamic components to load

  const heights = await page.evaluate(() => {
    const getSelectorHeight = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };

    const sections = Array.from(document.querySelectorAll('section, main > div, main > section')).map((s, idx) => {
      const rect = s.getBoundingClientRect();
      const aria = s.getAttribute('aria-label') || s.className || `Section ${idx}`;
      return {
        tag: s.tagName,
        ariaLabel: aria.substring(0, 40),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });

    return {
      sections,
      search: getSelectorHeight('.sticky'),
      main: getSelectorHeight('main'),
      footer: getSelectorHeight('footer'),
    };
  });

  console.log(`=== HEIGHTS FOR ${viewportName} (${viewport.width}x${viewport.height}) ===`);
  console.log(JSON.stringify(heights, null, 2));

  await browser.close();
}

async function run() {
  await inspectHeights('Desktop', { width: 1280, height: 800 });
  await inspectHeights('Mobile', { width: 375, height: 667 });
  await inspectHeights('Small Mobile', { width: 320, height: 568 });
}

run().catch(console.error);
