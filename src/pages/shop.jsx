import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import ProductCard from '../frontend/components/customer/ProductCard';
import { useShop } from '../frontend/context/ShopContext';
import { matchProductSearch } from '../backend/orderHelper';
import { Sparkles, Search } from 'lucide-react';

export default function Shop() {
  const router = useRouter();
  const { categories, products } = useShop();
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (router.query.q) {
      setSearch(router.query.q);
    }
    if (router.query.cat) {
      setSelectedCat(router.query.cat);
    }
  }, [router.query]);

  const filteredProducts = products.filter((p) => {
    const catIds = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
    const matchesCat = selectedCat === 'all' || catIds.includes(selectedCat);
    const matchesSearch = matchProductSearch(p, search);
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>Shop Flower Catalog | Bloom</title>
      </Head>

      <div className="app-container rangoli-pattern min-h-screen flex flex-col justify-between">
        <div>
          <Header searchQuery={search} setSearchQuery={setSearch} />

          <main className="px-4 py-3 flex-1">
            <h1 className="text-xl font-serif font-extrabold text-templeRed mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-marigold" /> Explore Flower Catalog
            </h1>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none my-3">
              <button
                onClick={() => setSelectedCat('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCat === 'all'
                    ? 'bg-gradient-to-r from-marigold to-templeRed text-creamBg shadow-md border-divineGold/50'
                    : 'bg-creamCard text-darkBrown border-divineGold/30 hover:bg-marigold/10'
                }`}
              >
                All Items ({products.length})
              </button>
              {categories.map((cat) => {
                const cleanCatName = (cat.nameEn || cat.name || '').replace(/^[^\w\s]+/, '').trim();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCat === cat.id
                        ? 'bg-gradient-to-r from-marigold to-templeRed text-creamBg shadow-md border-divineGold/50'
                        : 'bg-creamCard text-darkBrown border-divineGold/30 hover:bg-marigold/10'
                    }`}
                  >
                    {cleanCatName}
                  </button>
                );
              })}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-creamCard rounded-2xl border border-divineGold/30">
                <p className="text-sm text-warmMuted font-medium">No flowers found matching your selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-16">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
