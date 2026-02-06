// // src/lib/utils/importBooks.js

// import * as XLSX from 'xlsx';

// /**
//  * Parse Excel file and convert to book data
//  * Expected columns: ISBN, Title, Author, Genre, Publisher, Published Year, Edition, Description
//  */
// export function parseExcelToBooks(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: 'array' });
        
//         // Get first sheet
//         const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
//         // Convert to JSON
//         const rows = XLSX.utils.sheet_to_json(firstSheet);
        
//         // Transform to our book schema
//         const books = rows.map((row, index) => {
//           // Handle genre - could be comma-separated string
//           let genres = [];
//           if (row.Genre || row.genre) {
//             const genreStr = row.Genre || row.genre;
//             genres = genreStr.split(',').map(g => g.trim()).filter(Boolean);
//           }

//           return {
//             isbn: row.ISBN || row.isbn || `TEMP-${Date.now()}-${index}`,
//             title: row.Title || row.title || 'Untitled',
//             author: row.Author || row.author || 'Unknown',
//             genre: genres,
//             publisher: row.Publisher || row.publisher || '',
//             publishedYear: parseInt(row['Published Year'] || row.publishedYear || row.year) || null,
//             edition: row.Edition || row.edition || '',
//             description: row.Description || row.description || '',
//             physicalId: row['Physical ID'] || row.physicalId || null,
//             totalCopies: parseInt(row['Total Copies'] || row.totalCopies) || 1,
//             rentalStatus: 'AVAILABLE'
//           };
//         });

//         resolve(books);
//       } catch (error) {
//         reject(new Error('Failed to parse Excel file: ' + error.message));
//       }
//     };

//     reader.onerror = () => reject(new Error('Failed to read file'));
//     reader.readAsArrayBuffer(file);
//   });
// }
// src/lib/utils/importBooks.js

import * as XLSX from 'xlsx';

/**
 * Helper function to clean values from Excel
 * Handles: NaN, null, undefined, empty strings, "nan" string
 */
function cleanValue(value, defaultValue = '') {
  if (value === null || value === undefined) return defaultValue;
  
  const strValue = String(value).trim();
  
  // Check for "nan", "NaN", "null", "undefined" strings
  if (strValue === '' || 
      strValue.toLowerCase() === 'nan' || 
      strValue.toLowerCase() === 'null' ||
      strValue.toLowerCase() === 'undefined') {
    return defaultValue;
  }
  
  return strValue;
}

/**
 * Helper to safely parse integer
 */
function safeParseInt(value) {
  if (value === null || value === undefined) return null;
  
  const strValue = String(value).trim();
  
  if (strValue === '' || 
      strValue.toLowerCase() === 'nan' || 
      strValue.toLowerCase() === 'null') {
    return null;
  }
  
  const parsed = parseInt(strValue);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse Excel file and convert to book data
 */
export function parseExcelToBooks(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);
        
        console.log('📊 Parsed rows from Excel:', rows.length);
        if (rows.length > 0) {
          console.log('📋 First row sample:', rows[0]);
        }
        
        const books = transformRowsToBooks(rows);
        
        console.log('✅ Transformed books:', books.length);
        if (books.length > 0) {
          console.log('📘 First book sample:', books[0]);
        }
        
        resolve(books);
      } catch (error) {
        console.error('❌ Parse error:', error);
        reject(new Error('Failed to parse Excel file: ' + error.message));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Transform Excel rows to book objects
 */
function transformRowsToBooks(rows) {
  const books = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Get title - try multiple column names
    const title = cleanValue(
      row.Title || row.title || row['Book Title'] || row.name
    );
    
    // Skip rows without title
    if (!title) {
      console.log(`⚠️ Skipping row ${i + 1}: No title`);
      continue;
    }
    
    // Get other fields
    const isbn = cleanValue(
      row.ISBN || row.isbn || row['ISBN Number']
    );
    
    const author = cleanValue(
      row.Author || row.author || row.Authors,
      'Unknown'
    );
    
    const publisher = cleanValue(
      row.Publisher || row.publisher
    );
    
    const edition = cleanValue(
      row.Edition || row.edition
    );
    
    const description = cleanValue(
      row.Description || row.description
    );
    
    // Handle genre - can be comma-separated
    let genres = [];
    const genreStr = cleanValue(row.Genre || row.genre);
    if (genreStr) {
      genres = genreStr.split(',').map(g => g.trim()).filter(Boolean);
    }
    
    // Handle published year
    const publishedYear = safeParseInt(
      row['Published Year'] || 
      row.publishedYear || 
      row.year ||
      row.Year
    );
    
    // Create book object
    const book = {
      isbn: isbn || `TEMP-${Date.now()}-${i}`,
      title: title,
      author: author,
      genre: genres,
      publisher: publisher,
      publishedYear: publishedYear,
      edition: edition,
      description: description,
      physicalId: null,
      totalCopies: 1,
      rentalStatus: 'AVAILABLE'
    };
    
    books.push(book);
  }
  
  return books;
}

/**
 * Auto-detect file type and parse
 */
export function parseFileToBooks(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
    case 'xlsm':
      return parseExcelToBooks(file);
    
    default:
      return Promise.reject(new Error(`Unsupported file type: .${extension}`));
  }
}