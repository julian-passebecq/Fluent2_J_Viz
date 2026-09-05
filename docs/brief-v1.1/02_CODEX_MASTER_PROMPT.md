# Codex master prompt - VizForge V1.1 / V1.5

Work only in `julian-passebecq/Fluent2_J_Viz`.
Start from exact clean commit `3a5bd0b7bdfb987a18f2e9154b43fc92756120b8`.
Consume exact Datapass commit `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55` through the official external-consumer mechanism.
Do not modify framework source or vendored files.

## Phase 1 - real Datapass integration
- adopt official exact-commit bootstrap/release pattern;
- resolve React host compatibility;
- register real `vizforge.d3` through `FigureRendererRegistry`;
- render at least one existing StorySpec through real `FigurePlayer`;
- replace Studio JSON textarea/editor with `JsonSpecEditor` where appropriate;
- use Fluent/Datapass application surfaces without deleting the working VizForge engine.

## Phase 2 - maintainability refactor
- split large renderer/studio modules by family/responsibility;
- preserve public engine/spec APIs unless a tested migration is required;
- preserve all V1 examples/tests.

## Phase 3 - bounded gallery/story expansion
- grow the grammar carefully;
- add reusable editorial patterns and story packs;
- do not start AI/function calling or Power BI packaging yet.

Preserve the architecture:
`data -> VizForge semantic spec -> SAME VizForge renderer -> standalone web / React / Datapass host / future Power BI`

Do not create separate WebChart and PowerBIChart geometry implementations.
