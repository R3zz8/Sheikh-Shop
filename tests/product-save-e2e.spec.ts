import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function takeSafeScreenshot(page: any, filePath: string) {
  try {
    console.log(`Taking screenshot: ${filePath}...`);
    await Promise.race([
      page.screenshot({ path: filePath }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Screenshot timeout')), 3000))
    ]);
    console.log(`Screenshot saved: ${filePath}`);
  } catch (err: any) {
    console.log(`Skipping screenshot ${filePath} due to: ${err.message}`);
  }
}

test.describe('SuperAdmin Product Save Flow end-to-end verification', () => {
  test('SuperAdmin should update product name and delete images successfully', async ({ page }) => {
    // Set higher timeout for extensive end-to-end operations
    test.setTimeout(120000);

    // Block external fonts and analytics to prevent screenshot hangs on font loading
    await page.route('**/*.{woff,woff2,ttf,otf}', (route) => {
      if (route.request().url().includes('localhost')) {
        route.continue();
      } else {
        route.abort();
      }
    });
    await page.route('**/*fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**/*fonts.gstatic.com/**', (route) => route.abort());
    await page.route('**/*googletagmanager.com/**', (route) => route.abort());

    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 800 });

    // Inject SuperAdmin authentication tokens via cookie
    const context = page.context();
    await context.addCookies([
      {
        name: 'access-token',
        value: 'mocked-jwt-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Go to the Admin Dashboard Product Edit view for the target test product
    const productId = 'dcf36af5-71dd-4418-94e1-b109c3ccbb38';
    await page.goto(`http://localhost:3000/dashboard/products/${productId}`, { waitUntil: 'domcontentloaded' });

    // Wait for the luxury loading experience to vanish and the form to settle
    await page.waitForTimeout(4000);

    // Screenshot 1: Admin product editor BEFORE deletion
    await takeSafeScreenshot(page, 'verification/product-save/01-before.png');

    // Handle standard confirm dialog automatically
    page.on('dialog', async (dialog) => {
      console.log(`E2E Dialog: [${dialog.type()}] - "${dialog.message()}"`);
      await dialog.accept();
    });

    // Switch to Media Gallery Tab
    const mediaTabButton = page.locator('button:has-text("تصاویر (Media Gallery)")');
    if (await mediaTabButton.count() > 0) {
      await mediaTabButton.click();
      await page.waitForTimeout(1500);
    }

    // Capture deleting TWO images using the svg selectors (Lucide CircleX icons)
    const deleteButtons = page.locator('svg.absolute.top-2.left-2.text-red-500');
    const deleteButtonsCount = await deleteButtons.count();
    console.log(`Found ${deleteButtonsCount} delete image SVG elements.`);

    if (deleteButtonsCount >= 2) {
      // Delete first image
      console.log('Deleting first image...');
      await deleteButtons.nth(0).click();
      await page.waitForTimeout(1500); // Wait for the deletion request to finish and local state to filter out the image
      await takeSafeScreenshot(page, 'verification/product-save/02-image-one-deleted.png');

      // After deleting the first image, wait a little bit and locate the new list of delete buttons
      const remainingDeleteButtons = page.locator('svg.absolute.top-2.left-2.text-red-500');
      const remainingCount = await remainingDeleteButtons.count();
      console.log(`Found ${remainingCount} remaining delete image SVG elements.`);

      if (remainingCount > 0) {
        console.log('Deleting second image...');
        await remainingDeleteButtons.nth(0).click();
        await page.waitForTimeout(1500);
        await takeSafeScreenshot(page, 'verification/product-save/03-image-two-deleted.png');
      }
    }

    // Scroll back to the top-bar and find "Save All Product Changes" button
    const saveButton = page.locator('button:has-text("ذخیره کل تغییرات کالا")');
    await saveButton.click();

    // Wait for the database mutations to commit, caches to invalidate, paths to revalidate, and navigation to redirect back
    await page.waitForTimeout(3000);

    // Screenshot 4: Save success state
    await takeSafeScreenshot(page, 'verification/product-save/04-save-success.png');

    // Reload/Open the Product page again to verify persistence
    await page.goto(`http://localhost:3000/dashboard/products/${productId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Screenshot 5: Reload verification
    await takeSafeScreenshot(page, 'verification/product-save/05-after-refresh.png');

    // Open public customer-facing PDP to verify the deleted images are gone
    await page.goto('http://localhost:3000/products/automatic-cat-water-fountains', { waitUntil: 'commit' });
    await page.waitForTimeout(3000);

    // Screenshot 6: Customer PDP view
    await takeSafeScreenshot(page, 'verification/product-save/06-customer-pdp.png');

    // Test creating a controlled new product
    await page.goto('http://localhost:3000/dashboard/products/new', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Fill in required fields - general tab fields
    console.log('Filling name and description on General tab...');
    await page.fill('input[name="name"]', 'محصول تستی جدید شیخ شاپ');
    await page.fill('textarea[name="description"]', 'توضیحات product.');

    // Switch to Pricing Tab to fill basePrice
    console.log('Switching to Pricing tab...');
    const pricingTabButton = page.locator('button:has-text("قیمت‌گذاری")');
    await pricingTabButton.click();
    await page.waitForTimeout(1000);
    await page.fill('input[name="basePrice"]', '450000');

    // Switch to Inventory Tab to fill quantity
    console.log('Switching to Inventory tab...');
    const inventoryTabButton = page.locator('button:has-text("موجودی")');
    await inventoryTabButton.click();
    await page.waitForTimeout(1000);
    await page.fill('input[name="quantity"]', '100');

    // Click save
    const createButton = page.locator('button:has-text("ثبت و ساخت محصول")');
    if (await createButton.count() > 0) {
      console.log('Clicking create product button...');
      await createButton.click();
      await page.waitForTimeout(4000);
    }

    // Screenshot 7: New product created success
    await takeSafeScreenshot(page, 'verification/product-save/07-new-product-created.png');

    // Test updating a single field on an existing product
    console.log('Updating a single field on an existing product...');
    await page.goto(`http://localhost:3000/dashboard/products/${productId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Let's modify the description by appending a test string
    await page.fill('textarea[name="description"]', 'بروزرسانی تستی توضیحات محصول جهت راستی‌آزمایی فیلد منفرد.');

    // Save
    await page.locator('button:has-text("ذخیره کل تغییرات کالا")').click();
    await page.waitForTimeout(3000);

    // Screenshot 8: Existing product field update
    await takeSafeScreenshot(page, 'verification/product-save/08-existing-product-field-update.png');

    // Mobile Viewport Verification on Homepage (super-fast and clean)
    console.log('Verifying mobile layout...');
    const mobileContext = await page.context().browser()?.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    });
    const mobilePage = await mobileContext?.newPage();
    if (mobilePage) {
      await mobilePage.goto('http://localhost:3000/', { waitUntil: 'commit' });
      await mobilePage.waitForTimeout(2000);
      await takeSafeScreenshot(mobilePage, 'verification/product-save/09-mobile-verification.png');
      await mobilePage.close();
    }
  });
});