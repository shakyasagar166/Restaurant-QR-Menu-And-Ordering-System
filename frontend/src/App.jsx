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
import AiChatBot from './components/AiChatBot';
import { apiService } from './api/apiService';
import { bellPlayer } from './utils/sound';
import { formatPrice } from './utils/formatters';
import { ShoppingBag, Bell, Sparkles, CheckCircle2, Crown } from 'lucide-react';

export default function App() {
  // Navigation & view states
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'admin'
  const [selectedCategory, setSelectedCategory] = useState(null); // null = show Category Cards
  const [searchQuery, setSearchQuery] = useState('');

  // Table selection from URL param or default
  const [tableNumber, setTableNumber] = useState('T-1');

  // Menu data from Spring Boot
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

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

  // Order management & Realtime Bell Alert
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [isBellMuted, setIsBellMuted] = useState(false);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // Customer's currently active order for live tracking
  const [activeCustomerOrder, setActiveCustomerOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('bikaner_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // QR Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Read URL query params on mount (e.g. ?table=T-4)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table');
    if (tbl) {
      setTableNumber(tbl.toUpperCase());
    }
  }, []);

  // Mobile phone hardware & browser Back Button integration
  useEffect(() => {
    const handlePopState = () => {
      if (isCartOpen) {
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
  }, [isCartOpen, isQrModalOpen, isAdminLoginModalOpen, selectedCategory, searchQuery, activeTab]);

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

  // Fetch Menu and Categories from Spring Boot backend
  const loadMenuData = async () => {
    try {
      setIsLoadingMenu(true);
      const [items, cats] = await Promise.all([
        apiService.getMenu(),
        apiService.getCategories(),
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (err) {
      console.warn('Backend menu fetch warning, using fallback menu if offline:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Fetch orders & stats for Admin Kitchen view
  const loadOrdersData = async () => {
    try {
      const [ordersList, statsData] = await Promise.all([
        apiService.getOrders(),
        apiService.getStats(),
      ]);
      setOrders(ordersList);
      setStats(statsData);

      // Check if current customer order was updated
      if (activeCustomerOrder) {
        const found = ordersList.find((o) => o.id === activeCustomerOrder.id);
        if (found && found.status !== activeCustomerOrder.status) {
          setActiveCustomerOrder(found);
        }
      }
    } catch (err) {
      console.warn('Orders fetch error:', err);
    }
  };

  useEffect(() => {
    loadMenuData();
    loadOrdersData();
  }, []);

  // Real-time SSE listener for Kitchen Order Bell
  useEffect(() => {
    const eventSource = apiService.subscribeToOrderAlerts(
      // onNewOrder
      (newOrder) => {
        // 🔔 Ring the Bell!
        if (!isBellMuted) {
          bellPlayer.playOrderBell();
        }
        setIsBellRinging(true);
        setTimeout(() => setIsBellRinging(false), 3000);

        setNewOrderAlert(newOrder);
        setTimeout(() => setNewOrderAlert(null), 6000);

        // Update orders list & stats
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        loadOrdersData();
      },
      // onOrderUpdated
      (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );
        if (activeCustomerOrder && activeCustomerOrder.id === updatedOrder.id) {
          setActiveCustomerOrder(updatedOrder);
        }
        loadOrdersData();
      }
    );

    // Polling fallback every 4s
    const interval = setInterval(() => {
      loadOrdersData();
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [isBellMuted, activeCustomerOrder]);

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
  };

  const handleAdminLogout = async () => {
    if (adminUser?.token) {
      await apiService.logoutAdmin(adminUser.token);
    }
    localStorage.removeItem('bikaner_admin_auth');
    setAdminUser(null);
    setActiveTab('menu');
  };

  // Cart operations
  const handleAddToCart = (item) => {
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
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Place Order
  const handlePlaceOrder = async (orderPayload) => {
    try {
      setIsPlacingOrder(true);
      const savedOrder = await apiService.placeOrder(orderPayload);

      // Trigger celebration confetti
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
      loadOrdersData();
    } catch (err) {
      alert('Could not submit order: ' + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Update order status from Admin Kitchen
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await apiService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (activeCustomerOrder && activeCustomerOrder.id === orderId) {
        setActiveCustomerOrder(updated);
      }
      loadOrdersData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col text-stone-900 select-none">
      {/* Toast Alert for Incoming Order */}
      {newOrderAlert && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-red-900 to-stone-950 text-white px-5 py-3.5 rounded-3xl shadow-2xl flex items-center gap-3 border-2 border-amber-400 animate-bounce">
          <Bell className="w-5 h-5 text-amber-300 animate-bell" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 font-brand">
              🔔 NEW ORDER ALERT!
            </div>
            <div className="text-xs sm:text-sm font-bold">
              {newOrderAlert.tableNumber} ordered {newOrderAlert.items?.length} items ({formatPrice(newOrderAlert.totalAmount)})
            </div>
          </div>
          <button
            onClick={() => handleTabSwitch('admin')}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-black px-3.5 py-1.5 rounded-2xl ml-2 shadow-sm transition active:scale-95 font-brand"
          >
            Open Ticket
          </button>
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
      />

      {/* Main Content */}
      <main className={`flex-1 ${cartCount > 0 ? 'pb-36 sm:pb-32' : 'pb-24'}`}>
        {activeTab === 'menu' ? (
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
                onBackToCategories={handleBackToCategories}
                onSelectCategory={handleSelectCategory}
                searchQuery={searchQuery}
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
        ) : (
          /* Admin / Kitchen Monitor */
          <AdminDashboard
            orders={orders}
            stats={stats}
            onUpdateStatus={handleUpdateStatus}
            onRefresh={loadOrdersData}
            isBellMuted={isBellMuted}
            setIsBellMuted={setIsBellMuted}
            openQrModal={() => setIsQrModalOpen(true)}
            adminUser={adminUser}
            onLogout={handleAdminLogout}
            onBackToMenu={() => setActiveTab('menu')}
          />
        )}
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

      {/* Customer's Live Order Tracker */}
      {activeCustomerOrder && activeCustomerOrder.status !== 'SERVED' && (
        <LiveOrderTracker
          activeOrder={activeCustomerOrder}
          onClose={() => setActiveCustomerOrder(null)}
        />
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
          isCartBarVisible={cartCount > 0 && !isCartOpen}
        />
      )}

      {/* Grand Brand Footer */}
      <footer className="bg-stone-950 text-stone-400 text-xs py-12 border-t-2 border-amber-500/30">
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
            <span className="text-amber-400 font-brand">Aman International Mall • Roof Top Mainpuri</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
