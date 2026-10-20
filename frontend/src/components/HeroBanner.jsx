import React from 'react';
import { Search, Sparkles, Clock, Flame, ShieldCheck, Crown, Award, Star } from 'lucide-react';

export default function HeroBanner({ searchQuery, setSearchQuery, selectedCategory, onSelectCategory }) {
  const quickTags = [
    { label: 'Paneer Butter Masala', cat: 'Curries & Dal' },
    { label: 'Garlic Naan', cat: 'Indian Breads' },
    { label: 'Virgin Mojito', cat: 'Mocktails' },
    { label: 'Executive Thali', cat: 'Thali & Platters' },
    { label: 'Masala Dosa', cat: 'South Indian' },
    { label: 'Gulab Jamun with Ice Cream', cat: 'Desserts & Sweets' }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-100/50 via-amber-50/20 to-transparent pt-6 pb-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-stone-950 via-red-950 to-stone-950 text-white p-6 sm:p-10 shadow-2xl border-2 border-amber-500/40 overflow-hidden">
          {/* Ambient lighting glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              {/* Grand Brand Top Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-md uppercase tracking-widest font-brand">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aman International Mall • Roof Top Mainpuri</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Pure Shuddh Veg</span>
                </span>
              </div>

              {/* Grand Headline in Cinzel & Playfair Display */}
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-brand font-black tracking-tight text-white mb-4 leading-[1.1]">
                Royal Vegetarian <br />
                <span className="gold-gradient-text">
                  Culinary Heritage
                </span>
              </h2>

              <p className="text-stone-300 text-xs sm:text-sm mb-6 leading-relaxed max-w-xl">
                Indulge in time-honored North Indian curries simmered in pure desi ghee, clay-oven charred tandoori rotis, South Indian dosas, Delhi-6 street chaat, and artisan mocktails. Order straight from your rooftop table with instant kitchen bell notification.
              </p>

              {/* High-Visibility Highlighted Customer AI Smart Search Bar */}
              <div className="relative max-w-xl mb-4 group">
                {/* Subtle Ambient Golden Glow Behind Search Bar */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>

                {/* Bright Crisp White & Gold Search Container */}
                <div
                  className={`relative flex items-center bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border-2 transition-all duration-200 shadow-2xl ${
                    searchQuery
                      ? 'border-red-600 ring-4 ring-red-100 shadow-red-500/20'
                      : 'border-amber-400 hover:border-amber-500 ring-2 ring-amber-100/90 focus-within:border-amber-600 focus-within:ring-4 focus-within:ring-amber-200'
                  }`}
                >
                  {/* Eye-Catching Golden AI Search Badge */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-stone-950 font-black text-xs sm:text-sm px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-sm shrink-0 border border-amber-300">
                    <Sparkles className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                    <span className="font-brand uppercase tracking-wider hidden xs:inline">AI SEARCH</span>
                  </div>

                  {/* High Contrast Input */}
                  <input
                    type="text"
                    placeholder="AI Smart Search: (e.g. paner, makni, dhosa, cofe, meetha)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent pl-2.5 pr-2 py-2 text-xs sm:text-sm font-black text-stone-950 placeholder-stone-500 focus:outline-none"
                  />

                  {/* Action Button: Clear or Dish Count Badge */}
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-1 bg-rose-50 hover:bg-rose-500 text-rose-700 hover:text-white border border-rose-300 text-xs font-black px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 mr-1 shadow-xs"
                      title="Clear search"
                    >
                      <span>Clear</span>
                      <span className="text-sm font-black">✕</span>
                    </button>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black text-amber-950 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-xl shrink-0 mr-1">
                      ⚡ 85+ Pure Veg
                    </span>
                  )}
                </div>

                {/* AI Typo Resilience Tag */}
                <div className="flex items-center gap-2 mt-2 px-1 text-[11px] font-semibold text-amber-100/90">
                  <span className="bg-amber-400/25 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-brand shrink-0">
                    ✨ AI Typo Proof
                  </span>
                  <span className="truncate">Spelling mistake ya Hinglish hone par bhi AI dish samajh leta hai!</span>
                </div>
              </div>

              {/* Popular Signature Dishes Quick-Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1 mr-1 text-[11px] uppercase tracking-wider font-brand">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Signatures:
                </span>
                {quickTags.map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => {
                      setSearchQuery(tag.label);
                      if (onSelectCategory) onSelectCategory(tag.cat);
                    }}
                    className="bg-white/10 hover:bg-amber-500/20 text-stone-200 hover:text-amber-300 px-3 py-1 rounded-xl text-[11px] font-semibold border border-white/10 hover:border-amber-400/40 transition cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Culinary Showcase Column */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                {/* Grand Frame */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-2xl p-1.5 bg-gradient-to-br from-amber-400/40 via-red-800/40 to-stone-900">
                  <img
                    src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80"
                    alt="Bikaner Express Fine Dining"
                    className="w-full h-72 object-cover rounded-[22px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent rounded-[22px]"></div>

                  {/* Rating Badge on Image */}
                  <div className="absolute top-4 right-4 bg-stone-950/90 backdrop-blur-md border border-amber-400/50 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-300 flex items-center gap-1 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9 / 5.0 (2,400+ Diners)</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <span className="text-[10px] uppercase font-black text-amber-300 tracking-[0.15em] font-brand block">
                        Royal Signature Selection
                      </span>
                      <h4 className="font-brand font-bold text-lg text-white">
                        Special Paneer Butter Masala
                      </h4>
                    </div>
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-xl shadow-md uppercase font-brand tracking-wider">
                      Chef Choice
                    </span>
                  </div>
                </div>

                {/* Floating Brand Accents */}
                <div className="absolute -top-4 -left-4 bg-stone-900/95 backdrop-blur-md border-2 border-amber-400/60 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    🔔
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Kitchen System</span>
                    <span className="text-xs font-black text-white font-brand">Live Order Bell</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-stone-900/95 backdrop-blur-md border-2 border-emerald-500/60 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    🌿
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Certified Pure</span>
                    <span className="text-xs font-black text-white font-brand">100% Shuddh Veg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
