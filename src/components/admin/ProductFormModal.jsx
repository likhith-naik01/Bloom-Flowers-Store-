import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2, Plus, CheckSquare, Square, Layers, Tag } from 'lucide-react';

export default function ProductFormModal({ product, categories = [], onClose, onSave }) {
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [nameKn, setNameKn] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('bunch');
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [inStock, setInStock] = useState(true);
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
        : (product.categoryId ? [product.categoryId] : [categories[0]?.id]);
      setCategoryIds(cats.filter(Boolean));

      setPrice(product.price || '');
      setUnit(product.unit || 'bunch');
      setDiscountType(product.discountType || 'none');
      setDiscountValue(product.discountValue || 0);
      setInStock(product.inStock !== false);
      setDescription(product.description || '');

      const imgs = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.imageUrl ? [product.imageUrl] : []);
      setImages(imgs);

      setUnitVariants(Array.isArray(product.unitVariants) ? product.unitVariants : []);
    } else {
      if (categories.length > 0) {
        setCategoryIds([categories[0].id]);
      }
    }
  }, [product, categories]);

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
        setUploadStatusText(`Uploading photo ${i + 1} of ${files.length}...`);

        const uploadedUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Data = reader.result;
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Data })
              });
              const data = await res.json();
              if (res.ok && data.url) {
                resolve(data.url);
              } else {
                // Fallback to base64 data if upload endpoint failed
                resolve(base64Data);
              }
            } catch (err) {
              console.error('File upload fetch error:', err);
              // Fallback to base64 data URL
              resolve(base64Data);
            }
          };
          reader.readAsDataURL(file);
        });

        if (uploadedUrl) {
          newUploadedUrls.push(uploadedUrl);
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
    if (!nameEn || !price || categoryIds.length === 0 || images.length === 0) {
      alert('Please fill in English Name, Base Price, select at least 1 Category, and upload at least 1 photo.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        nameEn,
        nameHi,
        nameKn,
        categoryIds,
        price: Number(price),
        unit,
        discountType,
        discountValue: Number(discountValue || 0),
        inStock,
        description,
        images,
        imageUrl: images[0] || '',
        unitVariants
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-extrabold text-white mb-4">
          {product ? 'Edit Flower Product' : 'Add New Flower Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Names */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              English Name * (e.g. Yellow Rose Bouquet)
            </label>
            <input
              type="text"
              required
              placeholder="Product Name in English"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Hindi (English Script)
              </label>
              <input
                type="text"
                placeholder="e.g. Peela Gulabi"
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                className="w-full p-2 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Kannada (English Script)
              </label>
              <input
                type="text"
                placeholder="e.g. Arisina Gulabi"
                value={nameKn}
                onChange={(e) => setNameKn(e.target.value)}
                className="w-full p-2 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
              />
            </div>
          </div>

          {/* Multiple Categories Selection */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
            <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2">
              <Layers className="w-4 h-4" /> Select Multiple Categories / Occasions *
            </label>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Check all categories where this flower should appear (e.g. Anniversary + Pooja + Garlands).
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => {
                const isSelected = categoryIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border text-left ${
                      isSelected
                        ? 'bg-rose-600/30 text-white border-rose-500/60'
                        : 'bg-slate-800/60 text-slate-400 border-white/5 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{c.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real Photo Uploads (Multiple Photos) */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
            <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
              <Upload className="w-4 h-4" /> Upload Real Photos (Multiple) *
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Directly upload photos from your phone or device. Customers can swipe through photos.
            </p>

            <div className="flex gap-2 mb-3">
              <label className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-emerald-600/20">
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
                className="flex-1 p-2 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Add Link
              </button>
            </div>

            {/* Uploaded Images Gallery Thumbnails */}
            {images.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group">
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Unit Options */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Base Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="350"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Default Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 rounded-xl glass-panel text-xs text-white bg-slate-900 border border-white/10 focus:outline-none"
              >
                <option value="bunch">Bunch</option>
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="piece">piece</option>
                <option value="dozen">dozen</option>
              </select>
            </div>
          </div>

          {/* Weight & Quantity Options (Multiple Choice Tiers for Customer) */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Tag className="w-4 h-4" /> Multiple Weight & Quantity Options (Optional)
            </label>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Add weight choices for customers (e.g. 250g @ ₹50, 500g @ ₹95, 1 kg @ ₹180).
            </p>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. 250g or 1 kg"
                value={newVarUnit}
                onChange={(e) => setNewVarUnit(e.target.value)}
                className="flex-1 p-2 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={newVarPrice}
                onChange={(e) => setNewVarPrice(e.target.value)}
                className="w-24 p-2 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {unitVariants.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {unitVariants.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs text-white border border-white/5">
                    <span><strong>{v.unit}</strong> — ₹{v.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock & Discount Toggles */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Stock Status</label>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  inStock
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-red-950/80 text-red-300 border border-red-500/50'
                }`}
              >
                {inStock ? '✅ In Stock' : '⚠️ Sold Out'}
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Offer Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-panel text-xs text-white bg-slate-900 border border-white/10 focus:outline-none"
              >
                <option value="none">No Offer</option>
                <option value="percent">Percentage (% Off)</option>
                <option value="flat">Flat Amount (₹ Off)</option>
              </select>
            </div>
          </div>

          {discountType !== 'none' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Discount Value</label>
              <input
                type="number"
                placeholder="10"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full p-2 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of the flower item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all mt-4 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving & Publishing to Customers...' : 'Save Product Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
