import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Check, AlertCircle, Eye, Images } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductModal from './ProductModal';

export default function ProductCard({ product }) {
  const { addToCart, getItemEffectivePrice } = useCart();
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const rawImg = product.imageUrl || product.image_url || product.image || '';
  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (rawImg ? [rawImg] : []);
  const displayImage = imagesList[0] || rawImg || '';

  const variants = Array.isArray(product.unitVariants) && product.unitVariants.length > 0
    ? product.unitVariants
    : [{ unit: product.unit || 'piece', price: product.price || 0 }];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  useEffect(() => {
    if (variants && variants.length > 0) {
      setSelectedVariant(variants[0]);
    }
  }, [product?.id, product?.unit, product?.price]);

  const effectivePrice = getItemEffectivePrice({ ...product, price: selectedVariant.price });
  const hasDiscount = effectivePrice < selectedVariant.price;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart({
      ...product,
      unit: selectedVariant.unit || product.unit || 'piece',
      selectedUnit: selectedVariant.unit || product.unit || 'piece',
      price: selectedVariant.price
    }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group relative rounded-2xl glass-panel border border-white/10 hover:border-rose-500/40 transition-all p-3 flex flex-col justify-between cursor-pointer overflow-hidden bg-slate-900/60"
      >
        {/* Top Badges */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2.5 bg-slate-800">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.nameEn || product.name || 'Product'}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                !product.inStock ? 'grayscale opacity-60' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl">🌸</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          {/* Discount Badge */}
          {hasDiscount && product.inStock && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] shadow-lg">
              {product.discountType === 'percent'
                ? `${product.discountValue}% OFF`
                : `₹${product.discountValue} OFF`}
            </span>
          )}

          {/* Multiple Photos Badge */}
          {imagesList.length > 1 && (
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-md text-slate-200 font-bold text-[9px] flex items-center gap-1">
              <Images className="w-3 h-3 text-rose-400" /> {imagesList.length} Photos
            </span>
          )}

          {/* Stock Badge */}
          {!product.inStock ? (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-950/90 border border-red-500/50 text-red-300 font-bold text-[10px] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Sold Out
            </span>
          ) : (
            <span className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-black text-[10px] border border-rose-500/30">
                SL-{product.slNo || 1}
              </span>
              <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-rose-300 transition-colors flex-1">
                {product.nameEn}
              </h3>
            </div>
            {(product.nameHi || product.nameKn) && (
              <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                {[product.nameHi, product.nameKn].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          {/* Unit / Weight Variant Dropdown */}
          {variants.length > 1 && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <select
                value={selectedVariant.unit}
                onChange={(e) => {
                  const found = variants.find((v) => v.unit === e.target.value);
                  if (found) setSelectedVariant(found);
                }}
                className="w-full p-1 rounded-lg bg-slate-900 text-[11px] font-semibold text-rose-300 border border-white/10 focus:outline-none"
              >
                {variants.map((v, i) => (
                  <option key={i} value={v.unit}>
                    {v.unit} - ₹{v.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-between gap-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-white">
                  ₹{effectivePrice}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{selectedVariant.price}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider block -mt-0.5">
                per {selectedVariant.unit}
              </span>
            </div>

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1 transition-all shadow-md ${
                !product.inStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : added
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ProductModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
