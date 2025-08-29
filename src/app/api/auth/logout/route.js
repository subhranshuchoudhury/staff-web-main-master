// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';



    // Also try to delete the cookie (additional cleanup)
    response.cookies.delete('authToken');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, still try to clear the cookie
    const response = NextResponse.json({
      success: false,
      error: 'Logout failed, but session cleared'
    }, { status: 500 });

    // Clear cookie even on error
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}

// Also support GET method for logout links
export async function GET(request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookies.delete('authToken');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Logout failed'
    }, { status: 500 });
  }
}
