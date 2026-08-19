import { INITIAL_PRODUCTS } from './sampleData.js';

/**
 * Robustly resolves product image and unit variant details for any order item.
 * Searches item properties first, then live loaded products, then sampleData fallback.
 */
export function getOrderItemDetails(it, liveProducts = []) {
  if (!it) return { img: '', unit: 'piece', matchingProd: null };

  const allProds = Array.isArray(liveProducts) && liveProducts.length > 0
    ? [...liveProducts, ...INITIAL_PRODUCTS]
    : INITIAL_PRODUCTS;

  const itId = String(it.id || '').trim().toLowerCase();
  const itName = String(it.nameEn || it.name || '').trim().toLowerCase();

  const matchingProd = allProds.find((p) => {
    if (!p) return false;
    const pId = String(p.id || '').trim().toLowerCase();
    const pNameEn = String(p.nameEn || '').trim().toLowerCase();
    const pName = String(p.name || '').trim().toLowerCase();
    return (pId && itId && pId === itId) || (pNameEn && itName && pNameEn === itName) || (pName && itName && pName === itName);
  });

  const img =
    it.imageUrl ||
    it.image_url ||
    it.image ||
    (Array.isArray(it.images) && it.images[0]) ||
    matchingProd?.imageUrl ||
    matchingProd?.image_url ||
    matchingProd?.image ||
    (Array.isArray(matchingProd?.images) && matchingProd.images[0]) ||
    '';

  const unit = it.selectedUnit || it.unit || matchingProd?.unit || (Array.isArray(matchingProd?.unitVariants) && matchingProd.unitVariants[0]?.unit) || 'piece';

  return { img, unit, matchingProd };
}

/**
 * Searches product by Name (English, Hindi, Kannada, Tags) AND Serial Number (SL No / SL-1 / 1).
 */
export function matchProductSearch(p, query) {
  if (!query || !query.trim()) return true;
  if (!p) return false;

  const q = query.trim().toLowerCase();
  const rawDigits = q.replace(/\D/g, '');

  // Serial Number / SL No matching (e.g. "1", "sl-1", "sl 1", "sl1", "#1")
  const slStr = String(p.slNo || '').toLowerCase();
  if (
    slStr === q ||
    `sl-${slStr}` === q ||
    `sl ${slStr}` === q ||
    `sl${slStr}` === q ||
    `#${slStr}` === q ||
    `no-${slStr}` === q ||
    `no ${slStr}` === q ||
    `sl. ${slStr}` === q ||
    (slStr && rawDigits === slStr && (q.startsWith('sl') || q.startsWith('no') || q.startsWith('#') || !isNaN(q)))
  ) {
    return true;
  }

  // Name matching (English, Hindi, Kannada, Tags, Description)
  const nameEn = String(p.nameEn || p.name || '').toLowerCase();
  const nameHi = String(p.nameHi || '').toLowerCase();
  const nameKn = String(p.nameKn || '').toLowerCase();
  const desc = String(p.description || '').toLowerCase();
  const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';

  return (
    nameEn.includes(q) ||
    nameHi.includes(q) ||
    nameKn.includes(q) ||
    desc.includes(q) ||
    tags.includes(q)
  );
}
