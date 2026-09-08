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
];

export function getSourceById(id) {
  return sources.find((source) => source.id === id) ?? null;
}

export function getVerifiedSources() {
  return sources.filter((source) => source.status === 'verified');
}
