// src/components/manager/ActiveMembersModal.js

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActiveMembersModal({ isOpen, onClose, managerId, onUpdate }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) fetchStudents();
  }, [isOpen]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/students');
      const data = await res.json();
      if (data.success) setStudents(data.students);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!confirm('⚠️ Are you sure you want to delete this student?')) return;

    setDeletingId(studentId);
    try {
      const res = await fetch(`/api/users/${studentId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Student deleted successfully');
        fetchStudents();
        if (onUpdate) onUpdate();
      } else {
        alert(data.error || 'Failed to delete student');
      }
    } catch (error) {
      alert('❌ Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.enrollmentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Active Students
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    Manage student accounts and permissions
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, enrollment, or email..."
                    className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 bg-white/90 rounded-xl text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Count */}
            <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-slate-600">
                Showing <span className="font-bold text-slate-900">{filteredStudents.length}</span> of{' '}
                <span className="font-bold text-slate-900">{students.length}</span> students
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold w-fit">
                {students.filter(s => s.status === 'active').length} Active
              </span>
            </div>

            {/* Students */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    No students found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStudents.map((student) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          
                          {/* Student Info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                {student.name}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  student.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {student.status}
                              </span>
                            </div>

                            {/* Responsive grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                              <div>
                                <span className="text-slate-500">Enrollment:</span>{' '}
                                <span className="font-semibold text-slate-900 break-words">
                                  {student.enrollmentNumber}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Email:</span>{' '}
                                <span className="text-slate-700 break-words">
                                  {student.email}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Faculty:</span>{' '}
                                <span className="text-slate-700">
                                  {student.assignedFaculty?.name || 'Not assigned'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Phone:</span>{' '}
                                <span className="text-slate-700">
                                  {student.phone || 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <div className="bg-blue-50 rounded-lg px-3 py-1 text-xs font-bold text-blue-600">
                                Active: {student.activeRentals || 0}
                              </div>
                              <div className="bg-green-50 rounded-lg px-3 py-1 text-xs font-bold text-green-600">
                                Total: {student.totalRentals || 0}
                              </div>
                              {student.overdueCount > 0 && (
                                <div className="bg-red-50 rounded-lg px-3 py-1 text-xs font-bold text-red-600">
                                  Overdue: {student.overdueCount}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(student._id)}
                            disabled={deletingId === student._id}
                            className="w-full lg:w-auto px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-all"
                          >
                            {deletingId === student._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}