import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '../../context/ShopContext';

export default function CategoryCardGrid({ categories = [] }) {
  const { orders = [] } = useShop();
  const [sortedCategories, setSortedCategories] = useState([]);

  useEffect(() => {
    if (!categories || categories.length === 0) return;

    // 1. Calculate purchase counts from orders ("according to buy")
    const salesMap = {};
    if (Array.isArray(orders)) {
      orders.forEach((ord) => {
        const items = Array.isArray(ord.items) ? ord.items : [];
        items.forEach((item) => {
          const itemCat = (item.category || '').toLowerCase();
          const itemName = (item.nameEn || item.name || '').toLowerCase();

          categories.forEach((cat) => {
            const catId = cat.id;
            const catName = (cat.nameEn || cat.name || '').toLowerCase();
            if (
              itemCat === catId.toLowerCase() ||
              itemCat.includes(catName) ||
              (catName.includes('pooja') && (itemName.includes('pooja') || itemName.includes('loose') || itemName.includes('flower'))) ||
              (catName.includes('garland') && (itemName.includes('garland') || itemName.includes('mala') || itemName.includes('rose'))) ||
              (catName.includes('fruit') && (itemName.includes('fruit') || itemName.includes('leaf') || itemName.includes('leaves') || itemName.includes('mango')))
            ) {
              salesMap[catId] = (salesMap[catId] || 0) + (item.quantity || 1);
            }
          });
        });
      });
    }

    // 2. Read category click counts from localStorage
    let clickMap = {};
    try {
      const stored = localStorage.getItem('bloom_category_clicks');
      if (stored) clickMap = JSON.parse(stored);
    } catch (e) {}

    // 3. Category Default Base Priority Weights (Pooja, Garlands, Fruits & Leaves, Festival Specials)
    const baseWeights = {
      cat_pooja_flowers: 100,
      cat_garlands: 90,
      cat_pooja_leaves: 80,
      cat_exotic: 70,
      cat_loose_flowers: 60,
      cat_combos: 50
    };

    // 4. Compute composite Popularity & Purchase Score
    const scoredCategories = categories.map((cat) => {
      const catId = cat.id;
      const nameLower = (cat.nameEn || cat.name || '').toLowerCase();

      const salesCount = salesMap[catId] || 0;
      const clicks = clickMap[catId] || 0;
      const baseWeight =
        baseWeights[catId] ||
        (nameLower.includes('pooja')
          ? 95
          : nameLower.includes('garland')
          ? 85
          : nameLower.includes('fruit') || nameLower.includes('leaf') || nameLower.includes('leaves')
          ? 75
          : 40);

      // Score Formula: (Sales * 20) + (Clicks * 5) + Base Weight
      const totalScore = salesCount * 20 + clicks * 5 + baseWeight;

      return {
        ...cat,
        score: totalScore,
        salesCount,
        clicks
      };
    });

    // 5. Sort descending by score so highest bought/viewed categories appear in first 4 circles
    scoredCategories.sort((a, b) => b.score - a.score);
    setSortedCategories(scoredCategories);
  }, [categories, orders]);

  const handleCategoryClick = (catId) => {
    try {
      const stored = localStorage.getItem('bloom_category_clicks');
      const clickMap = stored ? JSON.parse(stored) : {};
      clickMap[catId] = (clickMap[catId] || 0) + 1;
      localStorage.setItem('bloom_category_clicks', JSON.stringify(clickMap));
    } catch (e) {}
  };

  const displayCategories = sortedCategories.length > 0 ? sortedCategories : categories;

  return (
    <div className="my-4 bg-creamCard rounded-3xl p-4 border border-divineGold/35 shadow-sm">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {displayCategories.slice(0, 8).map((cat, idx) => {
          const catImg = cat.image || cat.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
          const cleanName = (cat.nameEn || cat.name || '')
            .replace(/^[^\w\s]+/, '')
            .trim();

          const isTop4 = idx < 4;

          return (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center flex-shrink-0 w-20 group relative"
            >
              {/* Circular Warm-Toned Thumbnail */}
              <div
                className={`w-16 h-16 rounded-full p-1 shadow-sm group-hover:scale-105 transition-transform border ${
                  isTop4
                    ? 'bg-gradient-to-tr from-marigold via-divineGold to-templeRed border-divineGold ring-2 ring-marigold/30'
                    : 'bg-gradient-to-tr from-divineGold/40 to-creamSurface border-divineGold/30'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-creamSurface border border-creamBg relative">
                  <img
                    src={catImg}
                    alt={cleanName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Bold Dark Category Label */}
              <span className="text-xs font-bold text-darkBrown group-hover:text-templeRed transition-colors text-center mt-1.5 line-clamp-1">
                {cleanName}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
