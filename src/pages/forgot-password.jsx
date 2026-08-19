import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import { useAuth } from '../frontend/context/AuthContext';
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(email);

      if (res.error) {
        setError(res.error.message || 'Failed to send password reset email.');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | Bloom Flower Shop</title>
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-6 flex-1 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered email address to receive a password reset link
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="p-4 rounded-2xl glass-panel border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h2 className="text-sm font-bold text-white">Check Your Email</h2>
                <p className="text-xs text-slate-300">
                  We've sent a password reset link to <strong className="text-white">{email}</strong>. Please check your inbox and follow the instructions.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:underline pt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-rose-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl glass-panel text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 active:scale-98 transition-all mt-6"
                >
                  {loading ? (
                    'Sending Link...'
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" /> Send Reset Link
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center mt-6 text-xs text-slate-400">
              Remember your password?{' '}
              <Link href="/login" className="text-rose-400 hover:underline font-bold">
                Back to Login
              </Link>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
