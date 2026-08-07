import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, MessageSquare, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, orderNote, setOrderNote, cartTotal, getItemEffectivePrice } = useCart();

  return (
    <>
      <Head>
        <title>Shopping Cart | Bloom</title>
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-3 flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-400" /> Your Cart ({cart.length})
            </h1>

            {cart.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-2xl border border-white/10 my-4">
                <p className="text-sm text-slate-400 mb-4">Your cart is empty.</p>
                <Link
                  href="/shop"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
                >
                  Browse Flowers & Pooja Items
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const effectivePrice = getItemEffectivePrice(item);
                  const itemTotal = effectivePrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-3"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={item.imageUrl} alt={item.nameEn} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-white truncate">{item.nameEn}</h3>
                        <p className="text-[11px] text-rose-300 font-medium">
                          ₹{effectivePrice} / {item.unit}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-slate-900/80 rounded-lg p-0.5 border border-white/10">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded bg-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-bold text-xs text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded bg-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-extrabold text-sm text-white">₹{itemTotal}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* Substitution / Special Instructions Note Box */}
                <div className="mt-5 p-3.5 glass-panel rounded-2xl border border-white/10">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-400" /> Special Instructions / Substitution Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., If red roses aren't available, pink lilies are fine. Please ensure fresh morning blooms."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/80 text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:border-rose-500/50"
                  />
                </div>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-6 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Total Order Amount</span>
                <span className="text-2xl font-extrabold text-rose-400">₹{cartTotal}</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 mb-4 flex items-center justify-between">
                <span>🚚 Delivery Charge:</span>
                <span className="text-amber-300 font-semibold">FREE ONLY FOR BULK ORDERS</span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 active:scale-98 transition-all"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
}
