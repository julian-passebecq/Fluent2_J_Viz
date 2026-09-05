# Power BI export plan — later adapter

V1 is a web engine. It does not produce `.pbiviz` packages, claim certification, or require Power BI to run. No Power BI API or packaging concern enters the canonical specs, player or D3 renderers.

## Adapter boundary

```text
Power BI data + viewport + selections + host settings
  → Power BI adapter (data mapping, capabilities, lifecycle)
  → the same canonical VizForge specs
  → the same D3/SVG or analytical table renderers
```

Host update should normalize values and validate a spec, then update the existing renderer. Use persistent category identities to derive stable entity IDs. Map theme and formatting explicitly. Bridge selection/highlight events at the adapter, and destroy the renderer/player on host disposal. A host resize updates width, not analytical identity. Export should settle the selected scene; it should not capture an arbitrary intermediate animation frame.

## Subset-first rollout

| Candidate                      | Proposed phase    | Main work to verify later                                                      |
| ------------------------------ | ----------------- | ------------------------------------------------------------------------------ |
| KPI contribution               | First             | Numeric data roles, comparison/target mapping, single-scene fallback           |
| Analytical table/matrix        | First             | Hierarchical data mapping, explicit aggregation, host selection and scrolling  |
| Line comparison                | First             | Numeric/date conversion, series IDs, paused story semantics                    |
| Ranking                        | First             | Stable category IDs, explicit user playback, performance limits                |
| Dumbbell                       | First             | Paired measures and identity mapping                                           |
| Basic scatter/bubble           | First             | Category identities, size domain and selection behavior                        |
| Sankey                         | Later             | Node/link roles, graph limits and interaction semantics                        |
| Forecast + uncertainty         | Later             | Interval meaning and data roles                                                |
| Event/map                      | Web-first for now | Geography inputs, host restrictions, footprint and accessibility               |
| Cross-family editorial stories | Web-first for now | Scene authoring and host controls; may begin as a static selected-scene export |

These phases describe an implementation plan, not present Power BI compatibility. No family is promised full parity before an adapter is packaged and tested in the target host. Packaging, certification, organizational deployment and distribution are separate release work. Validate then-current official Microsoft requirements when that lane begins.
