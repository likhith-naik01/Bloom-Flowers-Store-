import React, { useState } from 'react';
import { X, MessageCircle, Phone, MapPin, Calendar, ShoppingBag, Truck, Gift, CheckSquare, Square, CreditCard, Banknote, Sparkles, ShieldCheck } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { generateAdminWhatsAppLink } from '../../../backend/whatsapp';
import { useShop } from '../../context/ShopContext';
import { getOrderItemDetails } from '../../../backend/orderHelper';

export default function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;
  const { products = [] } = useShop();

  const [deliveryCharge, setDeliveryCharge] = useState(order.deliveryCharge !== undefined ? order.deliveryCharge : 0);
  const [isBulkOrder, setIsBulkOrder] = useState(!!order.isBulkOrder);
  const [saving, setSaving] = useState(false);

  const itemsSubtotal = (order.items || []).reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const finalTotal = isBulkOrder ? itemsSubtotal : (itemsSubtotal + Number(deliveryCharge || 0));

  const payMethod = order.payment_method || order.paymentMethod || 'cod';
  const payStatus = order.payment_status || order.paymentStatus || 'pending';
  const totalAmount = Number(order.total_amount !== undefined ? order.total_amount : (order.total || 0));
  const advanceAmt = Number(order.advance_amount || order.advanceAmount || Math.round(totalAmount / 2));
  const remainingAmt = Number(order.remaining_amount || order.remainingAmount || (totalAmount - advanceAmt));

  const handleSaveAndSendWhatsApp = async () => {
    setSaving(true);
    try {
      const payload = {
        deliveryCharge: isBulkOrder ? 0 : Number(deliveryCharge || 0),
        isBulkOrder,
        total: finalTotal
      };

      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let updatedOrder = null;
      try {
        const text = await res.text();
        if (text) {
          updatedOrder = JSON.parse(text);
        }
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr);
      }

      if (res.ok && updatedOrder) {
        if (onUpdateStatus) {
          onUpdateStatus(order.id, order.status);
        }
        
        const waUrl = generateAdminWhatsAppLink(updatedOrder, payload.deliveryCharge, isBulkOrder);
        
        if (typeof window !== 'undefined') {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = waUrl;
          } else {
            window.open(waUrl, '_blank');
          }
        }
      } else {
        alert((updatedOrder && updatedOrder.error) || 'Failed to save delivery charge. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving delivery charge: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-creamCard border border-divineGold/40 rounded-3xl overflow-hidden shadow-2xl p-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-creamSurface text-warmMuted hover:text-darkBrown flex items-center justify-center transition-colors border border-divineGold/30"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between pb-3 border-b border-divineGold/25 mb-4">
          <div>
            <h2 className="text-lg font-serif font-extrabold text-templeRed">Order #{order.id}</h2>
            <span className="text-[11px] text-warmMuted block font-medium">{new Date(order.createdAt || order.created_at).toLocaleString()}</span>
          </div>
          <OrderStatusBadge
            status={order.status}
            onChangeStatus={(newStatus) => onUpdateStatus(order.id, newStatus)}
          />
        </div>

        {/* Customer & Location Info */}
        <div className="bg-creamSurface p-3.5 rounded-2xl border border-divineGold/30 space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-darkBrown">
            <span className="w-6 h-6 rounded-lg bg-marigold/15 text-marigoldDark flex items-center justify-center font-bold">👤</span>
            <strong>Customer:</strong> {order.customerName}
          </div>
          <div className="flex items-center gap-2 text-xs text-darkBrown">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <strong>Phone:</strong> {order.customerPhone}
          </div>
          <div className="flex items-start gap-2 text-xs text-darkBrown">
            <MapPin className="w-3.5 h-3.5 text-marigold mt-0.5" />
            <div>
              <strong>Delivery Address:</strong> {order.deliveryAddress}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-darkBrown">
            <Calendar className="w-3.5 h-3.5 text-marigoldDark" />
            <strong>Delivery Slot:</strong> {order.deliveryDate} ({order.deliveryTimeSlot})
          </div>

          {/* Payment Method & Status Breakdown */}
          <div className="pt-2 border-t border-divineGold/20 space-y-1">
            <div className="text-xs font-bold text-darkBrown flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-marigold" /> Payment Info:
            </div>
            {payMethod === 'online' && (
              <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Paid Online (Razorpay) — Full ₹{totalAmount} Paid ✓
              </div>
            )}
            {payMethod === 'half_advance' && (
              <div className="text-xs space-y-0.5">
                <div className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Pay Half Advance
                </div>
                <div className="text-[11px] text-darkBrown font-semibold">
                  Advance Paid: <strong className="text-emerald-700">₹{advanceAmt} ✓</strong> | Balance Due: <strong className="text-templeRed">₹{remainingAmt}</strong> (Cash/UPI/Cheque)
                </div>
              </div>
            )}
            {payMethod === 'cod' && (
              <div className="text-xs text-amber-800 font-bold flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-marigold" /> Cash on Confirmation — ₹{totalAmount} Due on Delivery
              </div>
            )}
          </div>

          {order.orderNote && (
            <div className="p-2 rounded-xl bg-marigold/10 border border-marigold/30 text-darkBrown text-xs italic font-medium mt-2">
              📝 <strong>Customer Note:</strong> "{order.orderNote}"
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warmMuted mb-2 flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-marigold" /> Ordered Items ({order.items.length})
          </h3>
          <div className="space-y-2">
            {order.items.map((it, idx) => {
              const { img: itemImg, unit: unitDisplay } = getOrderItemDetails(it, products);

              return (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-creamSurface border border-divineGold/25 text-xs text-darkBrown">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-creamCard border border-divineGold/30 shadow-sm">
                    {itemImg ? (
                      <img src={itemImg} alt={it.nameEn || 'Flower'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warmMuted text-base">🌸</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-bold block text-darkBrown truncate text-xs">{it.nameEn || it.name}</span>
                    <span className="text-marigoldDark block text-[11px] font-bold">
                      ₹{it.price} / {unitDisplay}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-semibold text-warmMuted block text-[11px]">Qty: {it.quantity}</span>
                    <span className="font-extrabold text-templeRed text-xs">₹{it.price * it.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2 mt-2 text-xs text-darkBrown">
            <span>Items Subtotal</span>
            <span className="font-bold text-darkBrown">₹{itemsSubtotal}</span>
          </div>
        </div>

        {/* Location Delivery Charge & Bulk Order Controls */}
        <div className="p-4 rounded-2xl bg-creamSurface border border-divineGold/35 space-y-3 mb-4">
          <label className="text-xs font-extrabold text-marigoldDark flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-marigold" /> Location Delivery Charge & Bulk Discount
          </label>

          {/* Bulk Order Toggle */}
          <button
            type="button"
            onClick={() => setIsBulkOrder(!isBulkOrder)}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border ${
              isBulkOrder
                ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/40'
                : 'bg-creamCard text-darkBrown border-divineGold/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {isBulkOrder ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-warmMuted" />}
              <span>🎉 Mark as Bulk Order (FREE Delivery Offer)</span>
            </div>
            {isBulkOrder && <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">FREE</span>}
          </button>

          {/* Location Delivery Charge Input */}
          {!isBulkOrder ? (
            <div>
              <label className="text-xs font-bold text-darkBrown mb-1 block">
                Delivery Charge (₹) based on Customer Location:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. 50, 100, 150"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  className="flex-1 p-2 rounded-xl bg-creamCard text-xs text-darkBrown placeholder-warmMuted border border-divineGold/30 focus:outline-none"
                />
                <div className="flex gap-1">
                  {[40, 60, 100].map((fee) => (
                    <button
                      type="button"
                      key={fee}
                      onClick={() => setDeliveryCharge(fee)}
                      className="px-2 py-1 rounded-lg bg-creamCard hover:bg-marigold/10 text-darkBrown text-[11px] font-bold border border-divineGold/30"
                    >
                      +₹{fee}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Bulk Order Special: Delivery charge waived! (₹0 Delivery)</span>
            </div>
          )}

          {/* Final Calculated Payable Total */}
          <div className="flex justify-between items-center pt-2 border-t border-divineGold/20 text-sm font-extrabold text-darkBrown">
            <span>Final Payable Total (Items + Delivery)</span>
            <span className="text-templeRed text-lg">₹{finalTotal}</span>
          </div>
        </div>

        {/* Action Button: Save & Send WhatsApp Message */}
        <div className="space-y-2">
          <button
            onClick={handleSaveAndSendWhatsApp}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-creamBg font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4" />
            {saving ? 'Saving & Opening WhatsApp...' : `Save Delivery Charge & Send WhatsApp (₹${finalTotal})`}
          </button>

          <p className="text-[10px] text-center text-warmMuted font-medium">
            Saves delivery fee & final total to database and opens WhatsApp with breakdown for customer!
          </p>
        </div>
      </div>
    </div>
  );
}
