// src/app/api/faculty/assign-book/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Book from '@/lib/models/Book';
import BookRequest from '@/lib/models/BookRequest';
import { sendEmail } from '@/lib/utils/email';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { enrollmentNumber, bookId, rentalDays, facultyId, reason } = body;

    // Find student
    const user = await User.findOne({
      enrollmentNumber: enrollmentNumber.trim().toUpperCase(),
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Student not found. Student must create an account first.',
      }, { status: 404 });
    }

    // Verify student is assigned to this faculty
    if (user.assignedFaculty?.toString() !== facultyId) {
      return NextResponse.json({
        success: false,
        error: 'This student is not assigned to you.',
      }, { status: 403 });
    }

    // Check student eligibility
    const eligibility = user.checkRentalEligibility();
    if (!eligibility.canRent) {
      return NextResponse.json({
        success: false,
        error: eligibility.reason,
      }, { status: 400 });
    }

    // Check book availability
    const book = await Book.findOne({
      _id: bookId,
      rentalStatus: 'AVAILABLE',
    });

    if (!book) {
      return NextResponse.json({
        success: false,
        error: 'Book is not available',
      }, { status: 400 });
    }

    // Check if there's already a pending request for this book by this student
    const existingRequest = await BookRequest.findOne({
      studentId: user._id,
      bookId,
      type: 'issue',
      status: 'pending',
    });

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'There is already a pending issue request for this book',
      }, { status: 400 });
    }

    // Get faculty info
    const faculty = await User.findById(facultyId);

    // Create book request
    const bookRequest = await BookRequest.create({
      studentId: user._id,
      facultyId,
      bookId,
      type: 'issue',
      status: 'pending',
      reason: reason || `Rental duration: ${rentalDays || 7} days`,
      studentSnapshot: {
        name: user.name,
        email: user.email,
        enrollmentNumber: user.enrollmentNumber,
      },
      facultySnapshot: {
        name: faculty?.name || 'Faculty',
        email: faculty?.email || '',
      },
      bookSnapshot: {
        title: book.title,
        isbn: book.isbn,
        author: book.author,
      },
    });

    // Get manager email
    const manager = await User.findOne({ role: 'manager', status: 'active' });

    if (manager && manager.email) {
      // Send email to manager
      try {
        await sendEmail({
          to: manager.email,
          subject: 'New Book Issue Request from Faculty',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1B2E4B;">New Book Issue Request</h2>
              <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Type:</strong> Book Issue</p>
                <p><strong>Student:</strong> ${user.name} (${user.enrollmentNumber})</p>
                <p><strong>Faculty:</strong> ${faculty?.name || 'N/A'}</p>
                <p><strong>Book:</strong> ${book.title} by ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
                <p><strong>Rental Duration:</strong> ${rentalDays || 7} days</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
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
      message: 'Book assignment request sent to manager for approval',
      data: {
        requestId: bookRequest._id,
        student: user.enrollmentNumber,
        book: book.title,
      },
    });

  } catch (error) {
    console.error('Faculty assign book error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create assignment request',
    }, { status: 500 });
  }
}