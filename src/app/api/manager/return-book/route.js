// src/app/api/manager/return-book/route.js - ONLY Manager Can Return

import connectDB from '@/lib/mongodb';
import Book from '@/lib/models/Book';
import Rental from '@/lib/models/Rental';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const { rentalId } = await request.json();

    if (!rentalId) {
      await session.abortTransaction();
      return Response.json({
        success: false,
        error: 'Rental ID required'
      }, { status: 400 });
    }

    // Find rental
    const rental = await Rental.findById(rentalId).session(session);

    if (!rental) {
      await session.abortTransaction();
      return Response.json({
        success: false,
        error: 'Rental not found'
      }, { status: 404 });
    }

    // Only active rentals can be returned
    if (rental.status !== 'ACTIVE' && rental.status !== 'OVERDUE') {
      await session.abortTransaction();
      return Response.json({
        success: false,
        error: `Cannot return book with status: ${rental.status}`
      }, { status: 400 });
    }

    // Update rental status - ONLY MANUAL RETURN
    await Rental.updateOne(
      { _id: rentalId },
      {
        status: 'MANUALLY_RETURNED',
        actualReturnedAt: new Date()
      },
      { session }
    );

    // Mark book as available - THIS IS THE ONLY WAY
    await Book.updateOne(
      { _id: rental.bookId },
      {
        rentalStatus: 'AVAILABLE',
        currentRental: null
      },
      { session }
    );

    // Update user stats
    await User.updateOne(
      { _id: rental.userId },
      {
        $inc: { activeRentals: -1 }
      },
      { session }
    );

    await session.commitTransaction();

    console.log(`✅ Manager returned book: ${rental.bookSnapshot.title} from ${rental.userSnapshot.enrollmentNumber}`);

    return Response.json({
      success: true,
      message: 'Book marked as returned and available'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Return book error:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to return book'
    }, { status: 500 });
  } finally {
    session.endSession();
  }
}