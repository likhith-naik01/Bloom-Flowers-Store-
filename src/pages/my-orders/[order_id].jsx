import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../frontend/components/layout/Header';
import BottomNav from '../../frontend/components/layout/BottomNav';
import { useAuth } from '../../frontend/context/AuthContext';
import { useShop } from '../../frontend/context/ShopContext';
import { getOrderItemDetails } from '../../backend/orderHelper';
import { createClient } from '../../backend/supabase/client';
import { generateCustomerWhatsAppLink } from '../../backend/whatsapp';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  MessageSquare,
  AlertCircle,
  CreditCard,
  Banknote,
  ShieldCheck,
  Sparkles,
  Link2,
  RefreshCw,
  HelpCircle,
  PhoneCall
} from 'lucide-react';

export default function OrderTrackingDetail() {
  const router = useRouter();
  const { order_id } = router.query;
  const { user, profile, loading: authLoading } = useAuth();
  const { products = [] } = useShop();

  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    if (order_id) {
      fetchOrderDetails(order_id, user?.id);
    }
  }, [router.isReady, order_id, user]);

  const fetchOrderDetails = async (id, userId) => {
    try {
      setLoading(true);
      setError('');
      const supabase = createClient();

      if (supabase) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderData) {
          setOrder(orderData);
          const { data: historyData } = await supabase
            .from('order_status_history')
            .select('*')
            .eq('order_id', id)
            .order('changed_at', { ascending: true });

          setHistory(Array.isArray(historyData) ? historyData : []);
          setLoading(false);
          return;
        }
      }

      // Fallback API route
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError('Order not found or access denied.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while loading order details.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="app-container rangoli-pattern">
        <Header />
        <div className="p-8 text-center text-warmMuted text-xs flex-1 flex items-center justify-center font-medium">
          Loading order tracking...
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="app-container rangoli-pattern">
        <Header />
        <main className="px-4 py-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-templeRed/10 text-templeRed flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-serif font-bold text-darkBrown">Order Not Found</h1>
          <p className="text-xs text-warmMuted max-w-xs">{error || 'This order does not exist.'}</p>
          <Link
            href="/my-orders"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-marigold/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const payMethod = order.payment_method || order.paymentMethod || 'cod';
  const payStatus = order.payment_status || order.paymentStatus || 'pending';
  const isPaid = payStatus === 'paid' || payMethod === 'online';
  const isPartiallyPaid = payStatus === 'partially_paid' || payMethod === 'half_advance';
  const isCancelled = order.status === 'cancelled';

  const totalAmount = Number(order.total_amount !== undefined ? order.total_amount : (order.total || 0));
  const advanceAmt = Number(order.advance_amount || order.advanceAmount || Math.round(totalAmount / 2));
  const remainingAmt = Number(order.remaining_amount || order.remainingAmount || (totalAmount - advanceAmt));

  // Point-to-point tracking stages definition
  const TRACKING_STAGES = [
    { key: 'placed', label: 'Order Placed', icon: Clock },
    {
      key: 'payment',
      label: isPaid ? 'Payment Received ✓' : isPartiallyPaid ? 'Advance Received ✓' : 'Payment Pending',
      icon: ShieldCheck,
      isPaymentStage: true
    },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'packed', label: 'Packed', icon: PackageCheck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  const getStageCompleted = (stageKey) => {
    const s = (order.status || 'placed').toLowerCase();
    if (stageKey === 'placed') return true;
    if (stageKey === 'payment') return isPaid || isPartiallyPaid;
    if (stageKey === 'confirmed') return ['confirmed', 'packed', 'out_for_delivery', 'completed', 'delivered'].includes(s);
    if (stageKey === 'packed') return ['packed', 'out_for_delivery', 'completed', 'delivered'].includes(s);
    if (stageKey === 'out_for_delivery') return ['out_for_delivery', 'completed', 'delivered'].includes(s);
    if (stageKey === 'completed') return ['completed', 'delivered'].includes(s);
    return false;
  };

  const itemsList = Array.isArray(order.items) ? order.items : [];
  const latestNoteEntry = history.slice().reverse().find((h) => h.note && h.note.trim() !== '');

  return (
    <>
      <Head>
        <title>Track Order #{order.id.slice(0, 8)} | Bloom</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-4 flex-1 space-y-4">
          {/* Top Nav Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/my-orders"
              className="inline-flex items-center gap-1 text-xs text-warmMuted hover:text-templeRed transition-colors font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to My Orders
            </Link>

            <button
              onClick={() => fetchOrderDetails(order.id, user?.id)}
              className="p-1.5 rounded-full bg-creamCard text-warmMuted hover:text-darkBrown border border-divineGold/30"
              title="Refresh Status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title Card */}
          <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-lg font-serif font-extrabold text-templeRed">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-[11px] text-warmMuted font-medium mt-0.5">
                Placed on {new Date(order.created_at || order.createdAt).toLocaleString()}
              </p>
            </div>

            {isCancelled ? (
              <span className="px-3 py-1 rounded-full bg-templeRed/10 text-templeRed font-bold text-xs border border-templeRed/30">
                Cancelled
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-marigold/15 text-marigoldDark font-extrabold text-xs border border-marigold/30 animate-pulse">
                {order.status === 'delivered' ? 'Completed' : (order.status || 'Placed')}
              </span>
            )}
          </div>

          {/* NEED HELP & COMPLAINT WHATSAPP BUTTON CARD */}
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 p-4 rounded-2xl text-creamBg shadow-md flex items-center justify-between gap-3 border border-emerald-700">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-emerald-400" /> Need Help with this Order?
              </span>
              <p className="text-[11px] text-creamBg/80 font-medium">
                Tap to send order details & complaint directly on WhatsApp to +91 8310117145
              </p>
            </div>

            <a
              href={generateCustomerWhatsAppLink(order, '918310117145')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md flex-shrink-0 active:scale-95 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Complaint / Help
            </a>
          </div>

          {/* POINT-TO-POINT TRACKING STEPPER */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-creamCard border border-templeRed/40 flex items-start gap-3 shadow-sm">
              <XCircle className="w-6 h-6 text-templeRed flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-darkBrown">This order was cancelled</h3>
                <p className="text-xs text-templeRed mt-0.5">
                  Contact shop support on WhatsApp if you have questions.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-marigoldDark">
                Point-to-Point Order Progress
              </h2>

              <div className="relative pl-6 space-y-6">
                {TRACKING_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isDone = getStageCompleted(stage.key);
                  const isLast = idx === TRACKING_STAGES.length - 1;
                  const nextIsDone = !isLast && getStageCompleted(TRACKING_STAGES[idx + 1].key);

                  // Match timestamp from order_status_history
                  const matchingHistory = history.find(
                    (h) => (h.status || '').toLowerCase() === stage.key
                  );
                  const timestamp = matchingHistory?.changed_at
                    ? new Date(matchingHistory.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : (idx === 0 && order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                  return (
                    <div key={stage.key} className="relative flex items-start gap-3">
                      {/* Connecting Line to next step */}
                      {!isLast && (
                        <div
                          className={`absolute left-[-14px] top-5 w-0.5 h-6 transition-colors ${
                            isDone && nextIsDone
                              ? 'bg-emerald-500'
                              : 'bg-divineGold/30'
                          }`}
                        />
                      )}

                      {/* Stage Circle Badge - Green when completed */}
                      <div
                        className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold border transition-all ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-700 text-creamBg shadow-sm scale-105'
                            : 'bg-creamSurface border-divineGold/40 text-warmMuted'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-extrabold flex items-center gap-1.5 ${
                              isDone ? 'text-darkBrown' : 'text-warmMuted'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-600' : 'text-marigold'}`} />
                            {stage.label}
                          </span>
                          {timestamp && (
                            <span className="text-[10px] text-warmMuted font-semibold">
                              {timestamp}
                            </span>
                          )}
                        </div>

                        {stage.key === 'payment' && (
                          <p className="text-[10px] text-warmMuted mt-0.5 font-medium">
                            {isPaid && 'Full payment verified successfully ✓'}
                            {isPartiallyPaid && `50% Advance Paid (₹${advanceAmt} ✓) | Balance Due: ₹${remainingAmt}`}
                            {!isPaid && !isPartiallyPaid && payMethod === 'pay_later' && 'Payment link will be sent via WhatsApp after order review.'}
                            {!isPaid && !isPartiallyPaid && payMethod === 'cod' && `₹${totalAmount} due on delivery.`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAYMENT & DELIVERY INFORMATION CARD */}
          <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 space-y-3 text-xs shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-marigoldDark flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-marigold" /> Payment & Delivery Summary
            </h2>

            <div className="p-3 rounded-2xl bg-creamSurface border border-divineGold/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-darkBrown flex items-center gap-1">
                  {payMethod === 'online' && <CreditCard className="w-4 h-4 text-marigold" />}
                  {payMethod === 'half_advance' && <Sparkles className="w-4 h-4 text-marigold" />}
                  {payMethod === 'pay_later' && <MessageSquare className="w-4 h-4 text-marigold" />}
                  {payMethod === 'cod' && <Banknote className="w-4 h-4 text-marigold" />}

                  {payMethod === 'online' && 'Pay Online (Razorpay)'}
                  {payMethod === 'half_advance' && 'Pay Half Advance'}
                  {payMethod === 'pay_later' && 'Pay After Confirmation'}
                  {payMethod === 'cod' && 'Cash on Confirmation'}
                </span>

                {isPaid ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-extrabold text-[10px] border border-emerald-500/30">
                    Paid Online ✓
                  </span>
                ) : isPartiallyPaid ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-marigold/15 text-marigoldDark font-extrabold text-[10px] border border-marigold/30">
                    50% Advance Paid
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 font-extrabold text-[10px] border border-amber-500/30">
                    Payment Pending
                  </span>
                )}
              </div>

              {/* Payment Link Info if available */}
              {order.payment_link && !isPaid && (
                <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 space-y-1">
                  <span className="text-[10px] text-purple-900 font-bold block flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-purple-700" /> Razorpay Payment Link:
                  </span>
                  <a
                    href={order.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-purple-800 underline truncate block hover:text-purple-950"
                  >
                    {order.payment_link}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2 text-darkBrown">
                <MapPin className="w-4 h-4 text-marigold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-warmMuted block font-medium">Delivery Address</span>
                  <span className="font-semibold text-darkBrown">{order.delivery_address || order.customerAddress}</span>
                </div>
              </div>

              {(order.delivery_date || order.deliveryDate) && (
                <div className="flex items-center gap-2 text-darkBrown">
                  <Calendar className="w-4 h-4 text-marigold flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-warmMuted block font-medium">Delivery Date & Time</span>
                    <span className="font-semibold text-darkBrown">
                      {order.delivery_date || order.deliveryDate} ({order.delivery_time_slot || order.deliveryTimeSlot || 'Morning'})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Note */}
          {latestNoteEntry && (
            <div className="p-3.5 rounded-2xl bg-marigold/10 border border-marigold/30 flex items-start gap-2.5">
              <MessageSquare className="w-4 h-4 text-marigoldDark flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-marigoldDark block">
                  Latest Update Note
                </span>
                <p className="text-xs text-darkBrown mt-0.5 italic leading-relaxed">
                  "{latestNoteEntry.note}"
                </p>
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 space-y-3 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-marigoldDark">
              Ordered Items ({itemsList.length})
            </h2>

            <div className="space-y-2.5">
              {itemsList.map((it, idx) => {
                const { img: itemImg, unit: unitDisplay } = getOrderItemDetails(it, products);
                const imageSrc = itemImg || it.image_url || it.imageUrl;

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs text-darkBrown">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-creamSurface border border-divineGold/30">
                      {imageSrc ? (
                        <img src={imageSrc} alt={it.nameEn || it.name || 'Flower'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-warmMuted text-sm">🌸</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold block truncate text-darkBrown">{it.nameEn || it.name}</span>
                      <span className="text-[10px] text-warmMuted block">
                        Qty: {it.quantity} {unitDisplay ? `(${unitDisplay})` : ''}
                      </span>
                    </div>
                    <span className="font-extrabold text-templeRed text-xs">
                      ₹{it.price * it.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-divineGold/20 flex justify-between items-center text-sm font-extrabold text-darkBrown">
              <span>Total Amount</span>
              <span className="text-templeRed text-base">₹{totalAmount}</span>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
