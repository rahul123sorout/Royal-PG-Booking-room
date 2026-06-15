import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const tenants = await db.collection('tenants').find({}).toArray();
    return NextResponse.json({ success: true, tenants });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantData = await request.json();
    const { db } = await connectToDatabase();

    // 1. Fetch the room to check capacity
    const room = await db.collection('rooms').findOne({ id: tenantData.roomId });
    if (!room) {
      return NextResponse.json({ success: false, message: 'Selected room not found.' }, { status: 404 });
    }

    if (room.occupied >= room.capacity) {
      return NextResponse.json({ success: false, message: `Room ${room.number} is already full.` }, { status: 400 });
    }

    const newTenant = {
      ...tenantData,
      id: 'tenant-' + Math.random().toString(36).substring(2, 9),
      status: 'Active'
    };

    // 2. Insert tenant
    await db.collection('tenants').insertOne(newTenant);

    // 3. Increment room occupancy
    const newOccupied = room.occupied + 1;
    const newStatus = newOccupied >= room.capacity ? 'Full' : 'Available';
    await db.collection('rooms').updateOne(
      { id: room.id },
      { $set: { occupied: newOccupied, status: newStatus } }
    );

    // 4. Create user credentials so they can log in
    // Default password 'password123' if they don't have one
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

    // 5. Auto-generate June 2026 rent invoice
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

    return NextResponse.json({
      success: true,
      message: `Tenant ${newTenant.name} registered and checked into Room ${newTenant.roomNumber}.`,
      tenant: newTenant
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Tenant ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 1. Fetch original tenant to see if room changed
    const originalTenant = await db.collection('tenants').findOne({ id: id });
    if (!originalTenant) {
      return NextResponse.json({ success: false, message: 'Tenant not found.' }, { status: 404 });
    }

    // If room changes
    if (updateData.roomId && updateData.roomId !== originalTenant.roomId) {
      const newRoom = await db.collection('rooms').findOne({ id: updateData.roomId });
      if (!newRoom) {
        return NextResponse.json({ success: false, message: 'New room not found.' }, { status: 404 });
      }

      if (newRoom.occupied >= newRoom.capacity) {
        return NextResponse.json({ success: false, message: `New room ${newRoom.number} is full.` }, { status: 400 });
      }

      // Decrement occupancy in old room
      const oldRoom = await db.collection('rooms').findOne({ id: originalTenant.roomId });
      if (oldRoom) {
        const oldOccupied = Math.max(0, oldRoom.occupied - 1);
        await db.collection('rooms').updateOne(
          { id: oldRoom.id },
          { $set: { occupied: oldOccupied, status: 'Available' } }
        );
      }

      // Increment occupancy in new room
      const newOccupied = newRoom.occupied + 1;
      const newStatus = newOccupied >= newRoom.capacity ? 'Full' : 'Available';
      await db.collection('rooms').updateOne(
        { id: newRoom.id },
        { $set: { occupied: newOccupied, status: newStatus } }
      );

      updateData.roomNumber = newRoom.number;
    }

    await db.collection('tenants').updateOne(
      { id: id },
      { $set: updateData }
    );

    // Also update phone/name in users list
    await db.collection('users').updateOne(
      { uid: id },
      { $set: { name: updateData.name, phone: updateData.phone, email: updateData.email } }
    );

    return NextResponse.json({ success: true, message: 'Tenant profile updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const checkout = searchParams.get('checkout'); // flag for checking out vs deleting completely

    if (!id) {
      return NextResponse.json({ success: false, message: 'Tenant ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const tenant = await db.collection('tenants').findOne({ id: id });
    if (!tenant) {
      return NextResponse.json({ success: false, message: 'Tenant not found.' }, { status: 404 });
    }

    // Decrement room occupancy
    const room = await db.collection('rooms').findOne({ id: tenant.roomId });
    if (room) {
      const newOccupied = Math.max(0, room.occupied - 1);
      await db.collection('rooms').updateOne(
        { id: room.id },
        { $set: { occupied: newOccupied, status: 'Available' } }
      );
    }

    if (checkout === 'true') {
      // Soft check out: mark as Left
      await db.collection('tenants').updateOne(
        { id: id },
        { $set: { status: 'Left' } }
      );

      // Create checkout alert
      const newAlert = {
        id: 'alert-' + Math.random().toString(36).substring(2, 9),
        title: 'Tenant Checked Out',
        message: `${tenant.name} has checked out of Room ${tenant.roomNumber}.`,
        date: new Date().toISOString().split('T')[0],
        type: 'vacancy',
        read: false
      };
      await db.collection('alerts').insertOne(newAlert);

      return NextResponse.json({ success: true, message: `Checked out ${tenant.name} from Room ${tenant.roomNumber}.` });
    } else {
      // Hard delete from database
      await db.collection('tenants').deleteOne({ id: id });
      await db.collection('users').deleteOne({ uid: id });
      return NextResponse.json({ success: true, message: 'Tenant checked out and database record removed.' });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
