import fs from 'node:fs/promises';
import { sources } from '../src/sources.js';

const output = {
  items: [],
  updatedAt: null,
  status: 'not-configured',
  note: 'No verified source adapter is active yet. No price is published until a live source is verified.',
};

for (const source of sources) {
  if (source.status !== 'verified' || typeof source.fetchPrices !== 'function') continue;
  const result = await source.fetchPrices();
  if (!result || !Array.isArray(result.items)) continue;
  output.items.push(...result.items);
}

if (output.items.length > 0) {
  output.updatedAt = new Date().toISOString();
  output.status = 'ok';
  output.note = null;
}

await fs.writeFile('data/prices.json', JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ status: output.status, count: output.items.length, updatedAt: output.updatedAt }));
