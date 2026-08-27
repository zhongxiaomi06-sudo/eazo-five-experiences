import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const availableApps = ['ideal-day-lab','scroll-to-space','life-elsewhere-now','who-shared-the-year','weird-matter-lab'];
const requestedApps = process.argv.slice(2);
const apps = requestedApps.length ? availableApps.filter((app) => requestedApps.includes(app)) : availableApps;
if (!apps.length) throw new Error(`Unknown app. Choose one of: ${availableApps.join(', ')}`);
const media = { 'fixture.json': 'application/json', 'catalog.json': 'application/json', 'rights-ledger.tsv': 'text/tab-separated-values', 'og.png': 'image/png', 'matter-specimens-v2.png': 'image/png', 'matter-specimens-v2.webp': 'image/webp', 'reels/magnetic-bloom.mp4': 'video/mp4', 'reels/ink-collision.mp4': 'video/mp4', 'reels/liquid-vortex.mp4': 'video/mp4', 'data-snapshot.json': 'application/json', 'sw.js': 'text/javascript' };
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');

for (const appId of apps) {
  const contentDir = join('apps', appId, 'content');
  const files = [];
  const production = appId === 'scroll-to-space' || appId === 'life-elsewhere-now' || appId === 'weird-matter-lab';
  for (const path of Object.keys(media)) {
    try { await access(join(contentDir, path)); } catch { continue; }
    const body = await readFile(join(contentDir, path));
    const licenseId = path === 'rights-ledger.tsv' ? 'LEDGER' : path === 'data-snapshot.json' ? 'CC-BY-4.0' : path.startsWith('reels/') ? 'PEXELS-LICENSE' : production ? (path.endsWith('.png') || path.endsWith('.webp') ? 'PROJECT-GENERATED' : 'MIT') : 'FIXTURE-ONLY';
    files.push({ path, sha256: hash(body), bytes: body.byteLength, contentType: media[path], licenseId, sourceIds: [`${appId}:${path}`] });
  }
  const fixture = files.find((file) => file.path === 'fixture.json');
  const manifest = {
    manifestVersion: 1,
    appId,
    buildVersion: production ? '1.0.0-rc.1' : '0.1.0-fixture',
    contentVersion: appId === 'life-elsewhere-now' ? '2026-08-27.wdi.1' : production ? '2026-08-27.production.1' : '2026-08-27.fixture.1',
    schemaVersions: appId === 'life-elsewhere-now' ? { fixture: 1, rightsLedger: 1, indicatorSnapshot: 1 } : appId === 'weird-matter-lab' ? { fixture: 1, catalog: 1, rightsLedger: 1 } : { fixture: 1, rightsLedger: 1 },
    createdAt: '2026-08-27T00:00:00.000Z',
    rollbackBuildVersion: '0.0.0-empty',
    files,
    datasets: appId === 'life-elsewhere-now' ? [
      { datasetId: 'life-editorial-templates', version: '1', retrievedAt: '2026-08-27', sourceUrl: 'project-authored://life-elsewhere-now', licenseId: 'MIT', transformVersion: 'life-templates-v1', outputSha256: fixture.sha256 },
      { datasetId: 'world-bank-wdi-life-snapshot', version: '2026-08-27', retrievedAt: '2026-08-27', sourceUrl: 'https://api.worldbank.org/v2/', licenseId: 'CC-BY-4.0', transformVersion: 'life-indicators-v1', outputSha256: files.find((file) => file.path === 'data-snapshot.json').sha256 },
    ] : appId === 'weird-matter-lab' ? [
      { datasetId: 'weird-matter-lab-catalog', version: '1', retrievedAt: '2026-08-27', sourceUrl: 'project-authored://weird-matter-lab/catalog', licenseId: 'MIT', transformVersion: 'lab-content-v1', outputSha256: files.find((file) => file.path === 'catalog.json').sha256 },
    ] : [{ datasetId: `${appId}-${production ? 'story' : 'fixture'}`, version: production ? '2' : '1', retrievedAt: '2026-08-27', sourceUrl: `project-authored://${appId}`, licenseId: production ? 'MIT' : 'FIXTURE-ONLY', transformVersion: 'identity-1', outputSha256: fixture.sha256 }],
    totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  };
  await writeFile(join(contentDir, 'data-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`generated ${appId}/data-manifest.json`);
}
