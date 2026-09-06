# Consumer reuse report

## Scope

Consumer-validation branch: `gpt56sol/consumer-validation-rerun` in `julian-passebecq/Fluent2_J_Viz`.

Starting VizForge baseline: `7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef` (merged V1.2).  
Accepted Datapass baseline: `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`.

This pass treats VizForge as the third independent V4 consumer proof. It does not move D3 into Datapass and does not patch vendored framework source.

## Shared Datapass packages and components actually reused

- `@datapass/ui`
  - `AppShell`
  - `Workbench`
  - `InspectorPanel`
  - `LocaleProvider`
  - shared Fluent styling/tokens
- `@datapass/figure`
  - `FigurePlayer` as the single hosted playback owner
  - `FigureView` for the canonical technical lineage proof
  - `FigureRendererRegistry` through the consumer-owned `vizforge.d3` adapter
- `@datapass/code`
  - lazy `JsonSpecEditor` through the existing VizForge semantic-spec surface
- `@datapass/content`
  - generic Figure contract used to host external VizForge stories
- `@datapass/canonical`
  - accepted data-platform lineage Figure reused in the GDP cross-family workbench

The standalone `@vizforge/engine` package remains framework-independent and retains D3/Zod plus React peer dependencies only.

## Consumer-owned adapters and local code

- `src/studio/datapass.tsx` registers the external `vizforge.d3` renderer.
- The adapter maps Datapass `frameIndex` and `reducedMotion` directly to absolute VizForge scenes.
- Datapass owns play/pause/reset/seek/speed in hosted mode. VizForge does not create a second StoryPlayer or timer underneath FigurePlayer.
- VizForge owns renderer-specific SVG export through the existing `exportAction` seam.
- The consumer keeps local editorial CSS because analytical figure styling is intentionally outside generic Fluent shell styling.
- This validation pass adds a consumer-only per-scene explanation box sourced from existing StorySpec captions and annotations. It changes no renderer geometry or engine schema.

## Cross-repository bootstrap friction

The consumer uses the accepted external bootstrap and verifies exact Datapass source bytes at commit `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`. The generated vendor directory is ignored and must not be edited. A committed consumer lockfile supports `pnpm install --frozen-lockfile`.

A Netlify build recipe is included for independent preview deployment. It bootstraps the exact framework pin, performs a frozen install and builds the production Studio bundle.

## What this consumer is proving

1. A genuinely independent D3 engine can live behind the Datapass Figure boundary without being absorbed into ConceptMotion.
2. Datapass FigurePlayer can own a third-party animated story while stable keyed D3 entities still interpolate correctly.
3. The same consumer can combine ConceptMotion technical lineage and VizForge analytical storytelling without duplicating either engine.
4. Fluent shell/workbench/editor infrastructure is reusable around a visual system with substantially different rendering semantics.

## Local hacks still present

- Keyboard shortcuts currently activate FigurePlayer's native buttons because FigurePlayer exposes no imperative playback handle.
- VizForge `intervalMs` remains standalone-only; hosted playback uses Datapass cadence.
- Renderer-specific SVG export is attached through consumer `exportAction` rather than a generic external-renderer export API.
- The accepted lineage renderer still needs a horizontal readable viewport on phones because its minimum geometry width is larger than the mobile workbench.

Those are recorded as framework evidence rather than hidden by framework patches.
