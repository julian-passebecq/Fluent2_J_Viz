# Parallel integration protocol

VizForge core development can run immediately.

In parallel, Datapass framework Codex may create one compatible commit after `19c87dceeaac4ef6a1f642a28ef0033a140c8545` proving/documenting external renderer registration and scaffold choice.

Until then:
- build VizForge spec/renderer/core tests;
- keep Datapass adapter thin/provisional;
- do not modify Datapass.

When the framework seam pass finishes:
1. receive exact new SHA;
2. update VizForge framework pin deliberately;
3. bootstrap via official external-consumer mechanism;
4. update/commit VizForge consumer lockfile;
5. register `vizforge.d3`;
6. prove one canonical VizForge visual inside real `FigureView`;
7. run production desktop + 390px + keyboard + Axe + overflow;
8. document in `DATAPASS_INTEGRATION.md`.

First cross-repo milestone: Animated Ranking inside real Datapass FigureView.
