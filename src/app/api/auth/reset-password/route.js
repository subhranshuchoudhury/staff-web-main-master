// src/app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { resetPassword, validateResetToken } from '../../../../model/User.js';

export async function POST(request) {
  try {
    const { token, password, confirmPassword } = await request.json();

    // Validate input
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Token, password, and confirm password are required' },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Reset password
    const result = await resetPassword(token, password);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET method to validate reset token
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const result = await validateResetToken(token);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Token is valid'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
