// src/app/api/manager/return-book/route.js

import connectDB from '@/lib/mongodb';
import Rental from '@/lib/models/Rental';
import Book from '@/lib/models/Book';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const body = await request.json();
    const { rentalId } = body;

    if (!rentalId) {
      await session.abortTransaction();
      return Response.json({
        success: false,
        error: 'Rental ID is required',
      }, { status: 400 });
    }

    // Find rental
    const rental = await Rental.findById(rentalId).session(session);

    if (!rental) {
      await session.abortTransaction();
      return Response.json({
        success: false,
        error: 'Rental not found',
      }, { status: 404 });
    }

    if (rental.status !== 'ACTIVE') {
      await session.abortTransaction();
      return Response.json({
        success: false,
        error: 'Rental is not active',
      }, { status: 400 });
    }

    // Update rental
    rental.status = 'RETURNED';
    rental.actualReturnedAt = new Date();
    await rental.save({ session });

    // Update book
    await Book.updateOne(
      { _id: rental.bookId },
      {
        rentalStatus: 'AVAILABLE',
        currentRental: null,
        currentHolder: null,
      },
      { session }
    );

    // Update user
    await User.updateOne(
      { _id: rental.userId },
      { $inc: { activeRentals: -1 } },
      { session }
    );

    await session.commitTransaction();

    return Response.json({
      success: true,
      message: 'Book returned successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Return book error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to return book',
    }, { status: 500 });
  } finally {
    session.endSession();
  }
}