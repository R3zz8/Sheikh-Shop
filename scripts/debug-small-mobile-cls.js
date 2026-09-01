const { chromium } = require('@playwright/test');

async function debugSmallMobileCLS() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 320, height: 568 } });
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
                id: s.node ? s.node.id : '',
                className: s.node && typeof s.node.className === 'string' ? s.node.className : '',
                prevTop: s.previousRect ? Math.round(s.previousRect.top) : null,
                currTop: s.currentRect ? Math.round(s.currentRect.top) : null,
                prevHeight: s.previousRect ? Math.round(s.previousRect.height) : null,
                currHeight: s.currentRect ? Math.round(s.currentRect.height) : null,
                prevWidth: s.previousRect ? Math.round(s.previousRect.width) : null,
                currWidth: s.currentRect ? Math.round(s.currentRect.width) : null,
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

  console.log('Navigating 320x568 Small Mobile...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const clsData = await page.evaluate(() => ({
    cls: window.__cls,
    shifts: window.__shifts,
  }));

  console.log('\n=== SMALL MOBILE (320x568) CLS ANALYSIS ===');
  console.log(`Total Initial CLS: ${clsData.cls.toFixed(4)}`);
  console.log('Recorded Shifts:', JSON.stringify(clsData.shifts, null, 2));

  await browser.close();
}

debugSmallMobileCLS().catch(console.error);
