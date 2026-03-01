// src/app/register/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [showFacultyVerification, setShowFacultyVerification] = useState(false);
  const [facultyAccessCode, setFacultyAccessCode] = useState('');
  const [facultyVerified, setFacultyVerified] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [showPassword, setShowPassword] = useState(false); // ✅ ADDED

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    enrollmentNumber: '',
    phone: '',
    assignedFaculty: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (role === 'student') {
      fetchFaculties();
    }
  }, [role]);

  const fetchFaculties = async () => {
    try {
      const res = await fetch('/api/users/faculties');
      const data = await res.json();
      if (data.success) {
        setFaculties(data.faculties.filter((f) => f.status === 'active'));
      }
    } catch (err) {
      console.error('Failed to fetch faculties:', err);
    }
  };

  const handleFacultyRoleSelect = () => {
    setShowFacultyVerification(true);
  };

  const verifyFacultyCode = async () => {
    try {
      const res = await fetch('/api/auth/verify-faculty-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: facultyAccessCode }),
      });

      const data = await res.json();

      if (data.success) {
        setFacultyVerified(true);
        setShowFacultyVerification(false);
        setError('');
      } else {
        setError('Invalid access code');
      }
    } catch (err) {
      setError('Verification failed');
    }
  };

  // Validate IC Department enrollment number
  const validateEnrollmentNumber = (enrollmentNumber) => {
    // Format: YYXXDDDNNN
    // YY = Year (24 for 2024)
    // XX = Course code (17 for Information & Communication)
    // DDD = Department sequence
    // NNN = Student number
    
    const cleaned = enrollmentNumber.trim();
    
    // Check length (should be 12 digits)
    if (cleaned.length !== 12) {
      return { valid: false, error: 'Nahh...Something is wrong Baccha, check if enrollment is correct' };
    }
    
    // Check if all characters are digits
    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, error: 'Enrollment number must contain only digits' };
    }
    
    // Check if department code is 17 (IC department)
    const departmentCode = cleaned.substring(7, 9);
    if (departmentCode !== '17') {
      return {
        valid: false,
        error: 'This is not for everyone Baccha...',
      };
    }
    
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate enrollment number for students
    if (role === 'student') {
      const validation = validateEnrollmentNumber(formData.enrollmentNumber);
      if (!validation.valid) {
        setError(validation.error);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        role,
      };

      if (role === 'faculty') {
        payload.facultyAccessCode = facultyAccessCode;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-600 text-sm sm:text-base">Join IC Library System</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Register as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                disabled={role === 'faculty' && facultyVerified}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  role === 'student'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('faculty');
                  if (!facultyVerified) {
                    handleFacultyRoleSelect();
                  }
                }}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  role === 'faculty'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Faculty {facultyVerified && '✓'}
              </button>
            </div>
          </div>

          {/* Faculty Verification Modal */}
          <AnimatePresence>
            {showFacultyVerification && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={() => setShowFacultyVerification(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl p-6 w-full max-w-sm text-black"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Faculty Access Verification</h3>
                  <p className="text-slate-600 text-sm mb-4">Enter the faculty access code to continue</p>

                  <input
                    type="password"
                    value={facultyAccessCode}
                    onChange={(e) => setFacultyAccessCode(e.target.value)}
                    placeholder="Access Code"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-black"
                  />

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFacultyVerification(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={verifyFacultyCode}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                    >
                      Verify
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-black"
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-black"
                placeholder="your.email@example.com"
              />
            </div>

            {/* ✅ UPDATED PASSWORD FIELD WITH EYE TOGGLE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-black"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    // Eye Slash Icon (password visible)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    // Eye Icon (password hidden)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Student-specific fields */}
            {role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={formData.enrollmentNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, enrollmentNumber: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-black"
                    placeholder="2417001123"
                  />
                  {/* <p className="text-xs text-slate-500 mt-2">
                    ⚠️ Only IC Department students (code 17) can register
                    <br />
                    Format: <span className="font-mono">YYXXDDDNNN</span> where XX must be 17
                  </p> */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-black"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assigned Faculty
                  </label>
                  <select
                    required
                    value={formData.assignedFaculty}
                    onChange={(e) => setFormData({ ...formData, assignedFaculty: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-black"
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.email})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (role === 'faculty' && !facultyVerified)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 text-sm sm:text-base"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}