import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { useAuth } from '../../context/AuthContext';
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

      <div className="app-container">
        <Header />

        <main className="px-4 py-8 flex-1 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold text-white">Admin Management Login</h1>
            <p className="text-xs text-slate-400 mt-1">Authorized access for shop owner & staff</p>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-2xl">
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-rose-400" /> Admin Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-panel text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-rose-400" /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-panel text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 active:scale-98 transition-all"
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

            <div className="mt-4 pt-3 border-t border-white/10 text-center">
              <span className="text-[11px] text-slate-400 block">
                Authorized Admins: <strong>admin_1</strong> or <strong>Likhith</strong>
              </span>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
