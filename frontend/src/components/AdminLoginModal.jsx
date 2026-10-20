import React, { useState } from 'react';
import { Lock, Phone, Eye, EyeOff, ShieldCheck, X, ArrowRight, AlertCircle, KeyRound, ArrowLeft, Terminal, Cpu } from 'lucide-react';
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
        className="fixed inset-0 bg-[#090d16]/85 backdrop-blur-md"
      ></div>

      {/* Modern High-Tech POS Login Modal (Indigo & Slate Dark Console) */}
      <div className="relative bg-[#0f172a] rounded-3xl max-w-md w-full shadow-2xl border-2 border-indigo-500/40 z-10 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100 font-sans">
        {/* Header Ribbon */}
        <div className="bg-[#090d16] p-6 text-center relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition active:scale-95 border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>← Back</span>
          </button>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 mx-auto mb-3 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#090d16] flex items-center justify-center">
              <Terminal className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-950/80 px-3 py-0.5 rounded-full border border-cyan-500/30 inline-block mb-1.5">
            TERMINAL SECURITY
          </span>

          <h3 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight">
            Manager &amp; Kitchen Login
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Access live KOT tickets, audio bell alerts &amp; sales analytics
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Quick Credentials Info / 1-Click Fill Pill */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white block leading-tight">Admin: Shivam Shakya</span>
                <span className="text-[11px] text-slate-400 font-mono">9058605348 • ••••••••</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutofill}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap active:scale-95"
            >
              1-Click Fill
            </button>
          </div>

          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-500/60 rounded-2xl p-3 flex items-center gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Registered Staff Phone:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="e.g. 9058605348"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Terminal Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter staff security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl pl-10 pr-11 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-mono font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 text-sm border border-indigo-400/40 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Terminal...</span>
              ) : (
                <>
                  <span>AUTHENTICATE &amp; OPEN POS</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Encrypted session for restaurant staff and management.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
