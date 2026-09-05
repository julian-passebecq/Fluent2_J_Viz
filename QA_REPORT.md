# VizForge V1 QA report

Verification date: 2026-09-05. Scope: this repository’s standalone web engine, React adapter and studio. Datapass and Power BI are separate adapter milestones.

## Verified locally

| Gate                     | Evidence / outcome                                                                                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen install           | `npm ci --no-fund` completed from the checked-in lockfile; 0 audited vulnerabilities.                                                                                                                                        |
| Spec validation          | `npm run validate`: all 10 families and the cross-family editorial story parse; checked-in JSON matches canonical authoring source exactly.                                                                                  |
| Typecheck                | `tsc --noEmit` passes in strict mode.                                                                                                                                                                                        |
| Deterministic unit tests | 76 tests pass across contracts, playback, all family renderers, analytical math and import boundaries.                                                                                                                       |
| Production build         | Vite studio + standalone entries, plus typed ESM library emission, pass.                                                                                                                                                     |
| Production browser tests | 30 Chromium tests pass across 1440 × 1100 desktop and 390 × 844 phone viewports.                                                                                                                                             |
| Standalone D3 renderer   | `/standalone.html` mounts canonical ranking through the DOM host seam; next updates its scene.                                                                                                                               |
| React adapter            | Studio mounts/updates/destroys the renderer under React StrictMode; scene playback and spec replacement work.                                                                                                                |
| Actual motion            | Tests sample a bar during its 650ms transition, verify intermediate Y lies between endpoints, retain the exact DOM object, interrupt the next move with reset, and verify the original endpoint remains after timers finish. |
| Keyboard playback        | Scoped left/right/Home navigation, play/pause and reset pass in both viewport projects.                                                                                                                                      |
| Reduced motion           | OS reduced-motion preference yields zero-duration rendering in every canonical scene, with identical scene order and endpoint semantics.                                                                                     |
| Accessibility            | Axe scans every one of the 31 canonical scenes at both widths, plus the catalog. Serious/critical violations: 0.                                                                                                             |
| Overflow                 | No page-level horizontal overflow in any canonical scene at either tested width. Wide tables/matrices have their own labeled keyboard-focusable scroll region.                                                               |
| Editing/export           | Invalid JSON/specs show an error without replacing the current figure. Valid specs reset playback and render. Canonical JSON download is exercised. SVG export settles and serializes a chart with source/note metadata.     |
| Framework independence   | Automated import-boundary tests prevent core/renderers from importing React, Fluent, Datapass, ConceptMotion or Power BI.                                                                                                    |

Runtime used for local verification: bundled Node.js 24.19.0, npm 10.5.0, Playwright 1.63.0, Chromium 153.0.8010.12. The system’s Node 21 installation is outside the supported range; the repository declares Node >=22. The CI workflow uses Node 22 and has been authored, but a hosted CI run was not performed in this task.

## Test coverage details

- Validation: versioning, unknown fields, missing encodings, duplicate entity/time keys, invalid scene/focus/annotation references, reserved IDs, negative ranking/bubble magnitudes, nonfinite values, inverted domains, cyclic/dangling flows, invalid forecast intervals and observed/forecast order, hierarchy cycles and non-leaf/duplicate matrix cells.
- Player: no autoplay, exact clock boundaries, idempotent play, fresh resume interval, final-state stop, clamped manual navigation, seek bounds, repeated reset, frozen snapshots and disposal.
- Renderer: all ten families, every scene, two widths, no NaN/Infinity, title/source metadata, stable keyed ranking DOM and cumulative event nodes, text escaping, mount/dispose and exact reset.
- Analytics: signed formatting, zero values, non-mutating sort, table subtotal/grand-total reconciliation, independent multiple measures, leaf-based sums/means, missing versus zero and geographic domain framing.
- Browser: semantic spec editing, cross-family chapter transitions, catalog search, source data disclosures in the DOM, keyboard playback, OS reduced motion, actual interpolation and all-scene Axe scans.

## Visual proof

Each family has `docs/qa/desktop-<family>.png` and `docs/qa/phone-<family>.png`. Corresponding `*-axe.json` files record every scene’s findings. These are final-scene screenshots, not substitutes for the motion assertions.

Visual review identified and corrected low-contrast studio metadata, overly dimmed context labels, and a phone bubble-chart caption collision. Focus now dims graphical marks while retaining readable context labels. Table focus emphasizes rows without fading numerical text below readable contrast. Phone annotations show the first callout and disclose the rest.

The browser suite runs on dedicated port 43871 and refuses to reuse an existing server. A previous trial collided with another local application on the default preview port; that application was left untouched. Those failed routing trials are not integration evidence.

## Deferred release gate and limits

**Real Datapass FigureView integration has not been run.** The pack explicitly defers the final framework pin and bootstrap until the external seam pass supplies an exact confirmed SHA. `DATAPASS_INTEGRATION.md` records the concrete follow-up procedure. The local host adapter is not presented as that proof, and the full cross-repository release gate remains open.

Power BI remains an adapter/export plan, with no `.pbiviz` or certification claim. Tests use synthetic fixtures, not production-scale datasets. Browser proof covers Chromium, not all browser engines or physical phones. Dense labeling, large data, antimeridian geography, weighted analytical measures, and customized dark themes require additional host-specific validation. No external publication or deployment occurred.
