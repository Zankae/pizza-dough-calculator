import { test, expect } from '@playwright/test';
import samples from '../src/fixtures/original-results.json' with { type: 'json' };

let errors: string[] = [];
let external: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = []; external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(process.env.APP_URL || 'http://127.0.0.1:4173').origin) external.push(request.url()); });
  await page.goto('./');
  await expect(page.getByTestId('stat-ball')).toHaveText('480');
});
test.afterEach(async () => { expect(errors).toEqual([]); expect(external).toEqual([]); });

test('default recipe, offline-ready indicator and manifest', async ({ page }) => {
  await expect(page.getByTestId('stat-flour')).toHaveText('1705');
  await expect(page.getByTestId('stat-water')).toHaveText('1057');
  await expect(page.locator('.ingredient-table tbody tr')).toHaveCount(6);
  await expect(page.locator('.offline-status')).toHaveText('Offline ready');
  const manifest = await page.evaluate(async () => (await fetch(document.querySelector<HTMLLinkElement>('link[rel=manifest]')!.href)).json());
  expect(manifest.display).toBe('standalone'); expect(manifest.orientation).toBe('any');
  expect(manifest.start_url).toBe('./'); expect(manifest.scope).toBe('./');
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('INPUT');
});

test('offline-ready status remains correct after reopening online', async ({ page }) => {
  await expect(page.locator('.offline-status')).toHaveText('Offline ready');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })); });
  await page.reload();
  await expect(page.locator('.offline-status')).toHaveText('Offline ready');
});

test('settings, instructions and persistence use the selected recipe', async ({ page }) => {
  await page.getByRole('button', { name: 'Thin', exact: true }).click();
  await page.getByRole('switch', { name: /Gluten free/ }).check();
  await page.getByRole('slider', { name: 'Pizza size' }).focus();
  await page.keyboard.press('Home');
  await page.getByRole('slider', { name: 'Number of pizzas' }).focus();
  await page.keyboard.press('Home');
  const sample = samples.find(s => s.settings.size === 10 && s.settings.count === 1 && s.settings.thickness === 'thin' && s.settings.glutenFree)!;
  await expect(page.getByTestId('stat-ball')).toHaveText(String(sample.ball));
  await expect(page.getByTestId('stat-water')).toHaveText(String(sample.water));
  await expect(page.getByTestId('stat-hydration')).toHaveText('80%');
  await page.locator('.instructions summary').click();
  await expect(page.locator('.instructions').getByText('Refrigerate up to 48 hours')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('switch')).toBeChecked();
  await expect(page.getByRole('slider', { name: 'Pizza size' })).toHaveValue('10');
  await expect(page.getByRole('slider', { name: 'Number of pizzas' })).toHaveValue('1');
  await expect(page.getByRole('button', { name: 'Thin', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('stepper controls stop at source calculator limits', async ({ page }) => {
  await page.getByRole('slider', { name: 'Pizza size' }).focus(); await page.keyboard.press('Home');
  await page.getByRole('slider', { name: 'Number of pizzas' }).focus(); await page.keyboard.press('Home');
  await expect(page.getByRole('button', { name: 'Smaller pizza' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Fewer pizzas' })).toBeDisabled();
  await page.getByRole('button', { name: 'More pizzas' }).click();
  await expect(page.getByRole('slider', { name: 'Number of pizzas' })).toHaveValue('2');
  await page.getByRole('slider', { name: 'Pizza size' }).focus(); await page.keyboard.press('End');
  await page.getByRole('slider', { name: 'Number of pizzas' }).focus(); await page.keyboard.press('End');
  await expect(page.getByRole('button', { name: 'Larger pizza' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'More pizzas' })).toBeDisabled();
});

test('install dialog is modal and closes with Escape', async ({ page }) => {
  await page.getByRole('button', { name: /Install on iPad/ }).click();
  await expect(page.getByRole('dialog', { name: 'Install on your iPad' })).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Add to Home Screen')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Install on iPad/ })).toBeFocused();
});

for (const viewport of [{ name: 'ipad-portrait', width: 834, height: 1194 }, { name: 'ipad-landscape', width: 1194, height: 834 }, { name: 'ipad-large-portrait', width: 1024, height: 1366 }, { name: 'ipad-large-landscape', width: 1366, height: 1024 }, { name: 'ipad-compact-landscape', width: 1024, height: 768 }, { name: 'phone', width: 390, height: 844 }]) {
  test(`layout: ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const metrics = await page.evaluate(() => {
      const content = document.querySelector('.app-content')!;
      return { width: window.innerWidth, documentWidth: document.documentElement.scrollWidth, scroll: content.scrollHeight, visible: content.clientHeight, targets: [...document.querySelectorAll('button, input[type=range], .gf-row, summary')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ text: e.getAttribute('aria-label') || e.textContent, height: e.getBoundingClientRect().height })) };
    });
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.width);
    if (viewport.width >= 800) expect(metrics.scroll).toBeLessThanOrEqual(metrics.visible + 1);
    expect(metrics.targets.filter(t => t.height < 44)).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}.png`), fullPage: true });
    if (viewport.width >= 800) {
      await page.locator('.instructions summary').click();
      await expect(page.locator('.instructions').getByText('Bring to room temp before using')).toBeVisible();
    }
  });
}

test('offline cold reload still calculates and remembers settings', async ({ page, context }) => {
  await expect(page.locator('.offline-status')).toHaveText('Offline ready');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })); });
  await page.getByRole('button', { name: 'Thick', exact: true }).click();
  await page.getByRole('switch').check();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId('stat-hydration')).toHaveText('80%');
  await expect(page.getByRole('button', { name: 'Thick', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Fewer pizzas' }).click();
  await expect(page.getByRole('slider', { name: 'Number of pizzas' })).toHaveValue('5');
  await expect(page.locator('.offline-status')).toHaveText('Offline');
  await page.goto('?offline-test=1');
  await expect(page.getByRole('slider', { name: 'Number of pizzas' })).toHaveValue('5');
  await page.getByRole('button', { name: /Install on iPad/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Got it' }).click();
  await context.setOffline(false);
});

test('print layout includes instructions but not controls', async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.settings-panel')).not.toBeVisible();
  await expect(page.locator('.recipe-actions')).not.toBeVisible();
  await expect(page.locator('.ingredient-table')).toBeVisible();
  await expect(page.locator('.print-only').getByText('Refrigerate 2–4 days (3 ideal)')).toBeVisible();
});
