// src/app/api/requests/[id]/reject/route.js

import connectDB from '@/lib/mongodb';
import BookRequest from '@/lib/models/BookRequest';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/utils/email';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { managerId, notes } = body;

    if (!managerId) {
      return Response.json({
        success: false,
        error: 'Manager ID is required',
      }, { status: 400 });
    }

    // Verify manager
    const manager = await User.findOne({ 
      _id: managerId, 
      role: 'manager',
      status: 'active' 
    });

    if (!manager) {
      return Response.json({
        success: false,
        error: 'Invalid manager',
      }, { status: 403 });
    }

    // Find the request
    const bookRequest = await BookRequest.findOne({
      _id: id,
      status: 'pending',
    }).populate('facultyId', 'email name')
      .populate('studentId', 'name')
      .populate('bookId', 'title');

    if (!bookRequest) {
      return Response.json({
        success: false,
        error: 'Request not found or already processed',
      }, { status: 404 });
    }

    // Update request
    bookRequest.status = 'rejected';
    bookRequest.rejectedAt = new Date();
    bookRequest.rejectedBy = manager._id;
    bookRequest.managerNotes = notes;
    await bookRequest.save();

    // Send notification to faculty
    await sendEmail({
      to: bookRequest.facultyId.email,
      subject: `Book Request Rejected`,
      html: `
        <h2>Request Rejected</h2>
        <p>Your book ${bookRequest.type} request has been rejected by the manager.</p>
        <p><strong>Student:</strong> ${bookRequest.studentId.name}</p>
        <p><strong>Book:</strong> ${bookRequest.bookId.title}</p>
        <p><strong>Type:</strong> ${bookRequest.type === 'issue' ? 'Issue' : 'Return'}</p>
        ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
      `,
    });

    return Response.json({
      success: true,
      message: 'Request rejected successfully',
    });

  } catch (error) {
    console.error('Reject request error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to reject request',
    }, { status: 500 });
  }
}