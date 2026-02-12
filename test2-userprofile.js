// src/app/api/auth/student/signup/route.js - WITH EMAIL VALIDATION

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { enrollmentNumber, email, phone } = await request.json();

    // Validate inputs
    if (!enrollmentNumber || !email || !phone) {
      return Response.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Clean and validate enrollment number
    const cleanEnrollment = enrollmentNumber.trim().toUpperCase();
    
    // Validate IC department (must start with 17)
    // if (!cleanEnrollment.startsWith('17')) {
    //   return Response.json({
    //     success: false,
    //     error: 'No baccha, This is not for everyone...'
    //   }, { status: 400 });
    // }

    // Validate enrollment number format (10 digits)
    // if (!/^\d{10}$/.test(cleanEnrollment)) {
    //   return Response.json({
    //     success: false,
    //     error: 'Invalid enrollment number format. Must be 10 digits.'
    //   }, { status: 400 });
    // }

    // Clean email
    const cleanEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return Response.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Clean phone
    const cleanPhone = phone.trim().replace(/\D/g, ''); // Remove non-digits

    // Validate phone number (10 digits)
    if (cleanPhone.length !== 10) {
      return Response.json({
        success: false,
        error: 'Phone number must be 10 digits'
      }, { status: 400 });
    }

    console.log('📝 Attempting signup:', { enrollmentNumber: cleanEnrollment, email: cleanEmail });

    // ✅ CHECK 1: Email already exists
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      console.log('❌ Email already in use:', cleanEmail);
      return Response.json({
        success: false,
        error: 'This email is already registered. Please use a different email or sign in.'
      }, { status: 409 }); // 409 Conflict
    }

    // ✅ CHECK 2: Enrollment number already exists
    const existingEnrollment = await User.findOne({ enrollmentNumber: cleanEnrollment });
    if (existingEnrollment) {
      console.log('❌ Enrollment number already exists:', cleanEnrollment);
      
      // Check if it's the same user trying to register again
      if (existingEnrollment.email === cleanEmail) {
        return Response.json({
          success: false,
          error: 'You are already registered. Please sign in instead.'
        }, { status: 409 });
      } else {
        return Response.json({
          success: false,
          error: 'This enrollment number is already registered with a different email.'
        }, { status: 409 });
      }
    }

    // ✅ CHECK 3: Phone number already exists (optional warning)
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      console.log('⚠️ Phone number already in use:', cleanPhone);
      // You can choose to block this or just warn
      // For now, we'll allow it but you can uncomment below to block:
      /*
      return Response.json({
        success: false,
        error: 'This phone number is already registered.'
      }, { status: 409 });
      */
    }

    // Create new user
    const newUser = await User.create({
      enrollmentNumber: cleanEnrollment,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'student',
      activeRentals: 0,
      totalRentals: 0,
      createdAt: new Date()
    });

    console.log('✅ User created successfully:', newUser.enrollmentNumber);

    return Response.json({
      success: true,
      message: 'Account created successfully! Please sign in with your enrollment number.',
      user: {
        enrollmentNumber: newUser.enrollmentNumber,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldNames = {
        email: 'Email',
        enrollmentNumber: 'Enrollment number',
        phone: 'Phone number'
      };
      
      return Response.json({
        success: false,
        error: `${fieldNames[field] || 'This'} is already registered.`
      }, { status: 409 });
    }

    return Response.json({
      success: false,
      error: 'Failed to create account. Please try again.'
    }, { status: 500 });
  }
}