'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePGData } from '../../context/PGContext';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Bed, Users, IndianRupee, Bell, 
  Settings, Plus, Edit2, Trash2, Check, X, ShieldAlert,
  Download, FileText, Calendar, Wallet, UserCheck, ShieldCheck,
  CreditCard, Sparkles, RefreshCw, Wrench, MessageSquare, Printer, Send,
  Search
} from 'lucide-react';
import { AnalyticsDashboard } from '../../components/Analytics';
import { Payment } from '../../lib/mockData';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { 
    rooms, tenants, bookings, payments, alerts, maintenanceRequests,
    addRoom, editRoom, deleteRoom, addTenant, editTenant, deleteTenant, checkOutTenant,
    confirmBooking, cancelBooking, recordPayment, generateMonthlyInvoices, markAlertAsRead,
    raiseMaintenanceRequest, updateMaintenanceStatus
  } = usePGData();
  const router = useRouter();

  // Global search in admin dashboard overview
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [dashboardSearchResults, setDashboardSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!dashboardSearchQuery.trim()) {
      setDashboardSearchResults([]);
      return;
    }
    const query = dashboardSearchQuery.toLowerCase().trim();
    const results = tenants.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.phone.includes(query) ||
      t.roomNumber.includes(query)
    ).map(t => {
      // Calculate due amount
      const tenantPayments = payments.filter(p => p.tenantId === t.id);
      const dueAmount = tenantPayments
        .filter(p => p.status !== 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);

      // Determine paid/pending status for current month (or overall status)
      const hasUnpaid = tenantPayments.some(p => p.status !== 'Paid');
      const paidStatus = hasUnpaid ? 'Pending' : 'Paid';

      // Last payment date
      const paidPayments = tenantPayments
        .filter(p => p.status === 'Paid' && p.paidDate)
        .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime());
      const lastPaymentDate = paidPayments.length > 0 ? paidPayments[0].paidDate : 'N/A';

      return {
        ...t,
        dueAmount,
        paidStatus,
        lastPaymentDate
      };
    });
    setDashboardSearchResults(results);
  }, [dashboardSearchQuery, tenants, payments]);

  // Active Tab for Admin
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'tenants' | 'payments' | 'bookings' | 'analytics' | 'maintenance'>('overview');

  // Active Tab for Tenant
  const [tenantTab, setTenantTab] = useState<'overview' | 'maintenance'>('overview');

  // Modals & Forms State
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [roomForm, setRoomForm] = useState({ number: '', type: 'Single', price: 10000, capacity: 1, gender: 'Boys', amenities: [] as string[] });

  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [tenantForm, setTenantForm] = useState({ name: '', email: '', phone: '', aadhaar: '', roomId: '', rentAmount: 10000 });

  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'Cash'>('UPI');
  const [rentMonth, setRentMonth] = useState('June 2026');

  // New Feature States
  const [tenantDueFilter, setTenantDueFilter] = useState<'all' | 'with-dues'>('all');
  const [reminderPayment, setReminderPayment] = useState<Payment | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  const [maintenanceForm, setMaintenanceForm] = useState({
    category: 'Wi-Fi' as any,
    urgency: 'Medium' as any,
    description: ''
  });

  // Notifications/Toasts
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Search/Filters in Dashboard
  const [roomSearch, setRoomSearch] = useState('');
  const [tenantSearch, setTenantSearch] = useState('');

  // Redirect if guest
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const getTenantOutstanding = (tenantId: string) => {
    return payments
      .filter(p => p.tenantId === tenantId && p.status !== 'Paid')
      .reduce((acc, p) => acc + p.amount, 0);
  };

  // Export Reports to CSV
  const downloadReport = (type: 'payments' | 'tenants' | 'rooms') => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (type === 'payments') {
      csvContent += 'Invoice ID,Tenant Name,Room,Amount,Month,Due Date,Paid Date,Status,Method\n';
      payments.forEach(p => {
        csvContent += `"${p.id}","${p.tenantName}","${p.roomNumber}",${p.amount},"${p.month}","${p.dueDate}","${p.paidDate || ''}","${p.status}","${p.paymentMethod || ''}"\n`;
      });
    } else if (type === 'tenants') {
      csvContent += 'Tenant ID,Name,Email,Phone,Aadhaar,Room,Rent Amount,Status\n';
      tenants.forEach(t => {
        csvContent += `"${t.id}","${t.name}","${t.email}","${t.phone}","${t.aadhaar}","${t.roomNumber}",${t.rentAmount},"${t.status}"\n`;
      });
    } else {
      csvContent += 'Room ID,Room Number,Type,Price,Capacity,Occupied,Gender,Status\n';
      rooms.forEach(r => {
        csvContent += `"${r.id}","${r.number}","${r.type}",${r.price},${r.capacity},${r.occupied},"${r.gender}","${r.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `royal_pg_${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `${type.toUpperCase()} report CSV downloaded successfully.`);
  };

  // --- ACTIONS ---
  
  // Room
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      const res = await editRoom(editingRoom.id, {
        number: roomForm.number,
        type: roomForm.type as any,
        price: Number(roomForm.price),
        capacity: Number(roomForm.capacity),
        gender: roomForm.gender as any,
        amenities: roomForm.amenities
      });
      if (res.success) {
        showToast('success', res.message);
        setRoomModalOpen(false);
        setEditingRoom(null);
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = await addRoom({
        number: roomForm.number,
        type: roomForm.type as any,
        price: Number(roomForm.price),
        capacity: Number(roomForm.capacity),
        gender: roomForm.gender as any,
        amenities: roomForm.amenities,
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80']
      });
      if (res.success) {
        showToast('success', res.message);
        setRoomModalOpen(false);
      } else {
        showToast('error', res.message);
      }
    }
  };

  const handleEditRoomClick = (room: any) => {
    setEditingRoom(room);
    setRoomForm({
      number: room.number,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      gender: room.gender,
      amenities: room.amenities
    });
    setRoomModalOpen(true);
  };

  const handleDeleteRoomClick = async (id: string) => {
    if (confirm('Are you sure you want to remove this room?')) {
      const res = await deleteRoom(id);
      if (res.success) showToast('success', res.message);
      else showToast('error', res.message);
    }
  };

  // Tenant
  const handleTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoom = rooms.find(r => r.id === tenantForm.roomId);
    if (!selectedRoom) {
      showToast('error', 'Please select a valid room.');
      return;
    }

    if (editingTenant) {
      const res = await editTenant(editingTenant.id, {
        name: tenantForm.name,
        email: tenantForm.email,
        phone: tenantForm.phone,
        aadhaar: tenantForm.aadhaar,
        roomId: tenantForm.roomId,
        roomNumber: selectedRoom.number,
        rentAmount: Number(tenantForm.rentAmount)
      });
      if (res.success) {
        showToast('success', res.message);
        setTenantModalOpen(false);
        setEditingTenant(null);
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = await addTenant({
        name: tenantForm.name,
        email: tenantForm.email,
        phone: tenantForm.phone,
        aadhaar: tenantForm.aadhaar,
        roomId: tenantForm.roomId,
        roomNumber: selectedRoom.number,
        joiningDate: new Date().toISOString().split('T')[0],
        rentAmount: Number(tenantForm.rentAmount),
        profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
      });
      if (res.success) {
        showToast('success', res.message);
        setTenantModalOpen(false);
      } else {
        showToast('error', res.message);
      }
    }
  };

  const handleEditTenantClick = (tenant: any) => {
    setEditingTenant(tenant);
    setTenantForm({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      aadhaar: tenant.aadhaar,
      roomId: tenant.roomId,
      rentAmount: tenant.rentAmount
    });
    setTenantModalOpen(true);
  };

  const handleCheckoutClick = async (id: string) => {
    if (confirm('Are you sure you want to checkout this tenant? Their status will be set to Left.')) {
      const res = await checkOutTenant(id);
      if (res.success) showToast('success', res.message);
      else showToast('error', res.message);
    }
  };

  // Booking
  const handleApproveBooking = async (id: string) => {
    const res = await confirmBooking(id);
    if (res.success) showToast('success', res.message);
    else showToast('error', res.message);
  };

  const handleCancelBooking = async (id: string) => {
    if (confirm('Cancel this booking request?')) {
      const res = await cancelBooking(id);
      if (res.success) showToast('success', res.message);
      else showToast('error', res.message);
    }
  };

  // Payment Collect
  const handleCollectPaymentClick = (payment: any) => {
    setPaymentGatewayOpen(payment);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await recordPayment(paymentGatewayOpen.id, paymentMethod);
    if (res.success) {
      showToast('success', res.message);
      setPaymentGatewayOpen(null);
    } else {
      showToast('error', res.message);
    }
  };

  const handleGenerateInvoices = async () => {
    const res = await generateMonthlyInvoices(rentMonth);
    if (res.success) showToast('success', res.message);
    else showToast('error', res.message);
  };

  // Check if tenant has roommates
  const getRoommates = (roomId: string, tenantId: string) => {
    return tenants.filter(t => t.roomId === roomId && t.id !== tenantId && t.status === 'Active');
  };

  // Reminder trigger modal open
  const openReminderModal = (pay: Payment) => {
    setReminderPayment(pay);
    setReminderMessage(
      `Dear ${pay.tenantName}, this is a friendly reminder from Royal PG Noida. Your rent of ₹${pay.amount} for the month of ${pay.month} is pending for Suite ${pay.roomNumber}. Please complete payment at your earliest convenience. Thank you!`
    );
  };

  // WhatsApp reminder launcher
  const sendWhatsAppReminder = () => {
    if (!reminderPayment) return;
    const tenantObj = tenants.find(t => t.id === reminderPayment.tenantId);
    const phone = tenantObj ? tenantObj.phone : '';
    let cleanPhone = phone.trim().replace(/\+/g, '').replace(/-/g, '').replace(/\s/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderMessage)}`, '_blank');
    showToast('success', 'Dispatched message block to WhatsApp API!');
    setReminderPayment(null);
  };

  // SMS reminder launcher (Real sms: URI fallback)
  const sendSMSReminder = () => {
    if (!reminderPayment) return;
    const tenantObj = tenants.find(t => t.id === reminderPayment.tenantId);
    const phone = tenantObj ? tenantObj.phone : '';
    let cleanPhone = phone.trim().replace(/\+/g, '').replace(/-/g, '').replace(/\s/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`;
    }
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(reminderMessage)}`;
    showToast('success', `SMS app launched with pre-filled reminder to ${reminderPayment.tenantName}!`);
    setReminderPayment(null);
  };

  // Maintenance submit
  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const tenantRecord = tenants.find(t => t.email.toLowerCase() === user.email.toLowerCase());
    if (!tenantRecord) {
      showToast('error', 'Only assigned residents can raise tickets.');
      return;
    }

    const res = await raiseMaintenanceRequest({
      tenantId: tenantRecord.id,
      tenantName: tenantRecord.name,
      roomNumber: tenantRecord.roomNumber,
      category: maintenanceForm.category,
      urgency: maintenanceForm.urgency,
      description: maintenanceForm.description
    });

    if (res.success) {
      showToast('success', res.message);
      setMaintenanceForm({ category: 'Wi-Fi', urgency: 'Medium', description: '' });
    } else {
      showToast('error', res.message);
    }
  };

  // Admin update maintenance status
  const handleUpdateTicketStatus = async (ticketId: string, status: 'In Progress' | 'Resolved') => {
    const res = await updateMaintenanceStatus(ticketId, status);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background py-24">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 text-gold-500 animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Accessing Royal Console...
          </p>
        </div>
      </div>
    );
  }

  // Filter tenants by due amount
  const filteredTenants = tenants
    .filter(t => t.name.toLowerCase().includes(tenantSearch.toLowerCase()))
    .filter(t => {
      if (tenantDueFilter === 'with-dues') {
        return getTenantOutstanding(t.id) > 0;
      }
      return true;
    });

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 ${
          toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-red-500 text-white border-red-600'
        }`}>
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Admin Panel vs Tenant Panel */}
      {user.role === 'admin' ? (
        
        // ==================== ADMIN CONSOLE ====================
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border/80">
                <div className="h-9 w-9 rounded-full bg-gold-500 flex items-center justify-center font-bold text-white uppercase text-sm">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground leading-tight">{user.name}</h3>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-gold-500">Royal Administrator</span>
                </div>
              </div>

              {/* Sidebar Menu items */}
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: 'overview', label: 'Admin Overview', icon: LayoutDashboard },
                  { id: 'rooms', label: 'Room Registry', icon: Bed },
                  { id: 'tenants', label: 'Tenants Database', icon: Users },
                  { id: 'payments', label: 'Rent Ledger', icon: IndianRupee },
                  { id: 'bookings', label: 'Booking Requests', icon: Calendar },
                  { id: 'maintenance', label: 'Maintenance Tickets', icon: Wrench },
                  { id: 'analytics', label: 'Visual Analytics', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2.5 ${
                        activeTab === tab.id 
                          ? 'bg-gold-500/10 text-gold-500 border-l-4 border-gold-500' 
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Quick Actions Panel */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Exports</h4>
              <button 
                onClick={() => downloadReport('payments')}
                className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-gold-500 transition-colors py-1.5 border-b border-border/40"
              >
                <span>Download Revenue CSV</span>
                <Download className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => downloadReport('tenants')}
                className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-gold-500 transition-colors py-1.5 border-b border-border/40"
              >
                <span>Download Tenant CSV</span>
                <Download className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => downloadReport('rooms')}
                className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-gold-500 transition-colors py-1.5"
              >
                <span>Download Room CSV</span>
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Workspace Panel */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* ==================== TAB: OVERVIEW ==================== */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Royal Operations Center</h2>
                    <p className="text-xs text-muted-foreground">Live operations feeds and telemetry stats for Noida PG sectors.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRoomForm({ number: '', type: 'Single', price: 12000, capacity: 1, gender: 'Boys', amenities: ['AC', 'Wi-Fi'] });
                        setRoomModalOpen(true);
                      }}
                      className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" /> Add Room
                    </button>
                    <button
                      onClick={() => {
                        setTenantForm({ name: '', email: '', phone: '', aadhaar: '', roomId: '', rentAmount: 10000 });
                        setTenantModalOpen(true);
                      }}
                      className="border border-gold-500/30 text-gold-500 hover:bg-gold-500/5 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" /> Check-in Tenant
                    </button>
                  </div>
                </div>

                {/* Global Search Bar */}
                <div className="relative w-full bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-gold-500 shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Resident Search Console</h3>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search residents by Name, Mobile Number, or Room Number..."
                      value={dashboardSearchQuery}
                      onChange={(e) => setDashboardSearchQuery(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-gold-500 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-550 transition-all font-semibold"
                    />
                    {dashboardSearchQuery && (
                      <button 
                        onClick={() => setDashboardSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {dashboardSearchQuery && (
                    <div className="mt-4 border-t border-border/60 pt-4 animate-in fade-in slide-in-from-top-2 duration-155">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Matches found ({dashboardSearchResults.length})
                      </h4>
                      {dashboardSearchResults.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted-foreground italic">
                          No matching resident found in Sector 62, 126, or 135.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dashboardSearchResults.map((res) => (
                            <div 
                              key={res.id}
                              className="p-4 border border-border rounded-xl bg-neutral-50 dark:bg-neutral-900/30 flex flex-col justify-between space-y-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-150 shrink-0 border border-gold-500/20">
                                  <img src={res.profilePhoto} alt={res.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-bold text-foreground">{res.name}</h4>
                                  <p className="text-[10px] text-muted-foreground">{res.phone} &bull; {res.email}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/40 text-[10px]">
                                <div>
                                  <span className="text-muted-foreground block uppercase font-bold tracking-wider">Room Suite</span>
                                  <span className="font-semibold text-gold-500">Suite {res.roomNumber}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block uppercase font-bold tracking-wider">Joining Date</span>
                                  <span className="font-semibold text-foreground">{res.joiningDate}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block uppercase font-bold tracking-wider">Monthly Rent</span>
                                  <span className="font-semibold text-foreground">₹{res.rentAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block uppercase font-bold tracking-wider">Last Payment</span>
                                  <span className="font-semibold text-foreground">{res.lastPaymentDate}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block uppercase font-bold tracking-wider">Current Month Status</span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                                    res.paidStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                  }`}>
                                    {res.paidStatus}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block uppercase font-bold tracking-wider">Total Outstanding</span>
                                  <span className={`font-bold ${res.dueAmount > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                    ₹{res.dueAmount.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline Analytics widgets (Contains the 7 KPIs) */}
                <AnalyticsDashboard rooms={rooms} tenants={tenants} payments={payments} bookings={bookings} />

                {/* Live Booking and Payment alerts split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notifications feed */}
                  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider">Operation Alerts</h3>
                      <Bell className="h-4 w-4 text-gold-500" />
                    </div>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {alerts.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">No alerts logged</div>
                      ) : (
                        alerts.slice(0, 6).map((alert) => (
                          <div key={alert.id} className="p-3 border border-border/60 bg-neutral-50 dark:bg-neutral-900/30 rounded-xl flex gap-2.5 items-start">
                            <ShieldAlert className="h-4.5 w-4.5 text-gold-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="text-[11px] font-bold text-foreground">{alert.title}</h4>
                              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{alert.message}</p>
                              <span className="text-[9px] text-neutral-400 mt-1 block">{alert.date}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pending Bookings Feed */}
                  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Urgent Booking Requests</h3>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {bookings.filter(b => b.status === 'Pending').length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">All booking requests approved!</div>
                      ) : (
                        bookings.filter(b => b.status === 'Pending').map((booking) => (
                          <div key={booking.id} className="p-3 border border-border/60 rounded-xl flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/30">
                            <div>
                              <h4 className="text-[11px] font-bold">{booking.tenantName}</h4>
                              <p className="text-[10px] text-muted-foreground">Room {booking.roomNumber} ({booking.roomType})</p>
                              <span className="text-[9px] font-semibold text-gold-500 block mt-1">₹{booking.price.toLocaleString('en-IN')}/mo</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleApproveBooking(booking.id)}
                                className="h-7 w-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-sm"
                                title="Approve Booking"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm"
                                title="Reject Booking"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: ROOMS ==================== */}
            {activeTab === 'rooms' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-border/80 pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Room Registry</h2>
                    <p className="text-xs text-muted-foreground">Manage and filter PG suites and check inventories.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Filter by Room No..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-1.5 text-xs w-48 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-border/80 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <th className="px-5 py-3.5">Room</th>
                          <th className="px-5 py-3.5">Category</th>
                          <th className="px-5 py-3.5">Price</th>
                          <th className="px-5 py-3.5">Occupancy</th>
                          <th className="px-5 py-3.5">Gender wing</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.filter(r => r.number.includes(roomSearch)).map((room) => (
                          <tr key={room.id} className="border-b border-border/40 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 text-xs">
                            <td className="px-5 py-3.5 font-bold">{room.number}</td>
                            <td className="px-5 py-3.5">{room.type}</td>
                            <td className="px-5 py-3.5">₹{room.price.toLocaleString('en-IN')}</td>
                            <td className="px-5 py-3.5">{room.occupied}/{room.capacity} beds</td>
                            <td className="px-5 py-3.5">{room.gender}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {room.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right flex justify-end gap-1.5">
                              <button
                                onClick={() => handleEditRoomClick(room)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-gold-500 hover:border-gold-500/40 transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoomClick(room.id)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/40 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: TENANTS ==================== */}
            {activeTab === 'tenants' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-border/80 pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Tenants Database</h2>
                    <p className="text-xs text-muted-foreground">Register new tenants or edit existing resident files.</p>
                  </div>
                  
                  {/* Spacing & alignment for filters and search */}
                  <div className="flex gap-2">
                    <select
                      value={tenantDueFilter}
                      onChange={(e: any) => setTenantDueFilter(e.target.value)}
                      className="bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-gold-500 font-bold"
                    >
                      <option value="all">All Tenants</option>
                      <option value="with-dues">Outstanding Balance Only</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      className="bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-1.5 text-xs w-48 focus:outline-none focus:border-gold-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-border/80 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <th className="px-5 py-3.5">Resident</th>
                          <th className="px-5 py-3.5">Contact Details</th>
                          <th className="px-5 py-3.5">Aadhaar UID</th>
                          <th className="px-5 py-3.5">Room</th>
                          <th className="px-5 py-3.5">Rent Fee</th>
                          <th className="px-5 py-3.5">Pending Dues</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTenants.map((tenant) => {
                          const outstanding = getTenantOutstanding(tenant.id);
                          return (
                            <tr key={tenant.id} className="border-b border-border/40 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 text-xs">
                              <td className="px-5 py-3.5 font-bold flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                                  <img src={tenant.profilePhoto} alt={tenant.name} className="w-full h-full object-cover" />
                                </div>
                                <span>{tenant.name}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div>{tenant.phone}</div>
                                <div className="text-[10px] text-muted-foreground">{tenant.email}</div>
                              </td>
                              <td className="px-5 py-3.5 font-mono text-[10px]">{tenant.aadhaar}</td>
                              <td className="px-5 py-3.5 font-semibold text-gold-500">Room {tenant.roomNumber}</td>
                              <td className="px-5 py-3.5">₹{tenant.rentAmount.toLocaleString('en-IN')}</td>
                              <td className="px-5 py-3.5 font-bold text-red-500">
                                {outstanding > 0 ? `₹${outstanding.toLocaleString('en-IN')}` : '₹0'}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  tenant.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                                }`}>
                                  {tenant.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                {tenant.status === 'Active' ? (
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => handleEditTenantClick(tenant)}
                                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-gold-500 hover:border-gold-500/40 transition-colors"
                                      title="Edit Profile"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleCheckoutClick(tenant.id)}
                                      className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/5 hover:border-red-500/40 transition-colors"
                                      title="Check Out Tenant"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic">Left Premise</span>
                                )}
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

            {/* ==================== TAB: PAYMENTS ==================== */}
            {activeTab === 'payments' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold">Rent Ledger</h2>
                    <p className="text-xs text-muted-foreground">Audit invoices, record rent payments, and check due alerts.</p>
                  </div>
                  
                  {/* Bulk invoicing triggers */}
                  <div className="flex gap-2 items-center bg-card p-2 rounded-xl border border-border">
                    <input
                      type="text"
                      placeholder="e.g. July 2026"
                      value={rentMonth}
                      onChange={(e) => setRentMonth(e.target.value)}
                      className="bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg px-2.5 py-1 text-xs w-28 focus:outline-none"
                    />
                    <button
                      onClick={handleGenerateInvoices}
                      className="bg-gold-500 hover:bg-gold-600 text-white px-3 py-1 rounded-lg text-xs font-semibold"
                    >
                      Bill All Tenants
                    </button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-border/80 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <th className="px-5 py-3.5">Invoice ID</th>
                          <th className="px-5 py-3.5">Resident</th>
                          <th className="px-5 py-3.5">Room</th>
                          <th className="px-5 py-3.5">Month</th>
                          <th className="px-5 py-3.5">Amount</th>
                          <th className="px-5 py-3.5">Due Date</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Collect / Remind</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((pay) => (
                          <tr key={pay.id} className="border-b border-border/40 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 text-xs">
                            <td className="px-5 py-3.5 font-mono text-[10px] text-muted-foreground">#{pay.id.substring(0,8)}</td>
                            <td className="px-5 py-3.5 font-semibold">{pay.tenantName}</td>
                            <td className="px-5 py-3.5">Room {pay.roomNumber}</td>
                            <td className="px-5 py-3.5">{pay.month}</td>
                            <td className="px-5 py-3.5 font-bold">₹{pay.amount.toLocaleString('en-IN')}</td>
                            <td className="px-5 py-3.5">{pay.dueDate}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                pay.status === 'Paid' 
                                  ? 'bg-emerald-500/10 text-emerald-600' 
                                  : pay.status === 'Pending' 
                                  ? 'bg-amber-500/10 text-amber-600' 
                                  : 'bg-red-500/10 text-red-500'
                              }`}>
                                {pay.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {pay.status !== 'Paid' ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => openReminderModal(pay)}
                                    className="p-1 rounded bg-gold-500/10 text-gold-500 hover:bg-gold-500 hover:text-white transition-colors"
                                    title="Send Rent Reminder"
                                  >
                                    <Bell className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleCollectPaymentClick(pay)}
                                    className="bg-gold-500 hover:bg-gold-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                  >
                                    Collect
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-semibold flex items-center justify-end gap-1">
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  {pay.paymentMethod}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: BOOKINGS ==================== */}
            {activeTab === 'bookings' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-border/80 pb-4">
                  <h2 className="text-xl font-serif font-bold">Booking Portal Requests</h2>
                  <p className="text-xs text-muted-foreground">Confirm incoming roommate bookings and register tenancy contracts.</p>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-border/80 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <th className="px-5 py-3.5">Booking Date</th>
                          <th className="px-5 py-3.5">Candidate Name</th>
                          <th className="px-5 py-3.5">Phone / Email</th>
                          <th className="px-5 py-3.5">Room Chosen</th>
                          <th className="px-5 py-3.5">Proposed Price</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-border/40 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 text-xs">
                            <td className="px-5 py-3.5">{booking.bookingDate}</td>
                            <td className="px-5 py-3.5 font-bold">{booking.tenantName}</td>
                            <td className="px-5 py-3.5">
                              <div>{booking.tenantPhone}</div>
                              <div className="text-[10px] text-muted-foreground">{booking.tenantEmail}</div>
                            </td>
                            <td className="px-5 py-3.5">Room {booking.roomNumber} ({booking.roomType})</td>
                            <td className="px-5 py-3.5 font-bold">₹{booking.price.toLocaleString('en-IN')}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                booking.status === 'Confirmed' 
                                  ? 'bg-emerald-500/10 text-emerald-600' 
                                  : booking.status === 'Pending' 
                                  ? 'bg-amber-500/10 text-amber-600' 
                                  : 'bg-red-500/10 text-red-500'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {booking.status === 'Pending' ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleApproveBooking(booking.id)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-lg shadow-sm"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg shadow-sm"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic font-semibold capitalize">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: MAINTENANCE (ADMIN RESOLVER) ==================== */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-border/80 pb-4">
                  <h2 className="text-xl font-serif font-bold">Maintenance Resolution Hub</h2>
                  <p className="text-xs text-muted-foreground">Monitor and update structural and amenities tickets raised by residents.</p>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-border/80 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <th className="px-5 py-3.5">Date Raised</th>
                          <th className="px-5 py-3.5">Resident / Room</th>
                          <th className="px-5 py-3.5">Category</th>
                          <th className="px-5 py-3.5">Description</th>
                          <th className="px-5 py-3.5">Urgency</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Resolve Operations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceRequests.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-xs text-muted-foreground">No maintenance tickets logged in system.</td>
                          </tr>
                        ) : (
                          maintenanceRequests.map((req) => (
                            <tr key={req.id} className="border-b border-border/40 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 text-xs">
                              <td className="px-5 py-3.5">{req.date}</td>
                              <td className="px-5 py-3.5">
                                <div className="font-bold">{req.tenantName}</div>
                                <div className="text-[10px] text-muted-foreground">Suite {req.roomNumber}</div>
                              </td>
                              <td className="px-5 py-3.5 font-semibold text-gold-500">{req.category}</td>
                              <td className="px-5 py-3.5 max-w-xs truncate" title={req.description}>{req.description}</td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  req.urgency === 'High' 
                                    ? 'bg-red-500/10 text-red-500' 
                                    : req.urgency === 'Medium' 
                                    ? 'bg-amber-500/10 text-amber-600' 
                                    : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {req.urgency}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  req.status === 'Resolved' 
                                    ? 'bg-emerald-500/10 text-emerald-600' 
                                    : req.status === 'In Progress' 
                                    ? 'bg-blue-500/10 text-blue-600' 
                                    : 'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                {req.status !== 'Resolved' ? (
                                  <div className="flex justify-end gap-1.5">
                                    {req.status === 'Pending' && (
                                      <button
                                        onClick={() => handleUpdateTicketStatus(req.id, 'In Progress')}
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded"
                                      >
                                        In Progress
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleUpdateTicketStatus(req.id, 'Resolved')}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-0.5"
                                    >
                                      <Check className="h-3 w-3" /> Resolve
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic font-semibold">Resolved</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: ANALYTICS ==================== */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border/80 pb-4">
                  <h2 className="text-xl font-serif font-bold">Visual Analytics</h2>
                  <p className="text-xs text-muted-foreground">Historical charts on collections, occupancy levels, and tenant cohorts.</p>
                </div>
                <AnalyticsDashboard rooms={rooms} tenants={tenants} payments={payments} bookings={bookings} />
              </div>
            )}

          </div>

        </div>

      ) : (
        
        // ==================== RESIDENT PORTAL ====================
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Greeting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-6">
            <div>
              <div className="text-xs text-gold-500 uppercase tracking-widest font-bold mb-1">Royal PG Resident Console</div>
              <h1 className="text-2xl font-serif font-bold">Welcome Back, {user.name}</h1>
              <p className="text-xs text-muted-foreground">Manage your stay details, roommates directory, and payments online.</p>
            </div>
            
            {/* Tab toggling in resident dashboard */}
            <div className="flex gap-2">
              <button
                onClick={() => setTenantTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  tenantTab === 'overview' 
                    ? 'bg-gold-500 text-white shadow-md' 
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Resident Overview
              </button>
              <button
                onClick={() => setTenantTab('maintenance')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                  tenantTab === 'maintenance' 
                    ? 'bg-gold-500 text-white shadow-md' 
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Wrench className="h-4 w-4" /> Raise Maintenance
              </button>
            </div>
          </div>

          {/* Core Info panels */}
          {(() => {
            const tenantRecord = tenants.find(t => t.email.toLowerCase() === user.email.toLowerCase() || t.phone === user.phone);
            
            if (!tenantRecord) {
              return (
                <div className="bg-card rounded-2xl border border-border p-8 text-center max-w-md mx-auto space-y-3 shadow-md my-8">
                  <ShieldAlert className="h-10 w-10 text-gold-500 mx-auto animate-bounce" />
                  <h3 className="font-bold text-foreground">Room Assignment Pending</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your profile is registered, but the administrator has not checked you into an active room suite yet. Once your check-in is compiled, your rent invoices, receipts, and roommate registry will show up here.
                  </p>
                </div>
              );
            }

            const roomRecord = rooms.find(r => r.id === tenantRecord.roomId);
            const roommates = getRoommates(tenantRecord.roomId, tenantRecord.id);
            const pendingTenantPayments = payments.filter(p => p.tenantId === tenantRecord.id && p.status !== 'Paid');
            const paidTenantPayments = payments.filter(p => p.tenantId === tenantRecord.id && p.status === 'Paid');
            const tenantTickets = maintenanceRequests.filter(r => r.tenantId === tenantRecord.id);

            return (
              <>
                {/* SUBTAB: OVERVIEW */}
                {tenantTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                    
                    {/* Left panel: Room and roommate directory */}
                    <div className="lg:col-span-5 space-y-6">
                      {/* Room details */}
                      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border/80 pb-3 flex items-center gap-1.5">
                          <Bed className="h-4.5 w-4.5 text-gold-500" /> Chamber Specifications
                        </h3>
                        
                        {roomRecord && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Room Number</div>
                              <div className="text-lg font-bold text-gold-500">Suite {roomRecord.number}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Chamber Type</div>
                              <div className="text-sm font-semibold">{roomRecord.type}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Monthly Rent</div>
                              <div className="text-sm font-semibold">₹{tenantRecord.rentAmount.toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Joining Date</div>
                              <div className="text-sm font-semibold">{tenantRecord.joiningDate}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Roommates Directory */}
                      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border/80 pb-3 flex items-center gap-1.5">
                          <Users className="h-4.5 w-4.5 text-gold-500" /> Roommates Directory
                        </h3>
                        
                        {roommates.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2 italic text-center">Currently no roommates in this chamber.</p>
                        ) : (
                          <div className="space-y-3.5">
                            {roommates.map((mate) => (
                              <div key={mate.id} className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                                  <img src={mate.profilePhoto} alt={mate.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold">{mate.name}</h4>
                                  <p className="text-[10px] text-muted-foreground">{mate.phone} / {mate.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right panel: Bills and payments */}
                    <div className="lg:col-span-7 space-y-6">
                      {/* Current Dues */}
                      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border/80 pb-3 flex items-center gap-1.5">
                          <Wallet className="h-4.5 w-4.5 text-gold-500" /> Current Outstanding Invoices
                        </h3>
                        
                        {pendingTenantPayments.length === 0 ? (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-center text-xs flex items-center justify-center gap-1.5">
                            <Check className="h-4 w-4" /> All rent invoices paid! Keep it up.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {pendingTenantPayments.map((pay) => (
                              <div 
                                key={pay.id} 
                                className="p-4 border border-border bg-neutral-50 dark:bg-neutral-900/30 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                              >
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                                    <Wallet className="h-3.5 w-3.5" /> rent overdue pending
                                  </div>
                                  <h4 className="text-sm font-bold">{pay.month} rent invoice</h4>
                                  <p className="text-xs text-muted-foreground">Due on: {pay.dueDate}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-base font-extrabold text-foreground">₹{pay.amount.toLocaleString('en-IN')}</span>
                                  <button
                                    onClick={() => handleCollectPaymentClick(pay)}
                                    className="bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all"
                                  >
                                    Pay Now
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Payment History & PDF Receipts */}
                      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border/80 pb-3 flex items-center gap-1.5">
                          <Printer className="h-4.5 w-4.5 text-gold-500" /> Payment Receipts History
                        </h3>
                        
                        {paidTenantPayments.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2 italic text-center">No payment history available.</p>
                        ) : (
                          <div className="space-y-3">
                            {paidTenantPayments.map((pay) => (
                              <div key={pay.id} className="flex justify-between items-center text-xs py-2 border-b border-border/40">
                                <div>
                                  <h4 className="font-semibold">{pay.month} Rent Invoice</h4>
                                  <p className="text-[10px] text-muted-foreground">Paid on: {pay.paidDate} via {pay.paymentMethod}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400">₹{pay.amount.toLocaleString('en-IN')}</div>
                                    <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">Paid</span>
                                  </div>
                                  <button
                                    onClick={() => setReceiptPayment(pay)}
                                    className="p-2 border border-border/80 hover:border-gold-500 hover:text-gold-500 rounded-lg text-muted-foreground transition-all flex items-center justify-center"
                                    title="Print Receipt"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUBTAB: MAINTENANCE PORTAL */}
                {tenantTab === 'maintenance' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                    
                    {/* Left side: Raise ticket form */}
                    <div className="lg:col-span-5">
                      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border/80 pb-3 flex items-center gap-1.5">
                          <Plus className="h-4.5 w-4.5 text-gold-500" /> Raise Maintenance Request
                        </h3>
                        <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Issue Category *</label>
                            <select
                              value={maintenanceForm.category}
                              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, category: e.target.value as any })}
                              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                            >
                              <option value="Plumbing">Plumbing (Washroom, Tap leaks)</option>
                              <option value="Electrical">Electrical (Lights, Socket, Fan)</option>
                              <option value="Wi-Fi">Wi-Fi & Internet Connectivity</option>
                              <option value="Cleaning">Cleaning / Housekeeping</option>
                              <option value="AC">Air Conditioning (AC Service/Repair)</option>
                              <option value="Other">Other Concerns</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Urgency wing *</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Low', 'Medium', 'High'].map((urg) => (
                                <button
                                  key={urg}
                                  type="button"
                                  onClick={() => setMaintenanceForm({ ...maintenanceForm, urgency: urg as any })}
                                  className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                                    maintenanceForm.urgency === urg
                                      ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                                      : 'border-border/60 text-muted-foreground hover:bg-neutral-50'
                                  }`}
                                >
                                  {urg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Detailed Description *</label>
                            <textarea
                              required
                              rows={4}
                              placeholder="Please specify issue details, room location, and times you are available for resolution..."
                              value={maintenanceForm.description}
                              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder:text-neutral-400"
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-semibold py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                          >
                            <span>Submit Request Ticket</span>
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Right side: Past requests history */}
                    <div className="lg:col-span-7">
                      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border/80 pb-3 flex items-center gap-1.5">
                          <MessageSquare className="h-4.5 w-4.5 text-gold-500" /> Maintenance Logs & Status
                        </h3>

                        {tenantTickets.length === 0 ? (
                          <div className="text-center py-12 text-xs text-muted-foreground">No maintenance tickets logged.</div>
                        ) : (
                          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                            {tenantTickets.map((ticket) => (
                              <div key={ticket.id} className="p-4 border border-border rounded-xl space-y-2 bg-neutral-50/50 dark:bg-neutral-900/10">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-gold-500">{ticket.category} Ticket</span>
                                  <span className="text-[10px] text-muted-foreground">{ticket.date}</span>
                                </div>
                                <p className="text-xs leading-relaxed text-muted-foreground">{ticket.description}</p>
                                <div className="flex justify-between items-center pt-1 border-t border-border/40 text-[10px]">
                                  <span className="font-semibold text-muted-foreground">Urgency: {ticket.urgency}</span>
                                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                                    ticket.status === 'Resolved' 
                                      ? 'bg-emerald-500/10 text-emerald-600' 
                                      : ticket.status === 'In Progress' 
                                      ? 'bg-blue-500/10 text-blue-600' 
                                      : 'bg-amber-500/10 text-amber-600'
                                  }`}>
                                    {ticket.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ==================== MODAL: ADD/EDIT ROOM ==================== */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setRoomModalOpen(false); setEditingRoom(null); }}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-serif font-bold text-foreground mb-6">
              {editingRoom ? `Edit Room ${editingRoom.number}` : 'Add New Room Suite'}
            </h2>
            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 104"
                  value={roomForm.number}
                  onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-gold-500 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Category *</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                  >
                    <option value="Single">Single Room</option>
                    <option value="Double Share">Double Sharing</option>
                    <option value="Triple Share">Triple Sharing</option>
                    <option value="Four Share">Four Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Wing Section *</label>
                  <select
                    value={roomForm.gender}
                    onChange={(e) => setRoomForm({ ...roomForm, gender: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                  >
                    <option value="Boys">Boys Only</option>
                    <option value="Girls">Girls Only</option>
                    <option value="Coliving">Co-Living</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Monthly Rent *</label>
                  <input
                    type="number"
                    required
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({ ...roomForm, price: Number(e.target.value) })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Bed Capacity *</label>
                  <input
                    type="number"
                    required
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/80 mt-6">
                <button
                  type="button"
                  onClick={() => { setRoomModalOpen(false); setEditingRoom(null); }}
                  className="flex-1 border border-border text-xs py-2.5 rounded-xl hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-medium py-2.5 rounded-xl shadow-md text-xs"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD/EDIT TENANT ==================== */}
      {tenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setTenantModalOpen(false); setEditingTenant(null); }}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-serif font-bold text-foreground mb-6">
              {editingTenant ? 'Edit Tenant Profile' : 'Check-in New Resident'}
            </h2>
            <form onSubmit={handleTenantSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Patel"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile"
                    value={tenantForm.phone}
                    onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Aadhaar Card Number *</label>
                <input
                  type="text"
                  required
                  placeholder="12-digit Aadhaar ID"
                  value={tenantForm.aadhaar}
                  onChange={(e) => setTenantForm({ ...tenantForm, aadhaar: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Assign Room *</label>
                  <select
                    value={tenantForm.roomId}
                    required
                    onChange={(e) => {
                      const selected = rooms.find(r => r.id === e.target.value);
                      setTenantForm({ ...tenantForm, roomId: e.target.value, rentAmount: selected ? selected.price : 10000 });
                    }}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                  >
                    <option value="">Select Room</option>
                    {rooms.filter(r => r.occupied < r.capacity || (editingTenant && r.id === editingTenant.roomId)).map(r => (
                      <option key={r.id} value={r.id}>Room {r.number} ({r.type} - ₹{r.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Assigned Rent *</label>
                  <input
                    type="number"
                    required
                    value={tenantForm.rentAmount}
                    onChange={(e) => setTenantForm({ ...tenantForm, rentAmount: Number(e.target.value) })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/80 mt-6">
                <button
                  type="button"
                  onClick={() => { setTenantModalOpen(false); setEditingTenant(null); }}
                  className="flex-1 border border-border text-xs py-2.5 rounded-xl hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-medium py-2.5 rounded-xl shadow-md text-xs"
                >
                  {editingTenant ? 'Save Changes' : 'Check-in Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: MOCK PAYMENT GATEWAY ==================== */}
      {paymentGatewayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setPaymentGatewayOpen(null)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6">
              <CreditCard className="h-10 w-10 text-gold-500 mx-auto mb-2" />
              <h2 className="text-base font-serif font-bold text-foreground">Royal Chambers Payment Gateway</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Secure Transaction for Noida Branch</p>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-border/80 mb-5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resident Name</span>
                <span className="font-bold">{paymentGatewayOpen.tenantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rent Suite</span>
                <span className="font-semibold">Room {paymentGatewayOpen.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Period</span>
                <span className="font-semibold">{paymentGatewayOpen.month}</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2 text-sm">
                <span className="font-bold">Total Amount Due</span>
                <span className="font-bold text-gold-500">₹{paymentGatewayOpen.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['UPI', 'Card', 'Net Banking', 'Cash'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m as any)}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                        paymentMethod === m 
                          ? 'border-gold-500 bg-gold-500/10 text-gold-500' 
                          : 'border-border/60 text-muted-foreground hover:bg-neutral-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 active:scale-98"
              >
                <span>Process Payment</span>
                <Sparkles className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: SEND PAYMENT REMINDER ==================== */}
      {reminderPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setReminderPayment(null)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-500">Rent Payment Reminder</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Send alert to {reminderPayment.tenantName} (Room {reminderPayment.roomNumber})</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Reminder Message Draft</label>
                <textarea
                  rows={4}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none text-foreground leading-relaxed"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendSMSReminder}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-foreground text-xs font-semibold py-2.5 rounded-xl transition-all"
                >
                  Simulate SMS
                </button>
                <button
                  onClick={sendWhatsAppReminder}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  Send WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: PRINTABLE RECEIPT VIEW ==================== */}
      {receiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Embedded styles for print routing */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #receipt-print-area, #receipt-print-area * {
                  visibility: visible;
                }
                #receipt-print-area {
                  position: fixed;
                  left: 0;
                  top: 0;
                  width: 100%;
                  height: 100%;
                  background: white !important;
                  color: black !important;
                  padding: 40px !important;
                  z-index: 99999;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <button 
              onClick={() => setReceiptPayment(null)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground no-print"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Printable Area */}
            <div id="receipt-print-area" className="space-y-6 p-4">
              <div className="flex justify-between items-start border-b border-border/80 pb-4">
                <div>
                  <h1 className="text-xl font-serif font-bold text-gold-500 tracking-wider">ROYAL Chambers PG</h1>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    Sector 62, Noida, Gautam Buddha Nagar<br />
                    Uttar Pradesh, India - 201301<br />
                    booking@royalpg.com | +91 99999 11111
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full">
                    Official Receipt
                  </span>
                  <div className="text-[10px] text-muted-foreground mt-2 font-mono">Invoice ID: #{receiptPayment.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-0.5">Billed To</span>
                  <div className="font-bold text-foreground">{receiptPayment.tenantName}</div>
                  <div className="text-muted-foreground">Suite Number: {receiptPayment.roomNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-0.5">Billing Period</span>
                  <div className="font-semibold text-foreground">{receiptPayment.month} Rent</div>
                  <div className="text-muted-foreground">Paid Date: {receiptPayment.paidDate}</div>
                </div>
              </div>

              <div className="border border-border/80 rounded-xl overflow-hidden mt-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-border/80 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2">Item Description</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold">Co-Living Luxury Stay (Noida sector branch)</div>
                        <div className="text-[9px] text-muted-foreground">Monthly room rental invoice including utilities & standard meals wing.</div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">₹{receiptPayment.amount.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-neutral-50/50 dark:bg-neutral-900/10">
                      <td className="px-4 py-2.5 font-bold text-right">Total Paid Amount</td>
                      <td className="px-4 py-2.5 text-right font-extrabold text-gold-500">₹{receiptPayment.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border/60 text-[10px] text-muted-foreground">
                <div className="space-y-1">
                  <div>Payment Method: <span className="font-bold text-foreground">{receiptPayment.paymentMethod}</span></div>
                  <div>Certified Status: <span className="font-bold text-emerald-600">TRANSACTION SUCCESSFUL</span></div>
                </div>
                <div className="text-right italic">
                  Thank you for staying at Royal PG!
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex gap-3 mt-6 border-t border-border/80 pt-4 no-print">
              <button
                onClick={() => setReceiptPayment(null)}
                className="flex-1 border border-border text-xs py-2.5 rounded-xl hover:bg-neutral-50 transition-all font-semibold"
              >
                Close View
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
