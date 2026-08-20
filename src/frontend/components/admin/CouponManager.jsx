import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Tag, CheckCircle2, X, Save, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [toastText, setToastText] = useState('');

  const [form, setForm] = useState({
    code: '',
    discount_type: 'flat',
    discount_value: '',
    min_order_value: '',
    max_discount_amount: '',
    is_first_order_only: false,
    is_active: true,
    usage_limit_per_customer: 1,
    valid_from: '',
    valid_until: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (c) => {
    setEditingCoupon(c);
    setForm({
      code: c.code || '',
      discount_type: c.discount_type || 'flat',
      discount_value: c.discount_value || '',
      min_order_value: c.min_order_value || '',
      max_discount_amount: c.max_discount_amount || '',
      is_first_order_only: Boolean(c.is_first_order_only),
      is_active: c.is_active !== false,
      usage_limit_per_customer: c.usage_limit_per_customer || 1,
      valid_from: c.valid_from ? c.valid_from.split('T')[0] : '',
      valid_until: c.valid_until ? c.valid_until.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingCoupon(null);
    setForm({
      code: '',
      discount_type: 'flat',
      discount_value: '',
      min_order_value: '',
      max_discount_amount: '',
      is_first_order_only: false,
      is_active: true,
      usage_limit_per_customer: 1,
      valid_from: '',
      valid_until: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) {
      alert('Please fill in Coupon Code and Discount Value.');
      return;
    }

    try {
      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          code: form.code.trim().toUpperCase()
        })
      });

      if (res.ok) {
        setToastText(editingCoupon ? 'Coupon Updated Successfully!' : 'New Coupon Created Successfully!');
        fetchCoupons();
        handleCancel();
        setTimeout(() => setToastText(''), 4000);
      } else {
        alert('Failed to save coupon.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving coupon.');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const updatedStatus = !coupon.is_active;
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: updatedStatus })
      });
      if (res.ok) {
        setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, is_active: updatedStatus } : c)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCoupons();
        setToastText('Coupon Deleted.');
        setTimeout(() => setToastText(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 my-4 space-y-4 shadow-sm">
      {toastText && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toastText}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-darkBrown flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-marigold" /> Promo Coupons Management ({coupons.length})
          </h2>
          <p className="text-[11px] text-warmMuted font-medium mt-0.5">
            Create first-order discounts, flat amount codes, and percentage coupons.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) handleCancel();
            else {
              setEditingCoupon(null);
              setForm({
                code: '',
                discount_type: 'flat',
                discount_value: '',
                min_order_value: '',
                max_discount_amount: '',
                is_first_order_only: false,
                is_active: true,
                usage_limit_per_customer: 1,
                valid_from: '',
                valid_until: ''
              });
              setShowForm(true);
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-marigold/20 flex-shrink-0"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Close Form' : 'Create New Coupon'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-creamSurface p-4 rounded-2xl border border-divineGold/30 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-divineGold/20 pb-2">
            <h3 className="text-xs font-bold text-darkBrown">
              {editingCoupon ? `✏️ Edit Coupon: ${editingCoupon.code}` : '✨ Create New Promo Coupon'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-[11px] text-warmMuted hover:text-darkBrown flex items-center gap-1">
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-darkBrown mb-1 block">Coupon Code * (e.g. FEST50)</label>
              <input
                type="text"
                required
                placeholder="e.g. NEW120"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full p-2.5 rounded-xl bg-creamCard text-xs font-bold uppercase text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-darkBrown mb-1 block">Discount Type *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold"
              >
                <option value="flat">Flat Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-darkBrown mb-1 block">
                Discount Value * ({form.discount_type === 'flat' ? '₹ Rupees' : '% Percent'})
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder={form.discount_type === 'flat' ? '120' : '20'}
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-darkBrown mb-1 block">Min Order Value (₹ Optional)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={form.min_order_value}
                onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-darkBrown mb-1 block">Max Discount (₹ Optional)</label>
              <input
                type="number"
                placeholder="e.g. 200"
                value={form.max_discount_amount}
                onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold"
              />
            </div>
          </div>

          <div className="p-3 bg-creamCard rounded-xl border border-divineGold/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-darkBrown block">First-Time Customer Only?</span>
              <span className="text-[10px] text-warmMuted block">Only valid for accounts/phones with 0 previous orders</span>
            </div>
            <input
              type="checkbox"
              checked={form.is_first_order_only}
              onChange={(e) => setForm({ ...form, is_first_order_only: e.target.checked })}
              className="w-4 h-4 accent-marigold cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all border border-divineGold/40"
          >
            <Save className="w-4 h-4" /> {editingCoupon ? 'Save Coupon Changes' : 'Publish New Coupon'}
          </button>
        </form>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="text-center py-6 text-xs text-warmMuted font-medium">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-8 bg-creamSurface rounded-2xl border border-divineGold/30 text-xs text-warmMuted space-y-2">
          <p className="font-semibold text-darkBrown">No custom coupons added yet.</p>
          <button
            type="button"
            onClick={() => {
              setEditingCoupon(null);
              setForm({
                code: '',
                discount_type: 'flat',
                discount_value: '',
                min_order_value: '',
                max_discount_amount: '',
                is_first_order_only: false,
                is_active: true,
                usage_limit_per_customer: 1,
                valid_from: '',
                valid_until: ''
              });
              setShowForm(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-marigold text-creamBg font-bold text-xs inline-flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Customized Coupon
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div
              key={c.id || c.code}
              className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                c.is_active ? 'bg-creamSurface border-divineGold/35 hover:border-marigold/50' : 'bg-creamCard/50 border-divineGold/15 opacity-75'
              }`}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-marigold/20 to-divineGold/20 text-marigoldDark font-extrabold text-xs uppercase tracking-wider border border-marigold/30">
                    🏷️ {c.code}
                  </span>
                  <span className="text-xs font-extrabold text-templeRed">
                    {c.discount_type === 'flat' ? `Get Flat ₹${c.discount_value} OFF` : `Get ${c.discount_value}% OFF`}
                  </span>
                  {c.is_first_order_only && (
                    <span className="px-2.5 py-0.5 rounded-full bg-templeRed/10 text-templeRed font-extrabold text-[10px] border border-templeRed/30 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3 text-marigold" /> 1st Order Only
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-warmMuted space-x-3 font-medium">
                  {c.min_order_value > 0 && <span>Min Order: <strong>₹{c.min_order_value}</strong></span>}
                  {c.max_discount_amount > 0 && <span>Max Cap: <strong>₹{c.max_discount_amount}</strong></span>}
                  <span>Limit: <strong>{c.usage_limit_per_customer || 1}x/user</strong></span>
                </div>
              </div>

              {/* ACTION BUTTONS: TOGGLE ACTIVE, EDIT & DELETE */}
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-divineGold/15">
                <button
                  type="button"
                  onClick={() => handleToggleActive(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    c.is_active
                      ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/40 hover:bg-emerald-500/25'
                      : 'bg-warmMuted/15 text-warmMuted border-warmMuted/30 hover:bg-warmMuted/25'
                  }`}
                  title="Toggle coupon active status"
                >
                  {c.is_active ? '🟢 Active' : '⚪ Disabled'}
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEdit(c)}
                  className="px-3 py-1.5 rounded-xl bg-creamCard hover:bg-creamSurface text-darkBrown text-xs font-bold flex items-center gap-1 border border-divineGold/30 transition-colors"
                  title="Edit Customized Coupon"
                >
                  <Edit2 className="w-3.5 h-3.5 text-marigold" /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id || c.code)}
                  className="px-3 py-1.5 rounded-xl bg-templeRed/10 hover:bg-templeRed/20 text-templeRed text-xs font-bold flex items-center gap-1 border border-templeRed/30 transition-colors"
                  title="Delete Coupon Code"
                >
                  <Trash2 className="w-3.5 h-3.5 text-templeRed" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
