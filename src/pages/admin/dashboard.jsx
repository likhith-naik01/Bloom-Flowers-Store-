import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import ProductFormModal from '../../components/admin/ProductFormModal';
import CategoryManager from '../../components/admin/CategoryManager';
import { generateAdminWhatsAppLink } from '../../lib/whatsapp';
import { getOrderItemDetails } from '../../lib/orderHelper';
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
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, logout, loading: authLoading } = useAuth();
  const {
    categories,
    products,
    banners,
    orders,
    refreshData,
    newOrderAlert,
    dismissAlert,
    requestNotificationPermission,
    playOrderChime
  } = useShop();

  const [activeTab, setActiveTab] = useState('orders_active');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [saveToast, setSaveToast] = useState('');
  const [prodSectionFilter, setProdSectionFilter] = useState('all');
  const [prodCatFilter, setProdCatFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading || !isAdmin) {
    return (
      <div className="app-container">
        <Header />
        <div className="p-8 text-center text-slate-400">Loading admin portal...</div>
        <BottomNav />
      </div>
    );
  }

  // Active vs Completed Orders
  const activeOrders = orders.filter((o) => ['new', 'contacted', 'confirmed'].includes(o.status));
  const completedOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

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

  const triggerToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 4000);
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
      if (res.ok) {
        await refreshData();
        setShowProductForm(false);
        setEditingProduct(null);
        triggerToast('✅ Product saved successfully! It is now live on the storefront.');
      } else {
        alert('Failed to save product details. Please try again.');
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
        triggerToast('✅ Promotional Banner updated successfully!');
      } else {
        alert('Failed to update banner wallpaper. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving banner wallpaper: ' + e.message);
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
        triggerToast('✅ Category saved successfully! It is now live for customers.');
      } else {
        alert('Failed to save category. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving category: ' + e.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard | Bloom Shop</title>
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-3 flex-1">
          {/* REAL-TIME NEW ORDER NOTIFICATION ALERT BANNER */}
          {newOrderAlert && (
            <div className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-2xl shadow-rose-600/50 border border-white/20 animate-bounce-short">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1 animate-pulse">
                  🔔 NEW ORDER RECEIVED!
                </span>
                <button
                  onClick={dismissAlert}
                  className="text-white/80 hover:text-white font-bold text-xs"
                >
                  Dismiss ✕
                </button>
              </div>

              <h3 className="text-base font-extrabold mb-1">
                Order #{newOrderAlert.id} • ₹{newOrderAlert.total}
              </h3>
              <p className="text-xs text-rose-100 mb-3">
                Customer: <strong>{newOrderAlert.customerName}</strong> ({newOrderAlert.customerPhone})
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={generateAdminWhatsAppLink(newOrderAlert)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                </a>
                <button
                  onClick={() => {
                    setSelectedOrder(newOrderAlert);
                    dismissAlert();
                  }}
                  className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </div>
            </div>
          )}

          {saveToast && (
            <div className="mb-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs shadow-lg flex items-center justify-between animate-fade-in">
              <span>{saveToast}</span>
            </div>
          )}

          {/* Admin Header & Push Notification Enabler */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <div>
              <h1 className="text-lg font-extrabold text-white">Admin Control Center</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-400">Shop Catalog & Orders</span>
                <button
                  onClick={() => {
                    requestNotificationPermission();
                    playOrderChime();
                    alert('Audio chime test sound played! Live notifications enabled.');
                  }}
                  className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold hover:bg-rose-500/30 transition-colors"
                >
                  🔔 Enable Audio & Push Alerts
                </button>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-white/10"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>

          {/* Navigation Tabs (Ordered exactly matching Homepage layout) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
            <button
              onClick={() => setActiveTab('orders_active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'orders_active'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 border border-white/5'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" /> Active Orders ({activeOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('orders_completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'orders_completed'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 border border-white/5'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Completed ({completedOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('banner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'banner'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 border border-white/5'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> 1. Special Offers Banner
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 border border-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 2. Categories Grid
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 border border-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> 3. Products Catalog
            </button>
          </div>

          {/* TAB 1: Active Orders */}
          {activeTab === 'orders_active' && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-300">Incoming Active Orders ({activeOrders.length})</h2>
              {activeOrders.length === 0 ? (
                <div className="text-center py-10 glass-panel rounded-2xl border border-white/10">
                  <p className="text-sm text-slate-400">No active pending orders right now.</p>
                </div>
              ) : (
                activeOrders.map((ord) => {
                  const waLink = generateAdminWhatsAppLink(ord);
                  return (
                    <div key={ord.id} className="glass-panel p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div>
                          <span className="font-extrabold text-sm text-white">Order #{ord.id}</span>
                          <span className="text-[10px] text-slate-400 block">{ord.customerName} • {ord.customerPhone}</span>
                        </div>
                        <OrderStatusBadge
                          status={ord.status}
                          onChangeStatus={(s) => handleUpdateOrderStatus(ord.id, s)}
                        />
                      </div>

                      <div className="text-xs text-slate-300">
                        <p>📍 {ord.deliveryAddress}</p>
                        <p>📅 {ord.deliveryDate} ({ord.deliveryTimeSlot})</p>
                        {ord.orderNote && <p className="text-amber-300 italic text-[11px] mt-1">Note: "{ord.orderNote}"</p>}
                      </div>

                      {/* Ordered Flower Items Preview */}
                      {Array.isArray(ord.items) && ord.items.length > 0 && (
                        <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5 space-y-1.5 my-2">
                          {ord.items.map((it, idx) => {
                            const { img: itemImg, unit: unitDisplay } = getOrderItemDetails(it, products);

                            return (
                              <div key={idx} className="flex items-center gap-2 text-xs text-white">
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 border border-white/10">
                                  {itemImg ? (
                                    <img src={itemImg} alt={it.nameEn || 'Flower'} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">🌸</div>
                                  )}
                                </div>
                                <span className="font-semibold text-xs flex-1 truncate">{it.nameEn || it.name}</span>
                                <span className="text-[11px] text-slate-400 font-bold">
                                  x{it.quantity} ({unitDisplay})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-sm font-extrabold text-rose-400">Total: ₹{ord.total}</span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-white/10"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>

                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Completed Orders */}
          {activeTab === 'orders_completed' && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-300">Delivered & Cancelled Orders ({completedOrders.length})</h2>
              {completedOrders.length === 0 ? (
                <div className="text-center py-10 glass-panel rounded-2xl border border-white/10">
                  <p className="text-sm text-slate-400">No completed orders yet.</p>
                </div>
              ) : (
                completedOrders.map((ord) => (
                  <div key={ord.id} className="glass-panel p-3 rounded-2xl border border-white/10 opacity-90">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div>
                        <span className="font-bold text-sm text-white">Order #{ord.id}</span>
                        <span className="text-[10px] text-slate-400 block">{ord.customerName} ({ord.customerPhone})</span>
                      </div>
                      <OrderStatusBadge
                        status={ord.status}
                        onChangeStatus={(s) => handleUpdateOrderStatus(ord.id, s)}
                      />
                    </div>

                    {/* Ordered Flower Items Preview */}
                    {Array.isArray(ord.items) && ord.items.length > 0 && (
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5 space-y-1.5 my-2">
                        {ord.items.map((it, idx) => {
                          const { img: itemImg, unit: unitDisplay } = getOrderItemDetails(it, products);

                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs text-white">
                              <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 border border-white/10">
                                {itemImg ? (
                                  <img src={itemImg} alt={it.nameEn || 'Flower'} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">🌸</div>
                                )}
                              </div>
                              <span className="font-semibold text-xs flex-1 truncate">{it.nameEn || it.name}</span>
                              <span className="text-[11px] text-slate-400 font-bold">
                                x{it.quantity} ({unitDisplay})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
                      <span>Delivered on {ord.deliveryDate}</span>
                      <span className="font-extrabold text-emerald-400">₹{ord.total}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Products & Stock Control */}
          {activeTab === 'products' && (() => {
            const displayedProducts = products.filter((p) => {
              const pCatIds = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
              const isDiscounted = (Number(p.discountValue) > 0 || (p.discountType && p.discountType !== 'none'));
              
              const matchesSection =
                prodSectionFilter === 'all'
                  ? true
                  : prodSectionFilter === 'regular'
                  ? !isDiscounted
                  : isDiscounted;
                  
              const matchesCat = prodCatFilter === 'all' || pCatIds.includes(prodCatFilter);
              return matchesSection && matchesCat;
            });

            const regularCount = products.filter(p => p.discountType === 'none' || !Number(p.discountValue)).length;
            const specialCount = products.filter(p => p.discountType !== 'none' && Number(p.discountValue) > 0).length;

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-sm font-bold text-slate-200">Manage Catalog & Products</h2>
                    <p className="text-[11px] text-slate-400">Filter by section or category to manage regular vs special items</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>

                {/* Section & Category Filters */}
                <div className="space-y-2 glass-panel p-2.5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setProdSectionFilter('all')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        prodSectionFilter === 'all'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-800/80 text-slate-400 border border-white/5 hover:bg-slate-700'
                      }`}
                    >
                      All Products ({products.length})
                    </button>
                    <button
                      onClick={() => setProdSectionFilter('regular')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        prodSectionFilter === 'regular'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-800/80 text-slate-400 border border-white/5 hover:bg-slate-700'
                      }`}
                    >
                      📦 Regular Catalog ({regularCount})
                    </button>
                    <button
                      onClick={() => setProdSectionFilter('special')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        prodSectionFilter === 'special'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-800/80 text-slate-400 border border-white/5 hover:bg-slate-700'
                      }`}
                    >
                      🏷️ Special Discounts ({specialCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-white/10 text-xs">
                    <span className="font-bold text-slate-400 text-[11px] whitespace-nowrap">Filter by Category:</span>
                    <select
                      value={prodCatFilter}
                      onChange={(e) => setProdCatFilter(e.target.value)}
                      className="flex-1 bg-slate-800 text-white rounded-lg p-1.5 border border-white/10 text-xs focus:outline-none"
                    >
                      <option value="all">All Categories ({categories.length})</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Product Cards List */}
                {displayedProducts.length === 0 ? (
                  <div className="text-center py-10 glass-panel rounded-2xl border border-white/10">
                    <p className="text-sm text-slate-400">No products found matching selected filters.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {displayedProducts.map((p) => {
                      const prodImg = p.imageUrl || (Array.isArray(p.images) && p.images[0]) || p.image || '';
                      const pCatIds = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
                      const assignedCats = categories.filter((c) => pCatIds.includes(c.id));
                      const isSpecial = p.discountType !== 'none' && Number(p.discountValue) > 0;

                      return (
                        <div
                          key={p.id}
                          className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-3"
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 border border-white/10">
                            {prodImg ? (
                              <img src={prodImg} alt={p.nameEn || p.name} className={`w-full h-full object-cover ${!p.inStock ? 'grayscale opacity-60' : ''}`} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-lg">🌸</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <h3 className="font-bold text-sm text-white truncate">{p.nameEn}</h3>
                              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold ${
                                isSpecial ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700/60 text-slate-300'
                              }`}>
                                {isSpecial ? '🏷️ Special Offer' : '📦 Regular'}
                              </span>
                            </div>

                            <p className="text-[11px] text-rose-300 font-semibold">
                              ₹{p.price} / {p.unit}
                              {isSpecial && (
                                <span className="text-amber-400 font-bold ml-1">
                                  ({p.discountType === 'percent' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`})
                                </span>
                              )}
                            </p>

                            {/* Category Badges */}
                            {assignedCats.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-1">
                                {assignedCats.map((c) => (
                                  <span key={c.id} className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[9px] font-bold text-rose-300 border border-rose-500/20">
                                    {c.nameEn}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Stock Toggle Button */}
                            <button
                              onClick={() => handleStockToggle(p)}
                              className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                p.inStock
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-red-950/80 text-red-300 border-red-500/40'
                              }`}
                            >
                              {p.inStock ? '✅ In Stock' : '⚠️ Sold Out'}
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setShowProductForm(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 4: Wallpaper Manager */}
          {activeTab === 'banner' && (
            <BannerManager banners={banners} onSaveBanners={handleSaveBanners} />
          )}

          {/* TAB 5: Categories Manager */}
          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* Modals */}
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
        </main>

        <BottomNav />
      </div>
    </>
  );
}
