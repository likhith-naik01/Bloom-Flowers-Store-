import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2, Plus, CheckSquare, Square, Layers, Tag, Sparkles } from 'lucide-react';
import { compressImage } from '../../../backend/imageCompressor';

export default function ProductFormModal({ product, existingProducts = [], autoSlNo, categories = [], onClose, onSave }) {
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [nameKn, setNameKn] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('bunch');
  const [slNo, setSlNo] = useState('');
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [inStock, setInStock] = useState(true);
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [seasonalTag, setSeasonalTag] = useState('');
  const [description, setDescription] = useState('');
  
  // Images (array of base64 or URL strings)
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Unit Variants / Weight Options (e.g. 250g, 500g, 1kg)
  const [unitVariants, setUnitVariants] = useState([]);
  const [newVarUnit, setNewVarUnit] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');

  useEffect(() => {
    if (product) {
      setNameEn(product.nameEn || '');
      setNameHi(product.nameHi || '');
      setNameKn(product.nameKn || '');
      
      const cats = Array.isArray(product.categoryIds) && product.categoryIds.length > 0
        ? product.categoryIds
        : (product.categoryId ? [product.categoryId] : (categories[0]?.id ? [categories[0].id] : []));
      setCategoryIds(cats.filter(Boolean));

      setPrice(product.price || '');
      const existingUnit = product.unit || (Array.isArray(product.unitVariants) && product.unitVariants[0]?.unit) || 'piece';
      setUnit(existingUnit);
      setSlNo(product.slNo || '');
      setDiscountType(product.discountType || 'none');
      setDiscountValue(product.discountValue || 0);
      setInStock(product.inStock !== false);
      setIsSeasonal(Boolean(product.isSeasonal || product.is_seasonal));
      setSeasonalTag(product.seasonalTag || product.seasonal_tag || '');
      setDescription(product.description || '');

      const imgs = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.imageUrl ? [product.imageUrl] : []);
      setImages(imgs);

      setUnitVariants(Array.isArray(product.unitVariants) ? product.unitVariants : []);
    } else {
      setNameEn('');
      setNameHi('');
      setNameKn('');
      setCategoryIds((prev) => {
        if (prev && prev.length > 0) return prev;
        return categories[0]?.id ? [categories[0].id] : [];
      });
      setPrice('');
      setUnit('piece');
      setSlNo(autoSlNo || '');
      setDiscountType('none');
      setDiscountValue(0);
      setInStock(true);
      setDescription('');
      setImages([]);
      setUnitVariants([]);
    }
  }, [product, autoSlNo]);

  // Toggle Category Checkbox
  const toggleCategory = (catId) => {
    setCategoryIds((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  };

  const [saving, setSaving] = useState(false);

  const [uploadStatusText, setUploadStatusText] = useState('');

  // Direct File Upload Handler (Supports Multi-Photo Selection)
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const newUploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusText(`Compressing & Uploading photo ${i + 1} of ${files.length}...`);

        try {
          const compressedData = await compressImage(file, 600, 600, 0.78);
          if (!compressedData) continue;

          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: compressedData })
          });
          const data = await res.json();
          if (res.ok && data.url) {
            newUploadedUrls.push(data.url);
          } else {
            newUploadedUrls.push(compressedData);
          }
        } catch (err) {
          console.error('File upload fetch error:', err);
        }
      }

      if (newUploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...newUploadedUrls]);
      }
    } catch (err) {
      console.error('Upload handler error:', err);
    } finally {
      setUploading(false);
      setUploadStatusText('');
      e.target.value = ''; // Reset file input so user can pick again
    }
  };

  const handleAddUrl = () => {
    if (!urlInput) return;
    setImages((prev) => [...prev, urlInput]);
    setUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Weight/Unit Option
  const handleAddVariant = () => {
    if (!newVarUnit || !newVarPrice) return;
    setUnitVariants((prev) => [...prev, { unit: newVarUnit, price: Number(newVarPrice) }]);
    setNewVarUnit('');
    setNewVarPrice('');
  };

  const handleRemoveVariant = (index) => {
    setUnitVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalImages = [...images];
    if (urlInput && urlInput.trim() && !finalImages.includes(urlInput.trim())) {
      finalImages.push(urlInput.trim());
    }
    if (finalImages.length === 0) {
      finalImages = ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'];
    }

    if (!nameEn || !price || categoryIds.length === 0) {
      alert('Please fill in Product English Name, Base Price, and select at least 1 Category.');
      return;
    }

    let targetSlNo = slNo ? Number(slNo) : (autoSlNo || 1);
    while (existingProducts.some((p) => p.id !== product?.id && Number(p.slNo) === targetSlNo)) {
      targetSlNo += 1;
    }

    setSaving(true);
    try {
      const finalUnit = unit || 'piece';
      let finalVariants = Array.isArray(unitVariants) && unitVariants.length > 0
        ? unitVariants
        : [{ unit: finalUnit, price: Number(price) }];

      await onSave({
        ...product,
        nameEn,
        nameHi,
        nameKn,
        categoryIds,
        price: Number(price),
        unit: finalUnit,
        slNo: targetSlNo,
        discountType,
        discountValue: Number(discountValue || 0),
        inStock,
        isSeasonal,
        seasonalTag,
        description,
        images: finalImages,
        imageUrl: finalImages[0] || '',
        unitVariants: finalVariants
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-creamCard border border-divineGold/40 rounded-3xl overflow-hidden shadow-2xl p-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-creamSurface text-warmMuted hover:text-darkBrown flex items-center justify-center transition-colors border border-divineGold/30"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-serif font-extrabold text-templeRed mb-4">
          {product ? 'Edit Flower Product' : 'Add New Flower Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section & Product Type Selection */}
          <div className="p-3.5 rounded-2xl bg-creamSurface border border-divineGold/35 space-y-2">
            <label className="text-xs font-bold text-marigoldDark flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-marigold" /> Product Listing Section / Offer Type *
            </label>
            <p className="text-[11px] text-warmMuted font-medium">
              Choose whether this is a regular catalog product or a special offer item.
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDiscountType('none');
                  setDiscountValue(0);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-0.5 ${
                  discountType === 'none'
                    ? 'bg-marigold text-creamBg border-divineGold shadow-sm'
                    : 'bg-creamCard text-darkBrown border-divineGold/20 hover:bg-marigold/10'
                }`}
              >
                <span className="flex items-center gap-1">📦 Regular Product</span>
                <span className="text-[10px] opacity-80 font-normal">Standard catalog item</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (discountType === 'none') setDiscountType('percent');
                }}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-0.5 ${
                  discountType !== 'none'
                    ? 'bg-templeRed text-creamBg border-divineGold shadow-sm'
                    : 'bg-creamCard text-darkBrown border-divineGold/20 hover:bg-marigold/10'
                }`}
              >
                <span className="flex items-center gap-1">🏷️ Special Discount</span>
                <span className="text-[10px] opacity-80 font-normal">Featured in Special Offers</span>
              </button>
            </div>
          </div>

          {/* Names */}
          <div>
            <label className="text-xs font-bold text-darkBrown mb-1 block">
              English Name * (e.g. Yellow Rose Bouquet)
            </label>
            <input
              type="text"
              required
              placeholder="Product Name in English"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-creamSurface text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none focus:border-marigold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">
                Hindi (English Script)
              </label>
              <input
                type="text"
                placeholder="e.g. Peela Gulabi"
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">
                Kannada (English Script)
              </label>
              <input
                type="text"
                placeholder="e.g. Arisina Gulabi"
                value={nameKn}
                onChange={(e) => setNameKn(e.target.value)}
                className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
              />
            </div>
          </div>

          {/* Multiple Categories Selection */}
          <div className="p-3 rounded-2xl bg-creamSurface border border-divineGold/35">
            <label className="text-xs font-bold text-marigoldDark flex items-center gap-1.5 mb-2">
              <Layers className="w-4 h-4 text-marigold" /> Select Multiple Categories / Occasions *
            </label>
            <p className="text-[11px] text-warmMuted font-medium mb-2.5">
              Check all categories where this flower should appear (e.g. Anniversary + Pooja + Garlands).
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {categories.map((c) => {
                const isSelected = categoryIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border text-left ${
                      isSelected
                        ? 'bg-marigold/20 text-marigoldDark border-marigold/50'
                        : 'bg-creamCard text-darkBrown border-divineGold/20 hover:bg-marigold/10'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-marigold flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-warmMuted flex-shrink-0" />
                    )}
                    <span className="truncate">{c.nameEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Visibility Summary */}
            {categoryIds.length > 0 && (
              <div className="pt-2 border-t border-divineGold/20 text-[11px] text-darkBrown flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-warmMuted">Appears in:</span>
                <span className="px-2 py-0.5 rounded-full bg-creamCard text-darkBrown text-[10px] font-bold border border-divineGold/30">
                  {discountType === 'none' ? '📦 Regular Catalog' : '🏷️ Special Discounts'}
                </span>
                {categories
                  .filter((c) => categoryIds.includes(c.id))
                  .map((c) => (
                    <span key={c.id} className="px-2 py-0.5 rounded-full bg-marigold/15 text-marigoldDark border border-marigold/30 text-[10px] font-bold">
                      {c.nameEn}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Real Photo Uploads (Multiple Photos) */}
          <div className="p-3 rounded-2xl bg-creamSurface border border-divineGold/35">
            <label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-1.5">
              <Upload className="w-4 h-4 text-emerald-600" /> Upload Real Photos (Multiple) *
            </label>
            <p className="text-[11px] text-warmMuted font-medium mb-2">
              Directly upload photos from your phone or device. Customers can swipe through photos.
            </p>

            <div className="flex gap-2 mb-3">
              <label className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-creamBg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md">
                <Upload className="w-4 h-4" /> {uploading ? 'Processing File...' : 'Choose Photos from Device'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Optional URL Add */}
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                placeholder="Or paste photo URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 p-2 rounded-xl bg-creamCard text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3 py-2 rounded-xl bg-creamCard text-darkBrown text-xs font-bold hover:bg-marigold/10 border border-divineGold/30"
              >
                Add Link
              </button>
            </div>

            {/* Uploaded Images Gallery Thumbnails */}
            {images.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-divineGold/30 group bg-creamCard">
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-creamCard/90 text-templeRed hover:text-templeRedDark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Unit Options */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">SL No (Code)</label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={slNo}
                onChange={(e) => setSlNo(e.target.value)}
                className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">Base Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="350"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">Unit *</label>
              <select
                value={unit}
                onChange={(e) => {
                  const selected = e.target.value;
                  setUnit(selected);
                  setUnitVariants((prev) => {
                    if (!prev || prev.length <= 1) {
                      return [{ unit: selected, price: Number(price || 0) }];
                    }
                    return prev.map((v, i) => (i === 0 ? { ...v, unit: selected } : v));
                  });
                }}
                className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown border border-divineGold/30 focus:outline-none"
              >
                <option value="piece">Piece</option>
                <option value="bunch">Bunch</option>
                <option value="garland">Garland / Mala</option>
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="dozen">dozen</option>
                <option value="pack">Pack / Box</option>
                <option value="meter">Meter / Ft</option>
              </select>
            </div>
          </div>

          {/* Weight & Quantity Options (Multiple Choice Tiers for Customer) */}
          <div className="p-3 rounded-2xl bg-creamSurface border border-divineGold/35">
            <label className="text-xs font-bold text-marigoldDark flex items-center gap-1.5 mb-1">
              <Tag className="w-4 h-4 text-marigold" /> Multiple Weight & Quantity Options (Optional)
            </label>
            <p className="text-[11px] text-warmMuted font-medium mb-2.5">
              Add weight choices for customers (e.g. 250g @ ₹50, 500g @ ₹95, 1 kg @ ₹180).
            </p>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. 250g or 1 kg"
                value={newVarUnit}
                onChange={(e) => setNewVarUnit(e.target.value)}
                className="flex-1 p-2 rounded-xl bg-creamCard text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={newVarPrice}
                onChange={(e) => setNewVarPrice(e.target.value)}
                className="w-24 p-2 rounded-xl bg-creamCard text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-2 rounded-xl bg-marigold hover:bg-marigoldDark text-creamBg font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {unitVariants.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {unitVariants.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/25">
                    <span><strong>{v.unit}</strong> — ₹{v.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-warmMuted hover:text-templeRed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seasonal Pick & Ranking Customization */}
          <div className="p-3 rounded-2xl bg-marigold/10 border border-marigold/30 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-marigoldDark flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-marigold" /> Seasonal Pick / Event Highlight
                </label>
                <p className="text-[10px] text-darkBrown font-medium">Feature this product at the top during festivals or special seasons.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSeasonal(!isSeasonal)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSeasonal
                    ? 'bg-marigold text-creamBg border-divineGold font-extrabold shadow-sm'
                    : 'bg-creamCard text-warmMuted border-divineGold/30'
                }`}
              >
                {isSeasonal ? '✨ Seasonal (ON)' : 'OFF'}
              </button>
            </div>

            {isSeasonal && (
              <div className="pt-1">
                <label className="text-[11px] font-bold text-darkBrown mb-1 block">
                  Seasonal Tag Label (e.g. "Diwali Special", "Wedding Season", "Pooja Pick")
                </label>
                <input
                  type="text"
                  placeholder="e.g. Festive Special"
                  value={seasonalTag}
                  onChange={(e) => setSeasonalTag(e.target.value)}
                  className="w-full p-2 rounded-xl bg-creamCard text-xs text-darkBrown placeholder-warmMuted border border-marigold/40 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Stock & Discount Toggles */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">Stock Status</label>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border ${
                  inStock
                    ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/40'
                    : 'bg-templeRed/10 text-templeRed border-templeRed/40'
                }`}
              >
                {inStock ? '✅ In Stock' : '⚠️ Sold Out'}
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">Offer Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-creamSurface text-xs text-darkBrown border border-divineGold/30 focus:outline-none"
              >
                <option value="none">No Offer</option>
                <option value="percent">Percentage (% Off)</option>
                <option value="flat">Flat Amount (₹ Off)</option>
              </select>
            </div>
          </div>

          {discountType !== 'none' && (
            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">Discount Value</label>
              <input
                type="number"
                placeholder="10"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown border border-divineGold/30 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-darkBrown mb-1 block">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of the flower item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-marigold/30 transition-all mt-4 disabled:opacity-50 border border-divineGold/40"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving & Publishing to Customers...' : 'Save Product Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
