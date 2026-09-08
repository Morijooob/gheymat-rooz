import { sources } from './sources.js';
import { validateItems } from './normalize.js';

const faDigits = value => String(value ?? '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const jalaliParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }).formatToParts(date);
  return Object.fromEntries(parts.filter(p => ['year', 'month', 'day'].includes(p.type)).map(p => [p.type, p.value]));
};
const canonicalChickenUrls = () => {
  const urls = [];
  for (let i = 0; i < 4; i += 1) {
    const { year, month, day } = jalaliParts(new Date(Date.now() - i * 86400000));
    urls.push(`https://nabzgheymat.ir/قیمت-گوشت-مرغ-${day}-${month}-${year}/`);
  }
  return [...new Set(urls)];
};

function parseCanonicalChicken(raw, response) {
  const text = String(raw ?? '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
  const match = text.match(/مرغ\s*کامل\s*تازه\s*و\s*کشتار\s*روز\s*کیلو(?:یی)?[\s:|–-]{0,120}([۰-۹0-9][۰-۹0-9٬,]*)\s*(?:تومان|تومن)/i);
  if (!match) return [];
  const price = Number(faDigits(match[1]).replace(/[٬,]/g, ''));
  if (!Number.isFinite(price) || price <= 0) return [];
  return [{ id: 'chicken-whole-fresh-slaughter-daily', title: 'مرغ کامل تازه و کشتار روز', price, unit: 'تومان / کیلوگرم', normalizedPrice: price, normalizedUnit: 'تومان / کیلوگرم', sourceId: 'nabzgheymat-chicken-canonical', sourceUrl: response?.url || 'https://nabzgheymat.ir/', availability: 'in_stock', confidence: 'source-verified', observedAt: new Date().toISOString() }];
}

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
  try {
    const canonical = { id: 'nabzgheymat-chicken-canonical', url: 'https://nabzgheymat.ir/', urls: canonicalChickenUrls, parse: parseCanonicalChicken };
    const response = await fetchSource(canonical, fetchImpl);
    const raw = await response.text();
    results.push(...validateItems(parseCanonicalChicken(raw, response)));
  } catch (error) {
    console.error(`Price source failed: nabzgheymat-chicken-canonical`, error);
  }
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
