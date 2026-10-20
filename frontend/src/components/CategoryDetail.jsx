import React, { useState, useMemo } from 'react';
import { ArrowLeft, Sparkles, Filter, Crown, Check, Tag, Search } from 'lucide-react';
import MenuItemCard from './MenuItemCard';
import { CATEGORY_METADATA } from './CategoryCards';
import { aiFilterDishes } from '../utils/aiSearchEngine';

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

  // AI Smart Fuzzy & Semantic Search Result
  const aiSearchResult = useMemo(() => {
    return aiFilterDishes(menuItems, searchQuery, category);
  }, [menuItems, searchQuery, category]);

  const filteredItems = useMemo(() => {
    return aiSearchResult.items.filter((item) => {
      // Quick Filter Pill
      if (activeFilterPill === 'IN_STOCK') {
        if (item.isAvailable === false || item.available === false) return false;
      } else if (activeFilterPill === 'SPECIAL') {
        if (!item.tag) return false;
      } else if (activeFilterPill === 'BUDGET') {
        if (item.price > 150) return false;
      }

      return true;
    });
  }, [aiSearchResult.items, activeFilterPill]);

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

      {/* Clean & Balanced Dish Search Bar inside Category View */}
      {setSearchQuery && (
        <div className="relative w-full mb-3">
          <div
            className={`relative flex items-center bg-white border rounded-xl transition-all shadow-xs ${
              searchQuery
                ? 'border-red-500 ring-2 ring-red-100'
                : 'border-stone-300 hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200/60'
            }`}
          >
            <div className="flex items-center pl-2.5 pr-1.5 py-1.5 shrink-0">
              <span className="bg-amber-50 text-amber-900 font-bold text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-200/80">
                <Search className="w-3.5 h-3.5 text-amber-700" />
                <span>Search</span>
              </span>
            </div>
            <input
              type="text"
              placeholder={`Search in ${category} (e.g. paner, makni, thali)...`}
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-1.5 pr-9 py-2 text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:outline-none"
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

      {/* 🤖 AI SMART SEARCH RECOGNITION BANNER */}
      {searchQuery && aiSearchResult.isAiCorrected && filteredItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 rounded-2xl p-3.5 mb-3 shadow-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-black text-sm shrink-0 shadow-xs border border-amber-300">
              <Sparkles className="w-4 h-4 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-200/90 border border-amber-300 px-2 py-0.5 rounded font-brand">
                  ✨ AI Auto-Corrected
                </span>
                <span className="text-xs font-bold text-stone-900">
                  Recognized: <strong>"{aiSearchResult.topSuggestion || 'Dish'}"</strong> (from your input <em>"{searchQuery}"</em>)
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-semibold mt-0.5">
                Spelling mistake ko AI ne automatically samajh kar correct menu item dikha diya hai!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSearchQuery && setSearchQuery('')}
            className="text-xs font-bold text-stone-700 hover:text-stone-950 bg-white border border-stone-300 px-2.5 py-1 rounded-xl shadow-2xs shrink-0 cursor-pointer"
          >
            ✕ Clear
          </button>
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
            🤖
          </div>
          <h4 className="text-lg font-brand font-bold text-stone-900 mb-1">
            {searchQuery ? `"${searchQuery}" ke liye koi direct dish nahi mili` : 'No dishes found'}
          </h4>
          <p className="text-xs text-stone-600 mb-4 max-w-sm mx-auto font-medium">
            {searchQuery
              ? 'AI ne check kiya par koi direct match nahi mila. Shayad aap inme se koi dish dhoondh rahe the?'
              : "We couldn't find any dish matching your filter in this collection."}
          </p>

          {/* AI Smart Fallback Suggestions */}
          {aiSearchResult.closestAlternatives && aiSearchResult.closestAlternatives.length > 0 && (
            <div className="mb-6 max-w-md mx-auto">
              <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block mb-2.5 font-brand">
                💡 AI Smart Suggestions (Click to View):
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {aiSearchResult.closestAlternatives.map((alt) => (
                  <button
                    key={alt}
                    type="button"
                    onClick={() => setSearchQuery && setSearchQuery(alt)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black px-3.5 py-2 rounded-xl border border-amber-300 transition cursor-pointer shadow-2xs active:scale-95"
                  >
                    🍽️ {alt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (setSearchQuery) setSearchQuery('');
              onBackToCategories();
            }}
            className="bg-red-800 hover:bg-red-900 text-white font-brand font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            ← Back to All Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
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
