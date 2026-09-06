# QA report

## V1.2 checkpoint — pushed at user request before usage exhaustion

Implemented four real-data flagships, provenance/hash verification, canonical Datapass lineage coexistence, phone annotations and geographic context. Exact start: `423e7ecaedbe4f922665938eb013f6bf1bd11e7b`; exact Datapass pin: `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`, 107 unmodified files. All 22 original canonical fixture hashes match the baseline.

Verified locally: frozen install, spec/provenance validation, 137 unit tests, production/library build, independent packed React 18 mount/step/reduced-motion/unmount, and the initial 14 flagship production browser checks at desktop/390px. Those flagship checks had zero serious/critical Axe findings, zero page overflow, no external requests and no page errors. The broader 80-test release run is recorded in `.local/v1.2-release-gate.log`.

Final review then corrected the React 18 evidence report's hardcoded version, made phone annotation priority follow scene order (one additional unit regression), labeled the main Japan polygon, refined the four-card layout, and added keyboard verification for the lineage scrolling viewport. **The final candidate still requires the complete release gate on its exact SHA.** Existing screenshot/evidence files precede those last refinements and must not be represented as exact final-SHA proof.

Resume by inspecting the PR's exact-head push CI. Fix any failures, run `pnpm release:gate`, and require successful push CI on the exact delivered branch SHA before merging. After merge, verify `main` push CI and its `hosted-release.json` artifact. The user requested an immediate push to preserve work with only 1% usage remaining; this checkpoint is not a completed release or merge approval bypass.

## Historical V1/V1.1 evidence

Baseline hosted V1 CI `33989227514` succeeded on `3a5bd0b7bdfb987a18f2e9154b43fc92756120b8`; accepted Datapass CI `33988679372` succeeded on `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55`. Both were verified through GitHub API in this pass.

The real Datapass integration checkpoint passes spec validation, 87 unit tests, typecheck, production/library build, a frozen pnpm install, 32 desktop/390px browser tests and exact source verification (91 files). Every scene in all ten V1 families was checked, with serious/critical Axe = 0 and page overflow = 0. Fluent's established `[data-tabster-dummy]` sentinel exclusion is the only Axe exclusion.

Production evidence in `docs/qa/` includes screenshots, per-scene Axe reports and `bundle-audit.json`. Browser tests cover stable D3 bar identity and measured transition midpoint, interrupted transition/reset, no autoplay, real FigurePlayer keyboard/slider controls, preference changes stopping autoplay, valid/invalid lazy JsonSpecEditor editing, custom SVG download, catalog, cross-family stories and standalone hosting. Source-map analysis proves the Studio ships one React 19.2.8 runtime and Datapass playback, with no VizForge StoryPlayer in the hosted entry graph.

The full local release gate is green. Hosted clean-checkout identity and successful-gate evidence are generated as `docs/qa/hosted-release.json` in the CI artifact; the exact pushed run and conclusion accompany the final handoff.

## Refactor and expansion

The refactor checkpoint `34940b2` passed the official release gate and 100 exact SVG-layout comparisons with V1 across four widths. The final expanded release passed all 127 unit tests and all 66 production desktop/phone browser tests through the complete official gate, including the same-reference registry-validation regression. All 91 framework files were unchanged at the end of the gate.

The gallery contains 15 families and 22 canonical examples, with six complete domain compositions. All data/geometry are synthetic; SHA-256 provenance is checked. New tests cover complete grids, sample conservation, histogram boundary inclusion, shared panel scales, normalized totals, integer ranks, holes/multipart/winding, missing-versus-zero map values and cross-family reconciliation. Browser checks measure actual new-family motion and choropleth color transitions while preserving keyed DOM identity.

The private packed engine was independently installed with React 18.3.1 and passed mounting, stepping, reduced motion and unmount cleanup. Datapass is a Studio development dependency, so this proof uses no framework source in the packed runtime. The React 19.2.8 Studio still emits one React implementation.

The five new chart families were also visually inspected at 390px. Hosted artifacts retain the complete browser reports, screenshots, per-scene Axe results and exact release identity.
