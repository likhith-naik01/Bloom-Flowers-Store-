import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import { useAuth } from '../frontend/context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { user, loginUser, signInWithGoogle, fetchProfile } = useAuth();
  const { redirectTo } = router.query;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect when user returns from Google OAuth
  useEffect(() => {
    if (user) {
      fetchProfile(user.id).then((profile) => {
        const hasFullName = profile?.full_name && profile.full_name.trim() !== '';
        if (!hasFullName) {
          const nextUrl = redirectTo 
            ? `/signup/complete-profile?redirectTo=${encodeURIComponent(redirectTo)}` 
            : '/signup/complete-profile';
          router.push(nextUrl);
        } else {
          const target = (typeof redirectTo === 'string' && redirectTo.startsWith('/')) 
            ? redirectTo 
            : '/';
          router.push(target);
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(email, password);

      if (res.error) {
        setError(res.error.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      if (res.data?.user) {
        const profile = await fetchProfile(res.data.user.id);

        if (!profile || !profile.full_name || profile.full_name.trim() === '') {
          const nextUrl = redirectTo 
            ? `/signup/complete-profile?redirectTo=${encodeURIComponent(redirectTo)}` 
            : '/signup/complete-profile';
          router.push(nextUrl);
        } else {
          const target = (typeof redirectTo === 'string' && redirectTo.startsWith('/')) 
            ? redirectTo 
            : '/';
          router.push(target);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while logging in. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      const res = await signInWithGoogle();
      if (res?.error) {
        setError(res.error.message || 'Google sign in failed.');
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Google Sign-In failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Bloom Flower Shop</title>
      </Head>

      <div className="app-container rangoli-pattern">
        <Header />

        <main className="px-4 py-6 flex-1 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-serif font-extrabold text-templeRed">Welcome Back</h1>
              <p className="text-xs text-warmMuted mt-1 font-medium">
                Sign in to access your orders, profile & fast checkout
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
                  <Mail className="w-3.5 h-3.5 text-marigold" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-creamCard text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-darkBrown flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-marigold" /> Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-[11px] text-marigoldDark hover:underline font-bold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-creamCard text-sm text-darkBrown placeholder-warmMuted border border-divineGold/40 focus:outline-none focus:border-marigold shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-marigold/30 active:scale-98 transition-all mt-6 border border-divineGold/40"
              >
                {loading ? (
                  'Signing In...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </form>

            {/* OR DIVIDER */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-divineGold/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-creamBg px-3 text-warmMuted font-extrabold text-[10px] tracking-wider">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            {/* GOOGLE SIGN IN BUTTON */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-darkBrown font-bold text-xs flex items-center justify-center gap-3 shadow-md border border-gray-300 active:scale-98 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
            </button>

            <div className="text-center mt-6 text-xs text-warmMuted">
              Don't have an account?{' '}
              <Link 
                href={redirectTo ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : '/signup'}
                className="text-templeRed hover:underline font-bold"
              >
                Sign Up (Step 1)
              </Link>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
