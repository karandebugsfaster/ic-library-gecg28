// src/app/api/auth/verify-faculty-code/route.js

export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    const FACULTY_ACCESS_CODE = process.env.FACULTY_ACCESS_CODE || 'FACULTY2024';

    if (code === FACULTY_ACCESS_CODE) {
      return Response.json({
        success: true,
        message: 'Access code verified',
      });
    }

    return Response.json({
      success: false,
      error: 'Invalid access code',
    }, { status: 403 });

  } catch (error) {
    console.error('Faculty code verification error:', error);
    return Response.json({
      success: false,
      error: 'Verification failed',
    }, { status: 500 });
  }
}