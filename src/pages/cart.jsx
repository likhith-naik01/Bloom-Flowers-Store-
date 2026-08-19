import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import CelebrationModal from '../frontend/components/customer/CelebrationModal';
import { useCart } from '../frontend/context/CartContext';
import { useAuth } from '../frontend/context/AuthContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MessageSquare,
  ShoppingBag,
  Tag,
  X,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Gift,
  Check
} from 'lucide-react';

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    orderNote,
    setOrderNote,
    cartTotal,
    getItemEffectivePrice,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    discountedTotal
  } = useCart();

  const { user } = useAuth();
  const [couponsList, setCouponsList] = useState([]);
  const [showCouponsDrawer, setShowCouponsDrawer] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCode, setApplyingCode] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState({ code: '', saved: 0 });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCouponsList(data.filter((c) => c.is_active));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculatePotentialSavings = (coupon) => {
    if (!coupon || !cartTotal) return 0;
    const numVal = Number(coupon.discount_value || 0);
    let amount = 0;
    if (coupon.discount_type === 'flat') {
      amount = Math.min(numVal, cartTotal);
    } else if (coupon.discount_type === 'percentage') {
      amount = (cartTotal * numVal) / 100;
      if (coupon.max_discount_amount && amount > Number(coupon.max_discount_amount)) {
        amount = Number(coupon.max_discount_amount);
      }
      amount = Math.min(amount, cartTotal);
    }
    return Math.round(amount);
  };

  const handleApplyCouponCode = async (codeToApply) => {
    if (!codeToApply) return;
    setCouponError('');
    setApplyingCode(codeToApply);

    const customerPhone = user?.phone || user?.user_metadata?.phone || '';
    const userId = user?.id || '';

    const res = await applyCoupon({
      code: codeToApply,
      customerPhone,
      userId
    });

    setApplyingCode('');
    if (res.success) {
      setShowCouponsDrawer(false);
      setCelebrationDetails({
        code: res.coupon.code,
        saved: res.coupon.discountAmount
      });
      setShowCelebration(true);
      setCouponInput('');
    } else {
      setCouponError(res.error || 'Failed to apply coupon.');
    }
  };

  return (
    <>
      <Head>
        <title>Shopping Cart | Bloom</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-3 flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-serif font-extrabold text-templeRed mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-marigold" /> Your Cart ({cart.length})
            </h1>

            {cart.length === 0 ? (
              <div className="text-center py-16 bg-creamCard rounded-2xl border border-divineGold/30 my-4 shadow-sm">
                <p className="text-sm text-warmMuted mb-4 font-medium">Your cart is empty.</p>
                <Link
                  href="/shop"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs shadow-md shadow-marigold/20"
                >
                  Browse Festive Flowers & Pooja Items
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const effectivePrice = getItemEffectivePrice(item);
                  const itemTotal = effectivePrice * item.quantity;
                  const cartImg = item.imageUrl || (Array.isArray(item.images) && item.images[0]) || item.image || '';

                  return (
                    <div
                      key={item.id}
                      className="bg-creamCard p-3 rounded-2xl border border-divineGold/35 flex items-center gap-3 shadow-sm"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-creamSurface border border-divineGold/30">
                        {cartImg ? (
                          <img src={cartImg} alt={item.nameEn || item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-warmMuted text-lg">🌸</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-darkBrown truncate">{item.nameEn}</h3>
                        <p className="text-[11px] text-marigoldDark font-bold">
                          ₹{effectivePrice} / {item.unit}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-creamSurface rounded-xl p-0.5 border border-divineGold/30">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-creamCard text-darkBrown font-bold flex items-center justify-center hover:bg-marigold/20"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-extrabold text-xs text-darkBrown">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-creamCard text-darkBrown font-bold flex items-center justify-center hover:bg-marigold/20"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-extrabold text-sm text-templeRed">₹{itemTotal}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-warmMuted hover:text-templeRed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* Special Instructions Note Box */}
                <div className="mt-4 p-3.5 bg-creamCard rounded-2xl border border-divineGold/35 shadow-sm">
                  <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-4 h-4 text-marigold" /> Special Instructions / Substitution Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., If fresh yellow marigolds are unavailable, orange marigolds are fine. Ensure fresh morning blooms."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-creamSurface text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none focus:border-marigold"
                  />
                </div>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-6 pt-3 border-t border-divineGold/30 space-y-3">
              {/* INTERACTIVE COUPON SELECTION BOX */}
              <div className="p-3.5 bg-creamCard rounded-2xl border border-divineGold/35 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-marigold" /> Coupons & Offers
                  </label>
                  <button
                    onClick={() => setShowCouponsDrawer(true)}
                    className="text-[11px] font-bold text-templeRed hover:underline flex items-center gap-0.5"
                  >
                    View All Coupons <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {!appliedCoupon ? (
                  <div className="space-y-2">
                    {/* Quick Select Coupon Cards List */}
                    {couponsList.length > 0 && (
                      <div className="space-y-2">
                        {couponsList.slice(0, 2).map((c) => {
                          const potentialSave = calculatePotentialSavings(c);
                          const isApplying = applyingCode === c.code;

                          return (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-xl bg-creamSurface border border-divineGold/30 flex items-center justify-between gap-2 transition-all hover:border-marigold"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-md bg-marigold/20 text-marigoldDark font-extrabold text-[10px] uppercase border border-marigold/30">
                                    {c.code}
                                  </span>
                                  {c.is_first_order_only && (
                                    <span className="text-[9px] font-bold text-templeRed flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5 text-marigold" /> 1st Order
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-extrabold text-emerald-800 mt-1">
                                  Save ₹{potentialSave}{' '}
                                  <span className="text-[10px] font-normal text-warmMuted">
                                    ({c.discount_type === 'flat' ? `₹${c.discount_value} Flat` : `${c.discount_value}% OFF`})
                                  </span>
                                </p>
                              </div>

                              <button
                                onClick={() => handleApplyCouponCode(c.code)}
                                disabled={Boolean(applyingCode)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs shadow-sm active:scale-95 transition-all disabled:opacity-50"
                              >
                                {isApplying ? 'Applying...' : 'Apply'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Manual Coupon Input Trigger */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (couponInput.trim()) handleApplyCouponCode(couponInput.trim());
                      }}
                      className="flex gap-2 pt-1"
                    >
                      <input
                        type="text"
                        placeholder="Or enter custom code (e.g. FEST20)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-creamSurface text-xs text-darkBrown font-bold uppercase placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold"
                      />
                      <button
                        type="submit"
                        disabled={Boolean(applyingCode) || !couponInput.trim()}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs shadow-md disabled:opacity-50"
                      >
                        {applyingCode === couponInput.trim() ? 'Applying...' : 'Apply'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span>Coupon <strong>{appliedCoupon.code}</strong> Applied</span>
                        <span className="block text-[10px] text-emerald-700 font-semibold">
                          🎉 You save ₹{discountAmount} on this order!
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        removeCoupon();
                        setCouponError('');
                      }}
                      className="text-xs text-templeRed font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-xs text-templeRed font-semibold mt-1 animate-fade-in">
                    ⚠️ {couponError}
                  </p>
                )}
              </div>

              {/* ORDER PRICE BREAKDOWN */}
              <div className="bg-creamCard p-3 rounded-2xl border border-divineGold/35 space-y-1.5 shadow-sm text-xs">
                <div className="flex items-center justify-between text-darkBrown">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{cartTotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm font-serif font-extrabold pt-2 border-t border-divineGold/20">
                  <span className="text-darkBrown">Total Amount</span>
                  <span className="text-xl text-templeRed">₹{discountedTotal}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-creamCard border border-divineGold/30 text-[11px] text-warmSlate flex items-center justify-between">
                <span>🚚 Delivery Charge:</span>
                <span className="text-marigoldDark font-bold bg-marigold/10 px-2 py-0.5 rounded border border-marigold/30">
                  FREE ONLY FOR BULK ORDERS
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-marigold/30 active:scale-98 transition-all border border-divineGold/40"
              >
                Proceed to Checkout (₹{discountedTotal}) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </main>

        <BottomNav />
      </div>

      {/* ALL AVAILABLE COUPONS SELECTION DRAWER */}
      {showCouponsDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            onClick={() => setShowCouponsDrawer(false)}
            className="fixed inset-0 bg-darkBrown/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          <div className="relative w-full max-w-md bg-creamBg rounded-t-3xl border-t-2 border-divineGold p-4 space-y-4 shadow-2xl z-10 animate-slide-up max-h-[80vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-divineGold/30 pb-2.5">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-marigold" />
                <h2 className="font-serif font-extrabold text-base text-templeRed">Available Coupons & Offers</h2>
              </div>
              <button
                onClick={() => setShowCouponsDrawer(false)}
                className="p-1 rounded-full bg-creamCard text-warmMuted hover:text-darkBrown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {couponsList.map((c) => {
                const potentialSave = calculatePotentialSavings(c);
                const isSelected = appliedCoupon?.code === c.code;

                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-md'
                        : 'bg-creamCard border-divineGold/35 hover:border-marigold'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-marigold/20 text-marigoldDark font-extrabold text-xs uppercase border border-marigold/30">
                          {c.code}
                        </span>
                        {c.is_first_order_only && (
                          <span className="px-2 py-0.2 rounded-full bg-templeRed/10 text-templeRed font-extrabold text-[9px] border border-templeRed/30 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-marigold" /> 1st Order Only
                          </span>
                        )}
                      </div>

                      {isSelected ? (
                        <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyCouponCode(c.code)}
                          disabled={Boolean(applyingCode)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
                        >
                          {applyingCode === c.code ? 'Applying...' : 'Apply Coupon'}
                        </button>
                      )}
                    </div>

                    <p className="text-sm font-extrabold text-emerald-800">
                      Save ₹{potentialSave} on this order!
                    </p>

                    <div className="text-[11px] text-warmMuted mt-1 space-x-2">
                      <span>• {c.discount_type === 'flat' ? `Flat ₹${c.discount_value} OFF` : `${c.discount_value}% OFF discount`}</span>
                      {c.min_order_value > 0 && <span>• Min Order: ₹{c.min_order_value}</span>}
                      {c.max_discount_amount > 0 && <span>• Max Cap: ₹{c.max_discount_amount}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-divineGold/20">
              <button
                onClick={() => setShowCouponsDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-creamCard text-darkBrown font-bold text-xs border border-divineGold/30"
              >
                Close Coupons Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFETTI CELEBRATION MODAL */}
      {showCelebration && (
        <CelebrationModal
          couponCode={celebrationDetails.code}
          savedAmount={celebrationDetails.saved}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </>
  );
}
