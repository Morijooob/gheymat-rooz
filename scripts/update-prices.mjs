import fs from 'node:fs/promises';
import { fetchAllPrices } from '../src/fetch-prices.js';

const output = {
  items: [],
  stores: [],
  updatedAt: null,
  status: 'not-configured',
  note: 'No verified source adapter is active yet. No price is published until a live source is verified.',
};

try {
  output.items = await fetchAllPrices();
} catch (error) {
  console.error('Price update failed:', error);
}

if (output.items.length > 0) {
  output.updatedAt = new Date().toISOString();
  output.status = 'ok';
  output.note = null;
}

const serialized = JSON.stringify(output, null, 2) + '\n';
await fs.mkdir('data', { recursive: true });
await fs.mkdir('public/data', { recursive: true });
await fs.writeFile('data/prices.json', serialized, 'utf8');
await fs.writeFile('public/data/prices.json', serialized, 'utf8');

console.log(JSON.stringify({ status: output.status, count: output.items.length, stores: output.stores.length, updatedAt: output.updatedAt }));
