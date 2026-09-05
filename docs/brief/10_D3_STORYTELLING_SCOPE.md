# D3 storytelling scope addendum

The user explicitly wants a lane inspired by strong D3 editorial storytelling: earthquake explainers, city/flood stories, time-evolving line charts, animated comparisons, and category stories similar in spirit to memorable long-form data pieces.

## Product interpretation for V1

Do **not** try to build a full scrollytelling CMS.

Instead, build a reusable **story engine** with these concepts:
- `StorySpec`
- `Scene[]`
- each scene references one visualization family and one semantic state
- each scene may include title, caption, annotation, focus targets and transition intent
- the player supports next / previous / play / pause / reset

This gives us the reusable core needed for:
- website explainers
- embedded figures
- later long-form storytelling wrappers
- possible future Power BI subset exports

## Minimal V1 storytelling templates

1. **Line comparison story**
   - several series over time
   - direct labels
   - narrative annotations
   - focus on one or a few series at key moments

2. **Animated ranking / bar race story**
   - entities reorder by value over time
   - rank and delta readable at pause

3. **Bubble / scatter evolution story**
   - entities move in 2D over time
   - optional size encoding

4. **Map / event story**
   - event points or symbols reveal over time
   - step focus and short annotations
   - web-first, keep base geography simple

5. **Editorial explainer wrapper**
   - sequence of scenes across one or more chart types
   - shared captioning and navigation
   - this is the minimal bridge toward earthquake / city / James-Bond-style category explainers

## Concrete example topics to validate against

Use simple synthetic or public-friendly sample data if needed, but the structure should support topics such as:
- stock evolution of several companies over time
- GDP comparison between countries
- processor performance / AI power consumption over time
- earthquakes over time on a map
- category timelines or franchise evolution stories

The point is reusable storytelling grammar, not topic-specific hardcoding.
