// src/app/api/faculty/return-book/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Rental from '@/lib/models/Rental';
import BookRequest from '@/lib/models/BookRequest';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/utils/email';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { rentalId, facultyId, reason } = body;

    if (!rentalId) {
      return NextResponse.json({
        success: false,
        error: 'Rental ID is required',
      }, { status: 400 });
    }

    // Find rental
    const rental = await Rental.findById(rentalId)
      .populate('userId', 'name email enrollmentNumber assignedFaculty')
      .populate('bookId', 'title author isbn');

    if (!rental) {
      return NextResponse.json({
        success: false,
        error: 'Rental not found',
      }, { status: 404 });
    }

    if (rental.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        error: 'Rental is not active',
      }, { status: 400 });
    }

    // Verify student is assigned to this faculty
    if (rental.userId.assignedFaculty?.toString() !== facultyId) {
      return NextResponse.json({
        success: false,
        error: 'This student is not assigned to you.',
      }, { status: 403 });
    }

    // Check if there's already a pending return request
    const existingRequest = await BookRequest.findOne({
      studentId: rental.userId._id,
      bookId: rental.bookId._id,
      type: 'return',
      status: 'pending',
    });

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'There is already a pending return request for this book',
      }, { status: 400 });
    }

    // Get faculty info
    const faculty = await User.findById(facultyId);

    // Create return request
    const bookRequest = await BookRequest.create({
      studentId: rental.userId._id,
      facultyId,
      bookId: rental.bookId._id,
      type: 'return',
      status: 'pending',
      reason,
      studentSnapshot: {
        name: rental.userId.name,
        email: rental.userId.email,
        enrollmentNumber: rental.userId.enrollmentNumber,
      },
      facultySnapshot: {
        name: faculty?.name || 'Faculty',
        email: faculty?.email || '',
      },
      bookSnapshot: {
        title: rental.bookId.title,
        isbn: rental.bookId.isbn,
        author: rental.bookId.author,
      },
    });

    // Get manager email
    const manager = await User.findOne({ role: 'manager', status: 'active' });

    if (manager && manager.email) {
      // Send email to manager
      try {
        await sendEmail({
          to: manager.email,
          subject: 'New Book Return Request from Faculty',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1B2E4B;">New Book Return Request</h2>
              <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Type:</strong> Book Return</p>
                <p><strong>Student:</strong> ${rental.userId.name} (${rental.userId.enrollmentNumber})</p>
                <p><strong>Faculty:</strong> ${faculty?.name || 'N/A'}</p>
                <p><strong>Book:</strong> ${rental.bookId.title} by ${rental.bookId.author}</p>
                <p><strong>ISBN:</strong> ${rental.bookId.isbn || 'N/A'}</p>
                <p><strong>Issued On:</strong> ${new Date(rental.issuedAt).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(rental.dueDate).toLocaleDateString()}</p>
                ${reason ? `<p><strong>Notes:</strong> ${reason}</p>` : ''}
                <p><strong>Requested At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p>Please log in to the system to approve or reject this request.</p>
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/manager/dashboard" 
                 style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px;">
                View Request
              </a>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Book return request sent to manager for approval',
    });

  } catch (error) {
    console.error('Faculty return book error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create return request',
    }, { status: 500 });
  }
}