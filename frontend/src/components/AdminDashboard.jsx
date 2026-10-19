import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCircle,
  Clock,
  ChefHat,
  Check,
  XCircle,
  RotateCcw,
  Sparkles,
  QrCode,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  LogOut,
  Crown,
  LayoutDashboard,
  TableProperties,
  ArrowLeft,
  CreditCard,
  Banknote,
  Search,
  Utensils,
  Filter,
  ExternalLink,
  ShieldCheck,
  Phone,
  Flame,
  AlertCircle,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react';
import { formatPrice, formatTime, getTimeAgo } from '../utils/formatters';
import { bellPlayer } from '../utils/sound';

export default function AdminDashboard({
  orders = [],
  stats,
  menuItems = [],
  categories = [],
  onUpdateStatus,
  onRefresh,
  isBellMuted,
  setIsBellMuted,
  openQrModal,
  adminUser,
  onLogout,
  onBackToMenu,
}) {
  // Navigation tabs within Admin POS Suite
  const [adminSection, setAdminSection] = useState('orders'); // 'orders' | 'analytics' | 'menu' | 'tables'
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCatFilter, setMenuCatFilter] = useState('ALL');

  // Real-time IST live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestBell = () => {
    bellPlayer.playOrderBell();
  };

  // Filtered orders by status and search (table / customer / phone)
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeFilter === 'ALL' || order.status === activeFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const tableMatch = order.tableNumber?.toLowerCase().includes(q);
    const nameMatch = order.customerName?.toLowerCase().includes(q);
    const phoneMatch = order.customerPhone?.toLowerCase().includes(q);
    const idMatch = String(order.id).includes(q);
    const itemMatch = order.items?.some((i) => i.name.toLowerCase().includes(q));
    return tableMatch || nameMatch || phoneMatch || idMatch || itemMatch;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const servedCount = orders.filter((o) => o.status === 'SERVED').length;
  const acceptedCount = orders.filter((o) => o.status === 'ACCEPTED').length;

  // Online vs Cash totals calculation
  const onlineOrders = orders.filter((o) => o.paymentMethod === 'ONLINE' || o.paymentStatus === 'PAID');
  const onlineTotal = onlineOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const cashOrders = orders.filter((o) => o.paymentMethod !== 'ONLINE' && o.paymentStatus !== 'PAID');
  const cashTotal = cashOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Active occupied tables list
  const activeOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'PREPARING');
  const occupiedTables = new Set(activeOrders.map((o) => o.tableNumber));

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none">
      {/* 1. EXECUTIVE STANDALONE TOP BAR (100% SEPARATE FROM CUSTOMER HEADER) */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b-2 border-amber-500/40 shadow-xl px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand Identity & POS Badge */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-700 via-amber-600 to-amber-400 p-0.5 shadow-lg border border-amber-300">
                <div className="w-full h-full rounded-[14px] bg-stone-950 flex items-center justify-center text-amber-400">
                  <Crown className="w-6 h-6 text-amber-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-brand font-black text-lg sm:text-xl text-white tracking-wider leading-none">
                    BIKANER <span className="text-amber-400">EXPRESS</span>
                  </h1>
                  <span className="bg-amber-400 text-stone-950 font-black text-[9px] uppercase px-2 py-0.5 rounded font-mono shadow-xs">
                    POS &amp; KITCHEN
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    SSE Kitchen Active
                  </span>
                  <span>•</span>
                  <span>Aman Mall Rooftop, Mainpuri</span>
                </div>
              </div>
            </div>

            {/* Mobile Exit to Customer Site button */}
            <button
              onClick={onBackToMenu}
              className="md:hidden flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400/50 text-xs font-bold transition active:scale-95"
            >
              <span>Customer Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: Realtime IST Clock & Sound Control */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-center border-y md:border-y-0 border-white/10 py-1.5 md:py-0">
            {/* Live IST Clock */}
            <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-stone-300 font-bold">
                {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] text-stone-500 uppercase">IST</span>
            </div>

            {/* Bell Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTestBell}
                className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-brand font-black text-xs px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Kitchen Bell Test Ring Karein"
              >
                <Bell className="w-3.5 h-3.5 animate-bell text-stone-950" />
                <span>Test Bell 🔔</span>
              </button>

              <button
                onClick={() => setIsBellMuted(!isBellMuted)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition ${
                  isBellMuted
                    ? 'bg-red-950 border-red-500/80 text-red-300'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
                }`}
                title={isBellMuted ? 'Sound Muted (Click to Unmute)' : 'Sound Enabled (Click to Mute)'}
              >
                {isBellMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onRefresh}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition"
                title="Refresh Orders Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Staff Identity & Customer View Exit */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Table QR Generator Modal Button */}
            <button
              onClick={openQrModal}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-xl border border-white/15 transition"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Table QR</span>
            </button>

            {/* Exit to Customer View */}
            <button
              onClick={onBackToMenu}
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-red-800 to-red-950 hover:from-red-900 hover:to-black text-white font-brand font-black text-xs px-3.5 py-1.5 rounded-xl border border-amber-400/60 shadow-xs transition active:scale-95"
              title="Customer Menu Website Par Jayein"
            >
              <span>Customer Menu ➔</span>
            </button>

            {/* Staff User Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="text-right hidden lg:block">
                <span className="text-xs font-black text-white block leading-tight">
                  {adminUser?.name || 'Shivam Shakya'}
                </span>
                <span className="text-[10px] text-amber-300 font-mono">
                  Super Admin
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-500/40 transition active:scale-95"
                title="Manager Session Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. ADMIN PORTAL SUB-NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAdminSection('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-brand font-black transition ${
                adminSection === 'orders'
                  ? 'bg-amber-400 text-stone-950 shadow-md scale-102 border border-amber-300'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Live Orders &amp; KOT</span>
              {pendingCount > 0 && (
                <span className="bg-red-600 text-white font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminSection('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-brand font-black transition ${
                adminSection === 'analytics'
                  ? 'bg-amber-400 text-stone-950 shadow-md scale-102 border border-amber-300'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales &amp; Analytics</span>
            </button>

            <button
              onClick={() => setAdminSection('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-brand font-black transition ${
                adminSection === 'menu'
                  ? 'bg-amber-400 text-stone-950 shadow-md scale-102 border border-amber-300'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Menu &amp; Dishes ({menuItems.length})</span>
            </button>

            <button
              onClick={() => setAdminSection('tables')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-brand font-black transition ${
                adminSection === 'tables'
                  ? 'bg-amber-400 text-stone-950 shadow-md scale-102 border border-amber-300'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Floor &amp; Tables ({occupiedTables.size}/20 Active)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Today's Total: <strong className="text-white font-mono">{formatPrice(stats?.todaySales || stats?.totalSales || 0)}</strong></span>
            </span>
          </div>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE AREA */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-6 w-full max-w-full">
        {/* ================= SECTION 1: LIVE ORDERS & KOT ================= */}
        {adminSection === 'orders' && (
          <div className="space-y-6">
            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-stone-900/90 rounded-2xl p-4 border border-white/10 shadow-md">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                  🔔 New Orders Pending
                </span>
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl sm:text-3xl font-black font-sans ${pendingCount > 0 ? 'text-amber-400 animate-pulse' : 'text-stone-300'}`}>
                    {pendingCount}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">Needs Action</span>
                </div>
              </div>

              <div className="bg-stone-900/90 rounded-2xl p-4 border border-white/10 shadow-md">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                  👨‍🍳 Active In Kitchen
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-blue-400 font-sans">
                    {preparingCount + acceptedCount}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">Cooking Now</span>
                </div>
              </div>

              <div className="bg-stone-900/90 rounded-2xl p-4 border border-white/10 shadow-md">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                  ✅ Served Today
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-sans">
                    {servedCount}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">Completed</span>
                </div>
              </div>

              <div className="bg-stone-900/90 rounded-2xl p-4 border border-white/10 shadow-md">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                  💰 Gross Revenue
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-amber-300 font-sans truncate">
                    {formatPrice(stats?.totalSales || 0)}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">Gross</span>
                </div>
              </div>
            </div>

            {/* Filter Pills & Live Search Bar */}
            <div className="bg-stone-900 rounded-2xl p-3 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                {[
                  { key: 'ALL', label: `All (${orders.length})` },
                  { key: 'PENDING', label: `🔔 New (${pendingCount})`, badge: pendingCount > 0 },
                  { key: 'ACCEPTED', label: `Accepted (${acceptedCount})` },
                  { key: 'PREPARING', label: `👨‍🍳 Cooking (${preparingCount})` },
                  { key: 'SERVED', label: `✅ Served (${servedCount})` },
                  { key: 'CANCELLED', label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      activeFilter === tab.key
                        ? 'bg-amber-400 text-stone-950 shadow-sm font-black'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Live Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Table (T-1), Customer, Dish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Orders KOT Tickets Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-stone-900 rounded-3xl border border-white/10 p-12 text-center my-6">
                <div className="w-16 h-16 rounded-2xl bg-stone-800 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                  📋
                </div>
                <h4 className="text-lg font-brand font-bold text-white mb-1">
                  No Orders Found
                </h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">
                  {searchQuery
                    ? `No orders matching query "${searchQuery}".`
                    : activeFilter !== 'ALL'
                    ? `No orders currently in ${activeFilter} state.`
                    : 'When diners place orders from Table QR, kitchen tickets will automatically appear here with live audio bell.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredOrders.map((order) => {
                  const isPending = order.status === 'PENDING';
                  const isAccepted = order.status === 'ACCEPTED';
                  const isPreparing = order.status === 'PREPARING';
                  const isServed = order.status === 'SERVED';
                  const isCancelled = order.status === 'CANCELLED';

                  return (
                    <div
                      key={order.id}
                      className={`bg-stone-900 rounded-3xl border-2 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-xl ${
                        isPending
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : isPreparing
                          ? 'border-blue-500/80'
                          : isServed
                          ? 'border-emerald-600/60 opacity-90'
                          : 'border-white/10'
                      }`}
                    >
                      {/* Ticket Header */}
                      <div className="p-4 bg-stone-950/80 border-b border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-brand font-black text-sm px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-sm">
                            {order.tableNumber}
                          </span>
                          <span className="font-mono text-xs text-stone-400 font-bold">
                            Ticket #{order.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {order.createdAt && (
                            <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{getTimeAgo(order.createdAt)}</span>
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isPending
                                ? 'bg-amber-400 text-stone-950 animate-pulse'
                                : isPreparing
                                ? 'bg-blue-500 text-white'
                                : isServed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-700 text-stone-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info Strip */}
                      <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between text-xs text-stone-300">
                        <span className="font-bold text-white flex items-center gap-1 truncate">
                          <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{order.customerName || 'Walk-in Guest'}</span>
                        </span>
                        {order.customerPhone && (
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="font-mono text-amber-300 hover:underline flex items-center gap-1 text-[11px] shrink-0"
                          >
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{order.customerPhone}</span>
                          </a>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="p-4 flex-1 space-y-2.5">
                        <div className="space-y-2">
                          {order.items &&
                            order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="py-1 border-b border-white/5 last:border-0"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                                      {item.quantity}×
                                    </span>
                                    <span className="font-bold text-white">
                                      {item.name}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold text-stone-300">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>

                                {/* Custom Dish Instructions (e.g. 2 Chammach Cheeni, Kam Teekha) */}
                                {item.specialInstructions && (
                                  <div className="ml-7 mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                                    <span>📝 Note:</span>
                                    <span className="text-white font-extrabold">{item.specialInstructions}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>

                        {/* Overall Order Notes */}
                        {order.notes && (
                          <div className="mt-2 bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200">
                            <span className="font-black uppercase tracking-wider text-[10px] text-amber-400 block mb-0.5">
                              Kitchen Instructions:
                            </span>
                            {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Footer: Payment Status & Workflow Action Buttons */}
                      <div className="p-4 bg-stone-950/90 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-stone-400 uppercase tracking-wider">Bill Total:</span>
                          <span className="text-lg font-black text-amber-400 font-sans">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>

                        {/* Payment Mode */}
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                          <span className="text-stone-400">Payment Mode:</span>
                          {order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                              <CreditCard className="w-3 h-3" />
                              <span>PAID ONLINE (Razorpay)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40">
                              <Banknote className="w-3 h-3" />
                              <span>CASH (Collect {formatPrice(order.totalAmount)})</span>
                            </span>
                          )}
                        </div>

                        {/* Action Workflow Buttons */}
                        <div>
                          {isPending && (
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
                                className="col-span-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-brand font-black text-xs py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 border border-emerald-400 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>ACCEPT ORDER</span>
                              </button>
                              <button
                                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                                className="bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-300 font-bold text-xs py-2.5 rounded-xl transition border border-white/10 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {isAccepted && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-brand font-black text-xs py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ChefHat className="w-4 h-4" />
                              <span>START PREPARING (IN KITCHEN)</span>
                            </button>
                          )}

                          {isPreparing && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'SERVED')}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-brand font-black text-xs py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>MARK SERVED ON TABLE ➔</span>
                            </button>
                          )}

                          {isServed && (
                            <div className="w-full text-center py-1 text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Order Completed &amp; Served</span>
                            </div>
                          )}

                          {isCancelled && (
                            <div className="w-full text-center py-1 text-xs text-red-400 font-bold flex items-center justify-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Order Cancelled</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 2: SALES & FINANCIAL ANALYTICS ================= */}
        {adminSection === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-500/20 via-red-900/40 to-stone-900 rounded-3xl p-6 border-2 border-amber-400/60 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-brand">
                    💰 Gross Restaurant Sales
                  </span>
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
                  {formatPrice(stats?.totalSales || 0)}
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  Gross revenue across all customer orders
                </p>
              </div>

              <div className="bg-stone-900 rounded-3xl p-6 border border-white/10 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-widest font-brand">
                    📅 Today's Live Sales
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight font-sans">
                  {formatPrice(stats?.todaySales || stats?.totalSales || 0)}
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Average Order: {formatPrice(stats?.averageOrderValue || 0)}
                </p>
              </div>

              <div className="bg-stone-900 rounded-3xl p-6 border border-white/10 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-widest font-brand">
                    💳 Payment Breakdown
                  </span>
                  <CreditCard className="w-5 h-5 text-stone-400" />
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-400 font-bold">Online (Razorpay):</span>
                    <span className="font-mono font-black text-white">{formatPrice(onlineTotal)} ({onlineOrders.length})</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-400 font-bold">Cash on Delivery:</span>
                    <span className="font-mono font-black text-white">{formatPrice(cashTotal)} ({cashOrders.length})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table-Wise Sales Breakdown */}
            <div className="bg-stone-900 rounded-3xl p-6 border border-white/10 shadow-lg">
              <h3 className="font-brand font-black text-base text-amber-300 mb-4 flex items-center gap-2">
                <TableProperties className="w-5 h-5" />
                <span>Table-Wise Revenue Breakdown (Tables T-1 to T-20)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {[...Array(20)].map((_, i) => {
                  const tblKey = `T-${i + 1}`;
                  const tblSales = stats?.tableSales?.[tblKey] || 0;
                  const tblOrdersCount = orders.filter((o) => o.tableNumber === tblKey).length;
                  const isOccupied = occupiedTables.has(tblKey);

                  return (
                    <div
                      key={tblKey}
                      className={`rounded-2xl p-3 border text-center transition ${
                        isOccupied
                          ? 'bg-amber-500/20 border-amber-400 shadow-md'
                          : tblSales > 0
                          ? 'bg-white/5 border-white/15'
                          : 'bg-stone-950/40 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-xs font-black text-white">{tblKey}</span>
                        {isOccupied && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>}
                      </div>
                      <span className="text-sm font-black text-amber-400 block font-mono">
                        {formatPrice(tblSales)}
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        {tblOrdersCount} {tblOrdersCount === 1 ? 'order' : 'orders'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 3: MENU & DISHES OVERVIEW ================= */}
        {adminSection === 'menu' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-stone-900 rounded-2xl p-3.5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  onClick={() => setMenuCatFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    menuCatFilter === 'ALL'
                      ? 'bg-amber-400 text-stone-950 font-black'
                      : 'bg-white/5 hover:bg-white/10 text-stone-300'
                  }`}
                >
                  All ({menuItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMenuCatFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      menuCatFilter === cat
                        ? 'bg-amber-400 text-stone-950 font-black'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dish name..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full bg-stone-950 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Menu Items Table */}
            <div className="bg-stone-900 rounded-3xl border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 text-stone-400 text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Dish</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Tag</th>
                      <th className="p-4">Kitchen Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {menuItems
                      .filter((item) => {
                        const matchCat = menuCatFilter === 'ALL' || item.category === menuCatFilter;
                        const matchSearch =
                          !menuSearch ||
                          item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(menuSearch.toLowerCase());
                        return matchCat && matchSearch;
                      })
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-10 h-10 rounded-xl object-cover border border-white/10"
                              />
                              <div>
                                <span className="font-bold text-white text-xs block">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-stone-400 line-clamp-1 max-w-xs">
                                  {item.description}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-stone-300 font-medium">
                            {item.category}
                          </td>
                          <td className="p-4 font-mono font-black text-amber-400 text-sm">
                            {formatPrice(item.price)}
                          </td>
                          <td className="p-4">
                            {item.tag ? (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {item.tag}
                              </span>
                            ) : (
                              <span className="text-stone-500">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>Available (Ready to Serve)</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 4: FLOOR & TABLES ================= */}
        {adminSection === 'tables' && (
          <div className="space-y-6">
            <div className="bg-stone-900 rounded-3xl p-6 border border-white/10 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-brand font-black text-lg text-white">
                    Rooftop Dining Floor Map (20 Tables)
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Live visual status of dining tables at Aman International Mall Rooftop.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-stone-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>Vacant</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                    <span>Dining / Active Order</span>
                  </span>
                </div>
              </div>

              {/* Table Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {[...Array(20)].map((_, i) => {
                  const tbl = `T-${i + 1}`;
                  const tblActiveOrder = activeOrders.find((o) => o.tableNumber === tbl);

                  return (
                    <div
                      key={tbl}
                      className={`rounded-2xl p-4 border-2 transition flex flex-col justify-between min-h-[120px] ${
                        tblActiveOrder
                          ? 'bg-gradient-to-br from-amber-950/60 to-stone-900 border-amber-400 shadow-lg'
                          : 'bg-stone-950/80 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-brand font-black text-sm text-white">
                          Table {i + 1}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            tblActiveOrder ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                          }`}
                        ></span>
                      </div>

                      {tblActiveOrder ? (
                        <div className="my-2">
                          <span className="text-[11px] font-bold text-amber-300 block truncate">
                            {tblActiveOrder.customerName}
                          </span>
                          <span className="text-xs font-mono font-black text-white block">
                            {formatPrice(tblActiveOrder.totalAmount)}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            Status: <strong className="text-amber-200">{tblActiveOrder.status}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="my-2 text-[11px] text-stone-500 font-medium">
                          Vacant / Ready for guests
                        </div>
                      )}

                      <button
                        onClick={openQrModal}
                        className="mt-1 w-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-[10px] font-bold py-1 rounded-lg border border-white/10 transition"
                      >
                        Print QR
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
