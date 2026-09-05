# QA report

Baseline hosted V1 CI `33989227514` succeeded on `3a5bd0b7bdfb987a18f2e9154b43fc92756120b8`; accepted Datapass CI `33988679372` succeeded on `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55`. Both were verified through GitHub API in this pass.

The real Datapass integration checkpoint passes spec validation, 87 unit tests, typecheck, production/library build, a frozen pnpm install, 32 desktop/390px browser tests and exact source verification (91 files). Every scene in all ten V1 families was checked, with serious/critical Axe = 0 and page overflow = 0. Fluent's established `[data-tabster-dummy]` sentinel exclusion is the only Axe exclusion.

Production evidence in `docs/qa/` includes screenshots, per-scene Axe reports and `bundle-audit.json`. Browser tests cover stable D3 bar identity and measured transition midpoint, interrupted transition/reset, no autoplay, real FigurePlayer keyboard/slider controls, preference changes stopping autoplay, valid/invalid lazy JsonSpecEditor editing, custom SVG download, catalog, cross-family stories and standalone hosting. Source-map analysis proves the Studio ships one React 19.2.8 runtime and Datapass playback, with no VizForge StoryPlayer in the hosted entry graph.

Final clean-checkout release and hosted CI evidence will be recorded in `VIZFORGE_V1_1_RELEASE_REPORT.md` after the ordered refactor and bounded expansion.
