export const SOURCE_TYPES = Object.freeze({
  OFFICIAL: 'official',
  TRUSTED: 'trusted',
  BACKUP: 'backup',
});

function parseParhanaEggPrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const pattern = /تخم\s*مرغ\s*پرحنایی\s*\(\s*بسته\s*(6|9|15|20|24|30)\s*عدد(?:ی)?\s*\)([\s\S]{0,1200}?)(\d[\d٬,]*)\s*ریال/gi;
  const unavailable = /(ناموجود|اتمام\s*موجودی|تمام\s*شد|در\s*انبار\s*نیست|موجود\s*نیست)/i;

  for (const match of html.matchAll(pattern)) {
    const count = Number(match[1]);
    const productBlock = match[2] ?? '';
    if (unavailable.test(productBlock)) continue;
    const rial = Number(String(match[3]).replace(/[٬,]/g, ''));
    const toman = rial / 10;
    if (!Number.isFinite(toman) || toman <= 0 || !Number.isInteger(count) || count <= 0) continue;
    results.push({ id: `parhana-egg-${count}`, title: `تخم مرغ پرحنایی ${count} عددی - مشهد`, price: toman, unit: 'تومان / بسته', normalizedPrice: Math.round((toman / count) * 100) / 100, normalizedUnit: 'تومان / عدد', sourceId: 'parhana', sourceUrl: 'https://www.parhana.ir/', city: 'مشهد', availability: 'in_stock', confidence: 'source-verified', observedAt: now });
  }
  return results;
}

function parseParhanaChickenPrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const products = [['مرغ گرید A','chicken-grade-a'],['مرغ متوسط','chicken-medium'],['مرغ بزرگ','chicken-large'],['مرغ کوچک ( اکبر جوجه)','chicken-small'],['مرغ سایز (مجلسی)','chicken-size-majlesi'],['مرغ 8 تکه بدون پوست','chicken-8-piece-skinless']];
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

function parseCaspianRicePrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const productPattern = /<(?:h2|h3)[^>]*>[\s\S]*?([^<>]*برنج[^<>]*)<\/[hH][23]>([\s\S]{0,1600}?)(?:موجود\s*در\s*انبار)([\s\S]{0,700}?)(?:کیلویی\s*)([\d٬,]+)\s*تومان/gi;
  for (const match of html.matchAll(productPattern)) {
    const title = String(match[1]).replace(/\s+/g, ' ').trim();
    const tomanPerKg = Number(String(match[4]).replace(/[٬,]/g, ''));
    if (!title || !Number.isFinite(tomanPerKg) || tomanPerKg <= 0) continue;
    const cleanTitle = title.replace(/\s+/g, ' ').trim();
    const id = `caspian-rice-${cleanTitle.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80)}`;
    if (results.some((x) => x.id === id)) continue;
    results.push({ id, title: `${cleanTitle} - فروشگاه کاسپین`, price: tomanPerKg, unit: 'تومان / کیلو', normalizedPrice: tomanPerKg, normalizedUnit: 'تومان / کیلو', sourceId: 'caspian-rice', sourceUrl: 'https://caspianrice.com/', city: 'سراسری', availability: 'in_stock', confidence: 'source-verified', observedAt: now });
  }
  return results;
}

export const sources = [
  { id: 'samaneh-124', name: 'سامانه ۱۲۴', type: SOURCE_TYPES.OFFICIAL, url: 'https://124.ir/', status: 'candidate', note: 'مرجع رسمی اعلام قیمت کالا و خدمات؛ اتصال خودکار فقط پس از تأیید endpoint و ساختار پاسخ انجام شود.', items: [] },
  { id: 'parhana', name: 'مرغ پرحنایی', type: SOURCE_TYPES.TRUSTED, url: 'https://www.parhana.ir/', status: 'verified', scope: 'mashhad-retail', city: 'مشهد', note: 'فروشگاه آنلاین محلی مشهد؛ قیمت‌های تخم‌مرغ در صفحه عمومی محصولات قابل مشاهده است.', parse: parseParhanaEggPrices, items: ['egg'] },
  { id: 'parhana-chicken', name: 'مرغ پرحنایی — مرغ', type: SOURCE_TYPES.TRUSTED, url: 'https://www.parhana.ir/Products/', status: 'verified', scope: 'mashhad-retail', city: 'مشهد', note: 'صفحه رسمی محصولات فروشگاه پرحنایی؛ فقط محصولات دارای قیمت و موجودی قابل تأیید منتشر می‌شوند.', parse: parseParhanaChickenPrices, items: ['chicken'] },
  { id: 'caspian-rice', name: 'فروشگاه برنج کاسپین', type: SOURCE_TYPES.TRUSTED, url: 'https://caspianrice.com/', status: 'verified', scope: 'online-retail', city: 'سراسری', note: 'فروشگاه تخصصی برنج با محصولات دارای موجودی و قیمت به تومان؛ قیمت نرمال‌شده بر اساس هر کیلو استخراج می‌شود. این منبع فروش آنلاین سراسری است و قیمت مشهد محسوب نمی‌شود.', parse: parseCaspianRicePrices, items: ['rice'] },
  { id: 'digikala', name: 'دیجی‌کالا', type: SOURCE_TYPES.TRUSTED, url: 'https://www.digikala.com/search/category-eggs/', status: 'candidate', scope: 'online-retail', note: 'فروشگاه آنلاین؛ قیمت هر محصول فقط پس از استخراج زنده، تشخیص واحد/وزن و اعتبارسنجی منتشر شود.', items: [] },
  { id: 'snappmarket', name: 'اسنپ‌مارکت', type: SOURCE_TYPES.TRUSTED, url: 'https://snapp.market/', status: 'candidate', scope: 'online-grocery', note: 'فروشگاه آنلاین مواد غذایی؛ برای قیمت شهری باید محدوده/شهر کاربر نیز در نظر گرفته شود.', items: [] },
  { id: 'okala', name: 'اُکالا', type: SOURCE_TYPES.TRUSTED, url: 'https://okala.com/', status: 'candidate', scope: 'online-grocery', note: 'فروشگاه آنلاین مواد غذایی؛ استخراج فقط بعد از تأیید endpoint یا داده قابل‌اعتماد انجام شود.', items: [] },
  { id: 'emalls', name: 'ایمالز', type: SOURCE_TYPES.BACKUP, url: 'https://emalls.ir/', status: 'candidate', scope: 'price-comparison', note: 'منبع پشتیبان برای مقایسه؛ نباید بدون انتساب و اعتبارسنجی به‌عنوان قیمت مرجع رسمی استفاده شود.', items: [] },
];

export function getSourceById(id) { return sources.find((source) => source.id === id) ?? null; }
export function getVerifiedSources() { return sources.filter((source) => source.status === 'verified'); }
