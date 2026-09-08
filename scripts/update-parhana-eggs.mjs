import fs from 'node:fs/promises';

const SOURCE = 'https://parhana.ir/shop/';
const DATA_FILE = 'data/prices.json';

const faDigits = '۰۱۲۳۴۵۶۷۸۹';
const arDigits = '٠١٢٣٤٥٦٧٨٩';
function normalizeDigits(value) {
  return value.replace(/[۰-۹]/g, d => String(faDigits.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(arDigits.indexOf(d)))
    .replace(/[٬,]/g, '')
    .replace(/\s+/g, ' ');
}

function stripHtml(html) {
  return normalizeDigits(html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&zwnj;/gi, '')
    .replace(/&amp;/gi, '&'));
}

function extractPrice(text, count) {
  const compact = text.replace(/\s+/g, ' ');
  const re = new RegExp(`تخم\\s*مرغ[^.]{0,220}?${count}\\s*عدد(?:ی)?[^.]{0,220}?(\\d{4,7})\\s*(?:تومان|ت)`, 'i');
  const m = compact.match(re);
  if (m) return Number(m[1]);

  const reverse = new RegExp(`${count}\\s*عدد(?:ی)?[^.]{0,220}?تخم\\s*مرغ[^.]{0,220}?(\\d{4,7})\\s*(?:تومان|ت)`, 'i');
  const r = compact.match(reverse);
  return r ? Number(r[1]) : null;
}

const response = await fetch(SOURCE, { headers: { 'User-Agent': 'Gheymat-Rooz/1.0 price verifier' } });
if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
const html = await response.text();
const text = stripHtml(html);

const counts = [30, 24, 20, 15, 9, 6];
const prices = Object.fromEntries(counts.map(c => [c, extractPrice(text, c)]));
const found = Object.values(prices).filter(Number.isFinite).length;

if (found === 0) {
  throw new Error('No verified egg prices found on the official Parhana shop page; existing data was left untouched.');
}

const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
const now = new Date().toISOString();
for (const item of data.items ?? []) {
  const m = item.id?.match(/^parhana-egg-(30|24|20|15|9|6)$/);
  if (!m) continue;
  const count = Number(m[1]);
  const price = prices[count];
  if (!Number.isFinite(price)) continue;
  item.price = price;
  item.normalizedPrice = Number((price / count).toFixed(2));
  item.sourceUrl = SOURCE;
  item.sourceId = 'parhana-official';
  item.confidence = 'official-source-live-extracted';
  item.observedAt = now;
  item.sourcePublishedAt = now;
}

data.updatedAt = now;
data.status = found === counts.length ? 'ok' : 'partial';
data.note = `قیمت تخم‌مرغ از صفحه رسمی فروشگاه پرحنایی به‌صورت خودکار بررسی می‌شود. در این اجرا ${found} مورد از ${counts.length} بسته با الگوی قابل‌اعتماد استخراج شد؛ مواردی که پیدا نشدند بدون تغییر باقی ماندند.`;
await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify({ found, prices, updatedAt: now }, null, 2));
