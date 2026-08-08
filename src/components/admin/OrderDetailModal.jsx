import { useShop } from '../../context/ShopContext';

export default function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;
  const { products = [] } = useShop();

  const [deliveryCharge, setDeliveryCharge] = useState(order.deliveryCharge !== undefined ? order.deliveryCharge : 0);
  const [isBulkOrder, setIsBulkOrder] = useState(!!order.isBulkOrder);
  const [saving, setSaving] = useState(false);

  const itemsSubtotal = order.items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const finalTotal = isBulkOrder ? itemsSubtotal : (itemsSubtotal + Number(deliveryCharge || 0));

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
        
        // Open WhatsApp deep-link with the updated delivery fee & total
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white">Order #{order.id}</h2>
            <span className="text-[11px] text-slate-400 block">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <OrderStatusBadge
            status={order.status}
            onChangeStatus={(newStatus) => onUpdateStatus(order.id, newStatus)}
          />
        </div>

        {/* Customer & Location Info */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-white">
            <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">👤</span>
            <strong>Customer:</strong> {order.customerName}
          </div>
          <div className="flex items-center gap-2 text-xs text-white">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <strong>Phone:</strong> {order.customerPhone}
          </div>
          <div className="flex items-start gap-2 text-xs text-white">
            <MapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5" />
            <div>
              <strong>Delivery Address:</strong> {order.deliveryAddress}
              <span className="block text-[11px] text-slate-400 mt-0.5">
                📍 Check distance & set delivery charge below.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <strong>Delivery Slot:</strong> {order.deliveryDate} ({order.deliveryTimeSlot})
          </div>
          {order.orderNote && (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs italic">
              📝 <strong>Customer Note:</strong> "{order.orderNote}"
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" /> Ordered Items ({order.items.length})
          </h3>
          <div className="space-y-2">
            {order.items.map((it, idx) => {
              const matchingProd = products.find((p) => p.id === it.id || p.nameEn === it.nameEn);
              const itemImg = it.imageUrl || it.image || (Array.isArray(it.images) && it.images[0]) || matchingProd?.imageUrl || (matchingProd?.images && matchingProd.images[0]) || '';

              return (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-white">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 border border-white/10">
                    {itemImg ? (
                      <img src={itemImg} alt={it.nameEn} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-base">🌸</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-bold block text-white truncate">{it.nameEn}</span>
                    <span className="text-rose-300 block text-[10px]">
                      ₹{it.price} / {it.selectedUnit || it.unit}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-semibold text-slate-300 block text-[11px]">Qty: {it.quantity}</span>
                    <span className="font-extrabold text-white text-xs">₹{it.price * it.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2 mt-2 text-xs text-slate-300">
            <span>Items Subtotal</span>
            <span className="font-bold text-white">₹{itemsSubtotal}</span>
          </div>
        </div>

        {/* Location Delivery Charge & Bulk Order Controls */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3 mb-4">
          <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-400" /> Location Delivery Charge & Bulk Discount
          </label>

          {/* Bulk Order Toggle */}
          <button
            type="button"
            onClick={() => setIsBulkOrder(!isBulkOrder)}
            className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border ${
              isBulkOrder
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60'
                : 'bg-slate-800/80 text-slate-300 border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              {isBulkOrder ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-400" />}
              <span>🎉 Mark as Bulk Order (FREE Delivery Offer)</span>
            </div>
            {isBulkOrder && <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">FREE</span>}
          </button>

          {/* Location Delivery Charge Input */}
          {!isBulkOrder ? (
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Delivery Charge (₹) based on Customer Location:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. 50, 100, 150"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  className="flex-1 p-2 rounded-xl glass-panel text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none"
                />
                <div className="flex gap-1">
                  {[40, 60, 100].map((fee) => (
                    <button
                      type="button"
                      key={fee}
                      onClick={() => setDeliveryCharge(fee)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-white/10"
                    >
                      +₹{fee}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Bulk Order Special: Delivery charge waived! (₹0 Delivery)</span>
            </div>
          )}

          {/* Final Calculated Payable Total */}
          <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-extrabold text-white">
            <span>Final Payable Total (Items + Delivery)</span>
            <span className="text-rose-400 text-lg">₹{finalTotal}</span>
          </div>
        </div>

        {/* Action Button: Save & Send WhatsApp Message */}
        <div className="space-y-2">
          <button
            onClick={handleSaveAndSendWhatsApp}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4" />
            {saving ? 'Saving & Opening WhatsApp...' : `Save Delivery Charge & Send WhatsApp (₹${finalTotal})`}
          </button>

          <p className="text-[10px] text-center text-slate-400">
            Saves delivery fee & final total to database and opens WhatsApp with breakdown for customer!
          </p>
        </div>
      </div>
    </div>
  );
}
