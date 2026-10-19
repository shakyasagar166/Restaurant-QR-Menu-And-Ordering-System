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
    <div className="bg-stone-900 text-white py-10 px-4 sm:px-6 border-y border-amber-500/20 my-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400/30 inline-block mb-2">
            The Bikaner Express Promise
          </span>
          <h3 className="text-2xl sm:text-3xl font-brand font-black text-white">
            A Legacy of Royal Vegetarian Hospitality
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Every dish is cooked to order using hand-selected spices, farm-fresh paneer and traditional slow-cooking techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-amber-400/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-brand font-bold text-white text-base mb-1.5 group-hover:text-amber-300 transition">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
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
