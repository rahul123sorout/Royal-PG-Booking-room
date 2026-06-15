import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const bookings = await db.collection('bookings').find({}).sort({ bookingDate: -1 }).toArray();
    return NextResponse.json({ success: true, bookings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();
    const { db } = await connectToDatabase();

    const newBooking = {
      ...bookingData,
      id: 'booking-' + Math.random().toString(36).substring(2, 9),
      bookingDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    await db.collection('bookings').insertOne(newBooking);

    // Create booking alert
    const newAlert = {
      id: 'alert-' + Math.random().toString(36).substring(2, 9),
      title: 'New Room Booking Request',
      message: `${newBooking.tenantName} requested booking in Room ${newBooking.roomNumber}.`,
      date: new Date().toISOString().split('T')[0],
      type: 'booking',
      read: false
    };
    await db.collection('alerts').insertOne(newAlert);

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted! We will contact you shortly.',
      booking: newBooking
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Booking ID and target status are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find the booking
    const booking = await db.collection('bookings').findOne({ id: id });
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
    }

    if (booking.status === 'Confirmed') {
      return NextResponse.json({ success: false, message: 'Booking is already confirmed.' }, { status: 400 });
    }

    if (status === 'Confirmed') {
      // Find associated room
      const room = await db.collection('rooms').findOne({ id: booking.roomId });
      if (!room) {
        return NextResponse.json({ success: false, message: 'Associated room no longer exists.' }, { status: 404 });
      }

      if (room.occupied >= room.capacity) {
        return NextResponse.json({ success: false, message: 'The room is full. Assign a different room to confirm.' }, { status: 400 });
      }

      // 1. Confirm booking status
      await db.collection('bookings').updateOne({ id: id }, { $set: { status: 'Confirmed' } });

      // 2. Create Tenant profile
      const newTenant = {
        id: 'tenant-' + Math.random().toString(36).substring(2, 9),
        name: booking.tenantName,
        email: booking.tenantEmail,
        phone: booking.tenantPhone,
        aadhaar: 'Not Provided',
        roomId: booking.roomId,
        roomNumber: booking.roomNumber,
        joiningDate: new Date().toISOString().split('T')[0],
        rentAmount: booking.price,
        status: 'Active',
        profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
      };
      await db.collection('tenants').insertOne(newTenant);

      // 3. Create Tenant user login account
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.collection('users').updateOne(
        { email: newTenant.email.toLowerCase() },
        {
          $setOnInsert: {
            uid: newTenant.id,
            name: newTenant.name,
            email: newTenant.email.toLowerCase(),
            phone: newTenant.phone,
            aadhaar: newTenant.aadhaar,
            password: hashedPassword,
            role: 'tenant',
            joinedDate: newTenant.joiningDate
          }
        },
        { upsert: true }
      );

      // 4. Increment room occupancy
      const newOccupied = room.occupied + 1;
      const newRoomStatus = newOccupied >= room.capacity ? 'Full' : 'Available';
      await db.collection('rooms').updateOne(
        { id: room.id },
        { $set: { occupied: newOccupied, status: newRoomStatus } }
      );

      // 5. Generate first invoice
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      const newPayment = {
        id: 'pay-' + Math.random().toString(36).substring(2, 9),
        tenantId: newTenant.id,
        tenantName: newTenant.name,
        roomNumber: newTenant.roomNumber,
        amount: newTenant.rentAmount,
        month: currentMonth,
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
        paidDate: null,
        status: 'Pending',
        paymentMethod: null
      };
      await db.collection('payments').insertOne(newPayment);

      // 6. Create booking approved alert
      const newAlert = {
        id: 'alert-' + Math.random().toString(36).substring(2, 9),
        title: 'Booking Approved',
        message: `Booking for ${booking.tenantName} confirmed in Room ${booking.roomNumber}.`,
        date: new Date().toISOString().split('T')[0],
        type: 'booking',
        read: false
      };
      await db.collection('alerts').insertOne(newAlert);

      return NextResponse.json({ success: true, message: 'Booking confirmed! Tenant has been successfully created.' });

    } else if (status === 'Cancelled') {
      await db.collection('bookings').updateOne({ id: id }, { $set: { status: 'Cancelled' } });
      return NextResponse.json({ success: true, message: 'Booking request cancelled.' });
    }

    return NextResponse.json({ success: false, message: 'Invalid status request.' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
