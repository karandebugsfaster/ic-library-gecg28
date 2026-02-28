// src/components/faculty/ReturnBookModal.js

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReturnBookModal({ isOpen, onClose, facultyId, students, onSuccess }) {
  const [activeRentals, setActiveRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRentals, setLoadingRentals] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchActiveRentals();
    }
  }, [isOpen]);

  const fetchActiveRentals = async () => {
    setLoadingRentals(true);
    try {
      const studentIds = students.map(s => s._id).join(',');
      const res = await fetch(`/api/rentals/active?studentIds=${studentIds}`);
      const data = await res.json();
      if (data.success) {
        setActiveRentals(data.rentals);
      }
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
    } finally {
      setLoadingRentals(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRental) {
      alert('Please select a rental');
      return;
    }

    const rental = activeRentals.find(r => r._id === selectedRental);

    setLoading(true);
    try {
      const res = await fetch('/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: rental.userId._id,
          facultyId,
          bookId: rental.bookId._id,
          type: 'return',
          reason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Book return request sent to manager for approval');
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
    setSelectedRental('');
    setReason('');
    onClose();
  };

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
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-600 to-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Mark Book as Returned
                  </h2>
                  <p className="text-green-100 text-sm">
                    Select the book rental to mark as returned
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
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Active Rentals</h3>

              {loadingRentals ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading rentals...</p>
                </div>
              ) : activeRentals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✓</div>
                  <p className="text-slate-600 text-lg">No active rentals found</p>
                  <p className="text-slate-500 text-sm mt-2">All books have been returned</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {activeRentals.map((rental) => {
                      const dueDate = new Date(rental.dueDate);
                      const now = new Date();
                      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysUntilDue < 0;

                      return (
                        <button
                          key={rental._id}
                          onClick={() => setSelectedRental(rental._id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedRental === rental._id
                              ? 'border-green-600 bg-green-50 shadow-md'
                              : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-slate-900">{rental.bookId.title}</div>
                              <div className="text-sm text-slate-600">{rental.bookId.author}</div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isOverdue
                                  ? 'bg-red-100 text-red-700'
                                  : daysUntilDue <= 1
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {isOverdue
                                ? `${Math.abs(daysUntilDue)} days overdue`
                                : daysUntilDue === 0
                                  ? 'Due today'
                                  : daysUntilDue === 1
                                    ? 'Due tomorrow'
                                    : `${daysUntilDue} days left`}
                            </span>
                          </div>
                          
                          <div className="text-sm text-slate-600">
                            <div>Student: {rental.userId.name} ({rental.userId.enrollmentNumber})</div>
                            <div>Issued: {new Date(rental.issuedAt).toLocaleDateString()}</div>
                            <div>Due: {dueDate.toLocaleDateString()}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedRental && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-green-500 focus:outline-none resize-none"
                        placeholder="Add any notes about the return..."
                      />
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-green-900">
                        <div className="font-semibold mb-1">Approval Required</div>
                        <div>This return request will be sent to the manager for approval. The book status will only be updated after manager approval.</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedRental}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}