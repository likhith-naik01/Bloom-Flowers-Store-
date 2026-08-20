import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../frontend/components/layout/Header';
import BottomNav from '../../frontend/components/layout/BottomNav';
import { useAuth } from '../../frontend/context/AuthContext';
import { useShop } from '../../frontend/context/ShopContext';
import OrderStatusBadge from '../../frontend/components/admin/OrderStatusBadge';
import OrderDetailModal from '../../frontend/components/admin/OrderDetailModal';
import ProductFormModal from '../../frontend/components/admin/ProductFormModal';
import CategoryManager from '../../frontend/components/admin/CategoryManager';
import BannerManager from '../../frontend/components/admin/BannerManager';
import CouponManager from '../../frontend/components/admin/CouponManager';
import PaymentLinkManager from '../../frontend/components/admin/PaymentLinkManager';
import PaymentsOverview from '../../frontend/components/admin/PaymentsOverview';
import { getOrderItemDetails } from '../../backend/orderHelper';
import { generateThankYouWhatsAppLink } from '../../backend/whatsapp';
import {
  Inbox,
  CheckCircle,
  Package,
  Image as ImageIcon,
  Layers,
  Plus,
  MessageCircle,
  Eye,
  LogOut,
  Edit2,
  Trash2,
  Sparkles,
  Star,
  Tag,
  CreditCard,
  Link2,
  Menu,
  X,
  Bell,
  Send,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Check,
  Calendar,
  Home
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, logout, loading: authLoading } = useAuth();
  const {
    categories,
    products,
    banners,
    orders,
    refreshData
  } = useShop();

  const [activeSidebarTab, setActiveSidebarTab] = useState('orders');
  const [orderSubTab, setOrderSubTab] = useState('active'); // 'active' | 'completed'
  const [selectedOrderMonth, setSelectedOrderMonth] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [saveToast, setSaveToast] = useState('');
  const [prodSectionFilter, setProdSectionFilter] = useState('all');
  const [prodCatFilter, setProdCatFilter] = useState('all');
  const [adminProdSearch, setAdminProdSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin/login');
    } else if (isAdmin) {
      refreshData();
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading || !isAdmin) {
    return (
      <div className="app-container rangoli-pattern">
        <Header />
        <div className="p-8 text-center text-warmMuted text-xs font-medium">Loading admin portal...</div>
        <BottomNav />
      </div>
    );
  }

  // Filter & Sort Orders By Date & Time (Newest First)
  const getOrderTimestamp = (o) => {
    const rawDate = o.created_at || o.createdAt || o.deliveryDate || o.delivery_date;
    if (!rawDate) return 0;
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const formatOrderDateTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getOrderMonth = (o) => {
    const rawDate = o.createdAt || o.created_at || o.deliveryDate || o.delivery_date;
    if (!rawDate) return null;
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? null : d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const availableOrderMonths = Array.from(
    new Set(orders.map(getOrderMonth).filter(Boolean))
  );

  const monthFilteredOrdersList = orders.filter((o) => {
    if (selectedOrderMonth === 'all') return true;
    return getOrderMonth(o) === selectedOrderMonth;
  });

  const activeOrders = monthFilteredOrdersList
    .filter((o) => !['completed', 'delivered', 'cancelled'].includes(o.status))
    .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

  const completedOrders = monthFilteredOrdersList
    .filter((o) => ['completed', 'delivered', 'cancelled'].includes(o.status))
    .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

  // Handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        refreshData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 4000);
  };

  const handleMarkPaymentPaid = async (orderId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [orderId]: true }));
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'paid', remaining_amount: 0 })
      });
      if (res.ok) {
        refreshData();
        triggerToast(`🎉 Payment marked as RECEIVED for Order #${orderId.slice(0, 8)}!`);
      } else {
        alert('Failed to update payment status.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating payment status: ' + e.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleSendPaymentLinkAndWhatsApp = async (ord, isReminder = false) => {
    try {
      setActionLoading((prev) => ({ ...prev, [ord.id]: true }));
      const payableAmount = ord.remaining_amount !== undefined && ord.remaining_amount !== null
        ? ord.remaining_amount
        : (ord.total || ord.total_amount || 0);

      const res = await fetch('/api/razorpay/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: ord.id,
          amount: payableAmount,
          isReminder
        })
      });

      const data = await res.json();
      if (res.ok && data.whatsappUrl) {
        if (typeof window !== 'undefined') {
          window.open(data.whatsappUrl, '_blank');
        }
      } else {
        alert(data.error || 'Could not generate payment link.');
      }
    } catch (e) {
      console.error(e);
      alert('Error sending payment message: ' + e.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [ord.id]: false }));
    }
  };

  const handleStockToggle = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !product.inStock })
      });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setShowProductForm(false);
        setEditingProduct(null);
        triggerToast('✅ Product saved successfully!');
        await refreshData();
      } else {
        alert(`Failed to save product: ${data.error || 'Database error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error saving product: ' + e.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        triggerToast('🗑️ Product deleted.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBanners = async (bannersData) => {
    try {
      const res = await fetch('/api/banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannersData)
      });
      if (res.ok) {
        await refreshData();
        triggerToast('✅ Promotional Banners updated successfully!');
      } else {
        alert('Failed to update banners.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving banners: ' + e.message);
    }
  };

  const handleAddCategory = async (catData) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      if (res.ok) {
        await refreshData();
        triggerToast('✅ Category circle saved successfully!');
      } else {
        alert('Failed to save category.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving category: ' + e.message);
    }
  };

  const handleEditCategory = async (id, catData) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      if (res.ok) {
        await refreshData();
        triggerToast('✅ Category updated successfully!');
      } else {
        alert('Failed to update category.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating category: ' + e.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        triggerToast('🗑️ Category deleted.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const SIDEBAR_ITEMS = [
    { id: 'orders', label: 'Orders', icon: Inbox, count: activeOrders.length },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'categories', label: 'Add Circle', icon: Layers, count: categories.length },
    { id: 'products', label: 'Add Item', icon: Package, count: products.length },
    { id: 'banners', label: 'Add Banner', icon: ImageIcon, count: banners.length },
    { id: 'promo_banner', label: 'Promo Offer Banner', icon: Sparkles },
    { id: 'coupons', label: 'Add Coupon', icon: Tag },
    { id: 'send_payment_link', label: 'Send Payment Link', icon: Link2 }
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard | Bloom Flower Shop</title>
      </Head>

      <div className="min-h-screen bg-creamBg text-darkBrown font-sans flex flex-col sm:flex-row">
        {/* MOBILE TOP HEADER BAR (with 3-bar hamburger ☰ icon) */}
        <div className="sm:hidden bg-creamCard border-b border-divineGold/35 p-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 rounded-xl bg-marigold/15 text-marigoldDark border border-marigold/30 active:scale-95 transition-all flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
            </button>
            <span className="font-serif font-extrabold text-templeRed text-base tracking-wide">BLOOM ADMIN</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 flex items-center gap-1 font-bold text-xs active:scale-95 transition-all"
              title="Go to Customer Storefront Home"
            >
              <Home className="w-4 h-4" />
              <span className="text-[11px]">Home</span>
            </button>
            <button
              onClick={refreshData}
              className="p-2 rounded-xl bg-creamSurface text-warmMuted hover:text-darkBrown border border-divineGold/30"
              title="Refresh Store Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-templeRed/10 text-templeRed border border-templeRed/30"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BACKDROP OVERLAY FOR MOBILE SIDEBAR */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-darkBrown/60 backdrop-blur-sm sm:hidden transition-opacity"
          />
        )}

        {/* LEFT SIDEBAR (Desktop Fixed & Mobile Drawer) */}
        <aside
          className={`fixed sm:static inset-y-0 left-0 z-40 w-64 bg-creamCard border-r border-divineGold/35 flex flex-col transition-transform duration-200 ease-in-out transform ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-5 border-b border-divineGold/30 flex items-center justify-between">
            <div>
              <h1 className="font-serif font-extrabold text-lg text-templeRed tracking-wide">BLOOM ADMIN</h1>
              <span className="text-[10px] text-marigoldDark font-bold uppercase tracking-wider block">Store Management Portal</span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="sm:hidden p-1.5 rounded-xl bg-creamSurface text-warmMuted hover:text-darkBrown border border-divineGold/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-2 flex-1 overflow-y-auto">
            {/* Quick Home Storefront Button inside Hamburger Menu / Drawer */}
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                router.push('/');
              }}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold flex items-center gap-3 transition-all border text-left bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-creamBg border-emerald-400/40 shadow-sm active:scale-98 mb-3"
            >
              <Home className="w-4 h-4 text-creamBg flex-shrink-0" />
              <span className="truncate">🏠 Customer Storefront Home</span>
            </button>

            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSidebarTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all border text-left active:scale-98 ${
                    isActive
                      ? 'bg-gradient-to-r from-marigold to-templeRed text-creamBg border-divineGold shadow-md shadow-marigold/20'
                      : 'bg-creamSurface text-darkBrown border-divineGold/20 hover:bg-marigold/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-creamBg' : 'text-marigold'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                        isActive ? 'bg-creamBg text-templeRed' : 'bg-marigold/15 text-marigoldDark'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-divineGold/30 space-y-2">
            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-creamBg font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/40 shadow-xs"
            >
              <Home className="w-3.5 h-3.5" /> Customer Storefront Home
            </button>
            <button
              onClick={refreshData}
              className="w-full py-2.5 rounded-xl bg-creamSurface hover:bg-creamCard text-darkBrown font-bold text-xs flex items-center justify-center gap-1.5 border border-divineGold/30"
            >
              <RefreshCw className="w-3.5 h-3.5 text-marigold" /> Refresh Store Data
            </button>
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-templeRed/10 hover:bg-templeRed/20 text-templeRed font-bold text-xs flex items-center justify-center gap-1.5 border border-templeRed/30"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out Admin
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-6xl w-full">
          {saveToast && (
            <div className="fixed bottom-4 right-4 z-50 p-3.5 rounded-2xl bg-emerald-700 text-creamBg text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-500 animate-bounce">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>{saveToast}</span>
            </div>
          )}

          {/* TAB 1: ORDERS */}
          {activeSidebarTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divineGold/30">
                <div>
                  <h2 className="text-lg font-serif font-extrabold text-templeRed flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-marigold" /> Orders Management
                  </h2>
                  <p className="text-xs text-warmMuted mt-0.5">
                    Track live orders, send payment links on WhatsApp, and mark payments received.
                  </p>
                </div>

                {/* Sub-tab & Month Filter Controls */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {/* Month Selector Dropdown */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-creamCard border border-divineGold/35 shadow-xs text-xs font-bold text-darkBrown">
                    <Calendar className="w-3.5 h-3.5 text-marigold flex-shrink-0" />
                    <span>Month:</span>
                    <select
                      value={selectedOrderMonth}
                      onChange={(e) => setSelectedOrderMonth(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-templeRed focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="all">📅 All Months ({orders.length})</option>
                      {availableOrderMonths.map((m) => (
                        <option key={m} value={m}>
                          🗓️ {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-tab Filter Toggle */}
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-creamCard border border-divineGold/30">
                    <button
                      onClick={() => setOrderSubTab('active')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        orderSubTab === 'active'
                          ? 'bg-marigold text-creamBg shadow-sm'
                          : 'text-warmMuted hover:text-darkBrown'
                      }`}
                    >
                      Active Orders ({activeOrders.length})
                    </button>
                    <button
                      onClick={() => setOrderSubTab('completed')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        orderSubTab === 'completed'
                          ? 'bg-marigold text-creamBg shadow-sm'
                          : 'text-warmMuted hover:text-darkBrown'
                      }`}
                    >
                      Completed Orders ({completedOrders.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTIVE ORDERS LIST */}
              {orderSubTab === 'active' && (
                <div className="space-y-4">
                  {activeOrders.length === 0 ? (
                    <div className="text-center py-12 bg-creamCard rounded-2xl border border-divineGold/30 shadow-sm space-y-2">
                      <Inbox className="w-10 h-10 text-warmMuted mx-auto" />
                      <p className="text-xs text-warmMuted font-medium">No active pending orders right now.</p>
                    </div>
                  ) : (
                    activeOrders.map((ord) => {
                      const payMethod = ord.payment_method || ord.paymentMethod || 'cod';
                      const payStatus = ord.payment_status || ord.paymentStatus || 'pending';
                      const isFullyPaid = payStatus === 'paid' || payMethod === 'online';
                      const isPartiallyPaid = payStatus === 'partially_paid';
                      const needsPaymentLink = payMethod === 'pay_later' && !isFullyPaid;

                      const totalAmt = Number(ord.total_amount !== undefined ? ord.total_amount : (ord.total || 0));
                      const advanceAmt = Number(ord.advance_amount || ord.advanceAmount || Math.round(totalAmt / 2));
                      const remainingAmt = Number(ord.remaining_amount || ord.remainingAmount || (totalAmt - (isPartiallyPaid ? advanceAmt : 0)));

                      const orderedAtFormatted = formatOrderDateTime(ord.created_at || ord.createdAt);
                      const rawPaymentDate = ord.payment_date || ord.paymentDate || ord.paid_at || ord.paidAt || (isFullyPaid || isPartiallyPaid ? (ord.updated_at || ord.updatedAt || ord.created_at || ord.createdAt) : null);
                      const paymentAtFormatted = formatOrderDateTime(rawPaymentDate);

                      return (
                        <div key={ord.id} className="bg-creamCard p-5 rounded-3xl border border-divineGold/35 space-y-4 shadow-sm hover:shadow-md transition-all">
                          {/* HEADER BAR: ORDER ID, BADGES, EXACT TIMINGS & STATUS BADGE */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-divineGold/25">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-serif font-extrabold text-base sm:text-lg text-darkBrown">
                                  Order #{ord.id}
                                </span>

                                {/* PAYMENT STATUS BADGE */}
                                {isFullyPaid && (
                                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-extrabold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid ✓
                                  </span>
                                )}

                                {isPartiallyPaid && (
                                  <span className="px-3 py-0.5 rounded-full bg-marigold/15 text-marigoldDark font-extrabold text-[10px] border border-marigold/30 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-marigold" /> 50% Advance Paid (₹{advanceAmt})
                                  </span>
                                )}

                                {!isFullyPaid && !isPartiallyPaid && (
                                  <span className="px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-900 font-extrabold text-[10px] border border-amber-500/30">
                                    Payment Pending ⏳
                                  </span>
                                )}

                                {needsPaymentLink && (
                                  <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-900 font-extrabold text-[10px] border border-purple-500/40 animate-pulse flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-purple-700" /> Needs Link Sent
                                  </span>
                                )}
                              </div>

                              {/* TIMINGS: ORDER PLACEMENT TIME & PAYMENT TIME */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
                                {orderedAtFormatted && (
                                  <span className="flex items-center gap-1.5 text-darkBrown font-semibold bg-creamSurface px-2.5 py-1 rounded-xl border border-divineGold/25 shadow-2xs">
                                    <Calendar className="w-3.5 h-3.5 text-marigold" /> Ordered: <strong className="text-templeRed font-bold">{orderedAtFormatted}</strong>
                                  </span>
                                )}

                                {(isFullyPaid || isPartiallyPaid) && paymentAtFormatted && (
                                  <span className="flex items-center gap-1.5 text-emerald-900 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs">
                                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Payment Done: <strong className="text-emerald-800 font-bold">{paymentAtFormatted}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <OrderStatusBadge
                              status={ord.status}
                              onChangeStatus={(s) => handleUpdateOrderStatus(ord.id, s)}
                            />
                          </div>

                          {/* FORMAL CUSTOMER & DELIVERY INFO GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-darkBrown">
                            <div className="bg-creamSurface p-3.5 rounded-2xl border border-divineGold/25 space-y-1.5">
                              <div className="font-bold text-templeRed flex items-center gap-1.5 border-b border-divineGold/15 pb-1 text-xs">
                                👤 Customer Details
                              </div>
                              <p className="font-semibold text-darkBrown">
                                <strong>Name:</strong> {ord.customerName}
                              </p>
                              <p className="font-semibold text-darkBrown">
                                <strong>Phone:</strong> {ord.customerPhone}
                              </p>
                              <p className="font-semibold text-darkBrown">
                                <strong>Payment Method:</strong> {payMethod === 'online' ? 'Online Payment (Razorpay)' : payMethod === 'half_advance' ? '50% Advance + Balance COD/UPI' : 'Cash on Confirmation (COD)'}
                              </p>
                            </div>

                            <div className="bg-creamSurface p-3.5 rounded-2xl border border-divineGold/25 space-y-1.5">
                              <div className="font-bold text-templeRed flex items-center gap-1.5 border-b border-divineGold/15 pb-1 text-xs">
                                📍 Delivery & Schedule Info
                              </div>
                              <p className="font-semibold text-darkBrown truncate" title={ord.deliveryAddress || ord.customerAddress}>
                                <strong>Address:</strong> {ord.deliveryAddress || ord.customerAddress || 'N/A'}
                              </p>
                              <p className="font-semibold text-darkBrown">
                                <strong>Slot:</strong> {ord.deliveryDate} ({ord.deliveryTimeSlot || 'Morning Delivery'})
                              </p>
                              {ord.orderNote && (
                                <p className="text-marigoldDark italic text-xs font-semibold p-1.5 rounded-lg bg-marigold/10 border border-marigold/20">
                                  📝 Note: "{ord.orderNote}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ORDERED ITEMS LIST */}
                          {Array.isArray(ord.items) && ord.items.length > 0 && (
                            <div className="bg-creamSurface p-3.5 rounded-2xl border border-divineGold/25 space-y-2">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-warmMuted flex items-center justify-between border-b border-divineGold/15 pb-1">
                                <span>Ordered Items ({ord.items.length})</span>
                                <span>Qty & Weight</span>
                              </div>
                              {ord.items.map((it, idx) => {
                                const { img: itemImg, unit: unitDisplay } = getOrderItemDetails(it, products);
                                const itemTotal = (Number(it.price) || 0) * (Number(it.quantity) || 1);

                                return (
                                  <div key={idx} className="flex items-center justify-between gap-3 text-xs text-darkBrown">
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                      <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-creamCard border border-divineGold/30">
                                        {itemImg ? (
                                          <img src={itemImg} alt={it.nameEn || 'Flower'} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-warmMuted text-xs">🌸</div>
                                        )}
                                      </div>
                                      <div className="truncate">
                                        <span className="font-bold text-xs text-darkBrown block truncate">{it.nameEn || it.name}</span>
                                        <span className="text-[10px] text-warmMuted font-semibold">₹{it.price} / {unitDisplay}</span>
                                      </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                      <span className="font-extrabold text-xs text-darkBrown block">x{it.quantity}</span>
                                      <span className="text-[11px] font-bold text-templeRed">₹{itemTotal}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* FINANCIAL SUMMARY & ACTION BUTTONS */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-divineGold/25">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-extrabold text-templeRed">
                                  Total: ₹{totalAmt}
                                </span>
                                {isPartiallyPaid && (
                                  <span className="text-xs font-bold text-emerald-700">
                                    (₹{advanceAmt} Paid | Balance: ₹{remainingAmt})
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-warmMuted font-bold block">
                                Payment Status: <span className="uppercase text-darkBrown">{payStatus}</span> ({payMethod})
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {isFullyPaid ? (
                                <a
                                  href={generateThankYouWhatsAppLink(ord)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-creamBg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  Send Thank You Message 🌸
                                </a>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleMarkPaymentPaid(ord.id)}
                                    disabled={actionLoading[ord.id]}
                                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-creamBg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95 transition-all disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    Mark Payment Received ✓
                                  </button>

                                  <button
                                    onClick={() => handleSendPaymentLinkAndWhatsApp(ord, false)}
                                    disabled={actionLoading[ord.id]}
                                    className="px-3 py-2 rounded-xl bg-marigold hover:bg-marigoldDark text-creamBg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-marigold/20 transition-all disabled:opacity-50"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    Send Link & WhatsApp
                                  </button>

                                  <button
                                    onClick={() => handleSendPaymentLinkAndWhatsApp(ord, true)}
                                    disabled={actionLoading[ord.id]}
                                    className="px-2.5 py-2 rounded-xl bg-marigold/20 hover:bg-marigold/30 text-marigoldDark font-extrabold text-xs flex items-center gap-1 border border-marigold/40"
                                  >
                                    <Bell className="w-3.5 h-3.5" /> Reminder
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-3 py-2 rounded-xl bg-creamSurface hover:bg-marigold/10 text-darkBrown text-xs font-bold flex items-center gap-1 border border-divineGold/30"
                              >
                                <Eye className="w-3.5 h-3.5 text-marigold" /> Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* COMPLETED ORDERS LIST */}
              {orderSubTab === 'completed' && (
                <div className="space-y-4">
                  {completedOrders.length === 0 ? (
                    <div className="text-center py-12 bg-creamCard rounded-2xl border border-divineGold/30 shadow-sm space-y-2">
                      <CheckCircle className="w-10 h-10 text-warmMuted mx-auto" />
                      <p className="text-xs text-warmMuted font-medium">No completed or cancelled orders yet.</p>
                    </div>
                  ) : (
                    completedOrders.map((ord) => {
                      const payMethod = ord.payment_method || ord.paymentMethod || 'cod';
                      const payStatus = ord.payment_status || ord.paymentStatus || 'pending';
                      const isFullyPaid = payStatus === 'paid' || payMethod === 'online';
                      const isPartiallyPaid = payStatus === 'partially_paid';

                      const totalAmt = Number(ord.total_amount !== undefined ? ord.total_amount : (ord.total || 0));
                      const advanceAmt = Number(ord.advance_amount || ord.advanceAmount || Math.round(totalAmt / 2));

                      const orderedAtFormatted = formatOrderDateTime(ord.created_at || ord.createdAt);
                      const rawPaymentDate = ord.payment_date || ord.paymentDate || ord.paid_at || ord.paidAt || (isFullyPaid || isPartiallyPaid ? (ord.updated_at || ord.updatedAt || ord.created_at || ord.createdAt) : null);
                      const paymentAtFormatted = formatOrderDateTime(rawPaymentDate);

                      return (
                        <div key={ord.id} className="bg-creamCard p-4 rounded-3xl border border-divineGold/35 space-y-3 shadow-sm opacity-95">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-divineGold/20">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-darkBrown">Order #{ord.id}</span>
                                {isFullyPaid && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-extrabold text-[9px] border border-emerald-500/30">
                                    Paid ✓
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-warmMuted block font-medium mt-0.5">
                                {ord.customerName} • {ord.customerPhone}
                              </span>
                            </div>

                            <OrderStatusBadge
                              status={ord.status}
                              onChangeStatus={(s) => handleUpdateOrderStatus(ord.id, s)}
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-warmMuted">
                            {orderedAtFormatted && (
                              <span className="flex items-center gap-1 text-darkBrown">
                                🕒 Ordered: <strong>{orderedAtFormatted}</strong>
                              </span>
                            )}
                            {paymentAtFormatted && (
                              <span className="flex items-center gap-1 text-emerald-800">
                                💳 Payment: <strong>{paymentAtFormatted}</strong>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-divineGold/15">
                            <span className="font-extrabold text-templeRed text-sm">Total: ₹{totalAmt}</span>
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-creamSurface text-darkBrown text-xs font-bold flex items-center gap-1 border border-divineGold/30"
                            >
                              <Eye className="w-3.5 h-3.5 text-marigold" /> Details
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAYMENTS */}
          {activeSidebarTab === 'payments' && <PaymentsOverview orders={orders} onRefresh={refreshData} />}

          {/* TAB 3: ADD CIRCLE (CATEGORIES) */}
          {activeSidebarTab === 'categories' && (
            <CategoryManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* TAB 4: ADD ITEM (PRODUCTS) */}
          {activeSidebarTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-divineGold/30">
                <div>
                  <h2 className="text-base font-serif font-extrabold text-templeRed flex items-center gap-2">
                    <Package className="w-5 h-5 text-marigold" /> Store Products Catalog ({products.length})
                  </h2>
                  <p className="text-xs text-warmMuted mt-0.5">Manage flower pricing, stock availability, units, and images.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-marigold/20"
                >
                  <Plus className="w-4 h-4" /> Add Product Item
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-creamCard rounded-2xl border border-divineGold/35 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-darkBrown">
                    <thead className="bg-creamSurface text-[10px] uppercase font-bold text-warmMuted border-b border-divineGold/25">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price / Unit</th>
                        <th className="px-4 py-3">Stock Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divineGold/20">
                      {products.map((p) => {
                        const mainImg = p.imageUrl || (Array.isArray(p.images) && p.images[0]) || '';
                        return (
                          <tr key={p.id} className="hover:bg-creamSurface/60 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-creamSurface border border-divineGold/30 flex-shrink-0">
                                  {mainImg ? (
                                    <img src={mainImg} alt={p.nameEn} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-warmMuted text-xs">🌸</div>
                                  )}
                                </div>
                                <span className="font-bold">{p.nameEn || p.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-warmMuted">
                              {(() => {
                                const pCatIds = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
                                const matchedCats = categories.filter((c) => pCatIds.includes(c.id));
                                if (matchedCats.length > 0) {
                                  return matchedCats.map((c) => c.nameEn || c.name).join(', ');
                                }
                                return p.category || 'Pooja Flowers';
                              })()}
                            </td>
                            <td className="px-4 py-3 font-bold text-templeRed">
                              ₹{p.price} / {p.unit || 'unit'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleStockToggle(p)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                  p.inStock
                                    ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                                    : 'bg-templeRed/15 text-templeRed border-templeRed/30'
                                }`}
                              >
                                {p.inStock ? 'In Stock ✓' : 'Out of Stock ✕'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setShowProductForm(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-creamSurface hover:bg-marigold/10 text-darkBrown border border-divineGold/30"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded-lg bg-templeRed/10 hover:bg-templeRed/20 text-templeRed border border-templeRed/30"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ADD BANNER & PROMO OFFER BANNER */}
          {(activeSidebarTab === 'banners' || activeSidebarTab === 'promo_banner') && (
            <BannerManager banners={banners} categories={categories} onSaveBanners={handleSaveBanners} />
          )}

          {/* TAB 6: ADD COUPON */}
          {activeSidebarTab === 'coupons' && <CouponManager />}

          {/* TAB 7: SEND PAYMENT LINK */}
          {activeSidebarTab === 'send_payment_link' && (
            <PaymentLinkManager orders={orders} />
          )}
        </main>

        {/* MODALS */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}

        {showProductForm && (
          <ProductFormModal
            product={editingProduct}
            categories={categories}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
          />
        )}
      </div>
    </>
  );
}
