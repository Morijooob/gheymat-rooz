import { sources } from './sources.js';
import { validateItems } from './normalize.js';

export async function fetchSource(source, fetchImpl = fetch) {
  if (!source?.url) throw new Error('Source URL is missing');

  const response = await fetchImpl(source.url, {
    headers: { accept: 'application/json,text/html;q=0.9,*/*;q=0.8' },
  });

  if (!response.ok) {
    throw new Error(`${source.id}: HTTP ${response.status}`);
  }

  return response;
}

export async function fetchAllPrices(fetchImpl = fetch) {
  const results = [];

  for (const source of sources) {
    if (source.status !== 'verified') continue;

    try {
      const response = await fetchSource(source, fetchImpl);
      const raw = await response.text();
      // Parser adapters will be attached to each verified source.
      if (typeof source.parse !== 'function') continue;

      const parsed = await source.parse(raw, response);
      results.push(...validateItems(parsed));
    } catch (error) {
      console.error(`Price source failed: ${source.id}`, error);
    }
  }

  return results;
}
