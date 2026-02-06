// src/lib/models/Notification.js

import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    default: null
  },

  type: {
    type: String,
    enum: [
      'RENTAL_CONFIRMATION',
      'DUE_REMINDER',
      'RETURN_REQUEST',
      'OVERDUE_WARNING',
      'PENALTY_NOTICE',
      'COMPLAINT_FILED'
    ],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  actionRequired: {
    type: Boolean,
    default: false
  },

  actions: [{
    label: String,
    value: String
  }],

  // Response
  respondedAt: {
    type: Date,
    default: null
  },

  response: {
    type: String,
    default: null
  },

  // Delivery Status
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'READ', 'RESPONDED'],
    default: 'PENDING'
  },

  sentAt: {
    type: Date,
    default: null
  },

  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);