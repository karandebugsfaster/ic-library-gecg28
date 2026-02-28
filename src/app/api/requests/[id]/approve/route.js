// src/app/api/requests/[id]/approve/route.js

import connectDB from "@/lib/mongodb";
import BookRequest from "@/lib/models/BookRequest";
import Book from "@/lib/models/Book";
import User from "@/lib/models/User";
import Rental from "@/lib/models/Rental";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/utils/email";

export async function POST(request, context) {
  let session = null;

  try {
    const { id } = await context.params;

    await connectDB();

    session = await mongoose.startSession();
    session.startTransaction();

    const body = await request.json();
    const { managerId, notes } = body;

    if (!managerId) {
      await session.abortTransaction();
      return Response.json(
        { success: false, error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Verify manager
    const manager = await User.findOne({
      _id: managerId,
      role: "manager",
      status: "active",
    }).session(session);

    if (!manager) {
      await session.abortTransaction();
      return Response.json(
        { success: false, error: "Invalid manager" },
        { status: 403 }
      );
    }

    // Find request
    const bookRequest = await BookRequest.findOne({
      _id: id,
      status: "pending",
    }).session(session);

    if (!bookRequest) {
      await session.abortTransaction();
      return Response.json(
        { success: false, error: "Request not found or already processed" },
        { status: 404 }
      );
    }

    const book = await Book.findById(bookRequest.bookId).session(session);
    const student = await User.findById(bookRequest.studentId).session(session);
    const faculty = await User.findById(bookRequest.facultyId).session(session);

    if (!book || !student || !faculty) {
      await session.abortTransaction();
      return Response.json(
        { success: false, error: "Related entities not found" },
        { status: 404 }
      );
    }

    // ISSUE FLOW
    if (bookRequest.type === "issue") {
      if (book.rentalStatus !== "AVAILABLE") {
        await session.abortTransaction();
        return Response.json(
          { success: false, error: "Book is no longer available" },
          { status: 400 }
        );
      }

      const rental = await Rental.create(
        [
          {
            userId: student._id,
            bookId: book._id,
            issuedAt: new Date(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: "ACTIVE",
            userSnapshot: {
              enrollmentNumber: student.enrollmentNumber,
              email: student.email,
            },
            bookSnapshot: {
              title: book.title,
              isbn: book.isbn,
            },
          },
        ],
        { session }
      );

      await Book.updateOne(
        { _id: book._id },
        {
          rentalStatus: "RENTED",
          currentRental: rental[0]._id,
          currentHolder: student._id,
          $inc: { totalRentals: 1 },
          lastRentedAt: new Date(),
        },
        { session }
      );

      await User.updateOne(
        { _id: student._id },
        { $inc: { activeRentals: 1, totalRentals: 1 } },
        { session }
      );
    }

    // RETURN FLOW
    if (bookRequest.type === "return") {
      const rental = await Rental.findOne({
        userId: student._id,
        bookId: book._id,
        status: "ACTIVE",
      }).session(session);

      if (!rental) {
        await session.abortTransaction();
        return Response.json(
          { success: false, error: "No active rental found" },
          { status: 404 }
        );
      }

      await Rental.updateOne(
        { _id: rental._id },
        { status: "RETURNED", actualReturnedAt: new Date() },
        { session }
      );

      await Book.updateOne(
        { _id: book._id },
        { rentalStatus: "AVAILABLE", currentRental: null, currentHolder: null },
        { session }
      );

      await User.updateOne(
        { _id: student._id },
        { $inc: { activeRentals: -1 } },
        { session }
      );
    }

    await BookRequest.updateOne(
      { _id: bookRequest._id },
      {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: manager._id,
        managerNotes: notes,
      },
      { session }
    );

    await session.commitTransaction();

    await sendEmail({
      to: faculty.email,
      subject: "Book Request Approved",
      html: `
        <h2>Request Approved</h2>
        <p>Your book ${bookRequest.type} request has been approved.</p>
        <p><strong>Student:</strong> ${student.name}</p>
        <p><strong>Book:</strong> ${book.title}</p>
      `,
    });

    return Response.json({
      success: true,
      message: "Request approved successfully",
    });

  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Approve request error:", error);

    return Response.json(
      { success: false, error: error.message || "Failed to approve request" },
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}