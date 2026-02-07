// src/lib/utils/email.js - Nodemailer Setup

import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Use Gmail or custom SMTP
  const isGmail = process.env.SMTP_HOST === 'smtp.gmail.com';

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || (isGmail ? 587 : 465),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    ...(isGmail && {
      service: 'gmail'
    })
  });
};

// Send OTP email
export async function sendOTPEmail(to, otp, enrollmentNumber) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"IC Library" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: to,
    subject: 'IC Library - Your Sign In OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IC Library OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">IC Library</h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Sign In Verification</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hello <strong>${enrollmentNumber}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Your One-Time Password (OTP) for signing in to IC Library is:
                    </p>

                    <!-- OTP Box -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                      <tr>
                        <td align="center" style="padding: 24px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px;">
                          <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #667eea; font-family: 'Courier New', monospace;">
                            ${otp}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      ⏰ This OTP will expire in <strong>5 minutes</strong>.
                    </p>

                    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      🔒 For security reasons, please do not share this OTP with anyone.
                    </p>

                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                      IC Department Library Management System<br>
                      This is an automated message, please do not reply.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send email');
  }
}

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}