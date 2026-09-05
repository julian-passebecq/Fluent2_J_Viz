# VizForge architecture

`data -> canonical semantic spec -> SAME D3 renderer -> standalone DOM / React / Datapass / future Power BI`

The engine has no React, Fluent, Datapass or Power BI imports. Its public functions remain `parseVisualization`, `parseStory`, `createRenderer`, `layoutChart`, `StoryPlayer`, `mountFigure`, and the React `Figure` / `StoryView` adapter exports. The maintainability pass preserves all V1 layouts exactly: 100 comparisons across every SVG scene and widths 280, 390, 800 and 1440 match the original baseline; table and matrix behavior remains covered by existing tests.

## Responsibilities

- `src/core/spec.ts`: strict versioned grammar and semantic validation.
- `src/core/player.ts`: standalone deterministic playback only.
- `src/renderers/layout.ts`: family dispatch; `layout-shared.ts`: geometry types, stable colors, snapshots, scales and axes.
- `src/renderers/families/`: ranking, shared time/forecast, scatter, dumbbell, contribution, flow and map layout modules. HTML table/matrix layout remains in `tables.ts`.
- `src/renderers/joins.ts`: stable entity/mark reconciliation and named D3 transitions; `svg.ts`: SVG construction; `data-accessibility.ts`: canonical data tables; `styles.ts`: engine presentation.
- `src/renderers/dom.ts`: mounted renderer lifecycle, metadata, annotations, responsive sizing, motion preferences and settlement. It coordinates the shared renderer and owns cleanup.
- `src/adapters/`: public standalone DOM/React hosts.
- `src/studio/`: real Datapass registry adapter, Fluent shell, catalog, hosted workbench, inspector, lazy editor and SVG/JSON export in separate modules. Styles are split into shell, workbench, catalog, responsive and Datapass presentation sheets.

The hosted adapter directly paints the scene selected by Datapass FigurePlayer. It never constructs a StoryPlayer. The Studio stores only the selected integer frame; outline navigation and shortcuts activate native playback actions. Changing stories or applying a valid edited story resets the native player through a new workbench instance. Source and theme mapping stay at the boundary. Standalone mounting retains its own StoryPlayer and cleanup contract.

Datapass is an exact source distribution, not an npm-published SDK. The official bootstrap verifies all 91 selected files against the accepted Git commit before and after release. The engine's ESM library has no bundled React; the Studio uses one deduplicated React 19.2.8 host. The build gate analyzes all reachable Studio source maps and rejects an embedded VizForge playback clock or a second React implementation.

Scene state is absolute. Focus and annotations refer to stable semantic IDs; scales use the full authored data where meaningful. Reduced motion settles immediately and disables hosted autoplay while allowing manual steps. Custom SVG export settles the current scene synchronously and serializes the same renderer output. Future Power BI remains `DataView -> adapter -> canonical VizForge spec -> SAME D3 renderer -> SVG`.
