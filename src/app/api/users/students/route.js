// src/app/api/users/students/route.js

import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Rental from "@/lib/models/Rental";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get("facultyId");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const query = { role: "student" };

    if (facultyId) {
      query.assignedFaculty = facultyId;
    }

    if (!includeDeleted) {
      query.status = "active";
    }

    const students = await User.find(query)
      .populate("assignedFaculty", "name email")
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich students with rental information
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const now = new Date();

        // Get active rentals
        const activeRentals = await Rental.countDocuments({
          userId: student._id,
          status: "ACTIVE",
        });

        // Get total rentals
        const totalRentals = await Rental.countDocuments({
          userId: student._id,
        });

        // Get overdue count
        const overdueCount = await Rental.countDocuments({
          userId: student._id,
          status: "ACTIVE",
          dueDate: { $lt: now },
        });

        return {
          ...student,
          activeRentals,
          totalRentals,
          overdueCount,
        };
      }),
    );

    return Response.json({
      success: true,
      students: enrichedStudents,
    });
  } catch (error) {
    console.error("Fetch students error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch students",
      },
      { status: 500 },
    );
  }
}
