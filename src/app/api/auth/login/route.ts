import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { signToken } from '../../../../lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'Email/Mobile and Password are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const cleanIdentifier = identifier.trim();

    // 1. Search by email or phone
    const user = await db.collection('users').findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { phone: cleanIdentifier }
      ]
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials or no registered account found.' }, { status: 400 });
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 400 });
    }

    // 3. Generate JWT
    const token = signToken({ uid: user.uid, role: user.role, email: user.email });

    // 4. Return user profile and set cookie
    const responseBody = {
      success: true,
      message: 'Logged in successfully!',
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        aadhaar: user.aadhaar,
        joinedDate: user.joinedDate
      }
    };

    const response = NextResponse.json(responseBody);
    
    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'royal_pg_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (err: any) {
    console.error("Login endpoint error:", err);
    return NextResponse.json({ success: false, message: err.message || 'Internal server error.' }, { status: 500 });
  }
}
