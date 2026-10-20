import React from 'react';
import { ArrowRight, Sparkles, Utensils, Compass, Crown } from 'lucide-react';

export const CATEGORY_METADATA = {
  'Indian Breads': {
    code: '01',
    title: 'Indian Breads (Roti & Naan)',
    shortTitle: 'Roti & Naan',
    icon: '🫓',
    subtitle: 'Tandoori Roti, Butter Naan, Garlic Naan, Lachha Parantha, Kulcha, Missi Roti',
    highlights: ['Garlic Naan', 'Butter Naan', 'Tandoori Roti', 'Paneer Kulcha'],
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=700&auto=format&fit=crop&q=80',
    color: 'from-amber-950 via-stone-900/60 to-transparent',
    badge: 'Clay Oven Fresh'
  },
  'Beverages': {
    code: '02',
    title: 'Beverages & Brews',
    shortTitle: 'Drinks & Coffee',
    icon: '🥤',
    subtitle: 'Cold Coffee with Ice Cream, Kesar Badam Milk, Special Tea, Fresh Lime Soda',
    highlights: ['Cold Coffee with Ice Cream', 'Kesar Badam Milk', 'Masala Tea', 'Lemon Ice Tea'],
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=700&auto=format&fit=crop&q=80',
    color: 'from-amber-950 via-stone-900/60 to-transparent',
    badge: 'Chilled & Hot Brews'
  },
  'Mocktails': {
    code: '03',
    title: 'Artisan Mocktails & Mojitos',
    shortTitle: 'Mocktails',
    icon: '🍹',
    subtitle: 'Virgin Mojito, Watermelon Mojito, Kala Khatta, Masala Lemonade, Cucumber Cooler',
    highlights: ['Virgin Mojito', 'Watermelon Mojito', 'Spl Kala Khatta', 'Masala Lemonade'],
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=700&auto=format&fit=crop&q=80',
    color: 'from-teal-950 via-stone-900/60 to-transparent',
    badge: 'Signature Fizzes'
  },
  'Curries & Dal': {
    code: '04',
    title: 'A\' La Carte (Royal Curries & Dal)',
    shortTitle: 'Curries & Dal',
    icon: '🍲',
    subtitle: 'Paneer Butter Masala, Dal Makhani, Kadai Paneer, Shahi Paneer, Pindi Chana',
    highlights: ['Paneer Butter Masala', 'Dal Makhani', 'Kadai Paneer', 'Makkhan Wali Daal'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80',
    color: 'from-red-950 via-stone-900/60 to-transparent',
    badge: 'Chef Masterpieces'
  },
  'Tandoori Factory': {
    code: '05',
    title: 'Tandoori Factory & Chaap',
    shortTitle: 'Tandoori & Chaap',
    icon: '🍢',
    subtitle: 'Tandoori Paneer Tikka, Malai Chaap, Achari Chaap, Pudina Chaap, Veg Seekh Kebab',
    highlights: ['Paneer Tikka', 'Tandoori Malai Chaap', 'Achari Chaap', 'Seekh Kebab'],
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=700&auto=format&fit=crop&q=80',
    color: 'from-rose-950 via-stone-900/60 to-transparent',
    badge: 'Smoky Charcoal'
  },
  'Chinese & Noodles': {
    code: '06',
    title: 'Chandni Chowk to China',
    shortTitle: 'Chinese & Noodles',
    icon: '🍜',
    subtitle: 'Hakka Noodles, Chilli Paneer, Manchurian, Fried Rice, Crispy Chilli Potato',
    highlights: ['Hakka Noodles', 'Chilli Paneer', 'Veg Manchurian', 'Fried Rice'],
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=700&auto=format&fit=crop&q=80',
    color: 'from-orange-950 via-stone-900/60 to-transparent',
    badge: 'Wok Tossed'
  },
  'South Indian': {
    code: '07',
    title: 'Dakshin Bhavan (South Indian)',
    shortTitle: 'South Indian',
    icon: '🍛',
    subtitle: 'Masala Dosa, Mysore Dosa, Schezwan Cheese Dosa, Idli Sambar, Uttapam',
    highlights: ['Masala Dosa', 'Mysore Masala Dosa', 'Cheese Dosa', 'Idli Sambar'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
    color: 'from-yellow-950 via-stone-900/60 to-transparent',
    badge: 'Crispy Crepes'
  },
  'Chaat & Snacks': {
    code: '08',
    title: 'Delhi-6 Ka Chatka & Snacks',
    shortTitle: 'Chaat & Snacks',
    icon: '🥟',
    subtitle: 'Gol Gappe, Raj Kachori, Dahi Bhalla, Chole Bhature, Pav Bhaji, Aloo Tikki',
    highlights: ['Gol Gappe', 'Raj Kachori', 'Chole Bhature', 'Pav Bhaji'],
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
    color: 'from-amber-950 via-stone-900/60 to-transparent',
    badge: 'Signature Desi'
  },
  'Thali & Platters': {
    code: '09',
    title: 'Executive Thali & Platters',
    shortTitle: 'Thali & Platters',
    icon: '🍱',
    subtitle: 'Executive Thali, Bikaner Deluxe Thali, Special Thali, Tandoori Platter',
    highlights: ['Executive Thali', 'Bikaner Deluxe Thali', 'Tandoori Platter', 'SPL Thali'],
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=700&auto=format&fit=crop&q=80',
    color: 'from-emerald-950 via-stone-900/60 to-transparent',
    badge: 'Grand Combos'
  },
  'Pizza & Burger': {
    code: '10',
    title: 'Pizza, Burger & Continental',
    shortTitle: 'Pizza & Burger',
    icon: '🍕',
    subtitle: 'Margherita Pizza, Paneer Tikka Pizza, Cheese Burger, Grilled Sandwich',
    highlights: ['Paneer Tikka Pizza', 'Margherita Pizza', 'Cheese Burger', 'Grilled Sandwich'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80',
    color: 'from-red-950 via-stone-900/60 to-transparent',
    badge: 'Cheesy Continental'
  },
  'Desserts & Sweets': {
    code: '11',
    title: 'Meetha Maza & Kulfi & Pastries',
    shortTitle: 'Desserts & Sweets',
    icon: '🍨',
    subtitle: 'Gulab Jamun with Ice Cream, Rasmalai, Stick Kulfi, Chocolate Pastry',
    highlights: ['Gulab Jamun with Ice Cream', 'Rasmalai', 'Stick Kulfi', 'Choco Truffle Pastry'],
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=700&auto=format&fit=crop&q=80',
    color: 'from-purple-950 via-stone-900/60 to-transparent',
    badge: 'Sweet Celebrations'
  }
};

export default function CategoryCards({ categories, menuItems, onSelectCategory }) {
  const getCategoryCount = (catName) => {
    return menuItems.filter((item) => item.category === catName).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
      {/* Space-Efficient Section Header */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-700 shadow-2xs">
            <Crown className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-2xl font-brand font-black text-stone-950 tracking-tight leading-none">
              Explore Menu Categories
            </h3>
            <p className="text-[10px] sm:text-xs text-stone-500 font-semibold mt-0.5">
              Tap any category to view dishes &amp; place order
            </p>
          </div>
        </div>
        <span className="text-[11px] sm:text-xs font-black text-amber-900 bg-amber-100/90 border border-amber-300/80 px-2.5 py-1 rounded-xl shrink-0 shadow-2xs font-brand">
          🍽️ 11 Sections
        </span>
      </div>

      {/* 2-Column Grid on Mobile, 3-Column on Tablet, 4-Column on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {categories.map((category) => {
          const meta = CATEGORY_METADATA[category] || {
            code: '00',
            title: category,
            shortTitle: category,
            icon: '🍽️',
            subtitle: 'Signature vegetarian culinary preparations',
            highlights: ['Chef Special', 'Fresh Preparation'],
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80',
            color: 'from-stone-950 to-transparent',
            badge: 'Pure Veg'
          };
          const count = getCategoryCount(category);

          return (
            <div
              key={category}
              onClick={() => onSelectCategory(category)}
              className="group relative bg-white rounded-2xl sm:rounded-3xl border border-amber-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col active:scale-[0.98]"
            >
              {/* Photo Stage (Compact & Space-Saving) */}
              <div className="relative h-24 xs:h-28 sm:h-32 lg:h-36 overflow-hidden bg-stone-900">
                <img
                  src={meta.image}
                  alt={meta.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                  loading="lazy"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15"></div>

                {/* Top Bar on Image: Collection Code + Dish Count Badge */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                  <span className="bg-stone-950/85 backdrop-blur-xs text-amber-300 text-[9px] font-brand font-black px-1.5 py-0.5 rounded border border-amber-400/30">
                    {meta.code ? `#${meta.code}` : '★'}
                  </span>

                  <span className="bg-white/95 backdrop-blur-xs text-stone-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-2xs font-brand">
                    {count} Dishes
                  </span>
                </div>

                {/* Emblem & Category Title pinned at bottom of photo */}
                <div className="absolute bottom-1.5 left-2 right-2 text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm shrink-0 drop-shadow">{meta.icon}</span>
                    <h4 className="text-xs sm:text-sm font-brand font-black leading-tight text-white group-hover:text-amber-300 transition duration-200 drop-shadow truncate">
                      {meta.shortTitle || meta.title}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Compact Card Body */}
              <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/20">
                <p className="text-[10px] sm:text-[11px] text-stone-600 line-clamp-1 leading-snug mb-1">
                  {meta.subtitle}
                </p>

                {/* Action CTA Bar */}
                <div className="pt-1.5 border-t border-amber-100 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-red-800 group-hover:text-amber-800 transition font-brand flex items-center gap-1">
                    <span>Open Menu</span>
                  </span>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-100 group-hover:bg-red-800 text-red-800 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
