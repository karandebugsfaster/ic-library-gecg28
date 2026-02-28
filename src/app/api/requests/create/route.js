// src/app/api/requests/create/route.js

import connectDB from '@/lib/mongodb';
import BookRequest from '@/lib/models/BookRequest';
import User from '@/lib/models/User';
import Book from '@/lib/models/Book';
import { sendEmail } from '@/lib/utils/email';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { studentId, facultyId, bookId, type, reason } = body;

    // Validation
    if (!studentId || !facultyId || !bookId || !type) {
      return Response.json({
        success: false,
        error: 'Student, faculty, book, and type are required',
      }, { status: 400 });
    }

    if (!['issue', 'return'].includes(type)) {
      return Response.json({
        success: false,
        error: 'Type must be either "issue" or "return"',
      }, { status: 400 });
    }

    // Verify entities exist
    const [student, faculty, book] = await Promise.all([
      User.findOne({ _id: studentId, role: 'student', status: 'active' }),
      User.findOne({ _id: facultyId, role: 'faculty', status: 'active' }),
      Book.findById(bookId),
    ]);

    if (!student) {
      return Response.json({
        success: false,
        error: 'Student not found or inactive',
      }, { status: 404 });
    }

    if (!faculty) {
      return Response.json({
        success: false,
        error: 'Faculty not found or inactive',
      }, { status: 404 });
    }

    if (!book) {
      return Response.json({
        success: false,
        error: 'Book not found',
      }, { status: 404 });
    }

    // Verify student is assigned to this faculty
    if (student.assignedFaculty.toString() !== facultyId) {
      return Response.json({
        success: false,
        error: 'Student is not assigned to this faculty',
      }, { status: 403 });
    }

    // Type-specific validation
    if (type === 'issue') {
      if (book.rentalStatus !== 'AVAILABLE') {
        return Response.json({
          success: false,
          error: 'Book is not available for rental',
        }, { status: 400 });
      }

      // Check if there's already a pending issue request for this book by this student
      const existingRequest = await BookRequest.findOne({
        studentId,
        bookId,
        type: 'issue',
        status: 'pending',
      });

      if (existingRequest) {
        return Response.json({
          success: false,
          error: 'There is already a pending issue request for this book',
        }, { status: 400 });
      }
    }

    if (type === 'return') {
      if (book.currentHolder?.toString() !== studentId) {
        return Response.json({
          success: false,
          error: 'This book is not currently issued to this student',
        }, { status: 400 });
      }

      // Check if there's already a pending return request
      const existingRequest = await BookRequest.findOne({
        studentId,
        bookId,
        type: 'return',
        status: 'pending',
      });

      if (existingRequest) {
        return Response.json({
          success: false,
          error: 'There is already a pending return request for this book',
        }, { status: 400 });
      }
    }

    // Create book request
    const bookRequest = await BookRequest.create({
      studentId,
      facultyId,
      bookId,
      type,
      reason,
      status: 'pending',
    });

    // Get manager email
    const manager = await User.findOne({ role: 'manager', status: 'active' });

    if (manager) {
      // Send email to manager
      await sendEmail({
        to: manager.email,
        subject: `New Book ${type === 'issue' ? 'Issue' : 'Return'} Request`,
        html: `
          <h2>New Book Request</h2>
          <p><strong>Type:</strong> ${type === 'issue' ? 'Issue' : 'Return'}</p>
          <p><strong>Student:</strong> ${student.name} (${student.enrollmentNumber})</p>
          <p><strong>Faculty:</strong> ${faculty.name}</p>
          <p><strong>Book:</strong> ${book.title} by ${book.author}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p><strong>Requested At:</strong> ${new Date().toLocaleString()}</p>
          <br/>
          <p>Please log in to the system to approve or reject this request.</p>
        `,
      });
    }

    return Response.json({
      success: true,
      message: 'Book request created successfully',
      request: {
        id: bookRequest._id,
        type: bookRequest.type,
        status: bookRequest.status,
        requestedAt: bookRequest.requestedAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create request error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to create request',
    }, { status: 500 });
  }
}