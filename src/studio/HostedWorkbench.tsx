import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { FigurePlayer } from '@datapass/figure';
import { Workbench } from '@datapass/ui';
import type { StorySpec } from '../core/spec.js';
import type { Renderer } from '../renderers/dom.js';
import { RenderHandle, storyFigure, vizforgeRegistry } from './datapass.js';
import { download, exportSvg } from './export.js';
import { StoryInspector } from './StoryInspector.js';
import { DataLineage } from './DataLineage.js';
// Shortcuts activate native actions; only FigurePlayer owns playback.
function playbackShortcut(event: KeyboardEvent<HTMLElement>) {
  if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
  const labels: Record<string, string> = { ArrowRight: 'Next', ArrowLeft: 'Previous', Home: 'Reset' };
  const buttons = [
    ...event.currentTarget.querySelectorAll<HTMLButtonElement>('.dp-timeline-controls button'),
  ];
  const label = labels[event.key];
  const button =
    event.key === ' '
      ? buttons.find((button) => ['Play', 'Pause'].includes(button.getAttribute('aria-label') ?? ''))
      : label
        ? buttons.find(
            (button) => (button.getAttribute('aria-label') ?? button.textContent)?.trim() === label,
          )
        : undefined;
  if (button) {
    event.preventDefault();
    button.click();
  }
}
export function HostedWorkbench({
  story,
  tag,
  reduced,
  setReduced,
  load,
  notify,
}: {
  story: StorySpec;
  tag: string;
  reduced: boolean;
  setReduced: (value: boolean) => void;
  load: (story: StorySpec) => void;
  notify: (message: string) => void;
}) {
  const [frame, setFrame] = useState(0);
  const scene = story.scenes[frame];
  const visual = story.visuals.find((visual) => visual.id === scene.visualId)!;
  const annotations = visual.annotations.filter((annotation) => scene.annotationIds.includes(annotation.id));
  const figure = useMemo(() => storyFigure(story), [story]);
  const renderHandle = useRef<Renderer | null>(null);
  const playerHost = useRef<HTMLElement>(null);
  function seek(index: number) {
    playerHost.current
      ?.querySelector<HTMLButtonElement>('.dp-timeline-controls button[aria-label="Pause"]')
      ?.click();
    setFrame(index);
  }
  return (
    <>
      <div className="studio-toolbar">
        <div>
          <span className="live-dot" />
          <strong>Story workbench</strong>
          <span className="toolbar-divider" />
          <span>{tag}</span>
        </div>
        <div className="toolbar-actions">
          <label className="motion-toggle">
            <input type="checkbox" checked={reduced} onChange={(event) => setReduced(event.target.checked)} />{' '}
            Reduce motion
          </label>
          <button
            className="text-button"
            onClick={() => download(JSON.stringify(story, null, 2), `${story.id}.json`, 'application/json')}
          >
            Export spec ↓
          </button>
        </div>
      </div>
      <Workbench
        className="integrated-workbench"
        canvasLabel="Story canvas"
        canvas={
          <div className="evidence-canvas">
            {story.id === 'real-gdp-editorial' && <DataLineage />}
            <section
              ref={playerHost}
              className="story-panel"
              tabIndex={0}
              role="region"
              aria-label="Story preview"
              onKeyDown={playbackShortcut}
            >
              <div className="narrative">
                <span className="narrative-index">{String(frame + 1).padStart(2, '0')}</span>
                <div>
                  <span className="eyebrow">{scene.chapter ?? 'THE STORY'}</span>
                  <h2>{scene.title}</h2>
                </div>
              </div>
              <aside className="scene-explanation" aria-label="Current scene explanation">
                <div className="scene-explanation-copy">
                  <span className="scene-explanation-label">WHAT HAPPENS IN THIS STEP</span>
                  <p>{scene.caption}</p>
                </div>
                {annotations.length > 0 && (
                  <div className="scene-focus-copy">
                    <span className="scene-explanation-label">LOOK HERE</span>
                    <ul>
                      {annotations.map((annotation) => (
                        <li key={annotation.id}>
                          <span className={annotation.shortText ? 'annotation-full' : undefined}>{annotation.text}</span>
                          {annotation.shortText && <span className="annotation-short">{annotation.shortText}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
              <RenderHandle.Provider value={renderHandle}>
                <FigurePlayer
                  figure={figure}
                  registry={vizforgeRegistry}
                  stepCount={story.scenes.length}
                  frameIndex={frame}
                  onFrameChange={setFrame}
                  captions={story.scenes.map((scene) => scene.caption)}
                  reducedMotion={reduced || undefined}
                  presentationSize="compact"
                  showInspector={false}
                  source={visual.source}
                  note={visual.note}
                  fallbackMode="details"
                  exportAction={
                    <button
                      className="text-button"
                      disabled={visual.type === 'table' || visual.type === 'matrix'}
                      onClick={() => {
                        if (exportSvg(renderHandle.current, `${visual.id}-${scene.id}.svg`))
                          notify('Current scene exported as a static SVG. Source and note are retained.');
                      }}
                    >
                      Export current figure as SVG
                    </button>
                  }
                />
              </RenderHandle.Provider>
            </section>
          </div>
        }
        inspector={<StoryInspector story={story} frame={frame} seek={seek} load={load} />}
      />
    </>
  );
}
