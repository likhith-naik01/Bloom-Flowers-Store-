import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Maximize2,
  ZoomIn,
  Image as ImageIcon
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart, getItemEffectivePrice } = useCart();

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageFitMode, setImageFitMode] = useState('contain'); // 'contain' for full uncropped view

  const variants = Array.isArray(product.unitVariants) && product.unitVariants.length > 0
    ? product.unitVariants
    : [{ unit: product.unit || 'piece', price: product.price || 0 }];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (variants && variants.length > 0) {
      setSelectedVariant(variants[0]);
    }
  }, [product?.id, product?.unit, product?.price]);

  if (!product) return null;

  const effectivePrice = getItemEffectivePrice({ ...product, price: selectedVariant.price });
  const hasDiscount = effectivePrice < selectedVariant.price;

  const isSeasonal = Boolean(product.isSeasonal || product.is_seasonal);
  const isBestseller = Boolean(product.isBestseller);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(
      {
        ...product,
        unit: selectedVariant.unit || product.unit || 'piece',
        selectedUnit: selectedVariant.unit || product.unit || 'piece',
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

  const currentImage = imagesList[activeImgIndex] || '';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-darkBrown/80 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-md bg-creamCard border border-divineGold/40 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 relative max-h-[92vh] overflow-y-auto">
          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-creamCard/90 text-darkBrown hover:text-templeRed flex items-center justify-center transition-colors border border-divineGold/40 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Product Image Viewer Container */}
          <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-3 group bg-darkBrown/90 border border-divineGold/35 flex items-center justify-center">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.nameEn || product.name || 'Photo'}
                onClick={() => setIsLightboxOpen(true)}
                className={`w-full h-full cursor-zoom-in transition-all duration-300 ${
                  imageFitMode === 'contain' ? 'object-contain p-2' : 'object-cover'
                } ${!product.inStock ? 'grayscale opacity-60' : ''}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-warmMuted text-3xl">🌸</div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start max-w-[85%] z-10 pointer-events-none">
              {isSeasonal && (
                <span className="px-2.5 py-0.5 rounded-full bg-templeRed text-creamBg font-extrabold text-[10px] shadow-sm border border-divineGold/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-divineGold" /> {product.seasonalTag || 'Seasonal Pick'}
                </span>
              )}
              {isBestseller && (
                <span className="px-2.5 py-0.5 rounded-full bg-marigold text-darkBrown font-extrabold text-[10px] shadow-sm border border-divineGold/50 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-darkBrown text-darkBrown" /> Bestseller
                </span>
              )}
            </div>

            {/* Top Right Action Overlay: Tap to View Fullscreen / Toggle Fit */}
            {currentImage && (
              <div className="absolute top-2 right-14 flex items-center gap-1.5 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFitMode(imageFitMode === 'contain' ? 'cover' : 'contain');
                  }}
                  className="px-2 py-1 rounded-lg bg-darkBrown/80 hover:bg-darkBrown text-creamBg text-[10px] font-bold border border-divineGold/30 backdrop-blur-md flex items-center gap-1 shadow-sm transition-all"
                  title="Toggle Full Image vs Fill"
                >
                  <ImageIcon className="w-3 h-3 text-marigold" />
                  {imageFitMode === 'contain' ? 'Fit View' : 'Full Image'}
                </button>

                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="p-1.5 rounded-lg bg-darkBrown/80 hover:bg-darkBrown text-creamBg border border-divineGold/30 backdrop-blur-md shadow-sm transition-all"
                  title="Open Fullscreen Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-marigold" />
                </button>
              </div>
            )}

            {/* Tap Image Hint Banner at Bottom */}
            {currentImage && (
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-darkBrown/80 hover:bg-darkBrown text-creamBg text-[11px] font-bold border border-divineGold/40 backdrop-blur-md flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <ZoomIn className="w-3.5 h-3.5 text-marigold" /> Tap for Full-Screen HD View
              </button>
            )}

            {/* Navigation Arrows for Multiple Photos */}
            {imagesList.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-darkBrown/80 hover:bg-darkBrown text-creamBg border border-divineGold/30 backdrop-blur-md shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-darkBrown/80 hover:bg-darkBrown text-creamBg border border-divineGold/30 backdrop-blur-md shadow-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-darkBrown/75 backdrop-blur-xs z-20">
                <span className="px-3 py-1.5 rounded-full bg-templeRed text-creamBg font-bold text-xs flex items-center gap-1.5">
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
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-darkBrown/90 ${
                    activeImgIndex === i ? 'border-marigold scale-105 shadow-md' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-contain p-0.5" />
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-marigold/20 text-marigoldDark font-extrabold text-xs border border-marigold/40">
                SL-{product.slNo || 1}
              </span>
              <h2 className="text-xl font-serif font-extrabold text-darkBrown">{product.nameEn}</h2>
            </div>
            {(product.nameHi || product.nameKn) && (
              <p className="text-xs text-marigoldDark font-medium mt-0.5">
                {[product.nameHi, product.nameKn].filter(Boolean).join(' • ')}
              </p>
            )}

            <p className="text-xs text-warmSlate mt-2 leading-relaxed">
              {product.description}
            </p>

            {/* Weight / Unit Variants Selection */}
            {variants.length > 1 && (
              <div className="mt-4 p-3 rounded-2xl bg-creamSurface border border-divineGold/30">
                <label className="text-xs font-bold text-darkBrown block mb-2">
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
                            ? 'bg-marigold text-darkBrown border-divineGold font-bold shadow-sm'
                            : 'bg-creamCard text-warmSlate border-divineGold/20 hover:bg-marigold/10'
                        }`}
                      >
                        <span className="block truncate">{v.unit}</span>
                        <span className="text-templeRed font-extrabold text-xs">₹{v.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price & Quantity Breakdown */}
            <div className="mt-4 p-3.5 rounded-2xl bg-creamSurface border border-divineGold/35 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-warmMuted block uppercase tracking-wider font-bold">Unit Price</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-extrabold text-templeRed">₹{effectivePrice}</span>
                  <span className="text-xs text-marigoldDark font-bold">/ {selectedVariant.unit}</span>
                  {hasDiscount && (
                    <span className="text-xs text-warmMuted line-through">₹{selectedVariant.price}</span>
                  )}
                </div>
              </div>

              {/* Quantity Counter */}
              {product.inStock && (
                <div className="flex items-center gap-2 bg-creamCard rounded-xl p-1 border border-divineGold/40 shadow-sm">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-creamSurface text-darkBrown font-bold flex items-center justify-center hover:bg-marigold/20"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-extrabold text-sm text-darkBrown">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-7 h-7 rounded-lg bg-creamSurface text-darkBrown font-bold flex items-center justify-center hover:bg-marigold/20"
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
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  !product.inStock
                    ? 'bg-creamSurface text-warmMuted cursor-not-allowed border border-divineGold/20'
                    : added
                    ? 'bg-emerald-600 text-creamBg shadow-emerald-600/40'
                    : 'bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg shadow-marigold/30 active:scale-98 border border-divineGold/40'
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

      {/* FULL-SCREEN IMAGE LIGHTBOX MODAL */}
      {isLightboxOpen && currentImage && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 animate-fade-in backdrop-blur-md"
        >
          {/* Lightbox Top Header Bar */}
          <div className="w-full flex items-center justify-between text-creamBg z-10 pt-2 px-2">
            <div>
              <h3 className="font-serif font-bold text-base text-marigold truncate">{product.nameEn}</h3>
              <p className="text-[11px] text-creamBg/70 font-medium">
                Photo {activeImgIndex + 1} of {imagesList.length} • Tap anywhere to close
              </p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Uncropped Full HD Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-4 overflow-hidden"
          >
            <img
              src={currentImage}
              alt={product.nameEn}
              className="max-h-[82vh] max-w-[95vw] object-contain rounded-2xl border border-white/10 shadow-2xl transition-transform duration-300 hover:scale-105"
            />

            {/* Navigation Arrows inside Lightbox */}
            {imagesList.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-2xl backdrop-blur-md"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-2xl backdrop-blur-md"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Thumbnails */}
          {imagesList.length > 1 && (
            <div onClick={(e) => e.stopPropagation()} className="flex gap-2 overflow-x-auto max-w-md pb-2 z-10">
              {imagesList.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImgIndex(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-black/60 ${
                    activeImgIndex === i ? 'border-marigold scale-110 shadow-lg' : 'border-white/20 opacity-50'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-contain p-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
