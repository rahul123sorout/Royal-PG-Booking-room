import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ success: false, message: 'All inputs (email, code, and new password) are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 1. Fetch OTP record
    const record = await db.collection('otps').findOne({ email: email.toLowerCase() });

    if (!record || !record.isResetFlow) {
      return NextResponse.json({ success: false, message: 'No active password reset session found.' }, { status: 400 });
    }

    // 2. Validate OTP
    if (record.otp !== code) {
      return NextResponse.json({ success: false, message: 'Invalid verification code.' }, { status: 400 });
    }

    // 3. Check expiration
    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ success: false, message: 'Verification code has expired. Please try again.' }, { status: 400 });
    }

    // 4. Hash new password and update user record
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updateResult = await db.collection('users').updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Failed to find registered user to update.' }, { status: 400 });
    }

    // 5. Clean up OTP document
    await db.collection('otps').deleteOne({ email: email.toLowerCase() });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.'
    });

  } catch (err: any) {
    console.error("Reset password endpoint error:", err);
    return NextResponse.json({ success: false, message: err.message || 'Internal server error.' }, { status: 500 });
  }
}
