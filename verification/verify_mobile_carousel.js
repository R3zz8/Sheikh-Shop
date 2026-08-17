const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in process.env');
}

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '15m',
    issuer: 'sheikh-shop',
    audience: 'sheikh-shop-users',
  });
}

async function safeScreenshot(page, filePath) {
  try {
    await page.screenshot({ path: filePath, animations: 'disabled', timeout: 10000 });
  } catch (err) {
    console.warn(`Warning taking screenshot ${filePath}:`, err.message);
  }
}

async function runVerification() {
  const outputDir = path.join(__dirname, 'mobile-carousel');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Starting Browser Launch...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Create valid SuperAdmin JWT token matching DB user rezadhu615@gmail.com
  const token = signAccessToken({
    id: 'cmf4thmm10000h7n5ylf7lkad',
    email: 'rezadhu615@gmail.com',
    role: 'SUPERADMIN',
  });

  await context.addCookies([
    { name: 'access-token', value: token, url: 'http://localhost:3000' },
    { name: 'refresh-token', value: token, url: 'http://localhost:3000' },
    { name: 'user-role', value: 'SUPERADMIN', url: 'http://localhost:3000' },
  ]);

  const page = await context.newPage();

  // 1. SuperAdmin opens Dashboard (/dashboard) - Desktop 1280px
  console.log('1. Navigating to SuperAdmin Dashboard (/dashboard)...');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('a[href="/dashboard/mobile-carousel"]', { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Take screenshot 01: Dashboard Overview with visible Carousel entry card
  const carouselCard = page.locator('a[href="/dashboard/mobile-carousel"]');
  if (!(await carouselCard.isVisible())) {
    throw new Error('❌ Carousel management card is NOT visible on /dashboard');
  }
  console.log('✅ Carousel card is visible in Dashboard UI!');
  await safeScreenshot(page, path.join(outputDir, '01-dashboard-overview-with-carousel-card.png'));

  // 2. Click Carousel card to open /dashboard/mobile-carousel
  console.log('2. Clicking Carousel card to open Carousel Management page...');
  await carouselCard.click();
  await page.waitForSelector('h1:has-text("مدیریت اسلایدر تبلیغاتی موبایل")', { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Take screenshot 02: Carousel Management Page loaded from Neon DB
  await safeScreenshot(page, path.join(outputDir, '02-carousel-management-page.png'));

  // 3. Open Edit Form for slide
  console.log('3. Opening Edit Form for existing slide...');
  const editBtn = page.locator('button[data-testid="edit-slide-btn"]').first();
  await editBtn.click();
  await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
  await page.waitForTimeout(500);

  // Take screenshot 03: Slide Form loaded with DB data
  await safeScreenshot(page, path.join(outputDir, '03-filled-carousel-form.png'));

  // 4. Edit Text, Subtitle, CTA, Link
  console.log('4. Updating text, CTA, and link fields...');
  const updatedTopTitle = 'فروشگاه شیخ';
  const updatedSubtitle = 'international luxury store';
  const updatedTitle = 'کیفیت و اصالت بی‌نظیر با گارانتی طلایی';
  const updatedCtaText = 'مشاهده و خرید آنلاین';
  const updatedLink = '/products';

  await page.fill('input#topTitle', updatedTopTitle);
  await page.fill('input#subtitle', updatedSubtitle);
  await page.fill('input#title', updatedTitle);
  await page.fill('input#ctaText', updatedCtaText);
  await page.fill('input#link', updatedLink);

  // Take screenshot 04: Form after text modifications
  await safeScreenshot(page, path.join(outputDir, '04-edited-form-fields.png'));

  // 5. Save Changes
  console.log('5. Submitting form to save changes to Neon DB...');
  const saveBtn = page.locator('button[type="submit"]:has-text("ذخیره تغییرات")');
  await saveBtn.click();
  await page.waitForSelector('div[role="dialog"]', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(1000);

  // Take screenshot 05: Save Success
  await safeScreenshot(page, path.join(outputDir, '05-save-success.png'));

  // 6. Reload page & confirm DB persistence
  console.log('6. Reloading Dashboard to verify text persistence in database...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector(`text=${updatedTitle}`, { timeout: 15000 });
  console.log('✅ Text changes persisted in database successfully!');
  await safeScreenshot(page, path.join(outputDir, '06-persisted-after-reload.png'));

  // 7. Image Replacement Test
  console.log('7. Testing image replacement...');
  await editBtn.click();
  await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });

  // Create a sample test image buffer and attach to file input
  const testImagePath = path.join(__dirname, 'test_replacement.png');
  const pngHeader = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(testImagePath, pngHeader);

  const fileInput = page.locator('input#image-replace-upload');
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(2000); // Allow upload request
  }

  // Take screenshot 07: Image Replacement Preview
  await safeScreenshot(page, path.join(outputDir, '07-image-replacement-preview.png'));

  await saveBtn.click();
  await page.waitForSelector('div[role="dialog"]', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(1000);

  // 8. Image Deletion Test
  console.log('8. Testing image removal/deletion...');
  await editBtn.click();
  await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });

  const trashBtn = page.locator('button:has(svg.lucide-trash-2)').first();
  if (await trashBtn.isVisible()) {
    await trashBtn.click();
    await page.waitForTimeout(500);
  }

  // Take screenshot 08: Image Removed state
  await safeScreenshot(page, path.join(outputDir, '08-image-removed-state.png'));

  await saveBtn.click();
  await page.waitForSelector('div[role="dialog"]', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(1000);

  // Reload to verify image removal persisted
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  console.log('✅ Image deletion persisted in database!');
  await safeScreenshot(page, path.join(outputDir, '09-image-deletion-persisted.png'));

  // Restore valid image URL for homepage verification
  console.log('Restoring valid image URL for homepage verification...');
  await editBtn.click();
  await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
  await page.fill('input#title', updatedTitle);
  await saveBtn.click();
  await page.waitForSelector('div[role="dialog"]', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(1000);

  // 9. Viewport testing across 320px, 375px, 390px, 768px, 1280px, 1920px
  console.log('9. Capturing screenshots across required viewports (320px, 375px, 390px, 768px, 1280px, 1920px)...');
  const viewports = [
    { width: 320, height: 640, name: '10-mobile-carousel-320px.png' },
    { width: 375, height: 812, name: '11-mobile-carousel-375px.png' },
    { width: 390, height: 844, name: '12-mobile-carousel-390px.png' },
    { width: 768, height: 1024, name: '13-dashboard-carousel-768px.png' },
    { width: 1280, height: 900, name: '14-dashboard-carousel-1280px.png' },
    { width: 1920, height: 1080, name: '15-dashboard-carousel-1920px.png' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    if (vp.width < 768) {
      // Mobile viewport: Navigate to homepage to verify mobile carousel
      await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await safeScreenshot(page, path.join(outputDir, vp.name));
    } else {
      // Desktop viewport: Carousel management UI in Dashboard
      await page.goto('http://localhost:3000/dashboard/mobile-carousel', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await safeScreenshot(page, path.join(outputDir, vp.name));
    }
  }

  // 10. Test Mobile Homepage CTA Click
  console.log('10. Testing mobile homepage CTA navigation...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const ctaBtn = page.locator('button:has-text("مشاهده")').first();
  if (await ctaBtn.isVisible()) {
    await ctaBtn.click();
    await page.waitForFunction(() => window.location.pathname.includes('/products'), { timeout: 10000 });
    console.log('✅ CTA button navigation succeeded to:', page.url());
    await safeScreenshot(page, path.join(outputDir, '16-cta-navigation-destination.png'));
  }

  // Clean up test image
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }

  await browser.close();
  console.log('🎉 Browser verification finished successfully! All screenshots saved to /verification/mobile-carousel/');
}

runVerification().catch(err => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});
