// src/app/api/auth/student/send-otp/route.js

import { Resend } from 'resend';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateOTP, storeOTP } from '@/lib/utils/otp';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    storeOTP(enrollmentNumber.trim().toUpperCase(), otp);

    // Send email via Resend
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: user.email,
        subject: 'IC Library - Your Sign In OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">IC Library Sign In</h2>
            <p>Hello ${user.enrollmentNumber},</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="margin: 0; color: #667eea; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p style="color: #666;">This OTP will expire in <strong>5 minutes</strong>.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">IC Department Library Management System</p>
          </div>
        `
      });

      console.log(`✅ OTP sent to ${user.email}: ${otp}`); // Remove in production

      return Response.json({
        success: true,
        message: 'OTP sent to your email',
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Masked email
      });

    } catch (emailError) {
      console.error('Email send error:', emailError);
      return Response.json({
        success: false,
        error: 'Failed to send OTP email. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    return Response.json({
      success: false,
      error: 'Failed to send OTP'
    }, { status: 500 });
  }
}