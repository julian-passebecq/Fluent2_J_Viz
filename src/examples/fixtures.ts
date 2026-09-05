export const syntheticBase = (
  id: string,
  title: string,
  subtitle: string,
  takeaway: string,
  version: '1.0' | '1.1' = '1.1',
) => ({
  id,
  version,
  title,
  subtitle,
  takeaway,
  source: 'VizForge V1.1 synthetic fixtures, authored 2026-09-05',
  note: 'Synthetic data and fictional entities. Illustrative values, not observations or predictions.',
  accessibility: { summary: `${title}. ${takeaway}` },
});
export const encodings = { id: 'id', label: 'label', time: 'year', value: 'value' };
export function seriesRows(years: number[], series: { id: string; label: string; values: number[] }[]) {
  return series.flatMap((series) =>
    years.map((year, index) => ({ id: series.id, label: series.label, year, value: series.values[index] })),
  );
}
