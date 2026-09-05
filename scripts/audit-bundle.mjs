import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { requireBundlePrivacy } from './check-bundle-privacy.mjs';

const privacy = requireBundlePrivacy(process.cwd(), ['dist']);
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
const reachable = new Set();
function visit(key) {
  if (reachable.has(key)) return;
  reachable.add(key);
  for (const dependency of [...(manifest[key].imports ?? []), ...(manifest[key].dynamicImports ?? [])])
    visit(dependency);
}
visit('index.html');
const sources = [...reachable].flatMap((key) => {
  const file = manifest[key].file;
  return file.endsWith('.js') ? JSON.parse(readFileSync(`dist/${file}.map`, 'utf8')).sources : [];
});
const reactCore = sources.filter((source) => /\/react\/cjs\/react\.production\.js$/.test(source));
const reactDom = sources.filter((source) =>
  /\/react-dom\/cjs\/react-dom-client\.production\.js$/.test(source),
);
assert.equal(reactCore.length, 1, 'Exactly one React core must be emitted across the entire Studio graph');
assert.equal(reactDom.length, 1, 'Exactly one ReactDOM client must be emitted');
assert.match(reactCore[0], /react@19\.2\.8/);
assert(
  !sources.some((source) => /src\/core\/player\.ts$/.test(source)),
  'Hosted Studio must not ship a VizForge StoryPlayer clock',
);
assert(
  sources.some((source) => /packages\/figure\/src\/player\.tsx$/.test(source)),
  'Real Datapass FigurePlayer must ship',
);
for (const file of readdirSync('dist/assets').filter((file) => file.endsWith('.map'))) {
  const map = JSON.parse(readFileSync(`dist/assets/${file}`, 'utf8'));
  assert(
    !map.sources.some((source) => /^(?:[A-Z]:[\\/]|\/Users\/|\/home\/)/i.test(source)),
    `Absolute source path: ${file}`,
  );
  const content = (map.sourcesContent ?? []).join('\n').replaceAll('\\', '/').toLowerCase();
  assert(
    !content.includes(process.cwd().replaceAll('\\', '/').toLowerCase()),
    `Workspace path leak: ${file}`,
  );
}
const report = {
  framework: JSON.parse(readFileSync('datapass.json')).commit,
  privacy,
  reactCore,
  reactDom,
  studioContainsVizForgeClock: false,
  studioContainsDatapassPlayer: true,
};
mkdirSync('docs/qa', { recursive: true });
writeFileSync('docs/qa/bundle-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(
  'Bundle audit passed: private URL/source maps, one React runtime, Datapass-only playback ownership.',
);
