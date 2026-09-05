# Refactor before major expansion

Do not rewrite the engine. Split pressure points before adding many families.

Current large files:
- `src/renderers/layout.ts` ~25 KB;
- `src/renderers/dom.ts` ~14 KB;
- `src/studio/main.tsx` ~21 KB;
- `src/studio/studio.css` ~24 KB.

Refactor toward real responsibility boundaries such as shared scales/axes/keyed joins/annotations/labels/transitions/accessibility and family modules for time, ranking, scatter, dumbbell, contribution, flow, forecast, map, table, matrix.

Split Studio concerns for catalog/navigation, workbench, editor/validation, export and inspector/metadata.

Preserve stable public exports and deterministic tests. Do not create abstractions without repeated use.
