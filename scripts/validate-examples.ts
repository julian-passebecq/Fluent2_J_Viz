import { readFileSync, readdirSync } from 'node:fs';
import { catalog, editorialStory, storyPacks, flagshipStories } from '../src/examples/index.js';
import { validateRealData } from './real-data.mjs';
import { parseStory } from '../src/core/spec.js';
import { deepStrictEqual } from 'node:assert';
import { createHash } from 'node:crypto';
validateRealData();
for (const entry of [...catalog, ...storyPacks, ...flagshipStories]) parseStory(entry.story);
parseStory(editorialStory);
const provenance = JSON.parse(readFileSync('docs/DATA_PROVENANCE.json', 'utf8'));
deepStrictEqual(provenance.fixtures.length, catalog.length + storyPacks.length + flagshipStories.length + 1);
for (const fixture of provenance.fixtures) {
  deepStrictEqual(fixture.synthetic, !fixture.file.startsWith('examples/flagship-'));
  deepStrictEqual(
    fixture.sha256,
    createHash('sha256').update(readFileSync(fixture.file, 'utf8').replaceAll('\r\n', '\n')).digest('hex'),
  );
}
for (const file of readdirSync('examples').filter((f) => f.endsWith('.json')))
  parseStory(JSON.parse(readFileSync(`examples/${file}`, 'utf8')));
for (const entry of [
  ...catalog,
  ...storyPacks,
  { id: 'editorial', story: editorialStory },
  ...flagshipStories,
]) {
  deepStrictEqual(
    JSON.parse(readFileSync(`examples/${entry.id}.json`, 'utf8')),
    entry.story,
    `Canonical JSON drift in ${entry.id}; run pnpm examples:export`,
  );
}
console.log(
  `Validated ${catalog.length} families, ${catalog.length + storyPacks.length + 1} original examples and ${flagshipStories.length} real-data flagship stories; provenance and offline transformations verified.`,
);
