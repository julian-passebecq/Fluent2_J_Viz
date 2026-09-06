import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { catalog, storyPacks, flagshipStories } from '../../src/examples/index.js';
import { parseStory, type ChartSpec } from '../../src/core/spec.js';
import { layoutChart } from '../../src/renderers/layout.js';
import { createRenderer } from '../../src/renderers/dom.js';
import { gdpLineageFigure, lineageRegistry } from '../../src/studio/DataLineage.js';
import { vizforgeRegistry } from '../../src/studio/datapass.js';
import gdp from '../../data/world-bank-gdp.json';
import events from '../../data/usgs-tohoku.json';

describe('pinned editorial evidence', () => {
  it('retains the existing 15 families and 22 synthetic canonical examples', () => {
    expect(catalog).toHaveLength(15);
    expect(catalog.length + storyPacks.length + 1).toBe(22);
    const manifest = JSON.parse(readFileSync('docs/DATA_PROVENANCE.json', 'utf8'));
    expect(manifest.fixtures.filter((entry: any) => entry.synthetic)).toHaveLength(22);
    expect(flagshipStories).toHaveLength(4);
  });
  it('verifies source and output hashes plus independently rerun offline transformations', () => {
    expect(() => execFileSync(process.execPath, ['scripts/real-data.mjs', '--verify'])).not.toThrow();
  });
  it.each(flagshipStories)(
    '$id has finite layouts and evidence annotations in every paused scene',
    ({ story }) => {
      expect(parseStory(story)).toEqual(story);
      for (const scene of story.scenes) {
        const visual = story.visuals.find((v) => v.id === scene.visualId)! as ChartSpec;
        expect(scene.annotationIds.length).toBeGreaterThan(0);
        for (const width of [320, 800]) {
          const layout = layoutChart(visual, scene, width);
          expect(layout.entities.length).toBeGreaterThan(0);
          expect(JSON.stringify(layout)).not.toMatch(/NaN|Infinity/);
        }
      }
    },
  );
  it('uses the source GDP values without filling or rounding and shares the same ISO3/color identities', () => {
    const story = flagshipStories[3].story;
    const colors = story.visuals.map((visual) => {
      const spec = visual as ChartSpec;
      if (!('data' in spec)) throw new Error('data');
      expect(spec.data.map((row) => Number(row.value))).toEqual(gdp.map((row) => row.value / 1e12));
      return layoutChart(
        spec,
        { ...story.scenes[0], visualId: spec.id, focusIds: [], state: { time: 2023 } },
        800,
      )
        .entities.map((entity) => [
          entity.id,
          entity.marks.find(
            (mark) => mark.key === 'focus-point' || mark.key === 'bar' || mark.key === 'slice',
          )!.attrs.fill,
        ])
        .sort();
    });
    expect(colors[1]).toEqual(colors[0]);
    expect(colors[2]).toEqual(colors[0]);
  });
  it('shows a cumulative observed event sequence at fixed coordinates and equal symbol sizes', () => {
    const story = flagshipStories[2].story,
      spec = story.visuals[0] as ChartSpec;
    expect(events).toHaveLength(4);
    const layouts = story.scenes.map((scene) => layoutChart(spec, scene, 800));
    expect(layouts.map((layout) => layout.entities.length)).toEqual([1, 2, 3, 4]);
    const symbols = layouts.map(
      (layout) => layout.entities[0].marks.find((mark) => mark.key === 'symbol')!.attrs,
    );
    expect(
      symbols.every((symbol) => symbol.cx === symbols[0].cx && symbol.cy === symbols[0].cy && symbol.r === 7),
    ).toBe(true);
    expect(events[3].time - events[1].time).toBeLessThan(40 * 60 * 1000);
  });
  it('keeps full evidence accessible when using authored phone annotations', () => {
    const { story } = flagshipStories[0],
      host = document.createElement('div');
    const renderer = createRenderer(host);
    renderer.update(story.visuals[0], story.scenes[0], { width: 320, reducedMotion: true });
    expect(host.querySelector('.vf-annotations > p')!.textContent).toBe(
      story.visuals[0].annotations[0].shortText,
    );
    expect(host.querySelector('.vf-annotations details')!.textContent).toContain(
      story.visuals[0].annotations[0].text,
    );
    renderer.destroy();
  });
  it('honors authored scene annotation priority on narrow screens', () => {
    const { story } = flagshipStories[1],
      host = document.createElement('div');
    const renderer = createRenderer(host);
    renderer.update(story.visuals[0], story.scenes.at(-1), { width: 320, reducedMotion: true });
    expect(host.querySelector('.vf-annotations > p')!.getAttribute('data-annotation-id')).toBe('rank-change');
    expect(host.querySelector('.vf-annotations > p')!.textContent).toContain('Germany');
    renderer.destroy();
  });
  it('keeps the canonical technical renderer registry independent from the analytical adapter', () => {
    expect(lineageRegistry).not.toBe(vizforgeRegistry);
    expect(lineageRegistry.has('vizforge.d3')).toBe(false);
    expect(lineageRegistry.get('lineage.model')!.validate!(gdpLineageFigure)).toEqual([]);
    const spec = gdpLineageFigure.spec as any;
    expect(spec.assets).toHaveLength(6);
    expect(spec.relations).toHaveLength(5);
    expect(spec.assets.map((asset: any) => asset.id)).toEqual([
      'source.world-bank',
      'bronze.gdp-json',
      'silver.country-years',
      'gold.gdp-trillions',
      'semantic.selected-gdp',
      'kpi.country-share',
    ]);
  });
});
