# VizForge audit snapshot

Current main is `3a5bd0b7bdfb987a18f2e9154b43fc92756120b8` and hosted CI `33989227514` is green.

V1 is real and should not be rebuilt from scratch.

## Preserve
- framework-independent D3 renderer core;
- strict versioned specs and absolute StorySpec scenes;
- stable keyed D3 identity and real transition midpoint tests;
- reduced motion;
- standalone DOM host and React adapter;
- 10 families: time evolution, ranking, scatter/bubble, dumbbell, KPI contribution, Sankey/flow, forecast+uncertainty, event/map, analytical table, analytical matrix;
- cross-family editorial story;
- JSON/SVG export;
- desktop/390px/Axe/overflow QA.

## P0 debt now actionable
1. `QA_REPORT.md` still says hosted CI was not run.
2. `DATAPASS_INTEGRATION.md` still says the external seam is pending.
3. React/ReactDOM 18.3.1 are ordinary dependencies today.
4. Datapass packages test on React 19.2.8 and declare peers `>=18 <20`; avoid a second embedded React copy.
5. Real `vizforge.d3` inside Datapass `FigurePlayer` has not yet been proven.
6. Large files already exist: renderer layout ~25 KB, renderer DOM ~14 KB, studio main ~21 KB, studio CSS ~24 KB.
7. Studio currently uses its own editor; Datapass now exposes lazy `JsonSpecEditor`.

## Accepted framework facts
Use existing `learning` external preset as bootstrap reference. Keep only `@datapass/ui`, `@datapass/content`, `@datapass/figure`, `@datapass/code` for a visual-only host.

External Figure support includes consumer registry, explicit stepCount/captions, frameIndex, reducedMotion, generic title/subtitle/takeaway/source/note/fallback and custom exportAction.
