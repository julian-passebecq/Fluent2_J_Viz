# VizForge V1 architecture

## Data flow

```text
Application data
  → ChartSpec | TableSpec | MatrixSpec (version 1.0)
  → StorySpec.visuals + StorySpec.scenes
  → runtime validation
  → StoryPlayer (discrete semantic state)
  → D3 layout + keyed SVG / semantic HTML table
  → standalone DOM or thin React/host adapter
```

`src/core/spec.ts` defines the public types and runtime schemas. `parseVisualization` and `parseStory` add relationship validation to the structural schemas. Call these parsers, not the bare Zod schemas, at trust boundaries. Invalid references, duplicate temporal keys, cycles, invalid intervals and nonfinite measures fail before layout.

`src/core/player.ts` owns an immutable snapshot, subscription set and one cancellable timer. It is independent of the DOM and rendering. Manual next, previous, seek and reset pause the clock. Play advances one scene each interval and stops at the final scene. Resume starts a fresh dwell interval; it does not recover a hidden wall-clock offset. Rendering never determines which scene is current.

`src/renderers/layout.ts` converts an analytical spec and scene into pixel-space marks. D3 supplies scales, grouping, lines, areas, geographic projection and Sankey layout. The result has entity IDs separate from mark roles. Layout is deterministic for the same input, width and scene.

`src/renderers/dom.ts` owns one figure subtree. The entity join key is `(visual.id, entity.id)`; child marks use `(mark.key, mark.tag)`. A rank change updates the existing bar and group. Revealed map events retain their previous nodes. Time-series paths keep series identity. A different visual ID represents a different visual object; cross-family scenes preserve the figure frame and story navigation rather than implying identical geometric objects.

D3 transitions use one named channel, interrupted before every update. Numeric positions, sizes and path geometry encode changes in data; opacity encodes focus and scene reveal. New marks appear at their true coordinates. `settle()` cancels interpolation and writes the selected semantic state immediately. Pause/reset and reduced motion settle to a readable endpoint. There are no looping decorative effects. The keyed join follows [D3’s object-constancy API](https://d3js.org/d3-selection/joining).

`src/renderers/tables.ts` produces native tables with scoped headers, keyed body rows, explicit sorting, data bars, variance, labeled status icons, sparklines and totals. Matrix aggregation traverses leaf IDs only, avoiding double counting of row/column subtotals. Sparse cells distinguish absence from a real zero.

## Ownership boundaries

| Module               | Imports from host UI frameworks | Responsibility                                  |
| -------------------- | ------------------------------- | ----------------------------------------------- |
| `core/*`             | None                            | Contracts, validation, formatting, playback     |
| `renderers/*`        | None                            | D3/SVG, accessible HTML, responsive layout      |
| `adapters/react.tsx` | React                           | Mounting, cleanup, state subscription, controls |
| `adapters/host.ts`   | None                            | VizForge-owned renderer envelope, mount/dispose |
| `studio/*`           | React                           | Local catalog, draft editor, workbench, export  |

There are no Fluent, Power BI, ConceptMotion, Monaco or Datapass imports. The studio uses a simple textarea until the official Datapass code-editor seam is confirmed. The published-style ESM entry point does not export the studio or sample data. Its React adapter is a separate subpath. The standalone production entry has no React entry point.

## Responsive and accessible behavior

SVG layouts recompute from the host width through ResizeObserver; they do not simply shrink a desktop canvas. Ranking labels move above bars on phones. Direct line labels use pixel-space collision resolution. Maps retain location and simplify labels. Annotations beyond the first on phones are available in a disclosure. Wide analytical tables scroll inside a labeled, keyboard-focusable region. Sources and notes remain readable text.

SVG has an accessible title, descriptive text and a summary including scene values. Every chart also provides a disclosure containing its exact canonical data. Tables use native semantics. The player supports native buttons and scoped keyboard navigation, and announces scene text in a polite live region. Reduced motion follows the OS and can also be enabled in the studio; a local preference cannot override an OS request to reduce motion.

## V1 boundaries

This is a small family-specific grammar, not an arbitrary chart language. Time is numeric (an ordinal, year or epoch); adapters normalize dates before authoring. Maps support schematic polygons or simple equirectangular geography, not tiles, geocoding or a full GIS. Flow graphs must be directed and acyclic, matching [d3-sankey’s input model](https://github.com/d3/d3-sankey). Dense labels may require host-authored shorter names or fewer entities. No article CMS, authentication, SQL teaching, lineage, function calling or `.pbiviz` packaging is included.
