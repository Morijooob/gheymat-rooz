// Candidate online-store sources for store-level price discovery.
// These are NOT verified yet. A source becomes verified only after its live
// product response, city behavior, availability and parser are tested.

export const STORE_SOURCE_TYPES = Object.freeze({
  DIRECT_STORE: 'direct-store',
  MARKETPLACE: 'marketplace',
  AGGREGATOR: 'aggregator',
});

export const storeSources = [
  {
    id: 'digikala',
    name: 'دیجی‌کالا',
    type: STORE_SOURCE_TYPES.DIRECT_STORE,
    url: 'https://www.digikala.com/',
    status: 'candidate',
    note: 'فروشگاه آنلاین؛ ابتدا باید محصول، قیمت و محدودیت شهر/ارسال بررسی شود.',
  },
  {
    id: 'snapp-market',
    name: 'اسنپ‌مارکت',
    type: STORE_SOURCE_TYPES.DIRECT_STORE,
    url: 'https://snapp.market/',
    status: 'candidate',
    note: 'فروشگاه آنلاین مواد غذایی؛ قیمت و موجودی باید برای شهر مشخص بررسی شود.',
  },
  {
    id: 'okala',
    name: 'اُکالا',
    type: STORE_SOURCE_TYPES.DIRECT_STORE,
    url: 'https://okala.com/',
    status: 'candidate',
    note: 'فروشگاه آنلاین مواد غذایی؛ قیمت و موجودی باید برای شهر مشخص بررسی شود.',
  },
  {
    id: 'emalls',
    name: 'ایمالز',
    type: STORE_SOURCE_TYPES.AGGREGATOR,
    url: 'https://emalls.ir/',
    status: 'candidate',
    note: 'برای کشف فروشندگان و مقایسه قیمت مفید است؛ منبع اصلی قیمت محسوب نمی‌شود مگر پس از اعتبارسنجی.',
  },
];

export function getStoreSourceById(id) {
  return storeSources.find((source) => source.id === id) ?? null;
}

export function getVerifiedStoreSources() {
  return storeSources.filter((source) => source.status === 'verified');
}
