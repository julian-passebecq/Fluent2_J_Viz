# Framework gaps and intentional boundaries

## V1.2 evidence at the accepted pin

Current Datapass dependency: `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`; all 107 selected files are byte-verified before/after release. No framework patches.

New concrete reproduction: render the canonical `medallion-asset-lineage` through `FigureView`, `presentationSize="compact"`, inside a 390px Fluent workbench. `packages/svg/src/renderers/lineage.ts:lineageGeometry` sets width to at least 960 even for a single vertical lane. `recommendedSceneViewport` retains that width, and the React SVG scales to its container. At a 328px inner width, 12px scene text becomes about 4px on screen; changing compact/regular does not solve it. Impact: the source-to-KPI proof is technically visible but its diagram text is unreadable on phones. The consumer uses a labeled horizontal scrolling surface with 760px minimum content width and shortened authored labels. Full semantics remain in the Figure fallback. A framework content-fitted viewport could improve this later; no renderer or geometry is patched here.

Retained evidence: authored VizForge `intervalMs` still differs from FigurePlayer's native 1200ms/speed cadence; no second timer is added. An optional imperative player handle would avoid the existing consumer shortcut bridge to native buttons. Renderer-specific export remains a consumer action; the registry supplies no generic VizForge export implementation. Selecting the canonical subpath deliberately imports its supported source dependency closure (107 files); no alternate bootstrap is introduced. TypeScript unused-code policy and the large lazy Monaco chunk remain unchanged.

## Historical V1.1 observations

The external registry/bootstrap seam is accepted and integrated at `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55`. There is no remaining integration blocker and no framework source was patched.

- FigurePlayer owns the hosted clock, controls and reduced-motion autoplay policy. Its accepted cadence is 1200 ms divided by the selected speed. VizForge `intervalMs` continues to govern standalone playback only; the consumer does not add a timer to emulate that interval inside Datapass.
- Datapass keeps its existing ConceptMotion dependency closure for built-in compatibility. This consumer directly selects only UI, content, figure and code. The build proves that the real external VizForge adapter ships and the hosted VizForge clock does not.
- Datapass source uses the official starter's TypeScript 7.0.2 toolchain and unused-code policy. Engine/library unused-code checks remain enabled. No framework cleanup was performed here.
- Generic ConceptMotion SVG export is not used for VizForge. The custom exportAction synchronously settles and serializes the current D3 scene. Analytical HTML table/matrix export remains canonical JSON.
- JsonSpecEditor and its local Monaco workers load lazily. Monaco remains a large optional chunk; this pass does not replace or patch its implementation.
- The choropleth supports bounded GeoJSON Polygon/MultiPolygon regions, holes, either winding direction and explicit missing values. Each ring represents a region smaller than a hemisphere. Self-intersection repair, geometry simplification, map tiles, geocoding, inset placement and dense label collision solving remain out of scope. Supplied fixture geometry and all metrics are synthetic.
- Bump and stacked-area require complete entity/time grids. Small multiples use one shared-scale panel per entity (maximum 12). Histograms use fixed equal-width bins with count/probability semantics, not a general statistical inference system.

AI/function calling, a scrollytelling CMS, `.pbiviz`, Power BI DataView adapters, host selection/formatting models and certification remain deferred. The future rule is `Power BI DataView -> adapter -> canonical VizForge spec -> SAME D3 renderer -> SVG`.
