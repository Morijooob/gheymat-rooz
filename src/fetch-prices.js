import { sources } from './sources.js';
import { validateItems } from './normalize.js';

const faDigits = value => String(value ?? '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const normalizePersian = value => String(value ?? '')
  .replace(/[يى]/g, 'ی')
  .replace(/ك/g, 'ک')
  .replace(/[\u200c\u200d]/g, '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&zwnj;|&#8204;/gi, '')
  .replace(/\s+/g, ' ')
  .trim();

const jalaliParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }).formatToParts(date);
  return Object.fromEntries(parts.filter(p => ['year', 'month', 'day'].includes(p.type)).map(p => [p.type, p.value]));
};

const canonicalChickenUrls = () => {
  const urls = [];
  for (let i = 0; i < 5; i += 1) {
    const { year, month, day } = jalaliParts(new Date(Date.now() - i * 86400000));
    urls.push(`https://nabzgheymat.ir/قیمت-گوشت-مرغ-امروز-${day}-${month}-${year}/`);
    urls.push(`https://nabzgheymat.ir/قیمت-مرغ-امروز-${day}-${month}-${year}/`);
    urls.push(`https://nabzgheymat.ir/قیمت-مرغ-امروز-${day}-${month}-${year}-جدول-کامل/`);
    urls.push(`https://nabzgheymat.ir/قیمت-گوشت-مرغ-${day}-${month}-${year}/`);
  }
  return [...new Set(urls)];
};

function normalizeSourceText(raw) {
  return normalizePersian(String(raw ?? '')
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '));
}

function parseNumber(value) {
  const cleaned = faDigits(value).replace(/[٬,\s]/g, '');
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function extractChickenPrice(text) {
  const matches = [...normalizePersian(text).matchAll(/([۰-۹0-9][۰-۹0-9٬,\s]{2,})(?:\s*)(هزار\s*)?(?:تومان|تومن)/gi)];
  for (const match of matches) {
    const base = parseNumber(match[1]);
    if (base === null || base <= 0) continue;
    const price = /هزار/i.test(match[2] || '') ? base * 1000 : base;
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
}

function parseCanonicalChicken(raw, response) {
  const html = String(raw ?? '');
  const target = /مرغ\s*کامل\s*تازه\s*و\s*کشتار\s*روز(?:\s*(?:کیلویی|کیلوگرم|کیلو))?/i;

  // Prefer the actual HTML table row. This preserves the relationship between
  // the product name and its price instead of searching the whole page text.
  const rows = [...html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)];
  for (const row of rows) {
    const rowText = normalizeSourceText(row[0]);
    if (!target.test(rowText)) continue;
    const price = extractChickenPrice(rowText);
    if (price === null) continue;
    return [{
      id: 'chicken-whole-fresh-slaughter-daily',
      title: 'مرغ کامل تازه و کشتار روز',
      price,
      unit: 'تومان / کیلوگرم',
      normalizedPrice: price,
      normalizedUnit: 'تومان / کیلوگرم',
      sourceId: 'nabzgheymat-chicken-canonical',
      sourceUrl: response?.url || 'https://nabzgheymat.ir/',
      availability: 'in_stock',
      confidence: 'source-verified',
      observedAt: new Date().toISOString(),
    }];
  }

  // Fallback for pages that render the table without <tr> tags.
  const text = normalizeSourceText(html);
  const index = text.search(target);
  if (index < 0) return [];
  const price = extractChickenPrice(text.slice(index, index + 1200));
  if (price === null) return [];

  return [{
    id: 'chicken-whole-fresh-slaughter-daily',
    title: 'مرغ کامل تازه و کشتار روز',
    price,
    unit: 'تومان / کیلوگرم',
    normalizedPrice: price,
    normalizedUnit: 'تومان / کیلوگرم',
    sourceId: 'nabzgheymat-chicken-canonical',
    sourceUrl: response?.url || 'https://nabzgheymat.ir/',
    availability: 'in_stock',
    confidence: 'source-verified',
    observedAt: new Date().toISOString(),
  }];
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
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`${source.id}: source unavailable`);
}

export async function fetchAllPrices(fetchImpl = fetch) {
  const results = [];
  try {
    const canonical = {
      id: 'nabzgheymat-chicken-canonical',
      url: 'https://nabzgheymat.ir/',
      urls: canonicalChickenUrls,
      parse: parseCanonicalChicken,
    };
    const response = await fetchSource(canonical, fetchImpl);
    const raw = await response.text();
    const parsed = parseCanonicalChicken(raw, response);
    if (!parsed.length) console.error('Canonical chicken page found, but exact target row was not parsed');
    results.push(...validateItems(parsed));
  } catch (error) {
    console.error('Price source failed: nabzgheymat-chicken-canonical', error);
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
