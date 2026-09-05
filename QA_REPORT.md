# QA report

Baseline hosted V1 CI `33989227514` succeeded on `3a5bd0b7bdfb987a18f2e9154b43fc92756120b8`; accepted Datapass CI `33988679372` succeeded on `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55`. Both were verified through GitHub API in this pass.

The real Datapass integration checkpoint passes spec validation, 87 unit tests, typecheck, production/library build, a frozen pnpm install, 32 desktop/390px browser tests and exact source verification (91 files). Every scene in all ten V1 families was checked, with serious/critical Axe = 0 and page overflow = 0. Fluent's established `[data-tabster-dummy]` sentinel exclusion is the only Axe exclusion.

Production evidence in `docs/qa/` includes screenshots, per-scene Axe reports and `bundle-audit.json`. Browser tests cover stable D3 bar identity and measured transition midpoint, interrupted transition/reset, no autoplay, real FigurePlayer keyboard/slider controls, preference changes stopping autoplay, valid/invalid lazy JsonSpecEditor editing, custom SVG download, catalog, cross-family stories and standalone hosting. Source-map analysis proves the Studio ships one React 19.2.8 runtime and Datapass playback, with no VizForge StoryPlayer in the hosted entry graph.

The full local release gate is green. Hosted clean-checkout identity and successful-gate evidence are generated as `docs/qa/hosted-release.json` in the CI artifact; the exact pushed run and conclusion accompany the final handoff.

## Refactor and expansion

The refactor checkpoint `34940b2` passed the official release gate and 100 exact SVG-layout comparisons with V1 across four widths. The final expanded release passed all 127 unit tests and all 66 production desktop/phone browser tests through the complete official gate, including the same-reference registry-validation regression. All 91 framework files were unchanged at the end of the gate.

The gallery contains 15 families and 22 canonical examples, with six complete domain compositions. All data/geometry are synthetic; SHA-256 provenance is checked. New tests cover complete grids, sample conservation, histogram boundary inclusion, shared panel scales, normalized totals, integer ranks, holes/multipart/winding, missing-versus-zero map values and cross-family reconciliation. Browser checks measure actual new-family motion and choropleth color transitions while preserving keyed DOM identity.

The private packed engine was independently installed with React 18.3.1 and passed mounting, stepping, reduced motion and unmount cleanup. Datapass is a Studio development dependency, so this proof uses no framework source in the packed runtime. The React 19.2.8 Studio still emits one React implementation.

The five new chart families were also visually inspected at 390px. Hosted artifacts retain the complete browser reports, screenshots, per-scene Axe results and exact release identity.
