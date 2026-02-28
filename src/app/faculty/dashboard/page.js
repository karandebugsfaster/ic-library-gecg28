// src/app/faculty/dashboard/page.js

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MyRequestsSection from '@/components/faculty/MyRequestsSection';

export default function FacultyDashboard() {
  const { data: session, status } = useSession(); // Add status here
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!session?.user?.id) return;

    try {
      const [statsRes, studentsRes] = await Promise.all([
        fetch(`/api/stats/dashboard?role=faculty&userId=${session.user.id}`),
        fetch(`/api/users/students?facultyId=${session.user.id}`),
      ]);

      const [statsData, studentsData] = await Promise.all([
        statsRes.json(),
        studentsRes.json(),
      ]);

      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (studentsData.success) {
        setStudents(studentsData.students);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut({ callbackUrl: '/login' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Faculty Dashboard</h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">Welcome, {session?.user?.name}</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push('/')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Library</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl"
          >
            <div className="text-3xl sm:text-4xl mb-2">👥</div>
            <div className="text-2xl sm:text-4xl font-bold">{stats?.assignedStudents || 0}</div>
            <div className="text-blue-200 text-xs sm:text-sm font-medium mt-1">Students</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl"
          >
            <div className="text-3xl sm:text-4xl mb-2">✅</div>
            <div className="text-2xl sm:text-4xl font-bold">{stats?.approvedRequests || 0}</div>
            <div className="text-green-200 text-xs sm:text-sm font-medium mt-1">Approved</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl"
          >
            <div className="text-3xl sm:text-4xl mb-2">⏳</div>
            <div className="text-2xl sm:text-4xl font-bold">{stats?.pendingRequests || 0}</div>
            <div className="text-amber-200 text-xs sm:text-sm font-medium mt-1">Pending</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl"
          >
            <div className="text-3xl sm:text-4xl mb-2">📚</div>
            <div className="text-2xl sm:text-4xl font-bold">{stats?.activeRentals || 0}</div>
            <div className="text-purple-200 text-xs sm:text-sm font-medium mt-1">Active</div>
          </motion.div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/faculty/assign')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm sm:text-base">Assign Book</span>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/faculty/return')}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="text-sm sm:text-base">Mark Returned</span>
            </div>
          </motion.button>
        </div>

        {/* My Requests Section */}
        <MyRequestsSection facultyId={session?.user?.id} />

        {/* Students Section - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mt-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">My Students</h2>
          
          {students.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">👥</div>
              <p className="text-slate-600 text-sm sm:text-base">No students assigned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="border-2 border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{student.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-600">{student.enrollmentNumber}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{student.email}</p>
                  <div className="flex gap-2 sm:gap-3 mt-3 pt-3 border-t border-slate-200">
                    <div className="bg-blue-50 rounded-lg px-2 sm:px-3 py-1.5 flex-1">
                      <span className="text-xs text-slate-600 block">Active</span>
                      <span className="text-sm sm:text-base font-bold text-blue-600">{student.activeRentals || 0}</span>
                    </div>
                    <div className="bg-green-50 rounded-lg px-2 sm:px-3 py-1.5 flex-1">
                      <span className="text-xs text-slate-600 block">Total</span>
                      <span className="text-sm sm:text-base font-bold text-green-600">{student.totalRentals || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}