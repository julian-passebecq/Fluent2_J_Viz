import { dataPlatformFigure, medallionLineage } from '@datapass/canonical/data-platform';
import { createDefaultFigureRendererRegistry, FigureView } from '@datapass/figure';
import type { FigureSpec } from '@datapass/content';

// Consumer-authored content adaptation of the accepted canonical topology.
// All layout, geometry, validation and selection stay in Datapass/ConceptMotion.
const labels = [
  'World Bank API',
  'Pinned JSON',
  'Validated rows',
  'GDP in US$ tn',
  'Five-economy sum',
  'Country share KPI',
];
const ids = [
  'source.world-bank',
  'bronze.gdp-json',
  'silver.country-years',
  'gold.gdp-trillions',
  'semantic.selected-gdp',
  'kpi.country-share',
];
const assetId = (id: string) => ids[medallionLineage.assets.findIndex((asset) => asset.id === id)];
const lineage = {
  ...medallionLineage,
  id: 'gdp-source-to-kpi',
  title: 'Where the GDP share comes from',
  description: 'An explanation of the local data transformations, not an executing lakehouse.',
  assets: medallionLineage.assets.map((asset, i) => ({ ...asset, id: ids[i], label: labels[i] })),
  relations: medallionLineage.relations.map((relation, i) => ({
    ...relation,
    sources: relation.sources.map((source) => ({ ...source, assetId: assetId(source.assetId) })),
    target: { ...relation.target, assetId: assetId(relation.target.assetId) },
    label: [
      'Pin raw response',
      'Check complete country-years',
      'Divide dollars by one trillion',
      'Sum the five selected economies',
      'Country value / selected sum',
    ][i],
  })),
};
export const gdpLineageFigure: FigureSpec = {
  ...dataPlatformFigure('medallion-asset-lineage'),
  id: lineage.id,
  title: lineage.title,
  spec: JSON.parse(JSON.stringify(lineage)),
  sourceIds: ['world-bank-gdp'],
  verifiedAt: '2026-09-06',
  fallbackText:
    'World Bank source → Bronze pinned JSON → Silver 120 validated country-year observations → Gold GDP in US$ trillions → semantic model summing five selected economies → KPI: country GDP divided by that sum. This is not world GDP share.',
};
export const lineageRegistry = createDefaultFigureRendererRegistry();

export function DataLineage() {
  return (
    <section className="lineage-panel" aria-label="Data lineage">
      <span className="eyebrow">FOLLOW THE EVIDENCE / SOURCE TO KPI</span>
      <p className="lineage-hint">
        Trace the pinned source into the selected GDP share. On narrow screens, scroll the diagram
        horizontally.
      </p>
      <div
        className="lineage-scroll"
        tabIndex={0}
        role="region"
        aria-label="Source to KPI diagram, scroll horizontally"
      >
        <div className="lineage-readable">
          <FigureView
            figure={gdpLineageFigure}
            registry={lineageRegistry}
            presentationSize="compact"
            reducedMotion
            source="World Bank snapshot · local transformation recipe"
            note="Canonical Datapass medallion topology, adapted to this dataset. Layer names explain responsibilities; no services are running."
            fallbackMode="details"
          />
        </div>
      </div>
    </section>
  );
}
