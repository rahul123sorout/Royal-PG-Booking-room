'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Phone, Mail, Lock, User, IdCard, ArrowRight, ShieldCheck,
  RefreshCw, AlertCircle, KeyRound, CheckCircle2, UserPlus,
  Compass
} from 'lucide-react';

function AuthPageContent() {
  const { user, loading, otpSent, signUp, verifyOTP, loginWithEmail, forgotPassword, resetPassword, cancelOTP } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login Inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [password, setPassword] = useState('');

  // Forgot Password / Reset Password Inputs
  const [isForgotPasswordFlow, setIsForgotPasswordFlow] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // OTP States
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(60);
  const [otpTarget, setOtpTarget] = useState('');

  // Status and Messages
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync tab with query param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);

  // Redirect if logged in
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/resident');
      }
    }
  }, [user, loading, router]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Handle OTP focus shifting
  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = val.substring(val.length - 1);
    setOtpValues(newOtpValues);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = '';
      setOtpValues(newOtpValues);
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Direct login with Mobile/Email + Password (No OTP)
  const handleDirectSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (!loginIdentifier || !loginPassword) {
      setError('Please fill in both Mobile/Email and Password.');
      setSubmitting(false);
      return;
    }

    const result = await loginWithEmail(loginIdentifier, loginPassword);
    setSubmitting(false);
    if (result.success) {
      setInfo('Signed in successfully! Redirecting...');
    } else {
      setError(result.message);
    }
  };

  // Sign up triggers email verification code delivery
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    // Aadhaar Validation
    const cleanAadhaar = aadhaar.replace(/\s+/g, '').replace(/-/g, '');
    if (cleanAadhaar.length !== 12 || isNaN(Number(cleanAadhaar))) {
      setError('Aadhaar number must be exactly 12 digits.');
      setSubmitting(false);
      return;
    }

    // Phone Validation
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (cleanPhone.length !== 10 || isNaN(Number(cleanPhone))) {
      setError('Mobile number must be exactly 10 digits.');
      setSubmitting(false);
      return;
    }

    const role = email.toLowerCase().includes('admin') ? 'admin' : 'tenant';

    setIsForgotPasswordFlow(false);
    const result = await signUp({
      name,
      email: email.trim(),
      phone: cleanPhone,
      aadhaar: `${cleanAadhaar.substring(0, 4)}-${cleanAadhaar.substring(4, 8)}-${cleanAadhaar.substring(8, 12)}`,
      role
    }, password);

    setSubmitting(false);
    if (result.success) {
      setInfo(result.message);
      setOtpTarget(email.trim());
      setOtpValues(Array(6).fill('')); // Clean input values!
      setTimer(60);
    } else {
      setError(result.message);
    }
  };

  // Verify OTP for Signup Account Creation
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const code = otpValues.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      setSubmitting(false);
      return;
    }

    const result = await verifyOTP(code);
    setSubmitting(false);
    if (result.success) {
      setInfo('Verification successful! Account created and logged in.');
    } else {
      setError(result.message);
    }
  };

  // Forgot Password flow (triggers reset code email)
  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);

    if (!loginIdentifier) {
      setError('Please enter your email address in the identifier field first.');
      return;
    }
    if (!loginIdentifier.includes('@')) {
      setError('Password recovery requires your registered email address.');
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword(loginIdentifier.trim());
    setSubmitting(false);
    if (result.success) {
      setInfo(result.message);
      setOtpTarget(loginIdentifier.trim());
      setOtpValues(Array(6).fill('')); // Clean input values!
      setIsForgotPasswordFlow(true);
      setTimer(60);
    } else {
      setError(result.message);
    }
  };

  // Verify OTP & Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const code = otpValues.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      setSubmitting(false);
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setSubmitting(false);
      return;
    }

    const result = await resetPassword(loginIdentifier.trim(), code, newPassword);
    setSubmitting(false);
    if (result.success) {
      setInfo('Password reset successfully! Please sign in with your new password.');
      setIsForgotPasswordFlow(false);
      setLoginPassword('');
      setNewPassword('');
    } else {
      setError(result.message);
    }
  };

  // Re-request OTP during signup
  const handleResendSignUpOTP = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    setOtpValues(Array(6).fill('')); // Clean input values!

    let res;
    if (isForgotPasswordFlow) {
      res = await forgotPassword(loginIdentifier.trim());
    } else {
      res = await signUp({
        name,
        email: email.trim(),
        phone: phone.replace(/\s+/g, '').replace(/-/g, ''),
        aadhaar: aadhaar.replace(/\s+/g, '').replace(/-/g, ''),
        role: email.toLowerCase().includes('admin') ? 'admin' : 'tenant'
      }, password);
    }

    setSubmitting(false);
    if (res.success) {
      setTimer(60);
      setInfo('Verification OTP resent successfully!');
    } else {
      setError(res.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32 bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 text-gold-500 animate-spin" />
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">
            Connecting to Royal Chambers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-background relative overflow-hidden">
      {/* Luxury Background Glows */}
      <div className="absolute top-10 left-[15%] w-72 h-72 rounded-full bg-gold-500/5 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-gold-500/5 blur-[90px] pointer-events-none"></div>

      {/* Main Container Card */}
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300 transition-all ${
        otpSent 
          ? 'bg-black border border-neutral-800 shadow-[0_0_50px_rgba(188,142,80,0.15)] text-white' 
          : 'bg-card border border-border shadow-2xl text-neutral-900 dark:text-white'
      }`}>

        {/* Luxury Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold tracking-wider text-gold-500 flex items-center justify-center gap-2">
            <Compass className="h-7 w-7 text-gold-500" />
            ROYAL PG
          </h2>
          <p className={`text-[11px] mt-2 uppercase tracking-widest font-bold ${
            otpSent ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
          }`}>
            {otpSent
              ? isForgotPasswordFlow ? 'Password Recovery' : 'Security Verification'
              : activeTab === 'login'
                ? 'Portal Access'
                : 'New Membership Application'}
          </p>
        </div>

        {/* Tab Selection buttons (Hidden during verification screen) */}
        {!otpSent && (
          <div className="grid grid-cols-2 gap-1.5 bg-neutral-100 dark:bg-neutral-900/60 p-1.5 rounded-xl mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setInfo(null);
              }}
              className={`text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-card text-gold-500 shadow-sm border border-border'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Portal Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setError(null);
                setInfo(null);
              }}
              className={`text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-card text-gold-500 shadow-sm border border-border'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Apply / Register
            </button>
          </div>
        )}

        {/* Status and Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-xs mb-6 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {info && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-xs mb-6 animate-in slide-in-from-top-2">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{info}</span>
          </div>
        )}

        {/* ==================== SCREEN: OTP PASSWORD RESET ==================== */}
        {otpSent && isForgotPasswordFlow && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
            <div className="text-center space-y-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center mx-auto mb-2 animate-pulse-slow">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-serif">Enter Password Reset Details</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Enter verification OTP sent to:<br />
                <span className="text-gold-400 font-bold block mt-1">{otpTarget}</span>
              </p>
            </div>

            {/* OTP Numbers */}
            <div className="flex justify-between gap-2.5 max-w-xs mx-auto my-4">
              {otpValues.map((val, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  required
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  value={val}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-white transition-all duration-300 focus:scale-105 transform"
                />
              ))}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-widest">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-white font-medium transition-all"
                />
              </div>
            </div>

            {/* Resend details */}
            <div className="text-center text-xs">
              {timer > 0 ? (
                <span className="text-neutral-400">
                  Resend OTP available in <span className="text-gold-500 font-semibold">{timer}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendSignUpOTP}
                  className="text-gold-500 hover:text-gold-400 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Resend OTP Code
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  cancelOTP();
                }}
                className="flex-1 border border-neutral-800 text-neutral-300 hover:bg-neutral-900/60 text-xs py-3 rounded-xl transition-all font-bold bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(188,142,80,0.3)] text-xs active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
              >
                {submitting ? 'Resetting...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}

        {/* ==================== SCREEN: OTP SIGNUP VERIFICATION ==================== */}
        {otpSent && !isForgotPasswordFlow && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center space-y-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center mx-auto mb-2 animate-pulse-slow">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-serif">OTP Code Verification</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                A verification OTP code has been dispatched to:<br />
                <span className="text-gold-400 font-bold block mt-1">{otpTarget}</span>
              </p>
            </div>

            {/* 6 Digit Numeric Inputs */}
            <div className="flex justify-between gap-2.5 max-w-xs mx-auto my-6">
              {otpValues.map((val, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  required
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  value={val}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-white transition-all duration-300 focus:scale-105 transform"
                />
              ))}
            </div>

            {/* Timer countdown for resending */}
            <div className="text-center text-xs">
              {timer > 0 ? (
                <span className="text-neutral-400">
                  Resend OTP available in <span className="text-gold-500 font-semibold">{timer}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendSignUpOTP}
                  className="text-gold-500 hover:text-gold-400 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Resend Code Now
                </button>
              )}
            </div>

            {/* Submit / Cancel Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  cancelOTP();
                }}
                className="flex-1 border border-neutral-800 text-neutral-300 hover:bg-neutral-900/60 text-xs py-3 rounded-xl transition-all font-bold bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(188,142,80,0.3)] text-xs active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
              >
                {submitting ? 'Verifying...' : 'Verify & Setup'}
              </button>
            </div>
          </form>
        )}

        {/* ==================== TAB: PORTAL ACCESS (LOGIN) ==================== */}
        {activeTab === 'login' && !otpSent && (
          <form onSubmit={handleDirectSignIn} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter email or 10-digit mobile"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-bold text-gold-500 hover:text-gold-600 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-1.5 mt-6 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
            >
              {submitting ? 'Verifying...' : 'Sign In'}
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Are you an existing PG resident?{' '}
                <a
                  href="/resident"
                  className="text-gold-500 font-bold hover:underline"
                >
                  Go to Resident Portal &rarr;
                </a>
              </p>
            </div>
          </form>
        )}

        {/* ==================== TAB: NEW REGISTRATION ==================== */}
        {activeTab === 'signup' && !otpSent && (
          <form onSubmit={handleSignUpSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5" />
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                  Aadhaar Number
                </label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="12-digit UID"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-1.5 mt-6 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
            >
              {submitting ? 'Registering...' : 'Register & Verify Email'}
              <UserPlus className="h-4.5 w-4.5" />
            </button>
          </form>
        )}

        {/* Biometric seal footer */}
        <div className={`mt-8 pt-4 border-t flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold ${
          otpSent ? 'border-neutral-900 text-neutral-400' : 'border-border text-neutral-500 dark:text-neutral-400'
        }`}>
          <ShieldCheck className="h-4 w-4 text-gold-500" />
          <span>Biometric Secure Access Vault</span>
        </div>

      </div>
    </div>
  );
}


export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-32 bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 text-gold-500 animate-spin" />
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest text-center">
            Initializing Secure Access Portal...
          </p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
