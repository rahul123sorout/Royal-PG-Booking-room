import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const rooms = await db.collection('rooms').find({}).toArray();
    return NextResponse.json({ success: true, rooms });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const roomData = await request.json();
    const { db } = await connectToDatabase();

    // Check duplicate number
    const duplicate = await db.collection('rooms').findOne({ number: roomData.number });
    if (duplicate) {
      return NextResponse.json({ success: false, message: `Room number ${roomData.number} already exists.` }, { status: 400 });
    }

    const newRoom = {
      ...roomData,
      id: 'room-' + Math.random().toString(36).substring(2, 9),
      occupied: 0,
      status: 'Available'
    };

    await db.collection('rooms').insertOne(newRoom);

    // Trigger vacancy alert
    const newAlert = {
      id: 'alert-' + Math.random().toString(36).substring(2, 9),
      title: 'New Room Added',
      message: `Room ${newRoom.number} (${newRoom.type}) has been added to inventory.`,
      date: new Date().toISOString().split('T')[0],
      type: 'vacancy',
      read: false
    };
    await db.collection('alerts').insertOne(newAlert);

    return NextResponse.json({ success: true, message: `Room ${newRoom.number} added successfully!`, room: newRoom });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Room ID is required for updating.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Adjust status dynamically based on occupancy vs capacity
    if (updateData.occupied !== undefined && updateData.capacity !== undefined) {
      updateData.status = updateData.occupied >= updateData.capacity ? 'Full' : 'Available';
    }

    const result = await db.collection('rooms').updateOne(
      { id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Room not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Room updated successfully!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Room ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const room = await db.collection('rooms').findOne({ id: id });
    if (!room) {
      return NextResponse.json({ success: false, message: 'Room not found.' }, { status: 404 });
    }

    if (room.occupied > 0) {
      return NextResponse.json({ success: false, message: 'Cannot delete a room with active tenants.' }, { status: 400 });
    }

    await db.collection('rooms').deleteOne({ id: id });
    return NextResponse.json({ success: true, message: 'Room removed successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
