# VizForge spec reference — 1.0 and 1.1

The executable source of truth is `src/core/spec.ts`, with common grammar in `grammar.ts` and additive V1.1 families in `extensions.ts`. Canonical fully defaulted JSON examples live in `examples/`. Unknown properties are rejected on contract objects. Data rows allow additional data fields. Parsing clones and normalizes the input; renderers do not mutate canonical data. Strings are rendered with text APIs, not injected HTML.

## Common visualization metadata

Required: `id`, `version` (original families: `"1.0"`; new families: `"1.1"`), `type`, `title`, `takeaway`, `source`, `note`, `accessibility: {summary}`. `subtitle` is optional. IDs are nonempty strings, at most 160 characters.

Optional: `theme`, `formatting`, `annotations`, `animation`.

```json
{
  "formatting": { "style": "currency", "currency": "USD", "digits": 0, "unit": "m" },
  "annotations": [{ "id": "turn", "text": "Growth accelerates here.", "entityId": "solar" }],
  "animation": { "durationMs": 650 }
}
```

Formatting styles: `number`, `currency`, `percent`. Percent uses ratios (`0.12` → `12%`); digits range from 0 to 6. `unit` appends a literal suffix. Locale is deterministic `en-US` in V1. Chart axes compact values; exact values remain in accessible descriptions and canonical data. Theme roles are `ink`, `muted`, `grid`, `background`, `palette`; colors are six-digit hex. The host is responsible for checking contrast after changing the theme.

## Family contracts

| Type           | Encodings and additional data                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ranking`      | `data`; encodings `id,label,time,value`; optional `topN` (default 8, max 30). Values are nonnegative.                                                                       |
| `time-series`  | `id,label,time,value`; optional `area`, `comparisonBaseline`, `xDomain`, `yDomain`.                                                                                         |
| `scatter`      | `id,label,time,x,y`; optional `size,category`; `xLabel,yLabel`; optional axis domains. Bubble area encodes size.                                                            |
| `dumbbell`     | `id,label,start,end`; optional `group`; `startLabel,endLabel`. Full start/end values and differences are retained.                                                          |
| `contribution` | `id,label,value`; `baseline`; `kpi: {label,comparison,target,direction,sparkline?}`. Values are additive signed deltas, not final levels.                                   |
| `flow`         | `nodes: [{id,label}]`; `links: [{id,source,target,value}]`. Positive values, known endpoints, unique IDs, no cycles or isolated nodes.                                      |
| `forecast`     | `id,label,time,value,lower,upper,forecast`; `forecast` maps to a boolean field; `intervalLabel`; optional domains. Every lower/upper pair contains its central value.       |
| `event-map`    | `id,label,time,x,y`; optional `size`; `coordinates` is `schematic` or `geographic`; optional regions with `id,label,points`; geographic coordinates are longitude/latitude. |
| `table`        | `rowId`, `data`, `columns`, optional `sort`, `groupBy`, `totalLabel`.                                                                                                       |
| `matrix`       | `rows`, `columns`, `measures`, `data`, optional `grandTotals`.                                                                                                              |

Encodings name fields in each data record. Identity is not an array index, rank, label, position or time. Temporal records are unique by `(id,time)`; nontemporal records by `id`. Temporal snapshots select each entity’s latest observation at or before the scene time; absent observations are carried forward. Line/forecast scenes reveal all observations through that time. Map events appear cumulatively, with repeated IDs updating one entity. Color assignment uses the sorted full set of entity IDs, not the current rank; scatter category colors use the sorted full set of categories.

Domains use the entire canonical dataset for consistency across time. Explicit domains must be finite and increasing. A flat domain is expanded deterministically. A static renderer without a scene shows the final state.

## StorySpec and scenes

```json
{
  "id": "comparison-story",
  "version": "1.0",
  "title": "An analytical narrative",
  "description": "The point of this sequence.",
  "reducedMotion": "instant",
  "intervalMs": 4000,
  "visuals": ["REPLACE WITH COMPLETE VISUALIZATION SPECS"],
  "scenes": [
    {
      "id": "opening",
      "visualId": "energy-lines",
      "chapter": "The starting point",
      "title": "An uneven starting line",
      "caption": "A complete readable narrative for this state.",
      "state": { "time": 2016 },
      "focusIds": ["solar"],
      "annotationIds": ["turn"],
      "transition": { "intent": "morph-update", "durationMs": 650 }
    }
  ]
}
```

The skeleton above illustrates structure; use a complete `examples/*.json` file as runnable input. Visual and scene IDs must be unique. Scene visual IDs, focus targets and annotation IDs must exist. `chapter` is optional. Every scene is an absolute state, not a patch applied to the preceding scene: seeking and previous reproduce the same endpoint regardless of path.

`state.time` must be within the visual’s timeline. `state.revealCount` reveals the first N contribution or dumbbell records; larger values clamp to available records. An omitted state means the complete final figure. Focus IDs dim other entities; flow node focus includes connected bands. No focus means full context. Scene annotation IDs explicitly select annotations; an empty list hides them. Static figures show all annotations.

Transition intents: `morph-update` (keyed data changes), `focus-reveal` (attention), `scene` (context-preserving frame with incoming figure fade). Durations are 0–2000 ms. Playback dwell is 2500–30000 ms, always longer than a transition. The story defaults to 4000 ms. No autoplay field exists; only an explicit `play()` starts the clock. In reduced motion the same sequence remains available but interpolation is zero-duration.

## TableSpec

Columns contain `key,label,type,format,dataBar,total`. Types: `text`, `number`, `variance`, `status`, `sparkline`. The first column is a text row heading and cannot be aggregated. Status values are `positive`, `negative`, `neutral`, rendered with words and symbols as well as color. Sparklines contain at least two finite numbers. Numeric columns may use magnitude bars and `total: "sum" | "mean" | "none"` (default none). Rates are never aggregated implicitly.

`sort: {key,direction}` controls the analytical presentation; ties use row IDs. Canonical data order is not changed. `groupBy` names a text field and adds group subtotals using the same explicit column aggregation rules; a grand total remains separate. Group presentation follows the sorted order of the first member, and members retain the specified sort. This is an analytical component, not an editable administrative grid.

## MatrixSpec

Rows and columns use `{id,label,parentId?}` hierarchies. Parent IDs must exist and cannot form cycles. `measures` contain `{key,label,aggregate,format,dataBar?}`. Aggregation is explicitly `sum` or `mean`; means are unweighted means of available leaf observations. Weighted ratios should be prepared upstream or added as a future explicit measure operation.

Cells use `{rowId,columnId,values:{measureKey:number}}`, referencing leaf nodes only. Each pair is unique and must contain every declared measure. Sparse absent cells display `—`; real zeros display zero. Parent subtotals and grand totals are computed from underlying leaves once, never by summing displayed totals. Full column paths retain hierarchy meaning. Column groups and measures are expanded into labeled columns inside a keyboard-accessible horizontal region.

## Runtime APIs

- `parseVisualization(unknown)` / `parseStory(unknown)`: normalized, validated canonical objects or an error.
- `createRenderer(host)`: `{update(spec,scene?,options?),settle(),destroy(),element}`. Options: width, reducedMotion, animate. Initial mount is static. Cleanup interrupts all D3 transitions and disconnects resize/media listeners.
- `new StoryPlayer(story,reducedMotion?,scheduler?)`: `getState`, `getScene`, `subscribe`, `play`, `pause`, `previous`, `next`, `reset`, `seek`, `setReducedMotion`, `dispose`.
- `mountFigure(host,{rendererId:"vizforge.d3",spec})`: a VizForge-owned host seam, not a claim of Datapass ABI compatibility.
- React subpath: `Figure`, `StoryView`, `PlaybackControls`, `useStoryPlayer`, `useReducedMotion`, `playbackKeyboard`.

The player state includes index, playing, reducedMotion, reason and revision. Snapshots keep identity until an action. Injecting a scheduler permits deterministic clock tests. Disposal clears the clock and subscriptions; a disposed player cannot resume.

## Additive V1.1 contracts

The ten original visual types still require version `1.0` and preserve their previous schema and renderer behavior. The five new types require version `1.1`. StorySpec accepts either version; a story containing any V1.1 visual must itself use `1.1`. A V1.1 story may compose both old and new visual versions. No implicit migration changes existing JSON.

All new families use `data` rows and `encodings: {id,label,time,value}`. Values and time are finite numeric fields. Entity IDs remain independent of position, rank and time. Common metadata, theme, annotations, motion and formatting rules apply unchanged.

| Type              | Options and semantic rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bump`            | `order`: `descending` (default) or `ascending`; at most 15 entities. Requires a complete entity/time grid. Ranks are ordinal; ties sort by stable ID. Trajectories reveal all periods through the selected time.                                                                                                                                                                                                                                                                                                                                   |
| `histogram`       | `binCount`: 3–30, default 8; `normalization`: `count` (default) or `probability`; optional `xDomain` must contain every observation. Bins are equal-width and fixed across scenes; the maximum value is included in the final bin. Each scene samples the latest observation of each ID through that time. The y scale spans all snapshots. Probability is a fraction of the current sample, not density per unit width. Focus IDs highlight bins containing those observations.                                                                   |
| `small-multiples` | `columns`: 1–4, default 2; optional `xDomain`,`yDomain`. At most 12 entities, one shared-scale panel per entity. Panel order is stable by ID. Phones use one column without changing domains.                                                                                                                                                                                                                                                                                                                                                      |
| `stacked-area`    | `normalize`: false by default; true yields 100% composition. Values must be nonnegative; the entity/time grid must be complete, with at most 10 series. Normalized totals must be positive at every time. Missing cells must be explicitly resolved by the author, never silently treated as zero. An endpoint slice keeps the first scene readable.                                                                                                                                                                                               |
| `choropleth`      | `regions: [{id,label,geometry}]`, with GeoJSON `Polygon` or `MultiPolygon`; optional `valueDomain` spans all scenes and must contain every value. Coordinates are longitude/latitude; rings are closed, finite and nondegenerate. Holes and both winding conventions are supported for regions smaller than a hemisphere. Data IDs must match a region. Regions with no observation at the current time remain gray and labeled No data; zero remains a measured value. Equal Earth projection and one stable color scale are shared across steps. |

Choropleth geometry is bounded to 250 regions, 50 polygons per multipart region, 20 rings per polygon and 2,000 positions per ring. This is not a geometry-repair API. Direct labels appear where the region is wide enough; complete labels and values remain in the accessible figure description and underlying data.

## Reusable editorial authoring

```ts
import { timelineStory, chapterStory } from '@vizforge/engine';
const story = timelineStory(temporalVisual, [
  {
    id: 'start',
    time: 2018,
    title: 'Set the baseline',
    caption: 'A complete opening.',
    annotationIds: ['baseline'],
  },
  { id: 'finish', time: 2024, title: 'Show the change', caption: 'A complete conclusion.' },
]);
const chapters = chapterStory(
  { id: 'explainer', title: 'One question, two views', description: 'An explicit analytical connection.' },
  [
    {
      visual: lineVisual,
      scene: { id: 'trend', title: 'See the trajectory', caption: 'Explain its shape.' },
    },
    {
      visual: rankingVisual,
      scene: { id: 'rank', title: 'Compare the endpoint', caption: 'Explain the order.' },
    },
  ],
);
```

These helpers return validated ordinary StorySpecs with absolute scenes and an inferred compatible version. A reused visual ID must refer to the same complete spec. `timelineStory` supports temporal visuals only. No authoring helper owns a timer.

Inside Datapass, FigurePlayer provides `frameIndex`, captions and `reducedMotion`. Its accepted native cadence is 1200 ms divided by playback speed; the standalone `intervalMs` setting is not reimplemented as a hidden hosted clock. The custom SVG export settles the active renderer; SVG descriptions retain source, note and selected annotations.
