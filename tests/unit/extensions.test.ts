import { describe, expect, it } from 'vitest';
import { catalog, storyPacks } from '../../src/examples/index.js';
import { parseStory, parseVisualization } from '../../src/core/spec.js';
import { chapterStory, timelineStory } from '../../src/core/story-patterns.js';
import { layoutChart } from '../../src/renderers/layout.js';

const fixture = (type: string) => structuredClone(catalog.find((entry) => entry.id === type)!.story);
describe('bounded V1.1 grammar and editorial patterns', () => {
  it('requires the new story version without migrating V1 fixtures', () => {
    const story = fixture('bump');
    expect(story.version).toBe('1.1');
    story.version = '1.0';
    expect(() => parseStory(story)).toThrow(/version 1.1/);
    expect(fixture('ranking').version).toBe('1.0');
  });
  it.each(['bump', 'stacked-area'])('rejects incomplete %s grids instead of inventing zeroes', (type) => {
    const story = fixture(type),
      visual = story.visuals[0];
    if (!('data' in visual)) throw new Error('fixture');
    visual.data.pop();
    expect(() => parseStory(story)).toThrow(/complete entity\/time grid/);
  });
  it('rejects negative composition and undefined zero-total shares', () => {
    const visual = fixture('stacked-area').visuals[0];
    if (visual.type !== 'stacked-area') throw new Error('fixture');
    visual.data[0].value = -1;
    expect(() => parseVisualization(visual)).toThrow(/nonnegative/);
    visual.data.forEach((row) => {
      row.value = 0;
    });
    expect(() => parseVisualization(visual)).toThrow(/positive total/);
    visual.normalize = false;
    expect(() => parseVisualization(visual)).not.toThrow();
  });
  it('keeps normalized thickness at 100% for every scene, including the first paused view', () => {
    const story = fixture('stacked-area'),
      visual = story.visuals[0];
    if (visual.type !== 'stacked-area') throw new Error('fixture');
    for (const scene of story.scenes) {
      const layout = layoutChart(visual, scene, 390);
      const total = layout.entities.reduce(
        (sum, entity) => sum + Number(entity.marks.find((mark) => mark.key === 'slice')!.attrs.height),
        0,
      );
      expect(total).toBeCloseTo(330 - 48 - 30, 8);
    }
  });
  it('includes the maximum boundary and keeps histogram sample counts conserved', () => {
    const story = fixture('histogram'),
      visual = story.visuals[0];
    if (visual.type !== 'histogram') throw new Error('fixture');
    visual.data.at(-1)!.value = 100;
    parseVisualization(visual);
    const layout = layoutChart(visual, story.scenes.at(-1), 800);
    expect(layout.entities).toHaveLength(8);
    expect(
      layout.entities.reduce(
        (sum, entity) => sum + Number(entity.marks.find((mark) => mark.key === 'count')!.text),
        0,
      ),
    ).toBe(48);
    visual.data.at(-1)!.value = 101;
    expect(() => parseVisualization(visual)).toThrow(/contain all observations/);
  });
  it('normalizes histogram probabilities and highlights bins containing focused observations', () => {
    const story = fixture('histogram'),
      visual = story.visuals[0];
    if (visual.type !== 'histogram') throw new Error('fixture');
    visual.normalization = 'probability';
    const scene = { ...story.scenes[0], focusIds: ['sample-0'] };
    const layout = layoutChart(visual, scene, 800);
    expect(layout.entities.filter((entity) => entity.opacity === 1)).toHaveLength(1);
    expect(
      layout.entities.every(
        (entity) => Number(entity.marks[0].attrs.height) >= 0 && Number(entity.marks[0].attrs.y) >= 30,
      ),
    ).toBe(true);
  });
  it('breaks ties by stable ID and displays integer ranks only', () => {
    const story = fixture('bump'),
      visual = story.visuals[0];
    if (visual.type !== 'bump') throw new Error('fixture');
    visual.data.forEach((row) => {
      if (row.year === 2018) row.value = 100;
    });
    const layout = layoutChart(visual, story.scenes[0], 390);
    expect(layout.entities.find((entity) => entity.id === 'broad')!.label).toContain('rank 1');
    expect(layout.entities.find((entity) => entity.id === 'local')!.label).toContain('rank 4');
    expect(
      layout.decorations
        .filter((mark) => mark.key.startsWith('rank-tick'))
        .every((mark) => /^\d+$/.test(mark.text!)),
    ).toBe(true);
  });
  it('uses one y scale in every small-multiple panel', () => {
    const story = fixture('small-multiples'),
      visual = story.visuals[0];
    if (visual.type !== 'small-multiples') throw new Error('fixture');
    const layout = layoutChart(visual, story.scenes[0], 800);
    const offsets = layout.entities.map(
      (entity) => Number(entity.marks.find((mark) => mark.key === 'endpoint')!.attrs.cy) % 185,
    );
    offsets.forEach((offset) => expect(offset).toBeCloseTo(offsets[0], 8));
  });
  it('distinguishes missing map values from zero and preserves holes and multipart geography', () => {
    const story = fixture('choropleth'),
      visual = story.visuals[0];
    if (visual.type !== 'choropleth') throw new Error('fixture');
    visual.data[0].value = 0;
    const layout = layoutChart(visual, story.scenes[0], 800);
    expect(layout.entities.find((entity) => entity.id === 'eel')!.label).toContain('No data');
    expect(layout.entities.find((entity) => entity.id === 'aster')!.label).toContain('0%');
    const path = (id: string) => String(layout.entities.find((entity) => entity.id === id)!.marks[0].attrs.d);
    expect(path('aster').match(/M/g)!.length).toBe(2);
    expect(path('dune').match(/M/g)!.length).toBe(2);
    const region = visual.regions[0];
    if (region.geometry.type !== 'Polygon') throw new Error('fixture');
    region.geometry.coordinates = region.geometry.coordinates.map((ring) => ring.slice().reverse());
    const reversed = layoutChart(visual, story.scenes[0], 800);
    expect(reversed.entities.find((entity) => entity.id === 'aster')!.marks[0].attrs.d).toBe(path('aster'));
    region.geometry.coordinates[0].pop();
    expect(() => parseVisualization(visual)).toThrow(/closed/);
  });
  it('rejects unknown map regions, degenerate rings and out-of-domain values', () => {
    const visual = fixture('choropleth').visuals[0];
    if (visual.type !== 'choropleth') throw new Error('fixture');
    visual.data[0].id = 'unknown';
    expect(() => parseVisualization(visual)).toThrow(/known region/);
    visual.data[0].id = 'aster';
    visual.data[0].value = 2;
    expect(() => parseVisualization(visual)).toThrow(/contain all values/);
    visual.data[0].value = 0.7;
    visual.regions[0].geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [1, 1],
        ],
      ],
    };
    expect(() => parseVisualization(visual)).toThrow(/enclose an area/);
  });
  it.each(storyPacks)('round-trips and truthfully labels every $id fixture', (entry) => {
    expect(parseStory(JSON.parse(JSON.stringify(entry.story)))).toEqual(entry.story);
    for (const visual of entry.story.visuals) expect(visual.source).toMatch(/synthetic/i);
  });
  it('reconciles the AI energy story across both visual families', () => {
    const story = storyPacks.find((entry) => entry.id === 'pack-ai-energy')!.story;
    const area = story.visuals.find((visual) => visual.type === 'stacked-area')!;
    const bridge = story.visuals.find((visual) => visual.type === 'contribution')!;
    if (area.type !== 'stacked-area' || bridge.type !== 'contribution') throw new Error('fixture');
    const total = area.data
      .filter((row) => row.year === 2024)
      .reduce((sum, row) => sum + Number(row.value), 0);
    expect(total).toBe(190);
    expect(bridge.baseline + bridge.data.reduce((sum, row) => sum + Number(row.value), 0)).toBe(total);
  });
  it('validates editorial pattern inputs and refuses conflicting visual IDs', () => {
    const visual = fixture('time-series').visuals[0];
    expect(() => timelineStory(fixture('table').visuals[0], [])).toThrow(/temporal/);
    expect(() =>
      timelineStory(visual, [{ id: 'bad', time: 3000, title: 'Bad time', caption: 'Outside the domain' }]),
    ).toThrow(/timeline/);
    const scene = { id: 'chapter', title: 'One chapter', caption: 'A complete caption' };
    expect(() =>
      chapterStory({ id: 'test', title: 'Test', description: 'Test' }, [
        { visual, scene },
        { visual: { ...visual, title: 'Conflicting' }, scene: { ...scene, id: 'two' } },
      ]),
    ).toThrow(/Conflicting/);
  });
});
