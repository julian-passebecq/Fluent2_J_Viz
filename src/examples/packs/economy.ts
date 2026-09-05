import { parseVisualization } from '../../core/spec.js';
import { timelineStory } from '../../core/story-patterns.js';
import { syntheticBase as base, encodings, seriesRows } from '../fixtures.js';
import type { CatalogEntry } from '../v1.js';

const markets = parseVisualization({
  ...base(
    'market-paths',
    'The highest finish takes a rougher path',
    'Synthetic stock baskets · price index, 2018 = 100',
    'A shared starting value makes paths comparable without hiding drawdowns.',
    '1.0',
  ),
  type: 'time-series',
  encodings,
  yDomain: [0, 230],
  data: seriesRows(
    [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    [
      { id: 'broad', label: 'Broad market', values: [100, 112, 93, 135, 118, 149, 172] },
      { id: 'compute', label: 'Compute basket', values: [100, 119, 105, 165, 113, 173, 219] },
      { id: 'energy', label: 'Energy basket', values: [100, 104, 72, 110, 139, 135, 148] },
    ],
  ),
  annotations: [
    {
      id: 'indexed',
      text: 'All synthetic baskets begin at 100. This is a price-index fixture: no dividends, fees or investment returns are implied.',
    },
    {
      id: 'drawdown',
      entityId: 'compute',
      text: 'The compute basket has the largest 2021–2022 drop despite finishing highest.',
    },
    {
      id: 'market-end',
      entityId: 'compute',
      text: 'A final ranking alone would hide the drawdown along the way.',
    },
  ],
});
const gdp = parseVisualization({
  ...base(
    'gdp-recovery',
    'The rebound differs from the level reached',
    'Synthetic GDP volume indices · fictional economies, 2018 = 100',
    'Common scales separate a fast rebound from a sustained lead.',
  ),
  type: 'small-multiples',
  encodings,
  columns: 2,
  yDomain: [0, 150],
  data: seriesRows(
    [2018, 2020, 2022, 2024],
    [
      { id: 'alder', label: 'Alder economy', values: [100, 90, 109, 121] },
      { id: 'bay', label: 'Bay economy', values: [100, 82, 111, 130] },
      { id: 'cedar', label: 'Cedar economy', values: [100, 98, 107, 114] },
      { id: 'dawn', label: 'Dawn economy', values: [100, 102, 120, 144] },
    ],
  ),
  annotations: [
    {
      id: 'volume',
      text: 'These fictional volume indices share a base year. They are not GDP levels, per-capita measures or observed country statistics.',
    },
    {
      id: 'rebound',
      entityId: 'bay',
      text: 'Bay rebounds most from the 2020 trough, but Dawn still finishes at a higher index.',
    },
  ],
});
export const economyPacks: CatalogEntry[] = [
  {
    id: 'pack-markets',
    name: 'Market paths',
    group: 'Evolution',
    tag: 'STORY PACK / MARKETS',
    description: 'Price-index trajectories, drawdowns and the final order.',
    story: timelineStory(markets, [
      {
        id: 'markets-base',
        time: 2018,
        title: 'Start from the same point',
        caption: 'Three synthetic baskets begin at 100, so subsequent movement is directly comparable.',
        annotationIds: ['indexed'],
      },
      {
        id: 'markets-rise',
        time: 2021,
        title: 'Compute opens a lead',
        caption: 'Compute rises faster than the other two baskets through 2021.',
        focusIds: ['compute'],
        annotationIds: ['indexed'],
      },
      {
        id: 'markets-drop',
        time: 2022,
        title: 'The leader gives back its gains',
        caption: 'A sharp decline takes compute below the broad market index.',
        focusIds: ['compute'],
        annotationIds: ['drawdown'],
      },
      {
        id: 'markets-end',
        time: 2024,
        title: 'A strong finish does not erase the path',
        caption: 'Compute ends highest after the largest drawdown. The whole trajectory carries the story.',
        annotationIds: ['market-end'],
      },
    ]),
  },
  {
    id: 'pack-gdp',
    name: 'GDP recovery',
    group: 'Comparison',
    tag: 'STORY PACK / GDP',
    description: 'Separate recovery rates from final index levels.',
    story: timelineStory(gdp, [
      {
        id: 'gdp-base',
        time: 2018,
        title: 'Equal baselines, different economies',
        caption: 'Each fictional economy begins at 100; the values are indices, not currency amounts.',
        annotationIds: ['volume'],
      },
      {
        id: 'gdp-trough',
        time: 2020,
        title: 'Bay falls furthest',
        caption: 'The same vertical scale makes the depth of the interruption visible.',
        focusIds: ['bay'],
        annotationIds: ['volume'],
      },
      {
        id: 'gdp-end',
        time: 2024,
        title: 'The fastest rebound is not the highest finish',
        caption: 'Bay gains 48 index points from its trough, while Dawn ends highest at 144.',
        annotationIds: ['rebound'],
      },
    ]),
  },
];
