import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Store, ShoppingBag, Clock, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { isAdmin } = useAuth();

  // Admin sees Home, Shop, and Admin Control Center
  // Customer sees Home, Shop, Cart, My Orders, Admin Login
  const customerNav = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Store },
    { label: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { label: 'My Orders', path: '/my-orders', icon: Clock },
    { label: 'Admin', path: '/admin/login', icon: ShieldCheck }
  ];

  const adminNav = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Store },
    { label: 'Control Center', path: '/admin/dashboard', icon: ShieldCheck }
  ];

  const navItems = isAdmin ? adminNav : customerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto glass-nav px-3 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = router.pathname === item.path || (item.path.startsWith('/admin') && router.pathname.startsWith('/admin'));

        return (
          <Link
            key={item.label}
            href={item.path}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              isActive
                ? 'text-rose-400 bg-rose-500/10 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {Boolean(item.badge) && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
