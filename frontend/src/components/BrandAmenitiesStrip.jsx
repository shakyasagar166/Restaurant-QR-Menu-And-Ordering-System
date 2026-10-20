import React from 'react';
import { ShieldCheck, Flame, Bell, Sparkles, Award, HeartHandshake } from 'lucide-react';

export default function BrandAmenitiesStrip() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Shuddh Shakahari',
      desc: 'Strictly vegetarian kitchen with pure desi ghee preparations & FSSAI standards.'
    },
    {
      icon: Flame,
      title: 'Authentic Clay Oven',
      desc: 'Tandoori breads, rotis & seekh kebabs roasted fresh in charcoal tandoors.'
    },
    {
      icon: Bell,
      title: 'Instant Kitchen Bell',
      desc: 'Zero-wait dine-in ordering. Table orders ring an immediate chime for the chef.'
    },
    {
      icon: Sparkles,
      title: 'Rooftop Sky Ambience',
      desc: 'Panoramic open-air rooftop dining at Aman International Mall, Mainpuri.'
    }
  ];

  return (
    <div className="bg-stone-900 text-white py-5 sm:py-10 px-3 sm:px-6 border-y border-amber-500/20 my-4 sm:my-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-8">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-950/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-400/30 inline-block mb-1.5 sm:mb-2">
            The Bikaner Express Promise
          </span>
          <h3 className="text-lg sm:text-3xl font-brand font-black text-white">
            Royal Vegetarian Hospitality
          </h3>
          <p className="hidden sm:block text-xs sm:text-sm text-stone-400 mt-1">
            Every dish is cooked to order using hand-selected spices, farm-fresh paneer and traditional slow-cooking techniques.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-5 border border-white/10 hover:border-amber-400/50 transition-all duration-300 group"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mb-2.5 sm:mb-4 group-hover:scale-110 transition duration-300 shadow-sm">
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h4 className="font-brand font-bold text-white text-xs sm:text-base mb-1 group-hover:text-amber-300 transition line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-stone-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
