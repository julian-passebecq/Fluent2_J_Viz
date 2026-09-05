import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalog } from '../../src/examples/index.js';
import { mkdirSync, writeFileSync } from 'node:fs';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^VizForge/);
});
test('primary React flow, keyboard playback, deterministic reset and no autoplay', async ({ page }) => {
  const preview = page.getByRole('region', { name: 'Story preview', exact: true });
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'opening');
  await page.waitForTimeout(2700);
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'opening');
  await preview.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'momentum');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'opening');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'momentum', { timeout: 6000 });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.waitForTimeout(750);
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'momentum');
  await preview.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'opening');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
for (const family of catalog)
  test(`${family.id}: all scenes, reduced motion, accessibility and responsive proof`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page
      .getByRole('navigation', { name: 'Visual families' })
      .getByRole('button', { name: family.name, exact: true })
      .click();
    const sceneReports = [];
    for (let i = 0; i < family.story.scenes.length; i++) {
      await page
        .getByRole('button', { name: `Scene ${i + 1}: ${family.story.scenes[i].title}`, exact: true })
        .click();
      await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', family.story.scenes[i].id);
      await expect(page.locator('.vf-figure')).toHaveAttribute('data-transition-ms', '0');
      expect(await page.locator('.vf-figure').innerHTML()).not.toMatch(/NaN|Infinity/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const axe = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
      sceneReports.push({
        sceneId: family.story.scenes[i].id,
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({ target: n.target, failure: n.failureSummary })),
        })),
      });
    }
    mkdirSync('docs/qa', { recursive: true });
    const violations = sceneReports.flatMap((s) => s.violations);
    writeFileSync(
      `docs/qa/${testInfo.project.name}-${family.id}-axe.json`,
      JSON.stringify({ scenes: sceneReports, violations }, null, 2),
    );
    await page.screenshot({ path: `docs/qa/${testInfo.project.name}-${family.id}.png`, fullPage: true });
    expect(violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
    expect(errors).toEqual([]);
  });
test('ranking genuinely interpolates the same keyed bar and interruption settles deterministically', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page
    .getByRole('navigation', { name: 'Visual families' })
    .getByRole('button', { name: 'Animated ranking', exact: true })
    .click();
  const bar = page.locator('[data-entity-id=coast] [data-mark=bar]');
  const startY = Number(await bar.getAttribute('y'));
  await bar.evaluate((el) => {
    (window as any).__rankBar = el;
  });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForTimeout(200);
  const duringY = Number(await bar.getAttribute('y'));
  await page.waitForTimeout(650);
  const finalY = Number(await bar.getAttribute('y'));
  expect(duringY).toBeLessThan(startY);
  expect(duringY).toBeGreaterThan(finalY);
  expect(await bar.evaluate((el) => el === (window as any).__rankBar)).toBe(true);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.waitForTimeout(850);
  expect(Number(await bar.getAttribute('y'))).toBe(startY);
});
test('spec editing rejects invalid input and applies valid canonical JSON', async ({ page }) => {
  await page.getByRole('button', { name: 'Semantic spec', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Canonical StorySpec · JSON', exact: true });
  await expect(input).toBeVisible();
  const original = JSON.stringify(catalog[0].story);
  async function edit(value: string) {
    await page.locator('.monaco-editor .view-lines').click({ position: { x: 40, y: 10 } });
    await page.keyboard.press('ControlOrMeta+Home');
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(value);
  }
  await edit('{"version":"bad"}');
  await page.getByRole('button', { name: 'Validate & apply', exact: true }).click();
  await expect(page.locator('#spec-error')).toBeVisible();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'opening');
  const next = JSON.parse(original);
  next.scenes[0].title = 'A custom opening';
  await edit(JSON.stringify(next));
  await page.getByRole('button', { name: 'Validate & apply', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A custom opening' })).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export spec ↓', exact: true }).click();
  expect((await downloadEvent).suggestedFilename()).toMatch(/\.json$/);
});
test('catalog search and cross-family editorial wrapper', async ({ page }) => {
  await page.getByRole('button', { name: 'Visual catalog', exact: true }).click();
  const axe = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
  expect(
    axe.violations
      .filter((v) => v.impact === 'critical' || v.impact === 'serious')
      .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
  await page.getByLabel('Search visual families').fill('uncertainty');
  await expect(page.locator('.catalog-card')).toHaveCount(1);
  await page.locator('.catalog-card').click();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-visual-type', 'forecast');
  await page.getByRole('button', { name: 'Try a multi-figure story' }).click();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-visual-type', 'time-series');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-visual-type', 'ranking');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-visual-type', 'contribution');
});
test('standalone renderer runs without a React entry point', async ({ page }) => {
  await page.goto('/standalone.html');
  await expect(page.getByRole('heading', { name: 'Standalone D3 renderer' })).toBeVisible();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-visual-type', 'ranking');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.vf-figure')).toHaveAttribute('data-scene-id', 'rank-middle');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
