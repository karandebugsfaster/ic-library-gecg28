// // src/app/api/books/[id]/route.js

// import connectDB from '@/lib/mongodb';
// import Book from '@/lib/models/Book';
// import Rental from '@/lib/models/Rental';
// import mongoose from 'mongoose';

// export async function GET(request, { params }) {
//   try {
//     await connectDB();

//     const { id } = params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return Response.json({
//         success: false,
//         error: 'Invalid book ID'
//       }, { status: 400 });
//     }

//     const book = await Book.findById(id).lean();

//     if (!book) {
//       return Response.json({
//         success: false,
//         error: 'Book not found'
//       }, { status: 404 });
//     }

//     // Get current rental info if book is rented
//     let currentRental = null;
//     if (book.rentalStatus === 'RENTED' && book.currentRental) {
//       currentRental = await Rental.findById(book.currentRental)
//         .populate('userId', 'enrollmentNumber')
//         .select('issuedAt dueDate')
//         .lean();
//     }

//     return Response.json({
//       success: true,
//       data: {
//         ...book,
//         currentRentalInfo: currentRental
//       }
//     });

//   } catch (error) {
//     console.error('Fetch book error:', error);
//     return Response.json({
//       success: false,
//       error: 'Failed to fetch book details'
//     }, { status: 500 });
//   }
// }
import connectDB from "@/lib/mongodb";
import Book from "@/lib/models/Book";
import Rental from "@/lib/models/Rental";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();

    // ✅ FIX: await params
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          error: "Invalid book ID",
        },
        { status: 400 },
      );
    }

    const book = await Book.findById(id).lean();

    if (!book) {
      return Response.json(
        {
          success: false,
          error: "Book not found",
        },
        { status: 404 },
      );
    }

    // Get current rental info if book is rented
    let currentRental = null;

    if (book.rentalStatus === "RENTED" && book.currentRental) {
      currentRental = await Rental.findById(book.currentRental)
        .populate("userId", "enrollmentNumber")
        .select("issuedAt dueDate")
        .lean();
    }

    return Response.json({
      success: true,
      data: {
        ...book,
        currentRentalInfo: currentRental,
      },
    });
  } catch (error) {
    console.error("Fetch book error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch book details",
      },
      { status: 500 },
    );
  }
}
