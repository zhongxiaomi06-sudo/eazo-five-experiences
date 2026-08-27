import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(Boolean(testInfo.project.metadata.app) && testInfo.project.metadata.app !== 'lab', 'Lab-only production path');
  await page.goto('/');
});

test('TEST-LAB-MOBILE-001 completes the first experiment without overflow', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Your first sandpile' })).toBeVisible();
  const canvas = page.locator('canvas');
  for (const x of [100, 220]) await canvas.click({ position: { x, y: 55 } });
  await expect(page.getByRole('dialog', { name: 'Your first sandpile' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share to Eazo' })).toBeEnabled();
  await expect(page.getByText('FACT', { exact: true })).toBeVisible();
  await expect(page.getByText('SIMPLIFIED', { exact: true })).toBeVisible();
  await expect(page.getByText('FICTIONAL', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('TEST-LAB-CONTENT-001 exposes 30 challenges and a searchable 72-material atlas', async ({ page }) => {
  await page.getByRole('button', { name: 'Challenges', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Watch matter misbehave.' })).toBeVisible();
  await expect(page.locator('.matter-reels video')).toHaveCount(3);
  await expect(page.locator('.matter-reels video').first()).toHaveAttribute('playsinline', '');
  await expect(page.locator('.challenge-grid > button')).toHaveCount(30);
  await page.getByRole('button', { name: 'Matter atlas', exact: true }).click();
  await expect(page.locator('.atlas-grid > article')).toHaveCount(72);
  await page.getByRole('textbox', { name: 'Search materials' }).fill('water');
  await expect(page.locator('.atlas-grid > article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Water' })).toBeVisible();
});

test('TEST-LAB-RECOVERY-001 saves and restores a valid local experiment', async ({ page }) => {
  await page.locator('canvas').click({ position: { x: 90, y: 60 } });
  await page.getByRole('button', { name: 'Pause simulation' }).click();
  await page.getByRole('button', { name: 'Open lab notebook' }).click();
  await page.getByRole('button', { name: 'Save experiment' }).click();
  await page.getByRole('button', { name: 'Close lab notebook' }).click();
  await expect(page.getByText('Experiment saved on this device.')).toBeVisible();
  await page.getByRole('button', { name: 'Open lab notebook' }).click();
  await page.getByRole('button', { name: 'Clear experiment' }).click();
  await page.getByRole('button', { name: 'Open lab notebook' }).click();
  await page.getByRole('button', { name: 'Restore experiment' }).click();
  await page.getByRole('button', { name: 'Close lab notebook' }).click();
  await expect(page.getByText('Last valid experiment restored.')).toBeVisible();
});
