import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const alerts = await db.collection('alerts').find({}).sort({ date: -1, id: -1 }).toArray();
    return NextResponse.json({ success: true, alerts });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Alert ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    await db.collection('alerts').updateOne(
      { id: id },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true, message: 'Alert marked as read.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { db } = await connectToDatabase();
    await db.collection('alerts').deleteMany({});
    return NextResponse.json({ success: true, message: 'All alerts cleared.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
