# Power BI export plan — deferred

The future boundary is fixed:

`Power BI DataView -> adapter -> canonical VizForge spec -> SAME D3 renderer -> SVG`

No `.pbiviz`, DataView adapter, host selection manager, formatting model or certification work is part of this pass. Renderer geometry is shared; there will be no separate WebChart and PowerBIChart implementations.

First future targets, in order, are KPI contribution, animated ranking and time evolution. The adapter will normalize host values into stable canonical IDs, validate specs, map host theme/formatting, forward selections and resize, and dispose renderer state on teardown. Paused SVG export will use the same settlement path.

Other families require separate host-specific evidence before compatibility is claimed. DAX UDF/TMDL remains an optional downstream subset for static HTML/SVG components only; it is never a path for running D3 JavaScript animation. AI/function calling remains a separate deferred lane.
