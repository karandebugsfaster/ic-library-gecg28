// src/components/SignInModal.js - UPDATED WITH BETTER ERROR HANDLING

'use client';

import { useState } from 'react';
import { saveUserSession } from '@/lib/utils/session';
import styles from './SignInModal.module.css';

export default function SignInModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('student'); // 'student' or 'manager'
  const [step, setStep] = useState('mode'); // 'mode', 'signup', 'signin', 'otp'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [signupData, setSignupData] = useState({
    enrollmentNumber: '',
    email: '',
    phone: ''
  });

  const [signinData, setSigninData] = useState({
    enrollmentNumber: '',
    otp: ''
  });

  const [managerData, setManagerData] = useState({
    username: '',
    password: ''
  });

  const [maskedEmail, setMaskedEmail] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    // Auto-clear success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Student Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', '✅ ' + data.message);
        // Auto-switch to signin after 2 seconds
        setTimeout(() => {
          setStep('signin');
          setSigninData({ ...signinData, enrollmentNumber: signupData.enrollmentNumber });
        }, 2000);
      } else {
        showMessage('error', '❌ ' + data.error);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/student/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentNumber: signinData.enrollmentNumber })
      });

      const data = await response.json();

      if (data.success) {
        setMaskedEmail(data.email);
        setStep('otp');
        showMessage('success', '✅ OTP sent to ' + data.email);
      } else {
        showMessage('error', '❌ ' + data.error);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/student/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData)
      });

      const data = await response.json();

      if (data.success) {
        saveUserSession(data.user);
        showMessage('success', '✅ Signed in successfully!');
        setTimeout(() => onSuccess(data.user), 1000);
      } else {
        showMessage('error', '❌ ' + data.error);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manager Signin
  const handleManagerSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/manager/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(managerData)
      });

      const data = await response.json();

      if (data.success) {
        saveUserSession(data.user);
        showMessage('success', '✅ Signed in successfully!');
        setTimeout(() => onSuccess(data.user), 1000);
      } else {
        showMessage('error', '❌ ' + data.error);
      }
    } catch (error) {
      showMessage('error', '❌ Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>✕</button>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>IC Library</h2>
          <p className={styles.subtitle}>Sign in to access your account</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        {/* Step 1: Choose Mode */}
        {step === 'mode' && (
          <div className={styles.modeSelection}>
            <button
              className={`${styles.modeButton} ${mode === 'student' ? styles.active : ''}`}
              onClick={() => setMode('student')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Student</span>
            </button>

            <button
              className={`${styles.modeButton} ${mode === 'manager' ? styles.active : ''}`}
              onClick={() => setMode('manager')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <span>Manager</span>
            </button>
          </div>
        )}

        {/* Student - Signup/Signin Toggle */}
        {step === 'mode' && mode === 'student' && (
          <div className={styles.studentActions}>
            <button
              className={styles.actionButton}
              onClick={() => setStep('signup')}
            >
              Create New Account
            </button>
            <button
              className={styles.actionButtonOutline}
              onClick={() => setStep('signin')}
            >
              Already Have Account? Sign In
            </button>
          </div>
        )}

        {/* Manager - Direct Signin */}
        {step === 'mode' && mode === 'manager' && (
          <form onSubmit={handleManagerSignin} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input
                type="text"
                value={managerData.username}
                onChange={(e) => setManagerData({ ...managerData, username: e.target.value })}
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                value={managerData.password}
                onChange={(e) => setManagerData({ ...managerData, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Step 2: Student Signup */}
        {step === 'signup' && (
          <>
            <button className={styles.backButton} onClick={() => setStep('mode')}>
              ← Back
            </button>

            <form onSubmit={handleSignup} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Enrollment Number *</label>
                <input
                  type="text"
                  value={signupData.enrollmentNumber}
                  onChange={(e) => setSignupData({ ...signupData, enrollmentNumber: e.target.value })}
                  placeholder="e.g., 1712345678"
                  maxLength="10"
                  required
                  autoFocus
                />
                {/* <small>Only IC Department (starts with 17)</small> */}
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  placeholder="your.email@gmail.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  placeholder="9876543210"
                  maxLength="10"
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        {/* Step 3: Student Signin */}
        {step === 'signin' && (
          <>
            <button className={styles.backButton} onClick={() => setStep('mode')}>
              ← Back
            </button>

            <form onSubmit={handleSendOTP} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Enrollment Number</label>
                <input
                  type="text"
                  value={signinData.enrollmentNumber}
                  onChange={(e) => setSigninData({ ...signinData, enrollmentNumber: e.target.value })}
                  placeholder="e.g., 1712345678"
                  maxLength="10"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <p className={styles.helpText}>
                Don't have an account?{' '}
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => setStep('signup')}
                >
                  Sign Up
                </button>
              </p>
            </form>
          </>
        )}

        {/* Step 4: OTP Verification */}
        {step === 'otp' && (
          <>
            <button className={styles.backButton} onClick={() => setStep('signin')}>
              ← Back
            </button>

            <div className={styles.otpInfo}>
              <p>OTP sent to: <strong>{maskedEmail}</strong></p>
              <p className={styles.otpNote}>Check your email (including spam folder)</p>
            </div>

            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={signinData.otp}
                  onChange={(e) => setSigninData({ ...signinData, otp: e.target.value.replace(/\D/g, '') })}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <button
                type="button"
                className={styles.resendButton}
                onClick={handleSendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}