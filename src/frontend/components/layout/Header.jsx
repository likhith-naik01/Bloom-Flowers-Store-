import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  Bell,
  Search,
  SlidersHorizontal,
  UserCheck,
  User,
  LogOut,
  Package,
  LogIn,
  Flower2,
  X,
  HelpCircle,
  ShieldAlert,
  ShoppingBag,
  Home,
  Tag
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Header({ searchQuery, setSearchQuery, onOpenFilter }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { user, profile, isAdmin, logoutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setDrawerOpen(false);
    await logoutUser();
    router.push('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-creamBg px-4 pt-3 pb-3 border-b border-divineGold/30 relative shadow-sm">
        {/* Decorative Top Corner Mandalas */}
        <div className="absolute top-1 left-1 opacity-25 pointer-events-none text-divineGold">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="currentColor">
            <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M0 0 L15 15 M0 0 L22 5 M0 0 L5 22" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
        <div className="absolute top-1 right-1 opacity-25 pointer-events-none text-divineGold transform rotate-90">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="currentColor">
            <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M0 0 L15 15 M0 0 L22 5 M0 0 L5 22" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Top Row Header Navigation */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          {/* Left: Menu Hamburger Icon */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-marigold/10 text-darkBrown transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-darkBrown" />
          </button>

          {/* Center: Centered Lotus Icon & BLOOM Logo */}
          <Link href="/" className="flex flex-col items-center justify-center text-center group">
            <div className="flex items-center gap-1 text-marigold">
              <span className="text-[10px] text-divineGold">❊</span>
              <Flower2 className="w-5 h-5 text-marigold" />
              <span className="text-[10px] text-divineGold">❊</span>
            </div>
            <span className="font-serif font-extrabold text-2xl tracking-wide text-templeRed block leading-tight">
              BLOOM
            </span>
            <div className="flex items-center justify-center gap-1 text-[8px] uppercase tracking-widest font-extrabold text-divineGold mt-0.5">
              <span className="w-3 h-px bg-divineGold/60"></span>
              <span>FLOWERS FOR EVERY OCCASION</span>
              <span className="w-3 h-px bg-divineGold/60"></span>
            </div>
          </Link>

          {/* Right: Notifications & Profile / Admin */}
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <Link href="/admin/dashboard" className="p-1.5 rounded-full bg-marigold/15 border border-marigold/30 text-marigoldDark text-xs font-bold" title="Admin Dashboard">
                <UserCheck className="w-4 h-4" />
              </Link>
            )}

            {/* Notification Bell with Badge Count */}
            <Link href="/my-orders" className="relative p-2 rounded-full hover:bg-marigold/10 text-darkBrown transition-colors">
              <Bell className="w-5 h-5 text-darkBrown" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-templeRed text-creamBg font-extrabold text-[9px] flex items-center justify-center border border-divineGold/40 shadow-sm">
                3
              </span>
            </Link>

            {/* User Account / Login */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-marigold to-templeRed text-creamBg font-extrabold text-xs flex items-center justify-center border border-divineGold/40 shadow-sm"
                >
                  {displayName.charAt(0).toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-creamCard border border-divineGold/40 shadow-xl py-2 z-50 text-xs animate-in fade-in duration-150">
                    <div className="px-3.5 py-2 border-b border-divineGold/20">
                      <p className="font-bold text-darkBrown truncate">{displayName}</p>
                      <p className="text-[10px] text-warmMuted truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-darkBrown hover:bg-marigold/10 transition-colors font-semibold"
                    >
                      <User className="w-3.5 h-3.5 text-marigold" /> My Profile
                    </Link>
                    <Link
                      href="/my-orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-darkBrown hover:bg-marigold/10 transition-colors font-semibold"
                    >
                      <Package className="w-3.5 h-3.5 text-marigold" /> My Orders
                    </Link>
                    <div className="my-1 border-t border-divineGold/20"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-templeRed hover:bg-templeRed/10 transition-colors font-bold text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="p-1.5 rounded-full bg-marigold/15 border border-marigold/30 text-marigoldDark font-bold text-xs"
                title="Sign In"
              >
                <LogIn className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Full-Width Search Bar Below Header */}
        <div className="relative w-full">
          <div className="bg-creamCard border border-divineGold/40 rounded-full px-3.5 py-2.5 flex items-center gap-2.5 shadow-sm focus-within:border-marigold focus-within:ring-2 focus-within:ring-marigold/20 transition-all">
            <Search className="w-4 h-4 text-warmMuted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for flowers, garlands, pooja items..."
              value={searchQuery || ''}
              onChange={(e) => {
                if (setSearchQuery) setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') router.push(`/shop?q=${encodeURIComponent(searchQuery || '')}`);
              }}
              className="w-full text-xs text-darkBrown placeholder-warmMuted bg-transparent focus:outline-none font-medium"
            />
            <button
              onClick={() => {
                if (onOpenFilter) onOpenFilter();
                else router.push('/shop');
              }}
              className="p-1.5 rounded-full bg-creamSurface hover:bg-marigold/15 text-marigoldDark border border-divineGold/30 flex-shrink-0 transition-colors"
              title="Filter Options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* SLIDE-OUT DRAWER MENU */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-darkBrown/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-creamBg h-full shadow-2xl flex flex-col justify-between border-r border-divineGold/40 z-10 animate-slide-in">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-divineGold/30 bg-creamCard flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flower2 className="w-5 h-5 text-marigold" />
                  <div>
                    <h2 className="font-serif font-extrabold text-base text-templeRed leading-tight">BLOOM</h2>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-divineGold">Festive Flower Store</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-creamSurface text-warmMuted hover:text-darkBrown"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-3 space-y-1 text-xs font-bold text-darkBrown">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-marigold/15 transition-all"
                >
                  <Home className="w-4 h-4 text-marigold" /> Home
                </Link>

                <Link
                  href="/shop"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-marigold/15 transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-marigold" /> Shop Catalog
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-marigold/15 transition-all"
                >
                  <User className="w-4 h-4 text-marigold" /> Profile
                </Link>

                <Link
                  href="/my-orders"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-marigold/15 transition-all"
                >
                  <Package className="w-4 h-4 text-marigold" /> My Orders
                </Link>

                <a
                  href="https://wa.me/918310117145?text=Hi%20Bloom%20Flower%20Shop%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-marigold/15 transition-all"
                >
                  <HelpCircle className="w-4 h-4 text-marigold" /> Help & Support (WhatsApp)
                </a>

                <div className="my-2 border-t border-divineGold/20"></div>

                {/* Admin Login Link */}
                <Link
                  href="/admin/login"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-marigold/10 hover:bg-marigold/20 text-marigoldDark border border-marigold/30 transition-all font-bold"
                >
                  <ShieldAlert className="w-4 h-4 text-marigold" /> Admin Control Center
                </Link>
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-divineGold/30 bg-creamCard space-y-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-templeRed/10 hover:bg-templeRed/20 text-templeRed font-bold text-xs flex items-center justify-center gap-2 border border-templeRed/30"
                >
                  <LogOut className="w-4 h-4" /> Logout ({displayName})
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
