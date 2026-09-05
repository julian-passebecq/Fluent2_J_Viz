# Datapass contract to consume

Current accepted baseline `19c87dceeaac4ef6a1f642a28ef0033a140c8545` already exposes:
- `FigureRendererAdapter`
- `FigureRendererRegistry`
- `FigureView`
- `FigureViewProps.registry`

Expected generic imports after framework seam confirmation:

`@datapass/ui`
- AppShell/navigation
- PageHeader
- CatalogShell/SearchFilterBar
- Workbench/SplitPane/InspectorPanel
- FigureFrame/VisualizationSurface
- ContentDetails/SourceNote
- generic semantic app tokens

`@datapass/code`
- CodeEditor
- CodeDiff
- JsonSpecEditor
Never import Monaco directly.

`@datapass/figure`
- FigureRendererRegistry
- FigureRendererAdapter
- FigureView
- FigurePlayer only if outer generic playback is useful

`@datapass/content`
- renderer-neutral FigureSpec
- `rendererId: string`
- `spec: JsonValue`
- title/subtitle/takeaway/source/note/fallback metadata

VizForge owns its ChartSpec/StorySpec payload.
VizForge D3 core must not depend on ConceptMotion.
