// src/lib/models/Rental.js

import mongoose from "mongoose";

const RentalSchema = new mongoose.Schema(
  {
    // References
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    // Rental Lifecycle
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "RETURN_CONFIRMED_BY_USER",
        "MANUALLY_RETURNED",
        "OVERDUE",
        "UNDER_INVESTIGATION",
        "LOST_PENALTY_APPLIED",
      ],
      default: "ACTIVE",
    },

    // Return Process
    returnRequestedAt: {
      type: Date,
      default: null,
    },

    userConfirmedReturnAt: {
      type: Date,
      default: null,
    },

    gracePeriodEndsAt: {
      type: Date,
      default: null,
    },

    actualReturnedAt: {
      type: Date,
      default: null,
    },

    // Confirmation Method
    confirmationMethod: {
      type: String,
      enum: ["EMAIL_YES", "APP_YES", "MANUAL"],
      default: null,
    },

    // Analytics
    overdueBy: {
      type: Number,
      default: 0,
    },

    penaltyApplied: {
      type: Boolean,
      default: false,
    },

    // Snapshot (denormalized for historical accuracy)
    userSnapshot: {
      enrollmentNumber: String,
      email: String,
    },

    bookSnapshot: {
      title: String,
      isbn: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
RentalSchema.index({ userId: 1, status: 1 });
RentalSchema.index({ bookId: 1, status: 1 });
RentalSchema.index({ status: 1, dueDate: 1 }); // For cron jobs
RentalSchema.index({ createdAt: -1 }); // Recent rentals

// Virtual for checking if overdue
RentalSchema.virtual("isOverdue").get(function () {
  if (this.status !== "ACTIVE") return false;
  // Compare with today's midnight in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.dueDate < today;
});

// Virtual for days until due
RentalSchema.virtual("daysUntilDue").get(function () {
  // Get today's date at midnight in local timezone
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Convert dueDate to midnight in local timezone
  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diff = dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

export default mongoose.models.Rental || mongoose.model("Rental", RentalSchema);
