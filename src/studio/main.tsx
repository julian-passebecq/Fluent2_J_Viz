import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FigurePlayer } from '@datapass/figure';
import { JsonSpecEditor } from '@datapass/code';
import { AppShell, LocaleProvider, Workbench } from '@datapass/ui';
import { RenderHandle, storyFigure, vizforgeRegistry } from './datapass.js';
import type { Renderer } from '../renderers/dom.js';
import '@datapass/ui/styles.css';
import { catalog, editorialStory, type CatalogEntry } from '../examples/index.js';
import { parseStory, type StorySpec } from '../core/spec.js';
import './studio.css';

function download(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Glyph({ family, small = false }: { family: string; small?: boolean }) {
  return (
    <svg className={small ? 'glyph small' : 'glyph'} viewBox="0 0 72 42" fill="none" aria-hidden="true">
      {family === 'ranking' ? (
        [46, 34, 55, 26].map((w, i) => (
          <rect
            key={i}
            x="8"
            y={5 + i * 9}
            width={w}
            height="5"
            rx="2"
            fill="currentColor"
            opacity={1 - i * 0.15}
          />
        ))
      ) : family === 'scatter' || family === 'event-map' ? (
        [
          [17, 29, 7],
          [34, 17, 10],
          [57, 10, 5],
          [55, 32, 7],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={0.25 + i * 0.18} />
        ))
      ) : family === 'table' || family === 'matrix' ? (
        [8, 18, 28, 38].map((y, i) => (
          <g key={y}>
            <path d={`M8 ${y} H64`} stroke="currentColor" opacity=".25" />
            <rect
              x={family === 'matrix' ? 18 : 33}
              y={y - 5}
              width={17 + i * 3}
              height="3"
              fill="currentColor"
              opacity=".6"
            />
          </g>
        ))
      ) : family === 'dumbbell' ? (
        [10, 21, 32].map((y, i) => (
          <g key={y}>
            <path d={`M${10 + i * 7} ${y} H${59 - i * 4}`} stroke="currentColor" />
            <circle cx={10 + i * 7} cy={y} r="3" stroke="currentColor" />
            <circle cx={59 - i * 4} cy={y} r="3" fill="currentColor" />
          </g>
        ))
      ) : family === 'flow' ? (
        <>
          <path
            d="M10 9C33 9 34 30 62 30M10 28C35 28 32 10 62 10"
            stroke="currentColor"
            strokeWidth="10"
            opacity=".25"
          />
          <path d="M10 9C35 9 34 10 62 10" stroke="currentColor" strokeWidth="8" opacity=".7" />
        </>
      ) : family === 'contribution' ? (
        <>
          <path
            d="M8 35V21H18V35M24 21V9H34V21M40 9V17H50V9M56 35V17H66V35"
            fill="currentColor"
            opacity=".7"
          />
        </>
      ) : (
        <>
          <path d="M5 34L19 30 33 26 47 16 67 5" stroke="currentColor" strokeWidth="2.5" />
          <path d="M5 20L19 18 33 19 47 14 67 12" stroke="currentColor" strokeWidth="2" opacity=".3" />
          <path d="M5 36L19 33 33 28 47 22 67 13" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
        </>
      )}
    </svg>
  );
}
function Studio() {
  const [active, setActive] = useState<CatalogEntry>(catalog[0]);
  const [story, setStory] = useState<StorySpec>(active.story);
  const [view, setView] = useState<'studio' | 'catalog'>('studio');
  const [query, setQuery] = useState(''),
    [group, setGroup] = useState('All families');
  const [inspector, setInspector] = useState<'story' | 'spec'>('story');
  const [specText, setSpecText] = useState(JSON.stringify(story, null, 2));
  const [specError, setSpecError] = useState(''),
    [notice, setNotice] = useState('');
  const [reduced, setReduced] = useState(false);
  const [frame, setFrame] = useState(0);
  const scene = story.scenes[Math.min(frame, story.scenes.length - 1)];
  const visual = story.visuals.find(v => v.id === scene.visualId)!;
  const figure = useMemo(() => storyFigure(story), [story]);
  const renderHandle = useRef<Renderer | null>(null);
  useEffect(() => {
    setFrame(0);
    setSpecText(JSON.stringify(story, null, 2));
    setSpecError('');
  }, [story]);
  function choose(entry: CatalogEntry) {
    setActive(entry);
    setStory(entry.story);
    setView('studio');
    setNotice('');
  }
  function applySpec() {
    try {
      const parsed = parseStory(JSON.parse(specText));
      setStory(parsed);
      setNotice('Valid spec applied. Playback reset to the first scene.');
      setSpecError('');
    } catch (error) {
      setSpecError(error instanceof Error ? error.message : 'Invalid specification');
    }
  }
  function exportSVG() {
    const renderer = renderHandle.current;
    renderer?.settle();
    const svg = renderer?.element.querySelector('svg.vf-chart');
    if (!svg) { setNotice('Analytical tables are available in JSON export; SVG export supports charts.'); return; }
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('font-family', 'system-ui, sans-serif');
    download(new XMLSerializer().serializeToString(clone), `${visual.id}-${scene.id}.svg`, 'image/svg+xml');
    setNotice('Current scene exported as a static SVG. Source and note are retained in the JSON spec.');
  }
  const filtered = catalog.filter(
    (c) =>
      (group === 'All families' || c.group === group) &&
      `${c.name} ${c.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <AppShell className="app-shell" mainId="main" mainLabel="VizForge workspace" topBar={<header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView('studio');
          }}
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          vizforge<span className="version">V1.1</span>
        </a>
        <nav className="topnav" aria-label="Workspace">
          <button className={view === 'studio' ? 'active' : ''} onClick={() => setView('studio')}>
            Story studio
          </button>
          <button
            aria-label="Visual catalog"
            className={view === 'catalog' ? 'active' : ''}
            onClick={() => setView('catalog')}
          >
            Visual catalog <span>10</span>
          </button>
        </nav>
        <a
          className="docs-link"
          href="https://github.com/julian-passebecq/Fluent2_J_Viz"
          target="_blank"
          rel="noreferrer"
        >
          Repository ↗
        </a>
        <div className="workspace-status">
          <span /> Local workspace
        </div>
      </header>} sideNav={<aside className="sidebar">
        <div className="sidebar-heading">
          <span>YOUR TOOLKIT</span>
          <span>01</span>
        </div>
        <button className="workspace-link" onClick={() => setView('studio')}>
          <span>▧</span> Editorial workspace <span>↗</span>
        </button>
        <div className="sidebar-heading family-heading">
          <span>VISUAL FAMILIES</span>
          <span>10</span>
        </div>
        <nav className="family-nav" aria-label="Visual families">
          {catalog.map((entry) => (
            <button
              key={entry.id}
              aria-label={entry.name}
              aria-current={active.id === entry.id && view === 'studio' ? 'page' : undefined}
              onClick={() => choose(entry)}
            >
              <Glyph family={entry.id} small />
              <span>{entry.name}</span>
              {active.id === entry.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="eyebrow">ONE SPEC. MANY STORIES.</span>
          <p>
            Built for the web.
            <br />
            Ready to travel.
          </p>
          <div className="core-badge">◇ &nbsp; Independent D3 core</div>
        </div>
      </aside>}>
      <div className="main">
        <div className="breadcrumbs">
          Workspace <span>/</span> {view === 'catalog' ? 'Visual catalog' : 'Story studio'} <span>/</span>{' '}
          <strong>{view === 'catalog' ? 'All families' : active.name}</strong>
        </div>
        <div className="page-heading">
          <div>
            <div className="eyebrow">DATA, WITH A POINT OF VIEW</div>
            <h1>{view === 'catalog' ? 'A language for every insight.' : 'Make the change visible.'}</h1>
            <p>
              {view === 'catalog'
                ? 'Ten analytical families. One shared language for data and storytelling.'
                : 'Turn a sequence of numbers into a story worth following.'}
            </p>
          </div>
          <button
            className="button secondary"
            onClick={() => {
              setView(view === 'catalog' ? 'studio' : 'catalog');
            }}
          >
            {view === 'catalog' ? '← Back to studio' : 'Browse the catalog ↗'}
          </button>
        </div>
        {view === 'catalog' ? (
          <section aria-label="Visual catalog">
            <div className="catalog-filters">
              <label>
                <span className="sr-only">Search visual families</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search visual families…"
                />
              </label>
              <label>
                <span className="sr-only">Filter families</span>
                <select value={group} onChange={(e) => setGroup(e.target.value)}>
                  {['All families', 'Evolution', 'Comparison', 'Composition', 'Geography', 'Analytics'].map(
                    (g) => (
                      <option key={g}>{g}</option>
                    ),
                  )}
                </select>
              </label>
              <span>{filtered.length} families</span>
            </div>
            <div className="catalog-grid">
              {filtered.map((entry) => (
                <button className="catalog-card" key={entry.id} onClick={() => choose(entry)}>
                  <div className="card-art">
                    <Glyph family={entry.id} />
                    <span>↗</span>
                  </div>
                  <div className="card-copy">
                    <span className="eyebrow">{entry.tag}</span>
                    <h2>{entry.name}</h2>
                    <p>{entry.description}</p>
                    <span className="card-footer">
                      {entry.story.scenes.length} scenes <span>Open story →</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {!filtered.length && (
              <p className="empty-state">
                No families match that search. Try “ranking”, “table” or clear the filter.
              </p>
            )}
          </section>
        ) : (
          <>
            <div className="studio-toolbar">
              <div>
                <span className="live-dot" /> <strong>Story workbench</strong>
                <span className="toolbar-divider" /> <span>{active.tag}</span>
              </div>
              <div className="toolbar-actions">
                <label className="motion-toggle">
                  <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} />{' '}
                  Reduce motion
                </label>
                <button
                  className="text-button"
                  onClick={() =>
                    download(JSON.stringify(story, null, 2), `${story.id}.json`, 'application/json')
                  }
                >
                  Export spec ↓
                </button>
              </div>
            </div>
            <Workbench className="integrated-workbench" canvasLabel="Story canvas" canvas={
              <section className="story-panel" tabIndex={0} role="region" aria-label="Story preview"
                onKeyDown={event => {
                  if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
                  const labels: Record<string, string> = { ArrowRight: 'Next', ArrowLeft: 'Previous', Home: 'Reset' };
                  const label = labels[event.key];
                  const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('.dp-timeline-controls button')];
                  const button = buttons.find(b => (b.getAttribute('aria-label') ?? b.textContent)?.trim() === label);
                  if (button && label) { event.preventDefault(); button.click(); }
                }}>
                <RenderHandle.Provider value={renderHandle}>
                  <FigurePlayer key={story.id} figure={figure} registry={vizforgeRegistry}
                    stepCount={story.scenes.length} frameIndex={frame} onFrameChange={setFrame}
                    captions={story.scenes.map(s => s.title + '. ' + s.caption)}
                    reducedMotion={reduced || undefined} presentationSize="compact" showInspector={false}
                    source={visual.source} note={visual.note} fallbackMode="details"
                    exportAction={<button className="text-button" onClick={exportSVG} disabled={visual.type === 'table' || visual.type === 'matrix'}>Export current figure as SVG</button>} />
                </RenderHandle.Provider>
                <div className="narrative" aria-live="polite" aria-atomic="true">
                  <span className="narrative-index">{String(frame + 1).padStart(2, '0')}</span>
                  <div><span className="eyebrow">{scene.chapter ?? 'THE STORY'}</span><h2>{scene.title}</h2><p>{scene.caption}</p></div>
                </div>
              </section>
            } inspector={
              <aside className="inspector" aria-label="Story inspector">
                <div className="inspector-tabs" role="group" aria-label="Inspector mode">
                  <button aria-pressed={inspector === 'story'} onClick={() => setInspector('story')}>
                    Story outline
                  </button>
                  <button aria-pressed={inspector === 'spec'} onClick={() => setInspector('spec')}>
                    Semantic spec
                  </button>
                </div>
                {inspector === 'story' ? (
                  <>
                    <div className="inspector-intro">
                      <span className="eyebrow">A STORY IN {story.scenes.length} SCENES</span>
                      <h2>One step at a time.</h2>
                      <p>Every scene leaves a readable view. Take it at your own pace.</p>
                    </div>
                    <ol className="scene-list">
                      {story.scenes.map((s, i) => (
                        <li key={s.id}>
                          <button
                            aria-label={`Scene ${i + 1}: ${s.title}`}
                            aria-current={i === frame ? 'step' : undefined}
                            onClick={() => setFrame(i)}
                          >
                            <span className="scene-number">
                              {i < frame ? '✓' : String(i + 1).padStart(2, '0')}
                            </span>
                            <span>
                              <strong>{s.title}</strong>
                              <small>
                                {s.state.time !== undefined ? s.state.time : `Scene ${i + 1}`} <span>·</span>{' '}
                                {s.focusIds.length ? 'Focused view' : 'Full context'}
                              </small>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                    <div className="spec-summary">
                      <div>
                        <span>Spec version</span>
                        <strong>1.0</strong>
                      </div>
                      <div>
                        <span>Renderer</span>
                        <strong>vizforge.d3</strong>
                      </div>
                      <div>
                        <span>Playback</span>
                        <strong>Step-based</strong>
                      </div>
                      <div>
                        <span>Autoplay</span>
                        <strong>Off by default</strong>
                      </div>
                    </div>
                    <button
                      className="editorial-button"
                      onClick={() => {
                        setStory(editorialStory);
                        setNotice('Cross-family explainer loaded: line → ranking → KPI.');
                      }}
                    >
                      Try a multi-figure story <span>↗</span>
                    </button>
                  </>
                ) : (
                  <div className="spec-editor">
                    <label htmlFor="spec-text">Canonical StorySpec · JSON</label>
                    <p>Edit the data, encodings or narrative, then validate and apply.</p>
                    <JsonSpecEditor ariaLabel="Canonical StorySpec · JSON" value={specText} onChange={setSpecText}
                      height="420px" options={{ wordWrap: 'on', minimap: { enabled: false }, accessibilitySupport: 'on' }}
                      diagnostics={specError ? [{ severity: 'error', message: specError }] : []} />
                    <button className="button primary" onClick={applySpec}>
                      Validate & apply
                    </button>
                    <button
                      className="text-button"
                      onClick={() => {
                        setSpecText(JSON.stringify(story, null, 2));
                        setSpecError('');
                      }}
                    >
                      Revert draft
                    </button>
                    {specError && (
                      <pre id="spec-error" className="spec-error" role="alert">
                        {specError}
                      </pre>
                    )}
                  </div>
                )}
              </aside>
            } />
            <div className="workspace-footer">
              <span>
                <span className="live-dot" />{' '}
                {notice || 'Canonical spec validated · No external data connection'}
              </span>
              <span>
                Web-first <span> / </span> Adapter-ready
              </span>
            </div>
            <section className="next-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">KEEP EXPLORING</span>
                  <h2>A different question. A different view.</h2>
                </div>
                <button className="text-button" onClick={() => setView('catalog')}>
                  All visual families →
                </button>
              </div>
              <div className="related-grid">
                {catalog
                  .filter((c) => c.id !== active.id)
                  .slice(0, 3)
                  .map((entry) => (
                    <button key={entry.id} className="related-card" onClick={() => choose(entry)}>
                      <Glyph family={entry.id} />
                      <div>
                        <span className="eyebrow">{entry.tag}</span>
                        <h3>{entry.name}</h3>
                        <p>{entry.description}</p>
                      </div>
                      <span>↗</span>
                    </button>
                  ))}
              </div>
            </section>
          </>
        )}
        <footer className="page-footer">
          <span>
            vizforge <span> / </span> Analytical clarity, by design.
          </span>
          <span>Semantic specs → meaningful stories</span>
        </footer>
        <div className="sr-only" role="status">
          {notice}
        </div>
      </div>
    </AppShell>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider><Studio /></LocaleProvider>
  </React.StrictMode>,
);
