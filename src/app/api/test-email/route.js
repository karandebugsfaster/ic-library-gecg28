// src/app/api/test-email/route.js - Test Email Configuration

import { verifyEmailConfig, sendOTPEmail } from '@/lib/utils/email';

export async function GET() {
  try {
    // Verify configuration
    const isValid = await verifyEmailConfig();

    if (!isValid) {
      return Response.json({
        success: false,
        error: 'Email configuration is invalid'
      }, { status: 500 });
    }

    // Send test email
    const testOTP = '123456';
    await sendOTPEmail(
      process.env.SMTP_USER, // Send to yourself
      testOTP,
      'TEST-USER'
    );

    return Response.json({
      success: true,
      message: 'Test email sent successfully! Check your inbox.'
    });

  } catch (error) {
    console.error('❌ Test email error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
