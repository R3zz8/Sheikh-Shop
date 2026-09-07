const { chromium } = require('@playwright/test');
const fs = require('fs');

const pagesToTest = [
  { name: 'Home', url: 'http://localhost:3000/' },
  { name: 'Product Listing', url: 'http://localhost:3000/products' },
  { name: 'Category Page', url: 'http://localhost:3000/categories/sheikh-food' },
  { name: 'Product Detail', url: 'http://localhost:3000/product/p1' },
];

const viewports = [
  // Mobile
  { name: 'Mobile 320', width: 320, height: 568 },
  { name: 'Mobile 360', width: 360, height: 640 },
  { name: 'Mobile 375', width: 375, height: 667 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 414', width: 414, height: 896 },
  // Desktop
  { name: 'Desktop 1280', width: 1280, height: 800 },
  { name: 'Desktop 1440', width: 1440, height: 900 },
  { name: 'Desktop 1920', width: 1920, height: 1080 },
];

async function measurePage(url, viewport) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  let totalTransfer = 0;
  let jsTransfer = 0;
  let imgTransfer = 0;
  let numRequests = 0;
  let numScripts = 0;
  let numImages = 0;

  page.on('response', async (res) => {
    numRequests++;
    const headers = res.headers();
    const len = parseInt(headers['content-length'] || '0', 10);
    totalTransfer += len;
    const type = headers['content-type'] || '';
    if (type.includes('javascript')) {
      jsTransfer += len;
      numScripts++;
    } else if (type.includes('image')) {
      imgTransfer += len;
      numImages++;
    }
  });

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__shifts = [];
    window.__lcp = 0;
    window.__fcp = 0;

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__cls += entry.value;
            window.__shifts.push({
              value: entry.value,
              sources: (entry.sources || []).map(s => ({
                tag: s.node ? s.node.tagName : null,
                class: s.node ? String(s.node.className || '') : null,
                id: s.node ? String(s.node.id || '') : null,
                prev: s.previousRect,
                curr: s.currentRect
              }))
            });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          window.__lcp = entries[entries.length - 1].startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const e of entries) {
          if (e.name === 'first-contentful-paint') {
            window.__fcp = e.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });
    } catch (e) {}
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
  } catch (err) {
    console.error(`Error navigating to ${url}:`, err.message);
  }

  const navigationTiming = JSON.parse(await page.evaluate(() => JSON.stringify(performance.getEntriesByType('navigation')[0] || {})));

  const metrics = await page.evaluate(() => ({
    cls: window.__cls,
    shifts: window.__shifts,
    lcp: window.__lcp,
    fcp: window.__fcp,
  }));

  await browser.close();

  return {
    url,
    viewport: `${viewport.name} (${viewport.width}x${viewport.height})`,
    width: viewport.width,
    height: viewport.height,
    ttfb: Math.round(navigationTiming.responseStart || 0),
    fcp: Math.round(metrics.fcp || 0),
    lcp: Math.round(metrics.lcp || 0),
    cls: parseFloat((metrics.cls || 0).toFixed(4)),
    shifts: metrics.shifts,
    totalTransferKB: (totalTransfer / 1024).toFixed(1),
    jsTransferKB: (jsTransfer / 1024).toFixed(1),
    imgTransferKB: (imgTransfer / 1024).toFixed(1),
    numRequests,
    numScripts,
    numImages
  };
}

async function run() {
  console.log('🚀 Running Comprehensive Performance Baseline Audit...\n');
  const results = {};

  for (const pageObj of pagesToTest) {
    results[pageObj.name] = [];
    console.log(`=== Testing Page: ${pageObj.name} (${pageObj.url}) ===`);
    for (const vp of viewports) {
      const res = await measurePage(pageObj.url, vp);
      console.log(`  [${vp.name}] CLS: ${res.cls} | LCP: ${res.lcp}ms | FCP: ${res.fcp}ms | TTFB: ${res.ttfb}ms | Shifts: ${res.shifts.length}`);
      results[pageObj.name].push(res);
    }
  }

  fs.writeFileSync('performance-reports/baseline-results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Baseline measurement completed and saved to performance-reports/baseline-results.json');
}

run().catch(console.error);
