// src/lib/seed/createManager.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../mongodb.js";

const MANAGER_CREDENTIALS = {
  name: "Prof. A. N. Bokade",
  email: process.env.MANAGER_EMAIL || "manager@iclibrary.com",
  password: process.env.MANAGER_PASSWORD || "Manager@123",
  role: "manager",
  status: "active",
};

async function createManager() {
  try {
    await connectDB();

    // Import User model
    const User = (await import("../models/User.js")).default;

    // Check if manager already exists
    const existingManager = await User.findOne({ role: "manager" });

    if (existingManager) {
      console.log("✓ Manager account already exists");
      console.log(`Email: ${existingManager.email}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(MANAGER_CREDENTIALS.password, 12);

    // Create manager
    const manager = await User.create({
      name: MANAGER_CREDENTIALS.name,
      email: MANAGER_CREDENTIALS.email,
      password: hashedPassword,
      role: "manager",
      status: "active",
      enrollmentNumber: "SYS_MANAGER",
    });

    console.log("✅ Manager account created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", MANAGER_CREDENTIALS.email);
    console.log("🔑 Password:", MANAGER_CREDENTIALS.password);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANT: Change this password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating manager:", error);
    process.exit(1);
  }
}

createManager();
