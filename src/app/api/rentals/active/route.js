// src/app/api/rentals/active/route.js

import connectDB from '@/lib/mongodb';
import Rental from '@/lib/models/Rental';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentIds = searchParams.get('studentIds')?.split(',');

    const query = { status: 'ACTIVE' };
    
    if (studentIds && studentIds.length > 0) {
      query.userId = { $in: studentIds };
    }

    const rentals = await Rental.find(query)
      .populate('userId', 'name email enrollmentNumber')
      .populate('bookId', 'title author isbn')
      .sort({ dueDate: 1 })
      .lean();

    return Response.json({
      success: true,
      rentals,
    });
  } catch (error) {
    console.error('Fetch active rentals error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch rentals',
    }, { status: 500 });
  }
}