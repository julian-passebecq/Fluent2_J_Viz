# VizForge V1 visual catalog

Every family has a canonical JSON story, renderer tests, synthetic source/note metadata, annotations, reduced-motion checks and desktop/390px production proof. Examples intentionally avoid claims about real countries, companies, flood events or forecasts.

| Family                      | Canonical story              | Narrative and implementation                                                                                                                                                    |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multi-series time evolution | `examples/time-series.json`  | Solar moves from smallest to largest; line/area, global scale, comparison baseline, moving focus, direct labels.                                                                |
| Animated ranking / bar race | `examples/ranking.json`      | Coastal regions overtake early leaders; keyed bars, stable colors, ranks and prior-period rank deltas.                                                                          |
| Scatter / bubble evolution  | `examples/scatter.json`      | Fictional cities gain income and lower emissions; two dimensions, area-based population size and stable entity/category colors.                                                 |
| Dumbbell                    | `examples/dumbbell.json`     | Transit access improves unevenly; hollow before/filled after symbols, connector, numeric delta and focused comparison.                                                          |
| KPI contribution            | `examples/contribution.json` | Baseline + new + expansion − churn − FX = current KPI; signed waterfall, current/comparison/target/status and sparkline.                                                        |
| Sankey / flow               | `examples/flow.json`         | Follow energy from sources to uses; proper magnitude-weighted DAG layout, focus on nodes and connected bands, no ambient animation.                                             |
| Forecast + uncertainty      | `examples/forecast.json`     | Demand moves from historical observations to an uncertain scenario; solid/dashed distinction, interval band, widening uncertainty and readable final state.                     |
| Event / map                 | `examples/event-map.json`    | Fictional flood events move through a delta over three days; schematic geography, cumulative reveal, stable symbols and focus. Geographic longitude/latitude is also supported. |
| Analytical table            | `examples/table.json`        | Portfolio revenue, variance, status and trend; typed alignment, explicit sort, data bars, sparkline, group subtotals and grand total.                                           |
| Analytical matrix           | `examples/matrix.json`       | Regional teams across quarters; row/column hierarchies, leaf aggregation, subtotals, grand totals and conditional magnitude. Multiple measures are supported.                   |

`examples/editorial.json` sequences line → ranking → KPI under one chapter/scene wrapper. This establishes the reusable editorial composition boundary without adding an article CMS or scroll-driven playback. The last commercial KPI is explicitly an independent demonstration, not a causal claim about the preceding energy examples.

## Selecting a family

Use line evolution for trajectories, ranking for order, bubble evolution for movement across measures, dumbbell for a small number of paired states, contribution for an additive KPI bridge, flow for allocation, forecast for uncertainty, and map stories when location is essential. Use tables and matrices when exact values and aggregation are the primary task. This is the V1 catalog; adding new families means extending the discriminated contract, layout, canonical example and tests together.

## Reuse and evidence

The same JSON loads in the studio editor, DOM renderer, React adapter and later host adapter. Example authoring source is `src/examples/index.ts`; regenerate checked-in JSON with `npm run examples:export`, then validate it with `npm run validate`.

Proof images follow `docs/qa/desktop-<family>.png` and `docs/qa/phone-<family>.png`. Tests measure real bar interpolation and keyed DOM identity separately from screenshots. See `QA_REPORT.md` for actual results and the deferred integration gate.
