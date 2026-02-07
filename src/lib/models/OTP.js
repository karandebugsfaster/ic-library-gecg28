// src/lib/models/OTP.js - Store OTPs in MongoDB

import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  enrollmentNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  otpHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Auto-delete expired OTPs
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for cleanup
OTPSchema.index({ expiresAt: 1 });

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);