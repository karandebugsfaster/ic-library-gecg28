// src/app/api/auth/student/signup/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { validateEnrollmentNumber, validateCollegeEmail, validatePhoneNumber } from '@/lib/utils/validators';

export async function POST(request) {
  try {
    await connectDB();

    const { enrollmentNumber, email, phone, agreedToTerms } = await request.json();

    // Validate
    const enrollmentValidation = validateEnrollmentNumber(enrollmentNumber);
    if (!enrollmentValidation.valid) {
      return Response.json({ success: false, error: enrollmentValidation.error }, { status: 400 });
    }

    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.valid) {
      return Response.json({ success: false, error: emailValidation.error }, { status: 400 });
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return Response.json({ success: false, error: phoneValidation.error }, { status: 400 });
    }

    if (!agreedToTerms) {
      return Response.json({ success: false, error: 'Must agree to terms' }, { status: 400 });
    }

    // Check if exists
    const exists = await User.findOne({ enrollmentNumber: enrollmentValidation.cleaned });
    if (exists) {
      return Response.json({ success: false, error: 'Account already exists' }, { status: 400 });
    }

    // Create user
    const user = await User.create({
      enrollmentNumber: enrollmentValidation.cleaned,
      email: emailValidation.normalized,
      phone: phoneValidation.cleaned,
      agreedToTerms: true,
      termsAgreedAt: new Date()
    });

    return Response.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: user._id,
        enrollmentNumber: user.enrollmentNumber,
        email: user.email,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Student signup error:', error);
    return Response.json({ success: false, error: 'Signup failed' }, { status: 500 });
  }
}