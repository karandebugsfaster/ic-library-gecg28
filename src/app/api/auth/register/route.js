// src/app/api/auth/register/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, role, enrollmentNumber, phone, assignedFaculty, facultyAccessCode } = body;

    // Validation
    if (!name || !email || !password || !role) {
      return Response.json({
        success: false,
        error: 'Name, email, password, and role are required',
      }, { status: 400 });
    }

    // Role-specific validation
    if (role === 'student' && !enrollmentNumber) {
      return Response.json({
        success: false,
        error: 'Enrollment number is required for students',
      }, { status: 400 });
    }

    if (role === 'student' && !assignedFaculty) {
      return Response.json({
        success: false,
        error: 'Students must be assigned to a faculty',
      }, { status: 400 });
    }

    // Faculty access code verification
    if (role === 'faculty') {
      const FACULTY_ACCESS_CODE = process.env.FACULTY_ACCESS_CODE || 'FACULTY2024';
      
      if (facultyAccessCode !== FACULTY_ACCESS_CODE) {
        return Response.json({
          success: false,
          error: 'Invalid faculty access code',
        }, { status: 403 });
      }
    }

    // Prevent manager registration
    if (role === 'manager') {
      return Response.json({
        success: false,
        error: 'Manager registration is not allowed through this endpoint',
      }, { status: 403 });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json({
        success: false,
        error: 'Email already registered',
      }, { status: 400 });
    }

    // Check enrollment number for students
    if (role === 'student') {
      const existingEnrollment = await User.findOne({ enrollmentNumber });
      if (existingEnrollment) {
        return Response.json({
          success: false,
          error: 'Enrollment number already registered',
        }, { status: 400 });
      }
    }

    // Verify faculty exists if assigning student
    if (role === 'student' && assignedFaculty) {
      const faculty = await User.findOne({ 
        _id: assignedFaculty, 
        role: 'faculty',
        status: 'active' 
      });
      
      if (!faculty) {
        return Response.json({
          success: false,
          error: 'Invalid faculty assignment',
        }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: 'active',
    };

    if (role === 'student') {
      userData.enrollmentNumber = enrollmentNumber;
      userData.phone = phone;
      userData.assignedFaculty = assignedFaculty;
    }

    const user = await User.create(userData);

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return Response.json({
      success: true,
      message: 'Registration successful',
      user: userResponse,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return Response.json({
        success: false,
        error: 'Email or enrollment number already exists',
      }, { status: 400 });
    }

    return Response.json({
      success: false,
      error: error.message || 'Registration failed',
    }, { status: 500 });
  }
}