import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import BannerCarousel from '../components/customer/BannerCarousel';
import CategoryCardGrid from '../components/customer/CategoryCardGrid';
import ProductCard from '../components/customer/ProductCard';
import { useShop } from '../context/ShopContext';
import { matchProductSearch } from '../lib/orderHelper';
import { Search, Sparkles, Tag } from 'lucide-react';

export default function Home() {
  const { categories, products, banners, loading } = useShop();
  const [search, setSearch] = useState('');

  const saleProducts = products.filter(
    (p) => p.inStock && (Number(p.discountValue) > 0 || (p.discountType && p.discountType !== 'none'))
  );

  const filteredProducts = search
    ? products.filter((p) => matchProductSearch(p, search))
    : [];

  return (
    <>
      <Head>
        <title>Bloom Flower Shop | Fresh Flowers & Pooja Items</title>
        <meta name="description" content="Order fresh flowers, pooja blooms, haara garlands, and romantic rose bouquets online." />
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-2 flex-1">
          {/* Instant Search Bar */}
          <div className="relative my-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search flowers by Name or SL No (e.g. SL-1, Jasmine, Chendu)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50 transition-all border border-white/10"
            />
          </div>

          {search ? (
            <div className="my-4">
              <h2 className="text-sm font-bold text-slate-300 mb-3">
                Search Results ({filteredProducts.length})
              </h2>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 glass-panel rounded-2xl">
                  <p className="text-sm text-slate-400">No flowers found matching "{search}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Homepage Promo Wallpaper / Banner */}
              <BannerCarousel banners={banners} />

              {/* Categories Grid */}
              <CategoryCardGrid categories={categories} />

              {/* Today's Special Offers Section */}
              {saleProducts.length > 0 && (
                <div className="my-6">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-rose-400" /> Today's Special Discounts
                    </h2>
                    <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      Limited Deals
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {saleProducts.slice(0, 4).map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Flowers Preview */}
              <div className="my-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Popular Fresh Blooms
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {products.slice(0, 6).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
}
