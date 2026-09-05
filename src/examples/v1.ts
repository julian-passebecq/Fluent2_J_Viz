import { parseStory, parseVisualization, type Scene, type StorySpec, type VisualizationSpec } from '../core/spec.js';

const base = (id: string, title: string, subtitle: string, takeaway: string) => ({
  id, version: '1.0', title, subtitle, takeaway,
  source: 'VizForge synthetic demonstration data, 2026',
  note: 'Illustrative values, not observed statistics or a prediction.',
  accessibility: { summary: `${title}. ${takeaway}` },
});
const years = [2016, 2018, 2020, 2022, 2024];
const energy = [
  { id: 'solar', name: 'Solar', values: [18, 26, 43, 69, 110] },
  { id: 'wind', name: 'Wind', values: [40, 48, 60, 78, 94] },
  { id: 'hydro', name: 'Hydro', values: [64, 67, 66, 70, 73] },
];
const timeSeries = parseVisualization({ ...base('energy-lines', 'The next chapter belongs to solar', 'Electricity generation index · 2016–2024', 'Solar accelerates while established sources grow more slowly.'),
  type: 'time-series', data: energy.flatMap(s => years.map((year, i) => ({ id: s.id, label: s.name, year, value: s.values[i] }))),
  encodings: { id: 'id', label: 'label', time: 'year', value: 'value' }, area: true, comparisonBaseline: 64,
  annotations: [
    { id: 'starting', text: 'Begin with the gap. Solar starts at less than a third of the hydro index.', entityId: 'solar' },
    { id: 'turn', text: 'The turning point: solar’s slope steepens after 2020.', entityId: 'solar' },
    { id: 'lead', text: 'By the final scene, solar has moved from the smallest series to the largest.', entityId: 'solar' },
  ],
});
const rankSeries = [
  { id: 'north', label: 'Northland', values: [76, 84, 91] },
  { id: 'coast', label: 'Coast Union', values: [52, 73, 108] },
  { id: 'alpine', label: 'Alpine Region', values: [69, 77, 86] },
  { id: 'delta', label: 'Delta States', values: [42, 65, 98] },
  { id: 'islands', label: 'Island Group', values: [34, 53, 71] },
  { id: 'central', label: 'Central Region', values: [58, 59, 63] },
];
const ranking = parseVisualization({ ...base('clean-ranking', 'A new order in clean energy', 'Clean generation index · synthetic regions', 'Fast-growing coastal regions overtake the early leaders.'),
  type: 'ranking', data: rankSeries.flatMap(s => [2016, 2020, 2024].map((year, i) => ({ id: s.id, label: s.label, year, value: s.values[i] }))),
  encodings: { id: 'id', label: 'label', time: 'year', value: 'value' },
  annotations: [{ id: 'rank-start', text: 'Northland begins in first place, with the Alpine Region close behind.' },
    { id: 'rank-change', text: 'Watch the same bars move: Coast Union and Delta States climb the ranking.' },
    { id: 'rank-end', text: 'Coast Union finishes first. Arrows show rank changes from the previous period.', entityId: 'coast' }],
});
const scatter = parseVisualization({ ...base('city-bubbles', 'Prosperity with a smaller footprint', 'Income index × emissions per resident · bubble area = population', 'Cities can gain income while reducing emissions.'),
  type: 'scatter', xLabel: 'Income index', yLabel: 'Emissions per resident', xDomain: [20, 110], yDomain: [0, 15],
  data: [{ id: 'aster', label: 'Aster', x: [40, 61, 91], y: [12, 9, 5], population: 8 },
    { id: 'birch', label: 'Birch', x: [60, 70, 87], y: [10, 8, 7], population: 5 },
    { id: 'cove', label: 'Cove', x: [31, 48, 66], y: [8, 7, 4], population: 3 }]
    .flatMap(s => [2016, 2020, 2024].map((year, i) => ({ id: s.id, label: s.label, year, x: s.x[i], y: s.y[i], population: s.population, category: s.id }))),
  encodings: { id: 'id', label: 'label', time: 'year', x: 'x', y: 'y', size: 'population', category: 'category' },
  annotations: [{ id: 'bubble-start', text: 'Each circle is a city. Circle area encodes population, while position compares two measures.' },
    { id: 'bubble-end', text: 'Aster moves furthest down and right: higher income, lower emissions.', entityId: 'aster' }],
});
const dumbbell = parseVisualization({ ...base('before-after', 'Every district closes part of the gap', 'Access to frequent transit · percent of residents', 'The biggest improvement occurs in Eastbank.'),
  type: 'dumbbell', startLabel: '2016', endLabel: '2024',
  data: [{ id: 'east', label: 'Eastbank', start: 29, end: 77, group: 'Outer' }, { id: 'north', label: 'Northside', start: 44, end: 72, group: 'Outer' },
    { id: 'center', label: 'Central', start: 68, end: 87, group: 'Inner' }, { id: 'south', label: 'Southgate', start: 37, end: 61, group: 'Outer' }],
  encodings: { id: 'id', label: 'label', start: 'start', end: 'end', group: 'group' }, formatting: { unit: '%' },
  annotations: [{ id: 'access', text: 'Hollow dots show the starting point; filled dots show the final state.' },
    { id: 'east-gap', text: 'Eastbank gains 48 percentage points, the largest improvement.', entityId: 'east' }],
});
const contribution = parseVisualization({ ...base('revenue-bridge', 'Growth is doing the heavy lifting', 'Annual recurring revenue bridge · $m', 'New business offsets churn and brings revenue above target.'),
  type: 'contribution', baseline: 80, data: [
    { id: 'new', label: 'New', value: 35 }, { id: 'expand', label: 'Expand', value: 18 }, { id: 'churn', label: 'Churn', value: -12 }, { id: 'fx', label: 'FX', value: -3 }],
  encodings: { id: 'id', label: 'label', value: 'value' }, formatting: { style: 'currency', currency: 'USD', unit: 'm' },
  kpi: { label: 'Recurring revenue', comparison: 80, target: 110, direction: 'up', sparkline: [62, 70, 74, 80, 98, 118] },
  annotations: [{ id: 'new-business', text: 'Start at $80m. New business adds $35m to the same baseline.', entityId: 'new' },
    { id: 'offset', text: 'Expansion adds $18m. Churn and currency remove $15m, leaving $118m.' }],
});
const flow = parseVisualization({ ...base('energy-flow', 'Follow the energy to its destination', 'Energy allocation · illustrative units', 'Most renewable generation goes directly to homes and industry.'),
  type: 'flow', nodes: [{ id: 'renewable', label: 'Renewable' }, { id: 'grid', label: 'Other' }, { id: 'homes', label: 'Homes' }, { id: 'industry', label: 'Industry' }, { id: 'storage', label: 'Storage' }],
  links: [{ id: 'r-h', source: 'renewable', target: 'homes', value: 48 }, { id: 'r-i', source: 'renewable', target: 'industry', value: 35 },
    { id: 'r-s', source: 'renewable', target: 'storage', value: 17 }, { id: 'g-h', source: 'grid', target: 'homes', value: 22 }, { id: 'g-i', source: 'grid', target: 'industry', value: 38 }],
  annotations: [{ id: 'flow-read', text: 'Band width encodes allocation. The diagram stays still at each scene.' },
    { id: 'storage', text: 'Seventeen units are directed to storage. Connected bands remain visible when a node is focused.', entityId: 'storage' }],
});
const forecast = parseVisualization({ ...base('demand-outlook', 'The direction is clearer than the destination', 'Electricity demand index · observed and scenario values', 'Uncertainty widens as the forecast horizon grows.'),
  type: 'forecast', encodings: { id: 'id', label: 'label', time: 'year', value: 'value', lower: 'low', upper: 'high', forecast: 'projected' },
  data: [90, 95, 101, 109, 121, 135, 151].map((value, i) => ({ id: 'demand', label: 'Demand', year: 2020 + i, value, low: value - (i > 3 ? (i - 3) * 10 : 0), high: value + (i > 3 ? (i - 3) * 13 : 0), projected: i > 3 })),
  intervalLabel: '80% illustrative scenario interval',
  annotations: [{ id: 'observed', text: 'The solid segment shows the observed portion of this synthetic scenario.' },
    { id: 'uncertain', text: 'The dashed segment is a projection; the shaded band is the 80% illustrative scenario interval. It is not a guarantee.' }],
});
const eventMap = parseVisualization({ ...base('delta-events', 'A flood moves through the delta', 'A fictional event sequence · day 1 to day 3', 'Events spread from the upper basin toward the estuary.'),
  type: 'event-map', coordinates: 'schematic', xDomain: [0, 100], yDomain: [0, 100],
  data: [{ id: 'upper', label: 'Upper basin', day: 1, x: 29, y: 77, impact: 4 }, { id: 'east', label: 'Eastbank', day: 2, x: 70, y: 56, impact: 9 },
    { id: 'low', label: 'Lowbank', day: 2, x: 39, y: 37, impact: 6 }, { id: 'mouth', label: 'Estuary', day: 3, x: 72, y: 17, impact: 12 }],
  encodings: { id: 'id', label: 'label', time: 'day', x: 'x', y: 'y', size: 'impact' },
  regions: [{ id: 'west', label: 'UPLAND', points: [[8, 90], [49, 97], [56, 72], [45, 59], [52, 38], [32, 9], [9, 25]] },
    { id: 'east-region', label: 'LOWLAND', points: [[59, 85], [91, 75], [96, 37], [83, 4], [51, 9], [61, 39], [52, 59]] }],
  annotations: [{ id: 'upstream', text: 'Day 1: the first event appears in the upper basin.', entityId: 'upper' },
    { id: 'spread', text: 'Day 2: two downstream events appear. Earlier events remain in place.' },
    { id: 'estuary', text: 'Day 3: the largest impact is recorded at the estuary. Circle area represents impact units.', entityId: 'mouth' }],
});
const table = parseVisualization({ ...base('portfolio-table', 'Growth quality varies across the portfolio', 'Commercial performance · current quarter', 'Revenue alone hides the difference between expansion and risk.'),
  type: 'table', rowId: 'id', groupBy: 'segment', sort: { key: 'revenue', direction: 'desc' },
  columns: [{ key: 'name', label: 'Portfolio', type: 'text' }, { key: 'revenue', label: 'Revenue', type: 'number', format: { style: 'currency', unit: 'm' }, dataBar: true, total: 'sum' },
    { key: 'variance', label: 'vs. plan', type: 'variance', format: { style: 'percent', digits: 1 } },
    { key: 'trend', label: 'Six periods', type: 'sparkline' }, { key: 'status', label: 'Health', type: 'status' }],
  data: [{ id: 'enterprise', name: 'Enterprise', revenue: 48, variance: .12, trend: [28, 32, 31, 39, 43, 48], status: 'positive' },
    { id: 'growth', name: 'Growth', revenue: 32, variance: .08, trend: [18, 22, 25, 24, 29, 32], status: 'positive' },
    { id: 'public', name: 'Public sector', revenue: 23, variance: -.06, trend: [24, 28, 26, 25, 24, 23], status: 'negative' },
    { id: 'startup', name: 'Startups', revenue: 15, variance: 0, trend: [9, 11, 13, 15, 14, 15], status: 'neutral' }].map(d => ({ ...d, segment: d.id === 'public' ? 'Public services' : 'Commercial' })),
  annotations: [{ id: 'portfolio-total', text: 'Total revenue is $118m. Variance rates are deliberately not summed.' },
    { id: 'portfolio-risk', text: 'Public sector is below plan and declining despite being the third-largest portfolio.', entityId: 'public' }],
});
const matrix = parseVisualization({ ...base('regional-matrix', 'See where the quarter was made', 'Revenue by region, team and quarter · $m', 'North contributes more revenue; South has the larger second-quarter increase.'),
  type: 'matrix', rowLabel: 'Region / team', rows: [{ id: 'north', label: 'North' }, { id: 'north-direct', label: 'Direct', parentId: 'north' }, { id: 'north-partner', label: 'Partner', parentId: 'north' },
    { id: 'south', label: 'South' }, { id: 'south-direct', label: 'Direct', parentId: 'south' }, { id: 'south-partner', label: 'Partner', parentId: 'south' }],
  columns: [{ id: 'year', label: '2024' }, { id: 'q1', label: 'Q1', parentId: 'year' }, { id: 'q2', label: 'Q2', parentId: 'year' }],
  measures: [{ key: 'revenue', label: 'Revenue', aggregate: 'sum', format: { style: 'currency', unit: 'm' }, dataBar: true }],
  data: ['north-direct', 'north-partner', 'south-direct', 'south-partner'].flatMap((rowId, i) => ['q1', 'q2'].map((columnId, j) => ({ rowId, columnId, values: { revenue: [[21, 25], [13, 15], [10, 18], [6, 10]][i][j] } }))),
  annotations: [{ id: 'matrix-read', text: 'Indented rows are leaf teams. Region and year subtotals aggregate the underlying cells once.' },
    { id: 'matrix-south', text: 'South grows from $16m to $28m. Grand totals use leaves, so subtotals are never double-counted.', entityId: 'south' }],
});
type SceneInput = Pick<Scene, 'id' | 'title' | 'caption'> & Partial<Omit<Scene, 'id' | 'title' | 'caption' | 'visualId'>>;
function story(visual: VisualizationSpec, scenes: SceneInput[]): StorySpec {
  return parseStory({ id: `${visual.id}-story`, version: '1.0', title: visual.title, description: visual.takeaway, visuals: [visual],
    scenes: scenes.map(s => ({ visualId: visual.id, ...s })) });
}
export interface CatalogEntry { id: string; name: string; group: 'Evolution' | 'Comparison' | 'Composition' | 'Geography' | 'Analytics'; description: string; story: StorySpec; tag: string }
export const catalog: CatalogEntry[] = [
  { id: 'time-series', name: 'Time evolution', group: 'Evolution', description: 'Trace the turning points in a multi-series story.', tag: 'LINE / AREA', story: story(timeSeries, [
    { id: 'opening', chapter: 'The starting point', title: 'An uneven starting line', caption: 'In 2016, hydro leads this illustrative energy mix. Solar is still a small part of the picture.', state: { time: 2016 }, annotationIds: ['starting'] },
    { id: 'momentum', chapter: 'The acceleration', title: 'A different kind of growth', caption: 'Advance to 2020. The established sources rise gradually, while solar starts to accelerate.', state: { time: 2020 }, focusIds: ['solar'], annotationIds: ['turn'] },
    { id: 'crossover', chapter: 'The crossover', title: 'The gap nearly disappears', caption: 'By 2022, solar approaches hydro. Keeping the same scale makes the change in slope visible.', state: { time: 2022 }, focusIds: ['solar', 'hydro'], annotationIds: ['turn'] },
    { id: 'new-order', chapter: 'The new order', title: 'The smallest becomes the largest', caption: 'The final view restores all three series. Solar ends above both wind and hydro, changing the order of the mix.', state: { time: 2024 }, annotationIds: ['lead'] },
  ]) },
  { id: 'ranking', name: 'Animated ranking', group: 'Evolution', description: 'Follow the same entities as the order changes.', tag: 'BAR RACE', story: story(ranking, [
    { id: 'rank-opening', title: 'Meet the early leaders', caption: 'Northland and the Alpine Region begin ahead of the pack.', state: { time: 2016 }, annotationIds: ['rank-start'] },
    { id: 'rank-middle', title: 'The challengers move up', caption: 'The coastal regions gain ground. Entity colors and keys remain stable as bars move.', state: { time: 2020 }, focusIds: ['coast', 'delta'], annotationIds: ['rank-change'] },
    { id: 'rank-final', title: 'A new leader emerges', caption: 'Coast Union reaches first place, while Delta States rises to second.', state: { time: 2024 }, annotationIds: ['rank-end'] },
  ]) },
  { id: 'scatter', name: 'Bubble evolution', group: 'Evolution', description: 'Track entities across two measures and time.', tag: 'SCATTER / BUBBLE', story: story(scatter, [
    { id: 'cities-start', title: 'Three cities, different starting points', caption: 'Compare income and emissions before following the trajectories.', state: { time: 2016 }, annotationIds: ['bubble-start'] },
    { id: 'cities-middle', title: 'Progress has a direction', caption: 'Down and right means lower emissions and higher income.', state: { time: 2020 }, focusIds: ['aster'] },
    { id: 'cities-end', title: 'Aster travels the furthest', caption: 'The final snapshot makes each city’s position directly comparable.', state: { time: 2024 }, annotationIds: ['bubble-end'] },
  ]) },
  { id: 'dumbbell', name: 'Before & after', group: 'Comparison', description: 'Make the magnitude of a change easy to read.', tag: 'DUMBBELL', story: story(dumbbell, [
    { id: 'access-overview', title: 'Access improves across districts', caption: 'Read each line from the hollow starting dot to the filled final dot.', annotationIds: ['access'] },
    { id: 'access-east', title: 'Eastbank makes the largest gain', caption: 'Focus reveals a 48-point improvement.', focusIds: ['east'], annotationIds: ['east-gap'], transition: { intent: 'focus-reveal', durationMs: 400 } },
    { id: 'access-final', title: 'Compare the final positions', caption: 'Central still has the highest access level, despite Eastbank’s larger gain.', annotationIds: ['access', 'east-gap'] },
  ]) },
  { id: 'contribution', name: 'KPI contribution', group: 'Composition', description: 'Explain what moved the headline number.', tag: 'KPI / WATERFALL', story: story(contribution, [
    { id: 'revenue-new', title: 'New business creates headroom', caption: 'Add new business to the $80m starting baseline.', state: { revealCount: 1 }, annotationIds: ['new-business'] },
    { id: 'revenue-expand', title: 'Expansion adds another layer', caption: 'Existing customers contribute another $18m before losses are accounted for.', state: { revealCount: 2 }, focusIds: ['expand'] },
    { id: 'revenue-final', title: 'Net growth clears the target', caption: 'After churn and currency effects, the final KPI reaches $118m against a $110m target.', state: { revealCount: 4 }, annotationIds: ['offset'] },
  ]) },
  { id: 'flow', name: 'Flow & allocation', group: 'Composition', description: 'Show how a whole travels between destinations.', tag: 'SANKEY', story: story(flow, [
    { id: 'flow-overview', title: 'Read the whole allocation', caption: 'Each band connects a source to its destination.', annotationIds: ['flow-read'] },
    { id: 'flow-renewable', title: 'Follow renewable generation', caption: 'Highlight the renewable source and its connected bands.', focusIds: ['renewable'], transition: { intent: 'focus-reveal', durationMs: 400 } },
    { id: 'flow-storage', title: 'A smaller share goes to storage', caption: 'Storage accounts for 17 of the 100 renewable units.', focusIds: ['storage'], annotationIds: ['storage'] },
  ]) },
  { id: 'forecast', name: 'Forecast & uncertainty', group: 'Comparison', description: 'Keep uncertainty visible alongside the outlook.', tag: 'LINE / INTERVAL', story: story(forecast, [
    { id: 'demand-past', title: 'Start with the observed period', caption: 'A solid line describes the historical part of this demonstration.', state: { time: 2023 }, annotationIds: ['observed'] },
    { id: 'demand-near', title: 'Cross into the scenario', caption: 'A dashed line and a shaded interval distinguish projected values.', state: { time: 2024 }, annotationIds: ['uncertain'] },
    { id: 'demand-future', title: 'The range grows with the horizon', caption: 'The final state shows the entire interval so the central estimate never stands alone.', state: { time: 2026 }, annotationIds: ['uncertain'] },
  ]) },
  { id: 'event-map', name: 'Map & event story', group: 'Geography', description: 'Reveal a sequence while preserving its place.', tag: 'MAP / EVENTS', story: story(eventMap, [
    { id: 'flood-start', title: 'An event in the upper basin', caption: 'The first report sets the geographic context on this fictional map.', state: { time: 1 }, annotationIds: ['upstream'] },
    { id: 'flood-spread', title: 'The event spreads downstream', caption: 'Two more reports appear while the first remains visible.', state: { time: 2 }, focusIds: ['east', 'low'], annotationIds: ['spread'] },
    { id: 'flood-estuary', title: 'The largest impact reaches the estuary', caption: 'Focus on the final event, with the preceding sequence retained for context.', state: { time: 3 }, focusIds: ['mouth'], annotationIds: ['estuary'] },
  ]) },
  { id: 'table', name: 'Analytical table', group: 'Analytics', description: 'Pair exact values with signals, bars and trends.', tag: 'TABLE', story: story(table, [
    { id: 'portfolio-overview', title: 'Read the portfolio at a glance', caption: 'Revenue sorts within each segment; bars show magnitude and sparklines show direction.', annotationIds: ['portfolio-total'] },
    { id: 'portfolio-focus', title: 'Look beyond the headline', caption: 'Public sector is the portfolio to investigate.', focusIds: ['public'], annotationIds: ['portfolio-risk'] },
    { id: 'portfolio-end', title: 'Put the risk in context', caption: 'Restore the whole portfolio to compare size, variance and trend.', annotationIds: ['portfolio-total', 'portfolio-risk'] },
  ]) },
  { id: 'matrix', name: 'Analytical matrix', group: 'Analytics', description: 'Navigate hierarchies without double-counting.', tag: 'MATRIX', story: story(matrix, [
    { id: 'regions-overview', title: 'From teams to regions', caption: 'Rows and columns retain their hierarchy, with subtotals after their children.', annotationIds: ['matrix-read'] },
    { id: 'regions-south', title: 'South’s second quarter stands out', caption: 'Focus on South and its teams to compare quarters.', focusIds: ['south'], annotationIds: ['matrix-south'] },
    { id: 'regions-end', title: 'Return to the overall picture', caption: 'Grand totals reconcile the two regions and their underlying teams.', annotationIds: ['matrix-read', 'matrix-south'] },
  ]) },
];
export const editorialStory = parseStory({ id: 'energy-explainer', version: '1.0', title: 'One transition, three perspectives', description: 'An editorial wrapper across line, ranking and contribution figures.',
  visuals: [timeSeries, ranking, contribution], scenes: [
    { id: 'chapter-trend', visualId: timeSeries.id, chapter: '01 · The trend', title: 'First, see the shift over time', caption: 'A comparison of trajectories explains the shape of change.', state: { time: 2024 }, annotationIds: ['lead'], transition: { intent: 'scene' } },
    { id: 'chapter-rank', visualId: ranking.id, chapter: '02 · The leaders', title: 'Then, see who leads', caption: 'A ranking answers a different analytical question with the same story controls.', state: { time: 2024 }, annotationIds: ['rank-end'], transition: { intent: 'scene' } },
    { id: 'chapter-kpi', visualId: contribution.id, chapter: '03 · The drivers', title: 'Finally, explain a headline KPI', caption: 'This independent commercial example shows how the wrapper can cross figure families without a CMS.', annotationIds: ['offset'], transition: { intent: 'scene' } },
  ] });
