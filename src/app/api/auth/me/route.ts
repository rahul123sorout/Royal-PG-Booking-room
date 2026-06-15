import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '../../../../lib/db';
import { verifyToken } from '../../../../lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('royal_pg_token');

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const decoded = verifyToken(tokenCookie.value);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ uid: decoded.uid });

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        aadhaar: user.aadhaar,
        joinedDate: user.joinedDate
      }
    });

  } catch (err: any) {
    console.error("Auth status status endpoint error:", err);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
