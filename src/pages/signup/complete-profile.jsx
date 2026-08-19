import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../frontend/components/layout/Header';
import BottomNav from '../../frontend/components/layout/BottomNav';
import { useAuth } from '../../frontend/context/AuthContext';
import { createClient } from '../../backend/supabase/client';
import { User, Phone, MapPin, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

export default function CompleteProfile() {
  const router = useRouter();
  const { user, profile, saveProfile, loading: authLoading } = useAuth();
  const { redirectTo } = router.query;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.phone) setPhone(profile.phone);
      if (profile.default_address) setDefaultAddress(profile.default_address);
    }
  }, [user, profile, authLoading, router]);

  const checkPhoneUniqueness = async (inputPhone) => {
    const clean = inputPhone.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setPhoneWarning('');
      return;
    }
    try {
      const supabase = createClient();
      if (supabase && user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, phone')
          .neq('id', user.id)
          .ilike('phone', `%${clean}%`);

        if (data && data.length > 0) {
          setPhoneWarning('This phone number is already registered with another account.');
          return;
        }
      }

      // Check orders fallback
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const ordersData = await res.json();
        if (Array.isArray(ordersData)) {
          const match = ordersData.some((o) => {
            const p = (o.customerPhone || o.customer_phone || '').replace(/\D/g, '');
            return p.length >= 10 && clean.length >= 10 && (p.includes(clean) || clean.includes(p));
          });
          if (match) {
            setPhoneWarning('This phone number has already been used for previous orders.');
            return;
          }
        }
      }
      setPhoneWarning('');
    } catch (e) {
      console.warn('Phone check error:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !phone) {
      setError('Please provide both your full name and phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await saveProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        default_address: defaultAddress.trim()
      });

      if (res.success) {
        const dest = typeof redirectTo === 'string' && redirectTo.startsWith('/') ? redirectTo : '/';
        router.push(dest);
      } else {
        setError(res.error || 'Failed to save profile. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="app-container rangoli-pattern">
        <Header />
        <div className="p-8 text-center text-warmMuted text-xs flex-1 flex items-center justify-center font-medium">
          Loading profile settings...
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Complete Profile | Bloom Flower Shop</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-6 flex-1 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            {/* Step Indicator */}
            <div className="mb-6 flex items-center justify-between text-xs font-semibold">
              <span className="text-warmMuted">Step 1 Complete</span>
              <span className="px-2.5 py-1 rounded-full bg-marigold/15 text-marigoldDark border border-marigold/30 font-bold">
                Step 2 of 2: Profile Info
              </span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-serif font-extrabold text-templeRed">Complete Profile</h1>
              <p className="text-xs text-warmMuted mt-1 font-medium">
                Enter your details so we know where to send your fresh flowers
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-templeRed/10 border border-templeRed/40 text-templeRed text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-templeRed flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-marigold" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-creamCard text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-marigold" /> Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    checkPhoneUniqueness(e.target.value);
                  }}
                  onBlur={(e) => checkPhoneUniqueness(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-creamCard text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                />
                {phoneWarning && (
                  <div className="mt-1.5 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{phoneWarning}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-marigold" /> Default Delivery Address (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="House No, Street, Area, Pincode"
                  value={defaultAddress}
                  onChange={(e) => setDefaultAddress(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-creamCard text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-marigold/30 active:scale-98 transition-all mt-6 border border-divineGold/40"
              >
                {submitting ? (
                  'Saving Details...'
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Save & Start Shopping
                  </>
                )}
              </button>
            </form>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
