# Real data rules

Synthetic fixtures remain the default for deterministic tests.
Real data is for flagship editorial examples.

For every real dataset record:
- source organization;
- exact source URL or dataset identifier;
- retrieval date;
- license/usage note if available;
- transformation script/steps;
- pinned output file;
- SHA-256;
- fields/units;
- missing-value handling.

Never silently invent or interpolate facts for an editorial example.
If transformations or filtering materially change interpretation, document them.
