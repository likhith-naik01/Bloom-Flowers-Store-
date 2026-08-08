import { INITIAL_PRODUCTS } from './sampleData.js';

/**
 * Robustly resolves product image and unit variant details for any order item.
 * Searches item properties first, then live loaded products, then sampleData fallback.
 */
export function getOrderItemDetails(it, liveProducts = []) {
  if (!it) return { img: '', unit: 'bunch', matchingProd: null };

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

  const unit = it.selectedUnit || it.unit || matchingProd?.unit || 'bunch';

  return { img, unit, matchingProd };
}
