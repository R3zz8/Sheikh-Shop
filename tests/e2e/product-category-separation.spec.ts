import { test, expect } from '@playwright/test';
import { ProductCategory, ProductCategoryType } from '@prisma/client';

test.describe('Product Category Separation', () => {
  const foodProductName = `Test Food Product ${Date.now()}`;
  const techProductName = `Test Tech Product ${Date.now()}`;

  test('should create and verify product category separation', async ({ page, request }) => {
    // Create Sheikh Food Product
    await request.post('/api/test/create-product', {
      data: {
        name: foodProductName,
        category: ProductCategory.DATES,
        categoryType: ProductCategoryType.SheikhFood,
        price: 10,
        quantity: 100,
      },
    });

    // Create Sheikh Tech Product
    await request.post('/api/test/create-product', {
      data: {
        name: techProductName,
        category: ProductCategory.OTHERS,
        categoryType: ProductCategoryType.SheikhTech,
        price: 20,
        quantity: 50,
      },
    });

    // Verify Sheikh Food product
    await page.goto('/products');
    await expect(page.getByText(foodProductName)).toBeVisible();
    await expect(page.getByText(techProductName)).not.toBeVisible();

    // Verify Sheikh Tech product
    await page.goto('/tech-products');
    await expect(page.getByText(techProductName)).toBeVisible();
    await expect(page.getByText(foodProductName)).not.toBeVisible();
  });
});
