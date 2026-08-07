import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Flower2, Search, UserCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { cartCount } = useCart();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-header px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
          <Flower2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 bg-clip-text text-transparent">
            BLOOM
          </span>
          <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
            Flower Shop
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link href="/admin/dashboard" className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Admin
          </Link>
        )}

        <Link href="/shop" className="p-2 rounded-full hover:bg-slate-800/60 text-slate-300 transition-colors">
          <Search className="w-5 h-5" />
        </Link>

        <Link href="/cart" className="relative p-2 rounded-full hover:bg-slate-800/60 text-slate-300 transition-colors">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center animate-bounce shadow-lg shadow-rose-500/50">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
