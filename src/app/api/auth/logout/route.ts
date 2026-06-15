import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully!'
    });

    // Clear cookie by setting expiration to the past
    response.cookies.set({
      name: 'royal_pg_token',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    });

    return response;
  } catch (err: any) {
    console.error("Logout endpoint error:", err);
    return NextResponse.json({ success: false, message: 'Logout failed.' }, { status: 500 });
  }
}
