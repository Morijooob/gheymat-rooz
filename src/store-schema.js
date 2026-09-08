// Canonical shape for verified store offers.
// No offer is published until its price, city, timestamp and source are verified.

export function normalizeStoreOffer(offer) {
  if (!offer || typeof offer !== 'object') return null;

  const price = Number(offer.price);
  if (!Number.isFinite(price) || price < 0) return null;

  const storeName = String(offer.storeName ?? '').trim();
  const itemName = String(offer.itemName ?? '').trim();
  const city = String(offer.city ?? '').trim();
  if (!storeName || !itemName || !city) return null;

  return {
    id: String(offer.id ?? `${storeName}-${itemName}-${city}`).trim(),
    storeName,
    itemName,
    price,
    unit: String(offer.unit ?? 'تومان').trim(),
    city,
    cityName: String(offer.cityName ?? city).trim(),
    distanceKm: Number.isFinite(Number(offer.distanceKm)) ? Number(offer.distanceKm) : null,
    url: String(offer.url ?? '').trim(),
    fetchedAt: offer.fetchedAt ?? new Date().toISOString(),
    source: String(offer.source ?? '').trim(),
    verified: offer.verified === true,
  };
}

export function validateStoreOffers(offers) {
  if (!Array.isArray(offers)) return [];
  return offers.map(normalizeStoreOffer).filter((offer) => offer?.verified === true);
}
