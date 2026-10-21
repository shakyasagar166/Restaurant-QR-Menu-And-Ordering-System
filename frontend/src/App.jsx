import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategoryCards from './components/CategoryCards';
import CategoryDetail from './components/CategoryDetail';
import BrandAmenitiesStrip from './components/BrandAmenitiesStrip';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import LiveOrderTracker from './components/LiveOrderTracker';
import QrCodeModal from './components/QrCodeModal';
import PaymentModal from './components/PaymentModal';
import AiChatBot from './components/AiChatBot';
import { apiService, pingBackend, getLocalMenuOverrides } from './api/apiService';
import { bellPlayer } from './utils/sound';
import { formatPrice } from './utils/formatters';
import { ShoppingBag, Bell, Sparkles, CheckCircle2, Crown, Lock } from 'lucide-react';
import { BIKANER_MASTER_MENU } from './data/fullMenuCatalog';

export default function App() {
  // Navigation & view states
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'admin'
  const [selectedCategory, setSelectedCategory] = useState(null); // null = show Category Cards
  const [searchQuery, setSearchQuery] = useState('');

  // Table selection from URL param or default
  const [tableNumber, setTableNumber] = useState('T-1');

  // Menu data initialized with full 155+ catalog + local custom photo/price overrides
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const overrides = getLocalMenuOverrides();
      return BIKANER_MASTER_MENU.map((item) => {
        const key = item.name.toLowerCase().trim();
        const o = overrides[key];
        return o ? { ...item, ...o, imageUrl: o.imageUrl || item.imageUrl } : item;
      });
    } catch {
      return BIKANER_MASTER_MENU;
    }
  });
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('bikaner_categories_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return Array.from(new Set(BIKANER_MASTER_MENU.map((i) => i.category)));
    } catch {
      return Array.from(new Set(BIKANER_MASTER_MENU.map((i) => i.category)));
    }
  });
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // Network Connectivity Resilience
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      loadMenuData();
      loadOrdersData();
      const t = setTimeout(() => setShowOnlineToast(false), 3500);
      return () => clearTimeout(t);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('bikaner_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Admin Authentication & Session
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bikaner_admin_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Order management & Realtime Bell Alert (Cached in localStorage so orders NEVER disappear across reboots)
  const [orders, setOrders] = useState(() => {
    try {
      const cached = localStorage.getItem('bikaner_orders_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem('bikaner_stats_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isBellMuted, setIsBellMuted] = useState(false);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // Ref to track recent status updates to prevent race conditions from background polling
  const recentStatusOverridesRef = useRef(new Map());

  // Customer's currently active order for live tracking
  const [activeCustomerOrder, setActiveCustomerOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('bikaner_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('bikaner_active_order');
      if (saved) {
        const order = JSON.parse(saved);
        return order && order.status !== 'SERVED';
      }
      return false;
    } catch {
      return false;
    }
  });

  // QR Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Payment Selection Modal (Standalone top-level, locks background)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  // Read URL query params on mount (e.g. ?table=T-4, ?admin=true, #admin)
  useEffect(() => {
    pingBackend();
    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table');
    if (tbl) {
      setTableNumber(tbl.toUpperCase());
    }

    const isAdminUrl =
      params.get('admin') === 'true' ||
      params.get('view') === 'admin' ||
      window.location.hash === '#admin' ||
      window.location.pathname === '/admin';

    if (isAdminUrl) {
      const savedAuth = localStorage.getItem('bikaner_admin_auth');
      if (savedAuth) {
        try {
          setAdminUser(JSON.parse(savedAuth));
        } catch (e) {}
        setActiveTab('admin');
      } else {
        setIsAdminLoginModalOpen(true);
      }
    }
  }, []);

  // Mobile phone hardware & browser Back Button integration
  useEffect(() => {
    const handlePopState = () => {
      if (isPaymentModalOpen) {
        setIsPaymentModalOpen(false);
        setIsCartOpen(true);
      } else if (isCartOpen) {
        setIsCartOpen(false);
      } else if (isQrModalOpen) {
        setIsQrModalOpen(false);
      } else if (isAdminLoginModalOpen) {
        setIsAdminLoginModalOpen(false);
      } else if (selectedCategory || searchQuery) {
        setSelectedCategory(null);
        setSearchQuery('');
      } else if (activeTab === 'admin') {
        setActiveTab('menu');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isPaymentModalOpen, isCartOpen, isQrModalOpen, isAdminLoginModalOpen, selectedCategory, searchQuery, activeTab]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('bikaner_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist active order
  useEffect(() => {
    if (activeCustomerOrder) {
      localStorage.setItem('bikaner_active_order', JSON.stringify(activeCustomerOrder));
    } else {
      localStorage.removeItem('bikaner_active_order');
    }
  }, [activeCustomerOrder]);

  // Fetch Menu and Categories from Spring Boot backend (Merged with 155+ item master catalog + local admin overrides)
  const loadMenuData = async () => {
    try {
      const [backendItems, backendCats] = await Promise.all([
        apiService.getMenu().catch(() => null),
        apiService.getCategories().catch(() => null),
      ]);

      const localOverrides = getLocalMenuOverrides();

      // Map backend items by lowercase trimmed name
      const backendMap = new Map();
      if (backendItems && Array.isArray(backendItems)) {
        backendItems.forEach((b) => {
          if (b.name) backendMap.set(b.name.toLowerCase().trim(), b);
        });
      }

      // Merge: BIKANER_MASTER_MENU + Backend Items + Local Overrides (Local overrides have highest priority!)
      const merged = BIKANER_MASTER_MENU.map((masterItem) => {
        const key = masterItem.name.toLowerCase().trim();
        const bMatch = backendMap.get(key);
        const oMatch = localOverrides[key];

        let item = { ...masterItem };
        if (bMatch) {
          // Check if backend image is a real custom upload/override or just the old generic placeholder
          const isStaleGeneric = bMatch.imageUrl && (
            (bMatch.imageUrl.includes('photo-1589301760014-d929f3979dbc') && !key.includes('parantha')) ||
            (bMatch.imageUrl.includes('photo-1601050690597-df0568f70950') && !key.includes('naan') && !key.includes('kulcha')) ||
            (bMatch.imageUrl.includes('photo-1571091718767-18b5b1457add') && !key.includes('burger')) ||
            (bMatch.imageUrl.includes('photo-1599488615731-7e5c2823ff28') && !key.includes('seekh') && !key.includes('platter'))
          );

          item = {
            ...item,
            ...bMatch,
            imageUrl: oMatch?.imageUrl || (!isStaleGeneric && bMatch.imageUrl ? bMatch.imageUrl : masterItem.imageUrl),
          };
        }
        if (oMatch) {
          item = {
            ...item,
            ...oMatch,
            imageUrl: oMatch.imageUrl || item.imageUrl,
          };
        }
        return item;
      });

      // Also append any newly created custom dishes from backend or local overrides that aren't in master catalog
      const masterNames = new Set(BIKANER_MASTER_MENU.map((m) => m.name.toLowerCase().trim()));

      if (backendItems && Array.isArray(backendItems)) {
        backendItems.forEach((b) => {
          const key = (b.name || '').toLowerCase().trim();
          if (key && !masterNames.has(key)) {
            const oMatch = localOverrides[key];
            merged.push(oMatch ? { ...b, ...oMatch } : b);
            masterNames.add(key);
          }
        });
      }

      Object.values(localOverrides).forEach((o) => {
        const key = (o.name || '').toLowerCase().trim();
        if (key && !masterNames.has(key)) {
          merged.push(o);
          masterNames.add(key);
        }
      });

      setMenuItems(merged);
      try { localStorage.setItem('bikaner_menu_cache', JSON.stringify(merged)); } catch {}

      const allCategories = Array.from(new Set(merged.map((i) => i.category))).filter(Boolean);
      setCategories(allCategories);
      try { localStorage.setItem('bikaner_categories_cache', JSON.stringify(allCategories)); } catch {}
    } catch (err) {
      console.warn('Backend menu fetch notice, using full master catalog:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Fetch orders & stats for Admin Kitchen view (Resilient cloud sync with auto-retry)
  const loadOrdersData = async (retryCount = 0) => {
    try {
      const [ordersList, statsData] = await Promise.all([
        apiService.getOrders(),
        apiService.getStats().catch(() => null),
      ]);

      if (!ordersList || !Array.isArray(ordersList)) {
        return;
      }

      // Protect against race conditions: preserve recent explicit status updates (e.g. ACCEPTED/SERVED)
      const now = Date.now();
      const mergedOrders = ordersList.map((fetched) => {
        const override = recentStatusOverridesRef.current.get(fetched.id);
        if (override && now - override.timestamp < 30000) {
          return { ...fetched, status: override.status };
        }
        return fetched;
      });

      // Fail-safe check: if new pending order arrived during polling interval, ring bell
      const currentOrders = ordersRef.current || [];
      if (currentOrders.length > 0) {
        const existingIds = new Set(currentOrders.map((o) => o.id));
        const hasNewIncoming = mergedOrders.some(
          (o) => o.status === 'PENDING' && !existingIds.has(o.id)
        );
        if (hasNewIncoming && !isBellMutedRef.current) {
          bellPlayer.playOrderBell();
          setIsBellRinging(true);
          setTimeout(() => setIsBellRinging(false), 3500);
        }
      }

      setOrders(mergedOrders);
      if (statsData) setStats(statsData);

      // Persist orders and financial metrics permanently in localStorage
      try {
        localStorage.setItem('bikaner_orders_cache', JSON.stringify(mergedOrders));
        if (statsData) {
          localStorage.setItem('bikaner_stats_cache', JSON.stringify(statsData));
        }
      } catch (e) {}

      // Check if current customer order was updated
      if (activeCustomerOrder) {
        const found = mergedOrders.find((o) => o.id === activeCustomerOrder.id);
        if (found && found.status !== activeCustomerOrder.status) {
          setActiveCustomerOrder(found);
        }
      }
    } catch (err) {
      console.warn('Cloud sync notice (cold-start / network waking):', err);
      // Auto-retry up to 3 times to ensure cloud database syncs when Render wakes up
      if (retryCount < 3) {
        setTimeout(() => loadOrdersData(retryCount + 1), 3500);
      }
    }
  };

  useEffect(() => {
    loadMenuData();
    loadOrdersData();

    // Auto-sync polling every 12 seconds so ANY device gets fresh live orders automatically
    const syncInterval = setInterval(() => {
      loadOrdersData();
    }, 12000);

    return () => clearInterval(syncInterval);
  }, []);

  // Persistent refs for stable real-time listener without reconnect tears
  const isBellMutedRef = useRef(isBellMuted);
  useEffect(() => {
    isBellMutedRef.current = isBellMuted;
  }, [isBellMuted]);

  const activeCustomerOrderRef = useRef(activeCustomerOrder);
  useEffect(() => {
    activeCustomerOrderRef.current = activeCustomerOrder;
  }, [activeCustomerOrder]);

  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Real-time SSE & Local IPC listener for Instant Kitchen Alerts (0ms delay)
  useEffect(() => {
    const subscriber = apiService.subscribeToOrderAlerts(
      // onNewOrder: Instantly triggered via Server-Sent Events when customer submits order
      (newOrder) => {
        if (!newOrder || !newOrder.id) return;

        // 🔔 Ring the Royal Temple Bell!
        if (!isBellMutedRef.current) {
          bellPlayer.playOrderBell();
          bellPlayer.triggerHaptic([100, 50, 100]);
        }
        setIsBellRinging(true);
        setTimeout(() => setIsBellRinging(false), 3500);

        setNewOrderAlert(newOrder);

        // Update orders list immediately without needing page refresh
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === newOrder.id);
          if (exists) {
            return prev.map((o) => (o.id === newOrder.id ? { ...o, ...newOrder } : o));
          }
          return [newOrder, ...prev];
        });

        // Check if current customer placed it
        if (activeCustomerOrderRef.current && activeCustomerOrderRef.current.id === newOrder.id) {
          setActiveCustomerOrder(newOrder);
        }

        // Background fetch updated stats
        apiService.getStats().then((s) => setStats(s)).catch(() => {});
      },
      // onOrderUpdated
      (updatedOrder) => {
        if (!updatedOrder || !updatedOrder.id) return;

        recentStatusOverridesRef.current.set(updatedOrder.id, {
          status: updatedOrder.status,
          timestamp: Date.now(),
        });

        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
        );

        if (activeCustomerOrderRef.current && activeCustomerOrderRef.current.id === updatedOrder.id) {
          const prevStatus = activeCustomerOrderRef.current.status;
          setActiveCustomerOrder(updatedOrder);

          // Real-time instant delight for customer when Admin marks ACCEPTED or SERVED
          if (updatedOrder.status === 'SERVED' && prevStatus !== 'SERVED') {
            try {
              bellPlayer.playSuccessSound();
              confetti({
                particleCount: 100,
                spread: 75,
                origin: { y: 0.7 },
                colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
              });
            } catch {}
          } else if (updatedOrder.status === 'ACCEPTED' && prevStatus !== 'ACCEPTED') {
            try {
              bellPlayer.playSuccessSound();
            } catch {}
          }
        }
      }
    );

    // Resilient polling fallback every 12s (SSE handles instant 0ms real-time alerts)
    const interval = setInterval(() => {
      loadOrdersData();
    }, 12000);

    return () => {
      if (subscriber && subscriber.close) subscriber.close();
      clearInterval(interval);
    };
  }, []); // Permanent SSE connection: zero reconnection thrashing!

  // Tab switcher with Admin Auth Protection
  const handleTabSwitch = (targetTab) => {
    if (targetTab === 'admin') {
      if (!adminUser) {
        setIsAdminLoginModalOpen(true);
        return;
      }
      try {
        window.history.pushState({ screen: 'admin' }, '');
      } catch (e) {}
      setActiveTab('admin');
    } else {
      setActiveTab('menu');
    }
  };

  const handleSelectCategory = (cat) => {
    try {
      window.history.pushState({ screen: 'category', cat }, '');
    } catch (e) {}
    setSelectedCategory(cat);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleOpenCart = () => {
    try {
      window.history.pushState({ screen: 'cart' }, '');
    } catch (e) {}
    setIsCartOpen(true);
  };

  const handleAdminLoginSuccess = (userData) => {
    setAdminUser(userData);
    try {
      window.history.pushState({ screen: 'admin' }, '');
    } catch (e) {}
    setActiveTab('admin');
    loadOrdersData();
  };

  const handleAdminLogout = async () => {
    if (adminUser?.token) {
      await apiService.logoutAdmin(adminUser.token);
    }
    localStorage.removeItem('bikaner_admin_auth');
    setAdminUser(null);
    setActiveTab('menu');
  };

  // Cart operations with Tactile Audio & Haptic Feedback
  const handleAddToCart = (item) => {
    // Tactile Audio & Haptic vibration feedback
    bellPlayer.playCartAddSound();
    bellPlayer.triggerHaptic([20]);

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    bellPlayer.triggerHaptic([15]);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const handleDeleteDish = (itemId) => {
    bellPlayer.triggerHaptic([25]);
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleUpdateItemInstructions = (itemId, instructions) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, specialInstructions: instructions } : i
      )
    );
  };

  // Place Order
  const handlePlaceOrder = async (orderPayload) => {
    try {
      setIsPlacingOrder(true);
      const savedOrder = await apiService.placeOrder(orderPayload);

      // Trigger victory sound & celebration confetti
      bellPlayer.playSuccessSound();
      bellPlayer.triggerHaptic([30, 50, 30]);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#b91c1c', '#f59e0b', '#10b981', '#3b82f6'],
      });

      // Clear cart & set active tracking order
      setCart([]);
      setIsCartOpen(false);
      setActiveCustomerOrder(savedOrder);
      setIsOrderTrackerOpen(true);
      loadOrdersData();
    } catch (err) {
      console.warn('Order placement notice:', err);
      alert('Server connect hone me samay le raha hai. Kripya 2 second baad dobara "CONFIRM & PLACE ORDER" dabayein.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Update order status from Admin Kitchen (Instant Optimistic UI update with zero delay)
  const handleUpdateStatus = async (orderId, newStatus) => {
    // 1. Lock override so background polling can never revert it
    recentStatusOverridesRef.current.set(orderId, {
      status: newStatus,
      timestamp: Date.now(),
    });

    // 2. Synchronous Instant Optimistic State Update (0ms delay!)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );

    if (activeCustomerOrder && activeCustomerOrder.id === orderId) {
      setActiveCustomerOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // 3. Send update to backend in background
    try {
      const updated = await apiService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
      );
      recentStatusOverridesRef.current.set(orderId, {
        status: updated.status,
        timestamp: Date.now(),
      });
    } catch (err) {
      // Revert on failure
      recentStatusOverridesRef.current.delete(orderId);
      loadOrdersData();
      alert('Failed to update status: ' + err.message);
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  // If in Admin Management Mode, render 100% Standalone Admin POS & Kitchen Suite (Zero customer clutter)
  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans select-none antialiased">
        <AdminDashboard
          orders={orders}
          stats={stats}
          menuItems={menuItems}
          categories={categories}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={loadOrdersData}
          onRefreshMenu={loadMenuData}
          isBellMuted={isBellMuted}
          setIsBellMuted={setIsBellMuted}
          openQrModal={() => setIsQrModalOpen(true)}
          adminUser={adminUser}
          onLogout={handleAdminLogout}
          onBackToMenu={() => {
            try {
              window.history.pushState({ screen: 'menu' }, '');
              const url = new URL(window.location);
              url.searchParams.delete('view');
              url.searchParams.delete('admin');
              window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            } catch (e) {}
            setActiveTab('menu');
          }}
        />

        {/* Standalone Table QR Code Standee Modal */}
        <QrCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col text-stone-900 select-none">
      {/* Network Connectivity Status Toast */}
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] bg-rose-950/95 text-rose-200 border-2 border-rose-500/80 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <span>Offline Mode Active • Viewing Cached Menu • Orders will sync upon reconnection</span>
        </div>
      )}
      {showOnlineToast && isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] bg-emerald-950/95 text-emerald-200 border-2 border-emerald-400 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Connected to Bikaner Express Kitchen</span>
        </div>
      )}
      {/* Grand Royal Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabSwitch}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        cartCount={cartCount}
        cartTotal={cartTotal}
        setIsCartOpen={setIsCartOpen}
        pendingOrdersCount={pendingOrdersCount}
        isBellRinging={isBellRinging}
        openQrModal={() => setIsQrModalOpen(true)}
        adminUser={adminUser}
        activeCustomerOrder={activeCustomerOrder}
        openOrderTracker={() => setIsOrderTrackerOpen(true)}
      />

      {/* Customer Main Content */}
      <main className={`flex-1 ${cartCount > 0 ? 'pb-36 sm:pb-32' : 'pb-24'}`}>
        <div>
          {/* Cinematic Hero Banner */}
          <HeroBanner
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* If user searched or clicked a category card: show CategoryDetail */}
          {selectedCategory || searchQuery ? (
            <CategoryDetail
              category={selectedCategory || categories[0]}
              categories={categories}
              menuItems={menuItems}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onDeleteDish={handleDeleteDish}
              onUpdateItemInstructions={handleUpdateItemInstructions}
              onBackToCategories={handleBackToCategories}
              onSelectCategory={handleSelectCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            /* User explicitly requested: First show sections (Drink, Roti, Curries, etc.) */
            <>
              <CategoryCards
                categories={categories}
                menuItems={menuItems}
                onSelectCategory={handleSelectCategory}
              />

              {/* Big Brand Signature Pillars */}
              <BrandAmenitiesStrip />
            </>
          )}
        </div>
      </main>

      {/* BIG UNMISSABLE "PLACE ORDER" FLOATING BAR */}
      {activeTab === 'menu' && cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-2.5 sm:bottom-5 left-2 right-2 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-40 animate-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-stone-950 via-red-950 to-stone-950 text-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.7)] border-2 border-amber-400 flex items-center justify-between gap-2 sm:gap-4 backdrop-blur-md">
            
            {/* Left: Table Tag & Total Amount */}
            <div 
              onClick={handleOpenCart}
              className="flex items-center gap-2 sm:gap-4 cursor-pointer min-w-0 group"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 font-black flex items-center justify-center shadow-md font-brand shrink-0">
                  <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-stone-950" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] sm:text-xs font-black w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-stone-900 shadow-sm animate-bounce">
                  {cartCount}
                </span>
              </div>
              
              <div className="truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] sm:text-xs text-amber-300 font-extrabold uppercase tracking-wider font-brand">
                    {tableNumber}
                  </span>
                  <span className="text-[10px] text-stone-400 hidden xs:inline">• {cartCount} {cartCount === 1 ? 'Dish' : 'Dishes'}</span>
                </div>
                <div className="flex items-baseline gap-1 truncate">
                  <span className="text-base sm:text-2xl font-black text-white tracking-tight font-sans">
                    {formatPrice(cartTotal)}
                  </span>
                  <span className="text-[9px] text-amber-300/90 font-bold underline cursor-pointer hover:text-white">
                    Tray ✏️
                  </span>
                </div>
              </div>
            </div>

            {/* Right: BIG "PLACE ORDER" BUTTON */}
            <button
              onClick={handleOpenCart}
              className="group relative bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-brand font-black text-xs sm:text-base px-3.5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-[0_4px_25px_rgba(212,175,55,0.5)] flex items-center gap-1.5 sm:gap-2 shrink-0 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-200"
            >
              <Bell className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-950 animate-bounce" />
              <div className="text-left leading-tight">
                <span className="block uppercase tracking-wider font-black text-xs sm:text-base text-stone-950">
                  PLACE ORDER
                </span>
                <span className="text-[8px] sm:text-[10px] text-red-950 font-bold block opacity-90 sm:hidden">
                  Review Tray →
                </span>
              </div>
              <span className="hidden sm:inline font-black text-red-950 text-base">🔔</span>
            </button>

          </div>
        </div>
      )}

      {/* Customer's Live Order Tracker Modal */}
      {activeCustomerOrder && isOrderTrackerOpen && (
        <LiveOrderTracker
          activeOrder={activeCustomerOrder}
          onClose={() => setIsOrderTrackerOpen(false)}
          onClearOrder={() => {
            setActiveCustomerOrder(null);
            setIsOrderTrackerOpen(false);
            localStorage.removeItem('bikaner_active_order');
          }}
        />
      )}

      {/* Persistent Customer Active Order Quick Floating Bar (Allows diner to return to active order anytime!) */}
      {activeCustomerOrder && !isOrderTrackerOpen && activeTab === 'menu' && (
        <aside
          aria-label="Active Order Quick Bar"
          className={`fixed left-3 right-3 sm:left-auto sm:right-6 sm:w-auto sm:max-w-md z-40 animate-in slide-in-from-bottom duration-300 ${
            cartCount > 0 ? 'bottom-20 sm:bottom-24' : 'bottom-3 sm:bottom-5'
          }`}
        >
          <button
            onClick={() => setIsOrderTrackerOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-stone-950 via-stone-900 to-red-950 text-white border-2 border-amber-400 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-2xl flex items-center justify-between gap-3 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black">
                  🔔
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 font-brand">
                    Active Order #{activeCustomerOrder.id} • {activeCustomerOrder.tableNumber}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    activeCustomerOrder.status === 'SERVED'
                      ? 'bg-emerald-500 text-white'
                      : activeCustomerOrder.status === 'PREPARING'
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-amber-400 text-stone-950 font-bold animate-pulse'
                  }`}>
                    {activeCustomerOrder.status === 'PENDING'
                      ? 'Sent to Kitchen'
                      : activeCustomerOrder.status === 'ACCEPTED'
                      ? 'Accepted'
                      : activeCustomerOrder.status === 'PREPARING'
                      ? 'Cooking'
                      : activeCustomerOrder.status === 'SERVED'
                      ? 'Served'
                      : activeCustomerOrder.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition">
                  Mera Order Dekhein / Track Status →
                </div>
              </div>
            </div>
            <div className="bg-amber-400 group-hover:bg-amber-300 text-stone-950 font-black text-xs px-3 py-1.5 rounded-xl font-brand shrink-0 shadow-xs">
              View
            </div>
          </button>
        </aside>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onDeleteDish={handleDeleteDish}
        onClearCart={handleClearCart}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        onUpdateItemInstructions={handleUpdateItemInstructions}
        onPlaceOrder={handlePlaceOrder}
        isPlacingOrder={isPlacingOrder}
      />

      {/* Admin Login Modal (Phone: 9058605348, Password: shivamshakya098) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Table QR Code Standee Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* User-Side AI Chat Bot Assistant */}
      {activeTab === 'menu' && (
        <AiChatBot
          tableNumber={tableNumber}
          menuItems={menuItems}
          categories={categories}
          activeCustomerOrder={activeCustomerOrder}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          cart={cart}
          onOpenCart={handleOpenCart}
          isCartBarVisible={cartCount > 0 && !isCartOpen}
        />
      )}

      {/* Grand Brand Footer (With Bottom Clearance so Floating Bar Never Covers Content) */}
      <footer className={`bg-stone-950 text-stone-400 text-xs py-12 ${cartCount > 0 ? 'pb-36 sm:pb-32' : 'pb-16'} border-t-2 border-amber-500/30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <h4 className="font-brand font-black text-white text-lg tracking-wider">
                  BIKANER EXPRESS FOODS PVT. LTD.
                </h4>
              </div>
              <p className="text-stone-400 text-xs max-w-lg leading-relaxed">
                Aman International Mall, 6/19 Radha Raman Road, Awas Vikas, Mainpuri (U.P.) 205001
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-1.5 text-xs">
              <span className="text-emerald-400 font-brand font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                100% PURE VEGETARIAN &amp; ROOFTOP DINING
              </span>
              <span className="text-stone-300 font-mono text-[11px]">
                Customer Care: 9193870000 | Manager: 9193506802, 9193506803
              </span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2 text-center sm:text-left">
            <span>© 2026 Bikaner Express Foods Pvt. Ltd. All Rights Reserved.</span>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-brand">Aman International Mall • Roof Top Mainpuri</span>
              <span className="text-stone-700 select-none">•</span>
              <button
                onClick={() => handleTabSwitch('admin')}
                className="opacity-30 hover:opacity-100 text-stone-500 hover:text-amber-300 text-[10px] flex items-center gap-1 transition"
                title="Management Portal"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Staff</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
