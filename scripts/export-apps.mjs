import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const apps = ['ideal-day-lab','scroll-to-space','life-elsewhere-now','who-shared-the-year','weird-matter-lab'];
const ports = { 'ideal-day-lab': 5101, 'scroll-to-space': 5102, 'life-elsewhere-now': 5103, 'who-shared-the-year': 5104, 'weird-matter-lab': 5105 };
for (const app of apps) {
  const root = join('exports', app);
  await rm(root, { recursive: true, force: true });
  await mkdir(join(root, 'apps'), { recursive: true });
  await cp(join('apps', app), join(root, 'apps', app), { recursive: true });
  await cp('packages', join(root, 'packages'), { recursive: true });
  for (const file of ['tsconfig.base.json','types.d.ts','vitest.config.ts','.npmrc','.tool-versions','.gitignore','LICENSE']) await cp(file, join(root, file));
  await mkdir(join(root, 'tests'), { recursive: true });
  await cp('tests/e2e', join(root, 'tests/e2e'), { recursive: true });
  const source = JSON.parse(await readFile('package.json', 'utf8'));
  const packageJson = { ...source, name: `eazo-${app}`, scripts: { build: `pnpm --filter @eazo/${app} build`, dev: `pnpm --filter @eazo/${app} dev`, typecheck: 'pnpm -r --if-present typecheck', lint: 'oxlint --deny-warnings packages apps', test: 'vitest run', 'test:e2e': 'playwright test', verify: 'pnpm lint && pnpm typecheck && pnpm test && pnpm build' } };
  await writeFile(join(root, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
  await writeFile(join(root, 'pnpm-workspace.yaml'), `packages:\n  - "apps/*"\n  - "packages/*"\n\ncatalog:\n  react: 19.2.8\n  react-dom: 19.2.8\n  typescript: 6.0.3\n  vite: 8.2.2\n  vitest: 4.1.11\n`);
  await writeFile(join(root, 'playwright.config.ts'), `import { defineConfig, devices } from '@playwright/test';\nexport default defineConfig({testDir:'./tests/e2e',reporter:[['html',{open:'never'}],['list']],webServer:{command:'pnpm dev --host 127.0.0.1',port:${ports[app]},reuseExistingServer:true},use:{baseURL:'http://127.0.0.1:${ports[app]}',trace:'retain-on-failure',screenshot:'only-on-failure'},projects:[{name:'pixel',use:{...devices['Pixel 7']}},{name:'iphone',use:{...devices['iPhone 12']}}]});\n`);
  await writeFile(join(root, 'README.md'), `# ${app}\n\nStandalone source export from the Eazo five-experience D2-entry workspace. Fixture content only; not approved for production.\n`);
  const pnpmCli = process.env.npm_execpath;
  if (pnpmCli) execFileSync(process.execPath, [pnpmCli, '--dir', root, 'install', '--lockfile-only', '--ignore-workspace'], { stdio: 'ignore' });
  else execFileSync('pnpm', ['--dir', root, 'install', '--lockfile-only', '--ignore-workspace'], { stdio: 'ignore' });
  console.log(`exported ${root}`);
}
