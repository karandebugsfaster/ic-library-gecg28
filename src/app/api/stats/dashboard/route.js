// src/app/api/stats/dashboard/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Book from '@/lib/models/Book';
import BookRequest from '@/lib/models/BookRequest';
import Rental from '@/lib/models/Rental';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    if (role === 'manager') {
      // Manager dashboard stats
      const [
        totalBooks,
        availableBooks,
        rentedBooks,
        totalStudents,
        activeStudents,
        totalFaculties,
        activeFaculties,
        pendingRequests,
        todayRentals,
        overdueRentals,
      ] = await Promise.all([
        Book.countDocuments(),
        Book.countDocuments({ rentalStatus: 'AVAILABLE' }),
        Book.countDocuments({ rentalStatus: 'RENTED' }),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'student', status: 'active' }),
        User.countDocuments({ role: 'faculty' }),
        User.countDocuments({ role: 'faculty', status: 'active' }),
        BookRequest.countDocuments({ status: 'pending' }),
        Rental.countDocuments({
          issuedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        }),
        Rental.countDocuments({
          status: 'ACTIVE',
          dueDate: { $lt: new Date() },
        }),
      ]);

      return Response.json({
        success: true,
        stats: {
          totalBooks,
          availableBooks,
          rentedBooks,
          totalStudents,
          activeStudents,
          totalFaculties,
          activeFaculties,
          pendingRequests,
          todayRentals,
          overdueRentals,
        },
      });

    } else if (role === 'faculty') {
      // Faculty dashboard stats
      const [
        assignedStudents,
        pendingRequests,
        approvedRequests,
        activeRentals,
      ] = await Promise.all([
        User.countDocuments({ 
          assignedFaculty: userId,
          status: 'active',
        }),
        BookRequest.countDocuments({
          facultyId: userId,
          status: 'pending',
        }),
        BookRequest.countDocuments({
          facultyId: userId,
          status: 'approved',
        }),
        Rental.countDocuments({
          userId: { 
            $in: await User.find({ assignedFaculty: userId }).distinct('_id') 
          },
          status: 'ACTIVE',
        }),
      ]);

      return Response.json({
        success: true,
        stats: {
          assignedStudents,
          pendingRequests,
          approvedRequests,
          activeRentals,
        },
      });

    } else if (role === 'student') {
      // Student dashboard stats
      const student = await User.findById(userId);
      
      const [activeRentals, totalRentals, overdueRentals] = await Promise.all([
        Rental.countDocuments({
          userId,
          status: 'ACTIVE',
        }),
        Rental.countDocuments({ userId }),
        Rental.countDocuments({
          userId,
          status: 'ACTIVE',
          dueDate: { $lt: new Date() },
        }),
      ]);

      return Response.json({
        success: true,
        stats: {
          activeRentals,
          totalRentals,
          overdueRentals,
          canRent: student?.canRent || false,
        },
      });
    }

    return Response.json({
      success: false,
      error: 'Invalid role',
    }, { status: 400 });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
    }, { status: 500 });
  }
}