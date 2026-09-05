import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { storyPacks } from '../../src/examples/index.js';

for (const entry of storyPacks)
  test(`${entry.id}: complete hosted editorial composition`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Visual catalog', exact: true }).click();
    await page.getByRole('button', { name: `Open story pack: ${entry.name}`, exact: true }).click();
    const reports = [];
    for (const [index, scene] of entry.story.scenes.entries()) {
      await page.getByRole('button', { name: `Scene ${index + 1}: ${scene.title}`, exact: true }).click();
      await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', scene.id);
      await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', String(index));
      await expect(page.locator('.vf-figure')).toHaveAttribute('data-transition-ms', '0');
      expect(await page.locator('.vf-figure').innerHTML()).not.toMatch(/NaN|Infinity/);
      const result = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
      expect(result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      reports.push({
        scene: scene.id,
        overflow,
        violations: result.violations.map((v) => ({ id: v.id, impact: v.impact })),
      });
    }
    mkdirSync('docs/qa', { recursive: true });
    writeFileSync(
      `docs/qa/${info.project.name}-${entry.id}-axe.json`,
      JSON.stringify(reports, null, 2) + '\n',
    );
    await page.screenshot({ path: `docs/qa/${info.project.name}-${entry.id}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });

for (const [name, selector, attribute] of [
  ['Rank trajectories', '[data-entity-id="craft"] [data-mark="endpoint"]', 'cy'],
  ['Distribution stories', '[data-entity-id="$bin:12.5:25"] [data-mark="bar"]', 'y'],
  ['Small multiples', '[data-entity-id="aster"] [data-mark="endpoint"]', 'cy'],
  ['Composition over time', '[data-entity-id="stream"] [data-mark="slice"]', 'height'],
] as const)
  test(`${name}: genuine motion and stable identity in FigurePlayer`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Visual families' })
      .getByRole('button', { name, exact: true })
      .click();
    const mark = page.locator(selector);
    const start = Number(await mark.getAttribute(attribute));
    await mark.evaluate((el) => {
      (window as any).__vizforgeMark = el;
    });
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(200);
    const middle = Number(await mark.getAttribute(attribute));
    await page.waitForTimeout(650);
    const end = Number(await mark.getAttribute(attribute));
    expect(end).not.toBe(start);
    expect(middle).toBeGreaterThan(Math.min(start, end));
    expect(middle).toBeLessThan(Math.max(start, end));
    expect(await mark.evaluate((el) => el === (window as any).__vizforgeMark)).toBe(true);
  });

test('applying a valid story while playing resets the single native controller', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.getByRole('button', { name: 'Try a multi-figure story' }).click();
  await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '0');
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
  await page.waitForTimeout(2700);
  await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '0');
});

test('choropleth interpolates color while preserving geographic paths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Visual families' })
    .getByRole('button', { name: 'Regional change map', exact: true })
    .click();
  const region = page.locator('[data-entity-id="cove"] [data-mark="region"]');
  const shape = await region.getAttribute('d');
  const start = await region.getAttribute('fill');
  await region.evaluate((el) => {
    (window as any).__mapRegion = el;
  });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForTimeout(200);
  const middle = await region.getAttribute('fill');
  await page.waitForTimeout(650);
  const end = await region.getAttribute('fill');
  expect(start).not.toBe(end);
  expect(middle).not.toBe(start);
  expect(middle).not.toBe(end);
  expect(await region.getAttribute('d')).toBe(shape);
  expect(await region.evaluate((el) => el === (window as any).__mapRegion)).toBe(true);
});
