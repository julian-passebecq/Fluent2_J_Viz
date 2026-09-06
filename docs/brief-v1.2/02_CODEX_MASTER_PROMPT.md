# Codex master prompt — VizForge V1.2

Work only in:
`julian-passebecq/Fluent2_J_Viz`

Start from exact merged `main` SHA:
`423e7ecaedbe4f922665938eb013f6bf1bd11e7b`

Use Datapass only as an external dependency/integration target at exact accepted SHA:
`30e69639bfc3929c348fd8f9c6c38a2cb61984d8`

Do not modify `julian-passebecq/react_ms_fluent_2_framework`.

## Goal

Prove that the existing VizForge engine can produce a small set of genuinely strong editorial D3 stories from real/pinned data and can coexist on one product page with Datapass technical Figures.

Do not add lots of chart families. Prefer composition quality, real data, narrative clarity and reuse.

## Required flagship stories

Create/refine at least four reusable story compositions using existing visual families wherever possible:

1. **Time-evolution comparison story**
   - several entities/series over time;
   - suitable for GDP / stocks / processor performance / AI compute-energy style narratives;
   - moving focus, direct labels and annotations;
   - play/pause/step/reset;
   - stable entity identity.

2. **Animated ranking story**
   - rank or bar-race evolution;
   - readable paused states;
   - clear deltas/rank changes;
   - no decorative perpetual motion.

3. **Map/event story**
   - earthquake / flood / event evolution style;
   - date/step progression;
   - focus annotations;
   - web-first geography;
   - no dependency on a full map tile engine.

4. **Cross-family editorial story**
   - one narrative that intentionally moves across multiple existing families, e.g. line -> ranking -> map or line -> contribution -> forecast;
   - preserve semantic entity identity where it makes sense;
   - each scene must still be understandable when paused.

## Real data requirement

Current synthetic fixtures remain valid for deterministic unit tests.

Add a small number of reproducibly pinned real datasets for flagship demonstrations.
Prefer sources with stable, redistributable/public data and clear provenance.
Examples that fit well:
- World Bank GDP indicators;
- USGS earthquake feed exported to a pinned fixture;
- public market/index time series if licensing/provenance is clear.

Rules:
- never fetch live network data at runtime for canonical release examples;
- pin the extracted fixture in-repo or in a deterministic acquisition step;
- record source URL, retrieval date, license/usage note where available, transformation steps and SHA-256;
- keep tests deterministic;
- clearly label synthetic vs real examples.

If a candidate source cannot be safely redistributed, use a deterministic downloader or choose another source.

## Cross-engine composition proof

Add one Datapass-hosted page/workbench composition that shows both engines together without mixing ownership.

Target structure:

`Datapass lineage/architecture Figure`
`Source -> Bronze -> Silver -> Gold -> semantic model -> KPI`

plus

`VizForge analytical Figure/story`
`KPI evolution / contribution / forecast / ranking`

The page should prove:
- Datapass explains where the data/KPI comes from;
- VizForge explains what the analytical data says;
- both share Fluent shell/workbench surfaces;
- renderer registries remain independent;
- no VizForge D3 geometry leaks into ConceptMotion;
- no Datapass topology/lineage engine is reimplemented inside VizForge.

Use current Datapass data-platform canonical Figures/specs if the accepted external bootstrap exposes them cleanly. If consuming the new canonical data-platform subpath requires a deliberate pin update/bootstrap change, do it explicitly and verify the exact framework SHA before/after.

## Story authoring ergonomics

Improve only what is proven necessary by these flagship stories.
Good candidates are additive pure helpers such as:
- chapter/scene builders;
- annotation/focus presets;
- timeline scene construction;
- data provenance helpers;
- story validation diagnostics.

Do not add a full scrollytelling CMS.
Do not create a universal visualization grammar.

## Framework feedback

Keep the previously observed Datapass friction as evidence only:
- authored frame interval vs FigurePlayer cadence;
- optional imperative player handle;
- renderer export capability;
- external-source dependency closure;
- TypeScript policy mismatch;
- lazy Monaco size.

Do not work around these with framework patches.
If V1.2 produces new concrete evidence, update `FRAMEWORK_GAPS.md` with exact reproduction/impact.

## Explicitly deferred

Still defer:
- `.pbiviz` packaging;
- Power BI DataView adapter;
- selection manager;
- formatting model;
- AppSource/certification;
- article ingestion;
- LLM/function calling;
- automated article -> chart/story composition;
- full scrollytelling CMS.

Keep future Power BI invariant:

`Power BI DataView -> adapter -> canonical VizForge spec -> SAME D3 renderer -> SVG`

## Required reports

Update/create:
- `VIZFORGE_V1_2_RELEASE_REPORT.md`
- `VIZFORGE_VISUAL_CATALOG.md`
- `VIZFORGE_SPEC_REFERENCE.md`
- `DATAPASS_INTEGRATION.md`
- `DATA_PROVENANCE.md` or equivalent machine-readable provenance + human summary
- `FRAMEWORK_GAPS.md`
- `QA_REPORT.md`

## QA / release gate

Before delivery:
- frozen install;
- typecheck;
- spec/story validation;
- provenance/hash validation;
- all unit tests;
- production/library build;
- standalone engine proof;
- React 18 packed-consumer proof preserved;
- Datapass-hosted React 19 proof preserved;
- stable DOM identity checks;
- actual intermediate geometry/color transition checks;
- no autoplay by default;
- reduced motion;
- keyboard playback;
- SVG export;
- desktop + 390px;
- serious/critical Axe = 0;
- page overflow <= 1px;
- hosted CI green on exact delivered SHA.

Push through a branch/PR, then merge only after the exact branch SHA is green. Confirm post-merge `main` CI if the repository workflow runs on push.
