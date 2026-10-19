import React from 'react';
import { ArrowLeft, Sparkles, Filter, Crown } from 'lucide-react';
import MenuItemCard from './MenuItemCard';
import { CATEGORY_METADATA } from './CategoryCards';

export default function CategoryDetail({
  category,
  categories,
  menuItems,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onDeleteDish,
  onBackToCategories,
  onSelectCategory,
  searchQuery,
}) {
  const meta = CATEGORY_METADATA[category] || {
    code: '00',
    title: category,
    shortTitle: category,
    icon: '🍽️',
    subtitle: 'Signature vegetarian culinary preparations',
    badge: 'Specialty',
  };

  const filteredItems = menuItems.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return item.category === category;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full max-w-full overflow-hidden">
      {/* Sticky High-Visibility Back Bar */}
      <div className="sticky top-[108px] sm:top-[80px] z-30 bg-[#faf7f2]/95 backdrop-blur-md py-2 px-2 sm:px-3 mb-4 rounded-2xl border border-amber-300/80 shadow-md flex items-center justify-between gap-2">
        <button
          onClick={onBackToCategories}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-brand font-black text-white bg-gradient-to-r from-red-800 to-red-950 hover:from-red-900 hover:to-black px-3.5 sm:px-4 py-2 rounded-xl shadow-xs border border-amber-400/50 transition active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>← Back to Categories (वापस जाएं)</span>
        </button>

        <span className="text-[11px] sm:text-xs font-bold text-amber-950 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300 font-brand truncate">
          {filteredItems.length} Dishes
        </span>
      </div>

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
