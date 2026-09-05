import { readFileSync, readdirSync } from 'node:fs';
import { catalog, editorialStory } from '../src/examples/index.js';
import { parseStory } from '../src/core/spec.js';
import { deepStrictEqual } from 'node:assert';
for (const entry of catalog) parseStory(entry.story);
parseStory(editorialStory);
for (const file of readdirSync('examples').filter((f) => f.endsWith('.json')))
  parseStory(JSON.parse(readFileSync(`examples/${file}`, 'utf8')));
for (const entry of [...catalog, { id: 'editorial', story: editorialStory }]) {
  deepStrictEqual(
    JSON.parse(readFileSync(`examples/${entry.id}.json`, 'utf8')),
    entry.story,
    `Canonical JSON drift in ${entry.id}; run npm run examples:export`,
  );
}
console.log(
  `Validated ${catalog.length} families and the cross-family editorial story; canonical JSON references also passed.`,
);
