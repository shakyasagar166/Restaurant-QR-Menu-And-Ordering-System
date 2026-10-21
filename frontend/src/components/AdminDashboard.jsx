import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Eye,
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
  Download,
  FileSpreadsheet,
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
  KeyRound,
  Zap,
  MessageCircle,
  Receipt,
  Percent,
} from 'lucide-react';
import { formatPrice, formatTime, getTimeAgo, formatDate, getISODateKey } from '../utils/formatters';
import { bellPlayer } from '../utils/sound';
import { apiService, saveLocalMenuOverride, getLocalMenuOverrides } from '../api/apiService';
import { generateWhatsAppOrderMessage, openWhatsApp } from '../utils/whatsapp';
import { aiMatchDish } from '../utils/aiSearchEngine';

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
  const [printingOrder, setPrintingOrder] = useState(null);

  // GST & Bill Customization States (Admin can edit GST, discount, and details)
  const [billGstEnabled, setBillGstEnabled] = useState(false);
  const [billGstRate, setBillGstRate] = useState(5); // Default 5% restaurant GST (2.5% CGST + 2.5% SGST)
  const [billDiscount, setBillDiscount] = useState(0);
  const [billGstin, setBillGstin] = useState(() => {
    try { return localStorage.getItem('bikaner_restaurant_gstin') || ''; } catch { return ''; }
  });
  const [billCustomerPhone, setBillCustomerPhone] = useState('');
  const [isUpdatingBill, setIsUpdatingBill] = useState(false);
  const [billSaveNotice, setBillSaveNotice] = useState('');

  // Reset bill discount, phone & notices when opening a new bill
  useEffect(() => {
    if (printingOrder) {
      setBillDiscount(0);
      setBillSaveNotice('');
      setBillCustomerPhone(printingOrder.customerPhone || '');
    }
  }, [printingOrder]);

  // Real-time bill calculations (Subtotal, Discount, CGST, SGST, Grand Total)
  const billComputed = useMemo(() => {
    if (!printingOrder) return { subtotal: 0, discount: 0, taxable: 0, rate: 0, cgst: 0, sgst: 0, totalGst: 0, grandTotal: 0 };
    const subtotal = (printingOrder.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0) || printingOrder.totalAmount || 0;
    const discount = Math.min(Number(billDiscount) || 0, subtotal);
    const taxable = Math.max(0, subtotal - discount);
    const rate = Number(billGstRate) || 0;
    const totalGst = billGstEnabled ? (taxable * rate) / 100 : 0;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const grandTotal = Math.round(taxable + totalGst);
    return {
      subtotal,
      discount,
      taxable,
      rate,
      totalGst,
      cgst,
      sgst,
      grandTotal,
    };
  }, [printingOrder, billDiscount, billGstEnabled, billGstRate]);

  // Daily Sales Register States
  const [salesDateFilter, setSalesDateFilter] = useState('TODAY'); // 'TODAY' | 'YESTERDAY' | 'WEEK' | 'ALL' | 'CUSTOM'
  const [customSalesDate, setCustomSalesDate] = useState(() => {
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    } catch {
      return '';
    }
  });
  const [salesSearchQuery, setSalesSearchQuery] = useState('');
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);

  const todayDateKey = useMemo(() => {
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    } catch {
      return '';
    }
  }, []);

  const yesterdayDateKey = useMemo(() => {
    try {
      return new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    } catch {
      return '';
    }
  }, []);

  const filteredSalesOrders = useMemo(() => {
    let list = [...orders];

    if (salesDateFilter === 'TODAY') {
      list = list.filter((o) => getISODateKey(o.createdAt) === todayDateKey);
    } else if (salesDateFilter === 'YESTERDAY') {
      list = list.filter((o) => getISODateKey(o.createdAt) === yesterdayDateKey);
    } else if (salesDateFilter === 'CUSTOM' && customSalesDate) {
      list = list.filter((o) => getISODateKey(o.createdAt) === customSalesDate);
    } else if (salesDateFilter === 'WEEK') {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      list = list.filter((o) => {
        const d = new Date(o.createdAt);
        return !isNaN(d.getTime()) && d >= weekAgo;
      });
    }

    if (salesSearchQuery && salesSearchQuery.trim()) {
      const q = salesSearchQuery.toLowerCase().trim();
      list = list.filter((o) => {
        const matchCustomer = o.customerName?.toLowerCase().includes(q);
        const matchPhone = o.customerPhone?.includes(q);
        const matchTable = o.tableNumber?.toLowerCase().includes(q);
        const matchItems = o.items?.some((i) => i.name?.toLowerCase().includes(q));
        const matchPayment = o.paymentId?.toLowerCase().includes(q);
        const matchId = String(o.id).includes(q);
        return matchCustomer || matchPhone || matchTable || matchItems || matchPayment || matchId;
      });
    }

    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  }, [orders, salesDateFilter, customSalesDate, salesSearchQuery, todayDateKey, yesterdayDateKey]);

  const dailyTotalSales = useMemo(() => {
    return filteredSalesOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [filteredSalesOrders]);

  const dailyOnlineOrders = useMemo(() => {
    return filteredSalesOrders.filter((o) => o.paymentMethod === 'ONLINE' || o.paymentStatus === 'PAID');
  }, [filteredSalesOrders]);

  const dailyOnlineSales = useMemo(() => {
    return dailyOnlineOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [dailyOnlineOrders]);

  const dailyCashOrders = useMemo(() => {
    return filteredSalesOrders.filter((o) => o.paymentMethod !== 'ONLINE' && o.paymentStatus !== 'PAID');
  }, [filteredSalesOrders]);

  const dailyCashSales = useMemo(() => {
    return dailyCashOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [dailyCashOrders]);

  const dailyDishBreakdown = useMemo(() => {
    const map = {};
    filteredSalesOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.name || 'Dish';
        if (!map[key]) {
          map[key] = { name: key, count: 0, revenue: 0, price: item.price || 0 };
        }
        const qty = Number(item.quantity) || 1;
        map[key].count += qty;
        map[key].revenue += ((Number(item.price) || 0) * qty);
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredSalesOrders]);

  const handleExportSalesCSV = () => {
    const headers = ['Order ID', 'Date', 'Time (IST)', 'Table', 'Customer Name', 'Customer Phone', 'Payment Method', 'Payment Status', 'Transaction ID', 'Items Ordered', 'Order Status', 'Total Amount (INR)'];
    const rows = filteredSalesOrders.map((o) => {
      const itemsList = (o.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; ');
      return [
        o.id,
        formatDate(o.createdAt),
        formatTime(o.createdAt),
        o.tableNumber,
        `"${o.customerName || 'Walk-in Guest'}"`,
        `"${o.customerPhone || ''}"`,
        o.paymentMethod || 'CASH',
        o.paymentStatus || 'PENDING',
        `"${o.paymentId || ''}"`,
        `"${itemsList}"`,
        o.status || 'PENDING',
        o.totalAmount || 0,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bikaner_Sales_${salesDateFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Master Online Payment Gateway Switch (Can be turned ON/OFF anytime by Admin)
  const [isOnlinePaymentActive, setIsOnlinePaymentActive] = useState(() => {
    try {
      return localStorage.getItem('bikaner_online_payment_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleOnlinePayment = () => {
    const next = !isOnlinePaymentActive;
    setIsOnlinePaymentActive(next);
    try {
      localStorage.setItem('bikaner_online_payment_enabled', String(next));
    } catch {}
  };


  // Security & Password Change Modal
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPin: adminUser?.quickPin || '9058',
    newPassword: '',
    newPhone: adminUser?.phone || '9058605348',
    newName: adminUser?.name || 'Shivam Shakya (Manager)',
  });
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });

  const handleChangeCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!securityForm.currentPassword) {
      setSecurityMessage({ type: 'error', text: 'Current Password / PIN is required for verification.' });
      return;
    }
    if (securityForm.newPin && securityForm.newPin.length !== 4) {
      setSecurityMessage({ type: 'error', text: 'Quick Staff PIN must be exactly 4 digits.' });
      return;
    }

    try {
      setIsUpdatingSecurity(true);
      setSecurityMessage({ type: '', text: '' });
      const res = await apiService.changeCredentials({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
        newPin: securityForm.newPin,
        newPhone: securityForm.newPhone,
        newName: securityForm.newName,
      });

      // Update local storage session
      const updatedUser = {
        ...adminUser,
        phone: res.phone || securityForm.newPhone,
        name: res.name || securityForm.newName,
        quickPin: res.quickPin || securityForm.newPin,
      };
      localStorage.setItem('bikaner_admin_auth', JSON.stringify(updatedUser));

      setSecurityMessage({ type: 'success', text: 'Credentials updated successfully in Database!' });
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setSecurityMessage({ type: '', text: '' });
        setSecurityForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      }, 1500);
    } catch (err) {
      setSecurityMessage({ type: 'error', text: err.message || 'Failed to update credentials.' });
    } finally {
      setIsUpdatingSecurity(false);
    }
  };
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
    setDismissedPendingIds((prev) => new Set(prev).add(orderId));
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

  // Elapsed Wait Time & Urgency Calculator (Overdue ONLY for unaccepted pending orders)
  const getOrderUrgency = (createdAt, status = 'PENDING') => {
    if (!createdAt) return { label: 'Just now', color: 'text-slate-400', isUrgent: false, minutes: 0 };
    const orderTime = new Date(createdAt).getTime();
    const diffMs = Date.now() - orderTime;
    const minutes = Math.floor(diffMs / 60000);

    // If order is already accepted, cooking, or served -> Overdue is completely turned OFF!
    if (status === 'ACCEPTED') {
      return { label: `👨‍🍳 Order Accepted (${minutes}m)`, color: 'text-blue-400 font-bold', isUrgent: false, minutes };
    }
    if (status === 'PREPARING') {
      return { label: `🔥 Cooking in Kitchen (${minutes}m)`, color: 'text-amber-400 font-bold', isUrgent: false, minutes };
    }
    if (status === 'SERVED') {
      return { label: `✅ Order Served`, color: 'text-emerald-400 font-bold', isUrgent: false, minutes };
    }
    if (status === 'CANCELLED') {
      return { label: `❌ Cancelled`, color: 'text-rose-400 font-bold', isUrgent: false, minutes };
    }

    // PENDING orders only: show waiting time & alert if not yet accepted by cashier/kitchen
    if (minutes < 2) {
      return { label: `🟢 ${minutes}m ago (New)`, color: 'text-emerald-400 font-bold', isUrgent: false, minutes };
    } else if (minutes < 5) {
      return { label: `🟡 ${minutes}m waiting to accept`, color: 'text-amber-400 font-extrabold', isUrgent: false, minutes };
    } else {
      return { label: `🔴 ${minutes}m (Needs Accept)`, color: 'text-rose-400 font-black animate-pulse', isUrgent: true, minutes };
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
    } else if (activeFilter === 'KITCHEN') {
      matchesStatus = effectiveStatus === 'PREPARING' || effectiveStatus === 'ACCEPTED';
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
    const itemMatch = order.items?.some((i) => i.name?.toLowerCase().includes(q) || aiMatchDish(q, i).matched);
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

    setDismissedPendingIds((prev) => {
      const next = new Set(prev);
      idsToAccept.forEach((id) => next.add(id));
      return next;
    });

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

  const handlePhotoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 700;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setDishFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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
      id: dishFormData.id,
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

    // 1. Immediately persist to localStorage overrides (0ms instant guarantee so edit is NEVER lost)
    saveLocalMenuOverride(payload);

    // 2. Instantly update localMenuItems in UI
    setLocalMenuItems((prev) =>
      prev.map((item) =>
        (dishFormData.id && item.id === dishFormData.id) ||
        (item.name && item.name.toLowerCase().trim() === payload.name.toLowerCase().trim())
          ? { ...item, ...payload }
          : item
      )
    );

    // 3. Persist to Backend API with resilient fallback
    try {
      let saved;
      if (dishFormData.id && typeof dishFormData.id === 'number' && dishFormData.id < 1000) {
        saved = await apiService.updateMenuItem(dishFormData.id, payload);
      } else {
        saved = await apiService.createMenuItem(payload);
      }

      if (saved && saved.id) {
        saveLocalMenuOverride({ ...payload, id: saved.id });
        setLocalMenuItems((prev) =>
          prev.map((item) =>
            item.name && item.name.toLowerCase().trim() === payload.name.toLowerCase().trim()
              ? { ...item, ...saved }
              : item
          )
        );
      }

      if (onRefreshMenu) onRefreshMenu();
      setEditingDish(null);
      setIsAddDishOpen(false);
    } catch (err) {
      console.warn('Backend sync notice (dish changes preserved in browser):', err);
      // Close modal gracefully because changes are safely kept in local storage and active view
      if (onRefreshMenu) onRefreshMenu();
      setEditingDish(null);
      setIsAddDishOpen(false);
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
    <div className="font-pos min-h-screen bg-[#eef2f6] text-slate-900 flex flex-col md:flex-row select-none antialiased">
      {/* =========================================================================
          1. 5-STAR ENTERPRISE RESTAURANT SIDEBAR
          Rich Deep Midnight Obsidian (#090d16) with Electric Cyan & Royal Blue Highlights
      ========================================================================= */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#090d16] text-slate-200 border-r border-slate-800/90 flex flex-col justify-between shrink-0 z-30 shadow-2xl">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/80 bg-[#0d1322]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-red-600 to-amber-300 shadow-lg shadow-red-950/40 shrink-0">
                  <img
                    src="/bikaner-logo.jpg"
                    alt="Bikaner Express Logo"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-black text-lg text-white tracking-wide leading-none">
                      BIKANER<span className="text-cyan-400">POS</span>
                    </h1>
                    <span className="text-[10px] font-black bg-blue-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-md">
                      LUXURY
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold block mt-1">
                    Aman Mall Rooftop Console
                  </span>
                </div>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
                className="md:hidden p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Live SSE Status Pill */}
            <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-emerald-400 font-black bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SSE Terminal Live
              </span>
              <span className="text-slate-400 text-xs font-bold">
                Port 8080 • IST
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`p-3.5 space-y-2 ${isSidebarOpenMobile ? 'block' : 'hidden md:block'}`}>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
              Management Modules
            </div>

            {/* 1. Live Orders & Bills */}
            <button
              onClick={() => {
                setAdminSection('orders');
                setActiveFilter('ALL');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all group cursor-pointer ${
                adminSection === 'orders' && activeFilter === 'ALL'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ChefHat className={`w-5 h-5 ${adminSection === 'orders' && activeFilter === 'ALL' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>All Live Orders &amp; Bills</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>

                        {/* 1.2 SEPARATE SECTION: 💵 CASH ON DELIVERY (COD) */}
            <button
              onClick={() => {
                setAdminSection('orders');
                setActiveFilter('CASH');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all group cursor-pointer ${
                adminSection === 'orders' && activeFilter === 'CASH'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/40 font-black border-2 border-amber-300'
                  : 'text-amber-300 hover:bg-amber-950/40 hover:text-white border border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Banknote className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-black">💵 Cash on Delivery</span>
              </div>
              <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                {cashOrders.length}
              </span>
            </button>

            {/* 2. Menu & Dishes */}
            <button
              onClick={() => {
                setAdminSection('menu');
                setIsSidebarOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all group cursor-pointer ${
                adminSection === 'menu'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Utensils className={`w-5 h-5 ${adminSection === 'menu' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Menu &amp; Catalog</span>
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
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all group cursor-pointer ${
                adminSection === 'analytics'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className={`w-5 h-5 ${adminSection === 'analytics' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Daily Sales &amp; Register (दैनिक बिक्री)</span>
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
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all group cursor-pointer ${
                adminSection === 'tables'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <TableProperties className={`w-5 h-5 ${adminSection === 'tables' ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>Floor &amp; Tables</span>
              </div>
              <span className={`text-xs font-bold ${adminSection === 'tables' ? 'text-blue-100' : 'text-cyan-400'}`}>
                {occupiedTables.size}/20 Active
              </span>
            </button>

            {/* 5. Password & PIN Security Settings */}
            <button
              onClick={() => {
                setIsSecurityModalOpen(true);
                setIsSidebarOpenMobile(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-extrabold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>Change Password &amp; PIN</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                SECURITY
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Customer Preview & Staff Profile */}
        <div className={`p-4 border-t border-slate-800/90 bg-[#0d1322] space-y-3.5 ${isSidebarOpenMobile ? 'block' : 'hidden md:block'}`}>
          <button
            onClick={onBackToMenu}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs sm:text-sm py-2.5 px-3.5 rounded-xl border border-slate-700 transition active:scale-95 cursor-pointer shadow-xs"
            title="Preview Customer Dining Website"
          >
            <span>Customer Menu View</span>
            <ExternalLink className="w-4 h-4 text-cyan-400" />
          </button>

          <div className="bg-[#090d16] rounded-2xl p-3 border border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 truncate">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                ADM
              </div>
              <div className="truncate">
                <span className="font-black text-white text-sm block truncate leading-tight">
                  {adminUser?.name || 'Shivam Shakya'}
                </span>
                <span className="text-xs text-cyan-400 font-bold block mt-0.5">
                  +91 {adminUser?.phone || '9058605348'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white border border-slate-700 transition cursor-pointer"
                title="Change Password & 4-Digit PIN"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition cursor-pointer"
                title="Logout Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Luxury High-Contrast Dining Terminal)
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#eef2f6]">
        {/* Top Control Header Strip */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-300 px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-sm">
          {/* Left: HIGH-VISIBILITY HIGHLIGHTED GLOBAL ORDER SEARCH */}
          <div className="relative w-full sm:w-[440px] md:w-[480px] lg:w-[540px]">
            <div
              className={`relative flex items-center bg-white border-2 rounded-2xl transition-all duration-200 shadow-sm ${
                searchQuery
                  ? 'border-blue-600 ring-4 ring-blue-100 shadow-blue-500/20'
                  : 'border-amber-400 hover:border-amber-500 ring-2 ring-amber-100/80 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100'
              }`}
            >
              {/* Eye-Catching Highlight Badge */}
              <div className="flex items-center pl-2.5 pr-1.5 py-1.5 shrink-0">
                <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-black text-[11px] sm:text-xs px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1.5 tracking-wide border border-amber-300">
                  <Search className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                  <span>SEARCH</span>
                </span>
              </div>

              {/* High Contrast Input */}
              <input
                type="text"
                placeholder="Table # (e.g. 1, T-2), Customer Name, Dish, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-1.5 pr-2 py-2 text-xs sm:text-sm font-black text-slate-950 placeholder-slate-500 focus:outline-none"
              />

              {/* Active Results Pill or Clear Button */}
              {searchQuery ? (
                <div className="flex items-center gap-1.5 pr-2.5 shrink-0">
                  <span className="hidden sm:inline-block bg-blue-100 text-blue-900 font-black text-[10px] px-2 py-0.5 rounded-lg border border-blue-300">
                    {filteredOrders.length} found
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-700 flex items-center justify-center text-xs font-black transition cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="pr-3 shrink-0 hidden md:flex items-center">
                  <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                    Live Search ⚡
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sound Alert Actions & Live Digital Clock */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Live Clock */}
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm font-black text-slate-900 shadow-2xs">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>
                {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[11px] text-slate-500 font-bold">IST</span>
            </div>

            {/* Test Bell Sound */}
            <button
              onClick={handleTestBell}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-blue-200 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Test Kitchen Bell Sound"
            >
              <Bell className="w-4 h-4 text-blue-600 animate-bell" />
              <span className="hidden xs:inline">Test Bell</span>
            </button>

            {/* Sound Mute / Unmute */}
            <button
              onClick={() => setIsBellMuted(!isBellMuted)}
              className={`p-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition cursor-pointer shadow-2xs ${
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
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl border border-slate-300 shadow-2xs transition cursor-pointer"
              title="Generate / Print Table QR Standees"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Table QR</span>
            </button>

            {/* UNMISSABLE: Change Password & PIN Button */}
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer border border-amber-300"
              title="Change Admin Password and 4-Digit Staff PIN"
            >
              <KeyRound className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Change Password &amp; PIN</span>
              <span className="sm:hidden">Password</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-300 shadow-2xs transition cursor-pointer"
              title="Sync Orders Now"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* =========================================================================
            GLOBAL PERSISTENT ALERT BAR ACROSS ALL SECTIONS
            Never overrides previous orders! Visible across all tabs until accepted.
        ========================================================================= */}
        {pendingCount > 0 && (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-5 sm:px-8 py-3.5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-amber-300 animate-in fade-in slide-in-from-top-2 sticky top-[69px] z-15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center font-black shadow-md shrink-0 animate-bounce">
                <Bell className="w-5 h-5 animate-bell" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm sm:text-base tracking-wide text-white">
                    🚨 {pendingCount} NEW {pendingCount === 1 ? 'ORDER WAITING' : 'ORDERS WAITING FOR ACCEPTANCE'}!
                  </span>
                  <span className="bg-black/40 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase border border-amber-300/40">
                    Never Overrides
                  </span>
                </div>
                <p className="text-xs text-amber-100 font-semibold mt-0.5">
                  Tables: {pendingOrders.map((o) => `${o.tableNumber} (₹${o.totalAmount})`).slice(0, 8).join(', ')}
                  {pendingOrders.length > 8 ? ` aur ${pendingOrders.length - 8} aur...` : ''} • Har order tab tak rahega jab tak aap Accept na karein!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              {pendingOrders.length > 1 && (
                <button
                  type="button"
                  onClick={handleAcceptAllPending}
                  disabled={isAcceptingAll}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-emerald-400/40"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{isAcceptingAll ? 'Accepting...' : `Accept All (${pendingCount} Orders)`}</span>
                </button>
              )}
              {adminSection !== 'orders' && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminSection('orders');
                    setActiveFilter('ALL');
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>View All {pendingCount} Cards</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-7 overflow-y-auto">
          {/* =========================================================================
              VIEW 1: LIVE ORDERS & BILLING TERMINAL
          ========================================================================= */}
          {adminSection === 'orders' && (
            <div className="space-y-7">
              {/* =========================================================================
                  🔴 PERSISTENT INCOMING ORDERS NOTIFICATION HUB
                  Requirements:
                  1. As soon as a customer orders, notification appears immediately.
                  2. IT NEVER REMOVES/DISAPPEARS until the admin clicks "ACCEPT ORDER"!
                  3. If 7 people order, ALL 7 NOTIFICATIONS ARE CLEARLY VISIBLE!
                  4. Distinct Boxed Item Chips with Qty & Unit Prices (NO simple white lines!)
              ========================================================================= */}
              {pendingOrders.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400 rounded-3xl p-6 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b-2 border-amber-300/80">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30 animate-bounce shrink-0">
                        <Bell className="w-7 h-7 animate-bell" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-black text-xl sm:text-2xl text-slate-950 tracking-tight">
                            Live Orders Awaiting Acceptance ({pendingOrders.length})
                          </h3>
                          <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping"></span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
                          ⚠️ <strong>Action Required:</strong> Notifications remain visible until accepted. Click "ACCEPT ORDER" to notify customer!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {pendingOrders.length > 1 && (
                        <button
                          onClick={handleAcceptAllPending}
                          disabled={isAcceptingAll}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black px-6 py-3 rounded-2xl shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCheck className="w-5 h-5" />
                          <span>{isAcceptingAll ? 'Accepting...' : `Accept All (${pendingOrders.length} Orders)`}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* All Pending Notification Cards (If 7 people order, all 7 cards stay visible!) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pendingOrders.map((order) => {
                      const isOnline = order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID';
                      const urgency = getOrderUrgency(order.createdAt, order.status);

                      return (
                        <div
                          key={order.id}
                          className={`bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl flex flex-col justify-between transition-all duration-200 border-2 ${
                            isOnline
                              ? 'border-red-500 ring-4 ring-red-200 shadow-red-200'
                              : 'border-amber-400'
                          }`}
                        >
                          {/* DISTINCT PAYMENT HIGHLIGHT: Screaming Red for Online Payment */}
                          {isOnline ? (
                            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2.5 flex items-center justify-between font-black text-xs shadow-md border-b-2 border-red-400 animate-pulse">
                              <div className="flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-white" />
                                <span>🚨 ONLINE PAID (DO NOT COLLECT CASH!)</span>
                              </div>
                              <span className="bg-black/40 text-red-100 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase">
                                ✓ 100% PREPAID
                              </span>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 px-4 py-2 flex items-center justify-between font-black text-xs">
                              <div className="flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-slate-950" />
                                <span>💵 CASH ON DELIVERY</span>
                              </div>
                              <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-lg font-black">
                                COLLECT {formatPrice(order.totalAmount)}
                              </span>
                            </div>
                          )}

                          {/* Card Top: Distinct Table Header & Elapsed Time */}
                          <div>
                            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="bg-blue-600 text-white font-black text-lg sm:text-xl px-4 py-1.5 rounded-xl shadow-md tracking-wider">
                                  {order.tableNumber}
                                </span>
                                <div>
                                  <span className="font-black text-base sm:text-lg block text-white leading-none">
                                    Ticket #{order.id}
                                  </span>
                                  <span className="text-xs text-slate-400 font-semibold mt-1 block">
                                    Pending Order
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setPrintingOrder(order)}
                                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-black text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer shadow-xs"
                                  title="Edit GST, Print Bill & Send to WhatsApp"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Bill / Print</span>
                                </button>
                                <span className={`text-xs sm:text-sm font-black px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 ${urgency.color}`}>
                                  ⏱️ {urgency.label}
                                </span>
                              </div>
                            </div>

                            {/* Customer Info Strip */}
                            <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                  <UserCheck className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Customer Name
                                  </span>
                                  <span className="font-black text-base sm:text-lg text-slate-950 block truncate">
                                    {order.customerName || 'Walk-in Guest'}
                                  </span>
                                </div>
                              </div>

                              {order.customerPhone && (
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs transition"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{order.customerPhone}</span>
                                </a>
                              )}
                            </div>

                            {/* Dishes List with Distinct Boxed Item Chips (NO simple white lines!) */}
                            <div className="p-4 sm:p-5 space-y-2.5">
                              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">
                                Dishes Ordered ({order.items?.length || 0})
                              </span>

                              {order.items?.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 transition shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    {/* Left: Quantity Badge + Dish Name + Rate */}
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-xs">
                                        {item.quantity}×
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="font-black text-sm sm:text-base text-slate-950 truncate leading-snug">
                                          {item.name}
                                        </h5>
                                        <span className="text-xs font-semibold text-slate-500">
                                          ₹{item.price} × {item.quantity} {item.quantity === 1 ? 'portion' : 'portions'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Right: Item Total Box */}
                                    <div className="shrink-0 bg-white border border-slate-300 rounded-xl px-3 py-1 shadow-2xs text-right">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                                        Subtotal
                                      </span>
                                      <span className="font-black text-sm sm:text-base text-slate-950">
                                        {formatPrice(item.price * item.quantity)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Custom Chef Note */}
                                  {item.specialInstructions && (
                                    <div className="bg-amber-100 border border-amber-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                                      <span>📝</span>
                                      <span><strong>Chef Instruction:</strong> {item.specialInstructions}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Luxury Receipt Bill Summary Block */}
                            <div className="mx-4 sm:mx-5 mb-4 bg-slate-950 text-white rounded-2xl p-4 shadow-inner space-y-2.5">
                              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-800 pb-2">
                                <span>Settlement Mode:</span>
                                {isOnline ? (
                                  <span className="text-emerald-400 font-black text-xs">
                                    ⚡ PAID ONLINE (RAZORPAY)
                                  </span>
                                ) : (
                                  <span className="text-amber-400 font-black text-xs">
                                    💵 CASH ON DELIVERY
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300">
                                  Total Bill Amount:
                                </span>
                                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-pos">
                                  {formatPrice(order.totalAmount)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button: ACCEPT ORDER (Removes notification card only upon acceptance) */}
                          <div className="p-4 sm:p-5 pt-0 grid grid-cols-4 gap-2.5">
                            <button
                              onClick={() => handleAcceptOrder(order.id)}
                              className="col-span-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base py-3.5 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
                            >
                              <Check className="w-5 h-5" />
                              <span>ACCEPT ORDER</span>
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order.id)}
                              className="bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-800 font-bold text-xs sm:text-sm py-3.5 rounded-2xl transition border border-slate-300 cursor-pointer text-center"
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

              {/* Clean Modern KPI Summary Strip (Click any card to filter instantly!) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                {/* 1. Pending Orders Card */}
                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === 'PENDING' ? 'ALL' : 'PENDING')}
                  className={`bg-white rounded-3xl p-5 border text-left transition-all duration-200 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-98 ${
                    activeFilter === 'PENDING'
                      ? 'border-amber-500 ring-4 ring-amber-300/40 bg-amber-50/40 shadow-amber-200'
                      : 'border-slate-300 hover:border-amber-400'
                  }`}
                  title="Click to view all Pending Orders"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 mb-1 flex items-center justify-between">
                    <span>Pending Orders</span>
                    {activeFilter === 'PENDING' && (
                      <span className="text-[10px] text-amber-700 font-black bg-amber-200/80 px-1.5 py-0.5 rounded">
                        SELECTED
                      </span>
                    )}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-3xl sm:text-4xl font-black ${pendingCount > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}>
                      {pendingCount}
                    </span>
                    <span className="text-xs text-amber-800 font-black bg-amber-100 px-3 py-1 rounded-xl border border-amber-300">
                      Needs Accept
                    </span>
                  </div>
                </button>

                {/* 2. In Kitchen / Cooking Card */}
                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === 'KITCHEN' ? 'ALL' : 'KITCHEN')}
                  className={`bg-white rounded-3xl p-5 border text-left transition-all duration-200 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-98 ${
                    activeFilter === 'KITCHEN'
                      ? 'border-blue-500 ring-4 ring-blue-300/40 bg-blue-50/40 shadow-blue-200'
                      : 'border-slate-300 hover:border-blue-400'
                  }`}
                  title="Click to view all In-Kitchen / Cooking Orders"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 mb-1 flex items-center justify-between">
                    <span>In Kitchen / Cooking</span>
                    {activeFilter === 'KITCHEN' && (
                      <span className="text-[10px] text-blue-700 font-black bg-blue-200/80 px-1.5 py-0.5 rounded">
                        SELECTED
                      </span>
                    )}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-black text-blue-700">
                      {preparingCount + acceptedCount}
                    </span>
                    <span className="text-xs text-blue-800 font-black bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                      Active
                    </span>
                  </div>
                </button>

                {/* 3. Paid Online (Razorpay) Card */}
                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === 'ONLINE' ? 'ALL' : 'ONLINE')}
                  className={`bg-white rounded-3xl p-5 border text-left transition-all duration-200 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-98 ${
                    activeFilter === 'ONLINE'
                      ? 'border-emerald-500 ring-4 ring-emerald-300/40 bg-emerald-50/40 shadow-emerald-200'
                      : 'border-slate-300 hover:border-emerald-400'
                  }`}
                  title="Click to view all Paid Online Orders"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 mb-1 flex items-center justify-between">
                    <span>Paid Online (Razorpay)</span>
                    {activeFilter === 'ONLINE' && (
                      <span className="text-[10px] text-emerald-700 font-black bg-emerald-200/80 px-1.5 py-0.5 rounded">
                        SELECTED
                      </span>
                    )}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-700">
                      {onlineOrders.length}
                    </span>
                    <span className="text-xs text-emerald-800 font-black bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300">
                      {formatPrice(onlineTotal)}
                    </span>
                  </div>
                </button>

                {/* 4. Cash to Collect Card */}
                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === 'CASH' ? 'ALL' : 'CASH')}
                  className={`bg-white rounded-3xl p-5 border text-left transition-all duration-200 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-98 ${
                    activeFilter === 'CASH'
                      ? 'border-amber-500 ring-4 ring-amber-300/40 bg-amber-50/40 shadow-amber-200'
                      : 'border-slate-300 hover:border-amber-400'
                  }`}
                  title="Click to view all Cash to Collect Orders"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 mb-1 flex items-center justify-between">
                    <span>Cash to Collect</span>
                    {activeFilter === 'CASH' && (
                      <span className="text-[10px] text-amber-700 font-black bg-amber-200/80 px-1.5 py-0.5 rounded">
                        SELECTED
                      </span>
                    )}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-black text-amber-700">
                      {cashOrders.length}
                    </span>
                    <span className="text-xs text-amber-900 font-black bg-amber-100 px-3 py-1 rounded-xl border border-amber-300">
                      {formatPrice(cashTotal)}
                    </span>
                  </div>
                </button>
              </div>

              {/* Status & Payment Filter Bar */}
              <div className="bg-white rounded-3xl p-3 border border-slate-300 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-sm">
                <div className="flex items-center gap-2">
                  {[
                    { key: 'ALL', label: `All Orders (${orders.length})` },
                    { key: 'PENDING', label: `🔔 Pending (${pendingCount})`, highlight: pendingCount > 0 },
                    { key: 'KITCHEN', label: `👨‍🍳 In-Kitchen (${preparingCount + acceptedCount})` },
                    { key: 'ONLINE', label: `🔴 ONLINE PAID (${onlineOrders.length})`, isOnline: true },
                    { key: 'CASH', label: `💵 CASH TO COLLECT (${cashOrders.length})`, isCash: true },
                    { key: 'SERVED', label: `Completed (${servedCount})` },
                    { key: 'CANCELLED', label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                        activeFilter === tab.key
                          ? tab.isOnline
                            ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg ring-2 ring-red-400 font-black'
                            : tab.isCash
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg ring-2 ring-amber-400 font-black'
                            : 'bg-blue-600 text-white shadow-md'
                          : tab.highlight
                          ? 'bg-amber-100 text-amber-900 border border-amber-400 animate-pulse'
                          : tab.isOnline
                          ? 'bg-rose-50 text-rose-700 border-2 border-rose-300 hover:bg-rose-100 font-black'
                          : tab.isCash
                          ? 'bg-amber-50 text-amber-900 border-2 border-amber-300 hover:bg-amber-100 font-black'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs sm:text-sm text-slate-600 font-extrabold hidden lg:block shrink-0 px-3">
                  Showing {filteredOrders.length} tickets
                </div>
              </div>

              {/* DEDICATED SECTION BANNER: 🔴 ONLINE PAID ORDERS */}
              {activeFilter === 'ONLINE' && (
                <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white p-6 rounded-3xl shadow-xl border-2 border-red-400 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white text-red-700 flex items-center justify-center font-black shadow-lg shrink-0">
                      <CreditCard className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          🔴 DEDICATED ONLINE PAID ORDERS SECTION ({onlineOrders.length})
                        </h3>
                        <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          100% PREPAID
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-red-100 font-semibold mt-1">
                        🚨 <strong>ATTENTION WAITERS &amp; CASHIER:</strong> All tables shown below have ALREADY paid online via Razorpay/UPI. <strong>DO NOT ASK FOR CASH!</strong>
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex md:flex-col justify-between items-end shrink-0">
                    <span className="text-[11px] uppercase font-bold text-red-200">Total Online Paid</span>
                    <span className="text-2xl sm:text-3xl font-black text-white">{formatPrice(onlineTotal)}</span>
                  </div>
                </div>
              )}

              {/* DEDICATED SECTION BANNER: 💵 CASH ON DELIVERY (COD) */}
              {activeFilter === 'CASH' && (
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 rounded-3xl shadow-xl border-2 border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-lg shrink-0">
                      <Banknote className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                          💵 CASH ON DELIVERY (COD) SECTION ({cashOrders.length})
                        </h3>
                        <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          PAYMENT DUE
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-900 font-semibold mt-1">
                        💰 <strong>ACTION REQUIRED:</strong> Waiters must collect cash payment for these tables upon serving food.
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-950 text-white px-5 py-3 rounded-2xl border border-amber-400/40 flex md:flex-col justify-between items-end shrink-0 shadow-md">
                    <span className="text-[11px] uppercase font-bold text-amber-300">Total Cash to Collect</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">{formatPrice(cashTotal)}</span>
                  </div>
                </div>
              )}

              {/* Active Search Results Indicator Banner */}
              {searchQuery && filteredOrders.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-400 rounded-3xl p-4 px-5 flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-950">
                          Search Filter Active:
                        </span>
                        <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-0.5 rounded-lg shadow-2xs">
                          "{searchQuery}"
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">
                        Found {filteredOrders.length} matching {filteredOrders.length === 1 ? 'order' : 'orders'}. Table number, customer name, dish, ya phone number se matched.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border-2 border-rose-300 hover:border-rose-400 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                  >
                    <span>Clear Search</span>
                    <span className="text-sm font-black">✕</span>
                  </button>
                </div>
              )}

              {/* Main Orders Display Grid with BIGGER DETAILS & NO SIMPLE WHITE LINES */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-300 p-12 text-center my-6 shadow-sm">
                  <div className="w-18 h-18 rounded-3xl bg-slate-100 text-blue-600 flex items-center justify-center text-4xl mx-auto mb-3.5">
                    📋
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                    No Orders in this View
                  </h4>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto mb-4 font-medium">
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
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-black px-6 py-3 rounded-2xl transition cursor-pointer shadow-md"
                    >
                      Reset View Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredOrders.map((order) => {
                    const isPending = order.status === 'PENDING';
                    const isAccepted = order.status === 'ACCEPTED';
                    const isPreparing = order.status === 'PREPARING';
                    const isServed = order.status === 'SERVED';
                    const isCancelled = order.status === 'CANCELLED';
                    const isOnlinePaid = order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID';
                    const urgency = getOrderUrgency(order.createdAt, order.status);

                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-3xl border-2 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl ${
                          isPending
                            ? urgency.isUrgent
                              ? 'border-rose-500 ring-4 ring-rose-200'
                              : 'border-amber-400 ring-4 ring-amber-100'
                            : isOnlinePaid
                            ? 'border-2 border-red-500 ring-2 ring-red-200 shadow-red-100'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {/* Distinct Payment Highlight Banner: RED NOTIFICATION for Online Payment */}
                        {isOnlinePaid ? (
                          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-5 py-3 flex items-center justify-between font-black text-xs sm:text-sm shadow-md border-b-2 border-red-500 animate-pulse">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-white" />
                              <span className="tracking-wide">🚨 PAID ONLINE (DO NOT COLLECT CASH!)</span>
                            </div>
                            <span className="bg-black/40 text-red-100 border border-white/20 px-3 py-1 rounded-xl text-xs font-black">
                              ✓ 100% PREPAID
                            </span>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-5 py-3 flex items-center justify-between font-black text-xs sm:text-sm shadow-xs">
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4" />
                              <span>💵 CASH ON DELIVERY</span>
                            </div>
                            <span className="bg-amber-600/90 text-white px-3 py-1 rounded-xl text-xs font-black">
                              COLLECT {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        )}

                        {/* Ticket Top Header: Standee Table Badge + Ticket Number + Urgency */}
                        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-600 text-white font-black text-lg sm:text-xl px-4 py-2 rounded-2xl shadow-md tracking-wider">
                              {order.tableNumber}
                            </span>
                            <div>
                              <span className="font-black text-base sm:text-lg block text-white leading-none">
                                Ticket #{order.id}
                              </span>
                              <span className="text-xs text-slate-400 font-semibold mt-1 block">
                                Rooftop Dining
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPrintingOrder(order)}
                              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-black text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer shadow-xs"
                              title="Edit GST, Print Bill & Send to WhatsApp"
                            >
                              <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Print Bill</span>
                            </button>
                            <span className={`text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 ${urgency.color}`}>
                              ⏱️ {urgency.label}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info Strip */}
                        <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Guest Name
                              </span>
                              <span className="font-black text-base sm:text-lg text-slate-900 block truncate">
                                {order.customerName || 'Walk-in Guest'}
                              </span>
                            </div>
                          </div>

                          {order.customerPhone && (
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs transition"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{order.customerPhone}</span>
                            </a>
                          )}
                        </div>

                        {/* Items List: Distinct Boxed Item Chips (NO simple white lines!) */}
                        <div className="p-4 sm:p-5 flex-1 space-y-3">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Dishes Ordered ({order.items?.length || 0})
                          </span>

                          <div className="space-y-2.5">
                            {order.items &&
                              order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2 transition shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    {/* Left: Quantity Badge + Dish Name + Rate */}
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-xs">
                                        {item.quantity}×
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="font-black text-sm sm:text-base text-slate-950 truncate leading-snug">
                                          {item.name}
                                        </h5>
                                        <span className="text-xs font-semibold text-slate-500">
                                          ₹{item.price} × {item.quantity} {item.quantity === 1 ? 'portion' : 'portions'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Right: Item Total Box */}
                                    <div className="shrink-0 bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 shadow-2xs text-right">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                                        Subtotal
                                      </span>
                                      <span className="font-black text-base text-slate-950">
                                        {formatPrice(item.price * item.quantity)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Custom Dish Instructions */}
                                  {item.specialInstructions && (
                                    <div className="bg-amber-100 border border-amber-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                                      <span>📝</span>
                                      <span><strong>Chef Instruction:</strong> {item.specialInstructions}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>

                          {/* Overall Order Notes */}
                          {order.notes && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs sm:text-sm text-blue-950">
                              <span className="font-black text-xs text-blue-700 uppercase tracking-wider block mb-0.5">
                                Order Notes:
                              </span>
                              {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Luxury Receipt Bill Summary Block */}
                        <div className="mx-4 sm:mx-5 mb-4 bg-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-inner space-y-3">
                          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 font-semibold border-b border-slate-800 pb-2.5">
                            <span>Total Quantity Ordered:</span>
                            <span className="text-white font-bold">{order.items?.reduce((sum, i) => sum + i.quantity, 0)} Items</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                                Grand Total Payable
                              </span>
                              <span className="text-xs font-black">
                                {isOnlinePaid ? (
                                  <span className="text-red-400 bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-500/50">
                                    🚨 PAID ONLINE (NO CASH)
                                  </span>
                                ) : (
                                  <span className="text-amber-400">⚠️ Cash to Collect</span>
                                )}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight font-pos">
                                {formatPrice(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer: Direct "COMPLETE ORDER" Action Workflow */}
                        <div className="p-4 sm:p-5 pt-0">
                          {isPending && (
                            <div className="grid grid-cols-4 gap-2.5">
                              <button
                                onClick={() => handleAcceptOrder(order.id)}
                                className="col-span-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base sm:text-lg py-4 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
                              >
                                <Check className="w-5 h-5" />
                                <span>ACCEPT ORDER</span>
                              </button>
                              <button
                                onClick={() => handleRejectOrder(order.id)}
                                className="bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-800 font-bold text-xs sm:text-sm py-4 rounded-2xl transition border border-slate-300 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {(isAccepted || isPreparing) && (
                            <div className="space-y-2.5">
                              {/* Primary Big Button: COMPLETE ORDER */}
                              <button
                                onClick={() => { try { bellPlayer.playSuccessSound(); } catch {} onUpdateStatus(order.id, 'SERVED'); }}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base sm:text-lg py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 border border-blue-400/40"
                              >
                                <CheckCircle className="w-6 h-6" />
                                <span>COMPLETE ORDER / SERVED</span>
                              </button>

                              {isAccepted && (
                                <button
                                  onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                                >
                                  <ChefHat className="w-4 h-4 text-slate-600" />
                                  <span>Move to Cooking in Kitchen</span>
                                </button>
                              )}
                            </div>
                          )}

                          {isServed && (
                            <div className="w-full text-center py-3.5 text-base sm:text-lg text-emerald-800 font-black bg-emerald-100 rounded-2xl border border-emerald-300 flex items-center justify-center gap-2 shadow-xs">
                              <CheckCircle className="w-6 h-6 text-emerald-600" />
                              <span>Order Completed &amp; Served</span>
                            </div>
                          )}

                          {isCancelled && (
                            <div className="w-full text-center py-3.5 text-base sm:text-lg text-rose-800 font-black bg-rose-100 rounded-2xl border border-rose-300 flex items-center justify-center gap-2 shadow-xs">
                              <XCircle className="w-6 h-6 text-rose-600" />
                              <span>Order Cancelled</span>
                            </div>
                          )}
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
              <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl sm:text-2xl text-slate-950">
                      Menu &amp; Dish Catalog Management
                    </h3>
                    <span className="text-xs bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-xl border border-blue-200">
                      Live Admin Mode
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                    Edit dish names, prices in INR, photo URLs, descriptions, and toggle In-Stock / Out-of-Stock instantly.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs sm:text-sm text-slate-600 hidden sm:block text-right font-extrabold">
                    <span className="text-emerald-700 block">
                      {localMenuItems.filter((i) => i.isAvailable !== false && i.available !== false).length} In-Stock
                    </span>
                    <span className="text-rose-700 block">
                      {localMenuItems.filter((i) => i.isAvailable === false || i.available === false).length} Out-of-Stock
                    </span>
                  </div>

                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span>➕ ADD NEW DISH</span>
                  </button>
                </div>
              </div>

              {/* Category Toolbar & Search */}
              <div className="bg-white rounded-3xl p-3.5 border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <button
                    onClick={() => setMenuCatFilter('ALL')}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition shrink-0 cursor-pointer ${
                      menuCatFilter === 'ALL'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    All ({localMenuItems.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMenuCatFilter(cat)}
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition shrink-0 cursor-pointer ${
                        menuCatFilter === cat
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-80">
                  <div
                    className={`relative flex items-center bg-white border-2 rounded-2xl transition-all duration-200 shadow-sm ${
                      menuSearch
                        ? 'border-blue-600 ring-4 ring-blue-100 shadow-blue-500/15'
                        : 'border-amber-400 hover:border-amber-500 ring-2 ring-amber-100/80 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100'
                    }`}
                  >
                    <div className="flex items-center pl-2.5 pr-1 py-1 shrink-0">
                      <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-300">
                        <Search className="w-3 h-3 text-slate-950 stroke-[3]" />
                        <span>DISH</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search dish or category..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full bg-transparent pl-1.5 pr-8 py-2 text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    {menuSearch && (
                      <button
                        type="button"
                        onClick={() => setMenuSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-700 flex items-center justify-center text-[10px] font-black transition cursor-pointer"
                        title="Clear dish search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Clean Modern Items Table */}
              <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-black tracking-wider border-b border-slate-300">
                      <tr>
                        <th className="p-4 sm:p-5">Dish Photo &amp; Details</th>
                        <th className="p-4 sm:p-5">Category</th>
                        <th className="p-4 sm:p-5">Price (INR)</th>
                        <th className="p-4 sm:p-5">Tag</th>
                        <th className="p-4 sm:p-5">Stock Status (Click to Toggle)</th>
                        <th className="p-4 sm:p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {localMenuItems
                        .filter((item) => {
                          const matchCat = menuCatFilter === 'ALL' || item.category === menuCatFilter;
                          const matchSearch =
                            !menuSearch ||
                            item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                            item.category.toLowerCase().includes(menuSearch.toLowerCase()) ||
                            aiMatchDish(menuSearch, item).matched;
                          return matchCat && matchSearch;
                        })
                        .map((item) => {
                          const isAvailable = item.isAvailable !== false && item.available !== false;
                          const isToggling = togglingDishId === item.id;

                          return (
                            <tr key={item.id} className="hover:bg-slate-50 transition">
                              {/* Photo + Name + Description */}
                              <td className="p-4 sm:p-5">
                                <div className="flex items-center gap-4">
                                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-300 bg-slate-100 shadow-2xs">
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
                              <td className="p-4 sm:p-5 text-slate-700 font-bold">
                                <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold">
                                  {item.category}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="p-4 sm:p-5 font-black text-slate-950 text-base sm:text-lg">
                                {formatPrice(item.price)}
                              </td>

                              {/* Tag */}
                              <td className="p-4 sm:p-5">
                                {item.tag ? (
                                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-3 py-1 rounded-full">
                                    {item.tag}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              {/* 1-Click Stock Toggle Button */}
                              <td className="p-4 sm:p-5">
                                <button
                                  onClick={() => handleToggleDishAvailability(item.id, isAvailable)}
                                  disabled={isToggling}
                                  className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black px-4 py-2 rounded-2xl border transition active:scale-95 cursor-pointer shadow-2xs ${
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
                              <td className="p-4 sm:p-5 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-black shadow-2xs"
                                    title="Edit Dish Name, Price, Photo, Description"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteDish(item.id, item.name)}
                                    className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition active:scale-95 cursor-pointer shadow-2xs"
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
              {/* Daily Sales Register Top Header Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 border border-blue-500/30 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-400/30 font-brand">
                        Financial Audit &amp; Daily Register
                      </span>
                      <span className="text-xs text-slate-400 font-bold">• IST Timezone</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 font-brand">
                      <BarChart3 className="w-6 h-6 text-cyan-400" />
                      <span>Daily Sales &amp; Order Register (दैनिक बिक्री रजिस्टर)</span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Check exact order timing, who ordered what dishes, total revenue, and payment method day-by-day.
                    </p>
                  </div>

                  {/* Actions: Print Day Register & Download CSV */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsDailyReportModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Day Summary (दिन का पर्चा)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSalesCSV}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV (Excel)</span>
                    </button>
                  </div>
                </div>

                {/* Date Selection Toolbar */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                  {/* Quick Filters */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSalesDateFilter('TODAY')}
                      className={`px-3.5 py-2 rounded-xl font-black transition cursor-pointer flex items-center gap-1.5 ${
                        salesDateFilter === 'TODAY'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>📅 Today (आज)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSalesDateFilter('YESTERDAY')}
                      className={`px-3.5 py-2 rounded-xl font-black transition cursor-pointer flex items-center gap-1.5 ${
                        salesDateFilter === 'YESTERDAY'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span>Kal (Yesterday)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSalesDateFilter('WEEK')}
                      className={`px-3.5 py-2 rounded-xl font-black transition cursor-pointer ${
                        salesDateFilter === 'WEEK'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      Last 7 Days
                    </button>

                    <button
                      type="button"
                      onClick={() => setSalesDateFilter('ALL')}
                      className={`px-3.5 py-2 rounded-xl font-black transition cursor-pointer ${
                        salesDateFilter === 'ALL'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      🔄 All Time ({orders.length})
                    </button>
                  </div>

                  {/* Custom Date Picker & Search */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-[11px] text-slate-400 font-bold">Pick Date:</span>
                      <input
                        type="date"
                        value={customSalesDate}
                        onChange={(e) => {
                          setCustomSalesDate(e.target.value);
                          setSalesDateFilter('CUSTOM');
                        }}
                        className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                      />
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search sales..."
                        value={salesSearchQuery}
                        onChange={(e) => setSalesSearchQuery(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 w-36 sm:w-44"
                      />
                      {salesSearchQuery && (
                        <button
                          onClick={() => setSalesSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Card Key Performance Metric Strip for Selected Date */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* 1. Total Daily Sales */}
                <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
                  <span className="text-[11px] uppercase font-black text-slate-500 block">
                    Total {salesDateFilter === 'TODAY' ? "Today's" : 'Period'} Sale
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
                    {formatPrice(dailyTotalSales)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
                    {filteredSalesOrders.length} {filteredSalesOrders.length === 1 ? 'order' : 'orders'} placed
                  </span>
                </div>

                {/* 2. Total Online Paid */}
                <div className="bg-white rounded-2xl p-4 border-2 border-red-200 bg-red-50/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
                  <span className="text-[11px] uppercase font-black text-red-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    Online Paid (Razorpay)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight mt-1">
                    {formatPrice(dailyOnlineSales)}
                  </div>
                  <span className="text-[11px] text-red-600 font-bold block mt-0.5">
                    🔴 {dailyOnlineOrders.length} online orders (No cash)
                  </span>
                </div>

                {/* 3. Total Cash on Delivery */}
                <div className="bg-white rounded-2xl p-4 border border-amber-300 bg-amber-50/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-600"></div>
                  <span className="text-[11px] uppercase font-black text-amber-800 flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-amber-700" />
                    Cash to Collect (COD)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight mt-1">
                    {formatPrice(dailyCashSales)}
                  </div>
                  <span className="text-[11px] text-amber-700 font-bold block mt-0.5">
                    💵 {dailyCashOrders.length} orders to collect
                  </span>
                </div>

                {/* 4. Average Ticket Size */}
                <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
                  <span className="text-[11px] uppercase font-black text-slate-500 block">
                    Average Bill Value
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                    {formatPrice(filteredSalesOrders.length > 0 ? dailyTotalSales / filteredSalesOrders.length : 0)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
                    Per table average
                  </span>
                </div>

                {/* 5. Period Active Tables */}
                <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500"></div>
                  <span className="text-[11px] uppercase font-black text-slate-500 block">
                    Active Tables Served
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-800 tracking-tight mt-1">
                    {new Set(filteredSalesOrders.map((o) => o.tableNumber)).size}
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
                    Tables dining today
                  </span>
                </div>
              </div>

              {/* Today's Dish-Wise Breakdown (आज क्या-क्या बिका) */}
              {dailyDishBreakdown.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-slate-300 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="font-brand font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span>Today's Dish Breakdown (आज क्या-क्या बिका • कुल {dailyDishBreakdown.length} व्यंजन)</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500">
                      Total items ordered: {dailyDishBreakdown.reduce((sum, d) => sum + d.count, 0)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {dailyDishBreakdown.map((dish) => (
                      <div
                        key={dish.name}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition"
                      >
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                          {dish.count}x
                        </span>
                        <div>
                          <span className="font-bold text-xs text-slate-800 block leading-tight">
                            {dish.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {formatPrice(dish.revenue)} (@ {formatPrice(dish.price)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Master Chronological Order Register (Kisne Kya Order Kiya, Timing, Payment & Amount) */}
              <div className="bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-brand font-black text-base sm:text-lg text-slate-950 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Order-by-Order Daily Ledger (विस्तृत दैनिक आर्डर लॉग)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing {filteredSalesOrders.length} orders for {salesDateFilter === 'TODAY' ? 'Today' : salesDateFilter === 'YESTERDAY' ? 'Yesterday' : customSalesDate || 'Selected Period'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      Grand Total: <b className="text-emerald-700 font-black">{formatPrice(dailyTotalSales)}</b>
                    </span>
                  </div>
                </div>

                {filteredSalesOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-base text-slate-700">Is date ka koi order record nahi mila</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Aap "🔄 All Time" par click karke sabhi din ke orders dekh sakte hain ya date change kar sakte hain.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSalesDateFilter('ALL')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      Show All Time Orders ({orders.length})
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4"># Order / Time</th>
                          <th className="py-3.5 px-4">Table &amp; Customer</th>
                          <th className="py-3.5 px-4 min-w-[260px]">Items Ordered (किसने क्या आर्डर किया)</th>
                          <th className="py-3.5 px-4">Payment Mode</th>
                          <th className="py-3.5 px-4">Kitchen Status</th>
                          <th className="py-3.5 px-4 text-right">Total Bill</th>
                          <th className="py-3.5 px-4 text-center">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {filteredSalesOrders.map((order, idx) => {
                          const isOnline = order.paymentMethod === 'ONLINE' || order.paymentStatus === 'PAID';
                          const timeStr = formatTime(order.createdAt);
                          const dateStr = formatDate(order.createdAt);
                          const timeAgo = getTimeAgo(order.createdAt);

                          return (
                            <tr
                              key={order.id}
                              className={`hover:bg-slate-50/80 transition ${
                                isOnline ? 'bg-red-50/20' : ''
                              }`}
                            >
                              {/* Order Token & Exact Time */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                                    #{order.id}
                                  </span>
                                  {isOnline && (
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" title="Online Paid"></span>
                                  )}
                                </div>
                                <div className="text-xs font-black text-blue-700 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  <span>{timeStr || 'Recent'}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 block">{dateStr} • {timeAgo}</span>
                              </td>

                              {/* Table & Customer */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="font-black text-slate-950 bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg text-xs inline-block mb-1">
                                  {order.tableNumber}
                                </span>
                                <div className="font-bold text-slate-800 text-xs">
                                  {order.customerName || 'Walk-in Guest'}
                                </div>
                                {order.customerPhone && (
                                  <span className="text-[11px] text-slate-500 block">
                                    +91 {order.customerPhone}
                                  </span>
                                )}
                              </td>

                              {/* Items Ordered Breakdown */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1 max-w-sm">
                                  {(order.items || []).map((item, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between text-xs bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs"
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="font-black text-blue-700 font-mono text-[11px]">
                                          {item.quantity}x
                                        </span>
                                        <span className="font-bold text-slate-800 truncate">
                                          {item.name}
                                        </span>
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-600 shrink-0 ml-2">
                                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                                      </span>
                                    </div>
                                  ))}
                                  {order.notes && (
                                    <p className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      Note: {order.notes}
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Payment Mode */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {isOnline ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white shadow-xs">
                                      🔴 ONLINE PAID
                                    </span>
                                    <span className="text-[10px] text-red-600 font-mono block">
                                      NO CASH NEEDED
                                    </span>
                                    {order.paymentId && (
                                      <span className="text-[9px] text-slate-400 font-mono block">
                                        #{order.paymentId.slice(-8)}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                      💵 CASH ON DELIVERY
                                    </span>
                                    <span className="text-[10px] text-amber-800 font-bold block">
                                      Collect at Table
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase inline-block ${
                                    order.status === 'SERVED'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : order.status === 'PREPARING'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : order.status === 'ACCEPTED'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}
                                >
                                  {order.status || 'PENDING'}
                                </span>
                              </td>

                              {/* Total Bill */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className="text-base font-black text-slate-900 font-sans">
                                  {formatPrice(order.totalAmount)}
                                </span>
                              </td>

                              {/* Receipt Print Trigger */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setPrintingOrder(order)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 border border-slate-300 transition"
                                  title="Print Bill Receipt"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Table Revenue Distribution Grid */}
              <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-sm">
                <h3 className="font-black text-lg sm:text-xl text-slate-950 mb-5 flex items-center gap-2">
                  <TableProperties className="w-5 h-5 text-blue-600" />
                  <span>Table Revenue Distribution (T-1 to T-20)</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
                  {[...Array(20)].map((_, i) => {
                    const tblKey = `T-${i + 1}`;
                    const tblSales = stats?.tableSales?.[tblKey] || 0;
                    const tblOrdersCount = orders.filter((o) => o.tableNumber === tblKey).length;
                    const isOccupied = occupiedTables.has(tblKey);

                    return (
                      <div
                        key={tblKey}
                        className={`rounded-2xl p-3.5 border-2 text-center transition ${
                          isOccupied
                            ? 'bg-blue-50 border-blue-400 shadow-sm'
                            : tblSales > 0
                            ? 'bg-slate-50 border-slate-300'
                            : 'bg-white border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span className="text-sm font-black text-slate-950">{tblKey}</span>
                          {isOccupied && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>}
                        </div>
                        <span className="text-base font-black text-blue-700 block">
                          {formatPrice(tblSales)}
                        </span>
                        <span className="text-xs text-slate-500 font-bold block">
                          {tblOrdersCount} {tblOrdersCount === 1 ? 'order' : 'orders'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Daily Sales Day-End Summary Print Preview Modal */}
          {isDailyReportModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col max-h-[92vh]">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="font-black text-sm text-white">Daily Day-End Balance Sheet</h4>
                      <p className="text-[11px] text-slate-300">
                        {salesDateFilter === 'TODAY' ? 'Today' : salesDateFilter === 'YESTERDAY' ? 'Yesterday' : customSalesDate} • IST
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDailyReportModalOpen(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-slate-800">
                  <div className="text-center border-b border-dashed border-slate-400 pb-3">
                    <h3 className="text-base font-black tracking-widest text-slate-950">BIKANER EXPRESS ROOFTOP</h3>
                    <p className="text-[11px] text-slate-600">Daily Sales Audit Register</p>
                    <p className="text-[11px] text-slate-500">Date: {salesDateFilter === 'TODAY' ? todayDateKey : customSalesDate} | Printed: {new Date().toLocaleTimeString('en-IN')}</p>
                  </div>

                  {/* Summary Totals */}
                  <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
                    <div className="flex justify-between font-black text-sm text-slate-950">
                      <span>TOTAL GROSS SALES:</span>
                      <span className="text-emerald-700">{formatPrice(dailyTotalSales)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>🔴 Online (Razorpay):</span>
                      <span className="font-bold">{formatPrice(dailyOnlineSales)} ({dailyOnlineOrders.length} orders)</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>💵 Cash on Delivery:</span>
                      <span className="font-bold">{formatPrice(dailyCashSales)} ({dailyCashOrders.length} orders)</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Total Bills Cut:</span>
                      <span>{filteredSalesOrders.length} orders</span>
                    </div>
                  </div>

                  {/* Top Items Sold */}
                  <div className="space-y-1 border-b border-dashed border-slate-400 pb-3">
                    <span className="font-black text-slate-900 block mb-1">DISH-WISE SALES SUMMARY:</span>
                    {dailyDishBreakdown.map((d) => (
                      <div key={d.name} className="flex justify-between text-[11px]">
                        <span className="truncate max-w-[200px]">{d.name} x{d.count}</span>
                        <span className="font-bold">{formatPrice(d.revenue)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-2 text-[11px] text-slate-500">
                    <p>*** END OF DAY REPORT ***</p>
                    <p>Verified by Manager: {adminUser?.name || 'Shivam Shakya'}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Sheet</span>
                  </button>
                  <button
                    onClick={() => setIsDailyReportModalOpen(false)}
                    className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {adminSection === 'tables' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-300 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-black text-xl sm:text-2xl text-slate-950">
                      Rooftop Dining Floor Plan (20 Tables)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold">
                      Live status monitor of dining tables at Aman International Mall Rooftop.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs sm:text-sm font-black">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                      <span>Vacant</span>
                    </span>
                    <span className="flex items-center gap-2 text-blue-700">
                      <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
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
                        className={`rounded-3xl p-4.5 border-2 transition flex flex-col justify-between min-h-[140px] shadow-2xs ${
                          tblActiveOrder
                            ? 'bg-blue-50/90 border-blue-500 shadow-sm'
                            : 'bg-slate-50/80 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-base text-slate-950">
                            Table {i + 1}
                          </span>
                          <span
                            className={`w-3 h-3 rounded-full ${
                              tblActiveOrder ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'
                            }`}
                          ></span>
                        </div>

                        {tblActiveOrder ? (
                          <div className="my-2">
                            <span className="text-xs sm:text-sm font-black text-blue-900 block truncate">
                              {tblActiveOrder.customerName}
                            </span>
                            <span className="text-base font-black text-slate-950 block">
                              {formatPrice(tblActiveOrder.totalAmount)}
                            </span>
                            <span className="text-xs text-slate-600 block mt-0.5 font-bold">
                              Status: <strong className="text-blue-700">{tblActiveOrder.status}</strong>
                            </span>
                          </div>
                        ) : (
                          <div className="my-2 text-xs font-bold text-slate-400">
                            Vacant / Ready
                          </div>
                        )}

                        <button
                          onClick={() => openQrModal(tbl)}
                          className="mt-1 w-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-black py-2 rounded-xl border border-slate-300 transition cursor-pointer shadow-2xs"
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
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  {editingDish ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-lg sm:text-xl">
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
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1 gap-2 flex-wrap">
                      <span>Paste image link OR pick from phone/laptop:</span>
                      <label className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300/80 px-2.5 py-1 rounded-lg font-bold cursor-pointer transition active:scale-95 inline-flex items-center gap-1 text-[11px] shrink-0">
                        <span>📁 Upload Photo (गैलरी से चुनें)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoFileUpload}
                        />
                      </label>
                    </div>
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

      {/* =========================================================================
          CUSTOMER BILL & TAX INVOICE PRINT & WHATSAPP MODAL
      ========================================================================= */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border-4 border-slate-900 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Top Bar (Hidden in Print) */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between print:hidden shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-400" />
                <span className="font-black text-sm uppercase tracking-wider font-pos">
                  Customer Bill &amp; Tax Invoice
                </span>
              </div>
              <button
                onClick={() => setPrintingOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill & GST Customization Strip (Admin Edit Panel - Hidden in Print) */}
            <div className="p-4 bg-slate-900 text-white border-b border-slate-800 space-y-3 print:hidden shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    GST &amp; Bill Settings (बिल एडिट करें)
                  </span>
                </div>
                <label className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-750 transition">
                  <input
                    type="checkbox"
                    checked={billGstEnabled}
                    onChange={(e) => setBillGstEnabled(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-300">
                    {billGstEnabled ? 'GST Applied (चालू)' : '+ Apply GST (लगाएं)'}
                  </span>
                </label>
              </div>

              {/* GST Rate Selectors & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {billGstEnabled ? (
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                      GST Rate (CGST + SGST):
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[0, 5, 12, 18].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setBillGstRate(rate)}
                          className={`flex-1 py-1 rounded-lg font-black text-xs transition cursor-pointer border ${
                            billGstRate === rate
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-[11px] text-slate-400 font-medium bg-slate-800/80 p-2 rounded-xl border border-slate-750">
                    Standard Retail Cash Memo (No GST Added)
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Special Discount (₹ छूट)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={billDiscount || ''}
                    onChange={(e) => setBillDiscount(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full bg-slate-800 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* GSTIN & Customer Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Restaurant GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={billGstin}
                    onChange={(e) => {
                      setBillGstin(e.target.value);
                      try { localStorage.setItem('bikaner_restaurant_gstin', e.target.value); } catch {}
                    }}
                    placeholder="e.g. 09AABCB1234F1Z5"
                    className="w-full bg-slate-800 text-white font-mono text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Customer WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={billCustomerPhone}
                    onChange={(e) => setBillCustomerPhone(e.target.value)}
                    placeholder="10-digit Mobile No."
                    className="w-full bg-slate-800 text-emerald-300 font-mono text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {billSaveNotice && (
                <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-xl flex items-center justify-between">
                  <span>{billSaveNotice}</span>
                  <button onClick={() => setBillSaveNotice('')} className="text-emerald-300 hover:text-white">✕</button>
                </div>
              )}
            </div>

            {/* Scrollable Receipt Body */}
            <div className="overflow-y-auto flex-1">
              {/* Printable Thermal Receipt Slip (Targeted by @media print) */}
              <div id="kot-receipt-print" className="p-6 font-mono text-xs text-slate-950 bg-white select-text">
                {/* Restaurant Header */}
                <div className="text-center pb-3 border-b-2 border-dashed border-slate-400 space-y-1">
                  <div className="text-base font-black tracking-wider uppercase font-sans">
                    ★ BIKANER EXPRESS FOODS ★
                  </div>
                  <div className="text-[11px] font-bold text-slate-700">
                    Aman International Mall • Rooftop Dining
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Radha Raman Road, Mainpuri (U.P.) 205001
                  </div>
                  {billGstin && (
                    <div className="text-[10px] font-mono font-bold text-slate-800">
                      GSTIN: {billGstin}
                    </div>
                  )}
                  <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1 border-t border-dotted border-slate-300 pt-1">
                    {billGstEnabled ? 'TAX INVOICE / GUEST BILL' : 'RETAIL BILL / CASH MEMO'}
                  </div>
                </div>

                {/* Order Metadata */}
                <div className="py-2.5 border-b-2 border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between font-black text-sm">
                    <span>TABLE: {printingOrder.tableNumber || 'WALK-IN'}</span>
                    <span>BILL #{printingOrder.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Guest: {printingOrder.customerName || 'Walk-in Guest'}</span>
                    <span>{formatTime(printingOrder.createdAt)}</span>
                  </div>
                  {printingOrder.customerPhone && (
                    <div className="flex justify-between text-slate-600">
                      <span>Phone:</span>
                      <span className="font-mono">{printingOrder.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment Mode:</span>
                    <span className="font-black uppercase">
                      {printingOrder.paymentMethod === 'ONLINE' || printingOrder.paymentStatus === 'PAID'
                        ? '⚡ ONLINE (PAID)'
                        : '💵 CASH DUE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Status:</span>
                    <span className="font-bold uppercase text-slate-900">{printingOrder.status}</span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="py-3 border-b-2 border-dashed border-slate-400">
                  <div className="grid grid-cols-12 font-black pb-1.5 border-b border-slate-300 text-[11px]">
                    <div className="col-span-2">QTY</div>
                    <div className="col-span-6">ITEM</div>
                    <div className="col-span-2 text-right">RATE</div>
                    <div className="col-span-2 text-right">AMT</div>
                  </div>

                  <div className="pt-2 space-y-2">
                    {(printingOrder.items || []).map((item, idx) => (
                      <div key={idx} className="text-[11px] leading-tight">
                        <div className="grid grid-cols-12">
                          <div className="col-span-2 font-black">{item.quantity}×</div>
                          <div className="col-span-6 font-bold truncate pr-1">{item.name}</div>
                          <div className="col-span-2 text-right text-slate-600">₹{item.price}</div>
                          <div className="col-span-2 text-right font-black">₹{item.price * item.quantity}</div>
                        </div>
                        {item.specialInstructions && (
                          <div className="text-[10px] text-amber-950 bg-amber-50 border border-amber-200 p-1 rounded mt-0.5 font-sans font-bold">
                            📝 Chef Note: {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="py-2.5 border-b-2 border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Total Dishes / Items:</span>
                    <span className="font-black">{(printingOrder.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Item Total (Subtotal):</span>
                    <span className="font-bold">₹{billComputed.subtotal}</span>
                  </div>

                  {billComputed.discount > 0 && (
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Special Discount:</span>
                      <span>-₹{billComputed.discount}</span>
                    </div>
                  )}

                  {billGstEnabled && (
                    <>
                      <div className="flex justify-between text-slate-600 pt-1 border-t border-dotted border-slate-300">
                        <span>Taxable Amount:</span>
                        <span>₹{billComputed.taxable.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>CGST ({(billComputed.rate / 2).toFixed(1)}%):</span>
                        <span>₹{billComputed.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>SGST ({(billComputed.rate / 2).toFixed(1)}%):</span>
                        <span>₹{billComputed.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-base font-black pt-1.5 border-t-2 border-slate-900 mt-1">
                    <span>NET AMOUNT PAYABLE:</span>
                    <span className="text-base font-black">₹{billComputed.grandTotal}</span>
                  </div>
                </div>

                {/* Thermal Slip Footer */}
                <div className="text-center pt-3 text-[10px] text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-900">Thank You For Dining With Us!</div>
                  <div>Please Visit Again • Rooftop Dining Mainpuri</div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Controls (Hidden in Print) */}
            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap sm:flex-nowrap gap-2 print:hidden shrink-0">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={() => {
                  const targetPhone = billCustomerPhone || printingOrder.customerPhone || '';
                  const msg = generateWhatsAppOrderMessage(printingOrder, {
                    gstEnabled: billGstEnabled,
                    gstRate: billGstRate,
                    discount: billDiscount,
                    gstin: billGstin,
                  });
                  openWhatsApp(targetPhone, msg);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs shadow-md transition active:scale-95 cursor-pointer border border-emerald-500"
                title="Send Bill to Customer WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>📱 Confirm &amp; Send WhatsApp</span>
              </button>

              {/* Save Bill Amount Button */}
              <button
                type="button"
                disabled={isUpdatingBill}
                onClick={async () => {
                  try {
                    setIsUpdatingBill(true);
                    await apiService.updateOrderBill(printingOrder.id, {
                      totalAmount: billComputed.grandTotal,
                      notes: billGstEnabled
                        ? `${printingOrder.notes || ''} [GST ${billComputed.rate}% Applied]`.trim()
                        : printingOrder.notes,
                    });
                    printingOrder.totalAmount = billComputed.grandTotal;
                    setBillSaveNotice(`✅ Bill saved (₹${billComputed.grandTotal})!`);
                    if (onRefresh) onRefresh();
                  } catch (e) {
                    setBillSaveNotice('Notice: Bill total updated in session.');
                  } finally {
                    setIsUpdatingBill(false);
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs border border-slate-700 transition cursor-pointer"
                title="Save updated Bill Total in Database"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdatingBill ? 'Saving...' : `Save (₹${billComputed.grandTotal})`}</span>
              </button>

              {/* Print Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer text-xs sm:text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill (Ctrl + P)</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-2.5 rounded-2xl transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECURITY & CHANGE PASSWORD / PIN MODAL
      ========================================================================= */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-white font-pos">
                    Security &amp; Password Settings
                  </h4>
                  <span className="text-xs text-slate-400">
                    Change 4-Digit Staff PIN &amp; Login Password
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSecurityModalOpen(false);
                  setSecurityMessage({ type: '', text: '' });
                }}
                className="text-slate-400 hover:text-white p-1 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleChangeCredentialsSubmit} className="p-5 space-y-4">
              {/* Message Banner */}
              {securityMessage.text && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    securityMessage.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{securityMessage.text}</span>
                </div>
              )}

              {/* 1. Quick Staff PIN (4 Digits) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5 font-pos">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>4-Digit Quick Staff PIN:</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Used on Touchpad Keypad</span>
                </div>
                <input
                  type="text"
                  maxLength="4"
                  placeholder="e.g. 9058"
                  value={securityForm.newPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setSecurityForm({ ...securityForm, newPin: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-mono font-black text-cyan-300 tracking-widest text-center focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              {/* 2. New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-300 block">
                  New Password (Optional, leave blank to keep same):
                </label>
                <input
                  type="text"
                  placeholder="Leave blank or enter new password"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* 3. Registered Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-300 block">
                  Manager Mobile Number:
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9058605348"
                  value={securityForm.newPhone}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none font-mono"
                  required
                />
              </div>

              {/* 4. Current Password / PIN (Security Check) */}
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <label className="text-xs font-black uppercase text-amber-300 block">
                  Current Password or PIN (Security Verification):
                </label>
                <input
                  type="password"
                  placeholder="Enter current password or current PIN to confirm"
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-amber-500/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsSecurityModalOpen(false);
                    setSecurityMessage({ type: '', text: '' });
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3 rounded-2xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSecurity}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdatingSecurity ? 'Saving to Database...' : 'Save &amp; Update Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
