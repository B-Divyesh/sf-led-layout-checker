import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:sample-preflight calculates current and flags power assumptions', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: /warning/ })).toContainText('2 warnings');
  await expect(page.getByText('11.5 A', { exact: true })).toBeVisible();
  await expect(page.getByText('Ground run has no power point')).toBeVisible();
  await expect(page.getByText('Arch right may need end injection')).toBeVisible();
});

test('@claim:svg-export downloads a labeled SVG', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export labeled SVG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('garden-arch-480-pixels.svg');
  const stream = await download.createReadStream();
  let content = '';
  for await (const chunk of stream!) content += chunk.toString();
  expect(content).toContain('Garden arch — 480 pixels');
  expect(content).toContain('11.5 A estimate');
  expect(content).toContain('Not electrical advice');
});

test('@claim:local-only keeps plan traffic on the same origin', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.getByLabel('Planned brightness').fill('35');
  await page.getByLabel('Planned brightness').press('ArrowRight');
  await page.getByRole('button', { name: 'Export labeled SVG' }).click();
  expect(outsideRequests).toEqual([]);
});

test('@claim:demo-sandbox keeps sample data separate and resets it', async ({ page }) => {
  await page.goto('/planner');
  await page.getByLabel('Plan name').fill('My real plan');
  await page.getByLabel('Plan name').press('Tab');
  await page.goto('/demo');
  await expect(page.getByLabel('Plan name')).toHaveValue('Garden arch — 480 pixels');
  await page.getByLabel('Plan name').fill('Changed demo');
  await page.getByLabel('Plan name').press('Tab');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Plan name')).toHaveValue('Garden arch — 480 pixels');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByLabel('Plan name')).toHaveValue('My real plan');
  expect(await page.evaluate(() => localStorage.getItem('demo:led-layout-checker:layout:v1'))).toBeNull();
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Check your LED layout' })).toBeVisible();
  await expect(page.getByText('11.5 A', { exact: true })).toBeVisible();
});

test('@claim:studio-license verifies and exports a parts summary', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/led-layout-checker/verify?license=test-license', (route) => route.fulfill({ json: { valid: true, reason: 'ok' } }));
  await page.goto('/demo');
  await page.getByText('Have a license?').click();
  await page.getByLabel('License token').fill('test-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Studio active')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Studio active')).toBeVisible();
  await page.getByRole('button', { name: 'Add controller' }).click();
  await page.getByLabel('X', { exact: true }).fill('55');
  await page.getByLabel('Y', { exact: true }).fill('55');
  await page.getByRole('button', { name: 'Place at coordinates' }).click();
  await expect(page.locator('[data-controller-name]')).toHaveCount(2);
  await page.locator('#segment-controller').selectOption({ label: 'Controller 2' });
  await expect(page.locator('#segment-controller')).toHaveValue(/.+/);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export parts summary' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('-parts.txt');
});

test('landing page and planner have no serious accessibility issues', async ({ page }) => {
  for (const path of ['/', '/demo']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')), path).toEqual([]);
  }
});

test('planner works at 390px and has a keyboard placement path', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/planner');
  await page.getByRole('button', { name: /Segment/ }).click();
  await page.getByLabel('X', { exact: true }).fill('20');
  await page.getByLabel('Y', { exact: true }).fill('30');
  await page.getByRole('button', { name: 'Place at coordinates' }).click();
  await page.getByLabel('X', { exact: true }).fill('80');
  await page.getByLabel('Y', { exact: true }).fill('65');
  await page.getByRole('button', { name: 'Place at coordinates' }).click();
  await page.getByRole('button', { name: 'Finish segment' }).click();
  await expect(page.getByLabel('Pixel count')).toHaveValue('60');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('saved items can be corrected, removed, and restored', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Supply A voltage').selectOption('12');
  await expect(page.getByText('Supply A voltage does not match')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Arch left' }).click();
  await expect(page.getByText('Arch left has a power assumption')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Arch left has a power assumption')).toHaveCount(0);
  await page.getByRole('button', { name: 'Remove Supply A' }).click();
  await expect(page.getByLabel('Supply A voltage')).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByLabel('Supply A voltage')).toHaveValue('12');
});

test('privacy, terms, and missing routes render one h1', async ({ page }) => {
  for (const path of ['/privacy', '/terms', '/missing']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
  }
});

test('all routes load without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const path of ['/', '/planner', '/demo', '/privacy', '/terms', '/missing']) await page.goto(path);
  expect(errors).toEqual([]);
});
