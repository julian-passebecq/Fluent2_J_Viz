# Power BI boundary

Power BI remains deferred from this pass. Do not create `.pbiviz`, DataView adapters, selection managers or formatting models unless scope changes explicitly.

Future architecture remains:
`Power BI DataView -> PowerBIAdapter -> canonical VizForge spec -> SAME D3 renderer -> SVG`

First future targets:
1. KPI contribution;
2. animated ranking;
3. time evolution.

DAX UDF/TMDL remains a separate optional downstream subset for static HTML/SVG components only. Never use it for D3 JavaScript animation.
