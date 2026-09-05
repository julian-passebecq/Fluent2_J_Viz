# VizForge V1.1 release report

The ordered pass integrates the accepted Datapass framework, refactors the existing V1 engine/Studio and expands the catalog to **15 visual families and 22 canonical visual/story examples**. It does not rebuild V1.

## Baselines and phase evidence

| Boundary                    | Evidence                                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact clean VizForge start  | `3a5bd0b7bdfb987a18f2e9154b43fc92756120b8`; hosted run `33989227514`, success, independently verified                                                                            |
| Exact accepted Datapass pin | `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55`; hosted run `33988679372`, success, independently verified                                                                            |
| Integration checkpoint      | `8ffb1f4`; 87 unit tests, 32 production browser tests, immutable vendor and bundle audits                                                                                        |
| Refactor checkpoint         | `34940b2`; official release gate passed, 100 exact V1 SVG-layout comparisons, all 32 production browser tests                                                                    |
| Expanded candidate          | Complete official local gate passed: 127 unit tests, 66 production browser tests, packed React 18 proof, production/privacy/runtime audit, 91 immutable framework files          |
| Hosted delivery revision    | The hosted workflow records its exact SHA, framework pin, run ID and successful gate in the artifact `docs/qa/hosted-release.json`; the final handoff reports the run conclusion |

## Integration and packaging

The official disposable external learning starter supplied unmodified bootstrap/release tools. Bootstrap selects 91 immutable files at the pinned commit, excluding canonical learning data and historical apps. The only direct Datapass packages are UI, content, figure and code. They are Studio development dependencies; the standalone engine runtime remains D3, d3-sankey and Zod. One consumer pnpm lock is committed; there is no competing npm lock.

The release toolchain is Node 24.19.0 / pnpm 11.19.0. Studio and tests use React/ReactDOM 19.2.8 with aligned types and Vite deduplication. Public React peers are `>=18.3 <20`; a separate packed consumer proves React 18.3.1 mount, manual step, reduced motion and teardown. Production source-map analysis requires one React core and one ReactDOM client across the complete Studio graph, including lazy chunks.

The real `vizforge.d3` registry entry validates canonical payloads and renders the selected absolute scene. Datapass FigurePlayer is the sole hosted playback controller. AppShell, CatalogShell/SearchFilterBar, Workbench and InspectorPanel supply Fluent surfaces. JsonSpecEditor loads local Monaco lazily. The consumer exportAction settles and serializes the real VizForge SVG. Source/note remain in SVG descriptions and JSON.

## APIs, grammar and gallery

Renderer public signatures are unchanged. The engine remains independent from host frameworks, and all ten V1 families and eleven original JSON examples are preserved. Layout is split by family, shared axes/scales, keyed joins, SVG assembly and data accessibility; Studio concerns and styles are separate modules.

New families are bump/rank trajectories, histogram/distribution, shared-scale small multiples, stacked/normalized area and GeoJSON choropleth. They require visual version `1.1`; StorySpec `1.1` composes old and new versions. Existing `1.0` contracts remain valid. `timelineStory` and `chapterStory` are additive pure authoring helpers; neither introduces a playback controller.

Six domain packs cover stock-market indices, GDP recovery, processor/task-energy evolution, AI workload energy, earthquake/event geography and category/franchise ranking. Every supplied value and map shape is synthetic. Canonical fixture hashes and source strings are recorded in `docs/DATA_PROVENANCE.json`; validation rejects drift. The AI energy chapters reconcile the same data from stacked totals to an additive bridge.

## Release checks

The complete release gate verifies the source pin before and after execution, installs frozen, typechecks, validates all specs/provenance, runs unit tests, builds production and typed ESM outputs, scans textual artifacts/source maps for private repository URLs and local path leakage, audits React/playback ownership, tests the packed React 18 consumer, and runs the real production preview at 1440px and 390px.

Browser coverage includes all scenes in all families/packs, keyboard and slider playback, no autoplay, native playback reset on story changes, OS reduced-motion changes, lazy valid/invalid editing, SVG export, standalone hosting, actual geometry/color midpoints and stable DOM identity. Serious/critical Axe findings must be zero, page overflow at most 1px and page errors zero. Only Fluent's established hidden Tabster sentinels are excluded from Axe. Full-page/figure images, Axe JSON and runtime audit reports are retained in `docs/qa/` and hosted artifacts.

## Deferred

AI/function calling, a full scrollytelling CMS and Power BI packaging are untouched. The future invariant is `Power BI DataView -> adapter -> canonical VizForge spec -> SAME D3 renderer -> SVG`, beginning with KPI contribution, animated ranking and time evolution. No alternate host geometry, DataView adapter, `.pbiviz`, selection manager or formatting model was added.

Intentional current limits include fixed native Datapass playback cadence, a large lazy Monaco chunk, bounded synthetic maps without repair/tiles/insets, complete grids for rank/composition, shared-scale panels only and JSON-only analytical table/matrix export. These are documented in `FRAMEWORK_GAPS.md`.
