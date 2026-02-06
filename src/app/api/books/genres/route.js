// src/app/api/books/genres/route.js

import connectDB from '@/lib/mongodb';
import Book from '@/lib/models/Book';

export async function GET() {
  try {
    await connectDB();

    // Get all unique genres
    const genres = await Book.distinct('genre');
    
    // Remove empty values and sort
    const cleanGenres = genres
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return Response.json({
      success: true,
      data: cleanGenres
    });

  } catch (error) {
    console.error('Fetch genres error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch genres'
    }, { status: 500 });
  }
}