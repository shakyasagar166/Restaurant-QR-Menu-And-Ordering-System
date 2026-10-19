import React from 'react';
import { Plus, Minus, Sparkles, Crown } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export default function MenuItemCard({ item, cartItem, onAddToCart, onRemoveFromCart }) {
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Dish Photography Stage */}
        <div className="relative h-52 overflow-hidden bg-stone-900">
          <img
            src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out opacity-95 group-hover:opacity-100"
            loading="lazy"
          />

          {/* Gradient overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20"></div>

          {/* 100% Pure Veg FSSAI Symbol */}
          <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md flex items-center justify-center">
            <span className="w-4 h-4 rounded-xs border-2 border-emerald-600 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            </span>
          </div>

          {/* Royal Specialty Ribbon */}
          {item.tag && (
            <div className="absolute top-3.5 right-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black text-[10px] px-3 py-1 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1 font-brand border border-amber-300">
              <Crown className="w-3 h-3 text-stone-950" />
              <span>{item.tag}</span>
            </div>
          )}

          {/* Course category indicator */}
          <div className="absolute bottom-3 left-3.5">
            <span className="text-[10px] font-bold text-amber-200 bg-stone-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/10 uppercase tracking-wider font-brand">
              {item.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <h4 className="font-brand font-black text-stone-900 text-base sm:text-lg leading-snug group-hover:text-red-800 transition duration-200 line-clamp-1">
            {item.name}
          </h4>

          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed mt-2 mb-3 min-h-[34px]">
            {item.description || "Prepared fresh with pure desi ghee, aromatic ground spices & finest ingredients."}
          </p>
        </div>
      </div>

      {/* Footer: Price & Add to Order Pill */}
      <div className="px-5 pb-5 pt-3 border-t border-amber-100 flex items-center justify-between bg-stone-50/50">
        <div>
          <span className="text-[9px] uppercase font-black text-stone-400 block leading-tight font-brand">
            Price
          </span>
          <span className="text-lg font-black text-stone-900 tracking-tight font-sans">
            {formatPrice(item.price)}
          </span>
        </div>

        {/* Add Button or Quantity Counter */}
        {quantity === 0 ? (
          <button
            onClick={() => onAddToCart(item)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-stone-900 text-white font-brand font-black text-xs px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-amber-400/40"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>ADD</span>
          </button>
        ) : (
          <div className="flex items-center bg-gradient-to-r from-red-800 to-red-900 text-white rounded-2xl shadow-md overflow-hidden border border-amber-400/40">
            <button
              onClick={() => onRemoveFromCart(item.id)}
              className="px-3 py-2 hover:bg-red-950 transition active:scale-90"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 text-xs font-black select-none font-sans">
              {quantity}
            </span>
            <button
              onClick={() => onAddToCart(item)}
              className="px-3 py-2 hover:bg-red-950 transition active:scale-90"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
