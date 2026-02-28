// src/app/api/requests/pending/route.js

import connectDB from '@/lib/mongodb';
import BookRequest from '@/lib/models/BookRequest';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId');

    const query = { status: 'pending' };
    
    if (facultyId) {
      query.facultyId = facultyId;
    }

    const requests = await BookRequest.find(query)
      .populate('studentId', 'name email enrollmentNumber')
      .populate('facultyId', 'name email')
      .populate('bookId', 'title author isbn')
      .sort({ requestedAt: -1 })
      .lean();

    return Response.json({
      success: true,
      requests,
    });

  } catch (error) {
    console.error('Fetch pending requests error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch pending requests',
    }, { status: 500 });
  }
}