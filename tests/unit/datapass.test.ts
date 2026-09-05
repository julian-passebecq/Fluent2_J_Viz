import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { validateFigureSpec } from '@datapass/content';
import { FigureView } from '@datapass/figure';
import { catalog } from '../../src/examples/index.js';
import { storyFigure, vizforgeAdapter, vizforgeRegistry } from '../../src/studio/datapass.js';

describe('real external Figure contract', () => {
  it.each(catalog)('validates both envelope and canonical payload for $id', entry => {
    const figure = storyFigure(entry.story);
    expect(validateFigureSpec(figure).valid).toBe(true);
    expect(vizforgeAdapter.validate!(figure)).toEqual([]);
    expect(vizforgeRegistry.get('vizforge.d3')).toBe(vizforgeAdapter);
    expect(vizforgeRegistry.has('static.text')).toBe(true);
  });
  it('rejects invalid payloads through the real FigureView with text fallback', () => {
    const figure = { ...storyFigure(catalog[0].story), spec: null };
    const html = renderToStaticMarkup(createElement(FigureView, { figure, registry: vizforgeRegistry }));
    expect(html).toContain('role="alert"');
    expect(html).toContain('Figure unavailable');
    expect(html).toContain(catalog[0].story.scenes[0].caption);
    expect(html).not.toContain('data-vizforge-host');
  });
});
