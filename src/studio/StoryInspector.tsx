import { useState } from 'react';
import { InspectorPanel } from '@datapass/ui';
import { editorialStory } from '../examples/index.js';
import type { StorySpec } from '../core/spec.js';
import { SpecEditor } from './SpecEditor.js';
export function StoryInspector({
  story,
  frame,
  seek,
  load,
}: {
  story: StorySpec;
  frame: number;
  seek: (frame: number) => void;
  load: (story: StorySpec) => void;
}) {
  const [mode, setMode] = useState<'story' | 'spec'>('story');
  return (
    <InspectorPanel title="Story inspector" className="inspector">
      <div className="inspector-tabs" role="group" aria-label="Inspector mode">
        <button aria-pressed={mode === 'story'} onClick={() => setMode('story')}>
          Story outline
        </button>
        <button aria-pressed={mode === 'spec'} onClick={() => setMode('spec')}>
          Semantic spec
        </button>
      </div>
      {mode === 'spec' ? (
        <SpecEditor story={story} apply={load} />
      ) : (
        <>
          <div className="inspector-intro">
            <span className="eyebrow">A STORY IN {story.scenes.length} SCENES</span>
            <h3>One step at a time.</h3>
            <p>Every scene leaves a readable view. Take it at your own pace.</p>
          </div>
          <ol className="scene-list">
            {story.scenes.map((scene, index) => (
              <li key={scene.id}>
                <button
                  aria-label={`Scene ${index + 1}: ${scene.title}`}
                  aria-current={index === frame ? 'step' : undefined}
                  onClick={() => seek(index)}
                >
                  <span className="scene-number">
                    {index < frame ? '✓' : String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <strong>{scene.title}</strong>
                    <small>
                      {scene.state.time ?? `Scene ${index + 1}`} ·{' '}
                      {scene.focusIds.length ? 'Focused view' : 'Full context'}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="spec-summary">
            {[
              ['Spec version', story.version],
              ['Renderer', 'vizforge.d3'],
              ['Playback', 'Datapass FigurePlayer'],
              ['Autoplay', 'Off by default'],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <button className="editorial-button" onClick={() => load(editorialStory)}>
            Try a multi-figure story <span>↗</span>
          </button>
        </>
      )}
    </InspectorPanel>
  );
}
