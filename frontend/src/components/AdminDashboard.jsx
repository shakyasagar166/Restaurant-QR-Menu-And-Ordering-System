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
  CheckCheck,
} from 'lucide-react';
import { formatPrice, formatTime, getTimeAgo } from '../utils/formatters';
import { bellPlayer } from '../utils/sound';
import { apiService } from '../api/apiService';

// High-resolution curated Indian food photos for quick 1-click select
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
  // Navigation tabs within Admin POS Console: 'orders' | 'menu' | 'analytics' | 'tables'
  const [adminSection, setAdminSection] = useState('orders');
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
  const [editingDish, setEditingDish] = useState(null);
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

  // Locally dismissed pending order IDs for 0ms instant dismissal
  const [dismissedPendingIds, setDismissedPendingIds] = useState(new Set());

  // Function to accept single order with 0ms delay
  const handleAcceptOrder = (orderId) => {
    // 1. Immediately remove from pending in 0 milliseconds
    setDismissedPendingIds((prev) => new Set(prev).add(orderId));
    // 2. Trigger instant optimistic update in App.jsx and background API
    onUpdateStatus(orderId, 'ACCEPTED');
  };

  const handleRejectOrder = (orderId) => {
    setDismissedPendingIds((prev) => new Set(prev).add(orderId));
    onUpdateStatus(orderId, 'CANCELLED');
  };

  // Real-time live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestBell = () => {
    bellPlayer.playOrderBell();
  };

  // Order Counts - excluding any locally dismissed pending orders
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' && !dismissedPendingIds.has(o.id));
  const pendingCount = pendingOrders.length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const servedCount = orders.filter((o) => o.status === 'SERVED').length;
  const acceptedCount = orders.filter((o) => o.status === 'ACCEPTED' || (o.status === 'PENDING' && dismissedPendingIds.has(o.id))).length;

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
      document.title = `🚨 (${pendingCount}) NEW ORDERS WAITING! - Bikaner POS`;
    } else {
      document.title = 'Bikaner Express POS | Kitchen & Admin Console';
    }
    return () => {
      document.title = 'Bikaner Express Foods | Aman International Mall';
    };
  }, [pendingCount]);

  // Elapsed Wait Time & Urgency Calculator
  const getOrderUrgency = (createdAt) => {
    if (!createdAt) return { label: 'Just now', color: 'text-slate-500', isUrgent: false, minutes: 0 };
    const orderTime = new Date(createdAt).getTime();
    const diffMs = Date.now() - orderTime;
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 2) {
      return { label: `🟢 ${minutes}m ago (Fresh)`, color: 'text-emerald-700', isUrgent: false, minutes };
    } else if (minutes < 5) {
      return { label: `🟡 ${minutes}m waiting`, color: 'text-amber-700 font-bold', isUrgent: false, minutes };
    } else {
      return { label: `🔴 ${minutes}m (OVERDUE!)`, color: 'text-rose-700 font-extrabold animate-pulse', isUrgent: true, minutes };
    }
  };

  // Filtered orders by status, payment mode, and search query
  const filteredOrders = orders.filter((order) => {
    const effectiveStatus = dismissedPendingIds.has(order.id) && order.status === 'PENDING' ? 'ACCEPTED' : order.status;
    let matchesStatus = true;
    if (activeFilter === 'ALL') {
      matchesStatus = true;
    } else if (activeFilter === 'ONLINE') {
      matchesStatus = order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID';
    } else if (activeFilter === 'CASH') {
      matchesStatus = order.paymentMethod !== 'ONLINE' && order.paymentStatus !== 'PAID';
    } else {
      matchesStatus = effectiveStatus === activeFilter;
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

  // Quick Accept All Pending Orders with 0ms Instant Dismissal
  const handleAcceptAllPending = async () => {
    if (pendingOrders.length === 0) return;
    setIsAcceptingAll(true);
    const idsToAccept = pendingOrders.map((o) => o.id);

    // 1. Instantly dismiss all from pending notifications in 0ms!
    setDismissedPendingIds((prev) => {
      const next = new Set(prev);
      idsToAccept.forEach((id) => next.add(id));
      return next;
    });

    // 2. Propagate optimistic status to each
    try {
      await Promise.all(
        idsToAccept.map((id) => onUpdateStatus(id, 'ACCEPTED'))
      );
    } catch (e) {
      console.error('Error accepting all orders:', e);
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
      setDishSaveError('Please enter a valid price in INR');
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
        const updated = await apiService.updateMenuItem(dishFormData.id, payload);
        setLocalMenuItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
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
    <div className="font-pos min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col md:flex-row select-none antialiased">
      {/* =========================================================================
          1. CLEAN EXECUTIVE SIDEBAR
          Rich Midnight Navy (#0b1120) with Electric Blue & Cyan Accents
      ========================================================================= */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#0b1120] text-slate-200 border-r border-slate-800/90 flex flex-col justify-between shrink-0 z-30 shadow-xl">
        <div>
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0f172a]/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/25">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-black text-base text-white tracking-wide leading-none">
                      BIKANER<span className="text-cyan-400">POS</span>
                    </h1>
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40 px-1.5 py-0.5 rounded-md">
                      PRO
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium block mt-1">
                    Kitchen Terminal &amp; Orders
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

            {/* Live SSE Status Pill */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                SSE Stream Live
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                Port 8080 • IST
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`p-3 space-y-1.5 ${isSidebarOpenMobile ? 'block' : 'hidden md:block'}`}>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
              Management Modules
            </div>

            {/* 1. Live Orders & KOT */}
            <button
              onClick={() => {
                setAdminSection('orders');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all group cursor-pointer ${
                adminSection === 'orders'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ChefHat className={`w-5 h-5 ${adminSection === 'orders' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Live Orders &amp; KOT</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-md animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* 2. Menu & Dishes */}
            <button
              onClick={() => {
                setAdminSection('menu');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all group cursor-pointer ${
                adminSection === 'menu'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Utensils className={`w-5 h-5 ${adminSection === 'menu' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Menu &amp; Catalog Edit</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                adminSection === 'menu' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {localMenuItems.length}
              </span>
            </button>

            {/* 3. Sales & Analytics */}
            <button
              onClick={() => {
                setAdminSection('analytics');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all group cursor-pointer ${
                adminSection === 'analytics'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-5 h-5 ${adminSection === 'analytics' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Sales &amp; Analytics</span>
              </div>
              <span className={`text-xs font-bold ${adminSection === 'analytics' ? 'text-blue-100' : 'text-emerald-400'}`}>
                {formatPrice(stats?.todaySales || stats?.totalSales || 0)}
              </span>
            </button>

            {/* 4. Floor Map & Tables */}
            <button
              onClick={() => {
                setAdminSection('tables');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all group cursor-pointer ${
                adminSection === 'tables'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TableProperties className={`w-5 h-5 ${adminSection === 'tables' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Floor &amp; Tables</span>
              </div>
              <span className={`text-xs font-bold ${adminSection === 'tables' ? 'text-blue-100' : 'text-cyan-400'}`}>
                {occupiedTables.size}/20 Active
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Customer Preview & Staff Profile */}
        <div className={`p-4 border-t border-slate-800/90 bg-[#0f172a]/60 space-y-3 ${isSidebarOpenMobile ? 'block' : 'hidden md:block'}`}>
          <button
            onClick={onBackToMenu}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-700 transition active:scale-95 cursor-pointer"
            title="Preview Customer Dining Website"
          >
            <span>Customer Menu View</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <div className="bg-[#0f172a] rounded-xl p-3 border border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                ADM
              </div>
              <div className="truncate">
                <span className="font-extrabold text-white text-xs block truncate leading-tight">
                  {adminUser?.name || 'Shivam Shakya'}
                </span>
                <span className="text-[11px] text-cyan-400 font-bold block mt-0.5">
                  +91 {adminUser?.phone || '9058605348'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition shrink-0 ml-1 cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT AREA (High Clarity Canvas & Large Typography)
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f1f5f9]">
        {/* Top Control Header Strip */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-300 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          {/* Left: Global Search */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table, guest name, phone, dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-300 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Sound Alert Actions & Live Digital Clock */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Live Clock */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>
                {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">IST</span>
            </div>

            {/* Test Bell Sound */}
            <button
              onClick={handleTestBell}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-blue-200 transition active:scale-95 cursor-pointer"
              title="Test Kitchen Bell Sound"
            >
              <Bell className="w-4 h-4 text-blue-600 animate-bell" />
              <span className="hidden xs:inline">Test Bell</span>
            </button>

            {/* Sound Mute / Unmute */}
            <button
              onClick={() => setIsBellMuted(!isBellMuted)}
              className={`p-2.5 rounded-xl border text-xs sm:text-sm font-bold transition cursor-pointer ${
                isBellMuted
                  ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              }`}
              title={isBellMuted ? 'Sound Muted (Click to Unmute)' : 'Sound Active (Click to Mute)'}
            >
              {isBellMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* QR Code Standee Modal Trigger */}
            <button
              onClick={openQrModal}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer"
              title="Generate / Print Table QR Standees"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Table QR</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-300 shadow-2xs transition cursor-pointer"
              title="Sync Orders Now"
            >
              <RotateCcw className="w-4 h-4" />
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
              {/* =========================================================================
                  🔴 PERSISTENT INCOMING ORDERS NOTIFICATION HUB
                  Requirements:
                  1. As soon as a customer orders, notification appears immediately.
                  2. IT NEVER REMOVES/DISAPPEARS until the admin clicks "ACCEPT ORDER"!
                  3. If 7 people order, ALL 7 NOTIFICATIONS ARE CLEARLY VISIBLE!
                  4. Large typography for names, table, and order details!
              ========================================================================= */}
              {pendingOrders.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-amber-300/80">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md animate-bounce shrink-0">
                        <Bell className="w-6 h-6 animate-bell" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg sm:text-xl text-slate-950 tracking-tight">
                            Incoming Orders Awaiting Acceptance ({pendingOrders.length})
                          </h3>
                          <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                          ⚠️ <strong>Action Required:</strong> These orders will stay on screen until accepted. Accept immediately to notify guest!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pendingOrders.length > 1 && (
                        <button
                          onClick={handleAcceptAllPending}
                          disabled={isAcceptingAll}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>{isAcceptingAll ? 'Accepting...' : `Accept All (${pendingOrders.length} Orders)`}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* All Pending Notification Cards (If 7 people order, all 7 cards stay visible!) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingOrders.map((order) => {
                      const isOnline = order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID';
                      const urgency = getOrderUrgency(order.createdAt);

                      return (
                        <div
                          key={order.id}
                          className="bg-white border-2 border-amber-400 rounded-3xl p-5 shadow-sm hover:shadow-lg flex flex-col justify-between transition relative overflow-hidden"
                        >
                          {/* Top: Large Table Badge & Wait Timer */}
                          <div>
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-950 text-white font-black text-base px-3.5 py-1.5 rounded-xl shadow-sm tracking-wide">
                                  {order.tableNumber}
                                </span>
                                <span className="text-sm font-extrabold text-slate-500">
                                  Ticket #{order.id}
                                </span>
                              </div>
                              <span className={`text-xs font-bold ${urgency.color}`}>
                                ⏱️ {urgency.label}
                              </span>
                            </div>

                            {/* Guest Details: BIGGER NAME */}
                            <div className="mb-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                              <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                                  Customer Name
                                </span>
                                <span className="font-black text-base sm:text-lg text-slate-950 block truncate">
                                  {order.customerName || 'Walk-in Guest'}
                                </span>
                              </div>
                              {order.customerPhone && (
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="text-blue-600 font-extrabold hover:underline flex items-center gap-1 text-xs sm:text-sm bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{order.customerPhone}</span>
                                </a>
                              )}
                            </div>

                            {/* Dishes List: BIGGER ORDER DETAILS */}
                            <div className="space-y-2 mb-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                                Ordered Items ({order.items?.length || 0})
                              </span>
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="pb-2 border-b border-slate-200/80 last:border-0 last:pb-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
                                        {item.quantity}×
                                      </span>
                                      <span className="font-extrabold text-sm sm:text-base text-slate-950">
                                        {item.name}
                                      </span>
                                    </div>
                                    <span className="font-black text-sm sm:text-base text-slate-800">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>
                                  {item.specialInstructions && (
                                    <div className="ml-8 mt-1 text-xs sm:text-sm font-bold text-amber-950 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                                      📝 Note: {item.specialInstructions}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Payment Badge & Bill Total */}
                            <div className="flex items-center justify-between mb-4 pt-1">
                              <div>
                                {isOnline ? (
                                  <span className="inline-flex items-center gap-1.5 font-black text-xs text-white bg-emerald-600 px-3 py-1.5 rounded-xl shadow-xs">
                                    <CreditCard className="w-4 h-4" />
                                    <span>⚡ PAID ONLINE (RAZORPAY)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 font-black text-xs text-slate-950 bg-amber-400 px-3 py-1.5 rounded-xl shadow-xs">
                                    <Banknote className="w-4 h-4" />
                                    <span>💵 CASH TO COLLECT</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-2xl sm:text-3xl font-black text-slate-950">
                                {formatPrice(order.totalAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Action Button: ACCEPT ORDER (Removes notification card only upon acceptance) */}
                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                            <button
                              onClick={() => handleAcceptOrder(order.id)}
                              className="col-span-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Check className="w-5 h-5" />
                              <span>ACCEPT ORDER</span>
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order.id)}
                              className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-800 font-bold text-xs sm:text-sm py-3.5 rounded-2xl transition border border-slate-300 cursor-pointer text-center"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clean Modern KPI Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">
                    Pending Orders
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl sm:text-3xl font-black ${pendingCount > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}>
                      {pendingCount}
                    </span>
                    <span className="text-xs text-amber-800 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                      Needs Accept
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">
                    In Kitchen / Cooking
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-blue-700">
                      {preparingCount + acceptedCount}
                    </span>
                    <span className="text-xs text-blue-800 font-extrabold bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      Active
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">
                    Paid Online (Razorpay)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                      {onlineOrders.length}
                    </span>
                    <span className="text-xs text-emerald-800 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                      {formatPrice(onlineTotal)}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500"></div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">
                    Cash to Collect
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-amber-700">
                      {cashOrders.length}
                    </span>
                    <span className="text-xs text-amber-900 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                      {formatPrice(cashTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Payment Filter Bar */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-300 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-xs">
                <div className="flex items-center gap-1.5">
                  {[
                    { key: 'ALL', label: `All Orders (${orders.length})` },
                    { key: 'PENDING', label: `🔔 Pending (${pendingCount})`, highlight: pendingCount > 0 },
                    { key: 'ONLINE', label: `⚡ Online Paid (${onlineOrders.length})`, isOnline: true },
                    { key: 'CASH', label: `💵 Cash on Delivery (${cashOrders.length})`, isCash: true },
                    { key: 'ACCEPTED', label: `Accepted (${acceptedCount})` },
                    { key: 'PREPARING', label: `In-Kitchen (${preparingCount})` },
                    { key: 'SERVED', label: `Completed (${servedCount})` },
                    { key: 'CANCELLED', label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
                        activeFilter === tab.key
                          ? tab.isOnline
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : tab.isCash
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-blue-600 text-white shadow-sm'
                          : tab.highlight
                          ? 'bg-amber-100 text-amber-900 border border-amber-400 animate-pulse'
                          : tab.isOnline
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                          : tab.isCash
                          ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs sm:text-sm text-slate-600 font-bold hidden lg:block shrink-0 px-2">
                  Showing {filteredOrders.length} tickets
                </div>
              </div>

              {/* Main Orders Display Grid with BIGGER DETAILS */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-300 p-12 text-center my-6 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-blue-600 flex items-center justify-center text-3xl mx-auto mb-3">
                    📋
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-1">
                    No Orders in this View
                  </h4>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto mb-4">
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
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Reset View Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                        className={`bg-white rounded-3xl border-2 flex flex-col justify-between overflow-hidden transition-all duration-200 shadow-sm hover:shadow-lg ${
                          isPending
                            ? urgency.isUrgent
                              ? 'border-rose-500 ring-2 ring-rose-300'
                              : 'border-amber-400 ring-2 ring-amber-200'
                            : isOnlinePaid
                            ? 'border-emerald-300 hover:border-emerald-500'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {/* Distinct Payment Highlight Banner */}
                        {isOnlinePaid ? (
                          <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between font-black text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span>⚡ PAID ONLINE (RAZORPAY)</span>
                            </div>
                            <span className="bg-emerald-700/80 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                              ✓ DO NOT COLLECT CASH
                            </span>
                          </div>
                        ) : (
                          <div className="bg-amber-400 text-slate-950 px-4 py-2.5 flex items-center justify-between font-black text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4" />
                              <span>💵 CASH ON DELIVERY</span>
                            </div>
                            <span className="bg-amber-500/80 px-2.5 py-0.5 rounded-lg text-xs font-black">
                              COLLECT {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        )}

                        {/* Ticket Top Header: BIGGER TABLE NUMBER */}
                        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-base sm:text-lg px-3.5 py-1.5 rounded-xl bg-slate-950 text-white shadow-sm">
                              {order.tableNumber}
                            </span>
                            <span className="text-sm text-slate-500 font-extrabold">
                              Ticket #{order.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs sm:text-sm font-bold ${urgency.color}`}>
                              {urgency.label}
                            </span>
                            <span
                              className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl ${
                                isPending
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : isAccepted
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : isPreparing
                                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                                  : isServed
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info Strip: BIGGER NAME */}
                        <div className="px-4 sm:px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                              Guest Details
                            </span>
                            <span className="font-black text-base sm:text-lg text-slate-950 flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="truncate">{order.customerName || 'Walk-in Guest'}</span>
                            </span>
                          </div>
                          {order.customerPhone && (
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-blue-600 font-black hover:underline flex items-center gap-1 text-xs sm:text-sm bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{order.customerPhone}</span>
                            </a>
                          )}
                        </div>

                        {/* Items List: BIGGER ORDER DETAILS */}
                        <div className="p-4 sm:p-5 flex-1 space-y-3">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                            Dishes Ordered ({order.items?.length || 0})
                          </span>
                          <div className="space-y-2.5">
                            {order.items &&
                              order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="pb-2.5 border-b border-slate-200/80 last:border-0 last:pb-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
                                        {item.quantity}×
                                      </span>
                                      <span className="font-extrabold text-sm sm:text-base text-slate-950">
                                        {item.name}
                                      </span>
                                    </div>
                                    <span className="font-black text-sm sm:text-base text-slate-800">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>

                                  {/* Custom Dish Instructions */}
                                  {item.specialInstructions && (
                                    <div className="ml-9 mt-1.5 text-xs sm:text-sm font-bold text-amber-950 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300">
                                      <span>📝 Note: {item.specialInstructions}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>

                          {/* Overall Order Notes */}
                          {order.notes && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs sm:text-sm text-blue-950">
                              <span className="font-black text-xs text-blue-700 uppercase tracking-wider block mb-0.5">
                                Order Notes:
                              </span>
                              {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Footer: Bill & Direct "COMPLETE ORDER" Action Workflow */}
                        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 uppercase tracking-wider text-xs font-extrabold">Bill Amount:</span>
                            <span className="text-2xl sm:text-3xl font-black text-slate-950">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>

                          {/* Action Workflow Buttons */}
                          <div>
                            {isPending && (
                              <div className="grid grid-cols-4 gap-2">
                                <button
                                  onClick={() => handleAcceptOrder(order.id)}
                                  className="col-span-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base py-3.5 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Check className="w-5 h-5" />
                                  <span>ACCEPT ORDER</span>
                                </button>
                                <button
                                  onClick={() => handleRejectOrder(order.id)}
                                  className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-800 font-bold text-xs sm:text-sm py-3.5 rounded-2xl transition border border-slate-300 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {(isAccepted || isPreparing) && (
                              <div className="space-y-2">
                                {/* Primary Big Button: COMPLETE ORDER */}
                                <button
                                  onClick={() => onUpdateStatus(order.id, 'SERVED')}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  <span>✅ COMPLETE ORDER / SERVED</span>
                                </button>

                                {isAccepted && (
                                  <button
                                    onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <ChefHat className="w-4 h-4 text-slate-600" />
                                    <span>Move to Cooking in Kitchen</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {isServed && (
                              <div className="w-full text-center py-3 text-sm sm:text-base text-emerald-800 font-black bg-emerald-100 rounded-2xl border border-emerald-300 flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span>Order Completed &amp; Served</span>
                              </div>
                            )}

                            {isCancelled && (
                              <div className="w-full text-center py-3 text-sm sm:text-base text-rose-800 font-black bg-rose-100 rounded-2xl border border-rose-300 flex items-center justify-center gap-2">
                                <XCircle className="w-5 h-5 text-rose-600" />
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
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl text-slate-950">
                      Menu &amp; Dish Catalog Management
                    </h3>
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-lg border border-blue-200">
                      Live Admin Mode
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Edit dish names, prices in INR, photo URLs, descriptions, and toggle In-Stock / Out-of-Stock instantly.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs sm:text-sm text-slate-600 hidden sm:block text-right font-bold">
                    <span className="text-emerald-700 block">
                      {localMenuItems.filter((i) => i.isAvailable !== false && i.available !== false).length} In-Stock
                    </span>
                    <span className="text-rose-700 block">
                      {localMenuItems.filter((i) => i.isAvailable === false || i.available === false).length} Out-of-Stock
                    </span>
                  </div>

                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>➕ ADD NEW DISH</span>
                  </button>
                </div>
              </div>

              {/* Category Toolbar & Search */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <button
                    onClick={() => setMenuCatFilter('ALL')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition shrink-0 cursor-pointer ${
                      menuCatFilter === 'ALL'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    All ({localMenuItems.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMenuCatFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition shrink-0 cursor-pointer ${
                        menuCatFilter === cat
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dish name..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Clean Modern Items Table */}
              <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-black tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-4">Dish Photo &amp; Details</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price (INR)</th>
                        <th className="p-4">Tag</th>
                        <th className="p-4">Stock Status (Click to Toggle)</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
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
                            <tr key={item.id} className="hover:bg-slate-50 transition">
                              {/* Photo + Name + Description */}
                              <td className="p-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-300 bg-slate-100 shadow-2xs">
                                    <img
                                      src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                                      alt={item.name}
                                      className={`w-full h-full object-cover transition duration-300 ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                                    />
                                    {!isAvailable && (
                                      <div className="absolute inset-0 bg-rose-950/70 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-rose-100">OUT</span>
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-black text-base sm:text-lg block ${!isAvailable ? 'text-slate-400 line-through' : 'text-slate-950'}`}>
                                        {item.name}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5 font-medium">
                                      {item.description || 'Prepared fresh with pure desi ghee and traditional recipe.'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="p-4 text-slate-700 font-bold">
                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                                  {item.category}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="p-4 font-black text-slate-950 text-base sm:text-lg">
                                {formatPrice(item.price)}
                              </td>

                              {/* Tag */}
                              <td className="p-4">
                                {item.tag ? (
                                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-2.5 py-1 rounded-full">
                                    {item.tag}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              {/* 1-Click Stock Toggle Button */}
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleDishAvailability(item.id, isAvailable)}
                                  disabled={isToggling}
                                  className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-xl border transition active:scale-95 cursor-pointer ${
                                    isAvailable
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                                  } ${isToggling ? 'opacity-50' : ''}`}
                                  title="Click to toggle In-Stock / Out-of-Stock instantly"
                                >
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full ${
                                      isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  ></span>
                                  <span>
                                    {isAvailable ? 'In-Stock (Available)' : 'Out-of-Stock (Sold Out)'}
                                  </span>
                                </button>
                              </td>

                              {/* Action Buttons: Edit & Delete */}
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-bold"
                                    title="Edit Dish Name, Price, Photo, Description"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteDish(item.id, item.name)}
                                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition active:scale-95 cursor-pointer"
                                    title="Delete Dish from Menu"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
                <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-extrabold text-slate-500">
                      Total Gross Sales
                    </span>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    {formatPrice(stats?.totalSales || 0)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    Total orders: {stats?.totalOrders || orders.length}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-extrabold text-slate-500">
                      Today's Shift Revenue
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                    {formatPrice(stats?.todaySales || stats?.totalSales || 0)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    Average ticket: {formatPrice(stats?.averageOrderValue || 0)}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-extrabold text-slate-500">
                      Payment Mode Split
                    </span>
                    <CreditCard className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="space-y-2.5 mt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-700 font-extrabold">Online (Razorpay):</span>
                      <span className="font-black text-slate-950">{formatPrice(onlineTotal)} ({onlineOrders.length})</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber-700 font-extrabold">Cash on Delivery:</span>
                      <span className="font-black text-slate-950">{formatPrice(cashTotal)} ({cashOrders.length})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Revenue Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-xs">
                <h3 className="font-black text-lg text-slate-950 mb-4 flex items-center gap-2">
                  <TableProperties className="w-5 h-5 text-blue-600" />
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
                        className={`rounded-2xl p-3 border-2 text-center transition ${
                          isOccupied
                            ? 'bg-blue-50 border-blue-400 shadow-xs'
                            : tblSales > 0
                            ? 'bg-slate-50 border-slate-300'
                            : 'bg-white border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-sm font-black text-slate-950">{tblKey}</span>
                          {isOccupied && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>}
                        </div>
                        <span className="text-base font-black text-blue-700 block">
                          {formatPrice(tblSales)}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold block">
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
              <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-black text-xl text-slate-950">
                      Rooftop Dining Floor Plan (20 Tables)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Live status monitor of dining tables at Aman International Mall Rooftop.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs sm:text-sm font-bold">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                      <span>Vacant</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
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
                        className={`rounded-2xl p-4 border-2 transition flex flex-col justify-between min-h-[130px] ${
                          tblActiveOrder
                            ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                            : 'bg-slate-50/70 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-base text-slate-950">
                            Table {i + 1}
                          </span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              tblActiveOrder ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'
                            }`}
                          ></span>
                        </div>

                        {tblActiveOrder ? (
                          <div className="my-2">
                            <span className="text-xs sm:text-sm font-black text-blue-900 block truncate">
                              {tblActiveOrder.customerName}
                            </span>
                            <span className="text-sm sm:text-base font-black text-slate-950 block">
                              {formatPrice(tblActiveOrder.totalAmount)}
                            </span>
                            <span className="text-xs text-slate-500 block mt-0.5 font-bold">
                              Status: <strong className="text-blue-700">{tblActiveOrder.status}</strong>
                            </span>
                          </div>
                        ) : (
                          <div className="my-2 text-xs font-bold text-slate-400">
                            Vacant / Ready
                          </div>
                        )}

                        <button
                          onClick={openQrModal}
                          className="mt-1 w-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-1.5 rounded-xl border border-slate-300 transition cursor-pointer shadow-2xs"
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
          MODAL: EDIT OR ADD DISH (100% ENGLISH, CLEAN MODERN INPUTS)
      ========================================================================= */}
      {(editingDish || isAddDishOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  {editingDish ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-lg">
                    {editingDish ? 'Edit Dish Details' : 'Add New Dish to Menu'}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Changes reflect immediately on the customer menu and table QR ordering.
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingDish(null);
                  setIsAddDishOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDish} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {dishSaveError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3.5 rounded-xl flex items-center gap-2 font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{dishSaveError}</span>
                </div>
              )}

              {/* Row 1: Dish Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-800 font-bold block">
                    Dish Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Shahi Paneer Butter Masala"
                    value={dishFormData.name}
                    onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold block">
                    Price in INR <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="e.g. 240"
                    value={dishFormData.price}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-black focus:bg-white focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
              </div>

              {/* Row 2: Category & Special Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-800 font-bold block">Category</label>
                  <input
                    type="text"
                    list="category-suggestions"
                    placeholder="Select or enter category..."
                    value={dishFormData.category}
                    onChange={(e) => setDishFormData({ ...dishFormData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-600 text-sm"
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
                  <label className="text-slate-800 font-bold block">Special Tag</label>
                  <select
                    value={dishFormData.tag}
                    onChange={(e) => setDishFormData({ ...dishFormData, tag: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-600 text-sm"
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
                <label className="text-slate-800 font-bold block">
                  Photo Image URL
                </label>
                <div className="flex gap-3">
                  <div className="relative w-18 h-18 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shrink-0 shadow-2xs">
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-xs text-slate-500 font-medium block">
                      Live preview updates on left. You can paste any image link or click a preset below.
                    </span>
                  </div>
                </div>

                {/* Quick Presets Pills */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Quick Photo Presets (1-Click Select):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setDishFormData({ ...dishFormData, imageUrl: preset.url })}
                        className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold transition active:scale-95 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="space-y-1">
                <label className="text-slate-800 font-bold block">Description / Recipe</label>
                <textarea
                  rows="2"
                  placeholder="Prepared fresh with pure desi ghee, aromatic ground spices & finest ingredients..."
                  value={dishFormData.description}
                  onChange={(e) => setDishFormData({ ...dishFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 resize-none text-xs sm:text-sm"
                />
              </div>

              {/* Row 5: Stock Availability Switch */}
              <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-950 text-sm block">
                    Kitchen Stock Availability
                  </span>
                  <span className="text-xs text-slate-600">
                    If set to Out-of-Stock, customers will see "SOLD OUT" on table QR and cannot order this dish.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDishFormData({ ...dishFormData, isAvailable: !dishFormData.isAvailable })}
                  className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm border transition cursor-pointer flex items-center gap-2 ${
                    dishFormData.isAvailable
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                  <span>{dishFormData.isAvailable ? 'IN-STOCK (AVAILABLE)' : 'OUT-OF-STOCK (SOLD OUT)'}</span>
                </button>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDish(null);
                    setIsAddDishOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingDish}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingDish ? 'Saving Changes...' : 'Save Dish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
