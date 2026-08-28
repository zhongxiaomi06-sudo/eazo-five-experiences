import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('day-') && !['pixel', 'iphone'].includes(testInfo.project.name), 'Ideal Day app only');
  await page.goto('/');
});

test('TEST-DAY-001 input and primary action are immediately interactive', async ({ page }) => {
  await expect(page.getByLabel('你理想的一天，应该有什么？')).toBeEditable();
  await expect(page.getByRole('button', { name: '生成我的 24 小时' })).toBeEnabled();
});

test('the three-scene photo diary and inspiration deck add playful ingredients without changing the layout', async ({ page }) => {
  const input = page.getByLabel('你理想的一天，应该有什么？');
  await page.getByRole('button', { name: '加入“创作”灵感' }).click();
  await expect(input).toHaveValue(/一段不被打断的创作时间/);
  await expect(page.getByRole('button', { name: '加入“创作”灵感' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '加入“醒来”灵感' }).click();
  await page.getByRole('button', { name: '加入“放松”灵感' }).click();
  await expect(page.getByText('三幕已集齐，可以开场了')).toBeVisible();
  await expect(input).toHaveValue(/晨光、慢咖啡.*夜色里慢慢收尾/);
  await page.getByRole('button', { name: '换一组生活灵感' }).click();
  await expect(page.getByText(/在太阳升起前出门/)).toBeVisible();
});

test('reduced-motion mode keeps the photo diary playable without moving media', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.day-reel video')).toHaveCount(0);
  await expect(page.locator('.day-reel .day-clip img')).toHaveCount(3);
  await page.getByRole('button', { name: '加入“醒来”灵感' }).click();
  await expect(page.getByLabel('你理想的一天，应该有什么？')).toHaveValue(/晨光、慢咖啡/);
  await expect(page.locator('.day-reel-clips')).toHaveCSS('transition-duration', '0s');
});

test('TEST-DAY-002/004/005 user builds, edits, saves and discovers a day', async ({ page }) => {
  await page.getByLabel('你理想的一天，应该有什么？').fill('好好睡觉，写作，散步，做饭，和朋友聊天');
  await page.getByRole('button', { name: '生成我的 24 小时' }).click();
  await expect(page.getByText('24 小时守恒 ✓')).toBeVisible();
  const before = await page.getByText(/\d{2}:\d{2}–\d{2}:\d{2}/).first().textContent();
  await page.getByRole('button', { name: /延长 5 分钟/ }).first().click();
  await expect(page.getByText('24 小时守恒 ✓')).toBeVisible();
  expect(await page.getByText(/\d{2}:\d{2}–\d{2}:\d{2}/).first().textContent()).not.toBe(before);
  const blockCount = await page.locator('.block-editor > li').count();
  await page.getByRole('button', { name: /拆成两段/ }).first().click();
  await expect(page.locator('.block-editor > li')).toHaveCount(blockCount + 1);
  const actionLabels = await page.locator('.boundary-actions button').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label')));
  expect(new Set(actionLabels).size).toBe(actionLabels.length);
  await expect(page.getByText('24 小时守恒 ✓')).toBeVisible();
  await page.getByRole('button', { name: '保存这一天' }).click();
  await page.getByRole('button', { name: '看看惊人的年度规模' }).click();
  await expect(page.getByText(/这一年可以装下/).first()).toBeVisible();
});

test('TEST-DAY-006 library supports a reversible delete', async ({ page }) => {
  await page.getByRole('button', { name: '生成我的 24 小时' }).click();
  await page.getByRole('button', { name: '保存这一天' }).click();
  await page.getByRole('button', { name: /收藏，共/ }).click();
  await page.getByRole('button', { name: '删除' }).click();
  await expect(page.getByRole('button', { name: '恢复上一次删除' })).toBeVisible();
});

test('mobile viewport has no horizontal overflow across primary screens', async ({ page }) => {
  const noOverflow = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await noOverflow();
  await page.getByRole('button', { name: '生成我的 24 小时' }).click();
  await noOverflow();
  await page.getByRole('button', { name: '看看惊人的年度规模' }).click();
  await noOverflow();
});

test('mobile visual system keeps imagery, navigation and touch targets intact at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.reload();
  const reel = page.locator('.day-reel');
  await expect(reel).toBeVisible();
  const videos = reel.locator('video');
  expect(await videos.count()).toBe(3);
  for (let index = 0; index < 3; index += 1) {
    await expect.poll(() => videos.nth(index).evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
    expect(await videos.nth(index).evaluate((video: HTMLVideoElement) => video.muted && video.loop && video.playsInline)).toBe(true);
  }
  const navigation = page.getByRole('navigation', { name: '主导航' });
  await expect(navigation).toBeVisible();
  await expect(navigation).toHaveCSS('position', 'fixed');
  const primaryAction = page.getByRole('button', { name: '生成我的 24 小时' });
  await expect(primaryAction).toBeVisible();
  const [actionBox, navigationBox] = await Promise.all([primaryAction.boundingBox(), navigation.boundingBox()]);
  expect(actionBox).not.toBeNull();
  expect(navigationBox).not.toBeNull();
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(navigationBox!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('compact portrait and phone landscape respect input zoom, safe navigation and short-height layout', async ({ page }) => {
  const viewports = [{ width: 390, height: 667 }, { width: 844, height: 390 }];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    const coarsePointer = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    const mobileLayout = viewport.width <= 780 || (viewport.height <= 540 && coarsePointer);
    if (!mobileLayout) continue;
    const input = page.getByLabel('你理想的一天，应该有什么？');
    await expect(input).toHaveCSS('font-size', '16px');
    const navigation = page.getByRole('navigation', { name: '主导航' });
    await expect(navigation).toHaveCSS('position', 'fixed');
    const [actionBox, navigationBox] = await Promise.all([
      page.getByRole('button', { name: '生成我的 24 小时' }).boundingBox(),
      navigation.boundingBox(),
    ]);
    expect(actionBox).not.toBeNull();
    expect(navigationBox).not.toBeNull();
    expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(navigationBox!.y);
  }
});

test('mobile editor toolbar remains below the Eazo handoff while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.documentElement.style.setProperty('--eazo-handoff-top', '60px'));
  await page.getByRole('button', { name: '生成我的 24 小时' }).click();
  const toolbar = page.locator('.editor-toolbar');
  await toolbar.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 500));
  const box = await toolbar.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(59);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('responsive audit covers compact phones through wide desktop', async ({ page }) => {
  const viewports = [
    { width: 320, height: 568 },
    { width: 360, height: 800 },
    { width: 390, height: 667 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
    { width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${viewport.width}px compose overflow`).toBeLessThanOrEqual(1);
    const coarsePointer = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    if (viewport.width <= 780 || (viewport.height <= 540 && coarsePointer)) {
      const targetSizes = await page.locator('nav button').evaluateAll((buttons) => buttons.map((button) => {
        const box = button.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }));
      for (const size of targetSizes) {
        expect(size.width).toBeGreaterThanOrEqual(44);
        expect(size.height).toBeGreaterThanOrEqual(44);
      }
    }
    await page.getByRole('button', { name: '生成我的 24 小时' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${viewport.width}px editor overflow`).toBeLessThanOrEqual(1);
    await page.getByRole('button', { name: '看看惊人的年度规模' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${viewport.width}px scale overflow`).toBeLessThanOrEqual(1);
  }
});

test('core palette meets WCAG AA text and non-text contrast thresholds', async ({ page }) => {
  const audit = await page.evaluate(() => {
    const parseHex = (value: string) => {
      const hex = value.trim().replace('#', '');
      return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
    };
    const luminance = (value: string) => {
      const [red, green, blue] = parseHex(value).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const contrast = (first: string, second: string) => {
      const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
      return (lighter + 0.05) / (darker + 0.05);
    };
    const styles = getComputedStyle(document.documentElement);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    const background = token('--bg');
    const surface = token('--surface');
    return [
      { name: 'primary text', ratio: contrast(token('--text'), background), minimum: 4.5 },
      { name: 'muted text', ratio: contrast(token('--muted'), surface), minimum: 4.5 },
      { name: 'small metadata', ratio: contrast(token('--subtle'), surface), minimum: 4.5 },
      { name: 'accent text', ratio: contrast(token('--acid'), background), minimum: 4.5 },
      { name: 'paper card text', ratio: contrast(token('--ink'), token('--paper')), minimum: 7 },
      { name: 'component boundary', ratio: contrast(token('--line'), surface), minimum: 3 },
    ];
  });

  for (const result of audit) expect(result.ratio, result.name).toBeGreaterThanOrEqual(result.minimum);
});
