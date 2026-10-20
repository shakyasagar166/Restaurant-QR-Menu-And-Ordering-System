import React, { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, Filter, Crown, Check, Tag, Search } from 'lucide-react';
import MenuItemCard from './MenuItemCard';
import { CATEGORY_METADATA } from './CategoryCards';

export default function CategoryDetail({
  category,
  categories,
  menuItems = [],
  cart = [],
  onAddToCart,
  onRemoveFromCart,
  onDeleteDish,
  onBackToCategories,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
  onUpdateItemInstructions,
}) {
  const [activeFilterPill, setActiveFilterPill] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'SPECIAL' | 'BUDGET'

  const meta = CATEGORY_METADATA[category] || {
    code: '00',
    title: category,
    shortTitle: category,
    icon: '🍽️',
    subtitle: 'Signature vegetarian culinary preparations',
    badge: 'Specialty',
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // 1. Text Search Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      } else {
        if (item.category !== category) return false;
      }

      // 2. Quick Filter Pill
      if (activeFilterPill === 'IN_STOCK') {
        if (item.isAvailable === false || item.available === false) return false;
      } else if (activeFilterPill === 'SPECIAL') {
        if (!item.tag) return false;
      } else if (activeFilterPill === 'BUDGET') {
        if (item.price > 150) return false;
      }

      return true;
    });
  }, [menuItems, category, searchQuery, activeFilterPill]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full max-w-full overflow-hidden">
      {/* High-Visibility Back Bar (Clean non-sticky to prevent covering dishes on scroll) */}
      <div className="bg-[#faf7f2] py-2 px-2 sm:px-3 mb-3 rounded-2xl border border-amber-300/80 shadow-xs flex items-center justify-between gap-2">
        <button
          onClick={onBackToCategories}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-brand font-black text-white bg-gradient-to-r from-red-800 to-red-950 hover:from-red-900 hover:to-black px-3.5 sm:px-4 py-2 rounded-xl shadow-xs border border-amber-400/50 transition active:scale-95 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>← Back to Categories (वापस जाएं)</span>
        </button>

        <span className="text-[11px] sm:text-xs font-bold text-amber-950 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300 font-brand truncate">
          {filteredItems.length} Dishes
        </span>
      </div>

      {/* High-Visibility Highlighted Dish Search Bar inside Category View */}
      {setSearchQuery && (
        <div className="relative w-full mb-3 group">
          <div
            className={`relative flex items-center bg-white border-2 rounded-2xl transition-all shadow-sm ${
              searchQuery
                ? 'border-red-600 ring-4 ring-red-100 shadow-red-500/15'
                : 'border-amber-400 hover:border-amber-500 ring-2 ring-amber-100/80 focus-within:border-red-600 focus-within:ring-4 focus-within:ring-red-100'
            }`}
          >
            <div className="flex items-center pl-2.5 pr-1.5 py-1.5 shrink-0">
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-[11px] sm:text-xs px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1.5 tracking-wide border border-amber-300">
                <Search className="w-3.5 h-3.5 text-stone-950 stroke-[3]" />
                <span>SEARCH DISH</span>
              </span>
            </div>
            <input
              type="text"
              placeholder={`Search dishes in ${searchQuery ? 'menu' : category} (Paneer, Naan, Dosa)...`}
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-1.5 pr-9 py-2 text-xs sm:text-sm font-bold text-stone-950 placeholder-stone-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-stone-200 hover:bg-rose-500 hover:text-white text-stone-700 flex items-center justify-center text-xs font-black transition cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Horizontal Category Ribbon (Swipeable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 pt-1 border-b border-amber-200">
        {categories.map((cat) => {
          const catMeta = CATEGORY_METADATA[cat];
          const isSelected = cat === category && !searchQuery;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-brand font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-red-800 to-red-950 text-white shadow-md scale-102 border-2 border-amber-400'
                  : 'bg-white text-stone-800 border border-amber-200 hover:border-amber-400 hover:bg-amber-50'
              }`}
            >
              <span className="text-sm">{catMeta ? catMeta.icon : '🍴'}</span>
              <span>{catMeta ? catMeta.shortTitle : cat}</span>
            </button>
          );
        })}
      </div>

      {/* Category Header Card */}
      <div className="my-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-stone-950 via-red-950 to-stone-950 text-white p-5 sm:p-8 shadow-xl border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start gap-3 sm:gap-4 z-10">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-lg">
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-brand">
                {searchQuery ? 'Search Query' : meta.code ? `Collection ${meta.code}` : meta.badge}
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">100% Pure Veg</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-brand font-black tracking-tight text-white">
              {searchQuery ? `Search Results: "${searchQuery}"` : meta.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
              {searchQuery
                ? 'Showing dishes matching your search query from our rooftop dining menu.'
                : meta.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Taste & Availability Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
        <button
          onClick={() => setActiveFilterPill('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeFilterPill === 'ALL'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <span>All Dishes</span>
          <span className="text-[10px] opacity-75">({menuItems.filter((i) => searchQuery ? true : i.category === category).length})</span>
        </button>

        <button
          onClick={() => setActiveFilterPill('IN_STOCK')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeFilterPill === 'IN_STOCK'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-emerald-50'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Available Now</span>
        </button>

        <button
          onClick={() => setActiveFilterPill('SPECIAL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeFilterPill === 'SPECIAL'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-amber-50'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-300" />
          <span>Chef Specials</span>
        </button>

        <button
          onClick={() => setActiveFilterPill('BUDGET')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeFilterPill === 'BUDGET'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-blue-50'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-blue-300" />
          <span>Under ₹150</span>
        </button>
      </div>

      {/* Dishes Grid (Mobile-First: 1 column on small phones, 2 on sm, 3 on lg) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center my-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            🔍
          </div>
          <h4 className="text-lg font-brand font-bold text-stone-900 mb-1">No dishes found</h4>
          <p className="text-xs text-stone-500 mb-5 max-w-sm mx-auto">
            We couldn't find any dish matching your search in this collection.
          </p>
          <button
            onClick={onBackToCategories}
            className="bg-red-800 hover:bg-red-900 text-white font-brand font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
          >
            ← Back to All Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              cartItem={cart.find((c) => c.id === item.id)}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              onDeleteDish={onDeleteDish}
              onUpdateItemInstructions={onUpdateItemInstructions}
            />
          ))}
        </div>
      )}

      {/* Bottom Back Button for Easy Return */}
      <div className="mt-8 mb-16 text-center">
        <button
          onClick={onBackToCategories}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-stone-900 to-red-950 hover:from-black hover:to-red-900 text-white font-brand font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg border-2 border-amber-400 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>← Back to All Collections (अन्य श्रेणियां देखें)</span>
        </button>
      </div>
    </div>
  );
}
