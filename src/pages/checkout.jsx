import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { useCart } from '../context/CartContext';
import { User, Phone, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const { cart, orderNote, cartTotal, clearCart, getItemEffectivePrice } = useCart();

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryDate: todayStr,
    deliveryTimeSlot: 'Morning (9 AM - 12 PM)'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="app-container">
        <Header />
        <div className="p-8 text-center text-slate-400">
          <p>Your cart is empty.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) {
      setError('Please fill in your name, phone number, and delivery address.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const orderPayload = {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: form.deliveryAddress,
        deliveryDate: form.deliveryDate,
        deliveryTimeSlot: form.deliveryTimeSlot,
        orderNote: orderNote,
        items: cart.map((item) => ({
          id: item.id,
          nameEn: item.nameEn,
          quantity: item.quantity,
          unit: item.unit,
          price: getItemEffectivePrice(item)
        })),
        total: cartTotal
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (res.ok && data.id) {
        // Save phone to localStorage for easy customer order lookup
        try {
          localStorage.setItem('customer_last_phone', form.customerPhone);
        } catch (e) {}

        clearCart();
        router.push(`/order-success?id=${data.id}`);
      } else {
        setError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Checkout | Bloom Flower Shop</title>
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-3 flex-1">
          <h1 className="text-xl font-extrabold text-white mb-3">Delivery Details</h1>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-rose-400" /> Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-panel text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-rose-400" /> WhatsApp / Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-panel text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Delivery Address / Location *
              </label>
              <textarea
                rows={2}
                required
                placeholder="House/Flat No., Building, Street Name, Area/Pincode"
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-panel text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" /> Delivery Date
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={form.deliveryDate}
                  onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-panel text-xs text-white border border-white/10 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-rose-400" /> Time Slot
                </label>
                <select
                  value={form.deliveryTimeSlot}
                  onChange={(e) => setForm({ ...form, deliveryTimeSlot: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-panel text-xs text-white bg-slate-900 border border-white/10 focus:outline-none focus:border-rose-500/50"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9-12)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12-4)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4-8)</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 mt-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Items Subtotal ({cart.length})</span>
                <span className="font-bold text-white">₹{cartTotal}</span>
              </div>

              <div className="flex justify-between items-start text-xs text-slate-300">
                <div>
                  <span className="font-semibold text-slate-200 block">Delivery Charge</span>
                  <span className="text-[10px] text-slate-400 block">Calculated on order confirmation</span>
                </div>
                <span className="text-amber-300 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  FREE ONLY FOR BULK ORDERS
                </span>
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold text-white pt-2 border-t border-white/10">
                <span>Total (Cash on Delivery)</span>
                <span className="text-rose-400 text-lg">₹{cartTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 active:scale-98 transition-all mt-4"
            >
              {submitting ? (
                'Saving Order...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Place Order Now
                </>
              )}
            </button>
          </form>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
