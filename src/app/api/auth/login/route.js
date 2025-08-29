import { NextResponse } from 'next/server';
import { validateUser } from '@/model/User'; // Using alias instead of relative path

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate user credentials
    const result = await validateUser(email, password);

    if (result.success) {
      // Create response with cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: result.user
      });

      // Set cookie for middleware compatibility
      response.cookies.set('authToken', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 24 hours
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
