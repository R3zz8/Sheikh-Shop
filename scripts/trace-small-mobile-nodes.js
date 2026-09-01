const { chromium } = require('@playwright/test');

async function traceSmallMobileNodes() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.addInitScript(() => {
    window.__layoutHistory = [];

    const track = (tag, label, rect) => {
      window.__layoutHistory.push({
        time: Math.round(performance.now()),
        tag,
        label,
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
      });
    };

    // Track shifts
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          console.log(`[SHIFT @ ${Math.round(entry.startTime)}ms] value: ${entry.value.toFixed(4)}`);
          for (const s of entry.sources || []) {
            if (s.node) {
              const tag = s.node.nodeName;
              const cls = typeof s.node.className === 'string' ? s.node.className.substring(0, 50) : '';
              console.log(`  Source: ${tag}.${cls} | prevTop: ${s.previousRect ? Math.round(s.previousRect.top) : null} -> currTop: ${s.currentRect ? Math.round(s.currentRect.top) : null}`);
            }
          }
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  });

  console.log('--- NAVIGATING 320x568 ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

  for (let t of [100, 300, 600, 1000, 1500, 2500]) {
    await page.waitForTimeout(t === 100 ? 100 : (t === 300 ? 200 : (t === 600 ? 300 : (t === 1000 ? 400 : (t === 1500 ? 500 : 1000)))));
    const snapshot = await page.evaluate(() => {
      const mainSections = Array.from(document.querySelectorAll('main > *, section, footer')).map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          aria: el.getAttribute('aria-label') || el.className.substring(0, 30),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height),
        };
      });
      return mainSections;
    });
    console.log(`\n=== SNAPSHOT @ t ≈ ${t}ms ===`);
    console.table(snapshot);
  }

  await browser.close();
}

traceSmallMobileNodes().catch(console.error);
