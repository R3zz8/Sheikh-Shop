const { chromium } = require('@playwright/test');

async function testViewportCLS(name, viewport) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__shifts = [];
    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__cls += entry.value;
            window.__shifts.push({
              time: Math.round(entry.startTime),
              value: entry.value,
              sources: (entry.sources || []).map((s) => ({
                tag: s.node ? s.node.nodeName : 'UNKNOWN',
                className: s.node && typeof s.node.className === 'string' ? s.node.className.substring(0, 60) : '',
                prevTop: s.previousRect ? Math.round(s.previousRect.top) : null,
                currTop: s.currentRect ? Math.round(s.currentRect.top) : null,
              })),
            });
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error(e);
    }
  });

  console.log(`\n--- Testing ${name} (${viewport.width}x${viewport.height}) ---`);
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

  // Wait for initial dynamic component hydration
  await page.waitForTimeout(3000);

  const initialCls = await page.evaluate(() => window.__cls);
  console.log(`Initial Boot CLS (0s-3s): ${initialCls.toFixed(4)}`);

  // Reset counters to measure runtime interaction / scroll CLS
  await page.evaluate(() => {
    window.__cls = 0;
    window.__shifts = [];
  });

  // Perform smooth user scrolling
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(250);
  }

  await page.waitForTimeout(1000);

  const runtimeRes = await page.evaluate(() => ({
    cls: window.__cls,
    shifts: window.__shifts,
  }));

  console.log(`Runtime User Interaction / Scroll CLS: ${runtimeRes.cls.toFixed(4)}`);
  if (runtimeRes.shifts.length > 0) {
    console.log('Runtime Shifts:', JSON.stringify(runtimeRes.shifts, null, 2));
  } else {
    console.log('✅ Zero layout shifts recorded during runtime user interaction!');
  }

  await browser.close();
  return { initialCls, runtimeCls: runtimeRes.cls };
}

async function run() {
  console.log('=== VERIFYING FINAL PRODUCTION CLS ===');
  const desktop = await testViewportCLS('Desktop', { width: 1280, height: 800 });
  const mobile = await testViewportCLS('Mobile', { width: 375, height: 667 });
  const smallMobile = await testViewportCLS('Small Mobile', { width: 320, height: 568 });

  console.log('\n======================================================');
  console.log('📊 FINAL CLS RESULTS SUMMARY:');
  console.log(`Desktop (1280x800)     | Initial Boot CLS: ${desktop.initialCls.toFixed(4)} | Runtime Scroll CLS: ${desktop.runtimeCls.toFixed(4)}`);
  console.log(`Mobile (375x667)       | Initial Boot CLS: ${mobile.initialCls.toFixed(4)} | Runtime Scroll CLS: ${mobile.runtimeCls.toFixed(4)}`);
  console.log(`Small Mobile (320x568) | Initial Boot CLS: ${smallMobile.initialCls.toFixed(4)} | Runtime Scroll CLS: ${smallMobile.runtimeCls.toFixed(4)}`);
  console.log('======================================================');
}

run().catch(console.error);
