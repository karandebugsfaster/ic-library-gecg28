// src/lib/models/Book.js

import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  // Book Identity
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },

  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },

  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },

  genre: [{
    type: String,
    trim: true
  }],

  publisher: {
    type: String,
    trim: true
  },

  publishedYear: {
    type: Number
  },

  edition: {
    type: String,
    trim: true
  },

  description: {
    type: String,
    maxLength: 1000
  },

  // Library Management
  physicalId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
    trim: true
  },

  totalCopies: {
    type: Number,
    default: 1,
    min: 1
  },

  // Rental Status
  rentalStatus: {
    type: String,
    enum: ['AVAILABLE', 'RENTED', 'UNDER_INVESTIGATION', 'LOST'],
    default: 'AVAILABLE'
  },

  currentRental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    default: null
  },

  // Search Optimization (denormalized)
  searchText: {
    type: String,
    lowercase: true
  },

  // Analytics
  totalRentals: {
    type: Number,
    default: 0
  },

  lastRentedAt: {
    type: Date,
    default: null
  },

  // Cover image URL (optional)
  coverImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for fast search
BookSchema.index({ rentalStatus: 1 });
BookSchema.index({ isbn: 1 });
BookSchema.index({ genre: 1 });
BookSchema.index({ searchText: 'text' }); // Full-text search index

// Pre-save middleware to generate searchText
// ✅ BEST (No async needed for simple operations)
BookSchema.pre('save', function() {
  this.searchText = `${this.title} ${this.author} ${this.isbn}`.toLowerCase();
});

// Virtual for availability
BookSchema.virtual('isAvailable').get(function() {
  return this.rentalStatus === 'AVAILABLE';
});

// Static method for fast search
BookSchema.statics.searchBooks = async function(query, filters = {}) {
  const searchFilter = {};

  // Text search
  if (query) {
    searchFilter.$text = { $search: query };
  }

  // Genre filter
  if (filters.genre) {
    searchFilter.genre = filters.genre;
  }

  // Availability filter
  if (filters.available === true || filters.available === 'true') {
    searchFilter.rentalStatus = 'AVAILABLE';
  }

  const books = await this.find(searchFilter)
    .select('title author genre rentalStatus isbn publishedYear coverImage')
    .limit(50)
    .lean();

  return books;
};

export default mongoose.models.Book || mongoose.model('Book', BookSchema);