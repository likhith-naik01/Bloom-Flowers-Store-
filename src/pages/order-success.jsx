import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import { useShop } from '../frontend/context/ShopContext';
import { getOrderItemDetails } from '../backend/orderHelper';
import { CheckCircle2, MessageCircle, Clock, ArrowRight, CreditCard, Banknote, ShieldCheck, Sparkles, Link2 } from 'lucide-react';

export default function OrderSuccess() {
  const router = useRouter();
  const { id } = router.query;
  const { products = [] } = useShop();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [id]);

  const payMethod = order?.payment_method || order?.paymentMethod || 'cod';
  const payStatus = order?.payment_status || order?.paymentStatus || 'pending';
  const totalAmount = Number(order?.total_amount !== undefined ? order.total_amount : (order?.total || 0));
  const advanceAmt = Number(order?.advance_amount || order?.advanceAmount || Math.round(totalAmount / 2));
  const remainingAmt = Number(order?.remaining_amount || order?.remainingAmount || (totalAmount - advanceAmt));

  return (
    <>
      <Head>
        <title>Order Placed Successfully | Bloom</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-6 flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-full bg-marigold/15 border border-marigold/30 text-marigoldDark font-extrabold text-xs uppercase tracking-wider mb-2">
            Order Confirmed & Saved
          </span>

          <h1 className="text-2xl font-serif font-extrabold text-templeRed">Order Received!</h1>
          <p className="text-xs text-darkBrown mt-1 max-w-xs font-medium">
            Your order has been recorded with Order ID <strong className="text-marigoldDark">#{id ? id.slice(0, 8) : 'FLW-XXXX'}</strong>.
          </p>

          {/* Admin WhatsApp Info Card */}
          <div className="w-full bg-creamCard border border-emerald-500/40 p-4 rounded-2xl my-6 text-left relative overflow-hidden shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 flex-shrink-0 border border-emerald-500/30">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-darkBrown">What Happens Next?</h3>
                <p className="text-xs text-warmSlate mt-1 leading-relaxed">
                  {payMethod === 'pay_later' ? (
                    <>
                      Our shop owner will review your order details and <strong>send a Razorpay payment link directly to your WhatsApp</strong>.
                    </>
                  ) : (
                    <>
                      Our shop owner will review your order details and <strong>message you directly on WhatsApp</strong> at your registered phone number to confirm final availability & delivery slot.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {order && (
            <div className="w-full bg-creamCard p-4 rounded-2xl text-left mb-4 border border-divineGold/35 space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-divineGold/20 text-xs">
                <span className="text-warmMuted font-medium">Customer Name</span>
                <span className="font-bold text-darkBrown">{order.customerName || order.customer_name}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-divineGold/20 text-xs">
                <span className="text-warmMuted font-medium">Delivery Schedule</span>
                <span className="font-bold text-darkBrown">
                  {order.deliveryDate || order.delivery_date} ({order.deliveryTimeSlot || order.delivery_time_slot})
                </span>
              </div>

              {/* Payment Info Section */}
              <div className="flex justify-between items-center pb-2 border-b border-divineGold/20 text-xs">
                <span className="text-warmMuted font-medium">Payment Option</span>
                <span className="font-bold text-darkBrown flex items-center gap-1.5">
                  {payMethod === 'online' && (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-marigold" /> Pay Online (Razorpay)
                    </>
                  )}
                  {payMethod === 'half_advance' && (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-marigold" /> Pay Half Advance
                    </>
                  )}
                  {payMethod === 'pay_later' && (
                    <>
                      <MessageCircle className="w-3.5 h-3.5 text-purple-600" /> Pay After Confirmation
                    </>
                  )}
                  {payMethod === 'cod' && (
                    <>
                      <Banknote className="w-3.5 h-3.5 text-marigold" /> Cash on Confirmation
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-divineGold/20 text-xs">
                <span className="text-warmMuted font-medium">Payment Status</span>
                {payMethod === 'online' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-[10px] uppercase border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Paid Online ✓
                  </span>
                )}
                {payMethod === 'half_advance' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-[10px] border border-emerald-500/30">
                    Advance Paid: ₹{advanceAmt} ✓ | ₹{remainingAmt} Due
                  </span>
                )}
                {payMethod === 'pay_later' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-900 font-bold text-[10px] border border-purple-500/30">
                    Payment Link Will Be Sent on WhatsApp
                  </span>
                )}
                {payMethod === 'cod' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 font-bold text-[10px] uppercase border border-amber-500/30">
                    Pay on Delivery (Cash/UPI/Cheque)
                  </span>
                )}
              </div>

              {order.razorpay_payment_id && (
                <div className="flex justify-between items-center pb-2 border-b border-divineGold/20 text-xs">
                  <span className="text-warmMuted font-medium">Payment Receipt Ref</span>
                  <span className="font-mono text-[11px] text-marigoldDark font-bold">
                    {order.razorpay_payment_id}
                  </span>
                </div>
              )}

              {/* Items List with Thumbnails */}
              {Array.isArray(order.items) && order.items.length > 0 && (
                <div className="py-2 border-b border-divineGold/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-warmMuted block">Ordered Items</span>
                  {order.items.map((it, idx) => {
                    const { img: itemImg, unit: unitDisplay } = getOrderItemDetails(it, products);

                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-darkBrown">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-creamSurface border border-divineGold/30">
                          {itemImg ? (
                            <img src={itemImg} alt={it.nameEn || it.name || 'Flower'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-warmMuted text-xs">🌸</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold block truncate text-darkBrown">{it.nameEn || it.name}</span>
                          <span className="text-[10px] text-warmMuted">Qty: {it.quantity} ({unitDisplay})</span>
                        </div>
                        <span className="font-extrabold text-templeRed text-xs">₹{it.price * it.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-warmMuted font-medium">Total Amount</span>
                <span className="font-extrabold text-templeRed text-sm">
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 w-full">
            <Link
              href="/my-orders"
              className="w-full py-3 rounded-xl bg-creamCard hover:bg-creamSurface text-darkBrown font-bold text-xs flex items-center justify-center gap-1.5 border border-divineGold/40 shadow-sm"
            >
              <Clock className="w-4 h-4 text-marigold" /> View Order Status in "My Orders"
            </Link>

            <Link
              href="/shop"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-marigold/20"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
