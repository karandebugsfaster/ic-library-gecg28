// src/app/api/books/[id]/route.js - FIXED VERSION

import connectDB from '@/lib/mongodb';
import Book from '@/lib/models/Book';
import Rental from '@/lib/models/Rental';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    // CRITICAL: Await params in Next.js 15+
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    console.log('📚 Fetching book with ID:', id);

    // Validate ObjectId format BEFORE connecting to DB
    if (!id || typeof id !== 'string') {
      console.error('❌ Invalid ID format:', id);
      return Response.json({
        success: false,
        error: 'Invalid book ID format'
      }, { status: 400 });
    }

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('❌ Invalid ObjectId:', id);
      return Response.json({
        success: false,
        error: 'Invalid book ID'
      }, { status: 400 });
    }

    // THEN connect to database
    await connectDB();

    // Find the book
    const book = await Book.findById(id).lean();

    if (!book) {
      console.log('❌ Book not found:', id);
      return Response.json({
        success: false,
        error: 'Book not found'
      }, { status: 404 });
    }

    console.log('✅ Book found:', book.title);

    // Get current rental info if book is rented
    let currentRental = null;
    if (book.rentalStatus === 'RENTED' && book.currentRental) {
      try {
        currentRental = await Rental.findById(book.currentRental)
          .populate('userId', 'enrollmentNumber')
          .select('issuedAt dueDate')
          .lean();
      } catch (rentalError) {
        console.error('⚠️ Failed to fetch rental info:', rentalError);
        // Don't fail the whole request if rental fetch fails
      }
    }

    return Response.json({
      success: true,
      data: {
        ...book,
        currentRentalInfo: currentRental
      }
    });

  } catch (error) {
    console.error('❌ Fetch book error:', error);
    
    // Specific error handling
    if (error.name === 'CastError') {
      return Response.json({
        success: false,
        error: 'Invalid book ID format'
      }, { status: 400 });
    }

    return Response.json({
      success: false,
      error: 'Failed to fetch book details'
    }, { status: 500 });
  }
}