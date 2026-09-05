import { describe, expect, it } from 'vitest';
import { catalog, editorialStory } from '../../src/examples/index.js';
import { parseStory, parseVisualization } from '../../src/core/spec.js';

const raw = (family: string) => structuredClone(catalog.find((c) => c.id === family)!.story) as any;
describe('canonical contracts', () => {
  it.each(catalog.map((c) => [c.id, c.story] as const))('validates and round-trips %s', (_, story) => {
    expect(parseStory(JSON.parse(JSON.stringify(story)))).toEqual(story);
  });
  it('supports an editorial scene sequence across families', () => {
    expect(parseStory(editorialStory).scenes.map((s) => s.visualId)).toEqual(
      editorialStory.visuals.map((v) => v.id),
    );
  });
  it.each([
    [
      'unknown version',
      (s: any) => {
        s.version = '2.0';
      },
    ],
    [
      'duplicate scene ID',
      (s: any) => {
        s.scenes[1].id = s.scenes[0].id;
      },
    ],
    [
      'missing visual',
      (s: any) => {
        s.scenes[0].visualId = 'missing';
      },
    ],
    [
      'unknown focus',
      (s: any) => {
        s.scenes[0].focusIds = ['missing'];
      },
    ],
    [
      'unknown annotation',
      (s: any) => {
        s.scenes[0].annotationIds = ['missing'];
      },
    ],
    [
      'duplicate temporal key',
      (s: any) => {
        s.visuals[0].data.push(s.visuals[0].data[0]);
      },
    ],
    [
      'nonfinite measure',
      (s: any) => {
        s.visuals[0].data[0].value = Infinity;
      },
    ],
    [
      'missing encoding',
      (s: any) => {
        s.visuals[0].encodings.value = 'missing';
      },
    ],
    [
      'out of range time',
      (s: any) => {
        s.scenes[0].state.time = 10000;
      },
    ],
    [
      'unsupported reveal state',
      (s: any) => {
        s.scenes[0].state.revealCount = 2;
      },
    ],
    [
      'inverted domain',
      (s: any) => {
        s.visuals[0].xDomain = [2, 1];
      },
    ],
    [
      'unrecognized spec field',
      (s: any) => {
        s.visuals[0].powerbi = {};
      },
    ],
  ])('rejects %s', (_, change) => {
    const story = raw('time-series');
    change(story);
    expect(() => parseStory(story)).toThrow();
  });
  it('rejects negative ranking magnitudes', () => {
    const s = raw('ranking');
    s.visuals[0].data[0].value = -1;
    expect(() => parseStory(s)).toThrow(/nonnegative/);
  });
  it('rejects negative bubble sizes', () => {
    const s = raw('scatter');
    s.visuals[0].data[0].population = -1;
    expect(() => parseStory(s)).toThrow(/negative/);
  });
  it('rejects flow cycles and dangling nodes before layout', () => {
    const s = raw('flow');
    s.visuals[0].links.push({ id: 'back', source: 'homes', target: 'renewable', value: 1 });
    expect(() => parseStory(s)).toThrow(/acyclic/);
    s.visuals[0].links.pop();
    s.visuals[0].links[0].target = 'unknown';
    expect(() => parseStory(s)).toThrow(/unknown/);
  });
  it('rejects intervals that do not contain the estimate', () => {
    const s = raw('forecast');
    s.visuals[0].data[5].low = 200;
    expect(() => parseStory(s)).toThrow(/interval/);
  });
  it('rejects invalid geographic coordinates', () => {
    const s = raw('event-map');
    s.visuals[0].coordinates = 'geographic';
    s.visuals[0].data[0].x = 200;
    expect(() => parseStory(s)).toThrow(/longitude/);
  });
  it('rejects nonnumeric analytical aggregates', () => {
    const s = raw('table');
    s.visuals[0].columns[0].total = 'sum';
    expect(() => parseStory(s)).toThrow(/numeric/);
  });
  it('rejects hierarchy cycles, non-leaf cells and duplicate cells', () => {
    const s = raw('matrix');
    s.visuals[0].rows[0].parentId = 'north-direct';
    expect(() => parseStory(s)).toThrow(/cycle/);
    delete s.visuals[0].rows[0].parentId;
    s.visuals[0].data[0].rowId = 'north';
    expect(() => parseStory(s)).toThrow(/leaf/);
    s.visuals[0].data[0].rowId = 'north-direct';
    s.visuals[0].data.push(s.visuals[0].data[0]);
    expect(() => parseStory(s)).toThrow(/unique/);
  });
  it('accepts finite zero values and a flat series', () => {
    const spec = raw('time-series').visuals[0];
    spec.data.forEach((d: any) => {
      d.value = 0;
    });
    expect(parseVisualization(spec)).toBeDefined();
  });
});
