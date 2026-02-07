// src/app/api/auth/student/send-otp/route.js - Nodemailer Implementation

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateOTP, storeOTP } from '@/lib/utils/otp';
import { sendOTPEmail } from '@/lib/utils/email';

export async function POST(request) {
  try {
    await connectDB();

    const { enrollmentNumber } = await request.json();

    if (!enrollmentNumber) {
      return Response.json({
        success: false,
        error: 'Enrollment number required'
      }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ 
      enrollmentNumber: enrollmentNumber.trim().toUpperCase() 
    });

    if (!user) {
      return Response.json({
        success: false,
        error: 'Account not found. Please sign up first.'
      }, { status: 404 });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in database (hashed)
    await storeOTP(enrollmentNumber.trim().toUpperCase(), otp);

    // Send email via Nodemailer
    try {
      await sendOTPEmail(user.email, otp, user.enrollmentNumber);

      // Mask email for response
      const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

      return Response.json({
        success: true,
        message: 'OTP sent to your email',
        email: maskedEmail
      });

    } catch (emailError) {
      console.error('❌ Email send error:', emailError);
      return Response.json({
        success: false,
        error: 'Failed to send OTP email. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return Response.json({
      success: false,
      error: 'Failed to send OTP'
    }, { status: 500 });
  }
}