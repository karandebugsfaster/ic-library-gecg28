// src/lib/models/Rental.js

import mongoose from 'mongoose';

const RentalSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },

  // Rental Lifecycle
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now
  },

  dueDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: [
      'ACTIVE',
      'RETURN_CONFIRMED_BY_USER',
      'AUTO_RETURNED',
      'MANUALLY_RETURNED',
      'OVERDUE',
      'UNDER_INVESTIGATION',
      'LOST_PENALTY_APPLIED'
    ],
    default: 'ACTIVE'
  },

  // Return Process
  returnRequestedAt: {
    type: Date,
    default: null
  },

  userConfirmedReturnAt: {
    type: Date,
    default: null
  },

  gracePeriodEndsAt: {
    type: Date,
    default: null
  },

  actualReturnedAt: {
    type: Date,
    default: null
  },

  // Confirmation Method
  confirmationMethod: {
    type: String,
    enum: ['EMAIL_YES', 'APP_YES', 'MANUAL'],
    default: null
  },

  // Analytics
  overdueBy: {
    type: Number,
    default: 0
  },

  penaltyApplied: {
    type: Boolean,
    default: false
  },

  // Snapshot (denormalized for historical accuracy)
  userSnapshot: {
    enrollmentNumber: String,
    email: String
  },

  bookSnapshot: {
    title: String,
    isbn: String
  }
}, {
  timestamps: true
});

// Indexes
RentalSchema.index({ userId: 1, status: 1 });
RentalSchema.index({ bookId: 1, status: 1 });
RentalSchema.index({ status: 1, dueDate: 1 }); // For cron jobs
RentalSchema.index({ createdAt: -1 }); // Recent rentals

// Virtual for checking if overdue
RentalSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'ACTIVE') return false;
  return this.dueDate < new Date();
});

// Virtual for days until due
RentalSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const diff = this.dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

export default mongoose.models.Rental || mongoose.model('Rental', RentalSchema);