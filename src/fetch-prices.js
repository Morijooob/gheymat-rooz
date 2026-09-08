import { sources } from './sources.js';
import { validateItems } from './normalize.js';

export async function fetchSource(source, fetchImpl = fetch) {
  const urls = typeof source?.urls === 'function' ? source.urls() : [source?.url];
  if (!urls?.length) throw new Error('Source URL is missing');
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetchImpl(url, { headers: { accept: 'application/json,text/html;q=0.9,*/*;q=0.8' } });
      if (response.ok) return response;
      lastError = new Error(`${source.id}: HTTP ${response.status}`);
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error(`${source.id}: source unavailable`);
}

export async function fetchAllPrices(fetchImpl = fetch) {
  const results = [];
  for (const source of sources) {
    if (source.status !== 'verified') continue;
    try {
      const response = await fetchSource(source, fetchImpl);
      const raw = await response.text();
      if (typeof source.parse !== 'function') continue;
      const parsed = await source.parse(raw, response);
      results.push(...validateItems(parsed));
    } catch (error) {
      console.error(`Price source failed: ${source.id}`, error);
    }
  }
  return results;
}
