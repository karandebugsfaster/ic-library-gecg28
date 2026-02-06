// src/lib/models/User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // Identity
    enrollmentNumber: {
      type: String,
      required: [true, "Enrollment number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^\d{12}$/, "Invalid enrollment number format"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    // Account Status
    accountStatus: {
      type: String,
      enum: ["ACTIVE", "BLOCKED", "PENALTY"],
      default: "ACTIVE",
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Virtual for checking if penalty is active
UserSchema.virtual("isPenaltyActive").get(function () {
  if (!this.penaltyUntil) return false;
  return this.penaltyUntil > new Date();
});

// Virtual for checking if can rent
UserSchema.virtual("canRent").get(function () {
  if (this.accountStatus === "BLOCKED") return false;
  if (this.accountStatus === "PENALTY" && this.isPenaltyActive) return false;
  if (this.activeRentals >= 3) return false; // Max 3 active rentals
  return true;
});

// Method to check eligibility with detailed reason
UserSchema.methods.checkRentalEligibility = function () {
  if (this.accountStatus === "BLOCKED") {
    return {
      canRent: false,
      reason: "Your account is blocked due to violations",
    };
  }

  if (this.accountStatus === "PENALTY" && this.isPenaltyActive) {
    return {
      canRent: false,
      reason: `Your account is under penalty until ${this.penaltyUntil.toDateString()}`,
    };
  }

  if (this.activeRentals >= 3) {
    return {
      canRent: false,
      reason: "Maximum 3 active rentals allowed. Please return a book first.",
    };
  }

  return {
    canRent: true,
    reason: null,
  };
};

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model("User", UserSchema);
