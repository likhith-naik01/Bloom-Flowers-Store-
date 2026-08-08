import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import ProductCard from '../../components/customer/ProductCard';
import { useShop } from '../../context/ShopContext';
import { ArrowLeft } from 'lucide-react';

export default function CategoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { categories, products } = useShop();

  const category = categories.find((c) => c.id === id);
  const categoryProducts = products.filter((p) => {
    const catIds = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
    return catIds.includes(id);
  });

  if (!category) {
    return (
      <div className="app-container">
        <Header />
        <div className="p-8 text-center text-slate-400">
          <p>Category not found.</p>
          <Link href="/shop" className="text-rose-400 font-bold text-xs mt-2 inline-block">
            ← Back to Shop
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{category.nameEn} | Bloom Flower Shop</title>
      </Head>

      <div className="app-container">
        <Header />

        <main className="px-4 py-3 flex-1">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Categories
          </Link>

          {/* Banner Header */}
          <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-xl bg-slate-900">
            {(category.image || category.imageUrl) && (
              <img
                src={category.image || category.imageUrl}
                alt={category.nameEn || category.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-4">
              <h1 className="text-xl font-extrabold text-white">{category.nameEn}</h1>
              {(category.nameHi || category.nameKn) && (
                <span className="text-xs text-rose-300 font-semibold">
                  {[category.nameHi, category.nameKn].filter(Boolean).join(' • ')}
                </span>
              )}
              {category.description && (
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{category.description}</p>
              )}
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center justify-between">
            <span>Items in {category.nameEn}</span>
            <span className="text-xs text-slate-500">{categoryProducts.length} Available</span>
          </h2>

          {categoryProducts.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl border border-white/10">
              <p className="text-sm text-slate-400">No products available in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categoryProducts.map((p) => (
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
