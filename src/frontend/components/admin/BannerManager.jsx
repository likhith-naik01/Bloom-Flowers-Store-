import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, Upload, CheckCircle2, X, Save, Sparkles } from 'lucide-react';
import { compressImage } from '../../../backend/imageCompressor';

export default function BannerManager({ banners = [], categories = [], onSaveBanners }) {
  const safeBanners = Array.isArray(banners) ? banners : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastText, setToastText] = useState('');

  // Promo Offer Banner State
  const [promoConfig, setPromoConfig] = useState({
    enabled: true,
    badgeText: 'LIMITED FESTIVAL DEAL',
    couponCode: 'BLOOM10',
    title: 'Get Flat 10% OFF + Free Morning Delivery on Fresh Flowers & Garlands!',
    subtitle: 'Handpicked fresh blooms delivered directly from local flower markets to your doorstep before sunrise.',
    buttonText: 'Claim 10% Offer Now'
  });

  const [promoSaved, setPromoSaved] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);

  useEffect(() => {
    fetch('/api/promo-banner')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.title) {
          setPromoConfig((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((e) => console.log(e));
  }, []);

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setSavingPromo(true);
    try {
      const res = await fetch('/api/promo-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoConfig)
      });
      if (res.ok) {
        setPromoSaved(true);
        setTimeout(() => setPromoSaved(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPromo(false);
    }
  };

  const handleStartEdit = (b) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl || b.image_url || '');
    setBadge(b.badge || b.badgeText || '');
    setTargetCategoryId(b.categoryId || b.category_id || '');
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setBadge('');
    setTargetCategoryId('');
    setShowForm(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressedData = await compressImage(file, 1000, 600, 0.75);
      const rawData = compressedData || (await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target.result);
        reader.readAsDataURL(file);
      }));

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: rawData })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setImageUrl(data.url);
        } else {
          setImageUrl(rawData);
        }
      } catch (err) {
        setImageUrl(rawData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      alert('Please fill in the Offer Title.');
      return;
    }

    const finalImage = imageUrl || 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=1200&q=80';
    const targetUrl = targetCategoryId ? `/category/${targetCategoryId}` : '/shop';

    let updatedList = [];
    if (editingBanner) {
      updatedList = safeBanners.map((b) =>
        b.id === editingBanner.id
          ? {
              ...b,
              title,
              subtitle,
              imageUrl: finalImage,
              image_url: finalImage,
              badge,
              badgeText: badge,
              categoryId: targetCategoryId,
              category_id: targetCategoryId,
              targetUrl
            }
          : b
      );
      setToastText('Banner Updated Successfully!');
    } else {
      const newBanner = {
        id: `b_${Date.now()}`,
        title,
        subtitle,
        imageUrl: finalImage,
        image_url: finalImage,
        badge: badge || 'FESTIVE OFFER',
        badgeText: badge || 'FESTIVE OFFER',
        categoryId: targetCategoryId,
        category_id: targetCategoryId,
        targetUrl
      };
      updatedList = [...safeBanners, newBanner];
      setToastText('New Banner Added Successfully! Customer Carousel Updated.');
    }

    await onSaveBanners(updatedList);
    handleCancel();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const handleDelete = async (bannerId) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      const updatedList = safeBanners.filter((b) => b.id !== bannerId);
      await onSaveBanners(updatedList);
      setToastText('Banner Removed.');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 my-4 space-y-4 shadow-sm">
      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toastText}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-darkBrown flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-marigold" /> Homepage Banner Carousel ({safeBanners.length})
          </h2>
          <p className="text-[11px] text-warmMuted font-medium mt-0.5">
            Add or remove multiple promotional banner slides shown at the top of the homepage.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) handleCancel();
            else {
              setEditingBanner(null);
              setTitle('');
              setSubtitle('');
              setImageUrl('');
              setBadge('UP TO 70% OFF');
              setShowForm(true);
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-marigold/20 flex-shrink-0"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Close Form' : 'Add New Banner'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-creamSurface p-4 rounded-2xl border border-divineGold/30 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-divineGold/20 pb-2">
            <h3 className="text-xs font-bold text-darkBrown">
              {editingBanner ? `✏️ Edit Banner: ${editingBanner.title}` : '✨ Create New Banner Slide'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-[11px] text-warmMuted hover:text-darkBrown flex items-center gap-1">
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown mb-1 block">Offer Title * (e.g., Festival Offer)</label>
            <input
              type="text"
              required
              placeholder="e.g. Festival Offer / Grand Pooja Sale"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown mb-1 block">Offer Subtitle / Description</label>
            <input
              type="text"
              placeholder="e.g. Brighten Every Moment with Fresh Flowers"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown mb-1 block">Scalloped Gold Medallion Text (e.g. UP TO 70% OFF)</label>
            <input
              type="text"
              placeholder="e.g. UP TO 70% OFF"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold"
            />
          </div>

          {/* Target Category Selector */}
          <div>
            <label className="text-[11px] font-bold text-darkBrown mb-1 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-marigold" /> Target Category Section when Customer Clicks Banner
            </label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold font-bold"
            >
              <option value="">🛒 All Categories (General Shop Page)</option>
              {safeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn || c.name || c.title}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-warmMuted font-medium mt-1">
              Selecting a category (e.g. Wedding & Varmala, Anniversary, Loose Flowers) will take the customer directly to that category when they click this banner.
            </p>
          </div>

          {/* Photo Upload */}
          <div className="p-3 rounded-xl bg-creamCard border border-divineGold/30 space-y-2">
            <label className="text-xs font-bold text-marigoldDark flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-marigold" /> Banner Photo / Background *
            </label>

            <label className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-creamBg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md">
              <Upload className="w-4 h-4" /> {uploading ? 'Processing Photo...' : 'Upload Wallpaper from Device'}
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="text-[11px] text-warmMuted text-center">or paste image URL:</div>

            <input
              type="text"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown border border-divineGold/30 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all border border-divineGold/40"
          >
            <Save className="w-4 h-4" /> {editingBanner ? 'Save Changes' : 'Publish Banner to Carousel'}
          </button>
        </form>
      )}

      {/* Active Banners List */}
      <div className="space-y-3">
        {safeBanners.map((b, idx) => {
          const img = b.imageUrl || b.image_url || '';
          return (
            <div key={b.id || idx} className="p-3 rounded-2xl bg-creamSurface border border-divineGold/25 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-darkBrown/80 flex-shrink-0 border border-divineGold/30">
                  {img && <img src={img} alt={b.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-darkBrown truncate">{b.title}</span>
                    <span className="px-2 py-0.2 rounded-full bg-marigold/15 text-marigoldDark font-extrabold text-[9px]">
                      {b.badge || b.badgeText || '70% OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-warmMuted truncate">{b.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(b)}
                  className="p-2 text-warmMuted hover:text-darkBrown transition-colors"
                  title="Edit Banner"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-2 text-warmMuted hover:text-templeRed transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FESTIVE PROMO OFFER BANNER MANAGER (Homepage Bottom Offer)   */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-creamSurface p-4 rounded-2xl border border-divineGold/35 mt-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-divineGold/20 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-templeRed flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-marigold" /> Marketing Festive Offer Banner Manager
            </h3>
            <p className="text-[11px] text-warmMuted font-medium mt-0.5">
              Customize the promotional marketing deal banner displayed below Pooja Essentials on the homepage.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-creamCard px-3 py-1.5 rounded-xl border border-divineGold/30 shadow-xs">
            <span className="text-xs font-bold text-darkBrown">
              {promoConfig.enabled ? '🟢 Enabled' : '🔴 Hidden'}
            </span>
            <input
              type="checkbox"
              checked={promoConfig.enabled}
              onChange={(e) => setPromoConfig({ ...promoConfig, enabled: e.target.checked })}
              className="w-4 h-4 accent-templeRed cursor-pointer"
            />
          </label>
        </div>

        {promoSaved && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 font-bold text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Marketing Promo Offer Banner Updated Live!
          </div>
        )}

        <form onSubmit={handleSavePromo} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-darkBrown mb-1 block">Badge Text (Yellow Tag)</label>
              <input
                type="text"
                required
                value={promoConfig.badgeText}
                onChange={(e) => setPromoConfig({ ...promoConfig, badgeText: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-darkBrown mb-1 block">Coupon Code</label>
              <input
                type="text"
                required
                value={promoConfig.couponCode}
                onChange={(e) => setPromoConfig({ ...promoConfig, couponCode: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold font-bold uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown mb-1 block">Main Offer Headline *</label>
            <input
              type="text"
              required
              value={promoConfig.title}
              onChange={(e) => setPromoConfig({ ...promoConfig, title: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold font-serif font-extrabold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown mb-1 block">Offer Subtitle / Description</label>
            <textarea
              rows={2}
              required
              value={promoConfig.subtitle}
              onChange={(e) => setPromoConfig({ ...promoConfig, subtitle: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown mb-1 block">Call-to-Action Button Text</label>
            <input
              type="text"
              required
              value={promoConfig.buttonText}
              onChange={(e) => setPromoConfig({ ...promoConfig, buttonText: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold font-bold"
            />
          </div>

          {/* LIVE BANNER PREVIEW CARD */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-marigoldDark block mb-1.5">Live Homepage Preview:</span>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-templeRed via-marigoldDark to-templeRedDark text-creamBg p-4 shadow-md border border-divineGold/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-divineGold text-darkBrown font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-templeRed" /> {promoConfig.badgeText}
                  </span>
                  <span className="text-[10px] text-creamBg/90 font-bold">Use Coupon: {promoConfig.couponCode}</span>
                </div>
                <h4 className="font-serif font-extrabold text-sm text-creamBg leading-tight">{promoConfig.title}</h4>
                <p className="text-[11px] text-creamBg/80 line-clamp-2">{promoConfig.subtitle}</p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-creamBg text-templeRed font-extrabold text-[11px] shadow-sm">
                    {promoConfig.buttonText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPromo}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all border border-divineGold/40 active:scale-98"
          >
            <Save className="w-4 h-4" /> {savingPromo ? 'Saving Changes...' : 'Save & Publish Promo Banner'}
          </button>
        </form>
      </div>
    </div>
  );
}
