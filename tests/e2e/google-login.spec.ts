import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Google Login & Auth Reliability E2E Verification', () => {
  test('login page renders correctly with Google login button', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

    // Verify main card title
    await expect(page.getByText('خوش آمدید')).toBeVisible();

    // Verify Google Auth button exists with Persian CTA
    const googleButton = page.getByRole('button', { name: /ادامه با حساب گوگل/i });
    await expect(googleButton).toBeVisible();

    // Take screenshot of Login Idle state
    await page.screenshot({ path: 'google-login-idle.png', fullPage: true });
  });

  test('displays Persian error notification and retry button when error search parameter is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/login?error=timeout`, { waitUntil: 'domcontentloaded' });

    // Verify Persian alert banner with timeout explanation
    await expect(page.getByText('اتصال شما کند یا ناپایدار است. لطفاً دوباره تلاش کنید.').first()).toBeVisible();

    // Verify "تلاش مجدد با گوگل" button is rendered
    const retryButton = page.getByRole('button', { name: /تلاش مجدد با گوگل/i });
    await expect(retryButton).toBeVisible();

    // Take screenshot of Login Error State with Retry Button
    await page.screenshot({ path: 'google-login-error-retry.png', fullPage: true });
  });

  test('mobile responsive viewports (375px) render without layout breaks', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/login?error=invalid_state`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('button', { name: /تلاش مجدد با گوگل/i })).toBeVisible();
    await page.screenshot({ path: 'google-login-mobile-375.png' });
  });
});
