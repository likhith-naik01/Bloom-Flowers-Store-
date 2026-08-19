import React, { useState } from 'react';
import Link from 'next/link';

export default function BannerCarousel({ banners = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeBanners = Array.isArray(banners) ? banners : [];
  if (!safeBanners || safeBanners.length === 0) return null;

  const current = safeBanners[activeIndex] || safeBanners[0];
  const discountText = current?.badgeText || current?.badge || 'UP TO 70% OFF';
  const bannerImage = current?.imageUrl || current?.image_url || '';
  const targetLink = current?.categoryId
    ? `/category/${current.categoryId}`
    : (current?.targetUrl || '/shop');

  if (bannerImage) {
    return (
      <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-divineGold/40 my-3 bg-darkBrown">
        <Link href={targetLink} className="block relative w-full min-h-[160px] max-h-[260px] overflow-hidden group">
          <img
            src={bannerImage}
            alt={current?.title || 'Banner'}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />

          {/* Floating Action Badge Overlay */}
          <div className="absolute bottom-3 right-3 z-10 px-4 py-1.5 rounded-full bg-gradient-to-r from-marigold to-divineGold text-darkBrown font-extrabold text-xs shadow-lg border border-creamBg/40 flex items-center gap-1">
            SHOP NOW ➔
          </div>
        </Link>

        {/* Bottom Center Carousel Dot Indicators */}
        {safeBanners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-full bg-darkBrown/60 backdrop-blur-xs">
            {safeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all rounded-full ${
                  idx === activeIndex
                    ? 'w-5 h-1.5 bg-divineGold'
                    : 'w-1.5 h-1.5 bg-creamBg/60 hover:bg-creamBg'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-divineGold/40 my-3 bg-gradient-to-r from-templeRed via-templeRedDark to-darkBrown p-4 text-creamBg">
      {/* Decorative Marigold Garland Borders on Left and Right Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 opacity-40 pointer-events-none bg-repeat-y bg-contain z-1" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"48\" viewBox=\"0 0 24 48\"><circle cx=\"12\" cy=\"12\" r=\"8\" fill=\"%23E8871E\"/><circle cx=\"12\" cy=\"12\" r=\"4\" fill=\"%23D4AF37\"/><circle cx=\"12\" cy=\"36\" r=\"8\" fill=\"%23B82D2D\"/><circle cx=\"12\" cy=\"36\" r=\"4\" fill=\"%23E8871E\"/></svg>')" }}></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 opacity-40 pointer-events-none bg-repeat-y bg-contain z-1" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"48\" viewBox=\"0 0 24 48\"><circle cx=\"12\" cy=\"12\" r=\"8\" fill=\"%23E8871E\"/><circle cx=\"12\" cy=\"12\" r=\"4\" fill=\"%23D4AF37\"/><circle cx=\"12\" cy=\"36\" r=\"8\" fill=\"%23B82D2D\"/><circle cx=\"12\" cy=\"36\" r=\"4\" fill=\"%23E8871E\"/></svg>')" }}></div>

      <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-1">
        {/* Left Side Content */}
        <div className="flex-1 max-w-[65%] space-y-1.5">
          <span className="text-divineGold text-[11px] font-bold tracking-wider block">
            ॥ शुभ दिन, शुभ फूल ॥
          </span>

          <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-divineGold leading-tight drop-shadow-sm">
            {current?.title || 'Festival Offer'}
          </h2>

          <p className="text-xs text-creamBg/90 line-clamp-2 font-medium leading-snug">
            {current?.subtitle || 'Brighten Every Moment with Fresh Flowers'}
          </p>

          <div className="pt-1">
            <Link
              href={targetLink}
              className="inline-block px-5 py-1.5 rounded-full bg-gradient-to-r from-marigold to-divineGold hover:from-marigoldDark hover:to-divineGold text-darkBrown font-extrabold text-xs shadow-md transition-transform active:scale-95 border border-creamBg/40"
            >
              SHOP NOW
            </Link>
          </div>
        </div>

        {/* Right Side: Scalloped Circular Gold Medallion Badge */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-dashed border-divineGold bg-gradient-to-tr from-templeRed to-marigold p-1 flex flex-col items-center justify-center text-center shadow-xl rotate-3 hover:rotate-0 transition-transform">
            <div className="w-full h-full rounded-full border border-divineGold/60 flex flex-col items-center justify-center p-1 bg-darkBrown/40 backdrop-blur-xs">
              <span className="text-[9px] font-extrabold text-divineGold uppercase tracking-widest block">
                UP TO
              </span>
              <span className="text-lg sm:text-xl font-serif font-extrabold text-creamBg leading-none my-0.5">
                {discountText.replace(/UP TO /i, '')}
              </span>
              <span className="text-[8px] font-extrabold text-divineGold uppercase tracking-widest block">
                OFF
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Center Carousel Dot Indicators */}
      {safeBanners.length > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-1.5 mt-3">
          {safeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`transition-all rounded-full ${
                idx === activeIndex
                  ? 'w-5 h-1.5 bg-divineGold'
                  : 'w-1.5 h-1.5 bg-creamBg/40 hover:bg-creamBg/70'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
