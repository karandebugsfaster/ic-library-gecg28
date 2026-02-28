// src/app/api/users/faculties/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import BookRequest from '@/lib/models/BookRequest';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    const faculties = await User.find({ 
      role: 'faculty',
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

    if (includeStats) {
      // Add statistics for each faculty
      for (let faculty of faculties) {
        const [studentsCount, pendingRequestsCount, approvedRequestsCount] = await Promise.all([
          User.countDocuments({ 
            assignedFaculty: faculty._id,
            status: 'active',
          }),
          BookRequest.countDocuments({
            facultyId: faculty._id,
            status: 'pending',
          }),
          BookRequest.countDocuments({
            facultyId: faculty._id,
            status: 'approved',
          }),
        ]);

        faculty.studentsCount = studentsCount;
        faculty.pendingRequestsCount = pendingRequestsCount;
        faculty.booksIssuedCount = approvedRequestsCount;
      }
    }

    return Response.json({
      success: true,
      faculties,
    });

  } catch (error) {
    console.error('Fetch faculties error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch faculties',
    }, { status: 500 });
  }
}