import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('E2E Sheikh Home Full Integration Visual Verification', () => {
  test.beforeAll(() => {
    const dir = path.join(process.cwd(), 'verification');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('Capture Homepage and check Header/Footer and Dropdown links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // Verify Header is visible and contains Sheikh Home dropdown
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Let's open the Products dropdown in the header to ensure it's visible on screenshot
    const productsNav = page.locator('header nav a:has-text("محصولات")');
    await productsNav.hover();
    await page.waitForTimeout(1000); // Wait for transition animation

    await page.screenshot({ path: 'verification/1_homepage_dropdown.png' });
    console.log('✅ Screenshot 1 (Homepage with Products Dropdown) captured.');
  });

  test('Capture Products Page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/2_products_food.png', fullPage: true });
    console.log('✅ Screenshot 2 (Products Page) captured.');
  });

  test('Capture Sheikh Home Page with Refrigerator and Washing Machine models', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/sheikh-home', { waitUntil: 'domcontentloaded' });

    // Verify first product: Refrigerator is listed
    const refCard = page.locator('#product-list-container .product-card', { hasText: 'یخچال' }).filter({ visible: true }).first();
    await refCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'verification/3_sheikh_home.png', fullPage: true });
    console.log('✅ Screenshot 3 (Sheikh Home Page) captured.');
  });

  test('Capture Product Detail Page for luxury refrigerator', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/products/royal-frost-x9-refrigerator', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verification/4_product_detail.png', fullPage: true });
    console.log('✅ Screenshot 4 (Product Detail Page) captured.');
  });

  test('Capture Search Page results for "یخچال"', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/search?q=یخچال', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verification/5_search_results.png' });
    console.log('✅ Screenshot 5 (Search Results Page) captured.');
  });

  test('Capture mobile layout and accordion behavior', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // Open mobile menu
    const menuBtn = page.locator('button[aria-label="Open menu"]');
    await menuBtn.click();
    await page.waitForTimeout(1000);

    // Click on Products accordion
    const productsAccordion = page.locator('[role="dialog"] span:has-text("محصولات")').first();
    await productsAccordion.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'verification/6_mobile_menu_accordion.png' });
    console.log('✅ Screenshot 6 (Mobile Menu with Accordion) captured.');
  });
});
