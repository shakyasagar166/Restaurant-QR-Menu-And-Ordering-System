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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Brand Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-800 bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-300 mb-3 font-brand">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span>Interactive Dining Pavilion</span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-brand font-black text-stone-950 tracking-tight">
          Select a Culinary Collection
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
          Tap any section below (like <strong>Roti &amp; Naan</strong> or <strong>Drinks &amp; Brews</strong>) to open the full collection with authentic dishes, pricing &amp; chef recommendations.
        </p>
      </div>

      {/* Grid of Grand Brand Pavilion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
              className="group relative bg-white rounded-3xl border-2 border-amber-200/80 shadow-md hover:shadow-2xl hover:border-amber-400 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col transform hover:-translate-y-2"
            >
              {/* Grand Photo Stage with Cinematic Overlay */}
              <div className="relative h-56 sm:h-60 overflow-hidden bg-stone-900">
                <img
                  src={meta.image}
                  alt={meta.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
                  loading="lazy"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/20"></div>

                {/* Top Bar on Image: Collection Code + Specialty Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="bg-stone-950/80 backdrop-blur-md text-amber-300 text-[11px] font-brand font-black px-3 py-1 rounded-full border border-amber-400/40 shadow-md tracking-wider">
                    {meta.code ? `COLLECTION ${meta.code}` : 'SPECIALTY'}
                  </span>

                  <span className="bg-white/95 backdrop-blur-md text-stone-950 text-xs font-black px-3 py-1 rounded-full shadow-md font-brand">
                    {count} Dishes
                  </span>
                </div>

                {/* Emblem & Category Title pinned at bottom of photo */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="w-11 h-11 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-amber-400/40 text-amber-300 flex items-center justify-center text-2xl mb-2.5 shadow-lg group-hover:scale-110 transition duration-300">
                    {meta.icon}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-brand font-black leading-tight text-white group-hover:text-amber-300 transition duration-300 drop-shadow-md">
                    {meta.title}
                  </h4>
                </div>
              </div>

              {/* Card Body: Highlights & Action Pill */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/30">
                <div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3.5">
                    {meta.subtitle}
                  </p>

                  {/* Highlight tags */}
                  {meta.highlights && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {meta.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold bg-amber-100/70 text-amber-950 px-2.5 py-0.5 rounded-md border border-amber-200"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action CTA Bar */}
                <div className="pt-3.5 border-t border-amber-100 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-red-800 group-hover:text-amber-800 transition font-brand flex items-center gap-1.5">
                    <span>Explore Section</span>
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 group-hover:bg-red-800 text-red-800 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
