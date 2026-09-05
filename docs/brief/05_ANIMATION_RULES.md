# Animation rules

Animation is explanatory, not decorative.

Use stable keyed identity. The same entity must remain the same visual object across steps.
Support play/pause/previous/next/reset, deterministic steps, autoplay off, reduced motion.
Motion may encode:
- time progression
- ranking change
- comparison shift
- flow magnitude
- causal stage
- focus / reveal
- entry / exit where semantically real

Avoid meaningless pulses, camera gimmicks or perpetual ambient motion.

For D3 storytelling, standardize three reusable transition patterns:
1. **morph/update** — same entities update position/size/value over time;
2. **focus/reveal** — annotation, highlight, dimming, callouts and spotlight;
3. **scene transition** — one step/chapter to the next, preserving context whenever possible.

A story scene should end in a readable paused state.
Phone layouts must simplify annotation density rather than becoming illegible.
