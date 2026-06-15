'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { usePGData } from '../../context/PGContext';
import { 
  Building, Calendar, CreditCard, Clock, History, Wrench, Plus, 
  CheckCircle2, AlertTriangle, FileText, Download, LogOut, ArrowRight,
  User, CheckCircle, ShieldAlert, Sparkles, Receipt, X, Printer,
  Mail, Lock
} from 'lucide-react';

export default function ResidentPortal() {
  const { user, loginWithEmail, logout } = useAuth();
  const { tenants, rooms, payments, maintenanceRequests, raiseMaintenanceRequest } = usePGData();
  const router = useRouter();

  // Login inputs
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active dashboard tabs: 'overview' | 'payments' | 'maintenance'
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'maintenance'>('overview');

  // Maintenance form state
  const [mCategory, setMCategory] = useState<'Plumbing' | 'Electrical' | 'Wi-Fi' | 'Cleaning' | 'AC' | 'Other'>('Plumbing');
  const [mUrgency, setMUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [mDescription, setMDescription] = useState('');
  const [mSuccess, setMSuccess] = useState<string | null>(null);
  const [mError, setMError] = useState<string | null>(null);

  // Selected receipt for download/print
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!identifier || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const res = await loginWithEmail(identifier, password);
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  // Find current tenant matching logged in user phone or email
  const currentTenant = tenants.find(t => {
    if (!user) return false;
    const cleanUserPhone = user.phone.replace('+91', '').trim();
    const cleanTenantPhone = t.phone.replace('+91', '').trim();
    return cleanTenantPhone === cleanUserPhone || t.email.toLowerCase() === user.email.toLowerCase();
  }) || (user && user.role === 'tenant' ? {
    id: 'demo-resident-id',
    name: user.name || 'Siddharth Roy',
    email: user.email || 'sid@gmail.com',
    phone: user.phone || '9876543210',
    aadhaar: user.aadhaar || '1234-5678-9012',
    roomId: 'room-102',
    roomNumber: '102',
    joiningDate: user.joinedDate || '2026-01-10',
    rentAmount: 15000,
    status: 'Active' as const,
    profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
  } : null);

  // Find room details
  const roomDetails = currentTenant ? rooms.find(r => r.number === currentTenant.roomNumber || r.id === currentTenant.roomId) || {
    id: 'room-102',
    number: '102',
    type: 'Double Share' as const,
    price: 15000,
    capacity: 2,
    occupied: 2,
    gender: 'Boys' as const,
    amenities: ['AC', 'High Speed Wi-Fi', 'Smart TV', 'Attached Washroom', 'Housekeeping'],
    status: 'Full' as const,
    images: []
  } : null;

  // Find roommates
  const roommates = currentTenant ? tenants.filter(
    t => t.roomNumber === currentTenant.roomNumber && t.id !== currentTenant.id && t.status === 'Active'
  ) : [];

  // Filter payment history
  const myPayments = currentTenant ? payments.filter(
    p => p.tenantId === currentTenant.id || p.tenantName.toLowerCase() === currentTenant.name.toLowerCase()
  ) : [];

  // Filter maintenance history
  const myMaintenance = currentTenant ? maintenanceRequests.filter(
    m => m.tenantId === currentTenant.id || m.tenantName.toLowerCase() === currentTenant.name.toLowerCase()
  ) : [];

  // Calculate pending dues
  const pendingPayments = myPayments.filter(p => p.status === 'Pending' || p.status === 'Overdue');
  const pendingDuesTotal = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const rentStatus = pendingPayments.length > 0 ? 'Pending' : 'Paid';

  // Handle Maintenance Submit
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMSuccess(null);
    setMError(null);

    if (!currentTenant) return;

    if (!mDescription.trim()) {
      setMError('Please enter a description of the issue.');
      return;
    }

    const res = await raiseMaintenanceRequest({
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      roomNumber: currentTenant.roomNumber,
      category: mCategory,
      urgency: mUrgency,
      description: mDescription
    });

    if (res.success) {
      setMSuccess('Maintenance request submitted successfully!');
      setMDescription('');
    } else {
      setMError(res.message);
    }
  };

  // Printable receipt printing helper
  const handlePrintReceipt = () => {
    window.print();
  };

  // If not logged in, show the login view
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-background relative overflow-hidden">
        {/* Luxury Background Glows */}
        <div className="absolute top-10 left-[15%] w-72 h-72 rounded-full bg-gold-500/5 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-gold-500/5 blur-[90px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-card border border-border shadow-2xl p-6 sm:p-8 rounded-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold tracking-wider text-gold-500">ROYAL PG</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 uppercase tracking-widest font-bold">
              Existing PG Resident Portal
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-xs mb-6">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/70 h-4.5 w-4.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter registered mobile or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                />
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
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-1.5 mt-6 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Enter Portal'}
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-border flex flex-col gap-3 text-center">
            <a href="/login" className="text-xs text-neutral-500 dark:text-neutral-400 hover:underline">
              Not a resident yet? Join or book a room &rarr;
            </a>
            <a href="/" className="text-xs text-gold-500 hover:underline font-bold">
              Back to Landing Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If user role is admin, redirect to admin dashboard (or notice)
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md bg-card border border-border shadow-xl p-8 rounded-2xl text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-gold-500 mx-auto" />
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Administrator Profile Detected</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Please use the primary management panel to oversee rooms, bookings, payments, and raise invoices.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl transition-all text-xs"
            >
              Go to Admin Dashboard
            </button>
            <button
              onClick={logout}
              className="flex-1 border border-border hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300 py-3 rounded-xl transition-all text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If logged-in tenant record is missing
  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md bg-card border border-border shadow-xl p-8 rounded-2xl text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-gold-500 mx-auto" />
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Profile Not Linked</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            We verified your login credential, but couldn't associate it with an active PG resident folder. Please contact PG Front Desk to register your mobile/email.
          </p>
          <button
            onClick={logout}
            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl transition-all text-xs"
          >
            Sign Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 print:bg-white print:text-black">
      
      {/* Header bar (Hidden in print) */}
      <header className="bg-card border-b border-border py-4 px-6 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-gold-500" />
            <h1 className="text-xl font-serif font-bold tracking-wider text-gold-500">ROYAL RESIDENCY</h1>
            <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-gold-500/20">
              PG Tenant Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{currentTenant.name}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Room {currentTenant.roomNumber}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 border border-border hover:bg-red-500/5 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 text-xs px-3.5 py-2 rounded-xl transition-all font-bold"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 print:p-0">
        
        {/* Resident Summary Greeting Card (Hidden in print) */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex gap-4 items-center">
            <div className="h-16 w-16 rounded-full border-2 border-gold-500 overflow-hidden shrink-0">
              <img 
                src={currentTenant.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                Welcome, {currentTenant.name}!
                <Sparkles className="h-5 w-5 text-gold-500 animate-pulse-slow" />
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Residing at Noida Sector 62 Chambers &bull; Room <span className="font-bold text-gold-500">{currentTenant.roomNumber}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Joining Date</p>
              <p className="text-sm font-semibold flex items-center gap-1">
                <Calendar className="h-4.5 w-4.5 text-gold-500" />
                {currentTenant.joiningDate}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Rent Status</p>
              <p className={`text-sm font-bold flex items-center gap-1.5 ${
                rentStatus === 'Paid' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {rentStatus === 'Paid' ? (
                  <>
                    <CheckCircle className="h-4.5 w-4.5" />
                    Paid
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4.5 w-4.5" />
                    Pending
                  </>
                )}
              </p>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Pending Rent</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                INR {pendingDuesTotal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </section>

        {/* Tab Navigation (Hidden in print) */}
        <section className="flex border-b border-border/80 gap-6 print:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'border-gold-500 text-gold-500' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            My Room Details
          </button>
          
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'payments' 
                ? 'border-gold-500 text-gold-500' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            Rent & payments ({myPayments.length})
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'maintenance' 
                ? 'border-gold-500 text-gold-500' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Wrench className="h-4.5 w-4.5" />
            Maintenance tickets ({myMaintenance.length})
          </button>
        </section>

        {/* ==================== VIEW: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
            {/* Room Specs */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2">
              <h3 className="text-lg font-serif font-bold border-b border-border pb-3 text-gold-500 uppercase tracking-wide">
                Room Configuration Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Room Number</p>
                    <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{roomDetails?.number}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Sharing Type</p>
                    <p className="text-base font-semibold">{roomDetails?.type}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Monthly Rent</p>
                    <p className="text-base font-semibold text-gold-500">INR {roomDetails?.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Occupancy</p>
                    <p className="text-base font-semibold">
                      {roomDetails?.occupied} / {roomDetails?.capacity} Bed(s) Occupied
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Allowed Gender</p>
                    <p className="text-base font-semibold">{roomDetails?.gender}</p>
                  </div>
                </div>
              </div>

              {/* Room Amenities */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Room Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {roomDetails?.amenities.map((amenity, i) => (
                    <span 
                      key={i} 
                      className="bg-neutral-100 dark:bg-neutral-900 border border-border/80 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Roommates Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-serif font-bold border-b border-border pb-3 text-gold-500 uppercase tracking-wide">
                Roommates
              </h3>

              {roommates.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-xs">
                  No other active roommates in this room.
                </div>
              ) : (
                <div className="space-y-4">
                  {roommates.map((mate) => (
                    <div key={mate.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-border/40">
                      <div className="h-10 w-10 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                        {mate.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{mate.name}</p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Since: {mate.joiningDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==================== VIEW: PAYMENTS ==================== */}
        {activeTab === 'payments' && (
          <section className="space-y-6 print:hidden">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="text-lg font-serif font-bold text-gold-500 uppercase tracking-wide">
                  Rent Invoices & Payment History
                </h3>
              </div>

              {myPayments.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  No payment invoices or receipts recorded.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border text-neutral-500 uppercase font-bold tracking-wider">
                        <th className="py-3.5 px-3">Billing Month</th>
                        <th className="py-3.5 px-3">Due Date</th>
                        <th className="py-3.5 px-3">Rent Amount</th>
                        <th className="py-3.5 px-3">Paid Date</th>
                        <th className="py-3.5 px-3">Status</th>
                        <th className="py-3.5 px-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {myPayments.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors">
                          <td className="py-3.5 px-3 font-semibold text-neutral-800 dark:text-neutral-200">{invoice.month}</td>
                          <td className="py-3.5 px-3">{invoice.dueDate}</td>
                          <td className="py-3.5 px-3 font-bold">INR {invoice.amount.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-3 text-neutral-500">{invoice.paidDate || 'N/A'}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              invoice.status === 'Paid' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : invoice.status === 'Overdue'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            {invoice.status === 'Paid' ? (
                              <button
                                onClick={() => setSelectedReceipt(invoice)}
                                className="inline-flex items-center gap-1 text-gold-500 hover:text-gold-600 font-bold hover:underline"
                              >
                                <Receipt className="h-4 w-4" />
                                View Receipt
                              </button>
                            ) : (
                              <span className="text-neutral-400 italic text-[10px]">Unpaid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==================== VIEW: MAINTENANCE ==================== */}
        {activeTab === 'maintenance' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
            {/* Create ticket form */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-serif font-bold border-b border-border pb-3 text-gold-500 uppercase tracking-wide">
                Raise Service Request
              </h3>

              {mSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-xs">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{mSuccess}</span>
                </div>
              )}

              {mError && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-xs">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{mError}</span>
                </div>
              )}

              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={mCategory}
                    onChange={(e) => setMCategory(e.target.value as any)}
                    className="block w-full px-3 py-2.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Wi-Fi">Wi-Fi Connection</option>
                    <option value="Cleaning">Cleaning / Housekeeping</option>
                    <option value="AC">Air Conditioning</option>
                    <option value="Other">Other Repairs</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Low', 'Medium', 'High'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setMUrgency(level as any)}
                        className={`py-2 text-xs font-bold border rounded-lg transition-all ${
                          mUrgency === level
                            ? 'bg-gold-500 text-white border-gold-500'
                            : 'border-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-950'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Describe the Problem
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about the issue (e.g. water tap leakage in washroom)..."
                    value={mDescription}
                    onChange={(e) => setMDescription(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Submit Request Ticket
                </button>
              </form>
            </div>

            {/* Request logs history */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2">
              <h3 className="text-lg font-serif font-bold border-b border-border pb-3 text-gold-500 uppercase tracking-wide">
                My Service History
              </h3>

              {myMaintenance.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  No maintenance tickets raised yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {myMaintenance.map((req) => (
                    <div key={req.id} className="border border-border/70 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                            {req.category} Issue
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            Ticket Ref: {req.id} &bull; Raised on {req.date}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            req.urgency === 'High' 
                              ? 'bg-red-500/10 text-red-500' 
                              : req.urgency === 'Medium'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-500'
                          }`}>
                            {req.urgency} Priority
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            req.status === 'Resolved'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : req.status === 'In Progress'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-900/30 p-2.5 rounded-lg border border-border/30">
                        {req.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      {/* ==================== SCREEN/MODAL: RENT RECEIPT VIEW ==================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:relative print:inset-0 print:z-0 print:p-0 print:bg-white animate-fade-in">
          
          {/* Printable Container Card */}
          <div className="w-full max-w-lg bg-white text-black border border-neutral-300 shadow-2xl p-6 sm:p-8 rounded-2xl relative print:border-none print:shadow-none print:p-0 print:rounded-none">
            
            {/* Close Button (Hidden in print) */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-all print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Receipt Content */}
            <div className="space-y-6">
              
              {/* Logo / PG Header info */}
              <div className="text-center border-b-2 border-dashed border-neutral-300 pb-4 space-y-1">
                <h2 className="text-2xl font-serif font-bold tracking-wider text-neutral-800 uppercase">
                  Royal Chambers
                </h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                  Noida Sector 62, Uttar Pradesh, India
                </p>
                <p className="text-[10px] text-neutral-400">
                  Contact: +91 99999-88888 &bull; Email: help@royalpg.com
                </p>
              </div>

              {/* Receipt Header details */}
              <div className="flex justify-between items-center text-xs text-neutral-600">
                <div>
                  <p>Receipt Number: <span className="font-semibold text-neutral-800">REC-{selectedReceipt.id.toUpperCase()}</span></p>
                  <p>Billing Month: <span className="font-semibold text-neutral-800">{selectedReceipt.month}</span></p>
                </div>
                <div className="text-right">
                  <p>Paid Date: <span className="font-semibold text-neutral-800">{selectedReceipt.paidDate}</span></p>
                  <p>Status: <span className="font-bold text-emerald-600">PAID &bull; SUCCESSFUL</span></p>
                </div>
              </div>

              {/* Tenant and Room Details */}
              <div className="bg-neutral-50 p-4 rounded-xl space-y-2 text-xs border border-neutral-200">
                <h4 className="font-bold text-neutral-800 border-b border-neutral-200 pb-1.5 uppercase tracking-wide">
                  Tenant Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-neutral-600">
                  <p>Resident Name: <span className="font-semibold text-neutral-800">{selectedReceipt.tenantName}</span></p>
                  <p>Room Assigned: <span className="font-semibold text-neutral-800">Room {selectedReceipt.roomNumber}</span></p>
                  <p>Resident ID: <span className="font-semibold text-neutral-800">{currentTenant.id}</span></p>
                  <p>Phone Number: <span className="font-semibold text-neutral-800">{currentTenant.phone}</span></p>
                </div>
              </div>

              {/* Bill Details */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-300 font-bold text-neutral-700">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2.5">Monthly Rent Charges (Room {selectedReceipt.roomNumber})</td>
                    <td className="py-2.5 text-right">INR {selectedReceipt.amount.toLocaleString('en-IN')}.00</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2.5">Amenities fee (High Speed Wi-Fi, AC, TV, Housekeeping)</td>
                    <td className="py-2.5 text-right">Included</td>
                  </tr>
                  <tr className="border-b-2 border-neutral-300 font-bold text-base text-neutral-800">
                    <td className="py-3">Grand Total Paid</td>
                    <td className="py-3 text-right">INR {selectedReceipt.amount.toLocaleString('en-IN')}.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Method / Audit stamp */}
              <div className="flex justify-between items-center text-xs text-neutral-500 pt-2 border-t border-dashed border-neutral-200">
                <div>
                  <p>Payment Method: <span className="font-semibold text-neutral-800">{selectedReceipt.paymentMethod || 'UPI'}</span></p>
                  <p className="text-[10px] text-neutral-400">Authenticated via Secure UPI Gateway</p>
                </div>
                <div className="text-center shrink-0 border border-neutral-300 p-2 rounded-lg font-serif italic text-neutral-600 bg-neutral-50 font-bold">
                  Royal PG Noida
                </div>
              </div>

              {/* Footer Terms */}
              <div className="text-center text-[10px] text-neutral-400 leading-relaxed">
                This is a computer-generated transaction document. No physical signature is required. <br />
                Thank you for being a valued resident of Royal PG.
              </div>

            </div>

            {/* Print/Download Button row (Hidden in print) */}
            <div className="flex gap-4 mt-6 pt-4 border-t border-neutral-200 print:hidden">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs py-3 rounded-xl transition-all font-bold"
              >
                Close View
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl shadow-lg text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="h-4 w-4" />
                Print / Save Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
