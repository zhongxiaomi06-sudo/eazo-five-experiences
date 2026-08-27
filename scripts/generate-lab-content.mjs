import { writeFile } from 'node:fs/promises';
import { CHALLENGES, MATERIALS, SCENES, TOOLS } from '../apps/weird-matter-lab/src/content.ts';

const catalog = {
  schemaVersion: 1,
  contentVersion: '2026-08-27.production.1',
  safetyNotice: 'Educational game model. No real-world dangerous recipes, quantities, apparatus settings, or procedures.',
  materials: MATERIALS,
  tools: TOOLS,
  challenges: CHALLENGES,
  scenes: SCENES,
};
await writeFile('apps/weird-matter-lab/content/catalog.json', `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`generated lab catalog: ${MATERIALS.length} materials, ${CHALLENGES.length} challenges, ${SCENES.length} scenes`);
