# VizForge V1.2 release report

This product-quality pass adds **four reusable real-data editorial stories** while preserving all **15 visual families and 22 original canonical examples**. No chart family or host-specific geometry was added.

## Exact boundaries

- Branch starts at merged VizForge `main` **423e7ecaedbe4f922665938eb013f6bf1bd11e7b** in `julian-passebecq/Fluent2_J_Viz`.
- Datapass is pinned to **30e69639bfc3929c348fd8f9c6c38a2cb61984d8**. The unmodified official bootstrap selects 107 immutable files; verification runs before and after the release gate.
- The original V1/V1.1 JSON examples and schema versions remain. Package version is 1.2.0; no forced StorySpec migration.

## Editorial collection

| Story                            | Question and deliberate progression                                                                                              | Reuse                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| The changing GDP gap             | Establish dollar levels → China passes Japan → focus on the US → quantify the remaining relative gap.                            | Existing time-series renderer, fixed scale, moving focus, direct country labels.                                        |
| When the GDP order changes       | Japan begins second → China takes second → Japan remains ahead of Germany in 2022 → Germany moves third in 2023.                 | Existing keyed ranking; annual rank-change arrows and readable paused bars.                                             |
| Tohoku, event by event           | March 9 event → March 11 M9.1 → M7.9 farther south → M7.7 farther east.                                                          | Existing cumulative event map, exact UTC steps, real coarse coastline, fixed geography and equal-size location symbols. |
| One GDP dataset, three questions | Explain source-to-KPI lineage → compare dollar paths → inspect rank → compare shares using an explicit five-economy denominator. | Existing line → ranking → normalized stacked-area, consistent ISO3 identities and colors.                               |

Open **Visual catalog** for the flagship collection. Direct reproducible entry points are `/?story=flagship-time`, `/?story=flagship-ranking`, `/?story=flagship-events` and `/?story=flagship-cross`. Canonical JSON lives in `examples/flagship-*.json`; pure authoring is in `src/examples/flagships.ts` using the existing timeline/chapter helpers.

Every story has a question, evidence-based captions, message-first scene titles, focus annotations, source/note and meaningful manual progression. Playback starts paused. Phone annotations support optional `shortText`, with full text available through disclosure and retained in SVG descriptions. The event map uses local graticule spacing and only labels the focused event when locations crowd together.

## Data and shared workbench

Two small numerical datasets (World Bank GDP and USGS events) plus a Natural Earth Japan outline are committed with raw sources, reproducible transformations, license notes and SHA-256 manifests. The gate recomputes transformations offline and rejects drift. GDP share is explicitly of the selected group; dollar values are not described as real growth. See `DATA_PROVENANCE.md`.

The cross-family page embeds the accepted canonical Datapass medallion lineage, adapted as consumer content to the actual GDP transformation recipe: Source → Bronze → Silver → Gold → semantic model → KPI. A static FigureView uses its own default registry. The adjacent analytical section has one FigurePlayer and the independent `vizforge.d3` adapter. No Datapass lineage renderer is reproduced in VizForge; no D3 geometry enters ConceptMotion. Narrow screens use a labeled, keyboard-focusable horizontal viewport to preserve lineage text size.

## Release evidence

The required release sequence is `pnpm release:gate`: frozen install, typecheck, specs and provenance, all unit tests, production/library builds and bundle audits, independent packed React 18.3.1 proof, then production browser tests at 1440px and 390px with React 19.2.8. Tests include all flagship scenes, no network acquisition, no autoplay, reduced motion, keyboard control, SVG source/note, fixed event identity, actual intermediate D3 geometry and the pre-existing color-interpolation checks. The shared page additionally proves the technical SVG remains unchanged when the analytical timeline moves.

Per-scene screenshots, accessibility/overflow results, bundle audit and browser reports are retained locally and in the workflow artifact. `QA_REPORT.md` records completed local results. The workflow writes `docs/qa/hosted-release.json` with exact tested SHA, framework pin, run ID and result. Delivery requires green **push CI at the exact PR head** before merge, followed by green push CI at merged `main`; final handoff links those runs. A pull-request synthetic merge check alone is insufficient.

## Deferred and limitations

No Power BI packaging/DataView adapter, selection manager, formatting model, certification, article ingestion, LLM/function calling or scrollytelling CMS. Future rule remains `Power BI DataView → adapter → canonical VizForge spec → SAME D3 renderer → SVG`.

Native Datapass cadence and lazy Monaco size are unchanged. The newly observed lineage minimum-width/phone scaling limitation is documented with its exact reproduction in `FRAMEWORK_GAPS.md`; the framework is not patched. Cross-family changes preserve semantic identity and colors, while geometry-specific DOM groups intentionally change with visual IDs. Within each visual, keyed D3 nodes persist across updates.
