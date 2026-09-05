# QA and delivery

Update `QA_REPORT.md` to record successful hosted V1 CI `33989227514` on `3a5bd0b7bdfb987a18f2e9154b43fc92756120b8`.
Update `DATAPASS_INTEGRATION.md` because the seam is confirmed at framework `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55` with CI `33988679372` green.

Required integration gate:
- exact framework pin verified;
- vendor source unchanged;
- one consumer-owned lockfile;
- frozen install from clean checkout;
- typecheck and VizForge spec validation;
- all existing unit/browser tests;
- production build;
- standalone engine still green;
- real Datapass FigurePlayer proof;
- actual intermediate transition geometry and stable DOM identity;
- keyboard playback and reduced motion;
- JsonSpecEditor lazy load + valid/invalid editing;
- SVG export via external `exportAction`;
- desktop 1440px and phone 390px;
- serious/critical Axe = 0;
- page overflow <= 1px;
- source-map/privacy scan;
- no duplicate React runtime.

After integration/refactor/gallery changes, run complete repo check and hosted CI on the exact pushed SHA.

Create/update:
- `DATAPASS_INTEGRATION.md`
- `QA_REPORT.md`
- `VIZFORGE_ARCHITECTURE.md`
- `VIZFORGE_VISUAL_CATALOG.md`
- `VIZFORGE_SPEC_REFERENCE.md`
- `FRAMEWORK_GAPS.md`
- `VIZFORGE_V1_1_RELEASE_REPORT.md`

Final response must state exact new VizForge SHA, exact framework pin, hosted CI run id/conclusion, React/package strategy, whether renderer public APIs changed, family/example counts and what remains deferred for Power BI and AI.
