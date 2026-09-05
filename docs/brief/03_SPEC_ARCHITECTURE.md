# V1 spec architecture

Do not start with a universal grammar.

Define small versioned contracts:

ChartSpec:
- id/version/type
- data
- encodings
- semantic visualization theme
- formatting
- annotation refs
- accessibility summary
- optional animation config

StorySpec:
- stable step IDs
- chart state
- focus IDs
- annotation IDs
- transition intent
- optional narrative
- reduced-motion state

TableSpec:
- columns/measures
- formatting
- analytical sorting presentation
- data bars/icons/sparklines where supported
- totals where meaningful

MatrixSpec:
- row hierarchy
- column hierarchy
- measures
- subtotals/grand totals
- formatting/data bars/icons/sparklines

Technical SQL row transformations stay ConceptMotion.
Ordinary application/admin grids stay Datapass UI.
