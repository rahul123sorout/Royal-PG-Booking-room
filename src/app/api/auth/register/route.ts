import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { sendOtpEmail } from '../../../../lib/mailer';

export async function POST(request: Request) {
  try {
    const { name, email, phone, aadhaar, password, role } = await request.json();

    if (!name || !email || !phone || !aadhaar || !password) {
      return NextResponse.json({ success: false, message: 'All registration fields are required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 1. Check if user already exists
    const existingUser = await db.collection('users').findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: phone }
      ]
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: 'A user with this email or mobile number already exists.' }, { status: 400 });
    }

    // 2. Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Store OTP and pending registration data (fresh overwrite)
    await db.collection('otps').deleteOne({ email: email.toLowerCase() });
    await db.collection('otps').insertOne({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      pendingData: {
        name,
        email: email.toLowerCase(),
        phone,
        aadhaar,
        password, // Store plain password temporarily; we will hash it upon OTP verification
        role: role || 'tenant'
      }
    });

    // 4. Send the OTP
    await sendOtpEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: `Verification OTP has been sent to ${email}. Please check your inbox or terminal.`
    });

  } catch (err: any) {
    console.error("Registration endpoint error:", err);
    return NextResponse.json({ success: false, message: err.message || 'Internal server error.' }, { status: 500 });
  }
}
