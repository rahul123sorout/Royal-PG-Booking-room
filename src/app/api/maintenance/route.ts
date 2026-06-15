import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const maintenance = await db.collection('maintenance').find({}).sort({ date: -1, id: -1 }).toArray();
    return NextResponse.json({ success: true, maintenance });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ticketData = await request.json();
    const { db } = await connectToDatabase();

    const newTicket = {
      ...ticketData,
      id: 'mreq-' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    await db.collection('maintenance').insertOne(newTicket);

    // Create system alert
    const newAlert = {
      id: 'alert-' + Math.random().toString(36).substring(2, 9),
      title: 'New Maintenance Request',
      message: `${newTicket.tenantName} (Room ${newTicket.roomNumber}) requested maintenance for ${newTicket.category}: "${newTicket.description.substring(0, 35)}..."`,
      date: new Date().toISOString().split('T')[0],
      type: 'vacancy', // operation category
      read: false
    };
    await db.collection('alerts').insertOne(newAlert);

    return NextResponse.json({
      success: true,
      message: 'Maintenance ticket created successfully!',
      ticket: newTicket
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Ticket ID and target status are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('maintenance').updateOne(
      { id: id },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Ticket status successfully set to ${status}.` });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
