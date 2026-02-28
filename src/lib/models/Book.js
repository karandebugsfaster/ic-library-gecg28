// src/lib/models/Book.js

import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  // Book Identity
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },

  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },

  author: {
    type: String,
    default: 'Unknown',
    trim: true,
  },

  genre: [{
    type: String,
    trim: true,
  }],

  publisher: {
    type: String,
    trim: true,
    default: '',
  },

  publishedYear: {
    type: Number,
    default: null,
  },

  edition: {
    type: String,
    trim: true,
    default: '',
  },

  description: {
    type: String,
    maxLength: 2000,
    default: '',
  },

  // Library Management
  physicalId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },

  totalCopies: {
    type: Number,
    default: 1,
    min: 1,
  },

  // Rental Status
  rentalStatus: {
    type: String,
    enum: ['AVAILABLE', 'RENTED', 'UNDER_INVESTIGATION', 'LOST'],
    default: 'AVAILABLE',
    index: true,
  },

  currentRental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    default: null,
  },

  // Current holder (for tracking)
  currentHolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Search Optimization
  searchText: {
    type: String,
    lowercase: true,
  },

  // Analytics
  totalRentals: {
    type: Number,
    default: 0,
  },

  lastRentedAt: {
    type: Date,
    default: null,
  },

  coverImage: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
BookSchema.index({ rentalStatus: 1 });
BookSchema.index({ isbn: 1 }, { sparse: true });
BookSchema.index({ genre: 1 });
BookSchema.index({ searchText: 'text' });

// Pre-save: Generate searchText
BookSchema.pre('save', function(next) {
  this.searchText = `${this.title} ${this.author} ${this.isbn || ''}`.toLowerCase();
  next();
});

// Virtual for availability
BookSchema.virtual('isAvailable').get(function() {
  return this.rentalStatus === 'AVAILABLE';
});

// Static method for search
BookSchema.statics.searchBooks = async function(query, filters = {}) {
  const searchFilter = {};

  if (query) {
    searchFilter.$text = { $search: query };
  }

  if (filters.genre) {
    searchFilter.genre = filters.genre;
  }

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