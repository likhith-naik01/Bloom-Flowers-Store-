import React, { useState, useEffect } from 'react';
import { Plus, Minus, Heart, Star, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductModal from './ProductModal';

export default function ProductCard({ product }) {
  const { addToCart, updateQuantity, getItemQuantity, getItemEffectivePrice } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const currentQty = getItemQuantity(product?.id);

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
  const hasDiscount = effectivePrice < selectedVariant.price || (product.discountType && product.discountType !== 'none' && Number(product.discountValue) > 0);

  const originalPrice = hasDiscount && product.discountType === 'percent'
    ? Math.round(effectivePrice / (1 - Number(product.discountValue) / 100))
    : (hasDiscount && product.discountType === 'flat' ? effectivePrice + Number(product.discountValue) : selectedVariant.price);

  const isSeasonal = Boolean(product.isSeasonal || product.is_seasonal);
  const isBestseller = Boolean(product.isBestseller);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart({
      ...product,
      unit: selectedVariant.unit || product.unit || 'piece',
      selectedUnit: selectedVariant.unit || product.unit || 'piece',
      price: selectedVariant.price
    }, 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, -1);
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group relative rounded-2xl bg-creamCard border border-divineGold/35 hover:border-marigold transition-all p-3 flex flex-col justify-between cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
      >
        {/* Product Image Container */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2.5 bg-creamSurface">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.nameEn || product.name || 'Product'}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                !product.inStock ? 'grayscale opacity-60' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-warmMuted text-2xl">🌸</div>
          )}

          {/* Wishlist Heart Icon (Top-Right) */}
          <button
            onClick={toggleWishlist}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-creamCard/90 backdrop-blur-xs text-warmMuted flex items-center justify-center hover:text-templeRed transition-colors shadow-sm border border-divineGold/30"
            title="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-templeRed text-templeRed' : 'text-warmMuted'}`} />
          </button>

          {/* Bottom-Left Badge */}
          <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1 items-start max-w-[80%]">
            {isBestseller ? (
              <span className="px-2 py-0.5 rounded-md bg-marigold text-creamBg font-extrabold text-[9px] shadow-sm flex items-center gap-0.5 border border-divineGold/40">
                <Star className="w-2.5 h-2.5 fill-creamBg text-creamBg" /> Best Seller
              </span>
            ) : isSeasonal ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-creamBg font-extrabold text-[9px] shadow-sm flex items-center gap-0.5 border border-divineGold/40">
                <Sparkles className="w-2.5 h-2.5 text-divineGold" /> {product.seasonalTag || 'Pooja Special'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-creamBg font-extrabold text-[9px] shadow-sm">
                Pooja Special
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-darkBrown line-clamp-1 group-hover:text-templeRed transition-colors">
              {product.nameEn || product.name}
            </h3>

            <p className="text-[11px] text-warmMuted font-medium line-clamp-1 mt-0.5">
              {product.description || ([product.nameHi, product.nameKn].filter(Boolean).join(' • ') || 'Fresh Flowers & Pooja Items')}
            </p>
          </div>

          {/* Price & Cart Control Row */}
          <div className="mt-3 flex items-center justify-between gap-1 pt-1.5 border-t border-divineGold/20">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-templeRed">
                  ₹{effectivePrice}
                </span>
                {hasDiscount && originalPrice > effectivePrice && (
                  <span className="text-xs text-warmMuted line-through font-medium">
                    ₹{originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Stepper vs Add Button (Universal Shared Cart State) */}
            {!product.inStock ? (
              <span className="px-2.5 py-1 rounded-full bg-creamSurface text-warmMuted font-bold text-[10px] border border-divineGold/20 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Sold Out
              </span>
            ) : currentQty > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-marigold text-creamBg font-extrabold text-xs shadow-sm border border-divineGold/40"
              >
                <button
                  onClick={handleDecrement}
                  className="w-5 h-5 rounded-full bg-darkBrown/20 hover:bg-darkBrown/40 flex items-center justify-center transition-colors"
                  title="Reduce quantity"
                >
                  <Minus className="w-3 h-3 text-creamBg" />
                </button>
                <span className="px-1 text-xs font-extrabold min-w-[14px] text-center">
                  {currentQty}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-5 h-5 rounded-full bg-darkBrown/20 hover:bg-darkBrown/40 flex items-center justify-center transition-colors"
                  title="Increase quantity"
                >
                  <Plus className="w-3 h-3 text-creamBg" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="px-3.5 py-1.5 rounded-full bg-marigold hover:bg-marigoldDark text-creamBg font-extrabold text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95 border border-divineGold/40"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ProductModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
