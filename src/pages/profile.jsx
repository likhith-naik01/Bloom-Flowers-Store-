import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import OrderCard from '../frontend/components/customer/OrderCard';
import { useAuth } from '../frontend/context/AuthContext';
import { createClient } from '../backend/supabase/client';
import { User, Phone, MapPin, Mail, Clock, Package, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, logoutUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/profile');
      return;
    }

    if (user) {
      fetchUserOrders(user.id);
    }
  }, [user, profile, authLoading, router]);

  const fetchUserOrders = async (userId) => {
    try {
      setOrdersLoading(true);
      const supabase = createClient();
      let combinedOrders = [];

      // 1. Try querying Supabase by user_id or phone
      if (supabase && userId) {
        const userPhone = profile?.phone || '';
        let query = supabase.from('orders').select('*');

        if (userPhone) {
          query = query.or(`user_id.eq.${userId},customer_phone.eq.${userPhone}`);
        } else {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          combinedOrders = data;
        }
      }

      // 2. Fallback to API endpoint /api/orders if Supabase query returned empty
      if (combinedOrders.length === 0) {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const allOrders = await res.json();
          if (Array.isArray(allOrders)) {
            const userPhone = profile?.phone || '';
            combinedOrders = allOrders.filter(
              (o) =>
                (userId && o.user_id === userId) ||
                (userPhone && o.customer_phone === userPhone) ||
                (o.customerPhone === userPhone)
            );
          }
        }
      }

      // 3. Fallback check for customer_last_order_id stored in localStorage
      try {
        const lastId = localStorage.getItem('customer_last_order_id');
        if (lastId && !combinedOrders.some((o) => o.id === lastId)) {
          const res = await fetch(`/api/orders/${lastId}`);
          if (res.ok) {
            const singleOrder = await res.json();
            if (singleOrder && singleOrder.id) {
              combinedOrders.unshift(singleOrder);
            }
          }
        }
      } catch (e) {}

      setOrders(combinedOrders);
    } catch (e) {
      console.error('Error fetching user orders:', e);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="app-container rangoli-pattern">
        <Header />
        <div className="p-8 text-center text-warmMuted text-xs flex-1 flex items-center justify-center font-medium">
          Loading profile details...
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile | Bloom Flower Shop</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-4 flex-1 space-y-5">
          {/* Header Card */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif font-extrabold text-templeRed flex items-center gap-2">
              <User className="w-5 h-5 text-marigold" /> Account Profile
            </h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-full bg-templeRed/10 border border-templeRed/30 text-templeRed text-xs font-bold flex items-center gap-1 hover:bg-templeRed/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>

          {/* Profile Details Card - VIEW ONLY */}
          <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-divineGold/20">
              <span className="text-xs font-bold uppercase tracking-wider text-marigoldDark">
                Personal Information (View Only)
              </span>
            </div>

            <div className="space-y-3 text-xs text-darkBrown">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-warmMuted flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-warmMuted block font-medium">Full Name</span>
                  <span className="font-bold text-darkBrown">{profile?.full_name || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-warmMuted flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-warmMuted block font-medium">Email Address</span>
                  <span className="font-bold text-darkBrown">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-warmMuted flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-warmMuted block font-medium">Phone / WhatsApp</span>
                  <span className="font-bold text-darkBrown">{profile?.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-warmMuted flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-warmMuted block font-medium">Default Address</span>
                  <span className="font-semibold text-darkBrown">
                    {profile?.default_address || 'No default address saved'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif font-extrabold text-templeRed flex items-center gap-2">
                <Clock className="w-4 h-4 text-marigold" /> Order History
              </h2>
              <span className="text-xs text-warmMuted font-bold">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8 text-warmMuted text-xs font-medium">Loading order history...</div>
            ) : orders.length === 0 ? (
              <div className="bg-creamCard p-8 text-center rounded-2xl border border-divineGold/30 space-y-2 shadow-sm">
                <Package className="w-8 h-8 text-warmMuted mx-auto" />
                <p className="text-xs text-warmMuted font-medium">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
