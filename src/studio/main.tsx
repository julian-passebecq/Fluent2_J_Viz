import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from '@datapass/ui';
import { catalog, flagshipStories, type CatalogEntry } from '../examples/index.js';
import type { StorySpec } from '../core/spec.js';
import { StudioShell } from './StudioShell.js';
import { Catalog, RelatedStories } from './Catalog.js';
import { HostedWorkbench } from './HostedWorkbench.js';
import '@datapass/ui/styles.css';
import './studio.css';

function Studio() {
  const [active, setActive] = useState(
    flagshipStories.find((entry) => entry.id === new URLSearchParams(location.search).get('story')) ??
      catalog[0],
  );
  const [story, setStory] = useState(active.story);
  const [revision, setRevision] = useState(0);
  const [view, setView] = useState<'studio' | 'catalog'>('studio');
  const [reduced, setReduced] = useState(false);
  const [notice, setNotice] = useState('');
  function load(story: StorySpec) {
    setStory(story);
    setRevision((value) => value + 1);
    setView('studio');
    setNotice('Canonical story loaded. Playback reset to the first scene.');
  }
  function choose(entry: CatalogEntry) {
    setActive(entry);
    load(entry.story);
  }
  return (
    <StudioShell view={view} setView={setView} active={active} choose={choose}>
      <div className="main">
        <div className="breadcrumbs">
          Workspace <span>/</span> {view === 'catalog' ? 'Visual catalog' : 'Story studio'} <span>/</span>
          <strong>{view === 'catalog' ? 'All families' : active.name}</strong>
        </div>
        <div className="page-heading">
          <div>
            <div className="eyebrow">DATA, WITH A POINT OF VIEW</div>
            <h1>{view === 'catalog' ? 'A language for every insight.' : 'Make the change visible.'}</h1>
            <p>
              {view === 'catalog'
                ? `${catalog.length} analytical families, 22 synthetic examples and four real-data flagship stories.`
                : 'Turn a sequence of numbers into a story worth following.'}
            </p>
          </div>
          <button
            className="button secondary"
            onClick={() => setView(view === 'catalog' ? 'studio' : 'catalog')}
          >
            {view === 'catalog' ? '← Back to studio' : 'Browse the catalog ↗'}
          </button>
        </div>
        {view === 'catalog' ? (
          <Catalog choose={choose} />
        ) : (
          <>
            <HostedWorkbench
              key={revision}
              story={story}
              tag={active.tag}
              reduced={reduced}
              setReduced={setReduced}
              load={load}
              notify={setNotice}
            />
            <div className="workspace-footer">
              <span>
                <span className="live-dot" />{' '}
                {notice ||
                  (active.id.startsWith('flagship-')
                    ? 'Canonical spec validated · Pinned real data · No runtime data requests'
                    : 'Canonical spec validated · Synthetic demonstration data')}
              </span>
              <span>Web-first / Adapter-ready</span>
            </div>
            <RelatedStories active={active} choose={choose} browse={() => setView('catalog')} />
          </>
        )}
        <footer className="page-footer">
          <span>vizforge / Analytical clarity, by design.</span>
          <span>Semantic specs → meaningful stories</span>
        </footer>
        <div className="sr-only" role="status">
          {notice}
        </div>
      </div>
    </StudioShell>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <Studio />
    </LocaleProvider>
  </React.StrictMode>,
);
