// src/lib/models/User.js - WITH UNIQUE CONSTRAINTS

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true, // ✅ ENSURE UNIQUE
    uppercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // ✅ ENSURE UNIQUE
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
    // Note: Phone is not unique - multiple users might share a family number
  },
  role: {
    type: String,
    enum: ['student', 'manager'],
    default: 'student'
  },
  activeRentals: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRentals: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
UserSchema.index({ enrollmentNumber: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Virtual property to check rental eligibility
UserSchema.methods.checkRentalEligibility = function() {
  const MAX_ACTIVE_RENTALS = 3;
  
  if (this.activeRentals >= MAX_ACTIVE_RENTALS) {
    return {
      canRent: false,
      reason: `You have reached the maximum limit of ${MAX_ACTIVE_RENTALS} active rentals`
    };
  }
  
  return { canRent: true };
};

export default mongoose.models.User || mongoose.model('User', UserSchema);