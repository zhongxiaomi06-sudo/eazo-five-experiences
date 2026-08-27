import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const availableApps = ['ideal-day-lab','scroll-to-space','life-elsewhere-now','who-shared-the-year','weird-matter-lab'];
const requestedApps = process.argv.slice(2);
const apps = requestedApps.length ? availableApps.filter((app) => requestedApps.includes(app)) : availableApps;
if (!apps.length) throw new Error(`Unknown app. Choose one of: ${availableApps.join(', ')}`);
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
let failures = 0;

for (const appId of apps) {
  const contentDir = join('apps', appId, 'content');
  const manifest = JSON.parse(await readFile(join(contentDir, 'data-manifest.json'), 'utf8'));
  const paths = new Set();
  let totalBytes = 0;
  const fail = (code, detail) => { failures += 1; console.error(`FAIL ${appId} ${code} ${detail}`); };
  if (manifest.manifestVersion !== 1 || manifest.appId !== appId || !manifest.rollbackBuildVersion) fail('MANIFEST_SHAPE', 'version/app/rollback');
  for (const file of manifest.files ?? []) {
    if (paths.has(file.path)) fail('DUPLICATE_PATH', file.path); paths.add(file.path);
    let body; try { body = await readFile(join(contentDir, file.path)); } catch { fail('FILE_MISSING', file.path); continue; }
    totalBytes += body.byteLength;
    if (hash(body) !== file.sha256) fail('HASH_MISMATCH', file.path);
    if (!file.licenseId || !file.sourceIds?.length) fail('RIGHTS_MISSING', file.path);
  }
  if (totalBytes !== manifest.totalBytes) fail('TOTAL_BYTES_MISMATCH', `${totalBytes} != ${manifest.totalBytes}`);
  if (!failures) console.log(`PASS ${appId} files=${paths.size} bytes=${totalBytes}`);
}
if (failures) process.exit(1);
