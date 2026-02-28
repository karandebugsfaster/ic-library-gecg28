// src/lib/utils/email.js

import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || process.env.EMAIL_PORT || 587,
  secure: process.env.SMTP_SECURE === "true" ? true : false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.warn("Email credentials not configured. Email not sent.");
      return { success: false, error: "Email not configured" };
    }

    if (!process.env.SMTP_PASS && !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured. Email not sent.");
      return { success: false, error: "Email not configured" };
    }

    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"IC Library System" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
    });

    console.log(
      "✅ Email sent successfully to:",
      to,
      "| Message ID:",
      info.messageId,
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send book request notification to manager
 */
export async function sendRequestNotification({
  manager,
  faculty,
  student,
  book,
  type,
  reason,
}) {
  return sendEmail({
    to: manager.email,
    subject: `New Book ${type === "issue" ? "Issue" : "Return"} Request`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B2E4B;">New Book Request</h2>
        <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Type:</strong> ${type === "issue" ? "Book Issue" : "Book Return"}</p>
          <p><strong>Student:</strong> ${student.name} (${student.enrollmentNumber})</p>
          <p><strong>Faculty:</strong> ${faculty.name}</p>
          <p><strong>Book:</strong> ${book.title} by ${book.author}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p><strong>Requested At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Please log in to the system to approve or reject this request.</p>
      </div>
    `,
  });
}

/**
 * Send approval/rejection notification to faculty
 */
export async function sendDecisionNotification({
  faculty,
  student,
  book,
  type,
  approved,
  notes,
}) {
  return sendEmail({
    to: faculty.email,
    subject: `Book Request ${approved ? "Approved" : "Rejected"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${approved ? "#059669" : "#991B1B"};">
          Request ${approved ? "Approved" : "Rejected"}
        </h2>
        <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Student:</strong> ${student.name}</p>
          <p><strong>Book:</strong> ${book.title}</p>
          <p><strong>Type:</strong> ${type === "issue" ? "Issue" : "Return"}</p>
          ${notes ? `<p><strong>${approved ? "Notes" : "Reason"}:</strong> ${notes}</p>` : ""}
        </div>
      </div>
    `,
  });
}

/**
 * Send OTP email for authentication
 */
export async function sendOTPEmail(email, otp, enrollmentNumber) {
  return sendEmail({
    to: email,
    subject: "Your IC Library OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 8px; text-align: center; color: white; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">IC Library System</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">One-Time Password</p>
        </div>
        
        <div style="background: #F8FAFC; padding: 30px; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0 0 20px 0; color: #334155; font-size: 14px;">Hello ${enrollmentNumber},</p>
          
          <p style="margin: 0 0 30px 0; color: #334155; font-size: 14px;">Your One-Time Password (OTP) for signing in to IC Library is:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #667eea; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="margin: 20px 0 0 0; color: #64748B; font-size: 12px; background: #FEF3C7; padding: 10px; border-radius: 4px; border-left: 3px solid #F59E0B;">
            ⏰ <strong>Valid for 5 minutes only</strong>
          </p>
          
          <p style="margin: 20px 0 10px 0; color: #334155; font-size: 13px;">
            <strong>Important:</strong> Never share this code with anyone. The IC Library team will never ask for your OTP.
          </p>
        </div>
        
        <p style="margin-top: 20px; color: #94A3B8; font-size: 12px; text-align: center;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Your IC Library OTP is: ${otp}\n\nThis code is valid for 5 minutes.\n\nNever share this code with anyone.`,
  });
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig() {
  try {
    const testEmail = process.env.SMTP_USER || process.env.EMAIL_USER;
    if (!testEmail) {
      return {
        success: false,
        error: "Email user not configured (SMTP_USER or EMAIL_USER)",
      };
    }

    const testPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if (!testPass) {
      return {
        success: false,
        error: "Email password not configured (SMTP_PASS or EMAIL_PASS)",
      };
    }

    // Try to verify connection
    await transporter.verify();
    return {
      success: true,
      message: "Email configuration is valid",
      email: testEmail,
    };
  } catch (error) {
    return {
      success: false,
      error: `Email configuration error: ${error.message}`,
    };
  }
}
