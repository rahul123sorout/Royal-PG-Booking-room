import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { signToken } from '../../../../lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, message: 'Email and verification code are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 1. Fetch OTP record
    const record = await db.collection('otps').findOne({ email: email.toLowerCase() });

    if (!record) {
      return NextResponse.json({ success: false, message: 'No active verification session found. Please request OTP again.' }, { status: 400 });
    }

    // 2. Validate OTP code
    if (record.otp !== code) {
      return NextResponse.json({ success: false, message: 'Invalid verification code.' }, { status: 400 });
    }

    // 3. Check expiration
    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ success: false, message: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // 4. Create User (if signup flow)
    const { pendingData } = record;
    if (!pendingData) {
      return NextResponse.json({ success: false, message: 'No registration details found.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(pendingData.password, 10);
    const uid = 'user-' + Math.random().toString(36).substring(2, 9);
    
    const newUser = {
      uid,
      name: pendingData.name,
      email: pendingData.email,
      phone: pendingData.phone,
      aadhaar: pendingData.aadhaar,
      password: hashedPassword,
      role: pendingData.role,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    await db.collection('users').insertOne(newUser);

    // If they registered as a tenant, also make sure we record them or hook them in tenants collection if needed
    // (though checking into rooms requires bookings or direct check-in, which seeds them in tenants)

    // 5. Generate JWT token
    const token = signToken({ uid, role: newUser.role, email: newUser.email });

    // 6. Delete the OTP document
    await db.collection('otps').deleteOne({ email: email.toLowerCase() });

    // 7. Create Response and set secure HTTP-only cookie
    const responseBody = {
      success: true,
      message: 'OTP verified successfully! Account created and logged in.',
      user: {
        uid: newUser.uid,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        joinedDate: newUser.joinedDate
      }
    };

    const response = NextResponse.json(responseBody);
    
    // Set cookie
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
    console.error("Verify OTP endpoint error:", err);
    return NextResponse.json({ success: false, message: err.message || 'Internal server error.' }, { status: 500 });
  }
}
