import type { ReactNode } from 'react';
import { AppShell } from '@datapass/ui';
import { catalog, type CatalogEntry } from '../examples/index.js';
import { Glyph } from './Glyph.js';
export function StudioShell({
  view,
  setView,
  active,
  choose,
  children,
}: {
  view: 'studio' | 'catalog';
  setView: (view: 'studio' | 'catalog') => void;
  active: CatalogEntry;
  choose: (entry: CatalogEntry) => void;
  children: ReactNode;
}) {
  return (
    <AppShell
      className="app-shell"
      mainId="main"
      mainLabel="VizForge workspace"
      topBar={
        <header className="topbar">
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
              Visual catalog <span>{catalog.length}</span>
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
        </header>
      }
      sideNav={
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span>YOUR TOOLKIT</span>
            <span>01</span>
          </div>
          <button className="workspace-link" onClick={() => setView('studio')}>
            <span>▧</span> Editorial workspace <span>↗</span>
          </button>
          <div className="sidebar-heading family-heading">
            <span>VISUAL FAMILIES</span>
            <span>{catalog.length}</span>
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
        </aside>
      }
    >
      {children}
    </AppShell>
  );
}
