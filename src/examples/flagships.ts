import gdp from '../../data/world-bank-gdp.json' with { type: 'json' };
import events from '../../data/usgs-tohoku.json' with { type: 'json' };
import japan from '../../data/japan-outline.json' with { type: 'json' };
import { parseVisualization } from '../core/spec.js';
import { chapterStory, timelineStory } from '../core/story-patterns.js';
import type { CatalogEntry } from './v1.js';

const encodings = { id: 'id', label: 'label', time: 'year', value: 'value' };
const gdpSource = 'World Bank · NY.GDP.MKTP.CD · pinned 6 September 2026 · CC BY 4.0';
const gdpNote =
  'Five selected economies, 2000–2023. Current US dollars include price and exchange-rate effects; not real growth or living standards. No missing values or interpolation.';
const base = (id: string, title: string, subtitle: string, takeaway: string) => ({
  id,
  version: '1.0' as const,
  title,
  subtitle,
  takeaway,
  source: gdpSource,
  note: gdpNote,
  accessibility: { summary: `${title}. ${subtitle}. ${takeaway}` },
});
const trillions = gdp.map((row) => ({ ...row, value: row.value / 1e12 }));
const value = (id: string, year: number) => gdp.find((row) => row.id === id && row.year === year)!.value;
const share = (id: string, year: number) =>
  value(id, year) / gdp.filter((row) => row.year === year).reduce((sum, row) => sum + row.value, 0);
const dollar = (id: string, year: number) => `$${(value(id, year) / 1e12).toFixed(2)}tn`;
const pct = (number: number) => `${(number * 100).toFixed(1)}%`;

const paths = parseVisualization({
  ...base(
    'real-gdp-paths',
    'China closes much of the dollar GDP gap',
    'GDP · current US$ trillions · five selected economies',
    'The US remains largest in this selection; China moves from fourth to second.',
  ),
  type: 'time-series',
  encodings,
  data: trillions,
  yDomain: [0, 30],
  formatting: { digits: 2, unit: 'US$ tn' },
  annotations: [
    {
      id: 'baseline',
      text: `In 2000, US GDP is ${dollar('USA', 2000)} and China’s is ${dollar('CHN', 2000)}. These are dollar levels, not a shared growth index.`,
      shortText: 'Current-dollar levels; not inflation-adjusted growth.',
    },
    {
      id: 'overtake',
      entityId: 'CHN',
      text: `By 2010, China (${dollar('CHN', 2010)}) exceeds Japan (${dollar('JPN', 2010)}). The annual paths show when the ordering changes.`,
      shortText: `2010: China ${dollar('CHN', 2010)}; Japan ${dollar('JPN', 2010)}.`,
    },
    {
      id: 'gap',
      entityId: 'CHN',
      text: `China rises from ${pct(value('CHN', 2000) / value('USA', 2000))} of US dollar GDP in 2000 to ${pct(value('CHN', 2023) / value('USA', 2023))} in 2023. This is not a purchasing-power comparison.`,
      shortText: `China / US dollar GDP: ${pct(value('CHN', 2000) / value('USA', 2000))} → ${pct(value('CHN', 2023) / value('USA', 2023))}.`,
    },
  ],
});
const ranks = parseVisualization({
  ...base(
    'real-gdp-ranks',
    'Germany passes Japan in current-dollar GDP',
    'Rank among five selected economies · current US$ trillions',
    'Rank changes describe dollar size; they do not isolate production growth.',
  ),
  type: 'ranking',
  encodings,
  data: trillions,
  topN: 5,
  formatting: { digits: 2, unit: 'US$ tn' },
  annotations: [
    {
      id: 'rank-key',
      text: 'All five economies remain visible. Arrows compare rank with the preceding annual observation, not the preceding chapter. A dot means unchanged rank.',
      shortText: 'Arrows: rank change since the previous year. Dot: unchanged.',
    },
    {
      id: 'rank-change',
      entityId: 'DEU',
      text: `2023: Germany ${dollar('DEU', 2023)}, Japan ${dollar('JPN', 2023)}. Germany gains one place while Japan loses one. Exchange rates and domestic prices affect this comparison.`,
      shortText: `2023: Germany ${dollar('DEU', 2023)} passes Japan ${dollar('JPN', 2023)}.`,
    },
  ],
});
const mix = parseVisualization({
  ...base(
    'real-gdp-mix',
    'China’s share rises within this five-economy group',
    'Share of combined current-dollar GDP · selected economies only',
    'The denominator changes the question: this is a share of the selected group, not the world.',
  ),
  version: '1.1',
  type: 'stacked-area',
  encodings,
  data: trillions,
  normalize: true,
  annotations: [
    {
      id: 'denominator',
      entityId: 'CHN',
      text: `China’s share of these five economies rises from ${pct(share('CHN', 2000))} in 2000 to ${pct(share('CHN', 2023))} in 2023. The same country IDs and colors carry across each view.`,
      shortText: `China: ${pct(share('CHN', 2000))} → ${pct(share('CHN', 2023))} of this group; not world share.`,
    },
  ],
});
const eventMap = parseVisualization({
  ...base(
    'real-tohoku-map',
    'Four large events unfold off eastern Japan',
    '9–11 March 2011 · UTC · selected ComCat events M≥7',
    'The largest event is followed within 40 minutes by two more events above M7.',
  ),
  source: 'USGS ComCat · Natural Earth outline · pinned 6 September 2026 · public domain',
  note: 'All four results in 30–42°N, 135–145°E from March 9 to March 12 00:00 UTC, M≥7. Equal-size location symbols; not energy, damage or shaking extent. Earlier events remain visible. Coarse Natural Earth 1:110m coastline; no tiles.',
  type: 'event-map',
  coordinates: 'geographic',
  xDomain: [136, 146],
  yDomain: [34, 41],
  regions: japan,
  encodings: { id: 'id', label: 'label', time: 'time', x: 'longitude', y: 'latitude' },
  data: events,
  annotations: events.map((event, index) => ({
    id: `event-${index}`,
    entityId: event.id,
    text: `${new Date(event.time).toISOString().replace('T', ' ').replace('Z', ' UTC')} · M${event.magnitude.toFixed(1)} (${event.magnitudeType}) · ${event.latitude.toFixed(3)}°N, ${event.longitude.toFixed(3)}°E · depth ${event.depth} km. ${index === 0 ? 'This filtered catalog is not the full earthquake sequence.' : index === 1 ? 'This is the largest magnitude in the pinned selection.' : 'The new location is distinct from the largest event; earlier locations remain visible.'}`,
    shortText: `${new Date(event.time).toISOString().slice(5, 19).replace('T', ' ')} UTC · M${event.magnitude.toFixed(1)} · ${event.latitude.toFixed(2)}°N, ${event.longitude.toFixed(2)}°E.`,
  })),
});

export const flagshipStories: CatalogEntry[] = [
  {
    id: 'flagship-time',
    name: 'The changing GDP gap',
    group: 'Evolution',
    tag: 'REAL DATA / TIME',
    description: 'How far does China close the current-dollar gap with the United States?',
    story: timelineStory(paths, [
      {
        id: 'gdp-2000',
        chapter: '01 / ESTABLISH THE SCALE',
        time: 2000,
        title: 'The US begins far ahead',
        caption: `The US starts at ${dollar('USA', 2000)}. Japan is second; China is fourth among these five economies.`,
        annotationIds: ['baseline'],
      },
      {
        id: 'gdp-2010',
        chapter: '02 / FOLLOW THE CROSSING',
        time: 2010,
        title: 'China moves ahead of Japan',
        caption: 'Follow the highlighted path: China is now second in this group.',
        focusIds: ['CHN'],
        annotationIds: ['overtake'],
      },
      {
        id: 'gdp-2020',
        chapter: '03 / CHANGE THE FOCUS',
        time: 2020,
        title: 'The US still sets the upper bound',
        caption: `In 2020, US dollar GDP is ${dollar('USA', 2020)}; China’s is ${dollar('CHN', 2020)}. Keep the same scale.`,
        focusIds: ['USA'],
        annotationIds: ['baseline'],
      },
      {
        id: 'gdp-2023',
        chapter: '04 / READ THE DISTANCE',
        time: 2023,
        title: 'A smaller relative gap, a remaining lead',
        caption: `By 2023, China reaches ${pct(value('CHN', 2023) / value('USA', 2023))} of the US level. Price and exchange-rate effects remain part of the story.`,
        annotationIds: ['gap'],
      },
    ]),
  },
  {
    id: 'flagship-ranking',
    name: 'When the GDP order changes',
    group: 'Evolution',
    tag: 'REAL DATA / RANKING',
    description: 'Which positions change, and what can a current-dollar ranking tell us?',
    story: timelineStory(ranks, [
      {
        id: 'rank-2000',
        time: 2000,
        title: 'Japan starts second',
        caption:
          'The US leads, followed by Japan, Germany, China and India. This selection is not a complete world league table.',
        annotationIds: ['rank-key'],
      },
      {
        id: 'rank-2010',
        time: 2010,
        title: 'China takes second place',
        caption: 'China moves ahead of Japan. The bars retain country identity as their positions change.',
        annotationIds: ['rank-key'],
      },
      {
        id: 'rank-2022',
        time: 2022,
        title: 'Japan is still narrowly ahead of Germany',
        caption: `Japan: ${dollar('JPN', 2022)}. Germany: ${dollar('DEU', 2022)}. Pause here to see the remaining gap.`,
        annotationIds: ['rank-key'],
      },
      {
        id: 'rank-2023',
        time: 2023,
        title: 'Germany gains one place',
        caption:
          'Germany passes Japan in 2023. A dollar ranking alone cannot explain the drivers of the change.',
        annotationIds: ['rank-change', 'rank-key'],
      },
    ]),
  },
  {
    id: 'flagship-events',
    name: 'Tohoku, event by event',
    group: 'Geography',
    tag: 'REAL DATA / EVENTS',
    description: 'Where and when do the four selected large earthquakes occur?',
    story: timelineStory(
      eventMap,
      events.map((event, index) => ({
        id: `tohoku-${index}`,
        time: event.time,
        chapter: `${new Date(event.time).toISOString().slice(0, 10)} / UTC`,
        title: [
          '9 March: a M7.3 event',
          '11 March, 05:46: the M9.1 event',
          '29 minutes later: M7.9 to the south',
          '40 minutes after M9.1: M7.7 farther east',
        ][index],
        caption: [
          'Begin with the first event in this filtered snapshot. Each marker is a location, not a shaking footprint.',
          'The largest event appears near the earlier location. Focus follows the new event while the first remains in place.',
          'The next selected event is farther south. The timestamp advances; the geography stays fixed.',
          'All four locations remain visible. This magnitude-filtered view omits the many smaller events.',
        ][index],
        focusIds: [event.id],
        annotationIds: [`event-${index}`],
      })),
    ),
  },
  {
    id: 'flagship-cross',
    name: 'One GDP dataset, three questions',
    group: 'Composition',
    tag: 'REAL DATA / SHARED WORKBENCH',
    description: 'Trace the data to the KPI, then compare paths, positions and shares.',
    story: chapterStory(
      {
        id: 'real-gdp-editorial',
        title: 'Size, order and share tell different stories',
        description:
          'Follow a pinned dataset from source to KPI. Compare the same five economies through three analytical lenses.',
      },
      [
        {
          visual: paths,
          scene: {
            id: 'cross-path',
            chapter: '01 / SIZE',
            title: 'How large is the gap?',
            caption: `The annual paths put 2023 in context: US ${dollar('USA', 2023)}, China ${dollar('CHN', 2023)}.`,
            state: { time: 2023 },
            annotationIds: ['gap'],
          },
        },
        {
          visual: ranks,
          scene: {
            id: 'cross-order',
            chapter: '02 / ORDER',
            title: 'Who stands where?',
            caption:
              'The same countries become bars. Germany’s third place is easier to read; the journey is no longer visible.',
            state: { time: 2023 },
            annotationIds: ['rank-change'],
          },
        },
        {
          visual: mix,
          scene: {
            id: 'cross-share-start',
            chapter: '03 / DENOMINATOR',
            title: 'Start with the group’s 2000 mix',
            caption: `China accounts for ${pct(share('CHN', 2000))} of the combined GDP of these five economies. Every band uses the same denominator.`,
            state: { time: 2000 },
            annotationIds: ['denominator'],
          },
        },
        {
          visual: mix,
          scene: {
            id: 'cross-share-end',
            chapter: '04 / SHARE',
            title: 'China occupies a larger part of the group',
            caption: `Its share reaches ${pct(share('CHN', 2023))} in 2023. A rising share and second place can both be true.`,
            state: { time: 2023 },
            annotationIds: ['denominator'],
          },
        },
      ],
    ),
  },
];
