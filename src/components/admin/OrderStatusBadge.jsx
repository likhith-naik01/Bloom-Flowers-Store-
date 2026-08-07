import React from 'react';

export default function OrderStatusBadge({ status, onChangeStatus }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'contacted':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'confirmed':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => onChangeStatus(e.target.value)}
      className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-slate-900 focus:outline-none cursor-pointer ${getBadgeStyle()}`}
    >
      <option value="new">🆕 New Order</option>
      <option value="contacted">💬 Contacted</option>
      <option value="confirmed">✅ Confirmed</option>
      <option value="delivered">🚚 Delivered (Completed)</option>
      <option value="cancelled">❌ Cancelled</option>
    </select>
  );
}
