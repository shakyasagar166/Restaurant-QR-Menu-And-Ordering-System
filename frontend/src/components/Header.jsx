import React from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bell,
  QrCode,
  Sparkles,
  MapPin,
  ChevronDown,
  Phone,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export default function Header({
  activeTab,
  setActiveTab,
  tableNumber,
  setTableNumber,
  cartCount,
  cartTotal,
  setIsCartOpen,
  pendingOrdersCount,
  isBellRinging,
  openQrModal,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-300/70 shadow-sm transition-all w-full max-w-full overflow-hidden">
      {/* Top Tier: Grand Brand Prestige Bar */}
      <div className="bg-gradient-to-r from-stone-950 via-red-950 to-stone-950 text-amber-100 text-[10px] sm:text-[11px] py-1 px-3 sm:px-4 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 font-bold tracking-wider text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/40 text-[9px] sm:text-[10px] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              100% PURE VEG
            </span>
            <span className="text-stone-300 truncate text-[10px] hidden xs:inline">
              Aman Mall Rooftop, Mainpuri
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 text-amber-200 font-semibold text-[11px]">
              <Phone className="w-3 h-3 text-amber-400" />
              9193870000
            </span>
            <button
              onClick={openQrModal}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-red-600/20 hover:from-amber-500/30 hover:to-red-600/30 text-amber-300 hover:text-white px-2 py-0.5 rounded-lg border border-amber-400/40 transition text-[10px] sm:text-[11px] font-bold"
            >
              <QrCode className="w-3 h-3 text-amber-400" />
              <span>Table QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tier: Grand Royal Brand Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Desktop & Tablet Navigation */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          {/* Royal Insignia Crest */}
          <div
            onClick={() => setActiveTab('menu')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-red-800 via-red-950 to-amber-700 p-0.5 shadow-lg shadow-red-950/20 group-hover:scale-105 transition duration-300 border border-amber-400/50">
                <div className="w-full h-full rounded-[14px] bg-stone-950 flex flex-col items-center justify-center text-amber-400">
                  <Crown className="w-3.5 h-3.5 text-amber-400 -mb-0.5" />
                  <UtensilsCrossed className="w-5 h-5 text-amber-300 drop-shadow-sm" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-[8px] text-white font-black shadow-xs">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-brand font-black tracking-wider text-stone-900 leading-none">
                  BIKANER <span className="text-red-800">EXPRESS</span>
                </h1>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 px-2 py-0.5 rounded shadow-2xs">
                  ROOF TOP
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-semibold tracking-wider uppercase mt-1 flex items-center gap-1.5">
                <span>Foods Pvt. Ltd.</span>
                <span className="text-amber-500">•</span>
                <span>Fine Dining &amp; Banquet</span>
                <span className="text-amber-500">•</span>
                <span className="text-red-700 font-bold">QR Dine-In</span>
              </p>
            </div>
          </div>

          {/* Desktop Right controls */}
          <div className="flex items-center gap-2.5">
            {/* Table Selector */}
            <div className="flex items-center bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-300 rounded-2xl px-3 py-1.5 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mr-2 shadow-xs"></span>
              <div className="text-left mr-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-900/80 block leading-none">
                  Dine-In Table
                </span>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-transparent font-brand font-black text-amber-950 text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={`T-${i + 1}`}>
                      Table {i + 1}
                    </option>
                  ))}
                  <option value="Takeaway">Takeaway</option>
                </select>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-amber-800 pointer-events-none" />
            </div>

            {/* Mode Selector Pill */}
            <div className="bg-stone-100 p-1 rounded-2xl border border-stone-200 flex items-center text-xs font-bold shadow-inner">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3.5 py-1.5 rounded-xl transition duration-200 font-brand ${
                  activeTab === 'menu'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Guest Menu
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition duration-200 relative font-brand ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-red-800 to-red-900 text-white shadow-sm border border-red-700'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Bell
                  className={`w-3.5 h-3.5 ${
                    isBellRinging || pendingOrdersCount > 0 ? 'animate-bell text-amber-300' : ''
                  }`}
                />
                <span>Kitchen Bell</span>
                {pendingOrdersCount > 0 && (
                  <span className="bg-amber-400 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Cart Button */}
            {activeTab === 'menu' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-gradient-to-r from-red-800 via-red-900 to-stone-900 hover:from-red-900 hover:to-black text-white px-3.5 sm:px-4 py-2 rounded-2xl shadow-md shadow-red-950/30 hover:shadow-lg transition duration-200 active:scale-95 border border-amber-400/50"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold text-amber-300/80 leading-none block">
                    Order Tray
                  </span>
                  <span className="text-xs font-black tracking-tight leading-tight">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-amber-400 text-stone-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Layout (100% Responsive, Zero Overflow) */}
        <div className="sm:hidden space-y-2">
          {/* Top Row: Logo + Table Selector + Cart Tray Button */}
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 cursor-pointer truncate"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-800 to-amber-700 p-0.5 border border-amber-400/50 shrink-0">
                <div className="w-full h-full rounded-[10px] bg-stone-950 flex items-center justify-center text-amber-400">
                  <UtensilsCrossed className="w-4 h-4 text-amber-300" />
                </div>
              </div>
              <div className="truncate">
                <div className="font-brand font-black text-sm tracking-wide text-stone-900 leading-none">
                  BIKANER <span className="text-red-800">EXPRESS</span>
                </div>
                <span className="text-[9px] text-stone-500 font-semibold uppercase">
                  Rooftop Dining
                </span>
              </div>
            </div>

            {/* Right: Table + Cart */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Table Selector */}
              <div className="flex items-center bg-amber-50 border border-amber-300/80 rounded-xl px-2 py-1 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-transparent font-brand font-black text-amber-950 text-[11px] focus:outline-none cursor-pointer"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={`T-${i + 1}`}>
                      T-{i + 1}
                    </option>
                  ))}
                  <option value="Takeaway">Takeaway</option>
                </select>
              </div>

              {/* Cart Tray Button */}
              {activeTab === 'menu' && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-1 bg-gradient-to-r from-red-800 to-red-950 text-white px-2.5 py-1.5 rounded-xl shadow-xs border border-amber-400/50 active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px] font-black">{formatPrice(cartTotal)}</span>
                  {cartCount > 0 && (
                    <span className="bg-amber-400 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row on Mobile: Full-Width Segmented Tab Switcher */}
          <div className="bg-stone-100 p-0.5 rounded-xl border border-stone-200 flex items-center text-xs font-bold shadow-inner">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-1.5 text-center rounded-lg transition font-brand text-xs ${
                activeTab === 'menu'
                  ? 'bg-white text-stone-950 shadow-sm border border-stone-200 font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🍽️ Dining Menu
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg transition font-brand text-xs ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-red-800 to-red-950 text-white shadow-sm font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bell
                className={`w-3 h-3 ${
                  isBellRinging || pendingOrdersCount > 0 ? 'animate-bell text-amber-300' : ''
                }`}
              />
              <span>Kitchen Bell</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-400 text-stone-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
