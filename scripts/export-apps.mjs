import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const availableApps = ['ideal-day-lab','scroll-to-space','life-elsewhere-now','who-shared-the-year','weird-matter-lab'];
const requestedApps = process.argv.slice(2);
const apps = requestedApps.length ? availableApps.filter((app) => requestedApps.includes(app)) : availableApps;
if (!apps.length) throw new Error(`Unknown app. Choose one of: ${availableApps.join(', ')}`);
const ports = { 'ideal-day-lab': 5101, 'scroll-to-space': 5102, 'life-elsewhere-now': 5103, 'who-shared-the-year': 5104, 'weird-matter-lab': 5105 };
const aliases = { 'ideal-day-lab': 'day', 'scroll-to-space': 'space', 'life-elsewhere-now': 'life', 'who-shared-the-year': 'year', 'weird-matter-lab': 'lab' };
const e2eFiles = { 'ideal-day-lab': 'ideal-day.spec.ts', 'scroll-to-space': 'scroll-to-space.spec.ts', 'life-elsewhere-now': 'life-production.spec.ts', 'who-shared-the-year': 'smoke.spec.ts', 'weird-matter-lab': 'weird-matter-lab.spec.ts' };
for (const app of apps) {
  const root = join('exports', app);
  await rm(root, { recursive: true, force: true });
  await mkdir(join(root, 'apps'), { recursive: true });
  await cp(join('apps', app), join(root, 'apps', app), { recursive: true });
  await cp('packages', join(root, 'packages'), { recursive: true });
  for (const file of ['tsconfig.base.json','types.d.ts','vitest.config.ts','.npmrc','.tool-versions','.gitignore','LICENSE']) await cp(file, join(root, file));
  await mkdir(join(root, 'tests', 'e2e'), { recursive: true });
  await cp('tests/e2e/smoke.spec.ts', join(root, 'tests', 'e2e', 'smoke.spec.ts'));
  if (e2eFiles[app] !== 'smoke.spec.ts') await cp(join('tests/e2e', e2eFiles[app]), join(root, 'tests', 'e2e', e2eFiles[app]));
  await mkdir(join(root, 'scripts'), { recursive: true });
  await cp('scripts/validate-manifests.mjs', join(root, 'scripts', 'validate-manifests.mjs'));
  await writeFile(join(root, 'scripts', 'static-worker.js'), `export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };\n`);
  await writeFile(join(root, 'scripts', 'copy-dist.mjs'), `import { cp, mkdir, rm } from 'node:fs/promises';\nawait rm('dist', { recursive: true, force: true });\nawait cp('apps/${app}/dist', 'dist', { recursive: true });\nawait mkdir('dist/server', { recursive: true });\nawait cp('scripts/static-worker.js', 'dist/server/index.js');\nawait mkdir('dist/.openai', { recursive: true });\nawait cp('.openai/hosting.json', 'dist/.openai/hosting.json');\n`);
  await mkdir(join(root, '.github', 'workflows'), { recursive: true });
  await writeFile(join(root, '.github', 'workflows', 'ci.yml'), `name: verify\non:\n  pull_request:\n  push:\n    branches: [main]\npermissions:\n  contents: read\njobs:\n  verify:\n    runs-on: ubuntu-24.04\n    timeout-minutes: 20\n    steps:\n      - uses: actions/checkout@v4\n      - uses: pnpm/action-setup@v4\n        with:\n          version: 11.24.0\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 24.20.0\n          cache: pnpm\n      - run: pnpm install --frozen-lockfile\n      - run: pnpm typecheck\n      - run: pnpm test\n      - run: pnpm manifest:validate\n      - run: pnpm build\n      - run: pnpm exec playwright install --with-deps chromium webkit\n      - run: pnpm test:e2e\n`);
  const source = JSON.parse(await readFile('package.json', 'utf8'));
  const packageJson = { ...source, name: `eazo-${app}`, workspaces: ['apps/*', 'packages/*'], scripts: { build: `npm run build --workspace=@eazo/${app} && node scripts/copy-dist.mjs`, dev: `pnpm --filter @eazo/${app} dev`, typecheck: 'pnpm -r --if-present typecheck', lint: 'oxlint --no-ignore --deny-warnings packages apps tests scripts', test: 'vitest run', 'test:e2e': 'playwright test', 'manifest:validate': `node scripts/validate-manifests.mjs ${app}`, verify: 'pnpm lint && pnpm typecheck && pnpm test && pnpm manifest:validate && pnpm build' } };
  await writeFile(join(root, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
  await writeFile(join(root, 'pnpm-workspace.yaml'), `packages:\n  - "apps/*"\n  - "packages/*"\n\ncatalog:\n  react: 19.2.8\n  react-dom: 19.2.8\n  typescript: 6.0.3\n  vite: 8.2.2\n  vitest: 4.1.11\n`);
  await writeFile(join(root, 'playwright.config.ts'), `import { defineConfig, devices } from '@playwright/test';\nexport default defineConfig({testDir:'./tests/e2e',reporter:[['html',{open:'never'}],['list']],webServer:{command:'pnpm dev --host 127.0.0.1',port:${ports[app]},reuseExistingServer:true},use:{baseURL:'http://127.0.0.1:${ports[app]}',trace:'retain-on-failure',screenshot:'only-on-failure'},projects:[{name:'pixel',metadata:{app:'${aliases[app]}'},use:{...devices['Pixel 7']}},{name:'iphone',metadata:{app:'${aliases[app]}'},use:{...devices['iPhone 12']}}]});\n`);
  let readme;
  try { readme = await readFile(join('apps', app, 'README.md'), 'utf8'); }
  catch { readme = `# ${app}\n\nD2-entry engineering export. See the project audit for release status.\n`; }
  await writeFile(join(root, 'README.md'), readme);
  const pnpmCli = process.env.npm_execpath;
  if (pnpmCli) execFileSync(process.execPath, [pnpmCli, '--dir', root, 'install', '--lockfile-only'], { stdio: 'ignore' });
  else execFileSync('pnpm', ['--dir', root, 'install', '--lockfile-only'], { stdio: 'ignore' });
  console.log(`exported ${root}`);
}
