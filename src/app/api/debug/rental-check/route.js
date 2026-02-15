// src/app/api/debug/rental-check/route.js - FIXED with User import

import connectDB from '@/lib/mongodb';
import Book from '@/lib/models/Book';
import Rental from '@/lib/models/Rental';
import User from '@/lib/models/User'; // ✅ ADD THIS IMPORT

export async function GET(request) {
  try {
    await connectDB();

    // Get all rented books
    const rentedBooks = await Book.find({ 
      rentalStatus: 'RENTED' 
    }).select('title rentalStatus currentRental').lean();

    const debugInfo = [];

    for (const book of rentedBooks) {
      const rentalInfo = {
        bookId: book._id,
        bookTitle: book.title,
        rentalStatus: book.rentalStatus,
        hasCurrentRentalField: !!book.currentRental,
        currentRentalId: book.currentRental,
        activeRentals: []
      };

      // Find all active rentals for this book
      const activeRentals = await Rental.find({
        bookId: book._id,
        status: { $in: ['ACTIVE', 'OVERDUE'] }
      })
      .populate('userId', 'enrollmentNumber')
      .select('userId issuedAt dueDate status')
      .lean();

      rentalInfo.activeRentals = activeRentals.map(r => ({
        rentalId: r._id,
        user: r.userId?.enrollmentNumber || 'Unknown',
        issuedAt: r.issuedAt,
        dueDate: r.dueDate,
        status: r.status
      }));

      rentalInfo.activeRentalsCount = activeRentals.length;

      debugInfo.push(rentalInfo);
    }

    return Response.json({
      success: true,
      totalRentedBooks: rentedBooks.length,
      data: debugInfo,
      summary: {
        booksWithCurrentRental: debugInfo.filter(d => d.hasCurrentRentalField).length,
        booksWithActiveRentals: debugInfo.filter(d => d.activeRentalsCount > 0).length,
        booksWithMismatch: debugInfo.filter(d => d.hasCurrentRentalField && d.activeRentalsCount === 0).length
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}