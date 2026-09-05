import { createContext, useContext, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import type { FigureSpec } from '@datapass/content';
import { createDefaultFigureRendererRegistry, type FigureRendererAdapter } from '@datapass/figure';
import { datapassSurfaceTokens as surfaces } from '@datapass/ui';
import { parseStory, type StorySpec } from '../core/spec.js';
import { createRenderer, type Renderer } from '../renderers/dom.js';

// An export handle, never a playback controller. Only FigurePlayer owns the clock.
export const RenderHandle = createContext<RefObject<Renderer | null> | null>(null);
export function HostedScene({ story, frameIndex, reducedMotion }: {
  story: StorySpec; frameIndex: number; reducedMotion: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const renderer = useRef<Renderer | null>(null);
  const handle = useContext(RenderHandle);
  const scene = story.scenes[Math.min(story.scenes.length - 1, Math.max(0, Math.floor(frameIndex)))];
  const visual = useMemo(() => {
    const spec = story.visuals.find(item => item.id === scene.visualId)!;
    return { ...spec, theme: { ...spec.theme, ink: surfaces.inkPrimary,
      muted: surfaces.inkSecondary, grid: surfaces.borderSubtle, background: surfaces.surfaceBase } };
  }, [story, scene.visualId]);
  useLayoutEffect(() => {
    const instance = createRenderer(host.current!);
    renderer.current = instance;
    if (handle) handle.current = instance;
    return () => { instance.destroy(); renderer.current = null; if (handle) handle.current = null; };
  }, [handle]);
  useLayoutEffect(() => {
    renderer.current?.update(visual, scene, { reducedMotion, animate: true });
  }, [visual, scene, reducedMotion]);
  return <div ref={host} className="vf-react-figure" data-vizforge-host="datapass" />;
}

export function storyFigure(story: StorySpec): FigureSpec {
  return { id: story.id, kind: 'concept', rendererId: 'vizforge.d3', title: story.title,
    subtitle: story.description, takeaway: story.visuals[0].takeaway,
    fallbackText: story.scenes.map(scene => `${scene.title}. ${scene.caption}`).join(' '), spec: story };
}

const validatedStories = new WeakMap<object, StorySpec>();
function validated(input: unknown): StorySpec {
  if (input && typeof input === 'object') {
    const cached = validatedStories.get(input);
    if (cached) return cached;
    const story = parseStory(input);
    validatedStories.set(input, story);
    return story;
  }
  return parseStory(input);
}
export const vizforgeAdapter: FigureRendererAdapter = {
  id: 'vizforge.d3',
  validate: figure => { try { validated(figure.spec); return []; }
    catch (error) { return [error instanceof Error ? error.message : String(error)]; } },
  render: ({ figure, frameIndex = 0, reducedMotion }) =>
    <HostedScene story={validated(figure.spec)} frameIndex={frameIndex} reducedMotion={reducedMotion} />,
};
export const vizforgeRegistry = createDefaultFigureRendererRegistry().register(vizforgeAdapter);
