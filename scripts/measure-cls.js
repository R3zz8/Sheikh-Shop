const { chromium } = require('@playwright/test');

async function measureCLS(url, viewport) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  // Inject script to track Layout Shifts via PerformanceObserver
  await page.addInitScript(() => {
    window.__cls = 0;
    window.__shifts = [];
    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__cls += entry.value;
            window.__shifts.push({
              value: entry.value,
              sources: (entry.sources || []).map((s) => ({
                nodeName: s.node ? s.node.nodeName : 'UNKNOWN',
                className: s.node && s.node.className ? s.node.className : '',
                previousRect: s.previousRect,
                currentRect: s.currentRect,
              })),
              time: entry.startTime,
            });
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error(e);
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  // Wait extra time for dynamic imports and hydration
  await page.waitForTimeout(4000);

  // Scroll down smoothly to trigger any scroll/intersection observer dynamic loads
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 200);
    });
  });

  await page.waitForTimeout(2000);

  const clsData = await page.evaluate(() => ({
    cls: window.__cls,
    shifts: window.__shifts,
  }));

  await browser.close();
  return clsData;
}

async function run() {
  console.log('=== MEASURING INITIAL CLS ===\n');

  const desktop = { width: 1280, height: 800 };
  const mobile = { width: 375, height: 667 };
  const smallMobile = { width: 320, height: 568 };

  console.log('Measuring Desktop (1280x800)...');
  const desktopRes = await measureCLS('http://localhost:3000/', desktop);
  console.log(`Desktop Cumulative Layout Shift: ${desktopRes.cls.toFixed(4)}`);
  console.log('Desktop Shifts:', JSON.stringify(desktopRes.shifts, null, 2));

  console.log('\nMeasuring Mobile (375x667)...');
  const mobileRes = await measureCLS('http://localhost:3000/', mobile);
  console.log(`Mobile Cumulative Layout Shift: ${mobileRes.cls.toFixed(4)}`);
  console.log('Mobile Shifts:', JSON.stringify(mobileRes.shifts, null, 2));

  console.log('\nMeasuring Small Mobile (320x568)...');
  const smallMobileRes = await measureCLS('http://localhost:3000/', smallMobile);
  console.log(`Small Mobile Cumulative Layout Shift: ${smallMobileRes.cls.toFixed(4)}`);
  console.log('Small Mobile Shifts:', JSON.stringify(smallMobileRes.shifts, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
