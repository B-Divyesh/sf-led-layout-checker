import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync } from 'node:fs';

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
  await page.getByText('Restore an existing license').click();
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
    expect(results.violations, path).toEqual([]);
  }
});

test('cold first screen shows the audience, sample action, and three facts', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const required = [page.locator('.lede'), page.getByRole('link', { name: 'Try it with sample data' }), ...await page.locator('.plain-facts li').all()];
    for (const item of required) {
      const box = await item.boundingBox();
      expect(box, `${viewport.width}px required item`).not.toBeNull();
      expect(box!.y + box!.height, `${viewport.width}px required item below fold`).toBeLessThanOrEqual(viewport.height);
    }
  }
});

test('planner reflows at 200% text and visible controls meet 44px targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const smallTargets = await page.locator('a, button, input, select, summary').evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName, width: rect.width, height: rect.height };
    })
    .filter(({ width, height }) => width < 44 || height < 44));
  expect(smallTargets).toEqual([]);

  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  expect(await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))).toEqual({ scroll: 390, client: 390 });
});

test('canvas exposes routed geometry without application semantics', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('[role="application"]')).toHaveCount(0);
  await expect(page.locator('#plan-description')).toContainText('Arch left: 180 pixels');
  await expect(page.locator('#plan-description')).toContainText('coordinates 14, 52 to 23, 27');
});

test('planner works at 390px and has a keyboard placement path', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/planner');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
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

test('replacing the only controller reconnects free-plan segments and persists', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Remove ESP32' }).click();
  await expect(page.getByText(/has no controller/)).toHaveCount(3);
  await page.getByRole('button', { name: /^Add controller/ }).click();
  await page.getByLabel('X', { exact: true }).fill('25');
  await page.getByLabel('Y', { exact: true }).fill('50');
  await page.getByRole('button', { name: 'Place at coordinates' }).click();
  await expect(page.getByText(/has no controller/)).toHaveCount(0);
  await expect(page.locator('#segment-controller')).toHaveValue(/.+/);
  await page.reload();
  await expect(page.getByText(/has no controller/)).toHaveCount(0);
});

test('checkout return always verifies a new token despite an unrelated recent verdict', async ({ page }) => {
  let requests = 0;
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:led-layout-checker', 'old-license');
    localStorage.setItem('sb_license_check:led-layout-checker', JSON.stringify({ token: 'old-license', valid: false, checkedAt: Date.now() }));
  });
  await page.route('https://api.sociobot.in/api/v1/products/led-layout-checker/verify?license=new-valid-license', async (route) => {
    requests += 1;
    await route.fulfill({ json: { valid: true, reason: 'ok' } });
  });
  await page.goto('/planner?license=new-valid-license');
  await expect(page.getByText('Studio active')).toBeVisible();
  expect(requests).toBe(1);
  expect(page.url()).not.toContain('license=');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('sb_license_check:led-layout-checker')!));
  expect(stored).toMatchObject({ token: 'new-valid-license', valid: true });
});

test('@claim:daily-license-check checks a stored license at most once per day', async ({ page }) => {
  let requests = 0;
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:led-layout-checker', 'daily-license');
    if (!localStorage.getItem('sb_license_check:led-layout-checker')) {
      localStorage.setItem('sb_license_check:led-layout-checker', JSON.stringify({ token: 'daily-license', valid: true, checkedAt: Date.now() - 86_400_001 }));
    }
  });
  await page.route('https://api.sociobot.in/api/v1/products/led-layout-checker/verify?license=daily-license', async (route) => {
    requests += 1;
    await route.fulfill({ json: { valid: true, reason: 'ok' } });
  });
  await page.goto('/planner');
  await expect(page.getByText('Studio active')).toBeVisible();
  await expect.poll(() => requests).toBe(1);
  await page.reload();
  await expect(page.getByText('Studio active')).toBeVisible();
  await page.waitForTimeout(100);
  expect(requests).toBe(1);
});

test('@claim:studio-sales-paused does not advertise the unavailable checkout', async ({ page }) => {
  for (const path of ['/', '/planner']) {
    await page.goto(path);
    await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
    await expect(page.getByText(/sales are paused/i)).toBeVisible();
  }
  await expect(page.getByText('Restore an existing license')).toBeVisible();
});

test('static host config returns a real 404 and PWA metadata has install icons', async () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));
  expect(config.navigationFallback).toBeUndefined();
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  expect(existsSync('public/404.html')).toBe(true);
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect(existsSync('public/icon-192.png')).toBe(true);
  expect(existsSync('public/icon-512.png')).toBe(true);
});

test('offline shell keeps browser security policies and avoids full-size hero precache', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  const cachedUrls = await page.evaluate(async () => {
    const cache = await caches.open('led-layout-checker-v6');
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  expect(cachedUrls).toContain('/assets/hero-routing-600.webp');
  expect(cachedUrls).not.toContain('/assets/hero-routing.png');
  expect(cachedUrls).not.toContain('/assets/hero-routing.webp');
  await context.setOffline(true);
  const headers = await page.evaluate(async () => {
    const response = await fetch('/');
    return {
      csp: response.headers.get('content-security-policy'),
      referrer: response.headers.get('referrer-policy'),
      permissions: response.headers.get('permissions-policy'),
      nosniff: response.headers.get('x-content-type-options'),
    };
  });
  expect(headers.csp).toContain("default-src 'self'");
  expect(headers.referrer).toBe('strict-origin-when-cross-origin');
  expect(headers.permissions).toContain('camera=()');
  expect(headers.nosniff).toBe('nosniff');
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
