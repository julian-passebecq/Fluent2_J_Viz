import { useState } from 'react';
import { CatalogShell, SearchFilterBar } from '@datapass/ui';
import { catalog, type CatalogEntry } from '../examples/index.js';
import { Glyph } from './Glyph.js';
export function Catalog({ choose }: { choose: (entry: CatalogEntry) => void }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All families');
  const filtered = catalog.filter(
    (entry) =>
      (group === 'All families' || entry.group === group) &&
      `${entry.name} ${entry.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <CatalogShell
      resultsLabel="Visual catalog"
      header={
        <SearchFilterBar
          query={query}
          onQueryChange={setQuery}
          label="Search visual families"
          placeholder="Search visual families…"
          filters={
            <label>
              Group{' '}
              <select
                aria-label="Filter by group"
                value={group}
                onChange={(event) => setGroup(event.target.value)}
              >
                {['All families', 'Evolution', 'Comparison', 'Composition', 'Geography', 'Analytics'].map(
                  (group) => (
                    <option key={group}>{group}</option>
                  ),
                )}
              </select>
            </label>
          }
          actions={<span>{filtered.length} families</span>}
        />
      }
      results={
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
          {!filtered.length && <p>No families match that search. Clear the filter to explore again.</p>}
        </div>
      }
    />
  );
}
export function RelatedStories({
  active,
  choose,
  browse,
}: {
  active: CatalogEntry;
  choose: (entry: CatalogEntry) => void;
  browse: () => void;
}) {
  return (
    <section className="next-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">KEEP EXPLORING</span>
          <h2>A different question. A different view.</h2>
        </div>
        <button className="text-button" onClick={browse}>
          All visual families →
        </button>
      </div>
      <div className="related-grid">
        {catalog
          .filter((entry) => entry.id !== active.id)
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
  );
}
