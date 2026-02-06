// src/app/api/test-db/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Book from '@/lib/models/Book';

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Test queries
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();

    return Response.json({
      success: true,
      message: 'Database connected successfully',
      data: {
        users: userCount,
        books: bookCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}