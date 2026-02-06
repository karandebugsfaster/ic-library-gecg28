// src/app/api/books/[id]/route.js

import connectDB from '@/lib/mongodb';
import Book from '@/lib/models/Book';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({
        success: false,
        error: 'Invalid book ID'
      }, { status: 400 });
    }

    const book = await Book.findById(id).lean();

    if (!book) {
      return Response.json({
        success: false,
        error: 'Book not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: book
    });

  } catch (error) {
    console.error('Fetch book error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch book details'
    }, { status: 500 });
  }
}