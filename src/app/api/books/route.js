// src/app/api/books/route.js

import connectDB from '@/lib/mongodb';
import Book from '@/lib/models/Book';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const available = searchParams.get('available');

    // Build query
    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    // Genre filter
    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    // Availability filter
    if (available === 'true') {
      query.rentalStatus = 'AVAILABLE';
    }

    // Execute query with pagination
    const [books, totalCount] = await Promise.all([
      Book.find(query)
        .select('title author genre rentalStatus isbn publishedYear coverImage')
        .sort({ title: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Book.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: page,
          totalPages,
          totalBooks: totalCount,
          booksPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Fetch books error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch books'
    }, { status: 500 });
  }
}