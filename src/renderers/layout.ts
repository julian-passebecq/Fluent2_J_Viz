import {
  area,
  extent,
  geoEquirectangular,
  geoGraticule10,
  geoPath,
  group,
  line,
  scaleLinear,
  scaleSqrt,
} from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { compact, formatValue } from '../core/format.js';
import { entityIds, type ChartSpec, type DataRow, type Scene } from '../core/spec.js';

export interface Mark {
  key: string;
  tag: 'rect' | 'circle' | 'line' | 'path' | 'text';
  attrs: Record<string, string | number>;
  text?: string;
}
export interface Entity {
  id: string;
  label: string;
  marks: Mark[];
  opacity: number;
}
export interface Layout {
  width: number;
  height: number;
  decorations: Mark[];
  entities: Entity[];
}
const mark = (key: string, tag: Mark['tag'], attrs: Mark['attrs'], text?: string): Mark => ({
  key,
  tag,
  attrs,
  text,
});
const text = (key: string, x: number, y: number, label: string, attrs: Mark['attrs'] = {}) =>
  mark(key, 'text', { x, y, 'font-size': 12, ...attrs }, label);
const short = (label: string, length: number) =>
  label.length > length ? label.slice(0, length - 1) + '…' : label;
function domain(values: number[], zero = false): [number, number] {
  let [lo, hi] = extent(values) as [number, number];
  if (lo === undefined) return [0, 1];
  if (zero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  if (lo === hi) return [lo - (lo ? Math.abs(lo) * 0.1 : 1), hi + (hi ? Math.abs(hi) * 0.1 : 1)];
  return [lo, hi];
}
export function layoutChart(spec: ChartSpec, scene: Scene | undefined, width: number): Layout {
  width = Math.max(280, width);
  const phone = width < 540;
  const height = phone ? 330 : 390;
  const left = 48,
    right = width - (phone ? 70 : 100),
    top = 30,
    bottom = height - 48;
  const entities: Entity[] = [],
    decorations: Mark[] = [];
  const ink = spec.theme.ink,
    muted = spec.theme.muted,
    grid = spec.theme.grid;
  const ids = entityIds(spec).slice().sort();
  const color = (id: string) => spec.theme.palette[Math.max(0, ids.indexOf(id)) % spec.theme.palette.length];
  const fmt = (n: number) => formatValue(n, spec.formatting);
  function add(id: string, label: string, marks: Mark[]) {
    entities.push({
      id,
      label,
      marks,
      opacity: !scene?.focusIds.length || scene.focusIds.includes(id) ? 1 : 0.22,
    });
  }
  function axes(
    x: ReturnType<typeof scaleLinear<number, number>>,
    y: ReturnType<typeof scaleLinear<number, number>>,
    xLabel?: string,
    yLabel?: string,
  ) {
    for (const tick of y.ticks(4)) {
      decorations.push(
        mark(`grid-${tick}`, 'line', {
          x1: left,
          x2: right,
          y1: y(tick),
          y2: y(tick),
          stroke: grid,
          'stroke-dasharray': '3 4',
        }),
      );
      decorations.push(
        text(`ytick-${tick}`, left - 10, y(tick) + 4, compact(tick), {
          fill: muted,
          'text-anchor': 'end',
          'font-size': 11,
        }),
      );
    }
    for (const tick of x.ticks(phone ? 3 : 5))
      decorations.push(
        text(`xtick-${tick}`, x(tick), bottom + 22, String(Number(tick.toFixed(2))), {
          fill: muted,
          'text-anchor': 'middle',
          'font-size': 11,
        }),
      );
    if (xLabel)
      decorations.push(
        text('x-title', (left + right) / 2, height - 3, xLabel, {
          fill: muted,
          'text-anchor': 'middle',
          'font-size': 11,
        }),
      );
    if (yLabel) decorations.push(text('y-title', left, 13, yLabel, { fill: muted, 'font-size': 11 }));
  }
  const currentTime = scene?.state.time;
  function snapshot(data: DataRow[], idField: string, timeField: string): DataRow[] {
    const time = currentTime ?? Math.max(...data.map((d) => Number(d[timeField])));
    return [
      ...group(
        data.filter((d) => Number(d[timeField]) <= time),
        (d) => String(d[idField]),
      ).values(),
    ].map((rows) => rows.reduce((a, b) => (Number(a[timeField]) > Number(b[timeField]) ? a : b)));
  }
  if (spec.type === 'ranking') {
    const e = spec.encodings;
    const rows = snapshot(spec.data, e.id, e.time)
      .sort(
        (a, b) => Number(b[e.value]) - Number(a[e.value]) || String(a[e.id]).localeCompare(String(b[e.id])),
      )
      .slice(0, spec.topN);
    const max = Math.max(1, ...spec.data.map((d) => Number(d[e.value])));
    const barLeft = phone ? 27 : 140,
      barRight = width - (phone ? 55 : 78);
    const x = scaleLinear().domain([0, max]).range([barLeft, barRight]);
    const rowHeight = phone ? 55 : 48;
    const h = Math.max(240, rows.length * rowHeight + 48);
    const time = currentTime ?? Math.max(...spec.data.map((d) => Number(d[e.time])));
    const priorTime = Math.max(...spec.data.map((d) => Number(d[e.time])).filter((t) => t < time));
    const previous = spec.data
      .filter((d) => d[e.time] === priorTime)
      .sort(
        (a, b) => Number(b[e.value]) - Number(a[e.value]) || String(a[e.id]).localeCompare(String(b[e.id])),
      );
    for (const tick of x.ticks(phone ? 3 : 5)) {
      decorations.push(
        mark(`grid-${tick}`, 'line', { x1: x(tick), x2: x(tick), y1: 8, y2: h - 25, stroke: grid }),
      );
      decorations.push(
        text(`tick-${tick}`, x(tick), h - 6, compact(tick), {
          fill: muted,
          'font-size': 11,
          'text-anchor': 'middle',
        }),
      );
    }
    rows.forEach((row, i) => {
      const id = String(row[e.id]),
        label = String(row[e.label]),
        value = Number(row[e.value]);
      const y = 15 + i * rowHeight + (phone ? 18 : 0);
      const oldRank = previous.findIndex((d) => d[e.id] === id);
      const delta =
        oldRank === -1 ? '—' : oldRank - i === 0 ? '·' : oldRank > i ? `↑${oldRank - i}` : `↓${i - oldRank}`;
      add(id, `${i + 1}. ${label}: ${fmt(value)}, rank change ${delta}`, [
        mark('bar', 'rect', {
          x: barLeft,
          y,
          width: Math.max(0, x(value) - barLeft),
          height: phone ? 22 : 30,
          rx: 3,
          fill: color(id),
        }),
        text('rank', phone ? 7 : 8, y + (phone ? 15 : 20), String(i + 1).padStart(2, '0'), {
          fill: muted,
          'font-size': 11,
        }),
        text('label', phone ? barLeft : barLeft - 12, y + (phone ? -6 : 20), short(label, phone ? 28 : 17), {
          fill: ink,
          'text-anchor': phone ? 'start' : 'end',
          'font-weight': 600,
        }),
        text('value', x(value) + 8, y + (phone ? 16 : 20), compact(value), { fill: ink, 'font-weight': 600 }),
        text('delta', width - 8, y + (phone ? 16 : 20), delta, {
          fill: muted,
          'text-anchor': 'end',
          'font-size': 11,
        }),
      ]);
    });
    return { width, height: h, entities, decorations };
  }
  if (spec.type === 'time-series' || spec.type === 'forecast') {
    const e = spec.encodings;
    const x = scaleLinear()
      .domain(spec.xDomain ?? domain(spec.data.map((d) => Number(d[e.time]))))
      .range([left, right]);
    const allY = spec.data.flatMap((d) =>
      spec.type === 'forecast'
        ? [Number(d[spec.encodings.lower]), Number(d[spec.encodings.upper])]
        : [Number(d[e.value])],
    );
    if (spec.type === 'time-series' && spec.comparisonBaseline !== undefined)
      allY.push(spec.comparisonBaseline);
    const y = scaleLinear()
      .domain(spec.yDomain ?? domain(allY, true))
      .nice()
      .range([bottom, top]);
    axes(x, y, undefined, spec.formatting.unit);
    const time = currentTime ?? Math.max(...spec.data.map((d) => Number(d[e.time])));
    decorations.push(
      mark('focus-time', 'line', {
        x1: x(time),
        x2: x(time),
        y1: top,
        y2: bottom,
        stroke: muted,
        'stroke-dasharray': '3 5',
        opacity: 0.5,
      }),
    );
    if (spec.type === 'time-series' && spec.comparisonBaseline !== undefined) {
      decorations.push(
        mark('baseline', 'line', {
          x1: left,
          x2: right,
          y1: y(spec.comparisonBaseline),
          y2: y(spec.comparisonBaseline),
          stroke: muted,
          'stroke-dasharray': '5 4',
        }),
      );
      decorations.push(
        text(
          'baseline-label',
          right,
          y(spec.comparisonBaseline) - 8,
          `Baseline ${compact(spec.comparisonBaseline)}`,
          { fill: muted, 'text-anchor': 'end', 'font-size': 10 },
        ),
      );
    }
    const groups = [...group(spec.data, (d) => String(d[e.id]))];
    const labelPositions: { id: string; y: number }[] = [];
    for (const [id, raw] of groups) {
      const points = raw
        .filter((d) => Number(d[e.time]) <= time)
        .sort((a, b) => Number(a[e.time]) - Number(b[e.time]));
      if (!points.length) continue;
      const last = points.at(-1)!,
        label = String(last[e.label]);
      const path = line<DataRow>()
        .x((d) => x(Number(d[e.time])))
        .y((d) => y(Number(d[e.value])));
      const marks: Mark[] = [];
      if (spec.type === 'forecast') {
        const fe = spec.encodings;
        const firstForecast = points.findIndex((d) => d[fe.forecast] === true);
        const observed = firstForecast === -1 ? points : points.slice(0, firstForecast);
        const projected = firstForecast === -1 ? [] : points.slice(Math.max(0, firstForecast - 1));
        marks.push(
          mark('interval', 'path', {
            d:
              area<DataRow>()
                .x((d) => x(Number(d[e.time])))
                .y0((d) => y(Number(d[fe.lower])))
                .y1((d) => y(Number(d[fe.upper])))(projected) ?? '',
            fill: color(id),
            opacity: 0.17,
          }),
        );
        marks.push(
          mark('observed', 'path', {
            d: path(observed) ?? '',
            fill: 'none',
            stroke: color(id),
            'stroke-width': 3,
          }),
        );
        marks.push(
          mark('forecast', 'path', {
            d: path(projected) ?? '',
            fill: 'none',
            stroke: color(id),
            'stroke-width': 3,
            'stroke-dasharray': '6 4',
          }),
        );
      } else {
        if (spec.area)
          marks.push(
            mark('area', 'path', {
              d:
                area<DataRow>()
                  .x((d) => x(Number(d[e.time])))
                  .y0(y(0))
                  .y1((d) => y(Number(d[e.value])))(points) ?? '',
              fill: color(id),
              opacity: 0.09,
            }),
          );
        marks.push(
          mark('line', 'path', {
            d: path(points) ?? '',
            fill: 'none',
            stroke: color(id),
            'stroke-width': 3,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        );
      }
      marks.push(
        mark('focus-point', 'circle', {
          cx: x(Number(last[e.time])),
          cy: y(Number(last[e.value])),
          r: 4,
          fill: color(id),
          stroke: spec.theme.background,
          'stroke-width': 2,
        }),
      );
      labelPositions.push({ id, y: y(Number(last[e.value])) });
      marks.push(
        text('label', right + 9, y(Number(last[e.value])) - 4, short(label, phone ? 9 : 14), {
          fill: color(id),
          'font-weight': 600,
          'font-size': phone ? 10 : 12,
        }),
      );
      marks.push(
        text('value', right + 9, y(Number(last[e.value])) + 11, compact(Number(last[e.value])), {
          fill: muted,
          'font-size': 10,
        }),
      );
      add(id, `${label}: ${fmt(Number(last[e.value]))} at ${last[e.time]}`, marks);
    }
    // Resolve direct-label collisions in pixel space; data positions stay truthful.
    labelPositions.sort((a, b) => a.y - b.y);
    const gap = 31;
    labelPositions.forEach((p, i) => {
      p.y = Math.max(top + 4, p.y, i ? labelPositions[i - 1].y + gap : top);
    });
    for (let i = labelPositions.length - 1; i >= 0; i--)
      labelPositions[i].y = Math.min(
        labelPositions[i].y,
        i === labelPositions.length - 1 ? bottom - 12 : labelPositions[i + 1].y - gap,
      );
    for (const pos of labelPositions) {
      const entity = entities.find((d) => d.id === pos.id)!;
      entity.marks.find((d) => d.key === 'label')!.attrs.y = pos.y - 4;
      entity.marks.find((d) => d.key === 'value')!.attrs.y = pos.y + 11;
    }
  } else if (spec.type === 'scatter') {
    const e = spec.encodings;
    const x = scaleLinear()
      .domain(
        spec.xDomain ??
          domain(
            spec.data.map((d) => Number(d[e.x])),
            true,
          ),
      )
      .nice()
      .range([left + 10, right - 10]);
    const y = scaleLinear()
      .domain(
        spec.yDomain ??
          domain(
            spec.data.map((d) => Number(d[e.y])),
            true,
          ),
      )
      .nice()
      .range([bottom - 10, top + 15]);
    const size = scaleSqrt()
      .domain([0, Math.max(1, ...spec.data.map((d) => (e.size ? Number(d[e.size]) : 1)))])
      .range([0, phone ? 19 : 29]);
    axes(x, y, spec.xLabel, spec.yLabel);
    const categories = e.category ? [...new Set(spec.data.map((d) => String(d[e.category!])))].sort() : [];
    for (const row of snapshot(spec.data, e.id, e.time)) {
      const id = String(row[e.id]),
        label = String(row[e.label]),
        cx = x(Number(row[e.x])),
        cy = y(Number(row[e.y]));
      const r = e.size ? size(Number(row[e.size])) : 7;
      const labelText = short(label, phone ? 10 : 20);
      const labelWidth = labelText.length * 6;
      const labelRight = cx + r + 7 + labelWidth < width - 8;
      const labelX = labelRight ? cx + r + 7 : cx - r - 7;
      const fill = e.category
        ? spec.theme.palette[categories.indexOf(String(row[e.category])) % spec.theme.palette.length]
        : color(id);
      add(
        id,
        `${label}: ${spec.xLabel} ${row[e.x]}, ${spec.yLabel} ${row[e.y]}${e.size ? `, size ${row[e.size]}` : ''}`,
        [
          mark('bubble', 'circle', {
            cx,
            cy,
            r,
            fill,
            'fill-opacity': 0.72,
            stroke: fill,
            'stroke-width': 1.5,
          }),
          text('label', labelX, cy + 4, labelText, {
            fill: ink,
            'text-anchor': labelRight ? 'start' : 'end',
            'font-size': 11,
          }),
        ],
      );
    }
  } else if (spec.type === 'dumbbell') {
    const e = spec.encodings,
      rows = spec.data.slice(0, scene?.state.revealCount ?? spec.data.length);
    const x = scaleLinear()
      .domain(
        domain(
          spec.data.flatMap((d) => [Number(d[e.start]), Number(d[e.end])]),
          true,
        ),
      )
      .nice()
      .range([phone ? 28 : 125, width - 55]);
    const h = rows.length * (phone ? 65 : 53) + 65;
    decorations.push(
      text('key', 10, 14, `○ ${spec.startLabel}   ● ${spec.endLabel}`, { fill: muted, 'font-size': 11 }),
    );
    for (const tick of x.ticks(4))
      decorations.push(
        text(`tick-${tick}`, x(tick), h - 8, compact(tick), {
          fill: muted,
          'text-anchor': 'middle',
          'font-size': 11,
        }),
      );
    rows.forEach((row, i) => {
      const id = String(row[e.id]),
        label = String(row[e.label]) + (e.group ? ` · ${row[e.group]}` : ''),
        y = 42 + i * (phone ? 65 : 53),
        a = Number(row[e.start]),
        b = Number(row[e.end]);
      add(id, `${label}: ${spec.startLabel} ${fmt(a)}, ${spec.endLabel} ${fmt(b)}`, [
        text('label', phone ? 28 : 112, y + (phone ? -14 : 4), short(label, 18), {
          fill: ink,
          'text-anchor': phone ? 'start' : 'end',
        }),
        mark('range', 'line', { x1: x(a), x2: x(b), y1: y, y2: y, stroke: color(id), 'stroke-width': 3 }),
        mark('start', 'circle', {
          cx: x(a),
          cy: y,
          r: 5,
          fill: spec.theme.background,
          stroke: color(id),
          'stroke-width': 2,
        }),
        mark('end', 'circle', { cx: x(b), cy: y, r: 6, fill: color(id) }),
        text('delta', width - 8, y + 4, `${b - a >= 0 ? '+' : ''}${compact(b - a)}`, {
          fill: ink,
          'text-anchor': 'end',
          'font-size': 11,
        }),
      ]);
    });
    return { width, height: h, decorations, entities };
  } else if (spec.type === 'contribution') {
    const e = spec.encodings;
    const cumulative = [spec.baseline];
    spec.data.forEach((d) => cumulative.push(cumulative.at(-1)! + Number(d[e.value])));
    const count = Math.min(scene?.state.revealCount ?? spec.data.length, spec.data.length);
    const values = [
      { id: '$baseline', label: 'Baseline', start: 0, end: spec.baseline },
      ...spec.data.slice(0, count).map((d, i) => ({
        id: String(d[e.id]),
        label: String(d[e.label]),
        start: cumulative[i],
        end: cumulative[i + 1],
      })),
      { id: '$current', label: 'Current', start: 0, end: cumulative[count] },
    ];
    const x = scaleLinear()
      .domain([0, spec.data.length + 2])
      .range([left, width - 10]);
    const y = scaleLinear()
      .domain(domain(cumulative, true))
      .nice()
      .range([bottom - 15, top]);
    const bw = ((width - left - 10) / (spec.data.length + 2)) * 0.62;
    for (const tick of y.ticks(4)) {
      decorations.push(
        mark(`grid-${tick}`, 'line', { x1: left, x2: width - 8, y1: y(tick), y2: y(tick), stroke: grid }),
      );
      decorations.push(
        text(`tick-${tick}`, left - 8, y(tick) + 4, compact(tick), {
          fill: muted,
          'text-anchor': 'end',
          'font-size': 10,
        }),
      );
    }
    values.forEach((v, i) => {
      const index = v.id === '$current' ? spec.data.length + 1 : i;
      const cx = x(index) + 5,
        positive = v.end >= v.start;
      const fill = v.id.startsWith('$') ? ink : positive ? spec.theme.palette[0] : spec.theme.palette[1];
      add(v.id, `${v.label}: ${fmt(v.end - v.start)}`, [
        mark('bar', 'rect', {
          x: cx,
          y: Math.min(y(v.start), y(v.end)),
          width: bw,
          height: Math.max(1, Math.abs(y(v.start) - y(v.end))),
          rx: 2,
          fill,
        }),
        text('value', cx + bw / 2, Math.min(y(v.start), y(v.end)) - 8, compact(v.end - v.start), {
          fill: ink,
          'text-anchor': 'middle',
          'font-size': phone ? 10 : 12,
        }),
        text('label', cx + bw / 2, bottom + 8, short(v.label, phone ? 7 : 13), {
          fill: muted,
          'text-anchor': 'middle',
          'font-size': phone ? 9 : 11,
        }),
      ]);
      if (i > 0 && v.id !== '$current')
        decorations.push(
          mark(`bridge-${v.id}`, 'line', {
            x1: x(i - 1) + 5 + bw,
            x2: cx,
            y1: y(v.start),
            y2: y(v.start),
            stroke: muted,
            'stroke-dasharray': '3 3',
          }),
        );
    });
  } else if (spec.type === 'flow') {
    type FlowNode = { id: string; label: string };
    type FlowLink = { id: string };
    const graph = sankey<FlowNode, FlowLink>()
      .nodeId((d) => d.id)
      .nodeWidth(phone ? 10 : 15)
      .nodePadding(25)
      .extent([
        [phone ? 45 : 100, 30],
        [width - (phone ? 45 : 100), height - 25],
      ])({ nodes: spec.nodes.map((d) => ({ ...d })), links: spec.links.map((d) => ({ ...d })) });
    const linkPath = sankeyLinkHorizontal<FlowNode, FlowLink>();
    for (const link of graph.links) {
      const source = link.source as (typeof graph.nodes)[number],
        target = link.target as (typeof graph.nodes)[number];
      add(link.id, `${source.label} to ${target.label}: ${fmt(link.value)}`, [
        mark('link', 'path', {
          d: linkPath(link) ?? '',
          fill: 'none',
          stroke: color(source.id),
          'stroke-width': Math.max(1, link.width ?? 1),
          'stroke-opacity': 0.35,
        }),
      ]);
      if (scene?.focusIds.includes(source.id) || scene?.focusIds.includes(target.id))
        entities.at(-1)!.opacity = 1;
    }
    for (const node of graph.nodes) {
      const start = node.x0! < width / 2;
      add(node.id, `${node.label}: ${fmt(node.value ?? 0)}`, [
        mark('node', 'rect', {
          x: node.x0!,
          y: node.y0!,
          width: node.x1! - node.x0!,
          height: Math.max(1, node.y1! - node.y0!),
          fill: color(node.id),
          rx: 1,
        }),
        text(
          'label',
          start ? node.x0! - 6 : node.x1! + 6,
          (node.y0! + node.y1!) / 2 - 2,
          short(node.label, phone ? 6 : 15),
          { fill: ink, 'text-anchor': start ? 'end' : 'start', 'font-size': phone ? 9 : 11 },
        ),
        text(
          'value',
          start ? node.x0! - 6 : node.x1! + 6,
          (node.y0! + node.y1!) / 2 + 12,
          compact(node.value ?? 0),
          { fill: muted, 'text-anchor': start ? 'end' : 'start', 'font-size': 10 },
        ),
      ]);
    }
  } else if (spec.type === 'event-map') {
    const e = spec.encodings;
    const points = [
      ...spec.data.map((d) => [Number(d[e.x]), Number(d[e.y])]),
      ...spec.regions.flatMap((d) => d.points),
    ];
    const xd = spec.xDomain ?? domain(points.map((p) => p[0])),
      yd = spec.yDomain ?? domain(points.map((p) => p[1]));
    const projection = geoEquirectangular().scale(1).translate([0, 0]);
    const projected = [
      [xd[0], yd[0]],
      [xd[1], yd[1]],
    ].map((p) => (spec.coordinates === 'geographic' ? projection([p[0], p[1]])! : [p[0], -p[1]]));
    const px = domain(projected.map((p) => p[0])),
      py = domain(projected.map((p) => p[1]));
    const factor = Math.min((width - 60) / (px[1] - px[0]), (height - 65) / (py[1] - py[0]));
    const project = (p: number[]): [number, number] => {
      if (spec.coordinates === 'schematic')
        return [
          30 + ((p[0] - xd[0]) / (xd[1] - xd[0])) * (width - 60),
          height - 30 - ((p[1] - yd[0]) / (yd[1] - yd[0])) * (height - 65),
        ];
      const q = projection([p[0], p[1]])!;
      return [
        width / 2 + (q[0] - (px[0] + px[1]) / 2) * factor,
        height / 2 + (q[1] - (py[0] + py[1]) / 2) * factor,
      ];
    };
    decorations.push(
      mark('map-surface', 'rect', {
        x: 1,
        y: 1,
        width: width - 2,
        height: height - 2,
        rx: 8,
        fill: '#f1f5f2',
        stroke: grid,
      }),
    );
    if (spec.coordinates === 'geographic') {
      const mapProjection = geoEquirectangular()
        .scale(factor)
        .translate([width / 2 - ((px[0] + px[1]) / 2) * factor, height / 2 - ((py[0] + py[1]) / 2) * factor]);
      decorations.push(
        mark('graticule', 'path', {
          d: geoPath(mapProjection)(geoGraticule10()) ?? '',
          fill: 'none',
          stroke: grid,
          opacity: 0.6,
        }),
      );
    }
    for (const region of spec.regions) {
      decorations.push(
        mark(`region-${region.id}`, 'path', {
          d:
            (line<number[]>()
              .x((p) => project(p)[0])
              .y((p) => project(p)[1])(region.points) ?? '') + 'Z',
          fill: '#e1e9df',
          stroke: '#b6c7b4',
          'stroke-width': 1.2,
        }),
      );
      const center = project([
        region.points.reduce((s, p) => s + p[0], 0) / region.points.length,
        region.points.reduce((s, p) => s + p[1], 0) / region.points.length,
      ]);
      decorations.push(
        text(`region-label-${region.id}`, center[0], center[1], region.label, {
          fill: muted,
          'text-anchor': 'middle',
          'font-size': 10,
          'letter-spacing': 1,
        }),
      );
    }
    const radius = scaleSqrt()
      .domain([0, Math.max(1, ...spec.data.map((d) => (e.size ? Number(d[e.size]) : 1)))])
      .range([0, phone ? 15 : 23]);
    for (const row of snapshot(spec.data, e.id, e.time)) {
      const id = String(row[e.id]),
        label = String(row[e.label]),
        [cx, cy] = project([Number(row[e.x]), Number(row[e.y])]);
      const r = e.size ? radius(Number(row[e.size])) : 7;
      add(id, `${label}, time ${row[e.time]}${e.size ? `, magnitude ${row[e.size]}` : ''}`, [
        mark('symbol', 'circle', {
          cx,
          cy,
          r,
          fill: color(id),
          'fill-opacity': 0.3,
          stroke: color(id),
          'stroke-width': 2,
        }),
        mark('center', 'circle', { cx, cy, r: 2.5, fill: color(id) }),
        text('label', Math.max(40, Math.min(width - 40, cx)), cy - r - 7, short(label, phone ? 11 : 20), {
          fill: ink,
          'text-anchor': 'middle',
          'font-size': 11,
        }),
      ]);
    }
    decorations.push(
      text(
        'map-key',
        12,
        height - 12,
        `${spec.coordinates === 'schematic' ? 'Schematic · not to scale' : 'Equirectangular projection'}${e.size ? ` · area: ${e.size}` : ''}`,
        { fill: muted, 'font-size': 10 },
      ),
    );
  }
  return { width, height, decorations, entities };
}
