// src/app/api/users/[id]/delete/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request, context) {
  try {
    await connectDB();

    // ✅ Next 15 FIX
    const { id } = await context.params;

    const body = await request.json();
    const { managerId } = body;

    if (!managerId) {
      return Response.json(
        { success: false, error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    const manager = await User.findOne({
      _id: managerId,
      role: 'manager',
      status: 'active',
    });

    if (!manager) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'manager') {
      return Response.json(
        { success: false, error: 'Cannot delete manager account' },
        { status: 403 }
      );
    }

    user.status = 'deleted';
    user.sessionInvalidatedAt = new Date();
    await user.save();

    return Response.json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('Delete user error:', error);

    return Response.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}