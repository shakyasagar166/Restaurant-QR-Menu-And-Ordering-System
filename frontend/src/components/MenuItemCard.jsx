import React, { useState, memo } from 'react';
import { Plus, Minus, Sparkles, Crown, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import DishCustomizationBox from './DishCustomizationBox';

const FALLBACK_DISH_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

function MenuItemCard({
  item,
  cartItem,
  onAddToCart,
  onRemoveFromCart,
  onDeleteDish,
  onUpdateItemInstructions,
}) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.imageUrl || FALLBACK_DISH_IMG);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = item.isAvailable === false || item.available === false;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
      isOutOfStock
        ? 'border-stone-300 opacity-80 bg-stone-50/80'
        : 'border-amber-200/90 shadow-2xs hover:shadow-lg hover:border-amber-400'
    }`}>
      <div>
        {/* Compact Dish Photography Stage */}
        <div className="relative h-28 xs:h-32 sm:h-36 overflow-hidden bg-stone-900">
          <img
            src={imgSrc}
            alt={item.name}
            onError={() => {
              if (imgSrc !== FALLBACK_DISH_IMG) {
                setImgSrc(FALLBACK_DISH_IMG);
              }
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out opacity-95 group-hover:opacity-100 ${
              isOutOfStock ? 'grayscale contrast-75' : ''
            }`}
            loading="lazy"
            decoding="async"
          />

          {/* Gradient overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20"></div>

          {/* Out of Stock High-Visibility Banner Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 z-20 text-center">
              <span className="bg-rose-600 text-white font-black text-[9px] xs:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-brand shadow-md border border-rose-400 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>OUT OF STOCK</span>
              </span>
              <span className="text-[9px] text-amber-200 font-bold mt-1 bg-black/40 px-1.5 py-0.5 rounded">
                खत्म / अनुपलब्ध
              </span>
            </div>
          )}

          {/* 100% Pure Veg FSSAI Symbol */}
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs flex items-center justify-center z-10">
            <span className="w-3 h-3 rounded-[2px] border-1.5 border-emerald-600 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            </span>
          </div>

          {/* Royal Specialty Ribbon */}
          {!isOutOfStock && item.tag && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-stone-950 font-black text-[8px] xs:text-[9px] px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1 font-brand border border-amber-300 z-10">
              <Crown className="w-2.5 h-2.5 text-stone-950" />
              <span>{item.tag}</span>
            </div>
          )}

          {/* Course category indicator */}
          <div className="absolute bottom-1.5 left-2 z-10">
            <span className="text-[9px] font-bold text-amber-200 bg-stone-950/85 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider font-brand">
              {item.category}
            </span>
          </div>
        </div>

        {/* Content Body (Compact, Crisp, Readable) */}
        <div className="p-2.5 sm:p-3">
          <h4 className={`font-brand font-black text-xs sm:text-sm leading-tight line-clamp-1 transition duration-200 ${
            isOutOfStock ? 'text-stone-500' : 'text-stone-900 group-hover:text-red-800'
          }`} title={item.name}>
            {item.name}
          </h4>

          <p className="text-stone-500 text-[10px] sm:text-[11px] line-clamp-1 sm:line-clamp-2 leading-tight mt-1 mb-1">
            {item.description ||
              'Prepared fresh with pure desi ghee, aromatic ground spices & finest ingredients.'}
          </p>
        </div>
      </div>

      {/* Footer: Price & Add to Order Pill */}
      <div className="px-2.5 pb-2.5 pt-1.5 border-t border-amber-100/80 flex items-center justify-between bg-stone-50/50 mt-auto">
        <div>
          <span className="text-[8px] uppercase font-black text-stone-400 block leading-none font-brand">
            Price
          </span>
          <span className={`text-xs sm:text-sm font-black tracking-tight font-sans ${isOutOfStock ? 'text-stone-400' : 'text-stone-900'}`}>
            {formatPrice(item.price)}
          </span>
        </div>

        {/* Add Button, Sold Out Badge, or Quantity Counter */}
        {isOutOfStock ? (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-500 font-brand font-black text-[10px] px-2 py-1 rounded-xl select-none border border-stone-300 cursor-not-allowed">
              <span>Sold Out</span>
            </span>
            {quantity > 0 && onDeleteDish && (
              <button
                onClick={() => onDeleteDish(item.id)}
                className="w-6 h-6 rounded-lg bg-red-100 hover:bg-red-600 text-red-700 hover:text-white flex items-center justify-center transition border border-red-200"
                title="Tray se hatayein"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : quantity === 0 ? (
          <button
            onClick={() => onAddToCart(item)}
            className="flex items-center gap-1 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-stone-900 text-white font-brand font-black text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 border border-amber-400/40 cursor-pointer"
          >
            <Plus className="w-3 h-3 text-amber-300 stroke-[3]" />
            <span>ADD</span>
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <div className="flex items-center bg-gradient-to-r from-red-800 to-red-900 text-white rounded-xl shadow-xs overflow-hidden border border-amber-400/40">
              <button
                onClick={() => onRemoveFromCart(item.id)}
                className={`p-1 sm:p-1.5 transition active:scale-90 flex items-center justify-center ${
                  quantity === 1 ? 'hover:bg-red-950 text-amber-300' : 'hover:bg-red-950 text-white'
                }`}
                title={quantity === 1 ? 'Dish ko tray se hataayein' : 'Quantity kam karein (-1)'}
                aria-label={quantity === 1 ? 'Remove dish' : 'Decrease quantity'}
              >
                {quantity === 1 ? (
                  <Trash2 className="w-3 h-3 text-amber-300" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
              </button>
              <span className="px-1.5 text-[11px] font-black select-none font-sans min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onAddToCart(item)}
                className="p-1 sm:p-1.5 hover:bg-red-950 transition active:scale-90"
                title="Quantity badhayein (+1)"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Direct 1-Click Remove Trash Button */}
            {onDeleteDish && (
              <button
                onClick={() => onDeleteDish(item.id)}
                className="w-6 h-6 rounded-lg bg-red-100 hover:bg-red-600 text-red-700 hover:text-white flex items-center justify-center transition border border-red-200"
                title="Remove item"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Customization Box on Menu Card when added to Tray */}
      {quantity > 0 && (
        <div className="px-2.5 pb-2 bg-stone-50/50 border-t border-amber-100/60">
          <DishCustomizationBox
            item={{
              ...item,
              specialInstructions: cartItem?.specialInstructions || '',
            }}
            isExpanded={isCustomizing}
            onToggleExpand={() => setIsCustomizing((prev) => !prev)}
            onSaveInstructions={(instructions) => {
              if (onUpdateItemInstructions) {
                onUpdateItemInstructions(item.id, instructions);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default memo(MenuItemCard);
