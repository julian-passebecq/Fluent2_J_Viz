# VizForge V1 Codex master prompt

Work only in the VizForge repository.

Accepted Datapass baseline: `19c87dceeaac4ef6a1f642a28ef0033a140c8545`.

Do not modify `julian-passebecq/react_ms_fluent_2_framework`.

Objective: build a reusable editorial/analytical D3 visualization engine and workbench driven by semantic specs.

Datapass/ConceptMotion owns technical SQL explanations, algorithms, Spark technical teaching Figures, DAG/orchestration, data model/star schema, SQL/data/KPI lineage and cloud/data architecture.

VizForge owns analytical charts, editorial graphics, animated analytical stories, KPI components, analytical tables/matrices, maps/flows/uncertainty, dashboard visual composition, React/web renderer and later Power BI adapters.

Architecture:
`data -> ChartSpec / StorySpec / TableSpec / MatrixSpec -> D3/SVG renderer`

Use thin adapters for React, Datapass Figure, later vanilla D3 and Power BI.
Renderer core must not depend on Fluent or Power BI APIs.

Required V1 families:
1. animated ranking / bar race
2. time-series comparison story (multi-series line/area with moving focus and annotations)
3. temporal scatter / bubble
4. dumbbell / before-after
5. KPI contribution story
6. Sankey / flow story
7. forecast + uncertainty
8. event/map story (point or symbol evolution over time; web-first)
9. analytical table
10. analytical matrix

Stable keyed identity is mandatory.
Support play/pause/previous/next/reset, deterministic steps, reduced motion; autoplay off.
Motion encodes time/rank/state/causality/flow/focus/change, never decoration.

For storytelling, prefer **step-based scene playback** over open-ended scrollytelling for V1. A story may have chapters/scenes, each with annotation, focus state and optional transition. This gives us a reusable engine that can later power Economist/BBC-style editorial explainers without forcing a full article CMS now.

Editorial style: message-first, restrained BBC/Economist/FT-like figure language, direct labels, sparse legends, annotations, source/note.

Do not build article AI/function calling, backend/auth, full Power BI packaging, universal chart grammar or dozens of chart types in V1.

Create:
- `VIZFORGE_ARCHITECTURE.md`
- `VIZFORGE_VISUAL_CATALOG.md`
- `VIZFORGE_SPEC_REFERENCE.md`
- `DATAPASS_INTEGRATION.md`
- `POWERBI_EXPORT_PLAN.md`
- `FRAMEWORK_GAPS.md`
- `QA_REPORT.md`

Do not patch Datapass to hide gaps.
