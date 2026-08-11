import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../src/lib/prisma';
import { signJwtToken } from '../src/lib/auth/jwt';

async function takeSafeScreenshot(page: any, filePath: string) {
  try {
    console.log(`Taking screenshot: ${filePath}...`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Screenshot saved: ${filePath}`);
  } catch (err: any) {
    console.log(`Skipping screenshot ${filePath} due to: ${err.message}`);
  }
}

test.describe('SuperAdmin Product Save Flow End-to-End Visual Verification', () => {
  const productId = 'dcf36af5-71dd-4418-94e1-b109c3ccbb38';

  test.beforeAll(async () => {
    // Ensure verification folder exists
    fs.mkdirSync('verification/product-save', { recursive: true });
  });

  test('SuperAdmin Save Pipeline Full Verification Matrix', async ({ page }) => {
    // Set high timeout for comprehensive test suite operations
    test.setTimeout(180000);

    // Block heavy external assets to prevent page hangs
    await page.route('**/*.{woff,woff2,ttf,otf}', (route) => route.abort());
    await page.route('**/*fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**/*fonts.gstatic.com/**', (route) => route.abort());
    await page.route('**/*googletagmanager.com/**', (route) => route.abort());

    await page.setViewportSize({ width: 1280, height: 1000 });

    // 1. Generate and Inject valid SUPERADMIN auth token cookie
    const token = signJwtToken({
      id: 'mock-admin-id',
      role: 'SUPERADMIN',
      email: 'rezadhu615@gmail.com',
    }, '7d');

    const context = page.context();
    await context.addCookies([
      {
        name: 'access-token',
        value: token,
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Handle standard dialog box prompts automatically
    page.on('dialog', async (dialog) => {
      console.log(`[DIALOG] Accepted dialog: ${dialog.type()} - ${dialog.message()}`);
      await dialog.accept();
    });

    // ============================================================
    // FIRST TEST — MANDATORY REAL-WORLD ACCEPTANCE TEST
    // ============================================================
    console.log('--- FIRST TEST: Deleting 2 Images ---');

    // Query images from DB before deletion
    let dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });
    console.log('[DB BEFORE DELETION] Total Images:', dbProduct?.images?.length);
    const initialImages = dbProduct?.images || [];
    console.log('[DB BEFORE DELETION] IDs:', initialImages.map((img: any) => img.id));

    // Open Admin Product Editor
    await page.goto(`http://localhost:3000/dashboard/products/${productId}?mock_auth=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Switch to Media Tab
    const mediaTabButton = page.locator('button:has-text("تصاویر (Media Gallery)")');
    await mediaTabButton.click();
    await page.waitForTimeout(2000);

    // Screenshot 1: product-before-delete.png
    await takeSafeScreenshot(page, 'verification/product-save/product-before-delete.png');

    // Find and delete 2 images
    const deleteButtons = page.locator('svg.absolute.top-2.left-2.text-red-500');
    const initialDeleteButtonsCount = await deleteButtons.count();
    console.log(`UI Delete buttons found: ${initialDeleteButtonsCount}`);

    expect(initialDeleteButtonsCount).toBeGreaterThanOrEqual(2);

    // Click first delete button
    console.log('Deleting first image...');
    await deleteButtons.nth(0).click();
    await page.waitForTimeout(1500);

    // Click next delete button (which is now index 0 among remaining)
    console.log('Deleting second image...');
    const remainingDeleteButtons = page.locator('svg.absolute.top-2.left-2.text-red-500');
    await remainingDeleteButtons.nth(0).click();
    await page.waitForTimeout(2000);

    // Verify they disappeared from UI
    const finalDeleteButtonsCount = await page.locator('svg.absolute.top-2.left-2.text-red-500').count();
    console.log(`UI Delete buttons remaining: ${finalDeleteButtonsCount}`);
    expect(finalDeleteButtonsCount).toBe(initialDeleteButtonsCount - 2);

    // Screenshot 2: product-after-delete-before-save.png
    await takeSafeScreenshot(page, 'verification/product-save/product-after-delete-before-save.png');

    // Click "ذخیره کل تغییرات کالا"
    const saveButton = page.locator('button:has-text("ذخیره کل تغییرات کالا")');
    await saveButton.click();
    await page.waitForTimeout(5000);

    // Screenshot 3: product-save-success.png
    await takeSafeScreenshot(page, 'verification/product-save/product-save-success.png');

    // Query DB directly to verify deletion is persisted in DB
    dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });
    console.log('[DB AFTER DELETION] Total Images:', dbProduct?.images?.length);
    expect(dbProduct?.images?.length).toBe(initialImages.length - 2);

    const remainingIds = dbProduct?.images.map((img: any) => img.id) || [];
    console.log('[DB AFTER DELETION] Remaining IDs:', remainingIds);

    // Reload the SuperAdmin Product Editor from a fresh browser state
    await page.goto(`http://localhost:3000/dashboard/products/${productId}?mock_auth=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Switch to Media Tab to verify they don't return
    await page.locator('button:has-text("تصاویر (Media Gallery)")').click();
    await page.waitForTimeout(2000);

    // Screenshot 4: product-after-reload.png
    await takeSafeScreenshot(page, 'verification/product-save/product-after-reload.png');

    // Open public Product Detail Page (PDP)
    await page.goto('http://localhost:3000/products/automatic-cat-water-fountains', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Screenshot 5: product-pdp-after-reload.png
    await takeSafeScreenshot(page, 'verification/product-save/product-pdp-after-reload.png');

    // ============================================================
    // SECOND TEST — NORMAL PRODUCT EDIT
    // ============================================================
    console.log('--- SECOND TEST: Normal Product Edit (Description Only) ---');

    await page.goto(`http://localhost:3000/dashboard/products/${productId}?mock_auth=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Update only the description
    const testDescription = `Updated Test Description ${Date.now()}. This verifies that saving other fields preserves images correctly without accidental deletions.`;
    await page.fill('textarea[name="description"]', testDescription);

    // Save
    await page.locator('button:has-text("ذخیره کل تغییرات کالا")').click();
    await page.waitForTimeout(5000);

    // Query DB to verify description changed and images remain unchanged (count should still be original - 2)
    dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });
    console.log('[DB AFTER DESC UPDATE] Total Images:', dbProduct?.images?.length);
    console.log('[DB AFTER DESC UPDATE] Description:', dbProduct?.description);
    expect(dbProduct?.description).toBe(testDescription);
    expect(dbProduct?.images?.length).toBe(initialImages.length - 2);

    // Open PDP to confirm new description is reflected
    await page.goto('http://localhost:3000/products/automatic-cat-water-fountains', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const pdpBodyText = await page.textContent('body');
    expect(pdpBodyText).toContain(testDescription);

    // ============================================================
    // THIRD TEST — IMAGE UPLOAD + DELETE
    // ============================================================
    console.log('--- THIRD TEST: Image Upload + Delete ---');

    await page.goto(`http://localhost:3000/dashboard/products/${productId}?mock_auth=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Switch to Media Tab
    await page.locator('button:has-text("تصاویر (Media Gallery)")').click();
    await page.waitForTimeout(2000);

    // Create a dummy image file for upload
    const dummyImgPath = path.join(__dirname, 'dummy-upload.png');
    fs.writeFileSync(dummyImgPath, 'dummy image content');

    // Upload dummy image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(dummyImgPath);
    await page.waitForTimeout(1000);

    // Click upload
    await page.locator('button:has-text("شروع بارگذاری")').click();
    await page.waitForTimeout(6000); // Wait for upload to complete and page to reload media

    // Clean up local dummy file
    fs.unlinkSync(dummyImgPath);

    // Record images after upload
    dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });
    const afterUploadCount = dbProduct?.images?.length || 0;
    console.log('[DB AFTER UPLOAD] Total Images:', afterUploadCount);

    // Now delete 1 image from the UI
    const currentDeleteButtons = page.locator('svg.absolute.top-2.left-2.text-red-500');
    console.log(`UI Delete buttons after upload: ${await currentDeleteButtons.count()}`);
    await currentDeleteButtons.nth(0).click();
    await page.waitForTimeout(2000);

    // Click save
    await page.locator('button:has-text("ذخیره کل تغییرات کالا")').click();
    await page.waitForTimeout(5000);

    // Screenshot 6: product-upload-delete-combination.png
    await takeSafeScreenshot(page, 'verification/product-save/product-upload-delete-combination.png');

    // Query DB to verify image counts
    dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });
    console.log('[DB AFTER COMBINED SYNC] Total Images:', dbProduct?.images?.length);
    expect(dbProduct?.images?.length).toBe(afterUploadCount - 1);

    // Reload editor and verify exact final image set
    await page.goto(`http://localhost:3000/dashboard/products/${productId}?mock_auth=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("تصاویر (Media Gallery)")').click();
    await page.waitForTimeout(2000);

    // Screenshot 7: product-final-persisted-state.png
    await takeSafeScreenshot(page, 'verification/product-save/product-final-persisted-state.png');

    // ============================================================
    // FOURTH TEST — NEW PRODUCT CREATION
    // ============================================================
    console.log('--- FOURTH TEST: New Product Creation ---');

    await page.goto('http://localhost:3000/dashboard/products/new?mock_auth=true', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const testNewProductName = `Test New Product ${Date.now()}`;
    await page.fill('input[name="name"]', testNewProductName);
    await page.fill('textarea[name="description"]', 'Description for completely new product.');

    // Switch to Pricing Tab
    await page.locator('button:has-text("قیمت‌گذاری")').click();
    await page.waitForTimeout(1000);
    await page.fill('input[name="basePrice"]', '750000');

    // Switch to Inventory Tab
    await page.locator('button:has-text("موجودی و تنوع")').click();
    await page.waitForTimeout(1000);
    await page.fill('input[name="quantity"]', '150');

    // Save/Create
    await page.locator('button:has-text("ثبت و ساخت محصول")').click();
    await page.waitForTimeout(6000);

    // Screenshot 8: new-product-created.png
    await takeSafeScreenshot(page, 'verification/product-save/new-product-created.png');

    // Query DB to verify product exists and is created
    const createdProduct = await prisma.product.findUnique({
      where: { name: testNewProductName }
    });
    console.log('[DB CREATED PRODUCT] Exists:', !!createdProduct);
    expect(createdProduct).toBeDefined();
    expect(createdProduct?.basePrice).toBe(750000);
    expect(createdProduct?.quantity).toBe(150);

    // Cleanup created test product to keep database clean
    if (createdProduct) {
      await prisma.product.delete({ where: { id: createdProduct.id } });
      console.log('[CLEANUP] Deleted created test product.');
    }
  });
});
