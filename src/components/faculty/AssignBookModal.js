// src/components/faculty/AssignBookModal.js

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssignBookModal({ isOpen, onClose, facultyId, students, onSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);

  useEffect(() => {
    if (isOpen && step === 2) {
      fetchBooks();
    }
  }, [isOpen, step]);

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await fetch('/api/books?available=true');
      const data = await res.json();
      if (data.success) {
        setBooks(data.books);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedBook) {
      alert('Please select both student and book');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          facultyId,
          bookId: selectedBook,
          type: 'issue',
          reason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Book issue request sent to manager for approval');
        handleClose();
        if (onSuccess) onSuccess();
      } else {
        alert(data.error || 'Failed to create request');
      }
    } catch (error) {
      alert('❌ Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedStudent('');
    setSelectedBook('');
    setSearchQuery('');
    setReason('');
    onClose();
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Assign Book to Student
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {step === 1 ? 'Step 1: Select Student' : step === 2 ? 'Step 2: Select Book' : 'Step 3: Confirm'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
                <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
                <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Select Student */}
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Select a Student</h3>
                  {students.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-slate-600">No students assigned to you</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student) => (
                        <button
                          key={student._id}
                          onClick={() => setSelectedStudent(student._id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedStudent === student._id
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-sm text-slate-600">{student.enrollmentNumber}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Active Rentals: {student.activeRentals || 0}/3
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Select Book */}
              {step === 2 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Select a Book</h3>

                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search books by title, author, or ISBN..."
                        className="w-full px-4 py-3 pl-11 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                      <svg
                        className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {loadingBooks ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-slate-600">Loading books...</p>
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-slate-600">No available books found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredBooks.map((book) => (
                        <button
                          key={book._id}
                          onClick={() => setSelectedBook(book._id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedBook === book._id
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-semibold text-slate-900">{book.title}</div>
                          <div className="text-sm text-slate-600">{book.author}</div>
                          {book.isbn && (
                            <div className="text-xs text-slate-500 mt-1">ISBN: {book.isbn}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Confirm Assignment</h3>

                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="mb-3">
                      <div className="text-sm text-slate-600 mb-1">Student</div>
                      <div className="font-semibold text-slate-900">
                        {students.find(s => s._id === selectedStudent)?.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {students.find(s => s._id === selectedStudent)?.enrollmentNumber}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-600 mb-1">Book</div>
                      <div className="font-semibold text-slate-900">
                        {books.find(b => b._id === selectedBook)?.title}
                      </div>
                      <div className="text-sm text-slate-600">
                        {books.find(b => b._id === selectedBook)?.author}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reason (Optional)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                      placeholder="Add any additional notes..."
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-900">
                        <div className="font-semibold mb-1">Approval Required</div>
                        <div>This request will be sent to the manager for approval. The book will only be issued after manager approval.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                  >
                    Back
                  </button>
                )}
                
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>

                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={(step === 1 && !selectedStudent) || (step === 2 && !selectedBook)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}