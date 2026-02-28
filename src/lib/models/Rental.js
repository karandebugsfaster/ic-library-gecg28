// src/lib/models/Rental.js

import mongoose from 'mongoose';

const RentalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true,
  },

  issuedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  dueDate: {
    type: Date,
    required: true,
    index: true,
  },

  actualReturnedAt: {
    type: Date,
    default: null,
  },

  status: {
    type: String,
    enum: ['ACTIVE', 'RETURNED', 'OVERDUE', 'RETURN_CONFIRMED_BY_USER', 'AUTO_RETURNED', 'UNDER_INVESTIGATION', 'LOST_PENALTY_APPLIED'],
    default: 'ACTIVE',
    index: true,
  },

  // Denormalized snapshots for historical accuracy
  userSnapshot: {
    enrollmentNumber: String,
    email: String,
  },

  bookSnapshot: {
    title: String,
    isbn: String,
    author: String,
  },

  // Renewal tracking
  renewalCount: {
    type: Number,
    default: 0,
  },

  lastRenewedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound indexes
RentalSchema.index({ userId: 1, status: 1 });
RentalSchema.index({ status: 1, dueDate: 1 });
RentalSchema.index({ bookId: 1, status: 1 });

// Virtual for checking if overdue
RentalSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'ACTIVE') return false;
  return this.dueDate < new Date();
});

// Virtual for days until due
RentalSchema.virtual('daysUntilDue').get(function() {
  if (this.status !== 'ACTIVE') return null;
  const days = Math.ceil((this.dueDate - new Date()) / (1000 * 60 * 60 * 24));
  return days;
});

export default mongoose.models.Rental || mongoose.model('Rental', RentalSchema);