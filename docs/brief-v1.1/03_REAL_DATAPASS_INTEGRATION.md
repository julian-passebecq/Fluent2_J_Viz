# Real Datapass integration

Accepted framework pin: `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55`.

Generate a disposable external `learning` starter at the accepted SHA only as a reference for official bootstrap/config/workflow files. Do not overwrite VizForge with a fresh scaffold. Adapt the existing repo in place.

Prefer one package-manager/release story. The Datapass contract is pnpm-based. Unless a concrete blocker is found, migrate VizForge to pnpm 11.19.0 and commit one consumer-owned `pnpm-lock.yaml`; do not keep competing production npm/pnpm locks. Use Node 24.19.0 for the full release gate.

Keep only required Datapass packages:
- `@datapass/ui`
- `@datapass/content`
- `@datapass/figure`
- `@datapass/code`

Never patch vendored source.

## Adapter
Create a stable registry from `createDefaultFigureRendererRegistry()` when the Studio may show both built-in and VizForge Figures, then register `vizforge.d3`.

Validator uses existing VizForge schema validation.

For StorySpec hosted by Datapass:
- Datapass `FigurePlayer` is the only playback controller;
- pass `stepCount` equal to story scene count;
- pass captions from scene titles/captions/annotations;
- adapter maps `frameIndex` to the corresponding VizForge scene;
- adapter maps `reducedMotion` into VizForge render options;
- render the VizForge Figure directly for that scene;
- do not instantiate a second VizForge StoryPlayer inside the hosted adapter.

Standalone VizForge may continue using its own StoryPlayer.

## Export
Datapass built-in SVG freeze/export is ConceptMotion-specific. Supply consumer-owned `exportAction` using VizForge's existing SVG export path.

## Theme and shell
Map Datapass semantic surface tokens to VizForge chart roles at the adapter boundary. Do not import Fluent tokens into renderer geometry.
Use AppShell/navigation, CatalogShell/SearchFilterBar, Workbench/SplitPane/InspectorPanel where useful and `JsonSpecEditor` from `@datapass/code`.
Keep the editorial D3 figure language.

## Mandatory proof
Use existing ranking or time-evolution StorySpec and prove:
`StorySpec -> vizforge.d3 -> FigureRendererRegistry -> FigurePlayer -> real D3/SVG renderer`

Test desktop and 390px with actual intermediate motion and stable DOM identity.
