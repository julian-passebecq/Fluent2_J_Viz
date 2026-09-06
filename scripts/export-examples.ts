import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { catalog, editorialStory, storyPacks, flagshipStories } from '../src/examples/index.js';
mkdirSync('examples', { recursive: true });
for (const entry of catalog)
  writeFileSync(`examples/${entry.id}.json`, JSON.stringify(entry.story, null, 2) + '\n');
writeFileSync('examples/editorial.json', JSON.stringify(editorialStory, null, 2) + '\n');
for (const entry of storyPacks)
  writeFileSync(`examples/${entry.id}.json`, JSON.stringify(entry.story, null, 2) + '\n');
for (const entry of flagshipStories)
  writeFileSync(`examples/${entry.id}.json`, JSON.stringify(entry.story, null, 2) + '\n');
writeFileSync(
  'docs/DATA_PROVENANCE.json',
  JSON.stringify(
    {
      description:
        '22 original synthetic examples and four real-data flagship stories. Dataset sources, licenses, raw/output hashes and transformations: data/provenance.json.',
      fixtures: [
        ...catalog,
        ...storyPacks,
        { id: 'editorial', story: editorialStory },
        ...flagshipStories,
      ].map((entry) => ({
        file: `examples/${entry.id}.json`,
        synthetic: !entry.id.startsWith('flagship-'),
        sha256: createHash('sha256')
          .update(JSON.stringify(entry.story, null, 2) + '\n')
          .digest('hex'),
        sources: [...new Set(entry.story.visuals.map((visual) => visual.source))],
      })),
    },
    null,
    2,
  ) + '\n',
);
