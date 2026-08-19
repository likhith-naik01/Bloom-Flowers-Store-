import React, { useState } from 'react';
import { Link2, MessageCircle, Send, CheckCircle2, Copy, AlertCircle, Phone, DollarSign, User, Sparkles } from 'lucide-react';

export default function PaymentLinkManager({ orders = [] }) {
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedWhatsapp, setGeneratedWhatsapp] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // When order selection changes, prefill details
  const handleOrderSelect = (e) => {
    const id = e.target.value;
    setSelectedOrderId(id);
    setGeneratedLink('');
    setGeneratedWhatsapp('');

    if (!id) {
      setCustomerName('');
      setCustomerPhone('');
      setAmount('');
      return;
    }

    const order = orders.find((o) => o.id === id);
    if (order) {
      setCustomerName(order.customerName || order.customer_name || '');
      setCustomerPhone(order.customerPhone || order.customer_phone || '');
      const due = order.remaining_amount !== undefined && order.remaining_amount !== null
        ? order.remaining_amount
        : (order.total || order.total_amount || 0);
      setAmount(due);
    }
  };

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!customerPhone) {
      setError('Please enter customer phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/razorpay/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId || `CUSTOM-${Date.now()}`,
          amount: Number(amount),
          isReminder: false
        })
      });

      const data = await res.json();
      if (res.ok && data.paymentLink) {
        setGeneratedLink(data.paymentLink);

        let cleanPhone = String(customerPhone).replace(/\D/g, '').replace(/^0+/, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const msg = `🌸 *BLOOM FLOWER SHOP - PAYMENT LINK* 🌸\n\nHello *${customerName || 'Customer'}*,\n\nHere is your secure payment link for Bloom Flower Shop:\n💰 *Amount Due:* ₹${amount}${note ? `\n📝 *Note:* ${note}` : ''}\n🔗 *Razorpay Payment Link:* ${data.paymentLink}\n\nPlease click to complete payment. Thank you!`;
        setGeneratedWhatsapp(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`);
      } else {
        throw new Error(data.error || 'Failed to generate link');
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Error generating link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-divineGold/30">
        <div>
          <h2 className="text-base font-serif font-extrabold text-templeRed flex items-center gap-2">
            <Link2 className="w-5 h-5 text-marigold" /> Razorpay Payment Link Generator
          </h2>
          <p className="text-xs text-warmMuted mt-0.5">
            Generate instant Razorpay links for unpaid orders or custom quotes & send directly via WhatsApp.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-templeRed/10 border border-templeRed/30 text-templeRed text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Generator Form */}
        <form onSubmit={handleGenerateLink} className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-marigoldDark">
            Link Details
          </h3>

          <div>
            <label className="text-[11px] font-bold text-darkBrown block mb-1">
              Select Unpaid / Pending Order (Optional)
            </label>
            <select
              value={selectedOrderId}
              onChange={handleOrderSelect}
              className="w-full p-2.5 rounded-xl bg-creamSurface text-xs text-darkBrown border border-divineGold/30 focus:outline-none focus:border-marigold"
            >
              <option value="">-- Custom Link (No order pre-selected) --</option>
              {orders.filter(o => o.payment_status !== 'paid').map(o => (
                <option key={o.id} value={o.id}>
                  #{o.id.slice(0, 8)} - {o.customerName} (₹{o.remaining_amount || o.total || 0} due)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown block mb-1">
              Customer Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-warmMuted" />
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-creamSurface text-xs text-darkBrown border border-divineGold/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown block mb-1">
              WhatsApp Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-warmMuted" />
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-creamSurface text-xs text-darkBrown border border-divineGold/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown block mb-1">
              Amount Due (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-warmMuted" />
              <input
                type="number"
                required
                placeholder="Amount in Rupees"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-creamSurface text-xs text-darkBrown font-bold border border-divineGold/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-darkBrown block mb-1">
              Custom Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Remaining 50% balance for Wedding Garland"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 rounded-xl bg-creamSurface text-xs text-darkBrown border border-divineGold/30 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-marigold to-templeRed hover:from-marigoldDark hover:to-templeRedDark text-creamBg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-marigold/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Generating Razorpay Link...' : 'Generate Payment Link & WhatsApp'}
          </button>
        </form>

        {/* Generated Link Result Box */}
        <div className="bg-creamCard p-4 rounded-2xl border border-divineGold/35 space-y-3 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-marigoldDark mb-3">
              Generated Payment Link
            </h3>

            {generatedLink ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 space-y-2">
                  <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
                    Razorpay Link Ready:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="flex-1 p-2 rounded-lg bg-creamSurface font-mono text-xs text-marigoldDark border border-divineGold/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-2 rounded-lg bg-marigold text-creamBg hover:bg-marigoldDark text-xs font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <a
                  href={generatedWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-creamBg font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Open WhatsApp & Send Link (₹{amount})
                </a>
              </div>
            ) : (
              <div className="p-8 text-center text-warmMuted text-xs font-medium space-y-2 border border-dashed border-divineGold/40 rounded-xl">
                <Link2 className="w-8 h-8 text-warmMuted mx-auto" />
                <p>Fill in details on the left and click "Generate Payment Link" to generate link.</p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-marigold/10 border border-marigold/30 text-[11px] text-darkBrown leading-relaxed">
            💡 <strong>Webhook Automatic Tracking:</strong> When the customer pays using this Razorpay link, the system receives a webhook signal and updates order status to <strong className="text-emerald-700">Paid ✓</strong> automatically!
          </div>
        </div>
      </div>
    </div>
  );
}
