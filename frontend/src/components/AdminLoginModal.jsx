import React, { useState } from 'react';
import { Lock, Phone, Eye, EyeOff, ShieldCheck, Crown, X, ArrowRight, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { apiService } from '../api/apiService';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAutofill = () => {
    setPhone('9058605348');
    setPassword('shivamshakya098');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setErrorMessage('Please enter both registered mobile number and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await apiService.loginAdmin(phone.trim(), password.trim());
      
      // Store session
      localStorage.setItem('bikaner_admin_auth', JSON.stringify({
        token: data.token,
        name: data.name,
        phone: data.phone,
        role: data.role,
      }));

      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Invalid Mobile Number or Password. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop with blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm"
      ></div>

      {/* Royal Login Modal */}
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-amber-400/60 z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-stone-950 via-red-950 to-stone-950 text-white p-6 text-center relative border-b border-amber-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center gap-1 bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>← Back</span>
          </button>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border-2 border-amber-400/50 mx-auto mb-3 flex items-center justify-center text-amber-400 shadow-lg">
            <Crown className="w-7 h-7" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-400/40 inline-block mb-1.5 font-brand">
            Management Portal
          </span>

          <h3 className="text-xl sm:text-2xl font-brand font-black text-white tracking-tight">
            Admin &amp; Kitchen Login
          </h3>
          <p className="text-xs text-stone-300 mt-1">
            Access live table orders, bell alerts &amp; real-time sales reports
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Quick Credentials Info / 1-Click Fill Pill */}
          <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold text-amber-950 block leading-tight">Admin: Shivam Shakya</span>
                <span className="text-[11px] text-stone-600 font-mono">9058605348 • ••••••••</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutofill}
              className="bg-amber-400 hover:bg-amber-500 text-stone-950 text-[11px] font-black px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap active:scale-95 font-brand"
            >
              1-Click Fill
            </button>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-3 flex items-center gap-2 text-xs text-red-800 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1.5 font-brand">
                Registered Mobile Number:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="e.g. 9058605348"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-1.5 font-brand">
                Security Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-11 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-800 via-red-900 to-stone-900 hover:from-red-900 hover:to-black text-white font-brand font-black py-3.5 rounded-2xl shadow-xl shadow-red-950/20 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 text-sm border border-amber-400/40"
            >
              {isLoading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <span>LOGIN TO ADMIN PORTAL</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-100">
            <span className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Authorized for Bikaner Express management personnel only.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
