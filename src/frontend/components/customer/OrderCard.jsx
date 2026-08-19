import React from 'react';
import Link from 'next/link';
import { ChevronRight, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getOrderItemDetails } from '../../../backend/orderHelper';

export default function OrderCard({ order }) {
  const { products = [] } = useShop();

  const getStatusBadge = (status) => {
    const s = (status || 'placed').toLowerCase();
    switch (s) {
      case 'placed':
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full bg-marigold/15 text-marigoldDark font-extrabold text-[10px] uppercase border border-marigold/30">Placed</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px] uppercase border border-purple-300">Confirmed</span>;
      case 'packed':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase border border-blue-300">Packed</span>;
      case 'out_for_delivery':
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase border border-amber-300">Out for Delivery</span>;
      case 'completed':
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase border border-emerald-300">Completed ✓</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full bg-templeRed/15 text-templeRed font-extrabold text-[10px] uppercase border border-templeRed/30">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-creamSurface text-darkBrown text-[10px] font-bold">{status}</span>;
    }
  };

  const payMethod = order.payment_method || order.paymentMethod || 'cod';
  const isPaid = order.payment_status === 'paid' || payMethod === 'online';

  const shortId = order.id ? `#${order.id.slice(0, 8)}` : '#ORDER';
  const orderDate = order.created_at || order.createdAt 
    ? new Date(order.created_at || order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  const itemsList = Array.isArray(order.items) ? order.items : [];
  const displayItems = itemsList.slice(0, 3);
  const remainingCount = itemsList.length - 3;
  const totalAmount = Number(order.total_amount !== undefined ? order.total_amount : (order.total || 0));
  const advanceAmt = Number(order.advance_amount || order.advanceAmount || Math.round(totalAmount / 2));

  return (
    <Link
      href={`/my-orders/${order.id}`}
      className="block bg-creamCard p-4 rounded-2xl border border-divineGold/35 hover:border-marigold transition-all group shadow-sm hover:shadow-md"
    >
      <div className="flex items-center justify-between pb-3 border-b border-divineGold/20 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-darkBrown group-hover:text-templeRed transition-colors">
              {shortId}
            </span>
            {payMethod === 'online' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px] uppercase border border-emerald-300 flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> Paid Online
              </span>
            )}
            {payMethod === 'half_advance' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px] uppercase border border-emerald-300 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-marigold" /> 50% Advance Paid
              </span>
            )}
            {payMethod === 'cod' && (
              <span className="px-2 py-0.5 rounded-full bg-marigold/15 text-marigoldDark font-extrabold text-[9px] uppercase border border-marigold/30">
                Cash on Confirmation
              </span>
            )}
          </div>
          <span className="text-[10px] text-warmMuted flex items-center gap-1 mt-0.5 font-medium">
            <Calendar className="w-3 h-3 text-marigold" /> {orderDate}
          </span>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Thumbnails + Item count */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {displayItems.map((it, idx) => {
            const { img } = getOrderItemDetails(it, products);
            const imageSrc = img || it.image_url || it.imageUrl;
            return (
              <div
                key={idx}
                className="relative w-10 h-10 rounded-xl overflow-hidden bg-creamSurface border border-divineGold/20 flex-shrink-0"
              >
                {imageSrc ? (
                  <img src={imageSrc} alt="item" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-warmMuted text-xs">🌸</div>
                )}
              </div>
            );
          })}

          {remainingCount > 0 && (
            <div className="w-10 h-10 rounded-xl bg-creamSurface border border-divineGold/30 flex items-center justify-center text-[10px] font-extrabold text-darkBrown">
              +{remainingCount}
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] text-warmMuted block font-medium">
            {payMethod === 'online' && 'Full Paid Online'}
            {payMethod === 'half_advance' && `50% Advance (₹${advanceAmt} Paid)`}
            {payMethod === 'cod' && 'Cash on Confirmation'}
          </span>
          <span className="font-extrabold text-base text-templeRed">
            ₹{totalAmount}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-divineGold/20 flex items-center justify-between text-xs text-warmMuted group-hover:text-darkBrown font-semibold">
        <span className="text-[11px]">View Details & Track Status</span>
        <ChevronRight className="w-4 h-4 text-marigold group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
