// src/app/api/auth/verify/route.js

import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  validateEnrollmentNumber,
  validateCollegeEmail,
  validatePhoneNumber,
  sanitizeString,
} from "@/lib/utils/validators";

export async function POST(request) {
  try {
    console.log("🔵 [AUTH] Request received");

    // Connect to database
    console.log("📡 [AUTH] Connecting to database...");
    await connectDB();
    console.log("✅ [AUTH] Database connected");

    const body = await request.json();
    console.log("📦 [AUTH] Request body received:", {
      enrollmentNumber: body.enrollmentNumber,
      email: body.email,
      phone: body.phone,
      agreedToTerms: body.agreedToTerms,
    });

    const { enrollmentNumber, email, phone, agreedToTerms } = body;

    // Validate inputs with detailed logging
    console.log("🔍 [AUTH] Validating enrollment number:", enrollmentNumber);
    const enrollmentValidation = validateEnrollmentNumber(enrollmentNumber);
    console.log(
      "📊 [AUTH] Enrollment validation result:",
      enrollmentValidation,
    );

    if (!enrollmentValidation.valid) {
      console.error(
        "❌ [AUTH] Enrollment validation failed:",
        enrollmentValidation.error,
      );
      return Response.json(
        {
          success: false,
          error: enrollmentValidation.error,
        },
        { status: 400 },
      );
    }

    console.log("🔍 [AUTH] Validating email:", email);
    const emailValidation = validateCollegeEmail(email);
    console.log("📊 [AUTH] Email validation result:", emailValidation);

    if (!emailValidation.valid) {
      console.error(
        "❌ [AUTH] Email validation failed:",
        emailValidation.error,
      );
      return Response.json(
        {
          success: false,
          error: emailValidation.error,
        },
        { status: 400 },
      );
    }

    console.log("🔍 [AUTH] Validating phone:", phone);
    const phoneValidation = validatePhoneNumber(phone);
    console.log("📊 [AUTH] Phone validation result:", phoneValidation);

    if (!phoneValidation.valid) {
      console.error(
        "❌ [AUTH] Phone validation failed:",
        phoneValidation.error,
      );
      return Response.json(
        {
          success: false,
          error: phoneValidation.error,
        },
        { status: 400 },
      );
    }

    if (!agreedToTerms) {
      console.error("❌ [AUTH] Terms not agreed");
      return Response.json(
        {
          success: false,
          error: "You must agree to the terms and conditions",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    console.log(
      "🔍 [AUTH] Checking if user exists with enrollment:",
      enrollmentValidation.cleaned,
    );
    let user = await User.findOne({
      enrollmentNumber: enrollmentValidation.cleaned,
    });
    console.log("📊 [AUTH] User found:", !!user);

    if (user) {
      console.log("✅ [AUTH] Existing user found, updating lastActiveAt");
      // Existing user - verify email and phone match
      if (user.email !== emailValidation.normalized) {
        console.error("❌ [AUTH] Email mismatch for existing user");
        return Response.json(
          {
            success: false,
            error: "Enrollment number already registered with different email",
          },
          { status: 400 },
        );
      }

      // Update last active
      user.lastActiveAt = new Date();
      await user.save();
      console.log("✅ [AUTH] User updated successfully");

      return Response.json({
        success: true,
        message: "Welcome back!",
        user: {
          id: user._id,
          enrollmentNumber: user.enrollmentNumber,
          email: user.email,
          accountStatus: user.accountStatus,
          canRent: user.canRent,
        },
        isNewUser: false,
      });
    }

    // Create new user
    console.log("✅ [AUTH] Creating new user...");
    user = await User.create({
      enrollmentNumber: enrollmentValidation.cleaned,
      email: emailValidation.normalized,
      phone: phoneValidation.cleaned,
      agreedToTerms: true,
      termsAgreedAt: new Date(),
    });

    console.log("✅ [AUTH] New user created:", user.enrollmentNumber);

    return Response.json(
      {
        success: true,
        message: "Account created successfully!",
        user: {
          id: user._id,
          enrollmentNumber: user.enrollmentNumber,
          email: user.email,
          accountStatus: user.accountStatus,
          canRent: user.canRent,
        },
        isNewUser: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ [AUTH] Critical error:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.error(`❌ [AUTH] Duplicate key error on field: ${field}`);
      return Response.json(
        {
          success: false,
          error: `This ${field} is already registered`,
        },
        { status: 400 },
      );
    }

    // Validation errors from Mongoose schema
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      console.error("❌ [AUTH] Validation error:", messages);
      return Response.json(
        {
          success: false,
          error: messages.join(", "),
        },
        { status: 400 },
      );
    }

    console.error("❌ [AUTH] Unexpected error - returning 500");
    return Response.json(
      {
        success: false,
        error: "Authentication failed. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
