import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deepStrictEqual } from 'node:assert';

export const datasetDefinitions = [
  {
    id: 'world-bank-gdp',
    organization: 'World Bank, World Development Indicators',
    url: 'https://api.worldbank.org/v2/country/USA;CHN;DEU;JPN;IND/indicator/NY.GDP.MKTP.CD?date=2000:2023&format=json&per_page=1000',
    raw: 'data/raw/world-bank-gdp.json',
    output: 'data/world-bank-gdp.json',
    license: 'CC BY 4.0; credit World Bank and underlying national accounts providers.',
    licenseUrl: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD',
    fields: { id: 'ISO3', label: 'country name', year: 'calendar year', value: 'GDP, current US dollars' },
    transformation:
      'Keep the five requested economies and all 24 years, 2000–2023. Sort ISO3 then year. Preserve observed values without rounding. Story display divides by 1e12; composition divides by the five-economy sum, never world GDP.',
    missingValues: 'Reject missing, nonfinite, duplicate or incomplete observations; no interpolation.',
  },
  {
    id: 'usgs-tohoku',
    organization: 'U.S. Geological Survey, ComCat',
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2011-03-09&endtime=2011-03-12&minmagnitude=7&minlatitude=30&maxlatitude=42&minlongitude=135&maxlongitude=145&orderby=time-asc',
    raw: 'data/raw/usgs-tohoku.geojson',
    output: 'data/usgs-tohoku.json',
    license:
      'USGS-produced data: U.S. public domain. Credit USGS; only catalog facts, no third-party images.',
    licenseUrl: 'https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits',
    fields: {
      id: 'ComCat event ID',
      label: 'UTC date and preferred magnitude',
      place: 'ComCat place',
      time: 'UTC Unix milliseconds',
      longitude: 'degrees east',
      latitude: 'degrees north',
      depth: 'km',
      magnitude: 'preferred catalog magnitude',
      magnitudeType: 'USGS magnitude type',
      url: 'event record',
    },
    transformation:
      'Keep every returned event; sort UTC time then ID. Select catalog fields and derive a short UTC date/magnitude label. Equal-size symbols; magnitude is not encoded as energy, intensity or damage. Cumulative scenes retain earlier events.',
    missingValues:
      'Reject absent IDs, time, magnitude or coordinates. No invented events or interpolation. Query selects M≥7 in 30–42°N, 135–145°E, March 9 through March 12 00:00 UTC; not the full sequence.',
  },
  {
    id: 'natural-earth-japan',
    organization: 'Natural Earth',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_110m_admin_0_countries.geojson',
    raw: 'data/raw/natural-earth-countries.geojson',
    output: 'data/japan-outline.json',
    license: 'Public domain. Made with Natural Earth.',
    licenseUrl: 'https://www.naturalearthdata.com/about/terms-of-use/',
    fields: { id: 'stable polygon ID', label: 'country label', points: 'longitude/latitude degrees' },
    transformation:
      'Select ADM0_A3=JPN. Preserve all three exterior polygon rings at the original 1:110m resolution; no invented coastline or additional simplification. The story viewport crops the outline to eastern Japan.',
    missingValues:
      'Reject absent Japan MultiPolygon, holes or nonfinite positions. Coarse geographic context, not a local hazard map.',
  },
];
const bytes = (file) => readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
export const sha256 = (file) => createHash('sha256').update(bytes(file)).digest('hex');
const json = (file) => JSON.parse(bytes(file));
const serialize = (value) => JSON.stringify(value, null, 2) + '\n';

export function transformDatasets() {
  const [meta, observations] = json(datasetDefinitions[0].raw);
  if (meta.pages !== 1 || observations.length !== 120) throw new Error('Incomplete GDP response');
  const gdp = observations
    .map((d) => ({ id: d.countryiso3code, label: d.country.value, year: Number(d.date), value: d.value }))
    .sort((a, b) => a.id.localeCompare(b.id) || a.year - b.year);
  const expected = new Set(
    ['CHN', 'DEU', 'IND', 'JPN', 'USA'].flatMap((id) =>
      Array.from({ length: 24 }, (_, i) => `${id}:${2000 + i}`),
    ),
  );
  for (const row of gdp) {
    if (!expected.delete(`${row.id}:${row.year}`) || !Number.isFinite(row.value) || row.value <= 0)
      throw new Error('Invalid GDP observation');
  }
  if (expected.size) throw new Error('Missing GDP observation');
  const response = json(datasetDefinitions[1].raw);
  if (response.metadata.count !== response.features.length || !response.features.length)
    throw new Error('Incomplete event response');
  const events = response.features
    .map(({ id, properties: p, geometry: g }) => {
      if (!id || ![p.time, p.mag, ...g.coordinates].every(Number.isFinite))
        throw new Error('Missing event value');
      return {
        id,
        label: `${new Date(p.time).toISOString().slice(5, 10)} · M${p.mag.toFixed(1)}`,
        place: p.place,
        time: p.time,
        longitude: g.coordinates[0],
        latitude: g.coordinates[1],
        depth: g.coordinates[2],
        magnitude: p.mag,
        magnitudeType: p.magType,
        url: p.url,
      };
    })
    .sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
  if (new Set(events.map((d) => d.id)).size !== events.length) throw new Error('Duplicate event');
  const japan = json(datasetDefinitions[2].raw).features.find(
    (feature) => feature.properties.ADM0_A3 === 'JPN',
  );
  if (japan?.geometry.type !== 'MultiPolygon' || japan.geometry.coordinates.length !== 3)
    throw new Error('Missing Japan outline');
  const outline = japan.geometry.coordinates.map((polygon, i) => {
    if (polygon.length !== 1 || !polygon[0].flat().every(Number.isFinite))
      throw new Error('Unsupported Japan geometry');
    return { id: `japan-${i}`, label: i === 0 ? 'JAPAN' : '', points: polygon[0] };
  });
  return [gdp, events, outline];
}

export function validateRealData() {
  const manifest = json('data/provenance.json');
  deepStrictEqual(
    manifest.datasets.map(({ retrievedAt, sha256: hash, rawSha256, ...definition }) => definition),
    datasetDefinitions,
  );
  const transformed = transformDatasets();
  manifest.datasets.forEach((entry, i) => {
    if (!/^\d{4}-\d{2}-\d{2}T/.test(entry.retrievedAt)) throw new Error('Missing retrieval date');
    deepStrictEqual(sha256(entry.raw), entry.rawSha256, `Raw source hash: ${entry.id}`);
    deepStrictEqual(sha256(entry.output), entry.sha256, `Output hash: ${entry.id}`);
    deepStrictEqual(bytes(entry.output), serialize(transformed[i]), `Transformation drift: ${entry.id}`);
  });
}

if (process.argv[2] === '--pin') {
  const transformed = transformDatasets();
  const retrievedAt = new Date().toISOString();
  const previous = existsSync('data/provenance.json') ? json('data/provenance.json').datasets : [];
  const datasets = datasetDefinitions.map((definition, i) => {
    writeFileSync(definition.output, serialize(transformed[i]));
    return {
      ...definition,
      retrievedAt:
        previous.find((entry) => entry.id === definition.id && entry.rawSha256 === sha256(definition.raw))
          ?.retrievedAt ?? retrievedAt,
      rawSha256: sha256(definition.raw),
      sha256: sha256(definition.output),
    };
  });
  writeFileSync('data/provenance.json', serialize({ version: 1, datasets }));
} else if (process.argv[2] === '--verify') {
  validateRealData();
  console.log(
    'Two numerical datasets and one geographic outline: raw/output hashes and offline transformations verified.',
  );
}
