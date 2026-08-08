import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { useShop } from '../context/ShopContext';
import { getOrderItemDetails } from '../lib/orderHelper';
import { Phone, Search, Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MyOrders() {
  const { products = [] } = useShop();
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem('customer_last_phone');
      if (savedPhone) {
        setPhone(savedPhone);
        fetchOrders(savedPhone);
      }
    } catch (e) {}
  }, []);

  const fetchOrders = async (phoneNum) => {
    if (!phoneNum) return;
    try {
      setLoading(true);
      setSearched(true);
      const res = await fetch(`/api/orders/lookup?phone=${encodeURIComponent(phoneNum)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(phone);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase border border-blue-500/30">Order Received</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/30">Contacted on WhatsApp</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-500/30">Confirmed</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full bg-green-500/30 text-green-300 font-bold text-[10px] uppercase border border-green-500/40">Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold text-[10px] uppercase border border-red-500/30">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px]">{status}</span>;
    }
  };

  return (
    <>
      <Head>
        <title>My Orders | Bloom Flower Shop</title>
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-3 flex-1">
          <h1 className="text-xl font-extrabold text-white mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400" /> My Orders & History
          </h1>

          <form onSubmit={handleSearch} className="mb-4">
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Lookup Previous Orders by Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="Enter your phone number..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-panel text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-rose-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                Lookup
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Fetching orders...</div>
          ) : searched && orders.length === 0 ? (
            <div className="text-center py-10 glass-panel rounded-2xl border border-white/10">
              <p className="text-sm text-slate-400">No previous orders found for phone {phone}.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {orders.map((ord) => (
                <div key={ord.id} className="glass-panel p-3.5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                    <div>
                      <span className="font-extrabold text-sm text-white">Order #{ord.id}</span>
                      <span className="text-[10px] text-slate-400 block">{new Date(ord.createdAt).toLocaleString()}</span>
                    </div>
                    {getStatusBadge(ord.status)}
                  </div>

                  <div className="text-xs space-y-1 my-2">
                    <p className="text-slate-300">
                      <strong>Delivery:</strong> {ord.deliveryDate} ({ord.deliveryTimeSlot})
                    </p>
                    <p className="text-slate-300">
                      <strong>Address:</strong> {ord.deliveryAddress}
                    </p>
                    {ord.orderNote && (
                      <p className="text-amber-300 italic text-[11px]">
                        <strong>Note:</strong> "{ord.orderNote}"
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 my-2.5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Ordered Items</span>
                    {ord.items.map((it, idx) => {
                      const { img: itemImg, unit: unitDisplay } = getOrderItemDetails(it, products);

                      return (
                        <div key={idx} className="flex items-center gap-2.5 text-xs text-white">
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 border border-white/10">
                            {itemImg ? (
                              <img src={itemImg} alt={it.nameEn || 'Flower'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">🌸</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold block truncate text-slate-200">{it.nameEn || it.name}</span>
                            <span className="text-[10px] text-slate-400">Qty: {it.quantity} ({unitDisplay})</span>
                          </div>
                          <span className="font-extrabold text-white text-xs">₹{it.price * it.quantity}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Delivery Charge</span>
                      {ord.isBulkOrder ? (
                        <span className="text-emerald-400 font-bold text-[11px]">FREE (Bulk Order Special)</span>
                      ) : ord.deliveryCharge > 0 ? (
                        <span className="text-slate-200 font-bold">₹{ord.deliveryCharge}</span>
                      ) : (
                        <span className="text-amber-300 italic text-[11px]">Calculated on WhatsApp</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-1 text-sm font-extrabold text-white">
                      <span>Total (COD)</span>
                      <span className="text-rose-400 text-base">₹{ord.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
}
