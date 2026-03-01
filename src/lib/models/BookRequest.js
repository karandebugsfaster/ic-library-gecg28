// src/lib/models/BookRequest.js

import mongoose from "mongoose";

const BookRequestSchema = new mongoose.Schema(
  {
    // References
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    // Request Type
    type: {
      type: String,
      enum: ["issue", "return"],
      required: true,
    },

    // Request Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // Timestamps
    requestedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    // Approved/Rejected By
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Rental Duration (in days)
    rentalDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 30,
    },

    // Additional Info
    reason: {
      type: String,
      default: null,
    },

    managerNotes: {
      type: String,
      default: null,
    },

    // Snapshots for historical accuracy
    studentSnapshot: {
      name: String,
      email: String,
      enrollmentNumber: String,
    },

    facultySnapshot: {
      name: String,
      email: String,
    },

    bookSnapshot: {
      title: String,
      isbn: String,
      author: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
BookRequestSchema.index({ status: 1, requestedAt: -1 });
BookRequestSchema.index({ facultyId: 1, status: 1 });
BookRequestSchema.index({ studentId: 1, status: 1 });
BookRequestSchema.index({ type: 1, status: 1 });

// Pre-save middleware to populate snapshots
BookRequestSchema.pre("save", async function () {
  if (this.isNew) {
    try {
      const User = mongoose.model("User");
      const Book = mongoose.model("Book");

      const [student, faculty, book] = await Promise.all([
        User.findById(this.studentId).select("name email enrollmentNumber"),
        User.findById(this.facultyId).select("name email"),
        Book.findById(this.bookId).select("title isbn author"),
      ]);

      if (student) {
        this.studentSnapshot = {
          name: student.name,
          email: student.email,
          enrollmentNumber: student.enrollmentNumber,
        };
      }

      if (faculty) {
        this.facultySnapshot = {
          name: faculty.name,
          email: faculty.email,
        };
      }

      if (book) {
        this.bookSnapshot = {
          title: book.title,
          isbn: book.isbn,
          author: book.author,
        };
      }
    } catch (error) {
      console.error("Error populating snapshots:", error);
      throw error; // 🔥 important if you want it to fail properly
    }
  }
});

export default mongoose.models.BookRequest ||
  mongoose.model("BookRequest", BookRequestSchema);
