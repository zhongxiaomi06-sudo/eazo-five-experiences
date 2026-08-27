import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const apps = ['ideal-day-lab','scroll-to-space','life-elsewhere-now','who-shared-the-year','weird-matter-lab'];
const media = { 'fixture.json': 'application/json', 'rights-ledger.tsv': 'text/tab-separated-values' };
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');

for (const appId of apps) {
  const contentDir = join('apps', appId, 'content');
  const files = [];
  for (const path of Object.keys(media)) {
    const body = await readFile(join(contentDir, path));
    files.push({ path, sha256: hash(body), bytes: body.byteLength, contentType: media[path], licenseId: path === 'fixture.json' ? 'FIXTURE-ONLY' : 'LEDGER', sourceIds: [`${appId}:${path}`] });
  }
  const fixture = files.find((file) => file.path === 'fixture.json');
  const manifest = {
    manifestVersion: 1,
    appId,
    buildVersion: '0.1.0-fixture',
    contentVersion: '2026-08-27.fixture.1',
    schemaVersions: { fixture: 1, rightsLedger: 1 },
    createdAt: '2026-08-27T00:00:00.000Z',
    rollbackBuildVersion: '0.0.0-empty',
    files,
    datasets: [{ datasetId: `${appId}-fixture`, version: '1', retrievedAt: '2026-08-27', sourceUrl: `project-authored://${appId}`, licenseId: 'FIXTURE-ONLY', transformVersion: 'identity-1', outputSha256: fixture.sha256 }],
    totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  };
  await writeFile(join(contentDir, 'data-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`generated ${appId}/data-manifest.json`);
}
