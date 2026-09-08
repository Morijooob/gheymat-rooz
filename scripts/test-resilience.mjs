import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const originalCwd = process.cwd();
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gheymat-rooz-resilience-'));
const previous = {
  items: [{ id: 'test-item', title: 'کالای تست', price: 123000, unit: 'تومان', sourceId: 'test', observedAt: '2026-09-08T00:00:00.000Z' }],
  stores: [],
  updatedAt: '2026-09-08T00:00:00.000Z',
  status: 'ok',
  note: null,
};

try {
  await fs.mkdir(path.join(tempDir, 'data'), { recursive: true });
  await fs.writeFile(path.join(tempDir, 'data/prices.json'), JSON.stringify(previous), 'utf8');
  process.chdir(tempDir);
  globalThis.fetch = async () => new Response('temporary source outage', { status: 503 });
  const script = path.resolve(originalCwd, 'scripts/update-prices.mjs');
  await import(`${pathToFileUrl(script)}?resilience=${Date.now()}`);
  const result = JSON.parse(await fs.readFile(path.join(tempDir, 'data/prices.json'), 'utf8'));
  if (result.status !== 'stale') throw new Error(`Expected stale status, got ${result.status}`);
  if (JSON.stringify(result.items) !== JSON.stringify(previous.items)) throw new Error('Previous valid items were not preserved');
  if (result.updatedAt !== previous.updatedAt) throw new Error('Previous updatedAt was not preserved');
  console.log('PASS: source outage preserves the last valid dataset.');
} finally {
  process.chdir(originalCwd);
  await fs.rm(tempDir, { recursive: true, force: true });
}

function pathToFileUrl(filePath) {
  return new URL(`file://${filePath.replace(/\\/g, '/')}`).href;
}
