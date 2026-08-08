import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CategoryCardGrid({ categories = [] }) {
  return (
    <div className="my-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <span>🌸</span> Browse by Category / Occasion
          </h2>
          <p className="text-xs text-slate-400">Tap any category to explore items</p>
        </div>
        <Link href="/shop" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center">
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const catImg = cat.image || cat.imageUrl || '';
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group relative rounded-xl overflow-hidden glass-panel border border-white/10 hover:border-rose-500/50 transition-all p-2.5 flex flex-col justify-between h-28"
            >
              {catImg && (
                <img
                  src={catImg}
                  alt={cat.nameEn || cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />

            <div className="relative z-20 flex justify-end">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="relative z-20">
              <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                {cat.nameEn}
              </h3>
              {(cat.nameHi || cat.nameKn) && (
                <span className="text-[10px] text-slate-300 font-medium block opacity-90">
                  {[cat.nameHi, cat.nameKn].filter(Boolean).join(' • ')}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
