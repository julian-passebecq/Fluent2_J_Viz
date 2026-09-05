# Power BI boundary

VizForge V1 is web-first.

Do not promise that every D3 story will become a full Power BI visual immediately.

Treat Power BI as a later adapter/export lane with a subset-first strategy:
- good early candidates: KPI contribution, analytical table/matrix, line comparison story, bar race, dumbbell, basic scatter/bubble;
- cautious later candidates: Sankey, uncertainty, map/event story, richer editorial stories.

Remember Power BI visuals are packaged as `.pbiviz` custom visuals, and D3 can be used inside a Power BI visual implementation, but certification and packaging constraints are separate concerns from the web engine. Also, custom visuals can be deployed through AppSource or organizational visuals, which supports a phased strategy: web-first engine now, Power BI subset later.

Do not let Power BI constraints pollute the core spec/runtime.
Instead:
- keep renderer core DOM/SVG/data driven;
- define adapter boundary clearly;
- document which visual families are export-friendly vs web-only for now.
