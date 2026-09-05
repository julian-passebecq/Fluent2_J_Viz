import { afterEach, describe, expect, it } from 'vitest';
import { catalog } from '../../src/examples/index.js';
import { createRenderer } from '../../src/renderers/dom.js';
import { layoutChart } from '../../src/renderers/layout.js';
import { aggregate, matrixValue, sortedRows } from '../../src/renderers/tables.js';
import { parseVisualization, type ChartSpec, type MatrixSpec, type TableSpec } from '../../src/core/spec.js';
import { mountFigure } from '../../src/adapters/host.js';
import { formatValue } from '../../src/core/format.js';

afterEach(() => document.body.replaceChildren());
describe('all family renderers', () => {
  for (const width of [900, 350])
    it.each(catalog.map((c) => [c.id, c.story] as const))(
      `renders every scene of %s at ${width}px with reduced motion`,
      (_, story) => {
        const host = document.createElement('div');
        document.body.append(host);
        const renderer = createRenderer(host);
        for (const scene of story.scenes) {
          renderer.update(story.visuals[0], scene, { width, reducedMotion: true });
          expect(host.innerHTML).not.toMatch(/NaN|Infinity/);
          expect(host.querySelector('.vf-figure')?.getAttribute('data-transition-ms')).toBe('0');
          expect(host.querySelectorAll('[data-entity-id]').length).toBeGreaterThan(0);
          expect(host.textContent).toContain(story.visuals[0].source);
          expect(host.querySelector('svg[role=img], table')).toBeTruthy();
        }
        renderer.destroy();
        expect(host.children.length).toBe(0);
      },
    );
  it('preserves the actual keyed bar and entity DOM nodes through reordering and reset', () => {
    const story = catalog.find((c) => c.id === 'ranking')!.story,
      host = document.createElement('div'),
      renderer = createRenderer(host);
    renderer.update(story.visuals[0], story.scenes[0], { width: 800, reducedMotion: true });
    const entity = host.querySelector('[data-entity-id=coast]')!,
      bar = entity.querySelector('[data-mark=bar]')!;
    const startY = bar.getAttribute('y'),
      startWidth = bar.getAttribute('width');
    renderer.update(story.visuals[0], story.scenes[2], { width: 800, reducedMotion: true });
    expect(host.querySelector('[data-entity-id=coast]')).toBe(entity);
    expect(entity.querySelector('[data-mark=bar]')).toBe(bar);
    expect(Number(bar.getAttribute('y'))).toBeLessThan(Number(startY));
    expect(Number(bar.getAttribute('width'))).toBeGreaterThan(Number(startWidth));
    renderer.update(story.visuals[0], story.scenes[0], { width: 800, reducedMotion: true });
    expect(bar.getAttribute('y')).toBe(startY);
    expect(bar.getAttribute('width')).toBe(startWidth);
    renderer.destroy();
  });
  it('retains earlier event nodes when later events reveal', () => {
    const story = catalog.find((c) => c.id === 'event-map')!.story,
      host = document.createElement('div'),
      renderer = createRenderer(host);
    renderer.update(story.visuals[0], story.scenes[0], { reducedMotion: true });
    const first = host.querySelector('[data-entity-id=upper]');
    renderer.update(story.visuals[0], story.scenes[2], { reducedMotion: true });
    expect(host.querySelector('[data-entity-id=upper]')).toBe(first);
    expect(host.querySelectorAll('.vf-entity')).toHaveLength(4);
    renderer.destroy();
  });
  it('uses stable temporal domains and ties sort by semantic ID', () => {
    const story = catalog.find((c) => c.id === 'ranking')!.story;
    const spec = structuredClone(story.visuals[0]) as Extract<ChartSpec, { type: 'ranking' }>;
    spec.data.forEach((d) => {
      d.value = 0;
    });
    const chart = layoutChart(spec, story.scenes[0], 350);
    expect(chart.entities.map((d) => d.id)).toEqual([
      'alpine',
      'central',
      'coast',
      'delta',
      'islands',
      'north',
    ]);
    expect(JSON.stringify(chart)).not.toMatch(/NaN|Infinity/);
  });
  it('escapes supplied text rather than injecting HTML', () => {
    const spec = structuredClone(catalog[0].story.visuals[0]);
    spec.title = '<img src=x onerror=alert(1)>';
    const host = document.createElement('div'),
      renderer = createRenderer(host);
    renderer.update(spec, undefined, { reducedMotion: true });
    expect(host.querySelector('img')).toBeNull();
    expect(host.textContent).toContain('<img src=x');
    renderer.destroy();
  });
  it('provides a React-free host adapter and rejects unrelated renderer IDs', () => {
    const host = document.createElement('div');
    const mounted = mountFigure(host, { rendererId: 'vizforge.d3', spec: catalog[0].story });
    mounted.player!.next();
    expect(host.querySelector('.vf-figure')?.getAttribute('data-scene-id')).toBe(
      catalog[0].story.scenes[1].id,
    );
    mounted.destroy();
    expect(host.children).toHaveLength(0);
    expect(() => mountFigure(host, { rendererId: 'other', spec: {} })).toThrow();
  });
});
describe('analytical correctness', () => {
  const matrix = catalog.find((c) => c.id === 'matrix')!.story.visuals[0] as MatrixSpec;
  it('computes leaf, subtotal and grand total exactly once', () => {
    expect(matrixValue(matrix, 'north-direct', 'q1', 'revenue')).toBe(21);
    expect(matrixValue(matrix, 'north', 'q1', 'revenue')).toBe(34);
    expect(matrixValue(matrix, 'south', 'year', 'revenue')).toBe(44);
    expect(matrixValue(matrix, undefined, undefined, 'revenue')).toBe(118);
  });
  it('aggregates means from leaves rather than averaging subtotals and preserves missing versus zero', () => {
    const spec = structuredClone(matrix);
    spec.measures[0].aggregate = 'mean';
    spec.data = spec.data.slice(0, 3);
    expect(matrixValue(spec, undefined, undefined, 'revenue')).toBe((21 + 25 + 13) / 3);
    expect(matrixValue(spec, 'south', 'q1', 'revenue')).toBeNull();
    spec.data[0].values.revenue = 0;
    expect(matrixValue(spec, 'north-direct', 'q1', 'revenue')).toBe(0);
    expect(aggregate([], 'sum')).toBeNull();
  });
  it('supports multiple measures with independent formatting and aggregation', () => {
    const spec = structuredClone(matrix);
    spec.measures.push({
      key: 'margin',
      label: 'Margin',
      aggregate: 'mean',
      dataBar: false,
      format: { style: 'percent', digits: 1, currency: 'USD' },
    });
    spec.data.forEach((d, i) => {
      d.values.margin = i / 10;
    });
    expect(parseVisualization(spec)).toBeDefined();
    expect(matrixValue(spec, undefined, undefined, 'margin')).toBeCloseTo(0.35);
  });
  it('sorts a copied presentation without mutating canonical table data', () => {
    const spec = structuredClone(catalog.find((c) => c.id === 'table')!.story.visuals[0]) as TableSpec;
    spec.sort!.direction = 'asc';
    expect(sortedRows(spec)[0].id).toBe('startup');
    expect(spec.data[0].id).toBe('enterprise');
  });
  it('formats zero, signed percentages and currency consistently', () => {
    expect(formatValue(0, { style: 'number', digits: 0, currency: 'USD' })).toBe('0');
    expect(formatValue(-0.12, { style: 'percent', digits: 1, currency: 'USD' })).toBe('-12.0%');
    expect(formatValue(118, { style: 'currency', digits: 0, currency: 'USD', unit: 'm' })).toBe('$118 m');
  });
});
