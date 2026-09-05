import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pnpm = process.env.npm_execpath;
assert(pnpm, 'Run through pnpm test:react18');
mkdirSync('.local', { recursive: true });
const host = mkdtempSync(path.join(root, '.local/react18-'));
function run(args, cwd = root) {
  const result = spawnSync(process.execPath, [pnpm, ...args], { cwd, stdio: 'inherit', windowsHide: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(['pack', '--pack-destination', host]);
const archive = readdirSync(host).find((name) => name.endsWith('.tgz'));
assert(archive, 'Engine package was not produced');
writeFileSync(
  path.join(host, 'package.json'),
  JSON.stringify(
    {
      name: 'vizforge-react18-proof',
      private: true,
      type: 'module',
      packageManager: 'pnpm@11.19.0',
      dependencies: {
        '@vizforge/engine': `file:./${archive}`,
        react: '18.3.1',
        'react-dom': '18.3.1',
        jsdom: '26.0.0',
      },
    },
    null,
    2,
  ),
);
// This disposable compatibility fixture has no second release lock or workspace source dependencies.
run(['--ignore-workspace', 'install', '--lockfile=false'], host);
writeFileSync(path.join(host, 'story.json'), readFileSync('examples/ranking.json'));
writeFileSync(
  path.join(host, 'proof.mjs'),
  `
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync, writeFileSync } from 'node:fs';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { StoryView } from '@vizforge/engine/react';
const dom = new JSDOM('<div id="root"></div>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
assert.equal(React.version, '18.3.1');
const root = createRoot(document.getElementById('root'));
const story = JSON.parse(readFileSync(new URL('./story.json', import.meta.url)));
await act(async () => root.render(React.createElement(StoryView, { story, reducedMotion: true })));
assert.equal(document.querySelector('.vf-figure').dataset.sceneId, 'rank-opening');
await act(async () => document.querySelector('button[aria-label="Next scene"]').click());
assert.equal(document.querySelector('.vf-figure').dataset.sceneId, 'rank-middle');
assert.equal(document.querySelector('.vf-figure').dataset.transitionMs, '0');
await act(async () => root.unmount());
assert.equal(document.querySelector('.vf-figure'), null);
writeFileSync('result.json', JSON.stringify({ passed: true, react: React.version, engineVersion: '1.1.0', checks: ['packed isolated consumer', 'mount', 'step', 'reduced motion', 'unmount'] }, null, 2) + '\\n');
console.log('Independent React 18 packed-host proof passed.');
`,
);
const result = spawnSync(process.execPath, ['proof.mjs'], { cwd: host, stdio: 'inherit', windowsHide: true });
if (result.status !== 0) process.exit(result.status ?? 1);
mkdirSync('docs/qa', { recursive: true });
writeFileSync('docs/qa/react18-host.json', readFileSync(path.join(host, 'result.json')));
