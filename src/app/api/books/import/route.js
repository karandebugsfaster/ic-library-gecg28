// // src/app/api/books/import/route.js

// import connectDB from '@/lib/mongodb';
// import Book from '@/lib/models/Book';

// export async function POST(request) {
//   try {
//     await connectDB();

//     const body = await request.json();
//     const { books } = body;

//     if (!Array.isArray(books) || books.length === 0) {
//       return Response.json({
//         success: false,
//         error: 'No books data provided'
//       }, { status: 400 });
//     }

//     // Bulk insert with validation
//     const insertedBooks = [];
//     const errors = [];

//     for (let i = 0; i < books.length; i++) {
//       try {
//         const book = await Book.create(books[i]);
//         insertedBooks.push(book);
//       } catch (error) {
//         // Handle duplicate ISBN
//         if (error.code === 11000) {
//           // Try to update existing book instead
//           try {
//             const updated = await Book.findOneAndUpdate(
//               { isbn: books[i].isbn },
//               books[i],
//               { new: true }
//             );
//             insertedBooks.push(updated);
//           } catch (updateError) {
//             errors.push({
//               row: i + 1,
//               isbn: books[i].isbn,
//               error: 'Duplicate ISBN, failed to update'
//             });
//           }
//         } else {
//           errors.push({
//             row: i + 1,
//             isbn: books[i].isbn,
//             error: error.message
//           });
//         }
//       }
//     }

//     return Response.json({
//       success: true,
//       message: `Imported ${insertedBooks.length} books`,
//       data: {
//         imported: insertedBooks.length,
//         errors: errors.length,
//         errorDetails: errors
//       }
//     });

//   } catch (error) {
//     console.error('Import error:', error);
//     return Response.json({
//       success: false,
//       error: 'Failed to import books'
//     }, { status: 500 });
//   }
// }
// src/app/api/books/import/route.js

import connectDB from '@/lib/mongodb';
import Book from '@/lib/models/Book';

export async function POST(request) {
  console.log('📥 Import API called');

  try {
    await connectDB();
    console.log('✅ Database connected');

    const body = await request.json();
    console.log('📦 Received data:', {
      booksCount: body.books?.length,
      firstBook: body.books?.[0]
    });

    const { books } = body;

    if (!Array.isArray(books) || books.length === 0) {
      console.log('❌ Invalid books data');
      return Response.json({
        success: false,
        error: 'No books data provided'
      }, { status: 400 });
    }

    const insertedBooks = [];
    const errors = [];
    const seenISBNs = new Set();

    for (let i = 0; i < books.length; i++) {
      try {
        const bookData = { ...books[i] };
        
        // Clean and validate title
        if (!bookData.title || bookData.title.trim() === '') {
          errors.push({
            row: i + 1,
            isbn: bookData.isbn || 'N/A',
            title: 'Empty title',
            error: 'Title is required'
          });
          continue;
        }
        
        // Clean all string fields to remove "nan", "null", etc.
        const cleanString = (value) => {
          if (!value) return '';
          const str = String(value).trim();
          if (str.toLowerCase() === 'nan' || 
              str.toLowerCase() === 'null' || 
              str.toLowerCase() === 'undefined') {
            return '';
          }
          return str;
        };
        
        // Clean all fields
        bookData.title = cleanString(bookData.title);
        bookData.author = cleanString(bookData.author) || 'Unknown';
        bookData.publisher = cleanString(bookData.publisher);
        bookData.edition = cleanString(bookData.edition);
        bookData.description = cleanString(bookData.description);
        bookData.isbn = cleanString(bookData.isbn);
        
        // Handle genre array
        if (Array.isArray(bookData.genre)) {
          bookData.genre = bookData.genre.filter(g => g && g.trim());
        } else {
          bookData.genre = [];
        }
        
        // Handle duplicate ISBNs within batch
        if (bookData.isbn && seenISBNs.has(bookData.isbn)) {
          console.log(`⚠️ Duplicate ISBN in batch: ${bookData.isbn}`);
          bookData.isbn = `${bookData.isbn}-COPY-${i}`;
        }
        
        if (bookData.isbn) {
          seenISBNs.add(bookData.isbn);
        } else {
          // Generate ISBN if missing
          bookData.isbn = `TEMP-${Date.now()}-${i}`;
        }

        // Check if book exists in database by ISBN
        let existingBook = await Book.findOne({ isbn: bookData.isbn });
        
        if (existingBook) {
          // Update existing
          const updated = await Book.findOneAndUpdate(
            { isbn: bookData.isbn },
            {
              title: bookData.title,
              author: bookData.author,
              genre: bookData.genre,
              publisher: bookData.publisher,
              publishedYear: bookData.publishedYear,
              edition: bookData.edition,
              description: bookData.description,
              totalCopies: bookData.totalCopies || 1
            },
            { new: true, runValidators: true }
          );
          insertedBooks.push(updated);
          console.log(`✏️ Updated: ${bookData.title}`);
        } else {
          // Create new book
          const book = await Book.create({
            isbn: bookData.isbn,
            title: bookData.title,
            author: bookData.author,
            genre: bookData.genre,
            publisher: bookData.publisher,
            publishedYear: bookData.publishedYear,
            edition: bookData.edition,
            description: bookData.description,
            physicalId: bookData.physicalId,
            totalCopies: bookData.totalCopies || 1,
            rentalStatus: 'AVAILABLE'
          });
          insertedBooks.push(book);
          console.log(`✅ Created: ${bookData.title}`);
        }
      } catch (error) {
        console.error(`❌ Error with book ${i}:`, error);
        
        let errorMsg = error.message;
        if (error.code === 11000) {
          errorMsg = 'Duplicate ISBN in database';
        } else if (error.name === 'ValidationError') {
          errorMsg = Object.values(error.errors).map(e => e.message).join(', ');
        }
        
        errors.push({
          row: i + 1,
          isbn: books[i].isbn || 'N/A',
          title: books[i].title || 'Unknown',
          error: errorMsg
        });
      }
    }

    console.log(`✅ Import complete: ${insertedBooks.length} books, ${errors.length} errors`);

    return Response.json({
      success: true,
      message: `Imported ${insertedBooks.length} books`,
      data: {
        imported: insertedBooks.length,
        errors: errors.length,
        errorDetails: errors
      }
    });

  } catch (error) {
    console.error('💥 Import API error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Failed to import books'
    }, { status: 500 });
  }
}