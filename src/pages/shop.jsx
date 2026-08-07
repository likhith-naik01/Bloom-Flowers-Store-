import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import ProductCard from '../components/customer/ProductCard';
import { useShop } from '../context/ShopContext';
import { Search } from 'lucide-react';

export default function Shop() {
  const { categories, products } = useShop();
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((p) => {
    const catIds = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
    const matchesCat = selectedCat === 'all' || catIds.includes(selectedCat);
    const matchesSearch =
      !search ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameHi && p.nameHi.toLowerCase().includes(search.toLowerCase())) ||
      (p.nameKn && p.nameKn.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>Shop Flower Catalog | Bloom</title>
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-3 flex-1">
          <h1 className="text-xl font-extrabold text-white mb-2">Explore Flower Catalog</h1>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Gulabi, Jasmine, Sevanthige..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-sm text-white placeholder-slate-400 focus:outline-none border border-white/10"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === 'all'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 border border-white/5 hover:bg-slate-700'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCat === cat.id
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-800/80 text-slate-300 border border-white/5 hover:bg-slate-700'
                }`}
              >
                {cat.nameEn}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl border border-white/10">
              <p className="text-sm text-slate-400">No flowers found matching your selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
}
