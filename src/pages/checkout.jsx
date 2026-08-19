import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import { useCart } from '../frontend/context/CartContext';
import { useAuth } from '../frontend/context/AuthContext';
import { createClient } from '../backend/supabase/client';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Banknote,
  CreditCard,
  Tag,
  Sparkles,
  ChevronDown,
  X,
  MessageSquare,
  ShieldCheck,
  Check,
  RotateCcw,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

const PAYMENT_OPTIONS = [
  {
    id: 'online',
    name: 'Pay Online (Razorpay)',
    badge: 'Full Payment Now',
    description: 'Pay 100% now via Cards, UPI, NetBanking, Google Pay, PhonePe.',
    icon: CreditCard,
    accentColor: 'marigold'
  },
  {
    id: 'half_advance',
    name: 'Pay Half Advance',
    badge: '50% Now + 50% Delivery',
    description: 'Pay 50% advance now via Razorpay & balance 50% at delivery.',
    icon: Sparkles,
    accentColor: 'emerald'
  },
  {
    id: 'pay_later',
    name: 'Pay After Confirmation',
    badge: 'No Payment Now',
    description: 'Place order now. Admin will send a Razorpay payment link on WhatsApp after reviewing.',
    icon: MessageSquare,
    accentColor: 'purple'
  }
];

export default function Checkout() {
  const router = useRouter();
  const { cart, orderNote, cartTotal, clearCart, getItemEffectivePrice, appliedCoupon, discountAmount, discountedTotal } = useCart();
  const { user, profile, loading: authLoading } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryDate: todayStr,
    deliveryTimeSlot: 'Morning (9 AM - 12 PM)'
  });

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill form from user profile
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/checkout');
      return;
    }
    if (!authLoading && user && (!profile || !profile.full_name)) {
      router.push('/signup/complete-profile?redirectTo=/checkout');
      return;
    }

    if (profile) {
      setForm((prev) => ({
        ...prev,
        customerName: profile.full_name || prev.customerName,
        customerPhone: profile.phone || prev.customerPhone,
        deliveryAddress: profile.default_address || prev.deliveryAddress
      }));
    }
  }, [user, profile, authLoading, router]);

  // Load Razorpay Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  if (cart.length === 0) {
    return (
      <div className="app-container rangoli-pattern">
        <Header />
        <div className="p-8 text-center text-warmMuted flex-1 flex items-center justify-center font-medium">
          <p className="text-sm">Your cart is empty.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Calculate 50% Advance and 50% Remaining
  const advanceAmount = Math.round(discountedTotal / 2);
  const remainingAmount = discountedTotal - advanceAmount;

  const currentOption = PAYMENT_OPTIONS.find((opt) => opt.id === paymentMethod) || PAYMENT_OPTIONS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) {
      setError('Please fill in your name, phone number, and delivery address.');
      return;
    }

    const orderItems = cart.map((item) => ({
      product_id: item.id,
      name: item.nameEn || item.name || 'Flower',
      price: getItemEffectivePrice(item),
      quantity: item.quantity,
      unit: item.selectedUnit || item.unit,
      image_url: item.imageUrl || (Array.isArray(item.images) && item.images[0]) || item.image || ''
    }));

    const orderPayload = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      deliveryAddress: form.deliveryAddress,
      deliveryDate: form.deliveryDate,
      deliveryTimeSlot: form.deliveryTimeSlot,
      orderNote: orderNote,
      items: orderItems,
      total: discountedTotal,
      discountAmount: discountAmount || 0,
      couponCode: appliedCoupon?.code || null,
      couponId: appliedCoupon?.coupon?.id || null,
      userId: user?.id || null,
      advanceAmount: paymentMethod === 'half_advance' ? advanceAmount : null,
      remainingAmount: paymentMethod === 'half_advance' ? remainingAmount : (paymentMethod === 'pay_later' ? discountedTotal : null)
    };

    // FLOW 1: PAY AFTER CONFIRMATION (pay_later)
    if (paymentMethod === 'pay_later') {
      try {
        setSubmitting(true);
        setError('');

        const supabase = createClient();
        let createdOrderId = null;

        if (user && supabase) {
          const { data: orderData, error: orderErr } = await supabase
            .from('orders')
            .insert({
              user_id: user.id,
              customer_name: form.customerName,
              customer_phone: form.customerPhone,
              delivery_address: form.deliveryAddress,
              delivery_date: form.deliveryDate,
              delivery_time_slot: form.deliveryTimeSlot,
              notes: orderNote || '',
              items: orderItems,
              total_amount: discountedTotal,
              discount_amount: discountAmount || 0,
              coupon_code: appliedCoupon?.code || null,
              status: 'placed',
              payment_method: 'pay_later',
              payment_status: 'pending',
              remaining_amount: discountedTotal,
              status_updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!orderErr && orderData) {
            createdOrderId = orderData.id;
            await supabase.from('order_status_history').insert({
              order_id: createdOrderId,
              status: 'placed',
              note: 'Order placed via Pay After Confirmation (Needs payment link sent)'
            });
          }
        }

        // Fallback API route if supabase client insert did not produce ID
        if (!createdOrderId) {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...orderPayload,
              payment_method: 'pay_later',
              payment_status: 'pending'
            })
          });

          const data = await res.json();
          if (res.ok && data.id) {
            createdOrderId = data.id;
          } else {
            throw new Error(data.error || 'Failed to place order');
          }
        }

        try {
          localStorage.setItem('customer_last_phone', form.customerPhone);
          if (createdOrderId) {
            localStorage.setItem('customer_last_order_id', createdOrderId);
          }
        } catch (e) {}

        clearCart();
        router.push(`/order-success?id=${createdOrderId}`);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Something went wrong while placing your order. Please try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // FLOW 2: FULL ONLINE PAYMENT (online) OR PAY HALF ADVANCE (half_advance)
    if (paymentMethod === 'online' || paymentMethod === 'half_advance') {
      try {
        setSubmitting(true);
        setError('');

        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TRex73mrRzbSqz';

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError('Failed to load Razorpay SDK. Please check your internet connection.');
          setSubmitting(false);
          return;
        }

        // Amount to charge upfront via Razorpay
        const chargeAmount = paymentMethod === 'half_advance' ? advanceAmount : discountedTotal;

        const createRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: chargeAmount })
        });

        const orderData = await createRes.json();
        if (!createRes.ok || !orderData.orderId) {
          throw new Error(orderData.error || 'Could not initiate Razorpay payment order');
        }

        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Bloom Flower Shop',
          description: paymentMethod === 'half_advance' ? '50% Advance Payment for Flowers Delivery' : 'Fresh Flowers Delivery Payment',
          image: '/favicon.ico',
          order_id: orderData.orderId,
          prefill: {
            name: form.customerName,
            contact: form.customerPhone,
            email: user?.email || ''
          },
          theme: {
            color: '#E8871E'
          },
          handler: async function (response) {
            try {
              setSubmitting(true);
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderPayload: {
                    ...orderPayload,
                    payment_method: paymentMethod,
                    payment_status: paymentMethod === 'half_advance' ? 'partially_paid' : 'paid',
                    advanceAmount: paymentMethod === 'half_advance' ? advanceAmount : null,
                    remainingAmount: paymentMethod === 'half_advance' ? remainingAmount : null
                  },
                  userId: user?.id || null
                })
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.id) {
                try {
                  localStorage.setItem('customer_last_phone', form.customerPhone);
                  if (verifyData.id) {
                    localStorage.setItem('customer_last_order_id', verifyData.id);
                  }
                } catch (e) {}

                clearCart();
                router.push(`/order-success?id=${verifyData.id}`);
              } else {
                setError(verifyData.error || 'Payment verification failed, please try again or contact support');
                setSubmitting(false);
              }
            } catch (err) {
              console.error(err);
              setError('Payment verification failed, please try again or contact support');
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setError('Payment window was closed. You can try again or select Pay After Confirmation.');
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          console.error(response.error);
          setSubmitting(false);
          setError(`Payment failed: ${response.error.description || 'Transaction declined'}`);
        });

        paymentObject.open();
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred during Razorpay payment initiation.');
        setSubmitting(false);
      }
    }
  };

  const IconComponent = currentOption.icon;

  return (
    <>
      <Head>
        <title>Checkout | Bloom Flower Shop</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-3 flex-1 space-y-4">
          <h1 className="text-xl font-serif font-extrabold text-templeRed">Delivery & Payment Details</h1>

          {error && (
            <div className="p-4 rounded-2xl bg-templeRed/15 border-2 border-templeRed/40 text-darkBrown text-xs font-semibold space-y-2.5 shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-templeRed flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-templeRed block text-sm">Payment Not Completed</span>
                  <p className="text-darkBrown mt-0.5 leading-relaxed">{error}</p>
                  <span className="text-[11px] text-warmMuted block mt-1">
                    🔒 No order was placed in the database. Your cart items remain saved.
                  </span>
                </div>
              </div>

              {(paymentMethod === 'online' || paymentMethod === 'half_advance') && (
                <div className="pt-2 border-t border-templeRed/20 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry Payment Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('pay_later');
                      setError('');
                    }}
                    className="px-3 py-2 rounded-xl bg-creamSurface hover:bg-creamCard text-darkBrown font-bold text-xs border border-divineGold/40"
                  >
                    Switch to Pay After Confirmation
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* AUTHENTICATED CUSTOMER ACCOUNT CARD (No need to re-type Name & Phone!) */}
            {user && (profile?.full_name || form.customerName) && (profile?.phone || form.customerPhone) ? (
              <div className="bg-creamCard border border-divineGold/40 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-marigold/15 border border-marigold/30 text-marigoldDark font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-marigold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-darkBrown">{form.customerName || profile?.full_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-extrabold text-[9px] border border-emerald-500/30 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Authenticated Account
                      </span>
                    </div>
                    <span className="text-xs text-warmMuted font-medium block mt-0.5">
                      📞 {form.customerPhone || profile?.phone}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-marigold" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-2xl bg-creamCard text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-marigold" /> WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    className="w-full p-2.5 rounded-2xl bg-creamCard text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-marigold" /> Delivery Address / Location *
              </label>
              <textarea
                rows={2}
                required
                placeholder="House/Flat No., Building, Street Name, Area/Pincode"
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                className="w-full p-2.5 rounded-2xl bg-creamCard text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-marigold" /> Delivery Date
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={form.deliveryDate}
                  onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                  className="w-full p-2.5 rounded-2xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-marigold" /> Time Slot
                </label>
                <select
                  value={form.deliveryTimeSlot}
                  onChange={(e) => setForm({ ...form, deliveryTimeSlot: e.target.value })}
                  className="w-full p-2.5 rounded-2xl bg-creamCard text-xs text-darkBrown border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9-12)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12-4)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4-8)</option>
                </select>
              </div>
            </div>

            {/* SINGLE PAYMENT METHOD SELECTOR FIELD */}
            <div className="pt-2">
              <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 text-marigold" /> Select Payment Method *
              </label>

              <button
                type="button"
                onClick={() => setIsSheetOpen(true)}
                className="w-full p-3.5 rounded-2xl bg-creamCard border border-divineGold/50 hover:border-marigold transition-all flex items-center justify-between text-left shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-marigold/15 text-marigoldDark border border-marigold/30">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-darkBrown group-hover:text-templeRed transition-colors">
                        {currentOption.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-marigold/10 text-marigoldDark font-bold text-[9px] uppercase border border-marigold/20">
                        {currentOption.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-warmMuted mt-0.5 line-clamp-1 leading-tight">
                      {currentOption.description}
                    </p>
                  </div>
                </div>

                <div className="p-1.5 rounded-full bg-creamSurface text-warmMuted group-hover:text-marigold border border-divineGold/30">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Order Summary & Dynamic Payment Info */}
            <div className="p-4 rounded-2xl bg-creamCard border border-divineGold/40 mt-4 space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center text-xs text-warmSlate">
                <span>Items Subtotal ({cart.length})</span>
                <span className="font-bold text-darkBrown">₹{cartTotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Coupon ({appliedCoupon.code})
                  </span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between items-start text-xs text-warmSlate">
                <div>
                  <span className="font-semibold text-darkBrown block">Delivery Charge</span>
                  <span className="text-[10px] text-warmMuted block font-medium">Free only for bulk orders</span>
                </div>
                <span className="text-marigoldDark font-bold text-[10px] bg-marigold/10 px-2 py-0.5 rounded-md border border-marigold/30">
                  FREE ONLY FOR BULK ORDERS
                </span>
              </div>

              <div className="pt-2 border-t border-divineGold/20 space-y-1">
                <div className="flex justify-between items-center text-sm font-extrabold text-darkBrown">
                  <span>Order Total Amount</span>
                  <span className="text-templeRed text-xl font-serif">₹{discountedTotal}</span>
                </div>

                {/* HALF ADVANCE SPECIFIC BREAKDOWN */}
                {paymentMethod === 'half_advance' && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs space-y-1 mt-2">
                    <div className="flex justify-between items-center text-emerald-900 font-extrabold">
                      <span>⚡ Pay Now (50% Advance):</span>
                      <span className="text-sm">₹{advanceAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-warmMuted font-bold">
                      <span>🤝 Pay on Delivery (Balance):</span>
                      <span>₹{remainingAmount} (Cash/UPI/Cheque)</span>
                    </div>
                  </div>
                )}

                {/* PAY AFTER CONFIRMATION BREAKDOWN */}
                {paymentMethod === 'pay_later' && (
                  <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs space-y-1 mt-2">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                      <MessageSquare className="w-4 h-4 text-purple-700 flex-shrink-0" />
                      <span>No payment required now</span>
                    </div>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      You will receive a Razorpay payment link on WhatsApp after order confirmation.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-marigold/30 active:scale-98 transition-all mt-4 border border-divineGold/40"
            >
              {submitting ? (
                'Processing Order...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {paymentMethod === 'online' && `Pay ₹${discountedTotal} Now via Razorpay`}
                  {paymentMethod === 'half_advance' && `Pay ₹${advanceAmount} Advance via Razorpay`}
                  {paymentMethod === 'pay_later' && 'Place Order (Pay After Confirmation)'}
                </>
              )}
            </button>
          </form>
        </main>

        {/* PAYMENT METHOD SELECTION BOTTOM SHEET / MODAL */}
        {isSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-darkBrown/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-creamCard border border-divineGold/40 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-divineGold/25">
                <div>
                  <h2 className="text-base font-serif font-extrabold text-templeRed">Select Payment Method</h2>
                  <p className="text-[11px] text-warmMuted font-medium">Choose how you'd like to pay for your flowers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-creamSurface text-warmMuted hover:text-darkBrown flex items-center justify-center border border-divineGold/30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = option.id === paymentMethod;

                  return (
                    <div
                      key={option.id}
                      onClick={() => {
                        setPaymentMethod(option.id);
                        setIsSheetOpen(false);
                      }}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-start justify-between ${
                        isSelected
                          ? 'bg-marigold/15 border-marigold shadow-md ring-2 ring-marigold/30'
                          : 'bg-creamSurface border-divineGold/30 hover:border-marigold/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${isSelected ? 'bg-marigold text-creamBg' : 'bg-creamCard text-warmMuted'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-darkBrown">{option.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-marigold/10 text-marigoldDark font-extrabold text-[9px] uppercase border border-marigold/20">
                              {option.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-warmMuted mt-1 leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                        isSelected ? 'bg-marigold border-marigold text-creamBg' : 'border-divineGold/50 bg-creamCard'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </>
  );
}
