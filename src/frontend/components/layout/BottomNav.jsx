import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, LayoutGrid, ShoppingCart, Clock, User, LogIn, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { user, isAdmin } = useAuth();

  const customerNav = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Categories', path: '/shop', icon: LayoutGrid },
    { label: 'Cart', path: '/cart', icon: ShoppingCart, badge: cartCount },
    { label: 'My Orders', path: '/my-orders', icon: Clock },
    user 
      ? { label: 'Profile', path: '/profile', icon: User }
      : { label: 'Login', path: '/login', icon: LogIn }
  ];

  const adminNav = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Categories', path: '/shop', icon: LayoutGrid },
    { label: 'Control Center', path: '/admin/dashboard', icon: ShieldCheck }
  ];

  const navItems = isAdmin ? adminNav : customerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto bg-creamCard border-t border-divineGold/35 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = router.pathname === item.path || (item.path !== '/' && item.path.startsWith('/admin') && router.pathname.startsWith('/admin'));

        return (
          <Link
            key={item.label}
            href={item.path}
            className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-templeRed font-extrabold scale-105'
                : 'text-warmMuted hover:text-darkBrown'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-templeRed fill-templeRed/20' : 'text-warmMuted'}`} />
              {Boolean(item.badge) && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-templeRed text-creamBg font-extrabold text-[9px] border border-divineGold/40 shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
