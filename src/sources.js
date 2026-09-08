export const SOURCE_TYPES = Object.freeze({
  OFFICIAL: 'official',
  TRUSTED: 'trusted',
  BACKUP: 'backup',
});

const unavailable = /(ناموجود|اتمام\s*موجودی|تمام\s*شد|در\s*انبار\s*نیست|موجود\s*نیست)/i;

function parseParhanaEggPrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const pattern = /تخم\s*مرغ\s*پرحنایی\s*\(\s*بسته\s*(6|9|15|20|24|30)\s*عدد(?:ی)?\)([\s\S]{0,1200}?)(\d[\d٬,]*)\s*ریال/gi;

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
      sourceUrl: 'https://www.parhana.ir/',
      city: 'مشهد',
      availability: 'in_stock',
      confidence: 'source-verified',
      observedAt: now,
    });
  }
  return results;
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
    results.push({ id: `parhana-${id}`, title: `${name} - مشهد`, price: toman, unit: 'تومان / عدد', normalizedPrice: toman, normalizedUnit: 'تومان / عدد', sourceId: 'parhana-chicken', sourceUrl: 'https://www.parhana.ir/Products/', city: 'مشهد', availability: 'in_stock', confidence: 'source-verified', observedAt: now });
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
    // قیمت را فقط وقتی معتبر می‌دانیم که صراحتاً کنار «تومان» آمده باشد؛
    // این جلوی اشتباه گرفتن وزن محصول (مثلاً ۲ کیلوگرم) با قیمت را می‌گیرد.
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
    const match = html.match(pattern);
    if (!match || unavailable.test(match[3] ?? '')) continue;
    const rial = Number(String(match[2]).replace(/[٬,]/g, ''));
    const toman = rial / 10;
    if (!Number.isFinite(toman) || toman <= 0) continue;
    results.push({ id: `parhana-${id}`, title: `${name} - مشهد`, price: toman, unit: 'تومان / بسته', normalizedPrice: toman, normalizedUnit: 'تومان / بسته', sourceId: 'parhana-red-meat', sourceUrl: 'https://www.parhana.ir/Products/', city: 'مشهد', availability: 'in_stock', confidence: 'source-verified', observedAt: now });
  }
  return results;
}

export const sources = [
  { id: 'samaneh-124', name: 'سامانه ۱۲۴', type: SOURCE_TYPES.OFFICIAL, url: 'https://124.ir/', status: 'candidate', note: 'مرجع رسمی اعلام قیمت کالا و خدمات؛ اتصال خودکار فقط پس از تأیید endpoint و ساختار پاسخ انجام شود.', items: [] },
  { id: 'parhana', name: 'مرغ پرحنایی', type: SOURCE_TYPES.TRUSTED, url: 'https://www.parhana.ir/', status: 'verified', scope: 'mashhad-retail', city: 'مشهد', note: 'فروشگاه آنلاین محلی مشهد؛ قیمت‌های تخم‌مرغ در صفحه عمومی محصولات قابل مشاهده است و برای استخراج اولیه استفاده می‌شود.', parse: parseParhanaEggPrices, items: ['egg'] },
  { id: 'parhana-chicken', name: 'فروشگاه پرحنایی — مرغ', type: SOURCE_TYPES.TRUSTED, url: 'https://www.parhana.ir/Products/', status: 'verified', scope: 'mashhad-retail', city: 'مشهد', note: 'صفحه رسمی محصولات فروشگاه پرحنایی؛ فقط محصولاتی که هم قیمت دارند و هم موجودی آن‌ها قابل تأیید باشد منتشر می‌شوند.', parse: parseParhanaChickenPrices, items: ['chicken'] },
  { id: 'proteinatmeat-chicken', name: 'پروتئین ات میت — مرغ', type: SOURCE_TYPES.TRUSTED, url: 'https://proteinatmeat.com/', status: 'verified', scope: 'karaj-retail', city: 'کرج', note: 'فروشگاه آنلاین پروتئینی با قیمت و امکان افزودن به سبد؛ وزن محصول از عنوان/صفحه محصول کنترل و قیمت به ازای کیلوگرم نرمال می‌شود.', parse: parseProteinAtMeatChickenPrices, items: ['chicken'] },
  { id: 'parhana-red-meat', name: 'فروشگاه پرحنایی — گوشت قرمز', type: SOURCE_TYPES.TRUSTED, url: 'https://www.parhana.ir/Products/', status: 'candidate', scope: 'mashhad-retail', city: 'مشهد', note: 'فعلاً در حالت نامزد نگه داشته شده تا منبع گوشت قرمز به‌صورت جداگانه و با کنترل موجودی تکمیل شود.', parse: parseParhanaRedMeatPrices, items: ['red-meat'] },
  { id: 'digikala', name: 'دیجی‌کالا', type: SOURCE_TYPES.TRUSTED, url: 'https://www.digikala.com/search/category-eggs/', status: 'candidate', scope: 'online-retail', note: 'فروشگاه آنلاین؛ قیمت هر محصول فقط پس از استخراج زنده، تشخیص واحد/وزن و اعتبارسنجی منتشر شود.', items: [] },
  { id: 'snappmarket', name: 'اسنپ‌مارکت', type: SOURCE_TYPES.TRUSTED, url: 'https://snapp.market/', status: 'candidate', scope: 'online-grocery', note: 'فروشگاه آنلاین مواد غذایی؛ برای قیمت شهری باید محدوده/شهر کاربر نیز در نظر گرفته شود.', items: [] },
  { id: 'okala', name: 'اُکالا', type: SOURCE_TYPES.TRUSTED, url: 'https://okala.com/', status: 'candidate', scope: 'online-grocery', note: 'فروشگاه آنلاین مواد غذایی؛ استخراج فقط بعد از تأیید endpoint یا داده قابل‌اعتماد انجام شود.', items: [] },
  { id: 'emalls', name: 'ایمالز', type: SOURCE_TYPES.BACKUP, url: 'https://emalls.ir/', status: 'candidate', scope: 'price-comparison', note: 'منبع پشتیبان برای مقایسه؛ نباید بدون انتساب و اعتبارسنجی به‌عنوان قیمت مرجع رسمی استفاده شود.', items: [] },
];

export function getSourceById(id) { return sources.find((source) => source.id === id) ?? null; }
export function getVerifiedSources() { return sources.filter((source) => source.status === 'verified'); }
