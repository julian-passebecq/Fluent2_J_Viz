import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { flagshipStories } from '../../src/examples/index.js';

for (const entry of flagshipStories) {
  test(`${entry.id}: pinned evidence, every paused scene and shared ownership`, async ({ page }, info) => {
    const errors: string[] = [],
      external: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:43871'))
        external.push(request.url());
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Visual catalog', exact: true }).click();
    await page.getByRole('button', { name: `Open flagship: ${entry.name}`, exact: true }).click();
    await expect(page.locator('.dp-figure-player')).toHaveCount(1);
    await expect(page.locator('.vf-controls')).toHaveCount(0);
    await page.waitForTimeout(1400);
    await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '0');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reports = [];
    mkdirSync('docs/qa', { recursive: true });
    for (const [index, scene] of entry.story.scenes.entries()) {
      await page.getByRole('button', { name: `Scene ${index + 1}: ${scene.title}`, exact: true }).click();
      await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', scene.id);
      await expect(page.locator('.vf-figure')).toHaveAttribute('data-transition-ms', '0');
      expect(await page.locator('.vf-chart').innerHTML()).not.toMatch(/NaN|Infinity/);
      await expect(page.locator('.vf-annotations > p')).not.toHaveCount(0);
      const axe = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
      const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      reports.push({ scene: scene.id, overflow, seriousCritical: serious.length });
      await page
        .locator('.story-panel')
        .screenshot({ path: `docs/qa/${info.project.name}-${entry.id}-${index}.png` });
    }
    if (entry.id === 'flagship-cross') {
      await expect(page.locator('.dp-workbench [data-figure-renderer="lineage.model"] svg')).toBeVisible();
      await expect(
        page.locator('.dp-workbench [data-figure-renderer="vizforge.d3"] .vf-chart'),
      ).toBeVisible();
      await expect(page.locator('.lineage-panel .vf-figure')).toHaveCount(0);
      await page
        .locator('.evidence-canvas')
        .screenshot({ path: `docs/qa/${info.project.name}-cross-engine.png` });
      const lineage = await page.locator('.lineage-panel svg').innerHTML();
      if (info.project.name === 'phone') {
        const viewport = page.getByRole('region', { name: 'Source to KPI diagram, scroll horizontally' });
        await viewport.focus();
        await page.keyboard.press('ArrowRight');
        await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      }
      await page.getByRole('region', { name: 'Story preview', exact: true }).focus();
      await page.keyboard.press('Home');
      await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '0');
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '1');
      expect(await page.locator('.lineage-panel svg').innerHTML()).toBe(lineage);
    }
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export current figure as SVG', exact: true }).click();
    const download = await downloaded;
    const svg = readFileSync((await download.path())!, 'utf8');
    expect(svg).toContain(entry.id === 'flagship-events' ? 'USGS ComCat' : 'World Bank');
    expect(svg).toContain('Note:');
    expect(svg).not.toMatch(/NaN|Infinity|data-conceptmotion/);
    writeFileSync(
      `docs/qa/${info.project.name}-${entry.id}-release.json`,
      JSON.stringify({ reports, externalRequests: external, pageErrors: errors }, null, 2) + '\n',
    );
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const [id, selector, attribute] of [
  ['flagship-time', '[data-entity-id="CHN"] [data-mark="focus-point"]', 'cy'],
  ['flagship-ranking', '[data-entity-id="CHN"] [data-mark="bar"]', 'y'],
] as const) {
  test(`${id}: real intermediate geometry retains the same D3 node`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`/?story=${id}`);
    const mark = page.locator(selector);
    const start = Number(await mark.getAttribute(attribute));
    await mark.evaluate(
      (element, sampledAttribute) => {
        const state = { values: [] as number[], done: false };
        (window as any).__flagshipMotion = state;
        (window as any).__flagshipMark = element;
        const started = performance.now();
        const sample = () => {
          const value = Number(element.getAttribute(sampledAttribute));
          if (Number.isFinite(value)) state.values.push(value);
          if (performance.now() - started < 900) requestAnimationFrame(sample);
          else state.done = true;
        };
        requestAnimationFrame(sample);
      },
      attribute,
    );
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => (window as any).__flagshipMotion?.done === true), {
        timeout: 1500,
      })
      .toBe(true);
    const samples = await page.evaluate(() => (window as any).__flagshipMotion.values as number[]);
    const end = Number(await mark.getAttribute(attribute));
    expect(end).not.toBe(start);
    const low = Math.min(start, end),
      high = Math.max(start, end),
      epsilon = Math.max(1e-6, Math.abs(end - start) * 1e-6);
    expect(samples.some((value) => value > low + epsilon && value < high - epsilon)).toBe(true);
    expect(Number(await page.locator('.vf-figure').getAttribute('data-transition-ms'))).toBeGreaterThan(0);
    expect(await mark.evaluate((element) => element === (window as any).__flagshipMark)).toBe(true);
    await page.getByRole('region', { name: 'Story preview', exact: true }).focus();
    await page.keyboard.press(' ');
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
    await page.keyboard.press(' ');
    await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
  });
}

test('event focus preserves existing location nodes while revealing later observations', async ({ page }) => {
  await page.goto('/?story=flagship-events');
  const mark = page.locator('[data-entity-id="usp000hvhj"] [data-mark="symbol"]');
  await mark.evaluate((element) => {
    (window as any).__eventMark = element;
  });
  const position = [await mark.getAttribute('cx'), await mark.getAttribute('cy')];
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.vf-entity')).toHaveCount(2);
  await page.waitForTimeout(750);
  expect([await mark.getAttribute('cx'), await mark.getAttribute('cy')]).toEqual(position);
  expect(await mark.evaluate((element) => element === (window as any).__eventMark)).toBe(true);
});
