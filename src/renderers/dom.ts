import { select, easeCubicInOut, type Selection } from 'd3';
import { formatValue } from '../core/format.js';
import { parseVisualization, type Scene, type VisualizationSpec } from '../core/spec.js';
import { layoutChart, type Entity, type Mark } from './layout.js';
import { renderMatrix, renderTable, sparkline } from './tables.js';

export interface RenderOptions {
  width?: number;
  reducedMotion?: boolean;
  animate?: boolean;
}
export interface Renderer {
  update(spec: unknown, scene?: Scene, options?: RenderOptions): void;
  settle(): void;
  destroy(): void;
  element: HTMLElement;
}
const styles = `
.vf-figure{margin:0;color:var(--vf-ink,#203d3b);font:14px/1.5 system-ui,sans-serif;min-width:0;overflow-wrap:anywhere}
.vf-figure *{box-sizing:border-box}.vf-figure h2{font-size:19px;line-height:1.35;margin:0 0 5px;font-weight:650;letter-spacing:-.4px}
.vf-subtitle{color:var(--vf-muted,#596762);margin:0 0 20px;font-size:12px}.vf-surface{width:100%;min-width:0}.vf-surface>svg{width:100%;height:auto;display:block;overflow:hidden}
.vf-scroll{max-width:100%;overflow-x:auto;outline-offset:3px}.vf-scroll:focus-visible{outline:2px solid #207466}
.vf-table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap;font-variant-numeric:tabular-nums;text-align:left}
.vf-table th,.vf-table td{position:relative;padding:12px 14px;border-bottom:1px solid #e1e6de;min-width:90px}
.vf-table thead th{font-size:11px;color:#596762;font-weight:600;background:#f5f7f2;white-space:normal;max-width:160px}
.vf-table tbody th{font-weight:500}.vf-table .vf-number{text-align:right}.vf-table tfoot{font-weight:700;border-top:2px solid #9bad9f}
.vf-table [data-focus=false]{color:#596762;background:#fbfcf8}.vf-table [data-focus=true]{box-shadow:inset 3px 0 #b7c9aa}.vf-subtotal{background:#f1f5ef;font-weight:600}.vf-data-bar{position:absolute;bottom:5px;left:0;height:4px;background:#b7d5c7;max-width:100%}
.vf-cell-value{position:relative}.vf-table [data-sign=positive]{color:#206c46}.vf-table [data-sign=negative]{color:#984324}
.vf-annotations{padding:12px 15px;border-left:3px solid #86aa90;background:#f1f5ee;margin:16px 0 12px;font-size:13px}
.vf-annotations p{margin:4px 0}.vf-source{font-size:11px;color:var(--vf-muted,#596762);line-height:1.7;margin:15px 0 0}
.vf-details{margin-top:12px;font-size:11px;color:var(--vf-muted,#596762)}.vf-details summary{cursor:pointer;padding:7px 0;min-height:30px}
.vf-details table{margin-top:10px}.vf-kpi{display:flex;gap:24px;flex-wrap:wrap;align-items:center;padding:8px 0 18px}.vf-kpi strong{display:block;font-size:30px;letter-spacing:-1px}
.vf-kpi small{display:block;font-size:11px;color:#596762}.vf-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:540px){.vf-figure h2{font-size:17px}.vf-subtitle{margin-bottom:12px}.vf-kpi{gap:16px}.vf-kpi strong{font-size:24px}.vf-annotations{font-size:12px}.vf-table th,.vf-table td{padding:10px}}
`;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

function updateMarks(
  parent: Selection<SVGGElement, unknown, null, undefined>,
  marks: Mark[],
  duration: number,
) {
  const joined = parent
    .selectAll<SVGElement, Mark>('.vf-mark')
    .data(marks, (d) => `${d.key}:${d.tag}`)
    .join(
      (enter) =>
        enter
          .append(function (d) {
            return this.ownerDocument.createElementNS('http://www.w3.org/2000/svg', d.tag);
          })
          .attr('class', 'vf-mark'),
      (update) => update,
      (exit) => exit.interrupt('vizforge').remove(),
    );
  joined.each(function (d) {
    const target = select(this).interrupt('vizforge');
    if (d.text !== undefined) target.text(d.text);
    // New elements appear at their true position; updates interpolate the same keyed DOM object.
    const initialized = this.hasAttribute('data-initialized');
    const animated =
      duration > 0 && initialized
        ? target.transition('vizforge').duration(duration).ease(easeCubicInOut)
        : undefined;
    for (const [key, value] of Object.entries(d.attrs)) {
      if (animated) animated.attr(key, value);
      else target.attr(key, value);
    }
    target.attr('data-initialized', 'true').attr('data-mark', d.key);
  });
}

/** DOM + D3 only. A single instance owns its host subtree, listeners and transitions. */
export function createRenderer(host: HTMLElement): Renderer {
  const figure = el('figure');
  figure.className = 'vf-figure';
  const style = el('style', styles),
    caption = el('figcaption'),
    title = el('h2'),
    subtitle = el('p');
  subtitle.className = 'vf-subtitle';
  caption.append(title, subtitle);
  const kpi = el('div');
  kpi.className = 'vf-kpi';
  const surface = el('div');
  surface.className = 'vf-surface';
  const annotations = el('div');
  annotations.className = 'vf-annotations';
  const source = el('p');
  source.className = 'vf-source';
  const details = el('details');
  details.className = 'vf-details';
  const summary = el('summary', 'Explore the underlying data');
  const dataView = el('div');
  dataView.className = 'vf-scroll';
  dataView.tabIndex = 0;
  dataView.setAttribute('role', 'region');
  dataView.setAttribute('aria-label', 'Underlying chart data');
  details.append(summary, dataView);
  figure.append(style, caption, kpi, surface, annotations, source, details);
  host.append(figure);
  const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
  let last: { spec: VisualizationSpec; scene?: Scene; options: RenderOptions } | undefined;
  let dead = false;
  function paint(spec: VisualizationSpec, scene?: Scene, options: RenderOptions = {}) {
    if (dead) return;
    const hadLast = !!last,
      same = last?.spec.id === spec.id;
    last = { spec, scene, options };
    const width = options.width ?? (host.getBoundingClientRect().width || 800);
    const reduced = options.reducedMotion === true || media?.matches === true;
    const duration =
      reduced || options.animate === false || !hadLast || (!same && scene?.transition.intent !== 'scene')
        ? 0
        : (scene?.transition.durationMs ?? spec.animation.durationMs);
    figure.dataset.visualType = spec.type;
    figure.dataset.sceneId = scene?.id ?? 'static';
    figure.dataset.reducedMotion = String(reduced);
    figure.dataset.transitionMs = String(duration);
    figure.style.setProperty('--vf-ink', spec.theme.ink);
    figure.style.setProperty('--vf-muted', spec.theme.muted);
    title.textContent = spec.title;
    subtitle.textContent = spec.subtitle ?? spec.takeaway;
    if (spec.type === 'forecast')
      subtitle.textContent += ` · Solid: observed. Dashed: forecast. Shading: ${spec.intervalLabel}.`;
    if (
      spec.type === 'scatter' &&
      spec.encodings.size &&
      !subtitle.textContent.toLowerCase().includes('bubble area')
    )
      subtitle.textContent += ` · Bubble area: ${spec.encodings.size}.`;
    source.textContent = `Source: ${spec.source} · Note: ${spec.note}`;
    annotations.replaceChildren();
    const selected = scene
      ? spec.annotations.filter((a) => scene.annotationIds.includes(a.id))
      : spec.annotations;
    // Phone annotations are concise and progressively disclosed; every annotation stays available.
    const visible = width < 540 ? selected.slice(0, 1) : selected;
    for (const annotation of visible) {
      const p = el('p', annotation.text);
      p.dataset.annotationId = annotation.id;
      annotations.append(p);
    }
    if (selected.length > visible.length) {
      const more = el('details');
      more.append(el('summary', `${selected.length - visible.length} more annotation(s)`));
      for (const annotation of selected.slice(visible.length)) more.append(el('p', annotation.text));
      annotations.append(more);
    }
    annotations.hidden = !selected.length;
    kpi.replaceChildren();
    kpi.hidden = spec.type !== 'contribution';
    if (spec.type === 'contribution') {
      const current =
        spec.baseline +
        spec.data
          .slice(0, scene?.state.revealCount ?? spec.data.length)
          .reduce((sum, d) => sum + Number(d[spec.encodings.value]), 0);
      const fmt = (n: number) => formatValue(n, spec.formatting);
      const primary = el('div');
      primary.append(el('small', spec.kpi.label), el('strong', fmt(current)));
      kpi.append(primary);
      const comparison = el('div');
      comparison.append(
        el('small', `Comparison ${fmt(spec.kpi.comparison)}`),
        el(
          'span',
          `Variance ${current - spec.kpi.comparison >= 0 ? '+' : ''}${fmt(current - spec.kpi.comparison)}`,
        ),
      );
      kpi.append(comparison);
      const onTrack = spec.kpi.direction === 'up' ? current >= spec.kpi.target : current <= spec.kpi.target;
      const target = el('div');
      target.append(
        el('small', `Target ${fmt(spec.kpi.target)}`),
        el('span', onTrack ? '↗ On track' : '→ Outside target'),
      );
      kpi.append(target);
      if (spec.kpi.sparkline) kpi.append(sparkline(spec.kpi.sparkline, spec.theme.palette[0]));
    }
    if (spec.type === 'table' || spec.type === 'matrix') {
      surface.querySelector('svg')?.remove();
      surface.classList.add('vf-scroll');
      surface.tabIndex = 0;
      surface.setAttribute('role', 'region');
      surface.setAttribute('aria-label', spec.accessibility.summary);
      if (spec.type === 'table') renderTable(surface, spec, scene);
      else renderMatrix(surface, spec, scene);
      details.hidden = true;
    } else {
      if (surface.querySelector('table')) surface.replaceChildren();
      surface.classList.remove('vf-scroll');
      surface.removeAttribute('tabindex');
      surface.removeAttribute('role');
      surface.removeAttribute('aria-label');
      const layout = layoutChart(spec, scene, width);
      const svg = select(surface)
        .selectAll<SVGSVGElement, null>('svg.vf-chart')
        .data([null])
        .join('svg')
        .attr('class', 'vf-chart')
        .attr('viewBox', `0 0 ${layout.width} ${layout.height}`)
        .attr('role', 'img')
        .attr(
          'aria-label',
          `${spec.accessibility.summary} ${layout.entities.map((d) => d.label).join('. ')}`,
        );
      svg
        .selectAll('title')
        .data([spec.title])
        .join('title')
        .text((d) => d);
      svg
        .selectAll('desc')
        .data([
          `${spec.accessibility.summary} Source: ${spec.source}. Note: ${spec.note}. ${selected.map((a) => a.text).join(' ')}`,
        ])
        .join('desc')
        .text((d) => d);
      const backdrop = svg
        .selectAll<SVGGElement, null>('g.vf-backdrop')
        .data([null])
        .join('g')
        .attr('class', 'vf-backdrop')
        .attr('aria-hidden', 'true');
      updateMarks(
        select(backdrop.node()!) as Selection<SVGGElement, unknown, null, undefined>,
        layout.decorations,
        duration,
      );
      const groups = svg
        .selectAll<SVGGElement, Entity>('g.vf-entity')
        .data(layout.entities, (d) => JSON.stringify([spec.id, d.id]))
        .join(
          (enter) => enter.append('g').attr('class', 'vf-entity').attr('opacity', 0),
          (update) => update,
          (exit) => {
            exit.selectAll('*').interrupt('vizforge');
            return exit.interrupt('vizforge').remove();
          },
        )
        .attr('data-entity-id', (d) => d.id)
        .attr('aria-hidden', 'true');
      groups.each(function (d) {
        const group = select(this).interrupt('vizforge');
        if (duration > 0) group.transition('vizforge').duration(duration).attr('opacity', 1);
        else group.attr('opacity', 1);
        group.attr('data-focus', String(d.opacity === 1));
        group
          .selectAll('title')
          .data([d.label])
          .join('title')
          .text((v) => v);
        const focusedMarks = d.marks.map((m) => ({
          ...m,
          attrs:
            m.tag === 'text'
              ? { ...m.attrs, ...(d.opacity < 1 ? { fill: spec.theme.muted } : {}) }
              : { ...m.attrs, opacity: Number(m.attrs.opacity ?? 1) * d.opacity },
        }));
        updateMarks(select(this) as Selection<SVGGElement, unknown, null, undefined>, focusedMarks, duration);
      });
      details.hidden = false;
      dataView.replaceChildren();
      const table = el('table');
      table.className = 'vf-table';
      table.append(el('caption', 'Canonical source data'));
      const rows = spec.type === 'flow' ? spec.links : spec.data;
      const keys = [...new Set(rows.flatMap((d) => Object.keys(d)))];
      const head = table.createTHead().insertRow();
      for (const key of keys) {
        const th = el('th', key);
        th.scope = 'col';
        head.append(th);
      }
      const body = table.createTBody();
      for (const row of rows) {
        const tr = body.insertRow();
        for (const key of keys) tr.append(el('td', String((row as Record<string, unknown>)[key] ?? '—')));
      }
      dataView.append(table);
    }
  }
  const settle = () => {
    if (last) paint(last.spec, last.scene, { ...last.options, animate: false });
  };
  const resize =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          if (last && !last.options.width) settle();
        })
      : undefined;
  resize?.observe(host);
  media?.addEventListener('change', settle);
  return {
    element: figure,
    update(input, scene, options) {
      paint(parseVisualization(input), scene, options);
    },
    settle,
    destroy() {
      dead = true;
      resize?.disconnect();
      media?.removeEventListener('change', settle);
      select(figure).selectAll('*').interrupt('vizforge');
      figure.remove();
      last = undefined;
    },
  };
}
