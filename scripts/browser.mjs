import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

// Keep downloaded browser binaries inside this repository.
const result = spawnSync(
  process.execPath,
  [createRequire(import.meta.url).resolve('@playwright/test/cli'), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: resolve('.local/browsers') },
  },
);
process.exit(result.status ?? 1);
