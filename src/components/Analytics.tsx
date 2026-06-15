import React from 'react';
import { Room, Tenant, Payment, Booking } from '../lib/mockData';
import { 
  Bed, Users, IndianRupee, Clock, ArrowUpRight, 
  TrendingUp, Home, CheckCircle2, AlertTriangle, CalendarRange
} from 'lucide-react';

interface AnalyticsProps {
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
  bookings: Booking[];
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ rooms, tenants, payments, bookings }) => {
  // 1. Calculations for the 7 Key Metrics
  
  // KPI 1: Total Rooms
  const totalRooms = rooms.length;
  
  // KPI 2: Occupied Rooms (rooms with at least one tenant checked in)
  const occupiedRooms = rooms.filter(r => r.occupied > 0).length;
  
  // KPI 3: Vacant Rooms (rooms with zero occupants)
  const vacantRooms = rooms.filter(r => r.occupied === 0).length;
  
  // KPI 4: Monthly Revenue (payments collected for the current billing cycle)
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const monthlyRevenue = payments
    .filter(p => p.month === currentMonth && p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);

  // KPI 5: Pending Rent Amount (rent invoices due/overdue for the current billing cycle)
  const pendingRent = payments
    .filter(p => p.month === currentMonth && (p.status === 'Pending' || p.status === 'Overdue'))
    .reduce((acc, p) => acc + p.amount, 0);

  // KPI 6: Active Tenants
  const activeTenantsCount = tenants.filter(t => t.status === 'Active').length;
  
  // KPI 7: Booking Requests (pending approval requests)
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;

  // Additional stats for visualizations
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupied, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  
  const allTimeCollected = payments
    .filter(p => p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const allTimePending = payments
    .filter(p => p.status === 'Pending' || p.status === 'Overdue')
    .reduce((acc, p) => acc + p.amount, 0);
    
  const collectionRate = (allTimeCollected + allTimePending) > 0 
    ? Math.round((allTimeCollected / (allTimeCollected + allTimePending)) * 100) 
    : 0;

  // Monthly trends
  const lastMonths = [
    { name: 'Feb', collected: 54000, pending: 0 },
    { name: 'Mar', collected: 62000, pending: 3000 },
    { name: 'Apr', collected: 71000, pending: 4500 },
    { name: 'May', collected: 84000, pending: 11500 },
    { name: 'Jun', collected: monthlyRevenue || 92000, pending: pendingRent || 15000 }
  ];

  const maxCollected = Math.max(...lastMonths.map(m => m.collected + m.pending), 100000);

  return (
    <div className="space-y-6">
      
      {/* 7 KPI Dashboard Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        
        {/* KPI 1: Total Rooms */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Total Rooms</span>
            <div className="h-7 w-7 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold">{totalRooms}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">Suites registered</p>
          </div>
        </div>

        {/* KPI 2: Occupied Rooms */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Occupied Rooms</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{occupiedRooms}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">{occupancyRate}% bed occupancy</p>
          </div>
        </div>

        {/* KPI 3: Vacant Rooms */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Vacant Rooms</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Bed className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-blue-500">{vacantRooms}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">{totalBeds - occupiedBeds} beds available</p>
          </div>
        </div>

        {/* KPI 4: Monthly Revenue */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Monthly Revenue</span>
            <div className="h-7 w-7 rounded-lg bg-gold-500/15 text-gold-500 flex items-center justify-center shrink-0">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-gold-500">₹{monthlyRevenue.toLocaleString('en-IN')}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">Paid this month</p>
          </div>
        </div>

        {/* KPI 5: Pending Rent */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Pending Rent</span>
            <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-red-500">₹{pendingRent.toLocaleString('en-IN')}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">Unpaid invoices</p>
          </div>
        </div>

        {/* KPI 6: Active Tenants */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Active Tenants</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-purple-500">{activeTenantsCount}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">Residents checked-in</p>
          </div>
        </div>

        {/* KPI 7: Booking Requests */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Bookings Pending</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <CalendarRange className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-500">{pendingBookingsCount}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">Require approval</p>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue collections trend bar chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Revenue Collections Trend</h3>
            <p className="text-[10px] text-muted-foreground mb-6">Compare monthly collections (Gold) vs pending dues (Red) in INR</p>
          </div>

          <div className="relative w-full h-[180px] flex items-end justify-between px-4">
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-border"></div>
            <div className="absolute inset-x-0 top-[25%] border-t border-dashed border-border/40"></div>
            <div className="absolute inset-x-0 top-[50%] border-t border-dashed border-border/40"></div>
            <div className="absolute inset-x-0 top-[75%] border-t border-dashed border-border/40"></div>

            {lastMonths.map((m, idx) => {
              const collectedHeightPercent = (m.collected / maxCollected) * 100;
              const pendingHeightPercent = (m.pending / maxCollected) * 100;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 w-12 sm:w-16 group z-10">
                  <div className="relative w-full h-[140px] flex flex-col justify-end gap-[2px]">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      Paid: ₹{m.collected.toLocaleString('en-IN')} <br />
                      Due: ₹{m.pending.toLocaleString('en-IN')}
                    </div>

                    {m.pending > 0 && (
                      <div 
                        className="w-full bg-red-400 dark:bg-red-950/40 rounded-t-sm"
                        style={{ height: `${pendingHeightPercent}%` }}
                      ></div>
                    )}
                    
                    <div 
                      className="w-full bg-gold-500 group-hover:bg-gold-600 rounded-t-sm transition-colors"
                      style={{ height: `${collectedHeightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Circle Collection Rate gauge */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Invoice Collection Rate</h3>
            <p className="text-[10px] text-muted-foreground mb-4">Percentage of invoices paid for overall billing</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                className="text-neutral-100 dark:text-neutral-800"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - collectionRate / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                className="text-gold-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{collectionRate}%</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Paid Invoices</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-muted-foreground font-semibold mt-2">
            ₹{allTimeCollected.toLocaleString('en-IN')} Collected / ₹{allTimePending.toLocaleString('en-IN')} Pending
          </div>
        </div>

      </div>

    </div>
  );
};
