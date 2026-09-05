import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import { catalog } from '../../src/examples/index.js';
import { parseStory } from '../../src/core/spec.js';
import { createRenderer } from '../../src/renderers/dom.js';
import { layoutChart } from '../../src/renderers/layout.js';
import { StoryPlayer } from '../../src/core/player.js';

describe('reusable engine boundaries', () => {
  it('core and renderer imports stay independent from every host framework', () => {
    for (const directory of ['src/core', 'src/renderers'])
      for (const file of readdirSync(directory).filter((f) => f.endsWith('.ts'))) {
        const imports = ts.preProcessFile(readFileSync(`${directory}/${file}`, 'utf8')).importedFiles;
        for (const imported of imports)
          expect(imported.fileName, `${directory}/${file}`).toMatch(
            /^(zod$|d3$|d3-sankey$|\.\/|\.\.\/core\/)/,
          );
      }
  });
  it('protects playback snapshots from external mutation', () => {
    const p = new StoryPlayer(catalog[0].story);
    expect(Object.isFrozen(p.getState())).toBe(true);
    p.next();
    expect(Object.isFrozen(p.getState())).toBe(true);
    p.dispose();
  });
  it('rejects reserved entity IDs that could collide with generated marks', () => {
    const story = structuredClone(catalog.find((c) => c.id === 'contribution')!.story);
    if (story.visuals[0].type !== 'contribution') throw new Error('fixture');
    story.visuals[0].data[0].id = '$baseline';
    expect(() => parseStory(story)).toThrow(/reserved/);
  });
  it('rejects a forecast that returns to observed data', () => {
    const story = structuredClone(catalog.find((c) => c.id === 'forecast')!.story);
    if (story.visuals[0].type !== 'forecast') throw new Error('fixture');
    story.visuals[0].data[5].projected = false;
    expect(() => parseStory(story)).toThrow(/Observed/);
  });
  it('renders group subtotals separately from the grand total without double counting', () => {
    const spec = catalog.find((c) => c.id === 'table')!.story.visuals[0];
    const host = document.createElement('div'),
      renderer = createRenderer(host);
    renderer.update(spec, undefined, { reducedMotion: true });
    const subtotals = host.querySelectorAll('tbody .vf-subtotal');
    expect(subtotals).toHaveLength(2);
    expect(subtotals[0].textContent).toContain('$95 m');
    expect(subtotals[1].textContent).toContain('$23 m');
    expect(host.querySelector('tfoot')!.textContent).toContain('$118 m');
    renderer.destroy();
  });
  it('geographic domains frame symbols and graticules in one projection', () => {
    const spec = structuredClone(catalog.find((c) => c.id === 'event-map')!.story.visuals[0]);
    if (spec.type !== 'event-map') throw new Error('fixture');
    spec.coordinates = 'geographic';
    spec.regions = [];
    spec.xDomain = [0, 100];
    spec.yDomain = [0, 90];
    const layout = layoutChart(spec, undefined, 500);
    expect(layout.decorations.some((d) => d.key === 'graticule')).toBe(true);
    const point = layout.entities.find((e) => e.id === 'upper')!.marks.find((m) => m.key === 'symbol')!;
    expect(Number(point.attrs.cx)).toBeLessThan(250);
    expect(Number(point.attrs.cy)).toBeLessThan(layout.height / 2);
    const before = point.attrs.cx;
    spec.xDomain = [-100, 100];
    const expanded = layoutChart(spec, undefined, 500);
    expect(
      expanded.entities.find((e) => e.id === 'upper')!.marks.find((m) => m.key === 'symbol')!.attrs.cx,
    ).not.toBe(before);
  });
});
