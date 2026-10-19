import React, { useState } from 'react';
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
} from 'lucide-react';
import { formatPrice, formatTime, getTimeAgo } from '../utils/formatters';
import { bellPlayer } from '../utils/sound';

export default function AdminDashboard({
  orders,
  stats,
  onUpdateStatus,
  onRefresh,
  isBellMuted,
  setIsBellMuted,
  openQrModal,
  adminUser,
  onLogout,
  onBackToMenu,
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showTableBreakdown, setShowTableBreakdown] = useState(false);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    return order.status === activeFilter;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  const handleTestBell = () => {
    bellPlayer.playOrderBell();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 w-full max-w-full overflow-hidden">
      {/* Top Prominent Back Button to Customer Menu */}
      <div className="mb-4">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-800 to-red-950 hover:from-red-900 hover:to-black text-white font-brand font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md border border-amber-400 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>← Back to Customer Menu (कस्टमर मेनू पर वापस जाएं)</span>
        </button>
      </div>

      {/* Top Manager Identity & Session Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-800 to-amber-700 text-amber-300 flex items-center justify-center font-brand font-black text-lg shadow-md border border-amber-400">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand font-black text-stone-900 text-base sm:text-lg">
                {adminUser?.name || 'Shivam Shakya'}
              </span>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-300">
                Authorized Admin
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono">
              Phone: +91 {adminUser?.phone || '9058605348'} • Session Protected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            onClick={openQrModal}
            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-3.5 py-2 rounded-xl transition"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-700" />
            <span>Table QR Generator</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs px-3.5 py-2 rounded-xl border border-red-200 transition active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Grand Sales & Kitchen Control Center */}
      <div className="bg-gradient-to-br from-stone-950 via-red-950 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Real-Time Bell Stream Active</span>
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 font-brand">
                High Concurrency Engine
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-brand font-black text-white tracking-tight">
              Executive Kitchen &amp; Sales Dashboard
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
              Live incoming customer orders trigger instantaneous audio bell rings. Review total restaurant revenue, manage active orders, and update kitchen states.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTestBell}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-brand font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg transition active:scale-95"
            >
              <Bell className="w-4 h-4 animate-bell text-stone-950" />
              <span>Test Bell Sound 🔔</span>
            </button>

            <button
              onClick={() => setIsBellMuted(!isBellMuted)}
              className={`flex items-center gap-2 font-bold text-xs px-3.5 py-2.5 rounded-2xl border transition ${
                isBellMuted
                  ? 'bg-red-950/80 border-red-500/60 text-red-200'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {isBellMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isBellMuted ? 'Muted' : 'Sound ON'}</span>
            </button>

            <button
              onClick={() => setShowTableBreakdown(!showTableBreakdown)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl border border-white/10 transition"
            >
              <TableProperties className="w-4 h-4 text-amber-300" />
              <span>Table Revenue</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Refresh Orders"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FINANCIAL REVENUE CARDS (Total Sales Requirement) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15">
          {/* TOTAL SALES CARD */}
          <div className="bg-gradient-to-br from-amber-500/20 via-red-900/30 to-stone-900/80 backdrop-blur-md rounded-3xl p-5 border-2 border-amber-400/60 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 font-brand">
                💰 Total Restaurant Sales
              </span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
              {formatPrice(stats?.totalSales || 0)}
            </div>
            <span className="text-[11px] text-stone-300 mt-1 block">
              Gross revenue from all placed orders
            </span>
          </div>

          {/* TODAY'S SALES CARD */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/15 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-widest font-brand">
                📅 Today's Live Sales
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-sans">
              {formatPrice(stats?.todaySales || stats?.totalSales || 0)}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">
              Avg Order Value: {formatPrice(stats?.averageOrderValue || 0)}
            </span>
          </div>

          {/* PENDING BELL ALERTS */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/15 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-widest font-brand">
                🔔 Orders Awaiting Accept
              </span>
              {pendingCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {pendingCount}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">
              {pendingCount > 0 ? '⚠️ Action Required on Table' : 'All orders acknowledged'}
            </span>
          </div>

          {/* TOTAL ORDERS COUNT */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/15 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-widest font-brand">
                📋 Total Orders Handled
              </span>
              <ShoppingBag className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {stats?.totalOrders || orders.length}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">
              Active: {orders.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING').length} | Served: {orders.filter((o) => o.status === 'SERVED').length}
            </span>
          </div>
        </div>

        {/* Toggleable Table Revenue Breakdown */}
        {showTableBreakdown && stats?.tableSales && (
          <div className="mt-6 pt-5 border-t border-white/15 bg-black/30 rounded-2xl p-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3 font-brand">
              Table-Wise Revenue Breakdown:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
              {Object.entries(stats.tableSales).map(([tbl, amt]) => (
                <div key={tbl} className="bg-white/10 rounded-xl p-2 text-center border border-white/10">
                  <span className="font-bold text-amber-200 block text-[11px]">{tbl}</span>
                  <span className="font-black text-white text-xs">{formatPrice(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
        {[
          { key: 'ALL', label: `All Orders (${orders.length})` },
          { key: 'PENDING', label: `Pending Bell Alert (${pendingCount})`, badge: pendingCount > 0 },
          { key: 'ACCEPTED', label: 'Accepted in Kitchen' },
          { key: 'PREPARING', label: 'Cooking in Progress' },
          { key: 'SERVED', label: 'Served & Closed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-brand font-bold transition flex items-center gap-2 ${
              activeFilter === tab.key
                ? 'bg-gradient-to-r from-red-800 to-red-950 text-white shadow-md border-2 border-amber-400'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-400'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>
        ))}
      </div>

      {/* Live Orders Deck */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center my-6 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            📋
          </div>
          <h4 className="text-xl font-brand font-bold text-stone-900 mb-1">
            No orders in this filter
          </h4>
          <p className="text-xs text-stone-500">
            Whenever any customer places an order from their table, you will hear a bell chime and the ticket will appear immediately.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'PENDING';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isPending
                    ? 'border-red-500 shadow-xl shadow-red-200/60 ring-4 ring-red-100'
                    : 'border-stone-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Order Ticket Header */}
                <div
                  className={`p-5 border-b ${
                    isPending
                      ? 'bg-gradient-to-r from-red-50 to-amber-50/80 border-red-200'
                      : 'bg-stone-50 border-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-stone-500 font-mono">
                      Ticket #{order.id}
                    </span>
                    <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {getTimeAgo(order.createdAt)} ({formatTime(order.createdAt)})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg sm:text-xl font-black bg-stone-950 text-white px-3 py-1 rounded-xl shadow-xs font-brand">
                        {order.tableNumber}
                      </span>
                      <div>
                        <span className="font-brand font-bold text-stone-900 text-sm block leading-tight">
                          {order.customerName || 'Dine-In Guest'}
                        </span>
                        {order.customerPhone && (
                          <span className="text-[11px] text-stone-500 font-mono">
                            {order.customerPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider font-brand ${
                        order.status === 'PENDING'
                          ? 'bg-red-600 text-white animate-pulse'
                          : order.status === 'ACCEPTED'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : order.status === 'PREPARING'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : order.status === 'SERVED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-5 flex-1 space-y-2.5">
                  <div className="space-y-2">
                    {order.items &&
                      order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-black bg-amber-100 text-amber-950 w-5 h-5 rounded-lg flex items-center justify-center text-[11px] shrink-0 font-sans">
                              {item.quantity}×
                            </span>
                            <span className="font-bold text-stone-800">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-black text-stone-900 font-sans">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Special Chef Instructions */}
                  {order.notes && (
                    <div className="mt-3 bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-950">
                      <span className="font-black uppercase tracking-wider text-[10px] text-amber-800 block mb-0.5 font-brand">
                        Special Instructions:
                      </span>
                      {order.notes}
                    </div>
                  )}
                </div>

                {/* Footer with Total and Workflow Action */}
                <div className="p-5 border-t border-stone-100 bg-stone-50/70 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                    <span className="font-brand uppercase tracking-wider">Ticket Total</span>
                    <span className="text-xl font-black text-stone-900 font-sans">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    {order.status === 'PENDING' && (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
                          className="col-span-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-brand font-black text-xs py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 border border-emerald-500/40"
                        >
                          <Check className="w-4 h-4" />
                          <span>ACCEPT ORDER</span>
                        </button>
                        <button
                          onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                          className="bg-stone-200 hover:bg-red-100 text-stone-700 hover:text-red-700 font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {order.status === 'ACCEPTED' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-brand font-bold text-xs py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>START PREPARING (IN KITCHEN)</span>
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'SERVED')}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-brand font-black text-xs py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>MARK AS SERVED / DELIVERED</span>
                      </button>
                    )}

                    {order.status === 'SERVED' && (
                      <div className="text-center text-xs font-black text-emerald-700 py-1.5 flex items-center justify-center gap-1.5 font-brand">
                        <CheckCircle className="w-4 h-4" />
                        <span>Delivered to Customer Table</span>
                      </div>
                    )}

                    {order.status === 'CANCELLED' && (
                      <div className="text-center text-xs font-bold text-stone-400 py-1.5">
                        Order Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="mt-8 mb-4 text-center">
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-stone-900 to-red-950 hover:from-black hover:to-red-900 text-white font-brand font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg border-2 border-amber-400 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>← Back to Customer Dining Menu (मेनू पर वापस जाएं)</span>
        </button>
      </div>
    </div>
  );
}
