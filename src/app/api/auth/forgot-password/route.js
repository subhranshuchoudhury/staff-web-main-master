// src/app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server';
import { changePassword } from '../../../../model/User.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, current password, and new password are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Attempt to change password
    const result = await changePassword(email, currentPassword, newPassword);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
