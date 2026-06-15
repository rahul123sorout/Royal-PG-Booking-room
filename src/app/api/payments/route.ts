import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const payments = await db.collection('payments').find({}).sort({ dueDate: -1, id: -1 }).toArray();
    return NextResponse.json({ success: true, payments });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Bulk generate monthly invoices
export async function POST(request: Request) {
  try {
    const { month } = await request.json();

    if (!month) {
      return NextResponse.json({ success: false, message: 'Month string is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if invoices for this month already exist
    const exists = await db.collection('payments').findOne({ month: month });
    if (exists) {
      return NextResponse.json({ success: false, message: `Invoices for ${month} have already been generated.` }, { status: 400 });
    }

    // Get active tenants
    const activeTenants = await db.collection('tenants').find({ status: 'Active' }).toArray();
    if (activeTenants.length === 0) {
      return NextResponse.json({ success: false, message: 'No active tenants found to bill.' }, { status: 400 });
    }

    const newInvoices = activeTenants.map(t => ({
      id: 'pay-' + Math.random().toString(36).substring(2, 9),
      tenantId: t.id,
      tenantName: t.name,
      roomNumber: t.roomNumber,
      amount: t.rentAmount,
      month: month,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
      paidDate: null,
      status: 'Pending',
      paymentMethod: null
    }));

    await db.collection('payments').insertMany(newInvoices);

    // Create bulk billing alert
    const newAlert = {
      id: 'alert-' + Math.random().toString(36).substring(2, 9),
      title: 'Monthly Invoices Generated',
      message: `Generated ${newInvoices.length} invoices for the month of ${month}.`,
      date: new Date().toISOString().split('T')[0],
      type: 'payment',
      read: false
    };
    await db.collection('alerts').insertOne(newAlert);

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${newInvoices.length} rent invoices for ${month}.`
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Record a payment
export async function PUT(request: Request) {
  try {
    const { id, paymentMethod } = await request.json();

    if (!id || !paymentMethod) {
      return NextResponse.json({ success: false, message: 'Invoice ID and payment method are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const payment = await db.collection('payments').findOne({ id: id });
    if (!payment) {
      return NextResponse.json({ success: false, message: 'Invoice not found.' }, { status: 404 });
    }

    if (payment.status === 'Paid') {
      return NextResponse.json({ success: false, message: 'Invoice is already paid.' }, { status: 400 });
    }

    const paidDate = new Date().toISOString().split('T')[0];

    await db.collection('payments').updateOne(
      { id: id },
      {
        $set: {
          status: 'Paid',
          paidDate,
          paymentMethod
        }
      }
    );

    // Create payment alert
    const newAlert = {
      id: 'alert-' + Math.random().toString(36).substring(2, 9),
      title: 'Rent Payment Collected',
      message: `INR ${payment.amount} collected from ${payment.tenantName} (Room ${payment.roomNumber}) via ${paymentMethod}.`,
      date: new Date().toISOString().split('T')[0],
      type: 'payment',
      read: false
    };
    await db.collection('alerts').insertOne(newAlert);

    return NextResponse.json({ success: true, message: 'Payment successfully recorded.', paidDate });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
