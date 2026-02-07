// src/app/api/auth/student/signin/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { enrollmentNumber } = await request.json();

    if (!enrollmentNumber) {
      return Response.json({ success: false, error: 'Enrollment number required' }, { status: 400 });
    }

    const user = await User.findOne({ enrollmentNumber: enrollmentNumber.trim().toUpperCase() });

    if (!user) {
      return Response.json({ success: false, error: 'Account not found. Please sign up first.' }, { status: 404 });
    }

    // Update last active
    user.lastActiveAt = new Date();
    await user.save();

    return Response.json({
      success: true,
      message: 'Signed in successfully!',
      user: {
        id: user._id,
        enrollmentNumber: user.enrollmentNumber,
        email: user.email,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Student signin error:', error);
    return Response.json({ success: false, error: 'Sign in failed' }, { status: 500 });
  }
}