import React from 'react';

export default function OrderStatusBadge({ status, onChangeStatus }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'new':
      case 'placed':
        return 'bg-amber-500/20 text-amber-800 border-amber-500/40';
      case 'confirmed':
        return 'bg-purple-500/20 text-purple-800 border-purple-500/40';
      case 'packed':
        return 'bg-blue-500/20 text-blue-800 border-blue-500/40';
      case 'out_for_delivery':
        return 'bg-marigold/20 text-marigoldDark border-marigold/40';
      case 'completed':
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-800 border-emerald-500/40';
      case 'cancelled':
        return 'bg-templeRed/15 text-templeRed border-templeRed/40';
      default:
        return 'bg-creamSurface text-darkBrown border-divineGold/30';
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => onChangeStatus(e.target.value)}
      className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider bg-creamCard focus:outline-none cursor-pointer ${getBadgeStyle()}`}
    >
      <option value="placed">🕒 Placed</option>
      <option value="confirmed">✅ Confirmed</option>
      <option value="packed">📦 Packed</option>
      <option value="out_for_delivery">🚚 Out for Delivery</option>
      <option value="completed">🎉 Completed (Full Order & Payment Done)</option>
      <option value="cancelled">❌ Cancelled</option>
    </select>
  );
}
