import React, { useState } from 'react';
import { CreditCard, Calendar, Sparkles, Search, Filter, Trash2, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateAdminWhatsAppLink } from '../../../backend/whatsapp';

export default function PaymentsOverview({ orders = [], onRefresh }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Extract unique available months from orders list (e.g. "August 2026", "July 2026")
  const getOrderMonth = (o) => {
    const rawDate = o.createdAt || o.created_at || o.deliveryDate || o.delivery_date;
    if (!rawDate) return null;
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? null : d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const availableMonths = Array.from(
    new Set(orders.map(getOrderMonth).filter(Boolean))
  );

  // Normalize payment status: 'paid' | 'partially_paid' | 'pending'
  const getNormalizedPaymentStatus = (o) => {
    const raw = o.payment_status || o.paymentStatus;
    if (raw === 'paid') return 'paid';
    if (raw === 'partially_paid') return 'partially_paid';
    return 'pending'; // All un-marked, COD, and Pay Later orders default to Pending!
  };

  // 1. Filter orders by selected month first
  const monthFilteredOrders = orders.filter((o) => {
    if (selectedMonth === 'all') return true;
    return getOrderMonth(o) === selectedMonth;
  });

  // 2. Compute KPI Stats for the selected month
  const paidOrders = monthFilteredOrders.filter((o) => getNormalizedPaymentStatus(o) === 'paid');
  const partiallyPaidOrders = monthFilteredOrders.filter((o) => getNormalizedPaymentStatus(o) === 'partially_paid');
  const pendingOrders = monthFilteredOrders.filter((o) => getNormalizedPaymentStatus(o) === 'pending');

  const totalCollectedInMonth = monthFilteredOrders.reduce((sum, o) => {
    const status = getNormalizedPaymentStatus(o);
    const total = Number(o.total_amount !== undefined ? o.total_amount : (o.total || 0));
    const advance = Number(o.advance_amount || o.advanceAmount || Math.round(total / 2));
    if (status === 'paid') return sum + total;
    if (status === 'partially_paid') return sum + advance;
    return sum;
  }, 0);

  const totalPendingInMonth = monthFilteredOrders.reduce((sum, o) => {
    const status = getNormalizedPaymentStatus(o);
    const total = Number(o.total_amount !== undefined ? o.total_amount : (o.total || 0));
    const advance = Number(o.advance_amount || o.advanceAmount || Math.round(total / 2));
    if (status === 'paid') return sum;
    if (status === 'partially_paid') return sum + Math.max(0, total - advance);
    return sum + total; // Cash on confirmation & pending orders have full total as pending!
  }, 0);

  // 3. Filter orders by status & search query for table display
  const displayOrders = monthFilteredOrders.filter((o) => {
    const status = getNormalizedPaymentStatus(o);
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (o.customerName || o.customer_name || '').toLowerCase();
      const phone = (o.customerPhone || o.customer_phone || '').toLowerCase();
      const id = (o.id || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || id.includes(q);
    }
    return true;
  });

  const handleMarkPaid = async (orderId) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'paid', remaining_amount: 0 })
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        alert('Failed to update payment status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeletePayment = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete payment record for Order #${orderId}? This cannot be undone.`)) {
      return;
    }
    setDeletingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        alert('Failed to delete payment record');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting payment record');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divineGold/30">
        <div>
          <h2 className="text-base font-serif font-extrabold text-templeRed flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-marigold" /> Monthly Payments & Revenue Overview
          </h2>
          <p className="text-xs text-warmMuted mt-0.5">
            Monitor real-time payment collections, advance deposits, and pending balances by month.
          </p>
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-creamCard border border-divineGold/40 shadow-xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-marigold flex-shrink-0" />
          <span className="text-xs font-bold text-darkBrown">Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-templeRed focus:outline-none cursor-pointer pr-2"
          >
            <option value="all">📅 All Months (Overall)</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                🗓️ {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Month Banner Pill */}
      {selectedMonth !== 'all' && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-marigold/15 via-creamSurface to-marigold/15 border border-divineGold/40 flex items-center justify-between">
          <span className="text-xs font-extrabold text-darkBrown flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-marigold" /> Showing Payment Data for: <span className="text-templeRed font-serif font-black">{selectedMonth}</span>
          </span>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
            Monthly Collected: ₹{totalCollectedInMonth}
          </span>
        </div>
      )}

      {/* KPI Cards (Recalculated for Selected Month) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-creamCard border border-divineGold/35 shadow-sm space-y-1">
          <span className="text-[10px] text-warmMuted font-bold uppercase tracking-wider block">
            {selectedMonth === 'all' ? 'Total Collections' : `${selectedMonth} Revenue`}
          </span>
          <span className="text-lg font-serif font-extrabold text-emerald-700 block">₹{totalCollectedInMonth}</span>
          <span className="text-[10px] text-emerald-800 font-semibold block">Collected in {selectedMonth === 'all' ? 'Total' : selectedMonth}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-creamCard border border-divineGold/35 shadow-sm space-y-1">
          <span className="text-[10px] text-warmMuted font-bold uppercase tracking-wider block">Full Online Paid</span>
          <span className="text-lg font-serif font-extrabold text-emerald-700 block">{paidOrders.length}</span>
          <span className="text-[10px] text-warmMuted font-medium block">100% Paid Orders</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-creamCard border border-divineGold/35 shadow-sm space-y-1">
          <span className="text-[10px] text-warmMuted font-bold uppercase tracking-wider block">Half Advance Paid</span>
          <span className="text-lg font-serif font-extrabold text-marigoldDark block">{partiallyPaidOrders.length}</span>
          <span className="text-[10px] text-warmMuted font-medium block">50% Paid / 50% Due</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-creamCard border border-divineGold/35 shadow-sm space-y-1">
          <span className="text-[10px] text-warmMuted font-bold uppercase tracking-wider block">Pending Due Balance</span>
          <span className="text-lg font-serif font-extrabold text-templeRed block">₹{totalPendingInMonth}</span>
          <span className="text-[10px] text-warmMuted font-medium block">{pendingOrders.length} Orders Pending</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmMuted" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-creamCard text-xs text-darkBrown border border-divineGold/30 focus:outline-none focus:border-marigold"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['all', 'paid', 'partially_paid', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                filterStatus === st
                  ? 'bg-marigold text-creamBg border-divineGold shadow-sm'
                  : 'bg-creamCard text-darkBrown border-divineGold/30 hover:bg-marigold/10'
              }`}
            >
              {st === 'all' && 'All Payments'}
              {st === 'paid' && 'Paid ✓'}
              {st === 'partially_paid' && 'Partially Paid'}
              {st === 'pending' && `Pending (${pendingOrders.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-creamCard rounded-2xl border border-divineGold/35 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-darkBrown">
            <thead className="bg-creamSurface text-[10px] uppercase font-bold text-warmMuted border-b border-divineGold/25">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date & Month</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-right">Remaining Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divineGold/20">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-warmMuted font-medium">
                    No payment records matching selected month/search filters.
                  </td>
                </tr>
              ) : (
                displayOrders.map((ord) => {
                  const payMethod = ord.payment_method || ord.paymentMethod || 'cod';
                  const payStatus = getNormalizedPaymentStatus(ord);
                  const total = Number(ord.total_amount !== undefined ? ord.total_amount : (ord.total || 0));
                  const advance = Number(ord.advance_amount || ord.advanceAmount || (payMethod === 'half_advance' ? Math.round(total / 2) : 0));
                  
                  let remaining = 0;
                  if (payStatus === 'paid') {
                    remaining = 0;
                  } else if (payStatus === 'partially_paid') {
                    remaining = Math.max(0, total - advance);
                  } else {
                    remaining = total; // Pending/COD orders have full total due!
                  }

                  const rawDate = ord.createdAt || ord.created_at || ord.deliveryDate || ord.delivery_date;
                  const dateStr = rawDate ? new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                  const waLink = generateAdminWhatsAppLink(ord);

                  return (
                    <tr key={ord.id} className="hover:bg-creamSurface/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-marigoldDark">
                        #{ord.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-semibold text-warmMuted">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold block">{ord.customerName || ord.customer_name}</span>
                        <span className="text-[10px] text-warmMuted block">{ord.customerPhone || ord.customer_phone}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {payMethod === 'online' && '💳 Pay Online'}
                        {payMethod === 'half_advance' && '⚡ Pay Half Advance'}
                        {payMethod === 'pay_later' && '📱 Pay After Confirmation'}
                        {payMethod === 'cod' && '💵 Cash on Confirmation'}
                      </td>
                      <td className="px-4 py-3">
                        {payStatus === 'paid' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-extrabold text-[10px] border border-emerald-500/30">
                            Paid ✓
                          </span>
                        )}
                        {payStatus === 'partially_paid' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-marigold/15 text-marigoldDark font-extrabold text-[10px] border border-marigold/30">
                            Advance Paid (₹{advance})
                          </span>
                        )}
                        {payStatus === 'pending' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 font-extrabold text-[10px] border border-amber-500/30">
                            Pending ⏳
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-darkBrown">
                        ₹{total}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {remaining > 0 ? (
                          <span className="text-templeRed font-extrabold">₹{remaining}</span>
                        ) : (
                          <span className="text-emerald-700">₹0 (Cleared)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {payStatus !== 'paid' && (
                            <>
                              {/* Direct WhatsApp Payment Link Button */}
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-creamBg text-[10px] font-extrabold flex items-center gap-1 shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                                title="Send WhatsApp Payment Link"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Send Link
                              </a>

                              {/* Quick Mark Paid Button */}
                              <button
                                onClick={() => handleMarkPaid(ord.id)}
                                disabled={updatingId === ord.id}
                                className="px-2 py-1 rounded-xl bg-marigold hover:bg-marigoldDark text-creamBg text-[10px] font-extrabold flex items-center gap-1 shadow-xs whitespace-nowrap"
                                title="Mark Payment Received"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                              </button>
                            </>
                          )}

                          {/* Delete Payment Record */}
                          <button
                            onClick={() => handleDeletePayment(ord.id)}
                            disabled={deletingId === ord.id}
                            className="p-1.5 rounded-xl bg-templeRed/10 hover:bg-templeRed/20 text-templeRed border border-templeRed/30 transition-colors"
                            title="Delete Payment Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
