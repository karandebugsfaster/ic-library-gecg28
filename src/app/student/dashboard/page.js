// src/app/student/dashboard/page.js

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { data: session, status } = useSession(); // Add status here
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (status === 'loading') return; // Don't do anything while loading
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session?.user?.role !== 'student') {
      router.push('/unauthorized');
      return;
    }
    
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-sm sm:text-base">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const { user, activeRentals, rentalHistory, overdueRentals } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">My Profile</h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/')}
                className="px-3 sm:px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all text-xs sm:text-sm"
              >
                ← Library
              </button>

              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all text-xs sm:text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-1">ℹ️ Note</p>
              <p>You can only view your rentals here. To rent or return books, please contact your assigned faculty member.</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase() || user.enrollmentNumber.substring(10, 12)}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{user.name}</h2>
              <p className="text-slate-600 mb-1">{user.enrollmentNumber}</p>
              <p className="text-slate-600 mb-1">{user.email}</p>
              <p className="text-slate-600">{user.phone}</p>
              {user.assignedFaculty && (
                <p className="text-sm text-slate-500 mt-2">
                  Faculty: <span className="font-semibold">{user.assignedFaculty.name}</span>
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex sm:flex-col gap-4 sm:gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center min-w-[80px]">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{user.activeRentals || 0}</div>
                <div className="text-xs text-slate-600 mt-1">Active</div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 text-center min-w-[80px]">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{user.totalRentals || 0}</div>
                <div className="text-xs text-slate-600 mt-1">Total</div>
              </div>

              <div className="bg-red-50 rounded-xl p-4 text-center min-w-[80px]">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{overdueRentals?.length || 0}</div>
                <div className="text-xs text-slate-600 mt-1">Overdue</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Status Warnings */}
        {user.accountStatus !== 'ACTIVE' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-red-900">
                <p className="font-bold mb-1">⚠️ Account Status: {user.accountStatus}</p>
                {user.penaltyUntil && (
                  <p>Penalty until: {new Date(user.penaltyUntil).toLocaleDateString('en-GB')}</p>
                )}
                {user.penaltyReason && <p>Reason: {user.penaltyReason}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Overdue Alert */}
        {overdueRentals?.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
              <span>🚨</span>
              Overdue Books ({overdueRentals.length})
            </h3>
            <p className="text-red-800 mb-4 text-sm sm:text-base">
              Please return these books to your faculty immediately
            </p>
            <div className="space-y-2">
              {overdueRentals.map((rental) => (
                <div
                  key={rental._id}
                  className="bg-white rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <strong className="text-slate-900 text-sm sm:text-base">{rental.bookSnapshot.title}</strong>
                  <span className="text-xs sm:text-sm text-red-600 font-medium">
                    Due: {new Date(rental.dueDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-medium text-sm sm:text-base whitespace-nowrap transition-all ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Rentals ({activeRentals?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-medium text-sm sm:text-base whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            History ({rentalHistory?.length || 0})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'active' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {!activeRentals || activeRentals.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-slate-600 text-lg mb-2">No active rentals</p>
                <p className="text-slate-500 text-sm">Contact your faculty to rent books</p>
              </div>
            ) : (
              activeRentals.map((rental) => {
                const daysRemaining = getDaysRemaining(rental.dueDate);
                const isOverdue = daysRemaining < 0;
                const isDueSoon = daysRemaining <= 2 && daysRemaining >= 0;

                return (
                  <motion.div
                    key={rental._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all ${
                      isOverdue ? 'border-2 border-red-500' : isDueSoon ? 'border-2 border-amber-500' : ''
                    }`}
                  >
                    {/* Book Cover */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-48 flex items-center justify-center">
                      <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>

                    {/* Book Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{rental.bookSnapshot.title}</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        {rental.bookId?.author || 'Unknown Author'}
                      </p>

                      <div className="space-y-2 text-xs text-slate-600 mb-4">
                        <div className="flex justify-between">
                          <span>Issued:</span>
                          <span className="font-medium">{new Date(rental.issuedAt).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due:</span>
                          <span className="font-medium">{new Date(rental.dueDate).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>

                      <div
                        className={`px-3 py-2 rounded-lg text-center text-sm font-bold ${
                          isOverdue
                            ? 'bg-red-100 text-red-700'
                            : isDueSoon
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isOverdue
                          ? `⚠️ ${Math.abs(daysRemaining)} days overdue`
                          : isDueSoon
                            ? `⏰ Due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
                            : `✓ ${daysRemaining} days remaining`}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {!rentalHistory || rentalHistory.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-slate-600 text-lg">No rental history</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {rentalHistory.map((rental) => (
                  <div key={rental._id} className="p-4 hover:bg-slate-50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{rental.bookSnapshot.title}</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          {new Date(rental.issuedAt).toLocaleDateString('en-GB')} →{' '}
                          {rental.actualReturnedAt
                            ? new Date(rental.actualReturnedAt).toLocaleDateString('en-GB')
                            : 'Not returned'}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold self-start sm:self-center">
                        ✓ Returned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}