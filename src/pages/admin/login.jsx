import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../frontend/components/layout/Header';
import BottomNav from '../../frontend/components/layout/BottomNav';
import { useAuth } from '../../frontend/context/AuthContext';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await login(username, password);
      if (res.success) {
        router.push('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Portal Login | Bloom</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-8 flex-1 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-marigold/15 border border-marigold/40 text-marigoldDark flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-serif font-extrabold text-templeRed">Admin Management Login</h1>
            <p className="text-xs text-warmMuted mt-1 font-medium">Authorized access for shop owner & staff</p>
          </div>

          <div className="bg-creamCard p-5 rounded-3xl border border-divineGold/35 shadow-md">
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-templeRed/10 border border-templeRed/40 text-templeRed text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-darkBrown mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-marigold" /> Admin Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-creamSurface text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-darkBrown mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-marigold" /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-creamSurface text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-marigold/30 active:scale-98 transition-all border border-divineGold/40"
              >
                {submitting ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In to Admin Dashboard <ArrowRight className="w-4 h-4" />
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
