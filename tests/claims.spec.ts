import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync } from 'node:fs';

test('@claim:sample-preflight calculates current and flags power assumptions', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { name: /warning/ })).toContainText('2 warnings');
  await expect(page.getByText('480', { exact: true })).toBeVisible();
  await expect(page.getByText('11.5 A', { exact: true })).toBeVisible();
  await expect(page.getByText('Ground run has no power point')).toBeVisible();
  await expect(page.getByText('Arch right may need a far-end power point')).toBeVisible();
  await expect(page.locator('#active-segment option')).toHaveCount(3);
  await expect(page.locator('[data-controller-name]')).toHaveCount(1);
  await expect(page.locator('[data-supply-volts]')).toHaveCount(2);
});

test('@claim:segment-authoring creates and saves multi-point segments by pointer and keyboard', async ({ page }) => {
  await page.goto('/planner');
  await page.getByRole('button', { name: /Segment/ }).click();
  const canvas = page.locator('#plan-canvas');
  for (const [x, y] of [[.2, .2], [.5, .35], [.8, .65]]) {
    const box = (await canvas.boundingBox())!;
    await canvas.click({ position: { x: box.width * x, y: box.height * y } });
  }
  await page.getByRole('button', { name: 'Finish segment' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Pointer route');
  await page.getByLabel('Name', { exact: true }).press('Tab');

  await page.getByRole('button', { name: /Segment/ }).click();
  for (const [x, y] of [[10, 80], [45, 60], [90, 20]]) {
    await page.getByLabel('X', { exact: true }).fill(String(x));
    await page.getByLabel('Y', { exact: true }).fill(String(y));
    await page.getByRole('button', { name: 'Place at coordinates' }).click();
  }
  await page.getByRole('button', { name: 'Finish segment' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Keyboard route');
  await page.getByLabel('Name', { exact: true }).press('Tab');
  await page.reload();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('led-layout-checker:layout:v1')!));
  expect(stored.segments).toHaveLength(2);
  expect(stored.segments.map((segment: { name: string }) => segment.name)).toEqual(['Pointer route', 'Keyboard route']);
  expect(stored.segments.every((segment: { points: unknown[] }) => segment.points.length === 3)).toBe(true);
  expect(stored.segments[1].points).toEqual([{ x: 10, y: 80 }, { x: 45, y: 60 }, { x: 90, y: 20 }]);
});

test('@claim:source-placement places, names, saves, and removes sources and power points', async ({ page }) => {
  await page.goto('/planner');
  await page.getByRole('button', { name: 'Remove Controller 1' }).click();
  await page.getByRole('button', { name: /^Add controller/ }).click();
  await page.getByLabel('X', { exact: true }).fill('25');
  await page.getByLabel('Y', { exact: true }).fill('40');
  await page.getByRole('button', { name: 'Place at coordinates' }).click();
  await page.locator('[data-controller-name]').fill('Show controller');
  await page.locator('[data-controller-name]').press('Tab');
  await page.getByRole('button', { name: /Segment/ }).click();
  for (const [x, y] of [[15, 20], [75, 70]]) {
    await page.getByLabel('X', { exact: true }).fill(String(x));
    await page.getByLabel('Y', { exact: true }).fill(String(y));
    await page.getByRole('button', { name: 'Place at coordinates' }).click();
  }
  await page.getByRole('button', { name: 'Finish segment' }).click();
  await page.getByLabel('Power points').selectOption('both');
  await page.getByRole('button', { name: /Supply/ }).click();
  await page.getByLabel('X', { exact: true }).fill('55');
  await page.getByLabel('Y', { exact: true }).fill('85');
  await page.getByRole('button', { name: 'Place at coordinates' }).click();
  await page.reload();
  await expect(page.locator('[data-controller-name]')).toHaveValue('Show controller');
  await expect(page.locator('[data-supply-volts]')).toHaveCount(1);
  await expect(page.getByLabel('Power points')).toHaveValue('both');
  await page.getByLabel('Power points').selectOption('none');
  await page.getByRole('button', { name: 'Remove Show controller' }).click();
  await page.getByRole('button', { name: 'Remove Supply 1' }).click();
  await expect(page.locator('[data-controller-name]')).toHaveCount(0);
  await expect(page.locator('[data-supply-volts]')).toHaveCount(0);
  await expect(page.getByLabel('Power points')).toHaveValue('none');
});

test('@claim:current-estimates recalculates from pixels, current, and brightness', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('11.5 A', { exact: true })).toBeVisible();
  await page.getByLabel('Pixel count').fill('200');
  await page.getByLabel('Pixel count').press('Tab');
  await expect(page.getByText('12.0 A', { exact: true })).toBeVisible();
  await page.getByLabel('Max current per pixel').fill('50');
  await page.getByLabel('Max current per pixel').press('Tab');
  await expect(page.getByText('10.0 A', { exact: true })).toBeVisible();
  await page.getByLabel('Planned brightness').fill('50');
  await page.getByLabel('Planned brightness').press('Tab');
  await expect(page.getByText('12.5 A', { exact: true })).toBeVisible();
});

test('@claim:live-checks updates warnings without a reload', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: '2 warnings' })).toBeVisible();
  await page.locator('#active-segment').selectOption({ label: 'Arch right' });
  await page.getByLabel('Power points').selectOption('both');
  await expect(page.getByRole('heading', { name: '1 warning' })).toBeVisible();
  await expect(page.getByText('Arch right has power points marked')).toBeVisible();
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

test('@claim:plan-json-roundtrip exports and restores editable plan data', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plan JSON' }).click();
  const exported = await downloadPromise;
  expect(exported.suggestedFilename()).toBe('garden-arch-480-pixels.led-plan.json');
  const filePath = await exported.path();
  expect(filePath).toBeTruthy();
  const original = JSON.parse(readFileSync(filePath!, 'utf8'));
  expect(original).toMatchObject({ format: 'led-layout-checker', version: 1 });

  await page.getByLabel('Plan name').fill('Temporary demo change');
  await page.getByLabel('Plan name').press('Tab');
  await page.locator('#import-plan').setInputFiles(filePath!);
  await expect(page.getByRole('dialog', { name: 'Replace this plan?' })).toContainText('Garden arch — 480 pixels: 3 segments, 1 controller, and 2 supplies.');
  await page.getByRole('button', { name: 'Replace with imported plan' }).click();
  await expect(page.getByLabel('Plan name')).toHaveValue('Garden arch — 480 pixels');
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:led-layout-checker:layout:v1')!));
  expect({ ...restored, updatedAt: original.layout.updatedAt }).toEqual(original.layout);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByLabel('Plan name')).toHaveValue('Temporary demo change');
});

test('@claim:plan-json-rejection rejects malformed project files without replacement', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Plan name').fill('Keep this plan');
  await page.getByLabel('Plan name').press('Tab');
  await page.locator('#import-plan').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ format: 'led-layout-checker', version: 1, layout: { name: 'Broken' } })),
  });
  await expect(page.locator('#import-message')).toHaveText('This plan file has missing or invalid layout data. Choose an exported plan JSON file.');
  await expect(page.getByRole('button', { name: 'Import plan JSON' })).toBeFocused();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByLabel('Plan name')).toHaveValue('Keep this plan');
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

test('@claim:demo-sandbox isolates plans and licenses, resets, and exits cleanly', async ({ page }) => {
  await page.goto('/planner');
  await page.getByLabel('Plan name').fill('My real plan');
  await page.getByLabel('Plan name').press('Tab');
  const realPlan = await page.evaluate(() => localStorage.getItem('led-layout-checker:layout:v1'));
  const realLicense = 'REAL-LICENSE-SENTINEL';
  const realCache = JSON.stringify({ token: realLicense, valid: true, checkedAt: Date.now() });
  await page.evaluate(({ realLicense, realCache }) => {
    localStorage.setItem('sb_license:led-layout-checker', realLicense);
    localStorage.setItem('sb_license_check:led-layout-checker', realCache);
  }, { realLicense, realCache });
  await page.route(/https:\/\/api\.sociobot\.in\/.*verify\?license=(demo-return|demo-pasted)/, (route) => route.fulfill({ json: { valid: true, reason: 'ok' } }));

  await page.goto('/?demo=1&license=demo-return');
  await expect(page.getByLabel('Plan name')).toHaveValue('Garden arch — 480 pixels');
  await expect(page.getByText('Demo — sample data, nothing is saved to your plans.')).toBeVisible();
  await expect(page.getByText('Studio active')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('demo:sb_license:led-layout-checker'))).toBe('demo-return');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:led-layout-checker'))).toBe(realLicense);
  expect(await page.evaluate(() => localStorage.getItem('sb_license_check:led-layout-checker'))).toBe(realCache);

  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(await page.evaluate(() => localStorage.getItem('demo:sb_license:led-layout-checker'))).toBeNull();
  await page.getByText('Have a license?').click();
  await page.getByLabel('License token').fill('demo-pasted');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Studio active')).toBeVisible();
  await page.getByLabel('Plan name').fill('Changed demo');
  await page.getByLabel('Plan name').press('Tab');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Plan name')).toHaveValue('Garden arch — 480 pixels');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByLabel('Plan name')).toHaveValue('My real plan');
  const storage = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])));
  expect(storage['led-layout-checker:layout:v1']).toBe(realPlan);
  expect(storage['sb_license:led-layout-checker']).toBe(realLicense);
  expect(storage['sb_license_check:led-layout-checker']).toBe(realCache);
  expect(Object.keys(storage).filter((key) => key.startsWith('demo:'))).toEqual([]);
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
    expect(results.violations, path).toEqual([]);
  }
});

test('overflowing preflight results are keyboard scrollable and pass axe', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/demo');
  await page.getByRole('button', { name: /Segment/ }).click();
  for (const [x, y] of [[0, 0], [100, 100]]) {
    await page.getByLabel('X', { exact: true }).fill(String(x));
    await page.getByLabel('Y', { exact: true }).fill(String(y));
    await page.getByRole('button', { name: 'Place at coordinates' }).click();
  }
  await page.getByRole('button', { name: 'Finish segment' }).click();

  const results = page.getByRole('list', { name: 'Layout check results' });
  const dimensions = await results.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: getComputedStyle(element).overflowY,
  }));
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
  expect(dimensions.overflowY).toBe('auto');

  await page.locator('#plan-canvas').focus();
  await page.keyboard.press('Tab');
  await expect(results).toBeFocused();
  await page.keyboard.press('End');
  await expect.poll(() => results.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  const axe = await new AxeBuilder({ page: page as never }).analyze();
  expect(axe.violations).toEqual([]);
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

test('Select chooses paths and sources by pointer and keyboard', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('[data-tool="select"]').click();
  const canvas = page.locator('#plan-canvas');
  const box = (await canvas.boundingBox())!;
  await canvas.click({ position: { x: box.width * .79, y: box.height * .29 } });
  await expect(page.locator('#active-segment')).toHaveValue('seg-arch-right');
  await expect(page.locator('[data-select-item="segment:seg-arch-right"]')).toHaveClass(/selected/);
  await page.getByLabel('Select plan item').selectOption('controller:ctrl-1');
  await expect(page.locator('[data-controller-name="ctrl-1"]')).toBeFocused();
  await expect(page.locator('[data-select-item="controller:ctrl-1"]')).toHaveClass(/selected/);
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

test('empty coordinate fields are rejected and focus the first field', async ({ page }) => {
  await page.goto('/planner');
  await page.getByRole('button', { name: /Segment/ }).click();
  await page.getByLabel('X', { exact: true }).fill('');
  await page.getByLabel('Y', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Place at coordinates' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Use coordinates from 0 to 100. Enter both X and Y.' })).toBeVisible();
  await expect(page.getByLabel('X', { exact: true })).toBeFocused();
  await expect(page.getByLabel('X', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('1 points in new segment')).toHaveCount(0);
  await expect(page.locator('#plan-description')).not.toContainText('coordinates 0, 0');
});

test('empty license submission announces recovery and focuses the required field', async ({ page }) => {
  let verificationRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/verify?license=')) verificationRequests += 1;
  });
  await page.goto('/planner#studio-title');
  await page.getByText('Have a license?').click();
  const input = page.getByLabel('License token');
  await expect(input).toHaveAttribute('required', '');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('#license-message')).toHaveText('Enter your license token, then verify again.');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(verificationRequests).toBe(0);
});

test('restore and locked-controller links preserve and honor the Studio fragment', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Restore a license' }).click();
  await expect(page).toHaveURL('/planner#studio-title');
  await expect(page.locator('#studio-title')).toBeFocused();

  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add controller · Studio' }).click();
  await expect(page).toHaveURL('/demo#studio-title');
  await expect(page.locator('#studio-title')).toBeFocused();
  await expect(page.getByRole('link', { name: 'Buy Studio for $12' })).toBeVisible();
});

test('saved items can be corrected, removed, and restored', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Supply A voltage').selectOption('12');
  await expect(page.getByText('Supply A voltage does not match')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Arch left' }).click();
  await expect(page.getByText('Arch left has power points marked')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Arch left has power points marked')).toHaveCount(0);
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

test('@claim:studio-checkout opens the $12 one-time hosted checkout', async ({ page }) => {
  let checkoutRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/led-layout-checker/checkout', async (route) => {
    checkoutRequests += 1;
    await route.fulfill({ status: 303, headers: { location: 'http://127.0.0.1:4173/checkout-fixture' } });
  });
  await page.goto('/demo');
  await expect(page.getByText('$12 once.')).toBeVisible();
  await expect(page.getByText('Checkout runs through Sociobot. Dodo is the merchant of record and handles payment and refunds.')).toBeVisible();
  await page.getByRole('link', { name: 'Buy Studio for $12' }).click();
  await expect(page).toHaveURL('/checkout-fixture');
  expect(checkoutRequests).toBe(1);
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
  const notFound = readFileSync('public/404.html', 'utf8');
  for (const required of ['name="description"', 'rel="canonical"', 'property="og:title"', 'name="twitter:title"', 'rel="apple-touch-icon"', 'Built by Param Factory', 'v1.1.0', 'Hero imagery was generated']) {
    expect(notFound).toContain(required);
  }
});

test('installed service worker returns the designed 404 with status 404', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  const response = await page.goto('/definitely-missing-after-worker');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This path does not connect' })).toBeVisible();
});

test('each route updates title, description, canonical, and social metadata', async ({ page }) => {
  const routes = [
    ['/', 'LED Layout Checker — plan strips before soldering', '/'],
    ['/planner', 'Planner — LED Layout Checker', '/planner'],
    ['/?demo=1', 'Demo — LED Layout Checker', '/demo'],
    ['/privacy', 'Privacy — LED Layout Checker', '/privacy'],
    ['/terms', 'Terms — LED Layout Checker', '/terms'],
    ['/missing-metadata', 'Page not found — LED Layout Checker', '/404.html'],
  ];
  for (const [path, title, canonicalPath] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const values = await page.evaluate(() => ({
      description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content,
      canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href,
      ogTitle: document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content,
      ogDescription: document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content,
      twitterTitle: document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content,
      twitterDescription: document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.content,
    }));
    expect(values.description?.length).toBeGreaterThan(20);
    expect(values.canonical).toBe(`https://led-layout-checker.sociobot.in${canonicalPath}`);
    expect(values.ogTitle).toBe(title);
    expect(values.twitterTitle).toBe(title);
    expect(values.ogDescription).toBe(values.description);
    expect(values.twitterDescription).toBe(values.description);
  }
});

test('offline shell keeps browser security policies and avoids full-size hero precache', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  const cachedUrls = await page.evaluate(async () => {
    const cache = await caches.open('led-layout-checker-v9');
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
  for (const path of ['/', '/planner', '/demo', '/privacy', '/terms']) await page.goto(path);
  expect(errors).toEqual([]);
});
