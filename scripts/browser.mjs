import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// Keep downloaded browser binaries inside this repository.
const result = spawnSync(
  process.execPath,
  [resolve('node_modules/playwright/cli.js'), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: resolve('.local/browsers') },
  },
);
process.exit(result.status ?? 1);
