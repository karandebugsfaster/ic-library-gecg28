// src/app/api/users/profile/route.js

import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Rental from "@/lib/models/Rental";

export async function POST(request) {
  try {
    await connectDB();

    const { userId } = await request.json();

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "User ID required",
        },
        { status: 400 },
      );
    }

    // Get user details
    const user = await User.findById(userId).lean();

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Get active rentals
    const activeRentals = await Rental.find({
      userId: userId,
      status: "ACTIVE",
    })
      .populate("bookId", "title author isbn coverImage")
      .sort({ issuedAt: -1 })
      .lean();

    // Get rental history
    const rentalHistory = await Rental.find({
      userId: userId,
      status: { $in: ["AUTO_RETURNED", "MANUALLY_RETURNED"] },
    })
      .populate("bookId", "title author isbn")
      .sort({ actualReturnedAt: -1 })
      .limit(10)
      .lean();

    // Get overdue rentals - compare with today's midnight in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueRentals = await Rental.find({
      userId: userId,
      status: "ACTIVE",
      dueDate: { $lt: today },
    })
      .populate("bookId", "title author isbn")
      .lean();

    return Response.json({
      success: true,
      data: {
        user,
        activeRentals,
        rentalHistory,
        overdueRentals,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch profile",
      },
      { status: 500 },
    );
  }
}
