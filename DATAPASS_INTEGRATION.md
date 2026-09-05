# Datapass integration — deferred external seam

VizForge core, studio and React/DOM adapters are implemented inside this repository. No Datapass files were read, modified or pinned. The pack reports accepted baseline `19c87dceeaac4ef6a1f642a28ef0033a140c8545` and successful hosted CI `33980374447`; those are supplied baseline facts, not independently reverified by this task.

The user explicitly asked to keep Datapass unchanged and to build the standalone engine now. The pack also defers the final framework pin until the external renderer seam pass returns an exact revision. Therefore this repository does not pretend that a local mock is a real FigureView integration proof.

## Available VizForge seam

`src/adapters/host.ts` exports `rendererId = "vizforge.d3"` and `mountFigure(host,envelope)`. The envelope is `{rendererId,spec}` and accepts a validated canonical visualization or StorySpec. Mounting owns only a child figure; disposal removes listeners, cancels the player and interrupts transitions. A story mount exposes its player so a host can bind generic controls.

This is a VizForge-owned seam to map to the framework’s confirmed `FigureRendererAdapter` / registry contract. It does not import or reproduce an assumed framework interface. The React subpath can also supply a component renderer if the confirmed contract expects one.

## Integration procedure when the seam is confirmed

1. Receive the exact framework SHA and official external-consumer bootstrap/scaffold instructions.
2. Add the consumer dependency at that explicit pin and update this repository’s lockfile deliberately.
3. Import confirmed generic APIs from `@datapass/ui`, `@datapass/code`, `@datapass/figure` and `@datapass/content` only as needed. Replace the provisional studio textarea with the official JsonSpecEditor, without importing Monaco directly.
4. Wrap the canonical StorySpec in renderer-neutral FigureSpec metadata. Register `vizforge.d3` through the actual FigureRendererRegistry and map mount/update/dispose to the confirmed adapter API.
5. Render `examples/ranking.json` inside real FigureView with the registry passed through its supported prop.
6. Run the frozen consumer install, build and production desktop/390px flow; exercise keyboard playback, reduced motion, Axe and overflow in that real host.
7. Record the exact pin, lockfile, test command and actual FigureView proof here.

Host theme tokens should map to VizForge semantic theme roles at the adapter boundary. Figure controls must have one owner: either a host’s generic player binds to StoryPlayer, or the VizForge wrapper supplies controls. Two independent clocks must never advance one figure.

## Current gate status

- Standalone core/renderers, React mounting and VizForge host envelope: implemented and locally tested.
- Official external-consumer bootstrap and framework pin: awaiting confirmed external seam details.
- Real Datapass FigureView proof: **not run; deferred integration gate**.

This deferred milestone is distinct from the complete standalone web implementation. SQL transformations, technical teaching, DAGs, architecture and lineage remain outside VizForge.
