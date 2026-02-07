// src/lib/utils/otp.js - Database-based OTP with Hashing

import bcrypt from 'bcryptjs';
import OTP from '@/lib/models/OTP';

// Generate random 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in database (hashed)
export async function storeOTP(enrollmentNumber, otp) {
  try {
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing OTPs for this user
    await OTP.deleteMany({ enrollmentNumber: enrollmentNumber.toUpperCase() });

    // Create new OTP
    await OTP.create({
      enrollmentNumber: enrollmentNumber.toUpperCase(),
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false
    });

    console.log(`✅ OTP stored for ${enrollmentNumber}, expires at ${expiresAt.toISOString()}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Store OTP error:', error);
    throw new Error('Failed to store OTP');
  }
}

// Verify OTP
export async function verifyOTP(enrollmentNumber, otp) {
  try {
    const otpRecord = await OTP.findOne({
      enrollmentNumber: enrollmentNumber.toUpperCase(),
      verified: false
    });

    if (!otpRecord) {
      return { valid: false, error: 'OTP not found or already used' };
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { valid: false, error: 'OTP has expired' };
    }

    // Check attempts (max 3)
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { valid: false, error: 'Too many failed attempts' };
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      return { valid: false, error: 'Invalid OTP' };
    }

    // Mark as verified and delete
    await OTP.deleteOne({ _id: otpRecord._id });
    
    console.log(`✅ OTP verified for ${enrollmentNumber}`);
    return { valid: true };
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return { valid: false, error: 'OTP verification failed' };
  }
}

// Clean up expired OTPs (optional, can be run on cron)
export async function cleanupExpiredOTPs() {
  try {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`🧹 Cleaned up ${result.deletedCount} expired OTPs`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return 0;
  }
}