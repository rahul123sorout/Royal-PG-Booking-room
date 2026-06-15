import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { sendOtpEmail } from '../../../../lib/mailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email address is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 1. Verify user exists
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, message: 'No registered user found with this email address.' }, { status: 404 });
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Store OTP in database (fresh overwrite)
    await db.collection('otps').deleteOne({ email: email.toLowerCase() });
    await db.collection('otps').insertOne({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      isResetFlow: true
    });

    // 4. Send email
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return NextResponse.json({
        success: false,
        message: 'Failed to send OTP verification email. Please verify SMTP settings and connection.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset verification code sent! Check your inbox or terminal.'
    });

  } catch (err: any) {
    console.error("Forgot password endpoint error:", err);
    return NextResponse.json({ success: false, message: err.message || 'Internal server error.' }, { status: 500 });
  }
}
