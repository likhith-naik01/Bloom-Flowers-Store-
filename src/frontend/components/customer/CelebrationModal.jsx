import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

export default function CelebrationModal({ couponCode, savedAmount, onClose }) {
  useEffect(() => {
    // Fire confetti cannon!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E8871E', '#B82D2D', '#D4AF37', '#10B981', '#F59E0B']
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E8871E', '#D4AF37', '#B82D2D']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E8871E', '#D4AF37', '#10B981']
        });
      }, 250);
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-darkBrown/65 backdrop-blur-xs transition-opacity animate-fade-in" />

      {/* Celebration Popup */}
      <div className="relative w-full max-w-sm bg-creamBg rounded-3xl p-6 border-2 border-divineGold text-center shadow-2xl z-10 animate-scale-up space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-creamCard text-warmMuted hover:text-darkBrown border border-divineGold/30"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-marigold via-divineGold to-templeRed mx-auto flex items-center justify-center shadow-lg border-2 border-creamBg animate-bounce-short">
          <Sparkles className="w-8 h-8 text-creamBg" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-marigold/20 text-marigoldDark font-extrabold text-[10px] uppercase tracking-widest border border-marigold/40">
            🎉 FESTIVE SAVINGS UNLOCKED!
          </span>
          <h2 className="text-2xl font-serif font-extrabold text-templeRed mt-2">
            You Save ₹{savedAmount}!
          </h2>
          <p className="text-xs text-darkBrown/90 font-bold mt-1">
            Coupon <strong className="text-marigoldDark bg-marigold/10 px-2 py-0.5 rounded border border-marigold/30">{couponCode}</strong> applied successfully!
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Discount applied to your final checkout amount!</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-marigold to-templeRed text-creamBg font-bold text-xs shadow-md shadow-marigold/30 active:scale-98 transition-all"
        >
          Awesome! Continue to Checkout 🛒
        </button>
      </div>
    </div>
  );
}
