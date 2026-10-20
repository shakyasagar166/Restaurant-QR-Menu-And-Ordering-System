import React, { useState, useEffect } from 'react';
import {
  Lock,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  ArrowRight,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Terminal,
  Zap,
  Delete,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { apiService } from '../api/apiService';
import { bellPlayer } from '../utils/sound';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  // Login Mode: 'pin' (4-digit PIN) | 'password' (Phone & Password) | 'forgot' (Reset Recovery)
  const [authMode, setAuthMode] = useState('pin');

  // PIN state (4 digits)
  const [pin, setPin] = useState('');

  // Password state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot / Reset state
  const [masterKey, setMasterKey] = useState('');
  const [resetPhone, setResetPhone] = useState('9058605348');
  const [resetNewPin, setResetNewPin] = useState('9058');
  const [resetNewPassword, setResetNewPassword] = useState('shivamshakya098');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Physical keyboard listener for PIN when PIN tab is active
  useEffect(() => {
    if (!isOpen || authMode !== 'pin') return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinNumber(e.key);
      } else if (e.key === 'Backspace') {
        handlePinBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          submitPin(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, authMode, pin]);

  if (!isOpen) return null;

  // Handle PIN Keypad input
  const handlePinNumber = (digit) => {
    if (pin.length >= 4) return;
    bellPlayer.playCartAddSound();
    bellPlayer.triggerHaptic([15]);
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMessage('');

    // Auto-submit when 4th digit is entered!
    if (newPin.length === 4) {
      submitPin(newPin);
    }
  };

  const handlePinBackspace = () => {
    bellPlayer.triggerHaptic([10]);
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handlePinClear = () => {
    bellPlayer.triggerHaptic([15]);
    setPin('');
    setErrorMessage('');
  };

  // Submit 4-digit PIN
  const submitPin = async (pinToSubmit) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await apiService.loginWithPin(pinToSubmit);

      // Store secure session token (strictly excluding raw PIN)
      localStorage.setItem(
        'bikaner_admin_auth',
        JSON.stringify({
          token: data.token,
          name: data.name,
          phone: data.phone,
          role: data.role,
        })
      );

      bellPlayer.playSuccessSound();
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Invalid 4-digit PIN. Please try again.');
      setPin(''); // Reset PIN on error
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Fill Helpers
  const handleAutofillPin = () => {
    setPin('9058');
    submitPin('9058');
  };

  const handleAutofillPassword = () => {
    setPhone('9058605348');
    setPassword('shivamshakya098');
    setErrorMessage('');
  };

  // Submit Password Form
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setErrorMessage('Please enter both registered mobile number and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await apiService.loginAdmin(phone.trim(), password.trim());

      localStorage.setItem(
        'bikaner_admin_auth',
        JSON.stringify({
          token: data.token,
          name: data.name,
          phone: data.phone,
          role: data.role,
        })
      );

      bellPlayer.playSuccessSound();
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Invalid Mobile Number or Password. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Forgot Password & Reset Form
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!masterKey) {
      setErrorMessage('Please enter Master Recovery Key.');
      return;
    }
    if (resetNewPin && resetNewPin.length !== 4) {
      setErrorMessage('Quick PIN must be exactly 4 digits.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await apiService.resetPassword({
        phone: resetPhone.trim(),
        masterKey: masterKey.trim(),
        newPin: resetNewPin.trim(),
        newPassword: resetNewPassword.trim(),
      });

      localStorage.setItem(
        'bikaner_admin_auth',
        JSON.stringify({
          token: data.token,
          name: data.name,
          phone: data.phone,
          role: data.role,
        })
      );

      setSuccessMessage('Credentials reset successfully! Logging into POS...');
      bellPlayer.playSuccessSound();

      setTimeout(() => {
        onLoginSuccess(data);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid Master Recovery Key. Recovery rejected.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Dark backdrop with blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#090d16]/90 backdrop-blur-md"
      ></div>

      {/* Modern High-Tech POS Login Modal (Indigo & Slate Dark Console) */}
      <div className="font-pos relative bg-[#0f172a] rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl border-2 border-indigo-500/40 z-10 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100">
        
        {/* Header Ribbon */}
        <div className="bg-[#090d16] p-5 sm:p-6 text-center relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition active:scale-95 border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>← Back</span>
          </button>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 mx-auto mb-2.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#090d16] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-950/80 px-3 py-0.5 rounded-full border border-cyan-500/30 inline-block mb-1">
            POS TERMINAL SECURITY
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {authMode === 'forgot' ? 'Forgot Password & Reset' : 'Staff & Manager Login'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {authMode === 'forgot'
              ? 'Enter Master Key to reset Staff PIN & Password'
              : 'Bikaner Express Rooftop Dining POS'}
          </p>
        </div>

        {/* Dual Mode Switcher Tabs (Hidden when in Forgot mode) */}
        {authMode !== 'forgot' && (
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'pin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡ 4-Digit Quick PIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'password'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
              <span>Password Login</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-500/60 rounded-2xl p-3 flex items-center gap-2 text-xs text-rose-200 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-2xl p-3 flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* =========================================================
              MODE 1: 4-DIGIT TOUCHPIN KEYPAD (Commercial POS Standard)
          ========================================================= */}
          {authMode === 'pin' && (
            <div className="space-y-4">
              
              {/* Security Shield Badge */}
              <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Authorized Staff Only • End-to-End Encrypted</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  SECURE POS
                </span>
              </div>

              {/* 4 PIN Dots Indicator */}
              <div className="flex items-center justify-center gap-4 py-2">
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center ${
                        isFilled
                          ? 'bg-cyan-400 border-2 border-cyan-200 scale-125 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                          : 'border-2 border-slate-700 bg-slate-950'
                      }`}
                    >
                      {isFilled && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
                    </div>
                  );
                })}
              </div>

              {/* Responsive 3x4 Touch Keypad */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[280px] mx-auto select-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinNumber(String(num))}
                    disabled={isLoading}
                    className="h-13 sm:h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-cyan-600 text-white font-black text-xl sm:text-2xl transition shadow-xs active:scale-95 border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center cursor-pointer"
                  >
                    {num}
                  </button>
                ))}

                {/* Clear / Backspace */}
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  disabled={isLoading || pin.length === 0}
                  className="h-13 sm:h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition flex items-center justify-center border border-slate-800 cursor-pointer active:scale-95 disabled:opacity-30"
                  title="Delete single digit"
                >
                  <Delete className="w-5 h-5" />
                </button>

                {/* Zero */}
                <button
                  type="button"
                  onClick={() => handlePinNumber('0')}
                  disabled={isLoading}
                  className="h-13 sm:h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-cyan-600 text-white font-black text-xl sm:text-2xl transition shadow-xs active:scale-95 border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center cursor-pointer"
                >
                  0
                </button>

                {/* Clear All */}
                <button
                  type="button"
                  onClick={handlePinClear}
                  disabled={isLoading || pin.length === 0}
                  className="h-13 sm:h-14 rounded-2xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center border border-slate-800 cursor-pointer active:scale-95 disabled:opacity-30"
                >
                  Clear
                </button>
              </div>

              {isLoading && (
                <div className="text-center text-xs font-bold text-cyan-400 py-1 animate-pulse">
                  Verifying PIN &amp; Loading Console...
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              MODE 2: PHONE & PASSWORD (Manager Account)
          ========================================================= */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Security Shield Badge */}
              <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-bold text-slate-300 text-xs">Manager Authentication</span>
                </div>
                <span className="text-[10px] text-indigo-400/80 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  PROTECTED
                </span>
              </div>

              {/* Phone Input */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
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
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
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
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>AUTHENTICATE &amp; OPEN POS</span>
                    <ArrowRight className="w-4 h-4 text-cyan-200" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =========================================================
              MODE 3: FORGOT PASSWORD & RECOVERY RESET FORM
          ========================================================= */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5 animate-in fade-in duration-200">
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
                  <KeyRound className="w-4 h-4" />
                  <span>Master Security Key Recovery</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Forgot your password or PIN? Enter your Master Security Key to reset your Staff PIN and Password in the database.
                </p>
              </div>

              {/* Master Recovery Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Master Security Key:
                  </label>
                  <button
                    type="button"
                    onClick={() => setMasterKey('BIKANER2026')}
                    className="text-[10px] text-cyan-400 font-mono font-bold underline cursor-pointer"
                  >
                    Auto-Fill (BIKANER2026)
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter BIKANER2026 or Manager Phone"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              {/* Set New Quick PIN */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 block mb-1">
                  Set New 4-Digit Staff PIN:
                </label>
                <input
                  type="text"
                  maxLength="4"
                  placeholder="e.g. 9058 or 1234"
                  value={resetNewPin}
                  onChange={(e) => setResetNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full bg-[#090d16] border border-cyan-500/50 rounded-xl px-4 py-2 text-base font-mono font-black text-cyan-300 tracking-widest text-center focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Set New Password */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Set New Password:
                </label>
                <input
                  type="text"
                  placeholder="Enter new password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Reset Action Buttons */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3 rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-sm cursor-pointer"
              >
                {isLoading ? 'Resetting Credentials...' : 'RESET & LOG IN TO POS'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('pin');
                  setErrorMessage('');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white font-mono py-1 transition cursor-pointer"
              >
                ← Cancel and Return to PIN Login
              </button>
            </form>
          )}

          {/* Bottom Bar: Encrypted badge & UNMISSABLE Forgot Password Trigger */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px]">
            <span className="text-slate-500 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted Session</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'forgot' ? 'pin' : 'forgot');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>{authMode === 'forgot' ? 'Back to Login' : 'Forgot Password / PIN?'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
