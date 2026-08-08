import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { CheckCircle2, MessageCircle, Clock, ArrowRight, PackageCheck } from 'lucide-react';
import { generateCustomerWhatsAppLink } from '../lib/whatsapp';

export default function OrderSuccess() {
  const router = useRouter();
  const { id } = router.query;
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

  return (
    <>
      <Head>
        <title>Order Placed Successfully | Bloom</title>
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-6 flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold text-xs uppercase tracking-wider mb-2">
            Order Saved to Database
          </span>

          <h1 className="text-2xl font-extrabold text-white">Order Received!</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            Your order has been recorded with Order ID <strong className="text-rose-400">#{id || 'FLW-XXXX'}</strong>.
          </p>

          {/* Admin WhatsApp Info Card */}
          <div className="w-full glass-panel border border-emerald-500/30 p-4 rounded-2xl my-6 text-left relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">What Happens Next?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Our shop owner will review your order details and <strong>message you directly on WhatsApp</strong> at your registered phone number to confirm final availability & delivery slot.
                </p>
              </div>
            </div>
          </div>

          {order && (
            <div className="w-full glass-panel p-4 rounded-2xl text-left mb-4 border border-white/10 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-white/10 text-xs">
                <span className="text-slate-400">Customer Name</span>
                <span className="font-bold text-white">{order.customerName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10 text-xs">
                <span className="text-slate-400">Delivery Date</span>
                <span className="font-bold text-white">{order.deliveryDate} ({order.deliveryTimeSlot})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Amount</span>
                <span className="font-extrabold text-rose-400 text-sm">₹{order.total} (COD)</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 w-full">
            {order && (
              <a
                href={generateCustomerWhatsAppLink(order)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Message Shop Owner on WhatsApp
              </a>
            )}

            <Link
              href="/my-orders"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10"
            >
              <Clock className="w-4 h-4 text-rose-400" /> View Order Status in "My Orders"
            </Link>

            <Link
              href="/shop"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
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
