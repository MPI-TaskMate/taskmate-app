import { test, expect, type Page } from '@playwright/test';

async function clearAuth(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
}

// TC-E2E-AUTH-01: Register with valid data → redirects to /tasks
test('Register with valid data redirects to tasks page', async ({ page }) => {
  const email = `test_${Date.now()}@taskmate.test`;

  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  await page.locator('form button').click();

  await expect(page).toHaveURL(/\/(tasks|dashboard)/, { timeout: 15000 });
});

// TC-E2E-AUTH-02: Register with mismatched passwords → shows error
test('Register with mismatched passwords shows error', async ({ page }) => {
  await clearAuth(page);
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', `test_${Date.now()}@taskmate.test`);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Different123!');
  await page.locator('form button').click();

  await expect(page.locator('text=Passwords do not match')).toBeVisible();
});

// TC-E2E-AUTH-03: Login with valid credentials → redirects to /tasks
test('Login with valid credentials redirects to tasks page', async ({ page }) => {
  const email = `test_${Date.now()}@taskmate.test`;

  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  await page.locator('form button').click();
  await expect(page).toHaveURL(/\/(tasks|dashboard)/, { timeout: 15000 });

  await clearAuth(page);
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Password123!');
  await page.locator('form button').click();

  await expect(page).toHaveURL(/\/(tasks|dashboard)/, { timeout: 15000 });
});

// TC-E2E-AUTH-04: Login with wrong password → shows error
test('Login with wrong password shows error', async ({ page }) => {
  const email = `test_${Date.now()}@taskmate.test`;

  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  await page.locator('form button').click();
  await expect(page).toHaveURL(/\/(tasks|dashboard)/, { timeout: 15000 });

  await clearAuth(page);
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'WrongPassword!');
  await page.locator('form button').click();

  await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  await expect(page.locator('[class*="error"]').first()).toBeVisible({ timeout: 5000 });
});
