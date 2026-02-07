// src/lib/utils/otp.js

// Store OTPs in memory (production: use Redis)
const otpStore = new Map();

// Generate random 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with 5-minute expiry
export function storeOTP(identifier, otp) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(identifier, { otp, expiresAt });
}

// Verify OTP
export function verifyOTP(identifier, otp) {
  const stored = otpStore.get(identifier);
  
  if (!stored) {
    return { valid: false, error: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(identifier);
    return { valid: false, error: 'OTP expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, error: 'Invalid OTP' };
  }
  
  // Valid - delete OTP
  otpStore.delete(identifier);
  return { valid: true };
}

// Clean expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
    }
  }
}, 10 * 60 * 1000);