import { parseVisualization } from '../../core/spec.js';
import { chapterStory, timelineStory } from '../../core/story-patterns.js';
import { syntheticBase as base, encodings, seriesRows } from '../fixtures.js';
import type { CatalogEntry } from '../v1.js';

const processors = parseVisualization({
  ...base(
    'processor-frontier',
    'The frontier moves down and to the right',
    'Synthetic processor generations · performance versus task energy',
    'A faster processor need not require more energy per completed task.',
    '1.0',
  ),
  type: 'scatter',
  xLabel: 'Performance index',
  yLabel: 'Joules / synthetic task',
  xDomain: [0, 250],
  yDomain: [0, 120],
  encodings: { id: 'id', label: 'label', time: 'year', x: 'performance', y: 'joules', size: 'silicon' },
  data: [
    { id: 'cpu-a', label: 'CPU A', performance: [70, 100, 130], joules: [90, 75, 65], silicon: 40 },
    { id: 'cpu-b', label: 'CPU B', performance: [100, 130, 158], joules: [110, 87, 72], silicon: 55 },
    {
      id: 'accelerator',
      label: 'Accelerator',
      performance: [80, 150, 225],
      joules: [100, 64, 38],
      silicon: 70,
    },
  ].flatMap((series) =>
    [2020, 2022, 2024].map((year, index) => ({
      id: series.id,
      label: series.label,
      year,
      performance: series.performance[index],
      joules: series.joules[index],
      silicon: series.silicon,
    })),
  ),
  annotations: [
    {
      id: 'task',
      text: 'The task is fixed across these synthetic generations. Bubble area encodes an illustrative silicon budget, not performance.',
    },
    {
      id: 'frontier',
      entityId: 'accelerator',
      text: 'The accelerator has the greatest performance gain and the largest task-energy reduction in this fixture.',
    },
  ],
});
const energy = parseVisualization({
  ...base(
    'ai-energy-mix',
    'Serving becomes the largest energy demand',
    'Synthetic AI workload · kWh per fixed reporting window',
    'Serving growth accounts for two thirds of the total increase.',
  ),
  type: 'stacked-area',
  encodings,
  normalize: false,
  formatting: { unit: 'kWh' },
  data: seriesRows(
    [2020, 2022, 2024],
    [
      { id: 'training', label: 'Training', values: [60, 70, 80] },
      { id: 'serving', label: 'Serving', values: [30, 60, 90] },
      { id: 'network', label: 'Network', values: [10, 15, 20] },
    ],
  ),
  annotations: [
    {
      id: 'absolute',
      text: 'These are absolute synthetic energy totals, not normalized shares. The reporting window stays fixed.',
    },
    {
      id: 'serving-growth',
      entityId: 'serving',
      text: 'Serving adds 60 kWh out of a total increase of 90 kWh.',
    },
  ],
});
const bridge = parseVisualization({
  ...base(
    'ai-energy-bridge',
    'Serving explains most of the increase',
    'Synthetic energy bridge · same data as the stacked view',
    'A 100 kWh baseline grows to 190 kWh, mostly through serving.',
    '1.0',
  ),
  type: 'contribution',
  encodings: { id: 'id', label: 'label', value: 'value' },
  baseline: 100,
  data: [
    { id: 'serving', label: 'Serving', value: 60 },
    { id: 'training', label: 'Training', value: 20 },
    { id: 'network', label: 'Network', value: 10 },
  ],
  formatting: { unit: 'kWh' },
  kpi: {
    label: 'Energy per reporting window',
    comparison: 100,
    target: 180,
    direction: 'down',
    sparkline: [100, 145, 190],
  },
  annotations: [
    {
      id: 'reconcile',
      text: '100 + 60 + 20 + 10 = 190 kWh. The waterfall reconciles exactly to the stacked-area endpoint.',
    },
  ],
});
export const computePacks: CatalogEntry[] = [
  {
    id: 'pack-processors',
    name: 'Processor efficiency',
    group: 'Evolution',
    tag: 'STORY PACK / PROCESSORS',
    description: 'Follow performance and task energy together.',
    story: timelineStory(processors, [
      {
        id: 'cpu-start',
        time: 2020,
        title: 'Three designs, one fixed task',
        caption: 'Read performance horizontally and task energy vertically.',
        annotationIds: ['task'],
      },
      {
        id: 'cpu-middle',
        time: 2022,
        title: 'The accelerator separates',
        caption: 'The same bubble moves down and right as performance rises and task energy falls.',
        focusIds: ['accelerator'],
        annotationIds: ['task'],
      },
      {
        id: 'cpu-end',
        time: 2024,
        title: 'A new efficiency frontier',
        caption: 'Restore all three designs to compare their final positions.',
        annotationIds: ['frontier'],
      },
    ]),
  },
  {
    id: 'pack-ai-energy',
    name: 'AI energy demand',
    group: 'Composition',
    tag: 'STORY PACK / AI ENERGY',
    description: 'Reconcile evolving workload demand with an energy bridge.',
    story: chapterStory(
      {
        id: 'ai-energy-story',
        title: 'From workload mix to energy drivers',
        description: 'Two views reconcile the same synthetic energy demand.',
      },
      [
        {
          visual: energy,
          scene: {
            id: 'ai-start',
            title: 'Training starts as the largest demand',
            caption: 'The first reporting window totals 100 kWh.',
            state: { time: 2020 },
            annotationIds: ['absolute'],
          },
        },
        {
          visual: energy,
          scene: {
            id: 'ai-growth',
            title: 'Serving takes the lead',
            caption: 'By the final window, serving uses 90 of 190 kWh.',
            state: { time: 2024 },
            focusIds: ['serving'],
            annotationIds: ['serving-growth'],
            transition: { intent: 'morph-update', durationMs: 650 },
          },
        },
        {
          visual: bridge,
          scene: {
            id: 'ai-drivers',
            title: 'Reconcile the increase',
            caption: 'The same 90 kWh increase is now separated into three drivers.',
            annotationIds: ['reconcile'],
          },
        },
      ],
    ),
  },
];
