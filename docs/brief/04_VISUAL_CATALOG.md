# Required V1 visual catalog

Animated ranking / bar race: category/value/time; keyed bars reorder smoothly.
Time-series comparison story: series/value/time with direct labels, step annotations, highlight/focus and optional comparison baseline.
Temporal scatter / bubble: entity/x/y/size/time/category; entities move through time.
Dumbbell: entity/start/end/group.
KPI contribution: baseline -> contributions -> final KPI.
Sankey / flow: source/target/value with optional story focus; no decorative continuous motion by default.
Forecast+uncertainty: observed/forecast/interval/annotations; excellent static final state.
Event/map story: dated events or measurements on a simple geographic or schematic map; step-by-step reveal and focus.
Analytical table: BI formatting, not an app data grid.
Analytical matrix: rows/columns/measures/hierarchy/totals/conditional formatting.

For each:
- canonical spec example
- renderer tests
- desktop + phone proof
- reduced-motion proof
- annotation/source/note example
- one narrative example, not just a raw chart

Initial storytelling examples should cover at least:
- one line-based evolution story (for GDP / stocks / processor power / AI consumption type use cases)
- one ranking or bar-race story
- one map/event story (earthquake / flood / city / movement style)
