const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Running Playwright browser to capture frontend verification screenshots...');
  const verifyDir = path.join(__dirname, '../verification');
  if (!fs.existsSync(verifyDir)) {
    fs.mkdirSync(verifyDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. CAPTURE SPLASH SCREEN (Fresh launch without session storage)
  console.log('Capturing Splash Screen...');
  const splashContext = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile Viewport (iPhone 12/13/14)
    deviceScaleFactor: 2,
  });
  const splashPage = await splashContext.newPage();
  await splashPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  // Wait 300ms to let elements load and render in active animation flow
  await splashPage.waitForTimeout(300);
  await splashPage.screenshot({ path: path.join(verifyDir, 'splash.png') });
  await splashContext.close();

  // 2. CAPTURE LOGIN SCREEN
  console.log('Capturing Redesigned Glassmorphic Login Screen...');
  const loginContext = await browser.newContext({
    viewport: { width: 1280, height: 800 }, // Desktop Viewport
    deviceScaleFactor: 2,
  });
  const loginPage = await loginContext.newPage();
  await loginPage.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  // Wait for the logo and glassmorphic elements to complete entrance animations
  await loginPage.waitForTimeout(1000);
  await loginPage.screenshot({ path: path.join(verifyDir, 'login.png') });
  await loginContext.close();

  // 3. CAPTURE HOME PAGE (Desktop)
  console.log('Capturing Desktop Home Page...');
  const homeContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1.5,
  });
  const homePage = await homeContext.newPage();
  await homePage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  // Wait for hydration to stabilize
  await homePage.waitForTimeout(2000);
  await homePage.screenshot({ path: path.join(verifyDir, 'home.png') });
  await homeContext.close();

  await browser.close();
  console.log('Frontend verification screenshots saved to verification/ successfully!');
}

run().catch((err) => {
  console.error('Error in verification script:', err);
  process.exit(1);
});
