// src/app/api/auth/student/signin/route.js - Fixed with await

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyOTP } from '@/lib/utils/otp';

export async function POST(request) {
  try {
    await connectDB();

    const { enrollmentNumber, otp } = await request.json();

    if (!enrollmentNumber || !otp) {
      return Response.json({
        success: false,
        error: 'Enrollment number and OTP required'
      }, { status: 400 });
    }

    const cleanEnrollment = enrollmentNumber.trim().toUpperCase();

    // ✅ FIX: Add await here
    const otpVerification = await verifyOTP(cleanEnrollment, otp);
    
    if (!otpVerification.valid) {
      return Response.json({
        success: false,
        error: otpVerification.error
      }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ enrollmentNumber: cleanEnrollment });

    if (!user) {
      return Response.json({
        success: false,
        error: 'Account not found'
      }, { status: 404 });
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
    console.error('❌ Student signin error:', error);
    return Response.json({
      success: false,
      error: 'Sign in failed'
    }, { status: 500 });
  }
}