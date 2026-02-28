// src/app/api/auth/login/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return Response.json({
        success: false,
        error: 'Email, password, and role are required',
      }, { status: 400 });
    }

    // Find user by email and role
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role,
    });

    if (!user) {
      return Response.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return Response.json({
        success: false,
        error: 'Your account has been deactivated. Please contact administration.',
      }, { status: 403 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Update last active
    user.lastActiveAt = new Date();
    await user.save();

    // Prepare response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      assignedFaculty: user.assignedFaculty,
    };

    return Response.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({
      success: false,
      error: 'Login failed',
    }, { status: 500 });
  }
}