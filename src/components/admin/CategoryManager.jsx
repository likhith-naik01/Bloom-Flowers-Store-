import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit2, Layers, Upload, CheckCircle2, X } from 'lucide-react';
import { compressImage } from '../../lib/imageCompressor';

export default function CategoryManager({ categories = [], onAddCategory, onEditCategory, onDeleteCategory }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [nameKn, setNameKn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [toastText, setToastText] = useState('');

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setNameEn(cat.nameEn || cat.name || '');
    setNameHi(cat.nameHi || '');
    setNameKn(cat.nameKn || '');
    setImageUrl(cat.image || cat.imageUrl || '');
    setDescription(cat.description || '');
    setShowAdd(true);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setNameEn('');
    setNameHi('');
    setNameKn('');
    setImageUrl('');
    setDescription('');
    setShowAdd(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressedData = await compressImage(file, 500, 500, 0.75);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameEn || !imageUrl) {
      alert('Please enter English Category Name and upload/provide an image.');
      return;
    }

    const payload = {
      nameEn,
      name: nameEn,
      nameHi,
      nameKn,
      image: imageUrl,
      imageUrl: imageUrl,
      description
    };

    if (editingCategory) {
      if (onEditCategory) {
        await onEditCategory(editingCategory.id, payload);
      }
      setToastText('Category Updated Successfully!');
    } else {
      await onAddCategory(payload);
      setToastText('Category Created Successfully! It is now live for customers.');
    }

    handleCancel();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 4000);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/10 my-4 space-y-3">
      {savedMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastText}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-rose-400" /> Categories & Occasions ({categories.length})
        </h2>
        <button
          onClick={() => {
            if (showAdd) {
              handleCancel();
            } else {
              setEditingCategory(null);
              setNameEn('');
              setNameHi('');
              setNameKn('');
              setImageUrl('');
              setDescription('');
              setShowAdd(true);
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? 'Close Form' : 'Add Category'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold text-slate-200">
              {editingCategory ? `✏️ Edit Category: ${editingCategory.nameEn || editingCategory.name}` : '✨ New Category Details'}
            </h3>
            {editingCategory && (
              <button type="button" onClick={handleCancel} className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1">
                <X className="w-3 h-3" /> Cancel Edit
              </button>
            )}
          </div>
          
          <div>
            <label className="text-[11px] font-bold text-slate-300 mb-1 block">English Name * (e.g. Bouquets Section)</label>
            <input
              type="text"
              required
              placeholder="e.g. Wedding & Varmala"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Hindi (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Shadi Mala"
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                className="w-full p-2 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Kannada (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Maduve Haara"
                value={nameKn}
                onChange={(e) => setNameKn(e.target.value)}
                className="w-full p-2 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
              />
            </div>
          </div>

          {/* Photo Upload & Preview */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-white/10 space-y-2">
            <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> Category Photo *
            </label>
            
            <label className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md">
              <Upload className="w-4 h-4" /> {uploading ? 'Processing Photo...' : 'Upload Photo from Device'}
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

            {imageUrl && (
              <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/10 mt-2">
                <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <textarea
            rows={2}
            placeholder="Brief Category Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none"
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              {editingCategory ? 'Update Category Details' : 'Save Category & Publish to Customers'}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-white/10"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-2">
        {categories.map((c) => {
          const catImg = c.image || c.imageUrl || '';
          return (
            <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-slate-800">
                  {catImg ? (
                    <img src={catImg} alt={c.nameEn || c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">🌸</div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{c.nameEn || c.name}</h4>
                  {(c.nameHi || c.nameKn) && (
                    <span className="text-[10px] text-rose-300 font-medium block">
                      {[c.nameHi, c.nameKn].filter(Boolean).join(' • ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(c)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteCategory(c.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
