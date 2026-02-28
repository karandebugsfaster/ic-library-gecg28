// src/app/faculty/return/page.js

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function FacultyReturnPage() {
  const { data: session, status } = useSession(); // Add status here
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rentalId: '',
    reason: '',
  });

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
    
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const studentsRes = await fetch(`/api/users/students?facultyId=${session.user.id}`);
      const studentsData = await studentsRes.json();

      if (studentsData.success) {
        setStudents(studentsData.students);

        const studentIds = studentsData.students.map((s) => s._id).join(',');
        const rentalsRes = await fetch(`/api/rentals/active?studentIds=${studentIds}`);
        const rentalsData = await rentalsRes.json();

        if (rentalsData.success) {
          setActiveRentals(rentalsData.rentals);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rentalId) {
      alert('Please select a rental');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/faculty/return-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          facultyId: session.user.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          '✅ Success!\n\nBook return request sent to manager for approval.\n\nThe book will be marked as returned once the manager approves.'
        );
        setFormData({ rentalId: '', reason: '' });
        fetchData();
      } else {
        alert(`❌ Error\n\n${data.error}`);
      }
    } catch (error) {
      alert('❌ Failed to create return request');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRental = activeRentals.find((r) => r._id === formData.rentalId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mark Book as Returned</h1>
            <p className="text-slate-600 text-sm mt-1">Request will be sent to manager for approval</p>
          </div>
          <button
            onClick={() => router.push('/faculty/dashboard')}
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
            {/* Active Rentals */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Select Active Rental *
              </label>

              {activeRentals.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">✓</div>
                  <p className="text-green-800 font-medium">No active rentals</p>
                  <p className="text-green-700 text-sm mt-1">All books have been returned</p>
                </div>
              ) : (
                <select
                  required
                  value={formData.rentalId}
                  onChange={(e) => setFormData({ ...formData, rentalId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-green-500 focus:outline-none text-sm sm:text-base text-black"
                >
                  <option value="">-- Select a rental --</option>
                  {activeRentals.map((rental) => {
                    const dueDate = new Date(rental.dueDate);
                    const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntilDue < 0;

                    return (
                      <option key={rental._id} value={rental._id}>
                        {rental.bookId.title} - {rental.userId.name} ({rental.userId.enrollmentNumber}) -
                        {isOverdue ? ` ${Math.abs(daysUntilDue)} days overdue` : ` ${daysUntilDue} days left`}
                      </option>
                    );
                  })}
                </select>
              )}

              {selectedRental && (
                <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200 text-sm">
                  <p className="font-bold text-slate-900 mb-2">{selectedRental.bookId.title}</p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Student:</span> {selectedRental.userId.name} (
                    {selectedRental.userId.enrollmentNumber})
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Issued:</span>{' '}
                    {new Date(selectedRental.issuedAt).toLocaleDateString()}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Due:</span>{' '}
                    {new Date(selectedRental.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Notes (Optional)</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-green-500 focus:outline-none resize-none text-sm sm:text-base text-black"
                placeholder="Add any notes about the return..."
              />
            </div>

            {/* Alert */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
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
                <div className="text-sm text-green-900">
                  <p className="font-bold mb-1">Manager Approval Required</p>
                  <p>
                    This return request will be sent to the manager. The book status will only be updated after
                    the manager approves your request.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !formData.rentalId || activeRentals.length === 0}
              className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm sm:text-base"
            >
              {submitting ? 'Submitting Request...' : 'Submit Return Request'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}