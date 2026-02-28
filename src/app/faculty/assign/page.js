// src/app/faculty/assign/page.js

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function FacultyAssignPage() {
  const { data: session, status } = useSession(); // Add status here
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    enrollmentNumber: "",
    bookId: "",
    rentalDays: 7,
    reason: "",
  });

  const [bookSearch, setBookSearch] = useState("");

  useEffect(() => {
    if (status === 'loading') return; // Don't do anything while loading
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session?.user?.role !== 'faculty') {
      router.push('/unauthorized');
      return;
    }
    
    fetchBooks();
  }, [session, status, router]);

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books?limit=1000");
      const data = await res.json();
      if (data.success && Array.isArray(data.data.books)) {
        const available = data.data.books.filter(
          (b) => b.rentalStatus === "AVAILABLE",
        );
        setBooks(available);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.enrollmentNumber || !formData.bookId) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/faculty/assign-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          facultyId: session.user.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          `✅ Success!\n\nBook assignment request sent to manager for approval.\n\nStudent: ${data.data.student}\nBook: ${data.data.book}\n\nThe book will be assigned once the manager approves.`,
        );
        setFormData({
          enrollmentNumber: "",
          bookId: "",
          rentalDays: 7,
          reason: "",
        });
        setBookSearch("");
      } else {
        alert(`❌ Error\n\n${data.error}`);
      }
    } catch (error) {
      alert("❌ Failed to create assignment request");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBooks = (books || []).filter(
    (book) =>
      book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(bookSearch.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Assign Book to Student
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Request will be sent to manager for approval
            </p>
          </div>
          <button
            onClick={() => router.push("/faculty/dashboard")}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-all text-sm sm:text-base w-full sm:w-auto"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Enrollment Number */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Student Enrollment Number *
              </label>
              <input
                type="text"
                required
                value={formData.enrollmentNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enrollmentNumber: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., 2417001123"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base uppercase text-black"
              />
              <p className="text-xs text-slate-500 mt-2">
                Student must be registered in the system and assigned to you
              </p>
            </div>

            {/* Book Search */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Search for Book
              </label>
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base text-black"
              />
            </div>

            {/* Book Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Select Book * ({filteredBooks.length} available)
              </label>

              {filteredBooks.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-amber-800">No available books found</p>
                </div>
              ) : (
                <select
                  required
                  value={formData.bookId}
                  onChange={(e) =>
                    setFormData({ ...formData, bookId: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base text-black"
                >
                  <option value="">-- Select a book --</option>
                  {filteredBooks.map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title} - {book.author}{" "}
                      {book.isbn && `(${book.isbn})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Rental Duration */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Rental Duration (days) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="30"
                value={formData.rentalDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rentalDays: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base text-black"
              />
              <p className="text-xs text-slate-500 mt-2">Default: 7 days</p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Reason (Optional)
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-sm sm:text-base text-black"
                placeholder="Add any notes about this assignment..."
              />
            </div>

            {/* Alert */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-bold mb-1">Manager Approval Required</p>
                  <p>
                    This assignment request will be sent to the manager. The
                    book will only be issued to the student after the manager
                    approves your request.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm sm:text-base"
            >
              {submitting
                ? "Submitting Request..."
                : "Submit Assignment Request"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
