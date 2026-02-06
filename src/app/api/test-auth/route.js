// Test endpoint for debugging auth
import {
  validateEnrollmentNumber,
  validateCollegeEmail,
  validatePhoneNumber,
} from "@/lib/utils/validators";

export async function POST(request) {
  try {
    const body = await request.json();
    const { enrollmentNumber, email, phone } = body;

    console.log("🧪 [TEST] Testing validators with:", {
      enrollmentNumber,
      email,
      phone,
    });

    const enrollmentValidation = validateEnrollmentNumber(enrollmentNumber);
    console.log("🧪 [TEST] Enrollment:", enrollmentValidation);

    const emailValidation = validateCollegeEmail(email);
    console.log("🧪 [TEST] Email:", emailValidation);

    const phoneValidation = validatePhoneNumber(phone);
    console.log("🧪 [TEST] Phone:", phoneValidation);

    return Response.json({
      enrollmentValidation,
      emailValidation,
      phoneValidation,
    });
  } catch (error) {
    console.error("🧪 [TEST] Error:", error);
    return Response.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}
