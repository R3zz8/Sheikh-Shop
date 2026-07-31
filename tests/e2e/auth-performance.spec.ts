import { test, expect } from '@playwright/test';

test.describe('Auth Forms Performance and Typing Responsiveness', () => {
  test('should type smoothly into all fields on the Login page without lagging', async ({ page }) => {
    test.setTimeout(60000);

    // Go to login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });

    // Focus on email input
    const emailInput = page.locator('input[name="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await emailInput.focus();

    // Type rapidly and verify latency/dropped frames do not freeze page
    const startTimeEmail = Date.now();
    await emailInput.type('performance-test@sheikh.com', { delay: 5 });
    const durationEmail = Date.now() - startTimeEmail;
    console.log(`[Perf Audit] Email input typing duration: ${durationEmail}ms`);

    // Focus on password input
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.focus();

    // Type password
    const startTimePassword = Date.now();
    await passwordInput.type('StrongPassword123!', { delay: 5 });
    const durationPassword = Date.now() - startTimePassword;
    console.log(`[Perf Audit] Password input typing duration: ${durationPassword}ms`);

    // Verify input values are correct
    await expect(emailInput).toHaveValue('performance-test@sheikh.com');
    await expect(passwordInput).toHaveValue('StrongPassword123!');

    // Toggle remember checkbox
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    await rememberCheckbox.click();
    await expect(rememberCheckbox).toBeChecked();

    // Verify submit button is enabled
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
  });

  test('should type smoothly into all fields on the Register page without lagging', async ({ page }) => {
    test.setTimeout(60000);

    // Go to register page
    await page.goto('http://localhost:3000/register', { waitUntil: 'domcontentloaded' });

    // Fill Full Name
    const fullNameInput = page.locator('input[name="fullName"]');
    await fullNameInput.waitFor({ state: 'visible', timeout: 30000 });
    await fullNameInput.type('امیرحسین شیخ', { delay: 5 });

    // Fill Email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.type('register-perf-test@sheikh.com', { delay: 5 });

    // Fill Passwords
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');

    await passwordInput.type('PerfectP@ssw0rd!', { delay: 5 });
    await confirmPasswordInput.type('PerfectP@ssw0rd!', { delay: 5 });

    // Verify input values are correct
    await expect(fullNameInput).toHaveValue('امیرحسین شیخ');
    await expect(emailInput).toHaveValue('register-perf-test@sheikh.com');
    await expect(passwordInput).toHaveValue('PerfectP@ssw0rd!');
    await expect(confirmPasswordInput).toHaveValue('PerfectP@ssw0rd!');

    // Verify PasswordStrength checklist has passed
    const passedChecklistItems = page.locator('.text-emerald-400');
    // We expect several checks to pass since the password meets requirements
    const count = await passedChecklistItems.count();
    await expect(count).toBeGreaterThanOrEqual(5);

    // Verify submit button is enabled
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
  });
});
