// Price-source registry for the Daily Price project.
// IMPORTANT: A source is not considered verified until its live response
// has been fetched and its parser/validation rules have been tested.

export const SOURCE_TYPES = Object.freeze({
  OFFICIAL: 'official',
  TRUSTED: 'trusted',
  BACKUP: 'backup',
});

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
    id: 'digikala',
    name: 'دیجی‌کالا',
    type: SOURCE_TYPES.TRUSTED,
    url: 'https://www.digikala.com/',
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
