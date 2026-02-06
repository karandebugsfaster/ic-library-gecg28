// src/app/api/rentals/create/route.js

import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Book from "@/lib/models/Book";
import Rental from "@/lib/models/Rental";
import Notification from "@/lib/models/Notification";
import {
  validateEnrollmentNumber,
  validateCollegeEmail,
  validatePhoneNumber,
} from "@/lib/utils/validators";
import mongoose from "mongoose";

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const body = await request.json();
    const { bookId, enrollmentNumber, email, phone, agreedToTerms } = body;

    // Validate inputs
    const enrollmentValidation = validateEnrollmentNumber(enrollmentNumber);
    if (!enrollmentValidation.valid) {
      await session.abortTransaction();
      return Response.json(
        {
          success: false,
          error: enrollmentValidation.error,
        },
        { status: 400 },
      );
    }

    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.valid) {
      await session.abortTransaction();
      return Response.json(
        {
          success: false,
          error: emailValidation.error,
        },
        { status: 400 },
      );
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      await session.abortTransaction();
      return Response.json(
        {
          success: false,
          error: phoneValidation.error,
        },
        { status: 400 },
      );
    }

    if (!agreedToTerms) {
      await session.abortTransaction();
      return Response.json(
        {
          success: false,
          error: "You must agree to the terms and conditions",
        },
        { status: 400 },
      );
    }

    // Find or create user
    let user = await User.findOne({
      enrollmentNumber: enrollmentValidation.cleaned,
    }).session(session);

    if (!user) {
      // Create new user
      user = await User.create(
        [
          {
            enrollmentNumber: enrollmentValidation.cleaned,
            email: emailValidation.normalized,
            phone: phoneValidation.cleaned,
            agreedToTerms: true,
            termsAgreedAt: new Date(),
          },
        ],
        { session },
      );
      user = user[0];
    } else {
      // Verify email matches
      if (user.email !== emailValidation.normalized) {
        await session.abortTransaction();
        return Response.json(
          {
            success: false,
            error: "Enrollment number already registered with different email",
          },
          { status: 400 },
        );
      }
    }

    // Check user eligibility
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
          error: "Book is not available for rent",
        },
        { status: 400 },
      );
    }

    // Create rental record - Use local timezone midnight for correct date handling
    const issuedDate = new Date();
    issuedDate.setHours(0, 0, 0, 0); // Set to midnight in local timezone

    const dueDate = new Date(issuedDate);
    dueDate.setDate(issuedDate.getDate() + 7); // 7 days rental period

    const rental = await Rental.create(
      [
        {
          userId: user._id,
          bookId: book._id,
          issuedAt: issuedDate,
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

    // Update book with current rental
    await Book.updateOne(
      { _id: bookId },
      { currentRental: rental[0]._id },
      { session },
    );

    // Update user stats
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
          message: `You've successfully rented "${book.title}". Due date: ${dueDate.toISOString().split("T")[0]}`,
          status: "PENDING",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return Response.json({
      success: true,
      message: "Book rented successfully!",
      data: {
        rental: rental[0],
        user: {
          id: user._id,
          enrollmentNumber: user.enrollmentNumber,
          email: user.email,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Rental creation error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to rent book",
      },
      { status: 500 },
    );
  } finally {
    session.endSession();
  }
}
