# VizForge

A web-first D3 engine and editorial studio for semantic analytical figures. Ten visualization families share versioned specs, keyed entities and a deterministic scene player. Renderer modules do not import React, Fluent, Datapass or Power BI.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open the printed local URL. The studio includes a catalog, ten narrative examples, a cross-family explainer, scene navigation, reduced motion, a validating JSON editor, JSON export and paused SVG chart export. Data is explicitly synthetic. There is no backend or account requirement.

```sh
npm run browser:install
npm run check
```

The checks validate canonical JSON, run deterministic unit tests, typecheck, build the studio and reusable ESM library, and run production Chromium checks at 1440px and 390px. Browser binaries stay in `.local/browsers`. Proof images are written to `docs/qa/`. `npm run preview` serves the production build; `/standalone.html` demonstrates the same renderer without a React entry point.

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
// Bind buttons to player.play/pause/next/previous/reset/seek.
// On unmount: unsubscribe(); player.dispose(); renderer.destroy();
```

```tsx
import { StoryView, Figure } from '@vizforge/engine/react';

<StoryView story={story} />
// Or render a single paused figure:
<Figure spec={story.visuals[0]} />
```

`npm run build` emits typed ESM modules in `dist/lib`; `npm pack` creates a local package for another application. Publishing is deliberately disabled with `private: true`; there is no implied public release.

## Documentation

- [Architecture](VIZFORGE_ARCHITECTURE.md) and [spec reference](VIZFORGE_SPEC_REFERENCE.md)
- [Visual catalog](VIZFORGE_VISUAL_CATALOG.md) and [canonical examples](examples/)
- [Datapass integration boundary](DATAPASS_INTEGRATION.md) and [framework gaps](FRAMEWORK_GAPS.md)
- [Later Power BI adapter plan](POWERBI_EXPORT_PLAN.md)
- [QA evidence and remaining release gate](QA_REPORT.md)

The original ordered brief is preserved in `docs/brief/`. The requested work stays in this repository. Real Datapass FigureView integration remains deferred until the framework seam revision and consumer mechanism are confirmed; no Datapass checkout was read or modified.
