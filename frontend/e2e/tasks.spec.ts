import { test, expect, type Page } from '@playwright/test';

async function clearAuth(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
}

async function registerAndLogin(page: Page) {
  const email = `test_${Date.now()}@taskmate.test`;
  await clearAuth(page);
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  await page.locator('form button').click();
  await expect(page).toHaveURL(/\/(tasks|dashboard)/, { timeout: 15000 });
}

// TC-E2E-TASK-01: Create task → task appears on the board
test('Create task appears on the board', async ({ page }) => {
  await registerAndLogin(page);
  await page.goto('/tasks');
  await page.waitForLoadState('networkidle');

  await page.click('text=+ Create Task');
  await page.getByPlaceholder('Enter task title').fill('E2E Test Task');
  await page.getByRole('button', { name: 'Create task', exact: true }).click();

  await expect(page.locator('text=E2E Test Task')).toBeVisible({ timeout: 10000 });
});

// TC-E2E-TASK-02: Unauthenticated user is redirected to /login when accessing /tasks
test('Unauthenticated user is redirected to login', async ({ page }) => {
  await clearAuth(page);
  await page.goto('/tasks');
  await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
});

// TC-E2E-TASK-03: Tasks page loads with Kanban board visible
test('Tasks page shows Kanban board', async ({ page }) => {
  await registerAndLogin(page);
  await page.goto('/tasks');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('text=+ Create Task')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kanban' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'List' })).toBeVisible();
});
