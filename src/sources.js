export const SOURCE_TYPES = Object.freeze({
  OFFICIAL: 'official',
  TRUSTED: 'trusted',
  BACKUP: 'backup',
});

function parseParhanaEggPrices(raw) {
  const html = String(raw ?? '');
  const now = new Date().toISOString();
  const results = [];
  const pattern = /تخم\s*مرغ\s*پرحنایی\s*\(\s*بسته\s*(6|9|15|20|24|30)\s*عدد(?:ی)?\s*\)[\s\S]{0,1200}?(\d[\d٬,]*)\s*ریال/gi;

  for (const match of html.matchAll(pattern)) {
    const count = Number(match[1]);
    const rial = Number(String(match[2]).replace(/[٬,]/g, ''));
    const toman = rial / 10;
    if (!Number.isFinite(toman) || toman <= 0) continue;

    results.push({
      id: `parhana-egg-${count}`,
      title: `تخم مرغ پرحنایی ${count} عددی - مشهد`,
      price: toman,
      unit: 'تومان / بسته',
      sourceId: 'parhana',
      observedAt: now,
    });
  }

  return results;
}

export const sources = [
  {
    id: 'samaneh-124',
    name: 'سامانه ۱۲۴',
    type: SOURCE_TYPES.OFFICIAL,
    url: 'https://124.ir/',
    status: 'candidate',
    note: 'مرجع رسمی اعلام قیمت کالا و خدمات؛ اتصال خودکار فقط پس از تأیید endpoint و ساختار پاسخ انجام شود.',
    items: [],
  },
  {
    id: 'parhana',
    name: 'مرغ پرحنایی',
    type: SOURCE_TYPES.TRUSTED,
    url: 'https://www.parhana.ir/',
    status: 'verified',
    scope: 'mashhad-retail',
    city: 'مشهد',
    note: 'فروشگاه آنلاین محلی مشهد؛ قیمت‌های تخم‌مرغ در صفحه عمومی محصولات قابل مشاهده است و برای استخراج اولیه استفاده می‌شود.',
    parse: parseParhanaEggPrices,
    items: ['egg'],
  },
  {
    id: 'digikala',
    name: 'دیجی‌کالا',
    type: SOURCE_TYPES.TRUSTED,
    url: 'https://www.digikala.com/search/category-eggs/',
    status: 'candidate',
    scope: 'online-retail',
    note: 'فروشگاه آنلاین؛ قیمت هر محصول فقط پس از استخراج زنده، تشخیص واحد/وزن و اعتبارسنجی منتشر شود.',
    items: [],
  },
  {
    id: 'snappmarket',
    name: 'اسنپ‌مارکت',
    type: SOURCE_TYPES.TRUSTED,
    url: 'https://snapp.market/',
    status: 'candidate',
    scope: 'online-grocery',
    note: 'فروشگاه آنلاین مواد غذایی؛ برای قیمت شهری باید محدوده/شهر کاربر نیز در نظر گرفته شود.',
    items: [],
  },
  {
    id: 'okala',
    name: 'اُکالا',
    type: SOURCE_TYPES.TRUSTED,
    url: 'https://okala.com/',
    status: 'candidate',
    scope: 'online-grocery',
    note: 'فروشگاه آنلاین مواد غذایی؛ استخراج فقط بعد از تأیید endpoint یا داده قابل‌اعتماد انجام شود.',
    items: [],
  },
  {
    id: 'emalls',
    name: 'ایمالز',
    type: SOURCE_TYPES.BACKUP,
    url: 'https://emalls.ir/',
    status: 'candidate',
    scope: 'price-comparison',
    note: 'منبع پشتیبان برای مقایسه؛ نباید بدون انتساب و اعتبارسنجی به‌عنوان قیمت مرجع رسمی استفاده شود.',
    items: [],
  },
];

export function getSourceById(id) {
  return sources.find((source) => source.id === id) ?? null;
}

export function getVerifiedSources() {
  return sources.filter((source) => source.status === 'verified');
}
