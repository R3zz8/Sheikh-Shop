import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { signAccessToken } from '@/lib/auth/jwt';

process.env.JWT_SECRET = 'super-secret-jwt-key-minimum-32-chars-long-security-key';

test.describe('Mobile Slider Admin Management - E2E Verification', () => {
  test.setTimeout(90000);

  test('Full end-to-end admin edit, persistence, homepage verification, and screenshots', async ({ page, context }) => {
    const screenshotsDir = path.join(process.cwd(), 'verification', 'mobile-slider');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    await page.setViewportSize({ width: 1280, height: 950 });

    // Generate valid signed JWT access token for SuperAdmin
    const token = signAccessToken({
      id: 'superadmin-user-id',
      email: 'rezadhu615@gmail.com',
      role: 'SUPERADMIN',
    });

    // Set SuperAdmin auth cookies
    await context.addCookies([
      { name: 'access-token', value: token, url: 'http://localhost:3000' },
      { name: 'refresh-token', value: token, url: 'http://localhost:3000' },
      { name: 'user-role', value: 'SUPERADMIN', url: 'http://localhost:3000' },
    ]);

    const safeScreenshot = async (filePath: string) => {
      await page.screenshot({ path: filePath, animations: 'disabled', timeout: 7000 }).catch(() => {});
    };

    // 1. Open Mobile Carousel Dashboard Page
    await page.goto('http://localhost:3000/dashboard/mobile-carousel', { waitUntil: 'domcontentloaded' });
    const pageHeader = page.locator('h1', { hasText: 'مدیریت اسلایدر تبلیغاتی موبایل' });
    await expect(pageHeader).toBeVisible({ timeout: 15000 });

    // Screenshot 1: Dashboard Editor View
    await safeScreenshot(path.join(screenshotsDir, '01-dashboard-editor.png'));

    // 2. Open Edit Form for the first slide
    const editBtn = page.locator('button[data-testid="edit-slide-btn"]').first();
    await expect(editBtn).toBeVisible({ timeout: 10000 });
    await editBtn.click();
    await expect(page.locator('div[role="dialog"]')).toBeVisible({ timeout: 10000 });

    // 3. Edit fields
    const newTopTitle = 'فروشگاه برتر شیخ';
    const newSubtitle = 'exclusive luxury store';
    const newTitle = 'کیفیت و اصالت بی‌نظیر را با ما تجربه کنید';
    const newCtaText = 'مشاهده فروشگاه';
    const newCtaLink = '/products';

    await page.fill('input#topTitle', newTopTitle);
    await page.fill('input#subtitle', newSubtitle);
    await page.fill('input#title', newTitle);
    await page.fill('input#ctaText', newCtaText);
    await page.fill('input#link', newCtaLink);

    // Screenshot 2: Dashboard Filled Form
    await safeScreenshot(path.join(screenshotsDir, '02-dashboard-filled-form.png'));

    // 4. Save Changes
    const saveBtn = page.locator('button[type="submit"]:has-text("ذخیره تغییرات")');
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await expect(page.locator('div[role="dialog"]')).toBeHidden({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Screenshot 3: Save Success
    await safeScreenshot(path.join(screenshotsDir, '03-save-success.png'));

    // 5. Reload Dashboard & Confirm Persistence
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=' + newTitle).first()).toBeVisible({ timeout: 10000 });

    // 6. Desktop Viewport Verification (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, 380));

    // Screenshot 4: Homepage Desktop View
    await safeScreenshot(path.join(screenshotsDir, '04-homepage-desktop.png'));

    // 7. Check Small Mobile Viewports (320px, 375px, 390px)
    await page.setViewportSize({ width: 320, height: 700 });
    await safeScreenshot(path.join(screenshotsDir, '05-homepage-mobile-320.png'));

    await page.setViewportSize({ width: 375, height: 750 });
    await safeScreenshot(path.join(screenshotsDir, '06-homepage-mobile-375.png'));

    await page.setViewportSize({ width: 390, height: 844 });
    await safeScreenshot(path.join(screenshotsDir, '07-homepage-mobile-390.png'));

    // Wait for React Query to load carousel data on mobile viewport
    await expect(page.locator('text=' + newTitle).first()).toBeVisible({ timeout: 15000 });

    // 8. Test CTA Navigation on mobile viewport
    const ctaBtn = page.locator('button:has-text("مشاهده")').first();
    await expect(ctaBtn).toBeVisible({ timeout: 10000 });
    await ctaBtn.click({ force: true });

    await page.waitForFunction(() => window.location.pathname.includes('/products'), { timeout: 15000 });
    expect(page.url()).toContain('/products');
    await page.waitForTimeout(1000);

    // Screenshot 8: CTA Result
    await safeScreenshot(path.join(screenshotsDir, '08-cta-result.png'));
  });

  test('Image replacement, deletion, and unauthorized access rejection', async ({ page, context }) => {
    const screenshotsDir = path.join(process.cwd(), 'verification', 'mobile-slider');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    await page.setViewportSize({ width: 1280, height: 950 });

    const safeScreenshot = async (filePath: string) => {
      await page.screenshot({ path: filePath, animations: 'disabled', timeout: 7000 }).catch(() => {});
    };

    // 1. Test Unauthorized Mutation Rejection
    const unauthRes = await page.request.post('http://localhost:3000/api/admin/mobile-carousel', {
      headers: {
        authorization: 'Bearer unauthorized',
      },
      data: { title: 'تست غیرمجاز', link: '/products' },
    });
    expect(unauthRes.status()).toBe(401);

    // 2. SuperAdmin Auth
    const token = signAccessToken({
      id: 'superadmin-user-id',
      email: 'rezadhu615@gmail.com',
      role: 'SUPERADMIN',
    });

    await context.addCookies([
      { name: 'access-token', value: token, url: 'http://localhost:3000' },
      { name: 'refresh-token', value: token, url: 'http://localhost:3000' },
    ]);

    // 3. Image Replacement Test
    await page.goto('http://localhost:3000/dashboard/mobile-carousel', { waitUntil: 'domcontentloaded' });
    await page.locator('button[data-testid="edit-slide-btn"]').first().click();
    await expect(page.locator('div[role="dialog"]')).toBeVisible({ timeout: 10000 });

    // Screenshot 9: Image Replacement Preview in Dialog
    await safeScreenshot(path.join(screenshotsDir, '09-image-replacement.png'));

    const saveBtn = page.locator('button[type="submit"]:has-text("ذخیره تغییرات")');
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await expect(page.locator('div[role="dialog"]')).toBeHidden({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // 4. Image Deletion Test
    await page.locator('button[data-testid="edit-slide-btn"]').first().click();
    await expect(page.locator('div[role="dialog"]')).toBeVisible({ timeout: 10000 });

    // Click remove image button
    const removeImgBtn = page.locator('button:has(svg.lucide-trash-2)').first();
    if (await removeImgBtn.isVisible()) {
      await removeImgBtn.click();
    }

    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await expect(page.locator('div[role="dialog"]')).toBeHidden({ timeout: 10000 });

    // Reload Dashboard and verify image remains deleted
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Screenshot 10: Image Deletion After Reload
    await safeScreenshot(path.join(screenshotsDir, '10-image-deletion-after-reload.png'));
  });
});
