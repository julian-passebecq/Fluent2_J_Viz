# VizForge visual catalog — V1.1

**15 reusable families; 22 canonical visual/story examples.** All data and region geometry are synthetic, with source/note metadata and SHA-256 provenance in `docs/DATA_PROVENANCE.json`. Every example is available in the real Datapass Studio and uses the same D3 renderer as the standalone host.

| Family                       | Canonical story                 | Analytical use                                                                |
| ---------------------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| Time evolution               | `examples/time-series.json`     | Multi-series trajectories, optional area, fixed domains, comparison baseline  |
| Animated ranking             | `examples/ranking.json`         | Stable bars, changing order, prior-period rank deltas                         |
| Scatter/bubble               | `examples/scatter.json`         | Movement across two measures; circle area encodes size                        |
| Dumbbell                     | `examples/dumbbell.json`        | Paired states and absolute change                                             |
| KPI contribution             | `examples/contribution.json`    | Signed additive bridge, current/comparison/target and sparkline               |
| Sankey/flow                  | `examples/flow.json`            | Weighted acyclic allocation with stable nodes/links                           |
| Forecast/uncertainty         | `examples/forecast.json`        | Solid observed line, dashed projection and explicit interval                  |
| Event map                    | `examples/event-map.json`       | Cumulative event sequence, schematic or geographic symbols                    |
| Analytical table             | `examples/table.json`           | Exact values, sort, subtotal, data bars, variance, status, trend              |
| Analytical matrix            | `examples/matrix.json`          | Hierarchies, leaf aggregation and totals without double counting              |
| **Bump/rank trajectories**   | `examples/bump.json`            | Complete rank history, deterministic ties, direct endpoint labels             |
| **Histogram/distribution**   | `examples/histogram.json`       | Fixed bins/domains, counts or probability, median and sample conservation     |
| **Small multiples**          | `examples/small-multiples.json` | One panel per entity; shared x/y scales; one column on phones                 |
| **Stacked area/composition** | `examples/stacked-area.json`    | Absolute contributions or 100% shares; stable stacking and direct labels      |
| **Choropleth**               | `examples/choropleth.json`      | GeoJSON Polygon/MultiPolygon, holes, fixed color scale, explicit missing data |

The original ten examples and `examples/editorial.json` retain V1 contracts and data. Editorial sequences line → ranking → KPI; its commercial KPI is explicitly an independent demonstration.

## Domain story packs

| Pack                 | Files / reusable pattern                            | Editorial question                                                   |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| Market paths         | `pack-markets.json` · time comparison               | Does the highest finish conceal a larger drawdown?                   |
| GDP recovery         | `pack-gdp.json` · small multiples                   | Is the fastest rebound also the highest final index?                 |
| Processor efficiency | `pack-processors.json` · bubble evolution           | Can performance rise while energy per fixed task falls?              |
| AI energy demand     | `pack-ai-energy.json` · stacked area → contribution | Which workload explains the increase, and do both views reconcile?   |
| Earthquake sequence  | `pack-earthquakes.json` · geographic event timeline | How does the cluster evolve while earlier events remain visible?     |
| Franchise rise       | `pack-franchises.json` · bump → ranking → line      | When did the challenger cross over, and how large is the final lead? |

Pack JSON files live under `examples/`. None contains observed financial, GDP, processor or earthquake statistics. Geographic coordinates in the event pack are illustrative synthetic epicenters; circle area shows an impact index, not seismic magnitude. The new choropleth shapes are fictional and demonstrate holes, multipart islands and a missing region.

## Reuse

`timelineStory` authors absolute beats for time comparison, rank evolution, bubble evolution and event/distribution/map sequences. `chapterStory` composes the same validated visual specs into chapters and rejects conflicting reused visual IDs. Both live in the engine's pure core and return ordinary StorySpec objects; neither owns playback.

Authoring modules are `src/examples/v1.ts`, `gallery.ts` and `packs/`. Regenerate JSON/provenance with `pnpm examples:export` and verify with `pnpm validate`. Every family and pack has desktop/390px screenshots and per-scene Axe evidence; numerical transition/identity tests run separately from screenshots.
