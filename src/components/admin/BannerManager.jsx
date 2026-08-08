import React, { useState } from 'react';
import Image from 'next/image';
import { Save, Image as ImageIcon, Upload, CheckCircle2 } from 'lucide-react';
import { compressImage } from '../../lib/imageCompressor';

export default function BannerManager({ banners = [], onSaveBanners }) {
  const safeBanners = Array.isArray(banners) ? banners : [];
  const currentBanner = safeBanners[0] || {};

  const [title, setTitle] = useState(currentBanner.title || '');
  const [subtitle, setSubtitle] = useState(currentBanner.subtitle || '');
  const [imageUrl, setImageUrl] = useState(currentBanner.imageUrl || currentBanner.image_url || '');
  const [badge, setBadge] = useState(currentBanner.badge || '');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const initialLoaded = React.useRef(false);

  React.useEffect(() => {
    if (safeBanners.length > 0 && !initialLoaded.current) {
      setTitle(safeBanners[0].title || '');
      setSubtitle(safeBanners[0].subtitle || '');
      setImageUrl(safeBanners[0].imageUrl || safeBanners[0].image_url || '');
      setBadge(safeBanners[0].badge || '');
      initialLoaded.current = true;
    }
  }, [banners]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressedData = await compressImage(file, 800, 400, 0.78);
      if (!compressedData) {
        setUploading(false);
        return;
      }
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedData })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else {
        setImageUrl(compressedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert('Please fill in Offer Title and upload or paste a Banner Wallpaper Photo.');
      return;
    }

    setSaving(true);
    try {
      const updated = [
        {
          id: banners[0]?.id || 'b_1',
          title,
          subtitle,
          imageUrl,
          badge
        }
      ];
      await onSaveBanners(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to update banner wallpaper.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/10 my-4 space-y-4">
      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Special Offer Wallpaper Saved Successfully! Live on Customer Homepage.
        </div>
      )}

      <div>
        <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-rose-400" /> 1. Top Special Offers Wallpaper Banner
        </h2>
        <p className="text-xs text-slate-400">
          This controls the main promotional banner shown at the <strong>very top</strong> of the customer homepage.
        </p>
      </div>

      {/* Live Preview */}
      {imageUrl && (
        <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-slate-900">
          <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3.5 flex flex-col justify-end">
            {badge && (
              <span className="self-start px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider mb-1">
                {badge}
              </span>
            )}
            <span className="text-sm font-extrabold text-white">{title || 'Special Offer Title'}</span>
            <span className="text-xs text-slate-200">{subtitle || 'Offer details and subtext'}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Offer Title * (e.g., Fresh Morning Pooja Flowers)</label>
          <input
            type="text"
            required
            placeholder="e.g. 20% OFF TODAY on Rose & Sevanthige"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Offer Subtitle (Description)</label>
          <input
            type="text"
            placeholder="e.g. Fresh Rose, Jasmine, Bel Patra & Complete Pooja Kits"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full p-2.5 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Offer Badge Tag (e.g. FESTIVAL DEAL / 20% OFF)</label>
          <input
            type="text"
            placeholder="e.g. POOJA SPECIAL"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="w-full p-2.5 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
          />
        </div>

        {/* Upload Wallpaper Photo */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
          <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Banner Wallpaper Photo *
          </label>
          
          <label className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md">
            <Upload className="w-4 h-4" /> {uploading ? 'Processing Photo...' : 'Upload Wallpaper from Device'}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="text-[11px] text-slate-400 text-center">or paste image URL:</div>

          <input
            type="text"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving & Publishing to Customers...' : 'Save Special Offers Wallpaper'}
        </button>
      </form>
    </div>
  );
}
