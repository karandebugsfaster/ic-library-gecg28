// // src/components/SignInModal.js

// 'use client';

// import { useState } from 'react';
// import { saveUserSession } from '@/lib/utils/session';
// import styles from './SignInModal.module.css';

// export default function SignInModal({ onClose, onSuccess }) {
//   const [mode, setMode] = useState(null); // null, 'student', 'manager'
//   const [action, setAction] = useState('signin'); // 'signin' or 'signup'
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const [studentForm, setStudentForm] = useState({
//     enrollmentNumber: '',
//     email: '',
//     phone: '',
//     agreedToTerms: false
//   });

//   const [managerForm, setManagerForm] = useState({
//     username: '',
//     password: ''
//   });

//   const handleStudentAuth = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     try {
//       const endpoint = action === 'signup' ? '/api/auth/student/signup' : '/api/auth/student/signin';
      
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(studentForm)
//       });

//       const data = await response.json();

//       if (data.success) {
//         saveUserSession(data.user);
//         onSuccess(data.user);
//       } else {
//         setMessage(`❌ ${data.error}`);
//       }
//     } catch (error) {
//       setMessage('❌ Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleManagerAuth = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     try {
//       const response = await fetch('/api/auth/manager/signin', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(managerForm)
//       });

//       const data = await response.json();

//       if (data.success) {
//         saveUserSession(data.user);
//         onSuccess(data.user);
//       } else {
//         setMessage(`❌ ${data.error}`);
//       }
//     } catch (error) {
//       setMessage('❌ Invalid credentials');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.overlay} onClick={onClose}>
//       <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//         <button className={styles.closeButton} onClick={onClose}>✕</button>

//         {/* Mode Selection */}
//         {!mode && (
//           <div className={styles.modeSelection}>
//             <h2>Sign In As</h2>
//             <div className={styles.modeButtons}>
//               <button 
//                 className={styles.modeButton}
//                 onClick={() => setMode('student')}
//               >
//                 <div className={styles.modeIcon}>👤</div>
//                 <h3>Student</h3>
//                 <p>View your rentals and profile</p>
//               </button>
              
//               <button 
//                 className={styles.modeButton}
//                 onClick={() => setMode('manager')}
//               >
//                 <div className={styles.modeIcon}>👔</div>
//                 <h3>Manager</h3>
//                 <p>Manage rentals and library</p>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Student Sign In/Up */}
//         {mode === 'student' && (
//           <div className={styles.formContainer}>
//             <button className={styles.backButton} onClick={() => setMode(null)}>
//               ← Back
//             </button>

//             <h2>{action === 'signin' ? 'Student Sign In' : 'Create Student Account'}</h2>

//             <form onSubmit={handleStudentAuth}>
//               <div className={styles.formGroup}>
//                 <label>Enrollment Number *</label>
//                 <input
//                   type="text"
//                   value={studentForm.enrollmentNumber}
//                   onChange={(e) => setStudentForm({ ...studentForm, enrollmentNumber: e.target.value })}
//                   placeholder="e.g., 2417001123"
//                   required
//                 />
//                 <small>Only IC department (code 17) students</small>
//               </div>

//               {action === 'signup' && (
//                 <>
//                   <div className={styles.formGroup}>
//                     <label>Email *</label>
//                     <input
//                       type="email"
//                       value={studentForm.email}
//                       onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
//                       placeholder="your.email@gmail.com"
//                       required
//                     />
//                   </div>

//                   <div className={styles.formGroup}>
//                     <label>Phone Number *</label>
//                     <input
//                       type="tel"
//                       value={studentForm.phone}
//                       onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
//                       placeholder="9876543210"
//                       required
//                     />
//                   </div>

//                   <div className={styles.checkboxGroup}>
//                     <input
//                       type="checkbox"
//                       id="terms"
//                       checked={studentForm.agreedToTerms}
//                       onChange={(e) => setStudentForm({ ...studentForm, agreedToTerms: e.target.checked })}
//                       required
//                     />
//                     <label htmlFor="terms">I agree to the library terms</label>
//                   </div>
//                 </>
//               )}

//               <button type="submit" className={styles.submitButton} disabled={loading}>
//                 {loading ? 'Processing...' : action === 'signin' ? 'Sign In' : 'Create Account'}
//               </button>

//               <div className={styles.switchMode}>
//                 {action === 'signin' ? (
//                   <p>
//                     Don't have an account?{' '}
//                     <button type="button" onClick={() => setAction('signup')}>Sign Up</button>
//                   </p>
//                 ) : (
//                   <p>
//                     Already have an account?{' '}
//                     <button type="button" onClick={() => setAction('signin')}>Sign In</button>
//                   </p>
//                 )}
//               </div>
//             </form>

//             {message && (
//               <div className={message.includes('✅') ? styles.successMsg : styles.errorMsg}>
//                 {message}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Manager Sign In */}
//         {mode === 'manager' && (
//           <div className={styles.formContainer}>
//             <button className={styles.backButton} onClick={() => setMode(null)}>
//               ← Back
//             </button>

//             <h2>Manager Sign In</h2>

//             <form onSubmit={handleManagerAuth}>
//               <div className={styles.formGroup}>
//                 <label>Username *</label>
//                 <input
//                   type="text"
//                   value={managerForm.username}
//                   onChange={(e) => setManagerForm({ ...managerForm, username: e.target.value })}
//                   placeholder="manager"
//                   required
//                 />
//               </div>

//               <div className={styles.formGroup}>
//                 <label>Password *</label>
//                 <input
//                   type="password"
//                   value={managerForm.password}
//                   onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>

//               <button type="submit" className={styles.submitButton} disabled={loading}>
//                 {loading ? 'Signing In...' : 'Sign In'}
//               </button>
//             </form>

//             {message && (
//               <div className={styles.errorMsg}>{message}</div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// src/components/SignInModal.js (Updated)

'use client';

import { useState } from 'react';
import { saveUserSession } from '@/lib/utils/session';
import styles from './SignInModal.module.css';

export default function SignInModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState(null);
  const [action, setAction] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [studentForm, setStudentForm] = useState({
    enrollmentNumber: '',
    email: '',
    phone: '',
    otp: '',
    agreedToTerms: false
  });

  const [managerForm, setManagerForm] = useState({
    username: '',
    password: ''
  });

  // Send OTP
  const handleSendOTP = async () => {
    if (!studentForm.enrollmentNumber) {
      setMessage('❌ Please enter your enrollment number');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/student/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentNumber: studentForm.enrollmentNumber })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setMessage(`✅ OTP sent to ${data.email}`);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = action === 'signup' 
        ? '/api/auth/student/signup' 
        : '/api/auth/student/signin';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });

      const data = await response.json();

      if (data.success) {
        saveUserSession(data.user);
        onSuccess(data.user);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleManagerAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/manager/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(managerForm)
      });

      const data = await response.json();

      if (data.success) {
        saveUserSession(data.user);
        onSuccess(data.user);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>

        {/* Mode Selection */}
        {!mode && (
          <div className={styles.modeSelection}>
            <h2>Sign In As</h2>
            <div className={styles.modeButtons}>
              <button 
                className={styles.modeButton}
                onClick={() => setMode('student')}
              >
                <div className={styles.modeIcon}>👤</div>
                <h3>Student</h3>
                <p>View your rentals and profile</p>
              </button>
              
              <button 
                className={styles.modeButton}
                onClick={() => setMode('manager')}
              >
                <div className={styles.modeIcon}>👔</div>
                <h3>Manager</h3>
                <p>Manage rentals and library</p>
              </button>
            </div>
          </div>
        )}

        {/* Student Sign In/Up */}
        {mode === 'student' && (
          <div className={styles.formContainer}>
            <button className={styles.backButton} onClick={() => {
              setMode(null);
              setOtpSent(false);
              setMessage('');
            }}>
              ← Back
            </button>

            <h2>{action === 'signin' ? 'Student Sign In' : 'Create Student Account'}</h2>

            <form onSubmit={handleStudentAuth}>
              <div className={styles.formGroup}>
                <label>Enrollment Number *</label>
                <input
                  type="text"
                  value={studentForm.enrollmentNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollmentNumber: e.target.value })}
                  placeholder="e.g., 2417001123"
                  required
                  disabled={otpSent && action === 'signin'}
                />
                {/* <small>Only IC department (code 17) students</small> */}
              </div>

              {action === 'signup' && (
                <>
                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      placeholder="your.email@gmail.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={studentForm.agreedToTerms}
                      onChange={(e) => setStudentForm({ ...studentForm, agreedToTerms: e.target.checked })}
                      required
                    />
                    <label htmlFor="terms">I agree to the library terms</label>
                  </div>
                </>
              )}

              {/* OTP Section for Sign In */}
              {action === 'signin' && (
                <>
                  {!otpSent ? (
                    <button 
                      type="button"
                      className={styles.otpButton}
                      onClick={handleSendOTP}
                      disabled={loading || !studentForm.enrollmentNumber}
                    >
                      {loading ? 'Sending...' : '📧 Send OTP to Email'}
                    </button>
                  ) : (
                    <div className={styles.formGroup}>
                      <label>Enter OTP *</label>
                      <input
                        type="text"
                        value={studentForm.otp}
                        onChange={(e) => setStudentForm({ ...studentForm, otp: e.target.value })}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        required
                      />
                      <button 
                        type="button"
                        className={styles.resendButton}
                        onClick={handleSendOTP}
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </>
              )}

              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={loading || (action === 'signin' && !otpSent)}
              >
                {loading ? 'Processing...' : action === 'signin' ? 'Verify & Sign In' : 'Create Account'}
              </button>

              <div className={styles.switchMode}>
                {action === 'signin' ? (
                  <p>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => {
                      setAction('signup');
                      setOtpSent(false);
                      setMessage('');
                    }}>Sign Up</button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button type="button" onClick={() => {
                      setAction('signin');
                      setOtpSent(false);
                      setMessage('');
                    }}>Sign In</button>
                  </p>
                )}
              </div>
            </form>

            {message && (
              <div className={message.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {message}
              </div>
            )}
          </div>
        )}

        {/* Manager Sign In - Same as before */}
        {mode === 'manager' && (
          <div className={styles.formContainer}>
            <button className={styles.backButton} onClick={() => setMode(null)}>
              ← Back
            </button>

            <h2>Manager Sign In</h2>

            <form onSubmit={handleManagerAuth}>
              <div className={styles.formGroup}>
                <label>Username *</label>
                <input
                  type="text"
                  value={managerForm.username}
                  onChange={(e) => setManagerForm({ ...managerForm, username: e.target.value })}
                  placeholder="manager"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Password *</label>
                <input
                  type="password"
                  value={managerForm.password}
                  onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {message && (
              <div className={styles.errorMsg}>{message}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}