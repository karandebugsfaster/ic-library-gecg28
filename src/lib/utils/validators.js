// src/lib/utils/validators.js

import validator from "validator";

/**
 * Validate IC Department Enrollment Number
 * Format: YYXXCCCRRR
 * YY = Year (2 digits)
 * XX = Department code (must be "17" for IC)
 * CCC = Course code (3 digits)
 * RRR = Roll number (3 digits)
 *
 * Example: 2417001123
 */
export function validateEnrollmentNumber(enrollmentNumber) {
  if (!enrollmentNumber || typeof enrollmentNumber !== "string") {
    return {
      valid: false,
      error: "Enrollment number is required",
    };
  }

  // Remove any spaces or dashes
  const cleaned = enrollmentNumber.trim().replace(/[-\s]/g, "");

  // Check format: Must be exactly 12 digits
  const pattern = /^\d{12}$/;
  if (!pattern.test(cleaned)) {
    return {
      valid: false,
      error: "Enrollment number must be exactly 12 digits",
    };
  }

  // Extract department code (positions 2-3, zero-indexed)
  const deptCode = cleaned.substring(7, 9);

  // Must be "17" for IC department
  if (deptCode !== "17") {
    return {
      valid: false,
      error: "No baccha, This is not for everyone...",
    };
  }

  //   // Validate year (first 2 digits)
  //   const year = parseInt(cleaned.substring(0, 2));
  //   const currentYear = new Date().getFullYear() % 100; // Last 2 digits of current year

  //   // Student should be within last 5 years
  //   if (year > currentYear || (currentYear - year) > 5) {
  //     return {
  //       valid: false,
  //       error: 'Invalid enrollment year'
  //     };
  //   }

  return {
    valid: true,
    cleaned: cleaned,
  };
}

/**
 * Validate college email
 */
export function validateCollegeEmail(email) {
  if (!email || !validator.isEmail(email)) {
    return {
      valid: false,
      error: "Invalid email format",
    };
  }

  // For now, accept any valid email format
  // You can later restrict to specific college domains

  return {
    valid: true,
    normalized: email.toLowerCase().trim(),
  };
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhoneNumber(phone) {
  if (!phone) {
    return {
      valid: false,
      error: "Phone number is required",
    };
  }

  // Remove spaces, dashes, and +91
  const cleaned = phone.replace(/[\s\-+]/g, "");

  // Indian mobile: 10 digits starting with 6-9
  const pattern = /^[6-9]\d{9}$/;

  if (!pattern.test(cleaned)) {
    return {
      valid: false,
      error: "Invalid Indian mobile number",
    };
  }

  return {
    valid: true,
    cleaned: cleaned,
  };
}

/**
 * Sanitize string input to prevent injection
 */
export function sanitizeString(str, maxLength = 200) {
  if (!str) return "";

  return str.trim().slice(0, maxLength).replace(/[<>]/g, ""); // Remove potential HTML tags
}
