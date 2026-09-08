export const SOURCE_TYPES = Object.freeze({
  OFFICIAL: 'official',
  TRUSTED: 'trusted',
  BACKUP: 'backup',
});

const unavailable = /(ناموجود|اتمام\s*موجودی|تمام\s*شد|در\s*انبار\s*نیست|موجود\s*نیست)/i;

const PARHANA_SHOP_URL = 'https://www.parhana.ir/';
const PARHANA_EGG_URLS = [
  'https://www.parhana.ir/Products/',
  'https://www.parhana.ir/',
  'https://www.parhana.ir/shop/'
];
const PARHANA_ADDRESS = 'مشهد، شعب فروشگاه‌های زنجیره‌ای پرحنایی';
const PARHANA_NESHAN_SEARCH = 'https://nshn.ir/?q=فروشگاه%20پرحنایی%20مشهد';

function parseParhanaEggPrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const pattern = /تخم\s*مرغ\s*پرحنایی\s*\(\s*بسته\s*(6|9|15|20|24|30)\s*عدد(?:ی)?\)([\s\S]{0,700}?)(\d[\d٬,]*)\s*ریال/gi;

  for (const match of html.matchAll(pattern)) {
    const count = Number(match[1]);
    const productBlock = match[2] ?? '';
    if (unavailable.test(productBlock)) continue;
    const rial = Number(String(match[3]).replace(/[٬,]/g, ''));
    const toman = rial / 10;
    if (!Number.isFinite(toman) || toman <= 0 || !Number.isInteger(count) || count <= 0) continue;
    results.push({
      id: `parhana-egg-${count}`,
      title: `تخم مرغ پرحنایی ${count} عددی - مشهد`,
      price: toman,
      unit: 'تومان / بسته',
      normalizedPrice: Math.round((toman / count) * 100) / 100,
      normalizedUnit: 'تومان / عدد',
      sourceId: 'parhana',
      sourceUrl: PARHANA_SHOP_URL,
      city: 'مشهد',
      address: PARHANA_ADDRESS,
      neshanUrl: PARHANA_NESHAN_SEARCH,
      availability: 'in_stock',
      confidence: 'source-verified',
      observedAt: now,
    });
  }

  const unique = new Map();
  for (const item of results) unique.set(item.id, item);
  return [...unique.values()];
}

function parseParhanaChickenPrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const products = [
    ['مرغ گرید A', 'chicken-grade-a'], ['مرغ متوسط', 'chicken-medium'], ['مرغ بزرگ', 'chicken-large'],
    ['مرغ کوچک ( اکبر جوجه)', 'chicken-small'], ['مرغ سایز (مجلسی)', 'chicken-size-majlesi'], ['مرغ 8 تکه بدون پوست', 'chicken-8-piece-skinless'],
  ];
  for (const [name, id] of products) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escaped}([\\s\\S]{0,900}?)(\\d[\\d٬,]*)\\s*ریال([\\s\\S]{0,180}?)(ناموجود|مشاهده محصول)`, 'i');
    const match = html.match(pattern);
    if (!match) continue;
    if (/ناموجود/i.test(match[3] ?? '') || /ناموجود/i.test(match[4] ?? '')) continue;
    const rial = Number(String(match[2]).replace(/[٬,]/g, ''));
    const toman = rial / 10;
    if (!Number.isFinite(toman) || toman <= 0) continue;
    results.push({ id: `parhana-${id}`, title: `${name} - مشهد`, price: toman, unit: 'تومان / عدد', normalizedPrice: toman, normalizedUnit: 'تومان / عدد', sourceId: 'parhana-chicken', sourceUrl: PARHANA_SHOP_URL, city: 'مشهد', address: PARHANA_ADDRESS, neshanUrl: PARHANA_NESHAN_SEARCH, availability: 'in_stock', confidence: 'source-verified', observedAt: now });
  }
  return results;
}

function parseProteinAtMeatChickenPrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const products = [
    ['مرغ کامل خرد شده بدون پوست', 'protein-chicken-whole-skinless', 2],
    ['ران مرغ با کمر', 'protein-chicken-thigh-back', 1],
    ['ران مرغ بدون کمر', 'protein-chicken-thigh-boneless-back', 2],
  ];

  for (const [name, id, knownKg] of products) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escaped}([\\s\\S]{0,900}?)([0-9۰-۹][0-9۰-۹٬,]*)\\s*تومان([\\s\\S]{0,500}?)(افزودن به سبد خرید|انتخاب گزینه ها)`, 'i');
    const match = html.match(pattern);
    if (!match) continue;
    const beforePrice = match[1] ?? '';
    if (unavailable.test(beforePrice)) continue;
    const toman = Number(String(match[2]).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٬,]/g, ''));
    if (!Number.isFinite(toman) || toman <= 0 || !knownKg) continue;
    results.push({
      id,
      title: `${name} - کرج`,
      price: toman,
      unit: `تومان / ${knownKg} کیلوگرم`,
      normalizedPrice: Math.round(toman / knownKg),
      normalizedUnit: 'تومان / کیلوگرم',
      sourceId: 'proteinatmeat-chicken',
      sourceUrl: 'https://proteinatmeat.com/',
      city: 'کرج',
      address: 'کرج — فروشگاه آنلاین پروتئین ات میت',
      neshanUrl: 'https://nshn.ir/?q=پروتئین%20ات%20میت%20کرج',
      availability: 'in_stock',
      confidence: 'source-verified',
      observedAt: now,
    });
  }
  return results;
}

function parseParhanaRedMeatPrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const products = [
    ['کتف بره', 'lamb-shoulder'],
    ['سردست بره گوسفندی', 'lamb-forequarter'],
    ['قلوه گاه گوسفندی', 'lamb-flank'],
    ['گوشت گوساله', 'veal'],
  ];
  for (const [name, id] of products) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escaped}([\\s\\S]{0,900}?)(\\d[\\d٬,]*)\\s*ریال([\\s\\S]{0,180})`, 'i');
    const match = new RegExp(pattern).exec(html);
    if (!match || unavailable.test(match[3] ?? '')) continue;
    const rial = Number(String(match[2]).replace(/[٬,]/g, ''));
    const toman = rial / 10;
    if (!Number.isFinite(toman) || toman <= 0) continue;
    results.push({ id: `parhana-${id}`, title: `${name} - مشهد`, price: toman, unit: 'تومان / بسته', normalizedPrice: toman, normalizedUnit: 'تومان / بسته', sourceId: 'parhana-red-meat', sourceUrl: PARHANA_SHOP_URL, city: 'مشهد', address: PARHANA_ADDRESS, neshanUrl: PARHANA_NESHAN_SEARCH, availability: 'in_stock', confidence: 'source-verified', observedAt: now });
  }
  return results;
}

export const sources = [
  { id: 'samaneh-124', name: 'سامانه ۱۲۴', type: SOURCE_TYPES.OFFICIAL, url: 'https://124.ir/', status: 'candidate', note: 'مرجع رسمی اعلام قیمت کالا و خدمات؛ اتصال خودکار فقط پس از تأیید endpoint و ساختار پاسخ انجام شود.', items: [] },
  { id: 'parhana', name: 'مرغ پرحنایی — تخم مرغ', type: SOURCE_TYPES.TRUSTED, url: PARHANA_SHOP_URL, urls: () => PARHANA_EGG_URLS, status: 'verified', scope: 'mashhad-retail', city: 'مشهد', address: PARHANA_ADDRESS, neshanUrl: PARHANA_NESHAN_SEARCH, note: 'منبع رسمی پرحنایی؛ استخراج از صفحه محصولات و دو صفحه پشتیبان رسمی انجام می‌شود تا خطای یک مسیر باعث از دست رفتن قیمت نشود.', parse: parseParhanaEggPrices, items: ['egg'] },
  { id: 'parhana-chicken', name: 'فروشگاه پرحنایی — مرغ', type: SOURCE_TYPES.TRUSTED, url: PARHANA_SHOP_URL, status: 'verified', scope: 'mashhad-retail', city: 'مشهد', address: PARHANA_ADDRESS, neshanUrl: PARHANA_NESHAN_SEARCH, note: 'صفحه رسمی فروشگاه پرحنایی؛ فقط محصولاتی که قیمت و موجودی قابل تأیید دارند منتشر می‌شوند.', parse: parseParhanaChickenPrices, items: ['chicken'] },
  { id: 'proteinatmeat-chicken', name: 'پروتئین ات میت — مرغ', type: SOURCE_TYPES.TRUSTED, url: 'https://proteinatmeat.com/', status: 'verified', scope: 'karaj-retail', city: 'کرج', address: 'کرج — فروشگاه آنلاین پروتئین ات میت', neshanUrl: 'https://nshn.ir/?q=پروتئین%20ات%20میت%20کرج', note: 'فروشگاه آنلاین پروتئینی با قیمت و امکان افزودن به سبد؛ وزن محصول از صفحه محصول کنترل می‌شود.', parse: parseProteinAtMeatChickenPrices, items: ['chicken'] },
  { id: 'parhana-red-meat', name: 'فروشگاه پرحنایی — گوشت قرمز', type: SOURCE_TYPES.TRUSTED, url: PARHANA_SHOP_URL, status: 'candidate', scope: 'mashhad-retail', city: 'مشهد', address: PARHANA_ADDRESS, neshanUrl: PARHANA_NESHAN_SEARCH, note: 'فعلاً نامزد؛ فعال‌سازی عمومی پس از تکمیل کنترل منبع.', parse: parseParhanaRedMeatPrices, items: ['red-meat'] },
  { id: 'digikala', name: 'دیجی‌کالا', type: SOURCE_TYPES.TRUSTED, url: 'https://www.digikala.com/search/category-eggs/', status: 'candidate', scope: 'online-retail', note: 'فروشگاه آنلاین؛ قیمت هر محصول فقط پس از استخراج زنده، تشخیص واحد/وزن و اعتبارسنجی منتشر شود.', items: [] },
  { id: 'snappmarket', name: 'اسنپ‌مارکت', type: SOURCE_TYPES.TRUSTED, url: 'https://snapp.market/', status: 'candidate', scope: 'online-grocery', note: 'فروشگاه آنلاین مواد غذایی؛ برای قیمت شهری باید محدوده/شهر کاربر نیز در نظر گرفته شود.', items: [] },
  { id: 'okala', name: 'اُکالا', type: SOURCE_TYPES.TRUSTED, url: 'https://okala.com/', status: 'candidate', scope: 'online-grocery', note: 'فروشگاه آنلاین مواد غذایی؛ استخراج فقط بعد از تأیید endpoint یا داده قابل‌اعتماد انجام شود.', items: [] },
  { id: 'emalls', name: 'ایمالز', type: SOURCE_TYPES.BACKUP, url: 'https://emalls.ir/', status: 'candidate', scope: 'price-comparison', note: 'منبع پشتیبان برای مقایسه؛ نباید بدون انتساب و اعتبارسنجی به‌عنوان قیمت مرجع رسمی استفاده شود.', items: [] },
];

export function getSourceById(id) { return sources.find((source) => source.id === id) ?? null; }
export function getVerifiedSources() { return sources.filter((source) => source.status === 'verified'); }
