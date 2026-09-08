import fs from 'node:fs/promises';
import { fetchAllPrices } from '../src/fetch-prices.js';

const output = {
  items: [],
  stores: [],
  updatedAt: null,
  status: 'not-configured',
  note: 'No verified source adapter is active yet. No price is published until a live source is verified.',
};

async function readPrevious() {
  try {
    const raw = await fs.readFile('data/prices.json', 'utf8');
    const previous = JSON.parse(raw);
    if (Array.isArray(previous.items) && previous.items.length > 0) return previous;
  } catch {}
  return null;
}

try {
  const items = await fetchAllPrices();
  if (Array.isArray(items) && items.length > 0) {
    output.items = items;
    output.updatedAt = new Date().toISOString();
    output.status = 'ok';
    output.note = null;
  } else {
    const previous = await readPrevious();
    if (previous) {
      output.items = previous.items;
      output.stores = Array.isArray(previous.stores) ? previous.stores : [];
      output.updatedAt = previous.updatedAt ?? null;
      output.status = 'stale';
      output.note = 'Live source returned no valid prices; last valid dataset was preserved.';
    }
  }
} catch (error) {
  console.error('Price update failed:', error);
  const previous = await readPrevious();
  if (previous) {
    output.items = previous.items;
    output.stores = Array.isArray(previous.stores) ? previous.stores : [];
    output.updatedAt = previous.updatedAt ?? null;
    output.status = 'stale';
    output.note = 'Live source failed; last valid dataset was preserved.';
  }
}

const serialized = JSON.stringify(output, null, 2) + '\n';
await fs.mkdir('data', { recursive: true });
await fs.mkdir('public/data', { recursive: true });
await fs.writeFile('data/prices.json', serialized, 'utf8');
await fs.writeFile('public/data/prices.json', serialized, 'utf8');

console.log(JSON.stringify({ status: output.status, count: output.items.length, stores: output.stores.length, updatedAt: output.updatedAt }));
