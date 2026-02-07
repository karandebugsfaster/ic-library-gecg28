// src/app/api/manager/assign-book/route.js

import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Book from "@/lib/models/Book";
import Rental from "@/lib/models/Rental";
import Notification from "@/lib/models/Notification";
import mongoose from "mongoose";

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const { enrollmentNumber, bookId, rentalDays } = await request.json();

    // Find student
    const user = await User.findOne({
      enrollmentNumber: enrollmentNumber.trim().toUpperCase(),
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      return Response.json(
        {
          success: false,
          error: "Student not found. Student must create an account first.",
        },
        { status: 404 },
      );
    }

    // Check student eligibility
    const eligibility = user.checkRentalEligibility();
    if (!eligibility.canRent) {
      await session.abortTransaction();
      return Response.json(
        {
          success: false,
          error: eligibility.reason,
        },
        { status: 400 },
      );
    }

    // Check book availability
    const book = await Book.findOneAndUpdate(
      {
        _id: bookId,
        rentalStatus: "AVAILABLE",
      },
      {
        rentalStatus: "RENTED",
        lastRentedAt: new Date(),
        $inc: { totalRentals: 1 },
      },
      { new: true, session },
    );

    if (!book) {
      await session.abortTransaction();
      return Response.json(
        {
          success: false,
          error: "Book is not available",
        },
        { status: 400 },
      );
    }

    // Create rental
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (rentalDays || 7));

    const rental = await Rental.create(
      [
        {
          userId: user._id,
          bookId: book._id,
          issuedAt: new Date(),
          dueDate: dueDate,
          status: "ACTIVE",
          userSnapshot: {
            enrollmentNumber: user.enrollmentNumber,
            email: user.email,
          },
          bookSnapshot: {
            title: book.title,
            isbn: book.isbn,
          },
        },
      ],
      { session },
    );

    // Update book
    await Book.updateOne(
      { _id: bookId },
      { currentRental: rental[0]._id },
      { session },
    );

    // Update user
    await User.updateOne(
      { _id: user._id },
      {
        $inc: { activeRentals: 1, totalRentals: 1 },
        lastActiveAt: new Date(),
      },
      { session },
    );

    // Create notification
    await Notification.create(
      [
        {
          userId: user._id,
          rentalId: rental[0]._id,
          type: "RENTAL_CONFIRMATION",
          message: `Manager assigned you "${book.title}". Due: ${dueDate.toLocaleDateString("en-GB")}`,
          status: "PENDING",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return Response.json({
      success: true,
      message: "Book assigned successfully",
      data: {
        rental: rental[0],
        student: user.enrollmentNumber,
        book: book.title,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Assign book error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to assign book",
      },
      { status: 500 },
    );
  } finally {
    session.endSession();
  }
}
