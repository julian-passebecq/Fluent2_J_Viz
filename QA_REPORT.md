# QA report

## V1.2 release finalization

Checkpoint `ddcb9d6067a70db2a4b03c566039f7c169789308` was audited against hosted PR run `34000531270`. The exact checkpoint passed Datapass bootstrap (107 immutable files at `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`), frozen install, typecheck, provenance/spec validation, 138 unit tests, production/library build, bundle audit, the independent packed React 18 proof, and 79 of 80 production browser tests.

The sole hosted failure was the 390px `flagship-time` intermediate-motion proof. Trace evidence showed this was a real phone-only jump, not a delayed first frame: the China focus point started at `cy=271.7204586722432`; after advancing to 2010 it was already at the final `cy=229.98245505459238`, and the rendered figure reported `data-transition-ms="0"` before the old 200ms sample. The renderer's `ResizeObserver` settled on any host resize. On the narrow layout, narrative/annotation height reflow therefore interrupted the active D3 transition even though visualization geometry depends only on width.

The release-finalization fix restricts resize settlement to a genuine host-width change. The browser acceptance test no longer assumes one magic 200ms sampling instant: it samples animation frames for a bounded 900ms window, requires at least one coordinate strictly between start and final values, requires a nonzero scheduled transition, and proves the same DOM node survives. A direct jump from start to end cannot satisfy this test.

No V1.2 scope was expanded during finalization. The 15 visual families, 22 original canonical examples, four real-data flagships, provenance, cross-engine lineage workbench, React 18 packed-host proof, single Datapass FigurePlayer ownership, and deferred Power BI/AI/article/CMS boundaries remain unchanged. Delivery still requires a green complete `pnpm release:gate` on the exact continuation SHA, then PR #2 at that same head, followed by green post-merge `main` CI and the generated `docs/qa/hosted-release.json` artifact.

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
