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
  Edit2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice, formatTime, getTimeAgo } from '../utils/formatters';
import { bellPlayer } from '../utils/sound';
import { apiService } from '../api/apiService';

// Quick high-resolution photo presets for common Indian dishes
const PHOTO_PRESETS = [
  { label: '🍲 Thali', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80' },
  { label: '🥞 Dosa', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80' },
  { label: '🧀 Shahi Paneer', url: 'https://images.unsplash.com/photo-1567184109191-3783b32180c4?w=600&auto=format&fit=crop&q=80' },
  { label: '🥘 Dal Makhani', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
  { label: '🫓 Butter Naan', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80' },
  { label: '☕ Masala Chai', url: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=600&auto=format&fit=crop&q=80' },
  { label: '🥛 Sweet Lassi', url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=80' },
  { label: '🥟 Samosa Chaat', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
  { label: '🍯 Gulab Jamun', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80' },
];

export default function AdminDashboard({
  orders = [],
  stats,
  menuItems = [],
  categories = [],
  onUpdateStatus,
  onRefresh,
  onRefreshMenu,
  isBellMuted,
  setIsBellMuted,
  openQrModal,
  adminUser,
  onLogout,
  onBackToMenu,
}) {
  // Navigation tabs within Admin POS Console
  const [adminSection, setAdminSection] = useState('orders'); // 'orders' | 'analytics' | 'menu' | 'tables'
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ONLINE' | 'CASH' | 'ACCEPTED' | 'PREPARING' | 'SERVED' | 'CANCELLED'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCatFilter, setMenuCatFilter] = useState('ALL');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Local state for dishes to ensure instant optimistic updates
  const [localMenuItems, setLocalMenuItems] = useState(menuItems);
  useEffect(() => {
    setLocalMenuItems(menuItems);
  }, [menuItems]);

  // Dish Editing & Creation States
  const [editingDish, setEditingDish] = useState(null); // null or dish object
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [dishFormData, setDishFormData] = useState({
    id: null,
    name: '',
    category: '',
    price: '',
    description: '',
    imageUrl: '',
    tag: '',
    isAvailable: true,
  });
  const [isSavingDish, setIsSavingDish] = useState(false);
  const [dishSaveError, setDishSaveError] = useState('');
  const [togglingDishId, setTogglingDishId] = useState(null);
  const [isAcceptingAll, setIsAcceptingAll] = useState(false);

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

  // Order Counts
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const pendingCount = pendingOrders.length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const servedCount = orders.filter((o) => o.status === 'SERVED').length;
  const acceptedCount = orders.filter((o) => o.status === 'ACCEPTED').length;

  // Online vs Cash totals calculation
  const onlineOrders = orders.filter((o) => o.paymentMethod === 'ONLINE' || o.paymentStatus === 'PAID');
  const onlineTotal = onlineOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const cashOrders = orders.filter((o) => o.paymentMethod !== 'ONLINE' && o.paymentStatus !== 'PAID');
  const cashTotal = cashOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // =========================================================================
  // FAIL-SAFE ALERT SYSTEM: ZERO MISSED ORDERS
  // 1. Repeating Audio Loop every 18 seconds while any order is PENDING
  // 2. Dynamic Browser Tab Title with flashing alert
  // =========================================================================
  useEffect(() => {
    if (pendingCount > 0 && !isBellMuted) {
      const alarmInterval = setInterval(() => {
        try {
          bellPlayer.playOrderBell();
        } catch (e) {
          console.warn('Audio alert loop notice:', e);
        }
      }, 18000);
      return () => clearInterval(alarmInterval);
    }
  }, [pendingCount, isBellMuted]);

  useEffect(() => {
    if (pendingCount > 0) {
      document.title = `🚨 (${pendingCount}) NEW ORDER WAITING! - Bikaner POS`;
    } else {
      document.title = 'Bikaner Express POS | Kitchen & Admin Console';
    }
    return () => {
      document.title = 'Bikaner Express Foods | Aman International Mall';
    };
  }, [pendingCount]);

  // Elapsed Wait Time & Urgency Calculator
  const getOrderUrgency = (createdAt) => {
    if (!createdAt) return { label: 'Just now', color: 'text-slate-400', isUrgent: false, minutes: 0 };
    const orderTime = new Date(createdAt).getTime();
    const diffMs = Date.now() - orderTime;
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 2) {
      return { label: `🟢 ${minutes}m ago (Fresh)`, color: 'text-emerald-400', isUrgent: false, minutes };
    } else if (minutes < 5) {
      return { label: `🟡 ${minutes}m waiting`, color: 'text-amber-300 font-bold', isUrgent: false, minutes };
    } else {
      return { label: `🔴 ${minutes}m (OVERDUE!)`, color: 'text-rose-400 font-black animate-pulse', isUrgent: true, minutes };
    }
  };

  // Filtered orders by status, payment mode, and search query
  const filteredOrders = orders.filter((order) => {
    let matchesStatus = true;
    if (activeFilter === 'ALL') {
      matchesStatus = true;
    } else if (activeFilter === 'ONLINE') {
      matchesStatus = order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID';
    } else if (activeFilter === 'CASH') {
      matchesStatus = order.paymentMethod !== 'ONLINE' && order.paymentStatus !== 'PAID';
    } else {
      matchesStatus = order.status === activeFilter;
    }
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

  // Active occupied tables list
  const activeOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'PREPARING');
  const occupiedTables = new Set(activeOrders.map((o) => o.tableNumber));

  // Quick Accept All Pending Orders
  const handleAcceptAllPending = async () => {
    if (pendingOrders.length === 0) return;
    setIsAcceptingAll(true);
    try {
      await Promise.all(
        pendingOrders.map((ord) => apiService.updateOrderStatus(ord.id, 'ACCEPTED'))
      );
      if (onRefresh) onRefresh();
    } catch (e) {
      alert('Error accepting all orders: ' + e.message);
    } finally {
      setIsAcceptingAll(false);
    }
  };

  // =========================================================================
  // DISH MANAGEMENT ACTIONS (PRICE, NAME, PHOTO, STOCK, DESCRIPTION)
  // =========================================================================
  const handleToggleDishAvailability = async (dishId, currentStatus) => {
    setTogglingDishId(dishId);
    // Optimistic UI update
    setLocalMenuItems((prev) =>
      prev.map((item) =>
        item.id === dishId
          ? { ...item, isAvailable: !currentStatus, available: !currentStatus }
          : item
      )
    );

    try {
      await apiService.toggleDishAvailability(dishId);
      if (onRefreshMenu) onRefreshMenu();
    } catch (err) {
      alert('Failed to update stock status: ' + err.message);
      // Revert if error
      if (onRefreshMenu) onRefreshMenu();
    } finally {
      setTogglingDishId(null);
    }
  };

  const openEditModal = (dish) => {
    setDishFormData({
      id: dish.id,
      name: dish.name || '',
      category: dish.category || 'North Indian Main Course',
      price: dish.price || 0,
      description: dish.description || '',
      imageUrl: dish.imageUrl || '',
      tag: dish.tag || '',
      isAvailable: dish.isAvailable !== false && dish.available !== false,
    });
    setDishSaveError('');
    setEditingDish(dish);
  };

  const openAddModal = () => {
    setDishFormData({
      id: null,
      name: '',
      category: categories[0] || 'North Indian Main Course',
      price: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      tag: '',
      isAvailable: true,
    });
    setDishSaveError('');
    setIsAddDishOpen(true);
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    if (!dishFormData.name.trim()) {
      setDishSaveError('Please enter a dish name');
      return;
    }
    const numPrice = parseFloat(dishFormData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      setDishSaveError('Please enter a valid price in ₹');
      return;
    }

    setIsSavingDish(true);
    setDishSaveError('');

    const payload = {
      name: dishFormData.name.trim(),
      category: dishFormData.category.trim() || 'General',
      price: numPrice,
      description: dishFormData.description.trim(),
      imageUrl: dishFormData.imageUrl.trim(),
      tag: dishFormData.tag.trim() || null,
      isAvailable: dishFormData.isAvailable,
      available: dishFormData.isAvailable,
      veg: true,
    };

    try {
      if (dishFormData.id) {
        // Edit existing dish
        const updated = await apiService.updateMenuItem(dishFormData.id, payload);
        setLocalMenuItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        // Create new dish
        const created = await apiService.createMenuItem(payload);
        setLocalMenuItems((prev) => [created, ...prev]);
      }

      if (onRefreshMenu) onRefreshMenu();
      setEditingDish(null);
      setIsAddDishOpen(false);
    } catch (err) {
      setDishSaveError(err.message || 'Failed to save dish changes');
    } finally {
      setIsSavingDish(false);
    }
  };

  const handleDeleteDish = async (dishId, dishName) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}" from the restaurant menu?`)) {
      return;
    }

    try {
      await apiService.deleteMenuItem(dishId);
      setLocalMenuItems((prev) => prev.filter((item) => item.id !== dishId));
      if (onRefreshMenu) onRefreshMenu();
    } catch (err) {
      alert('Failed to delete dish: ' + err.message);
    }
  };

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

            {/* 2. Menu & Live Inventory */}
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
                <span>Menu &amp; Dishes (एडमिन एडिट)</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                {localMenuItems.length}
              </span>
            </button>

            {/* 3. Sales & Analytics */}
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
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs py-2 px-3 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
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
              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition shrink-0 ml-1 cursor-pointer"
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
        {/* =========================================================================
            FAIL-SAFE ZERO-MISSED ORDER BANNER (Sticky at Top when pending orders exist)
        ========================================================================= */}
        {pendingCount > 0 && (
          <div className="sticky top-0 z-30 bg-gradient-to-r from-rose-950 via-amber-950 to-rose-950 border-b-2 border-amber-400 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xl animate-pulse">
            <div className="flex items-center gap-2.5 text-white">
              <span className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-base shadow-md">
                🚨
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs sm:text-sm text-amber-300 tracking-wide uppercase">
                    {pendingCount} {pendingCount === 1 ? 'NEW ORDER AWAITING ACCEPTANCE!' : 'NEW ORDERS AWAITING ACCEPTANCE!'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                </div>
                <span className="text-[11px] text-slate-300 block">
                  ⚠️ Zero-Missed-Order System Active: Customer is waiting at table. Accept ticket now!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAdminSection('orders');
                  setActiveFilter('PENDING');
                }}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                View Tickets ({pendingCount})
              </button>
              {pendingCount > 1 && (
                <button
                  onClick={handleAcceptAllPending}
                  disabled={isAcceptingAll}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isAcceptingAll ? 'Accepting...' : `Accept All (${pendingCount})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Executive Control Strip */}
        <header className="sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
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
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Generate / Print Table QR Standees"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Table QR</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
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
                    Paid Online (Razorpay)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
                      {onlineOrders.length}
                    </span>
                    <span className="text-[10px] text-emerald-400/90 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {formatPrice(onlineTotal)}
                    </span>
                  </div>
                </div>

                <div className="bg-[#0f172a] rounded-2xl p-4 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Cash to Collect
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-mono font-black text-amber-300 truncate">
                      {cashOrders.length}
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {formatPrice(cashTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Payment Filter Bar (Modern SaaS Pills with Online vs Cash Highlights) */}
              <div className="bg-[#0f172a] rounded-2xl p-2.5 border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-sm">
                <div className="flex items-center gap-1.5">
                  {[
                    { key: 'ALL', label: `All Tickets (${orders.length})` },
                    { key: 'PENDING', label: `🔔 Pending (${pendingCount})`, highlight: pendingCount > 0 },
                    { key: 'ONLINE', label: `⚡ Online Paid (${onlineOrders.length})`, isOnline: true },
                    { key: 'CASH', label: `💵 Cash on Delivery (${cashOrders.length})`, isCash: true },
                    { key: 'ACCEPTED', label: `Accepted (${acceptedCount})` },
                    { key: 'PREPARING', label: `👨‍🍳 In-Kitchen (${preparingCount})` },
                    { key: 'SERVED', label: `✅ Served (${servedCount})` },
                    { key: 'CANCELLED', label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                        activeFilter === tab.key
                          ? tab.isOnline
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400'
                            : tab.isCash
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-400'
                            : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : tab.highlight
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : tab.isOnline
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950'
                          : tab.isCash
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-950'
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
                      ? `No orders currently matching filter "${activeFilter}".`
                      : 'When diners place orders from Table QR, kitchen tickets will automatically appear here with audio bell chime.'}
                  </p>
                  {(searchQuery || activeFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilter('ALL');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Reset View Filters
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
                    const isOnlinePaid = order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID';
                    const urgency = getOrderUrgency(order.createdAt);

                    return (
                      <div
                        key={order.id}
                        className={`bg-[#0f172a] rounded-3xl border-2 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-xl ${
                          isPending
                            ? urgency.isUrgent
                              ? 'border-rose-500 ring-4 ring-rose-500/40 animate-pulse'
                              : 'border-amber-500/90 ring-2 ring-amber-500/30'
                            : isOnlinePaid
                            ? 'border-emerald-500/60 shadow-emerald-500/10'
                            : isPreparing
                            ? 'border-cyan-500/80 shadow-cyan-500/10'
                            : isServed
                            ? 'border-emerald-600/50 opacity-90'
                            : 'border-slate-800'
                        }`}
                      >
                        {/* =========================================================================
                            TOP BADGE: DISTINCT PAYMENT HIGHLIGHT (ONLINE VS CASH)
                        ========================================================================= */}
                        {isOnlinePaid ? (
                          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-4 py-2 border-b border-emerald-500/40 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/50">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                              </span>
                              <span className="font-mono font-black text-xs text-emerald-300 tracking-wider">
                                ⚡ PAID ONLINE (RAZORPAY)
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                              ✓ NO CASH COLLECTION
                            </span>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-4 py-2 border-b border-amber-500/40 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/50">
                                <Banknote className="w-3.5 h-3.5 text-amber-400" />
                              </span>
                              <span className="font-mono font-black text-xs text-amber-300 tracking-wider">
                                💵 CASH ON DELIVERY
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-amber-200 font-mono bg-amber-500/25 px-2 py-0.5 rounded-full border border-amber-400/40 animate-pulse">
                              COLLECT {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        )}

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
                            {/* Live Wait Duration Badge */}
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 ${urgency.color}`}>
                              {urgency.label}
                            </span>

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

                        {/* Footer: Bill & Action Workflow Buttons */}
                        <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400 uppercase tracking-wider font-mono">Bill Amount:</span>
                            <span className="text-lg font-black text-cyan-300 font-mono">
                              {formatPrice(order.totalAmount)}
                            </span>
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
              VIEW 2: MENU & DISHES MANAGEMENT (PRICE, NAME, PHOTO, IN/OUT STOCK)
          ========================================================================= */}
          {adminSection === 'menu' && (
            <div className="space-y-6">
              {/* Top Action Bar: Add New Dish & Inventory Summary */}
              <div className="bg-[#0f172a] rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-black text-lg text-white">
                      Restaurant Menu &amp; Inventory Management
                    </h3>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-md border border-indigo-500/30">
                      Live Admin Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Change dish prices, names, photo URLs, descriptions, and toggle In-Stock / Out-of-Stock instantly.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400 hidden sm:block text-right">
                    <span className="text-emerald-400 font-bold block">
                      {localMenuItems.filter((i) => i.isAvailable !== false && i.available !== false).length} In-Stock
                    </span>
                    <span className="text-rose-400 font-bold block">
                      {localMenuItems.filter((i) => i.isAvailable === false || i.available === false).length} Out-of-Stock
                    </span>
                  </div>

                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition active:scale-95 border border-emerald-400/40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>➕ ADD NEW DISH (नई डिश जोड़ें)</span>
                  </button>
                </div>
              </div>

              {/* Category Toolbar & Search */}
              <div className="bg-[#0f172a] rounded-2xl p-3.5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <button
                    onClick={() => setMenuCatFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shrink-0 cursor-pointer ${
                      menuCatFilter === 'ALL'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    All ({localMenuItems.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMenuCatFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition shrink-0 cursor-pointer ${
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

              {/* Interactive Items Table */}
              <div className="bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] font-mono uppercase font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">Dish Photo &amp; Details</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price (₹)</th>
                        <th className="p-4">Tag</th>
                        <th className="p-4">Stock Status (Click to Toggle)</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {localMenuItems
                        .filter((item) => {
                          const matchCat = menuCatFilter === 'ALL' || item.category === menuCatFilter;
                          const matchSearch =
                            !menuSearch ||
                            item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                            item.category.toLowerCase().includes(menuSearch.toLowerCase());
                          return matchCat && matchSearch;
                        })
                        .map((item) => {
                          const isAvailable = item.isAvailable !== false && item.available !== false;
                          const isToggling = togglingDishId === item.id;

                          return (
                            <tr key={item.id} className="hover:bg-slate-800/40 transition">
                              {/* Photo + Name + Description */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-900 group">
                                    <img
                                      src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                                      alt={item.name}
                                      className={`w-full h-full object-cover transition duration-300 ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                                    />
                                    {!isAvailable && (
                                      <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center">
                                        <span className="text-[8px] font-black text-red-200">OUT</span>
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold text-sm block ${!isAvailable ? 'text-slate-400 line-through' : 'text-white'}`}>
                                        {item.name}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                                      {item.description || 'Prepared fresh with pure desi ghee and traditional recipe.'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="p-4 text-slate-300 font-medium">
                                <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-xs font-mono">
                                  {item.category}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="p-4 font-mono font-black text-cyan-300 text-base">
                                {formatPrice(item.price)}
                              </td>

                              {/* Tag */}
                              <td className="p-4">
                                {item.tag ? (
                                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                    {item.tag}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>

                              {/* 1-Click Stock Toggle Button */}
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleDishAvailability(item.id, isAvailable)}
                                  disabled={isToggling}
                                  className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition active:scale-95 cursor-pointer ${
                                    isAvailable
                                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900'
                                      : 'bg-rose-950/90 text-rose-300 border-rose-500/60 hover:bg-rose-900'
                                  } ${isToggling ? 'opacity-50' : ''}`}
                                  title="Click to toggle In-Stock / Out-of-Stock instantly"
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                                    }`}
                                  ></span>
                                  <span>
                                    {isAvailable ? 'In-Stock (उपलब्ध है)' : 'Out-of-Stock (खत्म / Sold Out)'}
                                  </span>
                                </button>
                              </td>

                              {/* Action Buttons: Edit & Delete */}
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="p-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold"
                                    title="Edit Dish Name, Price, Photo, Description"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteDish(item.id, item.name)}
                                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition active:scale-95 cursor-pointer"
                                    title="Delete Dish from Menu"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: SALES & FINANCIAL ANALYTICS
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
                          className="mt-1 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold py-1 rounded-lg border border-slate-700 transition cursor-pointer"
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

      {/* =========================================================================
          MODAL: EDIT OR ADD DISH (NAME, PRICE, PHOTO, STOCK, DESCRIPTION)
      ========================================================================= */}
      {(editingDish || isAddDishOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-cyan-300 flex items-center justify-center font-bold">
                  {editingDish ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-mono font-black text-white text-base">
                    {editingDish ? 'Edit Dish Details / डिश बदलें' : 'Add New Dish to Menu / नई डिश जोड़ें'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Changes reflect immediately on the Customer Menu and QR ordering.
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingDish(null);
                  setIsAddDishOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDish} className="p-6 overflow-y-auto space-y-4 text-xs">
              {dishSaveError && (
                <div className="bg-rose-950/80 border border-rose-500 text-rose-200 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{dishSaveError}</span>
                </div>
              )}

              {/* Row 1: Dish Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Dish Name (डिश का नाम) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Shahi Paneer Butter Masala"
                    value={dishFormData.name}
                    onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Price in ₹ (कीमत) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="e.g. 240"
                    value={dishFormData.price}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Row 2: Category & Special Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Category (कैटेगरी)</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    placeholder="Select or enter category..."
                    value={dishFormData.category}
                    onChange={(e) => setDishFormData({ ...dishFormData, category: e.target.value })}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <datalist id="category-suggestions">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                    <option value="Thali" />
                    <option value="North Indian Main Course" />
                    <option value="South Indian" />
                    <option value="Sweets & Desserts" />
                    <option value="Chaat & Snacks" />
                    <option value="Breads" />
                    <option value="Beverages & Drinks" />
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Tag Badge (स्पेशल टैग)</label>
                  <select
                    value={dishFormData.tag}
                    onChange={(e) => setDishFormData({ ...dishFormData, tag: e.target.value })}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">No Special Tag</option>
                    <option value="Bestseller">⭐ Bestseller</option>
                    <option value="Chef Special">👑 Chef Special</option>
                    <option value="Must Try">🔥 Must Try</option>
                    <option value="Popular">❤️ Popular</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Photo URL & Live Preview */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">
                  Photo URL (डिश की फोटो का लिंक)
                </label>
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                    <img
                      src={dishFormData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      placeholder="Paste image web link (https://...)"
                      value={dishFormData.imageUrl}
                      onChange={(e) => setDishFormData({ ...dishFormData, imageUrl: e.target.value })}
                      className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Live preview updates on left. You can paste any image link or click a preset below.
                    </span>
                  </div>
                </div>

                {/* Quick Presets Pills */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                    Quick Photo Presets (1-Click Select):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setDishFormData({ ...dishFormData, imageUrl: preset.url })}
                        className="bg-slate-900 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-800 rounded-lg px-2 py-1 text-[11px] transition active:scale-95 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Description (डिश का विवरण / सामग्री)</label>
                <textarea
                  rows="2"
                  placeholder="Prepared fresh with pure desi ghee, aromatic ground spices & finest ingredients..."
                  value={dishFormData.description}
                  onChange={(e) => setDishFormData({ ...dishFormData, description: e.target.value })}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Row 5: Stock Availability Switch */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">
                    Kitchen Stock Availability (स्टॉक स्थिति)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    If toggled OFF, customers will see "SOLD OUT" and cannot order this dish.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDishFormData({ ...dishFormData, isAvailable: !dishFormData.isAvailable })}
                  className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs border transition cursor-pointer flex items-center gap-2 ${
                    dishFormData.isAvailable
                      ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500/70 text-rose-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dishFormData.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                  <span>{dishFormData.isAvailable ? 'IN-STOCK (उपलब्ध है)' : 'OUT-OF-STOCK (खत्म)'}</span>
                </button>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDish(null);
                    setIsAddDishOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingDish}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95 border border-indigo-400/40 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingDish ? 'Saving Changes...' : 'Save Dish / सेव करें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
