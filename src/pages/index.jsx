import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../frontend/components/layout/Header';
import BottomNav from '../frontend/components/layout/BottomNav';
import BannerCarousel from '../frontend/components/customer/BannerCarousel';
import CategoryCardGrid from '../frontend/components/customer/CategoryCardGrid';
import ProductCard from '../frontend/components/customer/ProductCard';
import { useShop } from '../frontend/context/ShopContext';
import { matchProductSearch } from '../backend/orderHelper';
import { Sparkles, ChevronRight, Flower2, ShieldCheck, Headphones, ShoppingBag } from 'lucide-react';

const POOJA_TABS = [
  { id: 'flowers', label: '🌸 Loose Flowers', catIds: ['cat_pooja_flowers', 'cat_loose_flowers'], keywords: ['flower', 'marigold', 'rose', 'lotus', 'jasmine', 'sevanthige', 'gulabi'] },
  { id: 'garlands', label: '🌺 Garlands & Maalas', catIds: ['cat_garlands', 'cat_wedding'], keywords: ['garland', 'mala', 'varmala', 'haara'] },
  { id: 'leaves', label: '🌿 Fruits & Leaves', catIds: ['cat_pooja_leaves'], keywords: ['leaf', 'leaves', 'tulasi', 'bel', 'mango', 'fruit', 'grass', 'garike'] },
  { id: 'kits', label: '🎁 Pooja Kits & Samagri', catIds: ['cat_pooja_kits', 'cat_pooja_samagri'], keywords: ['kit', 'samagri', 'agarbathi', 'dhoop', 'camphor', 'chandan', 'kumkum'] }
];

export default function Home() {
  const { categories, products, banners } = useShop();
  const [search, setSearch] = useState('');
  const [activePoojaTab, setActivePoojaTab] = useState('flowers');

  const [promoBanner, setPromoBanner] = useState({
    enabled: true,
    badgeText: 'LIMITED FESTIVAL DEAL',
    couponCode: 'BLOOM10',
    title: 'Get Flat 10% OFF + Free Morning Delivery on Fresh Flowers & Garlands!',
    subtitle: 'Handpicked fresh blooms delivered directly from local flower markets to your doorstep before sunrise.',
    buttonText: 'Claim 10% Offer Now'
  });

  useEffect(() => {
    fetch('/api/promo-banner')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.title) {
          setPromoBanner((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((e) => console.log(e));
  }, []);

  const filteredProducts = search
    ? products.filter((p) => matchProductSearch(p, search))
    : [];

  const getPoojaTabProducts = (tabId) => {
    if (!products || products.length === 0) return [];
    const tabConfig = POOJA_TABS.find((t) => t.id === tabId) || POOJA_TABS[0];

    const matched = products.filter((p) => {
      const pCatIds = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
      const pName = (p.nameEn || p.name || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();

      const catMatch = pCatIds.some((id) => tabConfig.catIds.includes(id));
      const kwMatch = tabConfig.keywords.some((kw) => pName.includes(kw) || pDesc.includes(kw));

      return catMatch || kwMatch;
    });

    if (matched.length >= 4) return matched.slice(0, 6);

    const fallback = [...matched];
    products.forEach((p) => {
      if (fallback.length < 4 && !fallback.some((item) => item.id === p.id)) {
        fallback.push(p);
      }
    });
    return fallback.slice(0, 6);
  };

  // Dynamic Best Sellers Selection (Guarantees 6-8 items covering Garlands, Pooja Flowers, Fruits & Leaves, and Combos)
  const getDynamicBestSellers = () => {
    if (!products || products.length === 0) return [];

    const selectedMap = new Map();

    // 1. First add explicitly marked bestsellers
    products.forEach((p) => {
      if ((p.isBestseller || p.bestsellerCount > 0) && selectedMap.size < 8) {
        selectedMap.set(p.id, { ...p, isBestseller: true });
      }
    });

    // 2. Garlands & Varamalas
    const garlandProducts = products.filter((p) => {
      const cats = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
      const name = (p.nameEn || p.name || '').toLowerCase();
      return cats.includes('cat_garlands') || name.includes('mala') || name.includes('garland') || name.includes('varmala');
    });

    // 3. Fruits & Leaves
    const fruitLeafProducts = products.filter((p) => {
      const cats = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
      const name = (p.nameEn || p.name || '').toLowerCase();
      return cats.includes('cat_pooja_leaves') || name.includes('fruit') || name.includes('leaf') || name.includes('leaves') || name.includes('tulasi') || name.includes('mango');
    });

    // 4. Loose Pooja Flowers
    const looseFlowerProducts = products.filter((p) => {
      const cats = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
      const name = (p.nameEn || p.name || '').toLowerCase();
      return cats.includes('cat_pooja_flowers') || name.includes('marigold') || name.includes('rose') || name.includes('lotus') || name.includes('jasmine') || name.includes('sevanthige');
    });

    // Balance selection across categories up to 6-8 items
    garlandProducts.forEach((p) => {
      if (selectedMap.size < 8 && !selectedMap.has(p.id)) {
        selectedMap.set(p.id, { ...p, isBestseller: true });
      }
    });

    fruitLeafProducts.forEach((p) => {
      if (selectedMap.size < 8 && !selectedMap.has(p.id)) {
        selectedMap.set(p.id, { ...p, isBestseller: true });
      }
    });

    looseFlowerProducts.forEach((p) => {
      if (selectedMap.size < 8 && !selectedMap.has(p.id)) {
        selectedMap.set(p.id, { ...p, isBestseller: true });
      }
    });

    products.forEach((p) => {
      if (selectedMap.size < 8 && !selectedMap.has(p.id)) {
        selectedMap.set(p.id, { ...p, isBestseller: true });
      }
    });

    return Array.from(selectedMap.values());
  };

  const displayedBestSellers = getDynamicBestSellers();

  // Dynamic 4-Section Smart Recommendations (Picks 1 item from 4 different sections: Loose Flowers, Garlands, Leaves/Fruits, Kits)
  const getDynamicFourSectionProducts = () => {
    if (!products || products.length === 0) return [];

    const result = [];

    // Section 1: Loose Flowers
    const flower = products.find((p) => {
      const cats = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
      const name = (p.nameEn || p.name || '').toLowerCase();
      return cats.includes('cat_pooja_flowers') || name.includes('marigold') || name.includes('rose') || name.includes('jasmine');
    });
    if (flower) result.push({ ...flower, sectionLabel: '🌸 Loose Flowers' });

    // Section 2: Garlands & Varamalas
    const garland = products.find((p) => {
      const cats = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
      const name = (p.nameEn || p.name || '').toLowerCase();
      return (cats.includes('cat_garlands') || name.includes('mala') || name.includes('garland')) && !result.some((r) => r.id === p.id);
    });
    if (garland) result.push({ ...garland, sectionLabel: '🌺 Garlands & Varamalas' });

    // Section 3: Fruits & Sacred Leaves
    const leaf = products.find((p) => {
      const cats = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
      const name = (p.nameEn || p.name || '').toLowerCase();
      return (cats.includes('cat_pooja_leaves') || name.includes('fruit') || name.includes('leaf') || name.includes('leaves') || name.includes('tulasi') || name.includes('mango')) && !result.some((r) => r.id === p.id);
    });
    if (leaf) result.push({ ...leaf, sectionLabel: '🌿 Fruits & Leaves' });

    // Section 4: Complete Kits & Samagri
    const kit = products.find((p) => {
      const cats = Array.isArray(p.categoryIds) ? p.categoryIds : (p.categoryId ? [p.categoryId] : []);
      const name = (p.nameEn || p.name || '').toLowerCase();
      return (cats.includes('cat_pooja_kits') || cats.includes('cat_pooja_samagri') || name.includes('kit') || name.includes('samagri') || name.includes('agarbathi')) && !result.some((r) => r.id === p.id);
    });
    if (kit) result.push({ ...kit, sectionLabel: '🎁 Pooja Kits & Samagri' });

    // Fallback if needed to guarantee 4 items
    products.forEach((p) => {
      if (result.length < 4 && !result.some((r) => r.id === p.id)) {
        result.push({ ...p, sectionLabel: '⭐ Essential Pick' });
      }
    });

    return result.slice(0, 4);
  };

  const dynamicFourProducts = getDynamicFourSectionProducts();

  return (
    <>
      <Head>
        <title>Bloom Flower Shop | Flowers For Every Occasion</title>
        <meta name="description" content="Order fresh festive marigolds, jasmine, pooja garlands, and wedding blooms online." />
      </Head>

      <div className="app-container rangoli-pattern min-h-screen flex flex-col justify-between">
        <div>
          {/* HEADER & FULL-WIDTH SEARCH BAR */}
          <Header searchQuery={search} setSearchQuery={setSearch} />

          <main className="px-4 py-2 flex-1">
            {search ? (
              <div className="my-4">
                <h2 className="text-sm font-bold text-darkBrown mb-3">
                  Search Results ({filteredProducts.length})
                </h2>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 bg-creamCard rounded-2xl border border-divineGold/30">
                    <p className="text-sm text-warmMuted font-medium">No flowers found matching "{search}"</p>
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
                {/* 1. HERO BANNER (CAROUSEL) */}
                <BannerCarousel banners={banners} />

                {/* 2. CATEGORY CIRCLES SECTION (8 Categories) */}
                <CategoryCardGrid categories={categories} />

                {/* 3. BEST SELLERS SECTION (2-Column Grid) */}
                <div className="my-5">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-base font-serif font-extrabold text-darkBrown flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-marigold" /> Best Sellers
                    </h2>
                    <Link href="/shop" className="text-xs text-templeRed font-extrabold hover:underline flex items-center gap-0.5">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {displayedBestSellers.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>

                {/* 4. TRUST BADGES ROW (Clean 3-Item Layout) */}
                <div className="my-5 bg-creamCard rounded-2xl p-3 border border-divineGold/30 shadow-sm grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-marigold/15 border border-marigold/30 text-marigoldDark flex items-center justify-center flex-shrink-0">
                      <Flower2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-darkBrown block text-[10px] sm:text-[11px] leading-tight">Fresh Flowers</span>
                      <span className="text-[9px] sm:text-[10px] text-warmMuted block leading-tight">Handpicked Daily</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-divineGold/20 border border-divineGold/40 text-marigoldDark flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-darkBrown block text-[10px] sm:text-[11px] leading-tight">Secure Payments</span>
                      <span className="text-[9px] sm:text-[10px] text-warmMuted block leading-tight">Razorpay & COD</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-marigold/15 border border-marigold/30 text-marigoldDark flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-darkBrown block text-[10px] sm:text-[11px] leading-tight">Quick Support</span>
                      <span className="text-[9px] sm:text-[10px] text-warmMuted block leading-tight">WhatsApp & Call</span>
                    </div>
                  </div>
                </div>

                {/* 5. POOJA ESSENTIALS - 4 DEDICATED SECTIONS (Flowers, Garlands, Fruits/Leaves, Kits) */}
                <div className="my-6 bg-creamCard rounded-3xl p-4 border border-divineGold/35 shadow-sm space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className="text-base font-serif font-extrabold text-templeRed flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-marigold" /> Pooja Essentials
                      </h2>
                      <p className="text-[10px] text-warmMuted font-bold mt-0.5">Select category section below to view items</p>
                    </div>
                    <Link href="/shop" className="text-xs text-templeRed font-extrabold hover:underline flex items-center gap-0.5">
                      Shop All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* 4 Interactive Section Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-divineGold/20">
                    {POOJA_TABS.map((tab) => {
                      const isActive = activePoojaTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActivePoojaTab(tab.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 border ${
                            isActive
                              ? 'bg-gradient-to-r from-marigold to-templeRed text-creamBg border-divineGold shadow-sm font-extrabold scale-102'
                              : 'bg-creamSurface text-darkBrown border-divineGold/30 hover:bg-marigold/10'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Filtered Section Products Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {getPoojaTabProducts(activePoojaTab).map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>

                {/* 6. PROFESSIONAL MARKETING PROMO BANNER (Managed from Admin Center) */}
                {promoBanner && promoBanner.enabled !== false && (
                  <div className="my-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-templeRed via-marigoldDark to-templeRedDark text-creamBg p-5 shadow-lg border border-divineGold/50">
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-divineGold text-darkBrown font-extrabold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-templeRed" /> {promoBanner.badgeText || 'LIMITED FESTIVAL DEAL'}
                        </span>
                        {promoBanner.couponCode && (
                          <span className="text-[11px] text-creamBg/90 font-bold">Use Coupon: {promoBanner.couponCode}</span>
                        )}
                      </div>

                      <h3 className="font-serif font-extrabold text-lg sm:text-xl text-creamBg leading-tight">
                        {promoBanner.title}
                      </h3>
                      <p className="text-xs text-creamBg/90 leading-relaxed font-medium">
                        {promoBanner.subtitle}
                      </p>

                      <div className="pt-2 flex items-center gap-3">
                        <Link
                          href="/shop"
                          className="px-4 py-2.5 rounded-xl bg-creamBg hover:bg-creamCard text-templeRed font-extrabold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all border border-divineGold/40"
                        >
                          <ShoppingBag className="w-4 h-4" /> {promoBanner.buttonText || 'Claim Offer Now'}
                        </Link>
                        <span className="text-[11px] text-creamBg/80 font-semibold italic">
                          ⚡ Valid for today's orders
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. DYNAMIC 4-SECTION SMART RECOMMENDATIONS (1 Pick from Each Section) */}
                <div className="my-6 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className="text-base font-serif font-extrabold text-darkBrown flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-marigold" /> Dynamic Top Pick from Each Section
                      </h2>
                      <p className="text-[10px] text-warmMuted font-bold mt-0.5">
                        1 handpicked best item from Flowers, Garlands, Leaves & Kits
                      </p>
                    </div>
                    <Link href="/shop" className="text-xs text-templeRed font-extrabold hover:underline flex items-center gap-0.5">
                      Explore All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {dynamicFourProducts.map((p) => (
                      <div key={p.id} className="relative">
                        <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-darkBrown/85 text-divineGold font-extrabold text-[9px] backdrop-blur-xs border border-divineGold/30 shadow-sm">
                          {p.sectionLabel}
                        </span>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
