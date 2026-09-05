import { parseVisualization } from '../../core/spec.js';
import { chapterStory, timelineStory } from '../../core/story-patterns.js';
import { syntheticBase as base, encodings, seriesRows } from '../fixtures.js';
import type { CatalogEntry } from '../v1.js';

const events = parseVisualization({
  ...base(
    'quake-sequence',
    'Later events cluster along the central corridor',
    'Synthetic earthquake events · geographic coordinates',
    'Cumulative steps retain earlier events so the changing cluster stays visible.',
    '1.0',
  ),
  type: 'event-map',
  coordinates: 'geographic',
  xDomain: [-170, -110],
  yDomain: [10, 55],
  encodings: { id: 'id', label: 'label', time: 'day', x: 'longitude', y: 'latitude', size: 'impact' },
  data: [
    { id: 'q1', label: 'Offshore A', day: 1, longitude: -161, latitude: 47, impact: 5 },
    { id: 'q2', label: 'Offshore B', day: 2, longitude: -151, latitude: 28, impact: 3 },
    { id: 'q3', label: 'Central A', day: 2, longitude: -138, latitude: 41, impact: 8 },
    { id: 'q4', label: 'Central B', day: 3, longitude: -132, latitude: 26, impact: 12 },
    { id: 'q5', label: 'Central C', day: 4, longitude: -127, latitude: 37, impact: 7 },
  ],
  annotations: [
    {
      id: 'synthetic-quakes',
      text: 'Synthetic epicenters, times and impact indices. Circle area shows the illustrative impact index, not earthquake magnitude. No observed events or basemap are represented.',
    },
    {
      id: 'cluster',
      entityId: 'q4',
      text: 'The largest synthetic event appears in the central corridor. Earlier events remain visible for temporal context.',
    },
  ],
});
const franchiseData = seriesRows(
  [2018, 2020, 2022, 2024],
  [
    { id: 'arc', label: 'Arc', values: [90, 96, 103, 112] },
    { id: 'beacon', label: 'Beacon', values: [32, 62, 106, 145] },
    { id: 'circuit', label: 'Circuit', values: [75, 81, 91, 99] },
    { id: 'drift', label: 'Drift', values: [44, 53, 67, 84] },
  ],
);
const franchiseBase = {
  data: franchiseData,
  encodings,
  annotations: [
    {
      id: 'new-leader',
      entityId: 'beacon',
      text: 'Beacon passes Arc in 2022 and extends its lead by 2024. All franchise names and scores are fictional.',
    },
  ],
};
const ranks = parseVisualization({
  ...base(
    'franchise-ranks',
    'The new series overtakes the flagship',
    'Synthetic franchise audience scores',
    'Rank trajectories reveal the crossover; values reveal the size of the lead.',
  ),
  ...franchiseBase,
  type: 'bump',
});
const bars = parseVisualization({
  ...base(
    'franchise-final',
    'Beacon finishes with a clear lead',
    'Synthetic franchise audience scores · 2024',
    'Beacon reaches 145, compared with Arc at 112.',
    '1.0',
  ),
  ...franchiseBase,
  type: 'ranking',
});
const lines = parseVisualization({
  ...base(
    'franchise-history',
    'The lead comes from sustained growth',
    'Synthetic franchise audience scores · 2018–2024',
    'Beacon grows throughout the timeline while Arc advances gradually.',
    '1.0',
  ),
  ...franchiseBase,
  type: 'time-series',
});
export const eventPacks: CatalogEntry[] = [
  {
    id: 'pack-earthquakes',
    name: 'Earthquake sequence',
    group: 'Geography',
    tag: 'STORY PACK / EVENTS',
    description: 'Reveal synthetic epicenters without losing earlier events.',
    story: timelineStory(events, [
      {
        id: 'quake-start',
        time: 1,
        title: 'The first event anchors the sequence',
        caption: 'One fictional offshore event provides the starting point.',
        annotationIds: ['synthetic-quakes'],
      },
      {
        id: 'quake-spread',
        time: 2,
        title: 'Two more events broaden the pattern',
        caption: 'The early point remains while two later points appear.',
        annotationIds: ['synthetic-quakes'],
      },
      {
        id: 'quake-cluster',
        time: 4,
        title: 'The later reports cluster centrally',
        caption: 'Five synthetic events now show the full sequence and the largest impact index.',
        focusIds: ['q3', 'q4', 'q5'],
        annotationIds: ['cluster'],
      },
    ]),
  },
  {
    id: 'pack-franchises',
    name: 'Franchise rise',
    group: 'Evolution',
    tag: 'STORY PACK / FRANCHISES',
    description: 'Explain the crossover, the lead and the trajectory.',
    story: chapterStory(
      {
        id: 'franchise-story',
        title: 'A challenger rewrites the order',
        description: 'Bump, ranking and time-series chapters share one synthetic franchise dataset.',
      },
      [
        {
          visual: ranks,
          scene: {
            id: 'franchise-start',
            title: 'Arc starts on top',
            caption: 'Beacon begins last among the four fictional franchises.',
            state: { time: 2018 },
          },
        },
        {
          visual: ranks,
          scene: {
            id: 'franchise-cross',
            title: 'Beacon moves into first',
            caption: 'The trajectories cross in 2022.',
            state: { time: 2022 },
            focusIds: ['beacon'],
            annotationIds: ['new-leader'],
            transition: { intent: 'morph-update', durationMs: 650 },
          },
        },
        {
          visual: bars,
          scene: {
            id: 'franchise-gap',
            title: 'Measure the final gap',
            caption: 'The final ranking makes the score difference explicit.',
            state: { time: 2024 },
            annotationIds: ['new-leader'],
          },
        },
        {
          visual: lines,
          scene: {
            id: 'franchise-path',
            title: 'Return to the whole trajectory',
            caption: 'The same values show how sustained growth produced the lead.',
            state: { time: 2024 },
            annotationIds: ['new-leader'],
          },
        },
      ],
    ),
  },
];
