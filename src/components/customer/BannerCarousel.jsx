import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BannerCarousel({ banners = [] }) {
  if (!banners || banners.length === 0) return null;
  const current = banners[0];
  const bannerImg = current.imageUrl || current.image_url || '';

  return (
    <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group my-3">
      {bannerImg && (
        <img
          src={bannerImg}
          alt={current.title || 'Banner'}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-4">
        {current.badge && (
          <span className="self-start px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white font-bold text-[10px] uppercase tracking-wider mb-1 shadow-lg">
            {current.badge}
          </span>
        )}
        <h3 className="text-lg font-extrabold text-white leading-tight drop-shadow-md">
          {current.title}
        </h3>
        <p className="text-xs text-slate-200 mt-0.5 line-clamp-1">
          {current.subtitle}
        </p>
        <div className="mt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white font-semibold text-xs hover:bg-white/30 transition-colors"
          >
            Explore Special Offers →
          </Link>
        </div>
      </div>
    </div>
  );
}
