// src/lib/models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Identity
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },

  enrollmentNumber: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
    uppercase: true,
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
  },

  phone: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
  },

  // Role Management
  role: {
    type: String,
    enum: ['manager', 'faculty', 'student'],
    required: true,
    default: 'student',
    index: true,
  },

  // Faculty Assignment (for students only)
  assignedFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    validate: {
      validator: function(value) {
        return this.role !== 'student' || value !== null;
      },
      message: 'Students must be assigned to a faculty',
    },
  },

  // Account Status
  status: {
    type: String,
    enum: ['active', 'deleted', 'suspended'],
    default: 'active',
    index: true,
  },

  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'BLOCKED', 'PENALTY'],
    default: 'ACTIVE',
  },

  // Session Management
  sessionInvalidatedAt: {
    type: Date,
    default: null,
  },

  // Penalty Management
  penaltyUntil: {
    type: Date,
    default: null,
  },

  penaltyReason: {
    type: String,
    default: null,
  },

  totalPenalties: {
    type: Number,
    default: 0,
  },

  // Statistics
  totalRentals: {
    type: Number,
    default: 0,
  },

  activeRentals: {
    type: Number,
    default: 0,
  },

  overdueCount: {
    type: Number,
    default: 0,
  },

  // Compliance
  agreedToTerms: {
    type: Boolean,
    default: false,
  },

  termsAgreedAt: {
    type: Date,
    default: null,
  },

  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
// UserSchema.index({ enrollmentNumber: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ accountStatus: 1 });
UserSchema.index({ role: 1, status: 1 });

// Ensure only one manager exists
UserSchema.pre('save', async function () {
  if (this.role === 'manager' && this.isNew) {
    const managerCount = await mongoose.model('User').countDocuments({
      role: 'manager',
      status: 'active'
    });

    if (managerCount > 0) {
      throw new Error('Only one manager can exist in the system');
    }
  }
});

// Virtual for checking if penalty is active
UserSchema.virtual('isPenaltyActive').get(function() {
  if (!this.penaltyUntil) return false;
  return this.penaltyUntil > new Date();
});

// Virtual for checking if can rent
UserSchema.virtual('canRent').get(function() {
  if (this.role !== 'student') return false;
  if (this.status !== 'active') return false;
  if (this.accountStatus === 'BLOCKED') return false;
  if (this.accountStatus === 'PENALTY' && this.isPenaltyActive) return false;
  if (this.activeRentals >= 3) return false;
  return true;
});

// Method to check rental eligibility
UserSchema.methods.checkRentalEligibility = function() {
  if (this.role !== 'student') {
    return {
      canRent: false,
      reason: 'Only students can rent books',
    };
  }

  if (this.status !== 'active') {
    return {
      canRent: false,
      reason: 'Your account is inactive',
    };
  }

  if (this.accountStatus === 'BLOCKED') {
    return {
      canRent: false,
      reason: 'Your account is blocked due to violations',
    };
  }

  if (this.accountStatus === 'PENALTY' && this.isPenaltyActive) {
    return {
      canRent: false,
      reason: `Your account is under penalty until ${this.penaltyUntil.toDateString()}`,
    };
  }

  if (this.activeRentals >= 3) {
    return {
      canRent: false,
      reason: 'Maximum 3 active rentals allowed. Please return a book first.',
    };
  }

  return {
    canRent: true,
    reason: null,
  };
};

// Method to invalidate session
UserSchema.methods.invalidateSession = function() {
  this.sessionInvalidatedAt = new Date();
  return this.save();
};

export default mongoose.models.User || mongoose.model('User', UserSchema);