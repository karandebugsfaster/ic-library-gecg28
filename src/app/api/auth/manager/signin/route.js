// src/app/api/auth/manager/signin/route.js

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Simple hardcoded manager credentials
    // In production, use environment variables and hashed passwords
    const MANAGER_USERNAME = process.env.MANAGER_USERNAME || 'manager';
    const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || 'manager123';

    if (username === MANAGER_USERNAME && password === MANAGER_PASSWORD) {
      return Response.json({
        success: true,
        message: 'Manager signed in successfully!',
        user: {
          id: 'manager',
          username: MANAGER_USERNAME,
          role: 'manager'
        }
      });
    } else {
      return Response.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Manager signin error:', error);
    return Response.json({
      success: false,
      error: 'Sign in failed'
    }, { status: 500 });
  }
}