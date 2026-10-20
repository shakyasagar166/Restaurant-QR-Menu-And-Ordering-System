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
  Terminal,
  Activity,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  Printer,
  FileText,
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
  // Navigation tabs within Admin POS Console
  const [adminSection, setAdminSection] = useState('orders'); // 'orders' | 'analytics' | 'menu' | 'tables'
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCatFilter, setMenuCatFilter] = useState('ALL');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

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

  // Filtered orders by status and search (table / customer / phone / dish)
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row font-sans select-none antialiased">
      {/* =========================================================================
          1. MODERN HIGH-TECH ENTERPRISE SIDEBAR (100% DIFFERENT FROM CUSTOMER VIEW)
          Color: Deep Slate Obsidian (#0f172a), Electric Indigo & Cyan Accents
      ========================================================================= */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#0f172a] border-r border-slate-800/80 flex flex-col justify-between shrink-0 z-30 shadow-2xl">
        {/* Top: Terminal Brand & Live Indicator */}
        <div>
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-mono font-black text-sm sm:text-base text-white tracking-wider leading-none">
                      BIKANER<span className="text-cyan-400">POS</span>
                    </h1>
                    <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded">
                      PRO
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                    Kitchen &amp; Terminal Console
                  </span>
                </div>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
                className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* SSE Terminal Connection Badge */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                SSE Stream Live
              </span>
              <span className="text-slate-500 font-mono text-[10px]">
                Port 8080 • IST
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop always visible, Mobile toggleable) */}
          <nav className={`p-3 space-y-1.5 ${isSidebarOpenMobile ? 'block' : 'hidden md:block'}`}>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 font-mono">
              Management Modules
            </div>

            {/* 1. Live Orders & KOT */}
            <button
              onClick={() => {
                setAdminSection('orders');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                adminSection === 'orders'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ChefHat className={`w-4 h-4 ${adminSection === 'orders' ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Live Orders &amp; KOT</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* 2. Sales & Analytics */}
            <button
              onClick={() => {
                setAdminSection('analytics');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                adminSection === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${adminSection === 'analytics' ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Sales &amp; Analytics</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {formatPrice(stats?.todaySales || stats?.totalSales || 0)}
              </span>
            </button>

            {/* 3. Menu & Live Inventory */}
            <button
              onClick={() => {
                setAdminSection('menu');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                adminSection === 'menu'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Utensils className={`w-4 h-4 ${adminSection === 'menu' ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Menu &amp; Dishes</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {menuItems.length} items
              </span>
            </button>

            {/* 4. Floor Map & Tables */}
            <button
              onClick={() => {
                setAdminSection('tables');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                adminSection === 'tables'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TableProperties className={`w-4 h-4 ${adminSection === 'tables' ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Floor &amp; Tables</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                {occupiedTables.size}/20 Active
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Staff Identity & Exit to Customer Site */}
        <div className={`p-4 border-t border-slate-800/80 bg-slate-900/60 space-y-3 ${isSidebarOpenMobile ? 'block' : 'hidden md:block'}`}>
          {/* Return to Customer Menu */}
          <button
            onClick={onBackToMenu}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs py-2 px-3 rounded-xl shadow-md transition active:scale-95"
            title="Preview Customer Dining Website"
          >
            <span>Customer Menu View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Staff Profile Card */}
          <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                ADM
              </div>
              <div className="truncate">
                <span className="font-bold text-white text-xs block truncate leading-tight">
                  {adminUser?.name || 'Shivam Shakya'}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  +91 {adminUser?.phone || '9058605348'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition shrink-0 ml-1"
              title="Logout Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Tech Dark Console Layout)
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#090d16]">
        {/* Top Executive Control Strip */}
        <header className="sticky top-0 z-20 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          {/* Left: Global Quick Filter / Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter Table (T-1), Customer, Dish, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Sound Alert Actions & Live Digital Clock */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Live IST Clock */}
            <div className="flex items-center gap-1.5 bg-[#090d16] px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white font-bold">
                {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-500">IST</span>
            </div>

            {/* Test Bell Sound */}
            <button
              onClick={handleTestBell}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs border border-indigo-400/40 transition active:scale-95 cursor-pointer"
              title="Test Bell Sound Chime"
            >
              <Bell className="w-3.5 h-3.5 animate-bell text-cyan-300" />
              <span className="hidden xs:inline">Test Bell</span>
            </button>

            {/* Sound Mute / Unmute */}
            <button
              onClick={() => setIsBellMuted(!isBellMuted)}
              className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isBellMuted
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-300'
                  : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
              }`}
              title={isBellMuted ? 'Sound Muted (Click to Unmute)' : 'Sound Enabled (Click to Mute)'}
            >
              {isBellMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* QR Code Standee Modal Trigger */}
            <button
              onClick={openQrModal}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition"
              title="Generate / Print Table QR Standees"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Table QR</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Sync Orders Now"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* =========================================================================
              VIEW 1: LIVE ORDERS & KOT TERMINAL
          ========================================================================= */}
          {adminSection === 'orders' && (
            <div className="space-y-6">
              {/* Modern Tech KPI Cards Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#0f172a] rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500"></div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Pending Action
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl sm:text-3xl font-mono font-black ${pendingCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-200'}`}>
                      {pendingCount}
                    </span>
                    <span className="text-[10px] text-amber-400/90 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Needs Accept
                    </span>
                  </div>
                </div>

                <div className="bg-[#0f172a] rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    In Kitchen / Cooking
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-400">
                      {preparingCount + acceptedCount}
                    </span>
                    <span className="text-[10px] text-cyan-400/90 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      On Stove
                    </span>
                  </div>
                </div>

                <div className="bg-[#0f172a] rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Served Successfully
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
                      {servedCount}
                    </span>
                    <span className="text-[10px] text-emerald-400/90 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="bg-[#0f172a] rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Gross Shift Sales
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-mono font-black text-indigo-300 truncate">
                      {formatPrice(stats?.totalSales || 0)}
                    </span>
                    <span className="text-[10px] text-indigo-400/90 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Filter Bar (Modern SaaS Pills) */}
              <div className="bg-[#0f172a] rounded-2xl p-2.5 border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-sm">
                <div className="flex items-center gap-1.5">
                  {[
                    { key: 'ALL', label: `All Tickets (${orders.length})` },
                    { key: 'PENDING', label: `🔔 Pending (${pendingCount})`, highlight: pendingCount > 0 },
                    { key: 'ACCEPTED', label: `Accepted (${acceptedCount})` },
                    { key: 'PREPARING', label: `👨‍🍳 In-Kitchen (${preparingCount})` },
                    { key: 'SERVED', label: `✅ Served (${servedCount})` },
                    { key: 'CANCELLED', label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                        activeFilter === tab.key
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : tab.highlight
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 font-mono hidden lg:block shrink-0 px-2">
                  Showing {filteredOrders.length} tickets
                </div>
              </div>

              {/* Orders Grid (High-Contrast POS Kitchen Display Cards) */}
              {filteredOrders.length === 0 ? (
                <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-12 text-center my-6 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                    📋
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    No Orders in this View
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    {searchQuery
                      ? `No orders matching query "${searchQuery}".`
                      : activeFilter !== 'ALL'
                      ? `No orders currently in ${activeFilter} state.`
                      : 'When diners place orders from Table QR, kitchen tickets will automatically appear here with audio bell chime.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredOrders.map((order) => {
                    const isPending = order.status === 'PENDING';
                    const isAccepted = order.status === 'ACCEPTED';
                    const isPreparing = order.status === 'PREPARING';
                    const isServed = order.status === 'SERVED';
                    const isCancelled = order.status === 'CANCELLED';

                    return (
                      <div
                        key={order.id}
                        className={`bg-[#0f172a] rounded-3xl border-2 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-xl ${
                          isPending
                            ? 'border-amber-500/80 ring-2 ring-amber-500/30'
                            : isPreparing
                            ? 'border-cyan-500/80 shadow-cyan-500/10'
                            : isServed
                            ? 'border-emerald-600/60 opacity-90'
                            : 'border-slate-800'
                        }`}
                      >
                        {/* Ticket Top Header */}
                        <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs">
                              {order.tableNumber}
                            </span>
                            <span className="font-mono text-xs text-slate-400 font-bold">
                              Ticket #{order.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {order.createdAt && (
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span>{getTimeAgo(order.createdAt)}</span>
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isPending
                                  ? 'bg-amber-400 text-slate-950 animate-pulse'
                                  : isPreparing
                                  ? 'bg-cyan-500 text-slate-950 font-bold'
                                  : isServed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info Strip */}
                        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
                          <span className="font-bold text-white flex items-center gap-1 truncate">
                            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{order.customerName || 'Walk-in Guest'}</span>
                          </span>
                          {order.customerPhone && (
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="font-mono text-cyan-300 hover:underline flex items-center gap-1 text-[11px] shrink-0"
                            >
                              <Phone className="w-3 h-3 text-cyan-400" />
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
                                  className="py-1.5 border-b border-slate-800/60 last:border-0"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                                        {item.quantity}×
                                      </span>
                                      <span className="font-bold text-white">
                                        {item.name}
                                      </span>
                                    </div>
                                    <span className="font-mono font-bold text-slate-300">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>

                                  {/* Custom Dish Instructions (e.g. 2 Chammach Cheeni, Kam Teekha) */}
                                  {item.specialInstructions && (
                                    <div className="ml-7 mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-200 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/40">
                                      <span className="text-cyan-400">📝 Chef Note:</span>
                                      <span className="text-white font-black">{item.specialInstructions}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>

                          {/* Overall Order Notes */}
                          {order.notes && (
                            <div className="mt-2 bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5 text-xs text-indigo-200">
                              <span className="font-black uppercase tracking-wider text-[10px] text-cyan-400 block mb-0.5">
                                Order Notes:
                              </span>
                              {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Footer: Payment Status & Workflow Action Buttons */}
                        <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400 uppercase tracking-wider font-mono">Bill Amount:</span>
                            <span className="text-lg font-black text-cyan-300 font-mono">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>

                          {/* Payment Mode */}
                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/60">
                            <span className="text-slate-400">Payment:</span>
                            {order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                                <CreditCard className="w-3 h-3 text-emerald-400" />
                                <span>PAID ONLINE (Razorpay)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40">
                                <Banknote className="w-3 h-3 text-amber-400" />
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
                                  className="col-span-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 border border-emerald-400/40 cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>ACCEPT ORDER</span>
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                                  className="bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 font-bold text-xs py-2.5 rounded-xl transition border border-slate-700 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {isAccepted && (
                              <button
                                onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <ChefHat className="w-4 h-4" />
                                <span>START PREPARING (IN KITCHEN)</span>
                              </button>
                            )}

                            {isPreparing && (
                              <button
                                onClick={() => onUpdateStatus(order.id, 'SERVED')}
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-mono font-bold text-xs py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
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
                              <div className="w-full text-center py-1 text-xs text-rose-400 font-bold flex items-center justify-center gap-1">
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

          {/* =========================================================================
              VIEW 2: SALES & FINANCIAL ANALYTICS
          ========================================================================= */}
          {adminSection === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Total All-Time Gross Sales
                    </span>
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">
                    {formatPrice(stats?.totalSales || 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Total orders: {stats?.totalOrders || orders.length}
                  </p>
                </div>

                <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Today's Live Shift Revenue
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-tight">
                    {formatPrice(stats?.todaySales || stats?.totalSales || 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Average ticket: {formatPrice(stats?.averageOrderValue || 0)}
                  </p>
                </div>

                <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Settlement Mode Split
                    </span>
                    <CreditCard className="w-5 h-5 text-cyan-400" />
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

              {/* Table Revenue Breakdown */}
              <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl">
                <h3 className="font-mono font-black text-base text-cyan-300 mb-4 flex items-center gap-2">
                  <TableProperties className="w-5 h-5" />
                  <span>Table Revenue Distribution (T-1 to T-20)</span>
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
                            ? 'bg-indigo-500/20 border-cyan-400 shadow-lg'
                            : tblSales > 0
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-slate-950/60 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-xs font-mono font-black text-white">{tblKey}</span>
                          {isOccupied && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                        </div>
                        <span className="text-sm font-black text-cyan-300 block font-mono">
                          {formatPrice(tblSales)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {tblOrdersCount} {tblOrdersCount === 1 ? 'order' : 'orders'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: MENU & INVENTORY OVERVIEW
          ========================================================================= */}
          {adminSection === 'menu' && (
            <div className="space-y-6">
              {/* Category Toolbar */}
              <div className="bg-[#0f172a] rounded-2xl p-3.5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <button
                    onClick={() => setMenuCatFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
                      menuCatFilter === 'ALL'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    All ({menuItems.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMenuCatFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
                        menuCatFilter === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dish name..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] font-mono uppercase font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">Dish Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Tag</th>
                        <th className="p-4">Kitchen Inventory Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
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
                          <tr key={item.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                                />
                                <div>
                                  <span className="font-bold text-white text-xs block">
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">
                                    {item.description}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-300 font-medium">
                              {item.category}
                            </td>
                            <td className="p-4 font-mono font-black text-cyan-300 text-sm">
                              {formatPrice(item.price)}
                            </td>
                            <td className="p-4">
                              {item.tag ? (
                                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                  {item.tag}
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>In-Stock &amp; Ready</span>
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

          {/* =========================================================================
              VIEW 4: FLOOR & TABLES TERMINAL
          ========================================================================= */}
          {adminSection === 'tables' && (
            <div className="space-y-6">
              <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-mono font-black text-lg text-white">
                      Rooftop Dining Floor Plan (20 Tables)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live status monitor of dining tables at Aman International Mall Rooftop.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                      <span>Vacant</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>Dining / Active Bill</span>
                    </span>
                  </div>
                </div>

                {/* 20 Table Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {[...Array(20)].map((_, i) => {
                    const tbl = `T-${i + 1}`;
                    const tblActiveOrder = activeOrders.find((o) => o.tableNumber === tbl);

                    return (
                      <div
                        key={tbl}
                        className={`rounded-2xl p-4 border-2 transition flex flex-col justify-between min-h-[120px] ${
                          tblActiveOrder
                            ? 'bg-indigo-950/50 border-cyan-400 shadow-lg shadow-cyan-500/10'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-sm text-white">
                            Table {i + 1}
                          </span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              tblActiveOrder ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                            }`}
                          ></span>
                        </div>

                        {tblActiveOrder ? (
                          <div className="my-2">
                            <span className="text-[11px] font-bold text-cyan-300 block truncate">
                              {tblActiveOrder.customerName}
                            </span>
                            <span className="text-xs font-mono font-black text-white block">
                              {formatPrice(tblActiveOrder.totalAmount)}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              Status: <strong className="text-cyan-200">{tblActiveOrder.status}</strong>
                            </span>
                          </div>
                        ) : (
                          <div className="my-2 text-[11px] text-slate-500 font-medium">
                            Vacant / Ready
                          </div>
                        )}

                        <button
                          onClick={openQrModal}
                          className="mt-1 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold py-1 rounded-lg border border-slate-700 transition"
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
    </div>
  );
}
