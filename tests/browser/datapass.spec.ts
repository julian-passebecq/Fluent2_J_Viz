import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

test('real Fluent surfaces, lazy editor, keyboard controls, reduced motion and SVG action', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.locator('.dp-app-shell .dp-workbench [data-figure-renderer="vizforge.d3"]'),
  ).toBeVisible();
  await expect(page.locator('.dp-figure-player')).toHaveCount(1);
  await expect(page.locator('.vf-controls')).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      performance.getEntriesByType('resource').some((r) => /MonacoSurfaces|editor.worker/.test(r.name)),
    ),
  ).toBe(false);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('button', { name: 'Next', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '1');
  await page.getByRole('slider', { name: 'Timeline step' }).focus();
  await page.keyboard.press('End');
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'new-order');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export current figure as SVG', exact: true }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/opening\.svg$/);
  const svg = readFileSync((await file.path())!, 'utf8');
  expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(svg).toContain('Source: VizForge synthetic');
  expect(svg).not.toMatch(/NaN|Infinity|data-conceptmotion/);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(
    page.getByRole('button', { name: 'Play unavailable while reduced motion is enabled', exact: true }),
  ).toBeDisabled();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-transition-ms', '0');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '1');
  await page.waitForTimeout(2700);
  await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '1');
  await page.getByRole('button', { name: 'Semantic spec', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Canonical StorySpec · JSON', exact: true })).toBeVisible();
  expect(
    await page.evaluate(() =>
      performance.getEntriesByType('resource').some((r) => /MonacoSurfaces/.test(r.name)),
    ),
  ).toBe(true);
  const axe = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
  expect(axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});
