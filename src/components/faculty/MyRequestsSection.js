// src/components/faculty/MyRequestsSection.js

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MyRequestsSection({ facultyId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchRequests();
  }, [facultyId]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/requests/faculty/${facultyId}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Requests</h2>
        
        {/* Filter Tabs */}
<div className="ml-4 flex-1 sm:flex-none">
  <div className="flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
    {['all', 'pending', 'approved', 'rejected'].map((f) => (
      <button
        key={f}
        onClick={() => setFilter(f)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
          filter === f
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {f.charAt(0).toUpperCase() + f.slice(1)}
        {f !== 'all' && (
          <span className="ml-2">
            ({requests.filter(r => r.status === f).length})
          </span>
        )}
      </button>
    ))}
  </div>
</div>
      </div>


      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-slate-600 text-lg">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="border-2 border-slate-200 rounded-xl p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        request.type === 'issue'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {request.type === 'issue' ? 'ISSUE' : 'RETURN'}
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        request.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : request.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-lg mb-2">
                    {request.bookSnapshot?.title}
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Student:</span>{' '}
                      <span className="font-semibold text-slate-900">
                        {request.studentSnapshot?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Requested:</span>{' '}
                      <span className="text-slate-700">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {request.approvedAt && (
                      <div>
                        <span className="text-slate-500">Processed:</span>{' '}
                        <span className="text-slate-700">
                          {new Date(request.approvedAt || request.rejectedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {request.managerNotes && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Manager Notes:</span>{' '}
                        <span className="text-slate-700 italic">{request.managerNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}