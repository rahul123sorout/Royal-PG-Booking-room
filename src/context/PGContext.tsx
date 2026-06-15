'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Room, Tenant, Booking, Payment, AlertNotification, MaintenanceRequest
} from '../lib/mockData';

interface PGContextType {
  rooms: Room[];
  tenants: Tenant[];
  bookings: Booking[];
  payments: Payment[];
  alerts: AlertNotification[];
  maintenanceRequests: MaintenanceRequest[];
  
  // Room operations
  addRoom: (room: Omit<Room, 'id' | 'occupied' | 'status'>) => Promise<{ success: boolean; message: string }>;
  editRoom: (roomId: string, roomData: Partial<Room>) => Promise<{ success: boolean; message: string }>;
  deleteRoom: (roomId: string) => Promise<{ success: boolean; message: string }>;
  
  // Tenant operations
  addTenant: (tenant: Omit<Tenant, 'id' | 'status'>) => Promise<{ success: boolean; message: string }>;
  editTenant: (tenantId: string, tenantData: Partial<Tenant>) => Promise<{ success: boolean; message: string }>;
  deleteTenant: (tenantId: string) => Promise<{ success: boolean; message: string }>;
  checkOutTenant: (tenantId: string) => Promise<{ success: boolean; message: string }>;
  
  // Booking operations
  createBooking: (booking: Omit<Booking, 'id' | 'bookingDate' | 'status'>) => Promise<{ success: boolean; message: string }>;
  confirmBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  
  // Payment operations
  recordPayment: (paymentId: string, method: Payment['paymentMethod']) => Promise<{ success: boolean; message: string }>;
  generateMonthlyInvoices: (month: string) => Promise<{ success: boolean; message: string }>;
  
  // Alert operations
  markAlertAsRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  
  // Maintenance operations
  raiseMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'date' | 'status'>) => Promise<{ success: boolean; message: string }>;
  updateMaintenanceStatus: (requestId: string, status: MaintenanceRequest['status']) => Promise<{ success: boolean; message: string }>;
}

const PGContext = createContext<PGContextType | undefined>(undefined);

export const PGDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);

  // Master load data helper
  const reloadData = async () => {
    try {
      // 1. Rooms
      const resRooms = await fetch('/api/rooms');
      if (resRooms.ok) {
        const d = await resRooms.json();
        if (d.success) setRooms(d.rooms);
      }

      // 2. Tenants
      const resTenants = await fetch('/api/tenants');
      if (resTenants.ok) {
        const d = await resTenants.json();
        if (d.success) setTenants(d.tenants);
      }

      // 3. Bookings
      const resBookings = await fetch('/api/bookings');
      if (resBookings.ok) {
        const d = await resBookings.json();
        if (d.success) setBookings(d.bookings);
      }

      // 4. Payments
      const resPayments = await fetch('/api/payments');
      if (resPayments.ok) {
        const d = await resPayments.json();
        if (d.success) setPayments(d.payments);
      }

      // 5. Alerts
      const resAlerts = await fetch('/api/alerts');
      if (resAlerts.ok) {
        const d = await resAlerts.json();
        if (d.success) setAlerts(d.alerts);
      }

      // 6. Maintenance
      const resMaint = await fetch('/api/maintenance');
      if (resMaint.ok) {
        const d = await resMaint.json();
        if (d.success) setMaintenanceRequests(d.maintenance);
      }
    } catch (error) {
      console.error("Error loading database telemetry data:", error);
    }
  };

  // Initial Load
  useEffect(() => {
    reloadData();
  }, []);

  // --- ROOM CRUD ---

  const addRoom = async (roomData: Omit<Room, 'id' | 'occupied' | 'status'>) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to add room.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to add room.' };
    }
  };

  const editRoom = async (roomId: string, roomData: Partial<Room>) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roomId, ...roomData })
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to update room.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update room.' };
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms?id=${roomId}`, {
        method: 'DELETE'
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to remove room.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to delete room.' };
    }
  };

  // --- TENANT CRUD ---

  const addTenant = async (tenantData: Omit<Tenant, 'id' | 'status'>) => {
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData)
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to register tenant.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to add tenant.' };
    }
  };

  const editTenant = async (tenantId: string, tenantData: Partial<Tenant>) => {
    try {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tenantId, ...tenantData })
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to update tenant.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update tenant.' };
    }
  };

  const deleteTenant = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/tenants?id=${tenantId}`, {
        method: 'DELETE'
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to checkout tenant.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to checkout tenant.' };
    }
  };

  const checkOutTenant = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/tenants?id=${tenantId}&checkout=true`, {
        method: 'DELETE'
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Checkout failed.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Checkout failed.' };
    }
  };

  // --- BOOKING OPERATIONS ---

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'bookingDate' | 'status'>) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to book room.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to request booking.' };
    }
  };

  const confirmBooking = async (bookingId: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'Confirmed' })
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to confirm booking.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to confirm booking.' };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'Cancelled' })
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to cancel booking.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to cancel booking.' };
    }
  };

  // --- PAYMENT OPERATIONS ---

  const recordPayment = async (paymentId: string, method: Payment['paymentMethod']) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentId, paymentMethod: method })
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to record payment.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to record payment.' };
    }
  };

  const generateMonthlyInvoices = async (month: string) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to generate monthly invoices.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to generate invoices.' };
    }
  };

  // --- ALERTS OPERATIONS ---

  const markAlertAsRead = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId })
      });
      if (res.ok) {
        await reloadData();
      }
    } catch (err) {
      console.error("Failed to mark notification alert read:", err);
    }
  };

  const clearAllAlerts = async () => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'DELETE'
      });
      if (res.ok) {
        await reloadData();
      }
    } catch (err) {
      console.error("Failed to clear alerts:", err);
    }
  };

  // --- MAINTENANCE OPERATIONS ---

  const raiseMaintenanceRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'date' | 'status'>) => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to submit maintenance request.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to submit maintenance request.' };
    }
  };

  const updateMaintenanceStatus = async (requestId: string, status: MaintenanceRequest['status']) => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status })
      });
      const d = await res.json();
      if (d.success) {
        await reloadData();
        return { success: true, message: d.message };
      }
      return { success: false, message: d.message || 'Failed to update ticket status.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update status.' };
    }
  };

  return (
    <PGContext.Provider value={{
      rooms,
      tenants,
      bookings,
      payments,
      alerts,
      maintenanceRequests,
      addRoom,
      editRoom,
      deleteRoom,
      addTenant,
      editTenant,
      deleteTenant,
      checkOutTenant,
      createBooking,
      confirmBooking,
      cancelBooking,
      recordPayment,
      generateMonthlyInvoices,
      markAlertAsRead,
      clearAllAlerts,
      raiseMaintenanceRequest,
      updateMaintenanceStatus
    }}>
      {children}
    </PGContext.Provider>
  );
};

export const usePGData = () => {
  const context = useContext(PGContext);
  if (context === undefined) {
    throw new Error('usePGData must be used within a PGDataProvider');
  }
  return context;
};
