import { parseVisualization } from '../core/spec.js';
import { timelineStory } from '../core/story-patterns.js';
import type { CatalogEntry } from './v1.js';
import { syntheticBase as base, encodings, seriesRows } from './fixtures.js';

const bump = parseVisualization({
  ...base(
    'category-ranks',
    'Specialists displace the early leader',
    'Synthetic category scores · 2018–2024',
    'Keeping every trajectory reveals when the order changes.',
  ),
  type: 'bump',
  encodings,
  data: seriesRows(
    [2018, 2020, 2022, 2024],
    [
      { id: 'core', label: 'Core', values: [90, 86, 78, 70] },
      { id: 'craft', label: 'Craft', values: [30, 55, 82, 98] },
      { id: 'local', label: 'Local', values: [55, 62, 76, 88] },
      { id: 'broad', label: 'Broad', values: [70, 71, 73, 74] },
    ],
  ),
  annotations: [
    {
      id: 'rank-trails',
      text: 'Rank 1 is at the top. Ties break by stable ID; position describes order, not the score gap.',
    },
    {
      id: 'craft-leads',
      entityId: 'craft',
      text: 'Craft crosses the established categories and finishes first in this synthetic fixture.',
    },
  ],
});
const histogram = parseVisualization({
  ...base(
    'service-distribution',
    'The long tail contracts as the center shifts',
    'Synthetic service times · minutes',
    'A distribution reveals spread that a single average would hide.',
  ),
  type: 'histogram',
  encodings,
  binCount: 8,
  xDomain: [0, 100],
  formatting: { unit: 'min' },
  data: [2018, 2021, 2024].flatMap((year, period) =>
    Array.from({ length: 48 }, (_, index) => ({
      id: `sample-${index}`,
      label: `Sample ${index + 1}`,
      year,
      value:
        period === 0
          ? 10 + (index % 24) + (index % 8 === 0 ? 55 : 0)
          : period === 1
            ? 25 + (index % 20) + (index % 8 === 0 ? 30 : 0)
            : 40 + (index % 18) + (index % 8 === 0 ? 8 : 0),
    })),
  ),
  annotations: [
    {
      id: 'bins',
      text: 'All scenes retain the same eight bins and count scale. The dashed line locates the median.',
    },
    {
      id: 'tail',
      text: 'The final sample is more concentrated, even though its median is higher. These are synthetic distributions.',
    },
  ],
});
const multiples = parseVisualization({
  ...base(
    'regional-recovery',
    'Equal scales expose unequal recoveries',
    'Synthetic regional output index · 2018 = 100',
    'Dune rises fastest; Cove remains close to its starting level.',
  ),
  type: 'small-multiples',
  encodings,
  columns: 2,
  yDomain: [0, 180],
  data: seriesRows(
    [2018, 2020, 2022, 2024],
    [
      { id: 'aster', label: 'Aster', values: [100, 91, 120, 143] },
      { id: 'birch', label: 'Birch', values: [100, 86, 114, 136] },
      { id: 'cove', label: 'Cove', values: [100, 95, 104, 110] },
      { id: 'dune', label: 'Dune', values: [100, 102, 139, 168] },
    ],
  ),
  annotations: [
    {
      id: 'shared',
      text: 'Every panel uses the same horizontal and vertical scale. Panel positions remain fixed while time advances.',
    },
    { id: 'uneven', entityId: 'dune', text: 'Dune ends at 168 on this synthetic index; Cove ends at 110.' },
  ],
});
const composition = parseVisualization({
  ...base(
    'audience-mix',
    'Streaming becomes the largest slice',
    'Synthetic audience mix · share of all channels',
    'A changing composition can coexist with growth in the total.',
  ),
  type: 'stacked-area',
  encodings,
  normalize: true,
  data: seriesRows(
    [2018, 2020, 2022, 2024],
    [
      { id: 'broadcast', label: 'Broadcast', values: [50, 45, 35, 22] },
      { id: 'stream', label: 'Streaming', values: [10, 20, 36, 58] },
      { id: 'mobile', label: 'Mobile', values: [25, 26, 30, 33] },
      { id: 'live', label: 'Live', values: [15, 16, 17, 18] },
    ],
  ),
  annotations: [
    {
      id: 'share',
      text: 'Every period sums to 100%. Band thickness shows share, while the underlying data retains absolute values.',
    },
    {
      id: 'shift',
      entityId: 'stream',
      text: 'Streaming becomes the largest channel in this fixture. Its share grows from 10% to about 44%.',
    },
  ],
});
const map = parseVisualization({
  ...base(
    'island-access',
    'The coverage gap narrows across the islands',
    'Synthetic access rates on fictional GeoJSON regions',
    'Cove catches up while the same color scale keeps the gap comparable.',
  ),
  type: 'choropleth',
  encodings,
  valueDomain: [0, 1],
  formatting: { style: 'percent' },
  data: seriesRows(
    [2018, 2021, 2024],
    [
      { id: 'aster', label: 'Aster', values: [0.72, 0.8, 0.88] },
      { id: 'birch', label: 'Birch', values: [0.6, 0.72, 0.84] },
      { id: 'cove', label: 'Cove', values: [0.28, 0.51, 0.81] },
      { id: 'dune', label: 'Dune', values: [0.45, 0.62, 0.79] },
    ],
  ),
  regions: [
    {
      id: 'aster',
      label: 'Aster',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 12],
            [12, 10],
            [13, 25],
            [2, 28],
            [0, 12],
          ],
          [
            [4, 16],
            [4, 20],
            [7, 20],
            [7, 16],
            [4, 16],
          ],
        ],
      },
    },
    {
      id: 'birch',
      label: 'Birch',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [16, 12],
            [29, 11],
            [31, 24],
            [19, 28],
            [16, 12],
          ],
        ],
      },
    },
    {
      id: 'cove',
      label: 'Cove',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, -8],
            [14, -7],
            [12, 7],
            [1, 8],
            [0, -8],
          ],
        ],
      },
    },
    {
      id: 'dune',
      label: 'Dune',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [18, -8],
              [30, -7],
              [29, 6],
              [19, 7],
              [18, -8],
            ],
          ],
          [
            [
              [33, -3],
              [36, -3],
              [36, 1],
              [33, 1],
              [33, -3],
            ],
          ],
        ],
      },
    },
    {
      id: 'eel',
      label: 'Eel',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [36, 14],
            [42, 15],
            [42, 22],
            [36, 22],
            [36, 14],
          ],
        ],
      },
    },
  ],
  annotations: [
    {
      id: 'fixed',
      text: 'The scale stays fixed at 0–100%. Gray marks Eel as missing, not zero. Aster has a hole and Dune has two polygons.',
    },
    {
      id: 'catch-up',
      entityId: 'cove',
      text: 'Cove closes most of its gap with Aster. All shapes and access rates are synthetic.',
    },
  ],
});
if (
  bump.type !== 'bump' ||
  histogram.type !== 'histogram' ||
  multiples.type !== 'small-multiples' ||
  composition.type !== 'stacked-area' ||
  map.type !== 'choropleth'
)
  throw new Error('Gallery schema mismatch');
export const gallery: CatalogEntry[] = [
  {
    id: 'bump',
    name: 'Rank trajectories',
    tag: 'BUMP / RANK',
    group: 'Evolution',
    description: 'Show the paths behind a changing league table.',
    story: timelineStory(bump, [
      {
        id: 'bump-start',
        time: 2018,
        title: 'An established order',
        caption: 'Core begins first; Craft starts fourth.',
        annotationIds: ['rank-trails'],
      },
      {
        id: 'bump-cross',
        time: 2022,
        title: 'The paths cross',
        caption: 'Craft rises to first. Lines preserve the route taken by each category.',
        focusIds: ['craft'],
        annotationIds: ['rank-trails'],
      },
      {
        id: 'bump-end',
        time: 2024,
        title: 'The specialist holds the lead',
        caption: 'Restore every category to see the final order.',
        annotationIds: ['craft-leads'],
      },
    ]),
  },
  {
    id: 'histogram',
    name: 'Distribution stories',
    tag: 'HISTOGRAM',
    group: 'Comparison',
    description: 'Compare shape, center and tail on fixed bins.',
    story: timelineStory(histogram, [
      {
        id: 'dist-start',
        time: 2018,
        title: 'A center with a long tail',
        caption: 'Most samples finish early, but a handful extend the tail.',
        annotationIds: ['bins'],
      },
      {
        id: 'dist-middle',
        time: 2021,
        title: 'The center moves',
        caption: 'The median rises while extreme values move inward.',
        annotationIds: ['bins'],
      },
      {
        id: 'dist-end',
        time: 2024,
        title: 'More concentrated is not always faster',
        caption: 'The final sample has less spread and a higher median.',
        annotationIds: ['tail'],
      },
    ]),
  },
  {
    id: 'small-multiples',
    name: 'Small multiples',
    tag: 'SHARED SCALES',
    group: 'Comparison',
    description: 'Compare trajectories without overlapping lines.',
    story: timelineStory(multiples, [
      {
        id: 'panels-start',
        time: 2018,
        title: 'Begin from a common baseline',
        caption: 'All four regions begin at an index of 100.',
        annotationIds: ['shared'],
      },
      {
        id: 'panels-middle',
        time: 2020,
        title: 'The interruption is uneven',
        caption: 'Three regions dip below the baseline; Dune remains above it.',
        annotationIds: ['shared'],
      },
      {
        id: 'panels-end',
        time: 2024,
        title: 'Recovery separates the regions',
        caption: 'Dune climbs fastest while Cove stays near its starting level.',
        annotationIds: ['uneven'],
      },
    ]),
  },
  {
    id: 'stacked-area',
    name: 'Composition over time',
    tag: 'STACKED / NORMALIZED',
    group: 'Composition',
    description: 'Follow absolute contributions or normalized shares.',
    story: timelineStory(composition, [
      {
        id: 'mix-start',
        time: 2018,
        title: 'Broadcast occupies half the mix',
        caption: 'Streaming begins as the smallest channel.',
        annotationIds: ['share'],
      },
      {
        id: 'mix-middle',
        time: 2022,
        title: 'The mix reaches a turning point',
        caption: 'Streaming has become slightly larger than broadcast.',
        focusIds: ['stream'],
        annotationIds: ['share'],
      },
      {
        id: 'mix-end',
        time: 2024,
        title: 'The new channel becomes the largest',
        caption: 'The full mix makes both gains and shrinking shares visible.',
        annotationIds: ['shift'],
      },
    ]),
  },
  {
    id: 'choropleth',
    name: 'Regional change map',
    tag: 'GEOJSON / CHOROPLETH',
    group: 'Geography',
    description: 'Compare region values with a fixed geographic scale.',
    story: timelineStory(map, [
      {
        id: 'map-start',
        time: 2018,
        title: 'Coverage differs sharply',
        caption: 'Aster starts well ahead of Cove. Eel has no observations.',
        annotationIds: ['fixed'],
      },
      {
        id: 'map-middle',
        time: 2021,
        title: 'The gap begins to close',
        caption: 'Every measured island gains coverage on the same color scale.',
        annotationIds: ['fixed'],
      },
      {
        id: 'map-end',
        time: 2024,
        title: 'Cove nearly catches Aster',
        caption: 'The final view restores all islands, including the explicit missing region.',
        annotationIds: ['catch-up'],
      },
    ]),
  },
];
