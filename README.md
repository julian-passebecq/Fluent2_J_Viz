# VizForge

A framework-independent D3 engine and Fluent/Datapass editorial studio. **15 reusable visual families, 22 original synthetic examples and four real-data flagship stories** share semantic specs, stable entities, readable paused scenes, reduced motion and SVG/JSON export. World Bank GDP, USGS events and a Natural Earth Japan outline are pinned with reproducible provenance.

## Run the integrated Studio

Use **Node 24.19.0** and **pnpm 11.19.0**:

```sh
node --experimental-strip-types scripts/bootstrap-framework.ts
pnpm install --frozen-lockfile
pnpm dev
```

Bootstrap runs before install and verifies exact Datapass commit `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`. Only allowlisted source is materialized under ignored `vendor/`. Do not edit it. The five direct Datapass packages are Studio development dependencies; the standalone engine package does not require Datapass.

Open **Visual catalog** for the flagship collection. `/?story=flagship-cross` opens the shared workbench: a real Datapass source-to-KPI lineage Figure above a VizForge line → ranking → share story, with one playback owner. Other direct links use `flagship-time`, `flagship-ranking` and `flagship-events`. See [data provenance](DATA_PROVENANCE.md) and the [V1.2 release report](VIZFORGE_V1_2_RELEASE_REPORT.md).

```sh
pnpm browser:install
pnpm check
```

`check` runs the official consumer release gate: immutable framework verification, frozen install, typecheck, all canonical specs/provenance, unit tests, production and typed ESM library builds, source-map/privacy/React audits, an independent packed React 18 host, and production Chromium checks at 1440px and 390px. CI installs Chromium with `pnpm browser:install --with-deps`. Evidence is in `docs/qa/`, with browser traces/reports attached to hosted runs.

The real Datapass FigurePlayer is the Studio's sole playback controller. Its registry maps `frameIndex` and `reducedMotion` directly to a VizForge scene. Open **Visual catalog** to explore the five added families and story packs for markets, GDP, processors, AI energy, earthquake events and franchises. **Semantic spec** loads the official lazy JsonSpecEditor; invalid edits remain drafts. **Export current figure as SVG** snapshots the selected scene using the same renderer. Tables/matrices export JSON.

## Use the engine

```ts
import { createRenderer, parseStory, StoryPlayer } from '@vizforge/engine';
import input from './my-story.json';
const story = parseStory(input);
const player = new StoryPlayer(story);
const renderer = createRenderer(document.querySelector('#figure')!);
const paint = () => {
  const state = player.getState();
  const scene = player.getScene();
  renderer.update(story.visuals.find((v) => v.id === scene.visualId)!, scene, {
    reducedMotion: state.reducedMotion,
    animate: ['next', 'previous', 'seek', 'tick'].includes(state.reason),
  });
};
const unsubscribe = player.subscribe(paint);
paint();
// Bind standalone controls to player methods.
// On unmount: unsubscribe(); player.dispose(); renderer.destroy();
```

```tsx
import { StoryView, Figure } from '@vizforge/engine/react';
<StoryView story={story} />
<Figure spec={story.visuals[0]} />
```

`pnpm build` emits typed ESM under `dist/lib`. `pnpm pack` produces a private local engine package with D3/Zod dependencies and React/ReactDOM peers `>=18.3 <20`. Public publishing remains disabled. The Studio/tests use React 19.2.8; the release gate also mounts, steps and unmounts the packed React adapter in an isolated React 18.3.1 consumer. `/standalone.html` uses the same renderer with no React entry point.

Existing renderer APIs and V1 specs remain compatible. New families explicitly use visual version `1.1`; a StorySpec containing them also uses `1.1`. `timelineStory` and `chapterStory` add reusable authoring helpers without adding a player or separate geometry.

## References

- [Architecture](VIZFORGE_ARCHITECTURE.md), [spec reference](VIZFORGE_SPEC_REFERENCE.md), [visual catalog](VIZFORGE_VISUAL_CATALOG.md)
- [Datapass integration](DATAPASS_INTEGRATION.md), [framework limits](FRAMEWORK_GAPS.md)
- [Data provenance and hashes](docs/DATA_PROVENANCE.json), [canonical JSON](examples/)
- [QA report](QA_REPORT.md), [release report](VIZFORGE_V1_2_RELEASE_REPORT.md)
- [Future Power BI boundary](POWERBI_EXPORT_PLAN.md)

V1.2 starts from exact merged VizForge `423e7ecaedbe4f922665938eb013f6bf1bd11e7b`. Its ordered brief is preserved in `docs/brief-v1.2/`. AI/function calling, article ingestion, a full scrollytelling CMS and Power BI packaging remain deferred.
