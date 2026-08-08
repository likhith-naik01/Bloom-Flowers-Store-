import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check, ShoppingBag, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart, getItemEffectivePrice } = useCart();

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const variants = Array.isArray(product.unitVariants) && product.unitVariants.length > 0
    ? product.unitVariants
    : [{ unit: product.unit || 'piece', price: product.price }];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const effectivePrice = getItemEffectivePrice({ ...product, price: selectedVariant.price });
  const hasDiscount = effectivePrice < selectedVariant.price;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(
      {
        ...product,
        selectedUnit: selectedVariant.unit,
        price: selectedVariant.price
      },
      qty
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Multi-Photo Carousel */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-3 group bg-slate-900">
          {imagesList[activeImgIndex] ? (
            <img
              src={imagesList[activeImgIndex]}
              alt={product.nameEn || product.name || 'Photo'}
              className={`w-full h-full object-cover ${!product.inStock ? 'grayscale opacity-60' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-3xl">🌸</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

          {/* Navigation Arrows for Multiple Photos */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={() => setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/70 text-white backdrop-blur-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveImgIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/70 text-white backdrop-blur-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
              <span className="px-3 py-1.5 rounded-full bg-red-950 border border-red-500/50 text-red-300 font-bold text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Currently Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Photo Thumbnails */}
        {imagesList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {imagesList.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImgIndex(i)}
                className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-900 ${
                  activeImgIndex === i ? 'border-rose-500 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-extrabold text-xs border border-rose-500/30">
              SL-{product.slNo || 1}
            </span>
            <h2 className="text-xl font-extrabold text-white">{product.nameEn}</h2>
          </div>
          {(product.nameHi || product.nameKn) && (
            <p className="text-xs text-rose-300 font-medium mt-0.5">
              {[product.nameHi, product.nameKn].filter(Boolean).join(' • ')}
            </p>
          )}

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {product.description}
          </p>

          {/* Weight / Unit Variants Selection */}
          {variants.length > 1 && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-900/80 border border-white/10">
              <label className="text-xs font-bold text-slate-200 block mb-2">
                Select Weight / Quantity Option:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {variants.map((v, idx) => {
                  const isSelected = selectedVariant.unit === v.unit;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                        isSelected
                          ? 'bg-rose-600/30 text-white border-rose-500/60 font-bold'
                          : 'bg-slate-800/60 text-slate-400 border-white/5 hover:bg-slate-700'
                      }`}
                    >
                      <span className="block truncate">{v.unit}</span>
                      <span className="text-rose-300 font-extrabold text-xs">₹{v.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price & Quantity Breakdown */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Unit Price</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-extrabold text-white">₹{effectivePrice}</span>
                <span className="text-xs text-rose-300 font-semibold">/ {selectedVariant.unit}</span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">₹{selectedVariant.price}</span>
                )}
              </div>
            </div>

            {/* Quantity Counter */}
            {product.inStock && (
              <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center hover:bg-slate-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-white">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center hover:bg-slate-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-5">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                !product.inStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : added
                  ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-600/40 active:scale-98'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add {qty} x {selectedVariant.unit} to Cart (₹{effectivePrice * qty})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
