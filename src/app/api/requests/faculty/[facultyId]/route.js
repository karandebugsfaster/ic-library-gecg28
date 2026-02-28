// src/app/api/requests/faculty/[facultyId]/route.js

import connectDB from '@/lib/mongodb';
import BookRequest from '@/lib/models/BookRequest';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { facultyId } =await params;

    const requests = await BookRequest.find({ facultyId })
      .sort({ requestedAt: -1 })
      .lean();

    return Response.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Fetch faculty requests error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch requests',
    }, { status: 500 });
  }
}