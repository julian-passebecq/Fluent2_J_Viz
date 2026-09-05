import { mkdirSync, writeFileSync } from 'node:fs';
import { catalog, editorialStory } from '../src/examples/index.js';
mkdirSync('examples', { recursive: true });
for (const entry of catalog)
  writeFileSync(`examples/${entry.id}.json`, JSON.stringify(entry.story, null, 2) + '\n');
writeFileSync('examples/editorial.json', JSON.stringify(editorialStory, null, 2) + '\n');
