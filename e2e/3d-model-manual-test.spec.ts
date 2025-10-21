import { test, expect } from '@playwright/test';

test.describe('3D Model Rendering', () => {
  test('should display the 3D palm tree model after clicking the "Explore in 3D" button', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout to 60 seconds

    // Navigate to a page where the 3D model is likely to be present.
    // I'll start with the homepage, as it's a likely candidate.
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // The model is lazy-loaded, so we need to scroll down to trigger it.
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));

    // Click the "Explore in 3D" button.
    const exploreButton = page.getByRole('button', { name: 'Explore in 3D' });
    await exploreButton.click();

    // Look for the canvas element that hosts the 3D scene.
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Take a screenshot to visually verify the model.
    await page.screenshot({ path: 'e2e/3d-model-screenshot.png' });
  });
});
