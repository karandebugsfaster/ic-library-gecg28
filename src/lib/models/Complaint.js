// src/lib/models/Complaint.js

import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },

  suspectedRentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    default: null
  },

  type: {
    type: String,
    enum: [
      'BOOK_NOT_ON_SHELF',
      'BOOK_DAMAGED',
      'WRONG_BOOK_ON_SHELF'
    ],
    required: true
  },

  status: {
    type: String,
    enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_REPORT'],
    default: 'OPEN'
  },

  resolvedAt: {
    type: Date,
    default: null
  },

  resolution: {
    type: String,
    default: null
  },

  actionTaken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ bookId: 1 });

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);