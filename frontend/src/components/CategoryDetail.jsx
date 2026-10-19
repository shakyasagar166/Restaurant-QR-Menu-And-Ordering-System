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
    badge: 'Specialty'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Breadcrumb & Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <button
            onClick={onBackToCategories}
            className="flex items-center gap-2 text-xs sm:text-sm font-brand font-black text-stone-900 hover:text-red-800 bg-white hover:bg-amber-50 border-2 border-stone-200 hover:border-amber-400 px-4 py-2 rounded-2xl shadow-sm transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← All Collections</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600 bg-amber-100/70 px-3.5 py-1.5 rounded-xl border border-amber-300 font-brand">
              {filteredItems.length} Dishes in this Collection
            </span>
          </div>
        </div>

        {/* Sticky Horizontal Grand Brand Category Ribbon */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-3 pt-1 border-b border-amber-200">
          {categories.map((cat) => {
            const catMeta = CATEGORY_METADATA[cat];
            const isSelected = cat === category && !searchQuery;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-brand font-bold transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-800 to-red-950 text-white shadow-md shadow-red-950/20 scale-102 border-2 border-amber-400'
                    : 'bg-white text-stone-800 border border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                <span className="text-sm">{catMeta ? catMeta.icon : '🍴'}</span>
                <span>{catMeta ? catMeta.shortTitle : cat}</span>
              </button>
            );
          })}
        </div>

        {/* Grand Brand Showcase Banner */}
        <div className="mt-6 rounded-3xl bg-gradient-to-r from-stone-950 via-red-950 to-stone-950 text-white p-6 sm:p-8 shadow-xl border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-start gap-4 z-10">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 shadow-lg">
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-400/30 font-brand">
                  {searchQuery ? 'Search Query' : meta.code ? `Collection ${meta.code}` : meta.badge}
                </span>
                <span className="text-xs text-emerald-400 font-bold">100% Pure Shuddh Veg</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-brand font-black tracking-tight text-white">
                {searchQuery ? `Search Results for "${searchQuery}"` : meta.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1.5 max-w-2xl leading-relaxed">
                {searchQuery
                  ? 'Showing all items matching your search query across our entire dining menu.'
                  : meta.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center my-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            🔍
          </div>
          <h4 className="text-xl font-brand font-bold text-stone-900 mb-1">
            No dishes found
          </h4>
          <p className="text-xs text-stone-500 mb-5 max-w-sm mx-auto">
            We couldn't find any dish matching your search in this collection.
          </p>
          <button
            onClick={onBackToCategories}
            className="bg-red-800 hover:bg-red-900 text-white font-brand font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition"
          >
            Browse All Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              cartItem={cart.find((c) => c.id === item.id)}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
