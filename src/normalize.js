const DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function normalizeDigits(value) {
  return String(value ?? '').replace(/[۰-۹]/g, (digit) => String(DIGITS.indexOf(digit)));
}

export function normalizePrice(value) {
  const normalized = normalizeDigits(value)
    .replace(/[٬,]/g, '')
    .replace(/تومان|ریال/gi, '')
    .trim();

  const number = Number(normalized);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function validatePrice(value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const price = normalizePrice(value);
  if (price === null || price < min || price > max) return null;
  return price;
}

export function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null;

  const price = normalizePrice(item.price);
  if (price === null) return null;

  return {
    id: String(item.id ?? '').trim(),
    title: String(item.title ?? '').trim(),
    price,
    unit: String(item.unit ?? 'تومان').trim(),
    sourceId: String(item.sourceId ?? '').trim(),
    observedAt: item.observedAt ?? new Date().toISOString(),
  };
}

export function validateItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeItem).filter(Boolean);
}
