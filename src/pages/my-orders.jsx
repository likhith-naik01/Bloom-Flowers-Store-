import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import OrderCard from '../frontend/components/customer/OrderCard';
import { useAuth } from '../frontend/context/AuthContext';
import { createClient } from '../backend/supabase/client';
import { Clock, Phone, Search, Package, ShoppingBag, RefreshCw } from 'lucide-react';

export default function MyOrders() {
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const userPhone = profile?.phone || '';
    fetchUserOrders(user?.id, userPhone);
  }, [user, profile, authLoading]);

  const fetchUserOrders = async (userId, userPhone) => {
    try {
      setLoading(true);
      const ordersMap = new Map();

      // 1. Supabase Query by user_id
      const supabase = createClient();
      if (supabase && userId) {
        const { data: userData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (Array.isArray(userData)) {
          userData.forEach((o) => ordersMap.set(o.id, o));
        }

        // 2. Supabase Query by phone if available
        const cleanPhone = (userPhone || '').replace(/\D/g, '');
        if (cleanPhone && cleanPhone.length >= 10) {
          const { data: phoneData } = await supabase
            .from('orders')
            .select('*')
            .ilike('customer_phone', `%${cleanPhone}%`)
            .order('created_at', { ascending: false });

          if (Array.isArray(phoneData)) {
            phoneData.forEach((o) => ordersMap.set(o.id, o));
          }
        }
      }

      // 3. Phone Lookup via API
      const phoneToLookup = userPhone || localStorage.getItem('customer_last_phone') || '';
      if (phoneToLookup) {
        try {
          const res = await fetch(`/api/orders/lookup?phone=${encodeURIComponent(phoneToLookup)}`);
          if (res.ok) {
            const localData = await res.json();
            if (Array.isArray(localData)) {
              localData.forEach((o) => {
                if (!ordersMap.has(o.id)) {
                  ordersMap.set(o.id, o);
                }
              });
            }
          }
        } catch (e) {}
      }

      // 4. Direct Fetch of last placed order ID from localStorage
      try {
        const lastOrderId = localStorage.getItem('customer_last_order_id');
        if (lastOrderId && !ordersMap.has(lastOrderId)) {
          const lastRes = await fetch(`/api/orders/${lastOrderId}`);
          if (lastRes.ok) {
            const lastOrder = await lastRes.json();
            if (lastOrder && lastOrder.id) {
              ordersMap.set(lastOrder.id, lastOrder);
            }
          }
        }
      } catch (e) {}

      // 5. General Fallback to /api/orders if ordersMap is still empty
      if (ordersMap.size === 0) {
        try {
          const allRes = await fetch('/api/orders');
          if (allRes.ok) {
            const allOrders = await allRes.json();
            if (Array.isArray(allOrders)) {
              const targetPhone = (phoneToLookup || '').replace(/\D/g, '');
              allOrders.forEach((o) => {
                const p = (o.customerPhone || o.customer_phone || '').replace(/\D/g, '');
                if ((targetPhone && p.includes(targetPhone)) || (userId && (o.userId === userId || o.user_id === userId))) {
                  ordersMap.set(o.id, o);
                }
              });
            }
          }
        } catch (e) {}
      }

      const combined = Array.from(ordersMap.values()).sort(
        (a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      );

      setOrders(combined);
    } catch (e) {
      console.error('Error fetching user orders:', e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByPhone = async (phoneNum) => {
    const trimmed = phoneNum ? phoneNum.trim() : '';
    if (!trimmed) {
      setOrders([]);
      setSearched(false);
      return;
    }
    try {
      setLoading(true);
      setSearched(true);
      const res = await fetch(`/api/orders/lookup?phone=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrdersByPhone(phoneSearch);
  };

  return (
    <>
      <Head>
        <title>My Orders | Bloom Flower Shop</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-4 flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif font-extrabold text-templeRed flex items-center gap-2">
              <Clock className="w-5 h-5 text-marigold" /> My Orders & Tracking
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchUserOrders(user?.id, profile?.phone);
                }}
                className="p-1.5 rounded-full bg-creamCard hover:bg-creamSurface text-warmMuted hover:text-darkBrown border border-divineGold/30"
                title="Refresh Orders List"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-warmMuted font-bold">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>
          </div>

          {/* If user is NOT logged in, present Phone Lookup or Login prompt */}
          {!user && (
            <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 space-y-3 shadow-sm">
              <div className="text-center pb-2">
                <p className="text-xs text-darkBrown font-medium">
                  Logged in users can see all past orders automatically.{' '}
                  <Link href="/login?redirectTo=/my-orders" className="text-templeRed font-extrabold hover:underline">
                    Sign In Here
                  </Link>
                </p>
              </div>

              <form onSubmit={handlePhoneSearchSubmit} className="space-y-2">
                <label className="text-[11px] font-bold text-darkBrown block">
                  Or Lookup Guest Orders by Phone Number
                </label>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-marigold" />
                    <input
                      type="tel"
                      placeholder="Enter phone number..."
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-creamSurface text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none focus:border-marigold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs flex items-center gap-1 shadow-md shadow-marigold/20"
                  >
                    <Search className="w-3.5 h-3.5" /> Search
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-10 text-warmMuted text-xs font-medium">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-creamCard p-10 text-center rounded-2xl border border-divineGold/30 space-y-3 shadow-sm">
              <Package className="w-10 h-10 text-warmMuted mx-auto" />
              <p className="text-xs text-warmMuted font-medium">
                {searched
                  ? `No orders found for phone number ${phoneSearch}.`
                  : 'No orders found for your account.'}
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs shadow-md shadow-marigold/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Explore Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <OrderCard key={ord.id} order={ord} />
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
}
