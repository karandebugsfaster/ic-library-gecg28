// src/components/manager/PendingRequestsSection.js

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PendingRequestsSection({ managerId, onUpdate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests/pending');
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this request?')) return;

    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Request approved successfully');
        fetchRequests();
        if (onUpdate) onUpdate();
      } else {
        alert(data.error || 'Failed to approve request');
      }
    } catch (error) {
      alert('❌ Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    const notes = prompt('Enter rejection reason (optional):');
    if (notes === null) return;

    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId, notes }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Request rejected successfully');
        fetchRequests();
        if (onUpdate) onUpdate();
      } else {
        alert(data.error || 'Failed to reject request');
      }
    } catch (error) {
      alert('❌ Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg text-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">All Clear!</h3>
        <p className="text-slate-600 text-sm sm:text-base">No pending requests at the moment</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Pending Approval Requests
        </h2>
        <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold w-fit">
          {requests.length} Pending
        </span>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {requests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="border-2 border-slate-200 rounded-xl p-4 sm:p-5 hover:border-blue-400 hover:shadow-md transition-all"
            >
              {/* Top Section */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      request.type === 'issue'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {request.type === 'issue' ? '📖 ISSUE REQUEST' : '↩️ RETURN REQUEST'}
                  </span>

                  <span className="text-xs text-slate-500 font-medium break-all">
                    {new Date(request.requestedAt).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-3 break-words">
                    {request.bookSnapshot?.title || 'Unknown Book'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">Student:</span>
                      <div className="text-slate-900 font-semibold break-words">
                        {request.studentSnapshot?.name}
                        <div className="text-slate-600 text-xs">
                          {request.studentSnapshot?.enrollmentNumber}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium">Faculty:</span>
                      <div className="text-slate-900 font-semibold break-words">
                        {request.facultySnapshot?.name}
                        <div className="text-slate-600 text-xs break-all">
                          {request.facultySnapshot?.email}
                        </div>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-medium">Reason:</span>
                        <div className="text-slate-700 italic break-words">
                          {request.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleApprove(request._id)}
                  disabled={processingId === request._id}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {processingId === request._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleReject(request._id)}
                  disabled={processingId === request._id}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}