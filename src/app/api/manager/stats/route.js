// src/app/api/manager/stats/route.js

import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Book from '@/lib/models/Book';
import Rental from '@/lib/models/Rental';
import BookRequest from '@/lib/models/BookRequest';

export async function GET(request) {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    // Fetch all stats in parallel
    const [
      totalBooks,
      availableBooks,
      rentedBooks,
      totalUsers,
      activeUsers,
      blockedUsers,
      totalFaculties,
      activeFaculties,
      totalRentals,
      activeRentals,
      todayRentals,
      overdueRentals,
      dueSoonRentals,
      currentlyRented,
      rentalHistory,
      pendingRequests,
    ] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ rentalStatus: 'AVAILABLE' }),
      Book.countDocuments({ rentalStatus: 'RENTED' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', status: 'active' }),
      User.countDocuments({ role: 'student', accountStatus: 'BLOCKED' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'faculty', status: 'active' }),
      Rental.countDocuments(),
      Rental.countDocuments({ status: 'ACTIVE' }),
      Rental.find({
        issuedAt: { $gte: today },
      })
        .populate('userId', 'enrollmentNumber email')
        .sort({ issuedAt: -1 })
        .lean(),
      Rental.find({
        status: 'ACTIVE',
        dueDate: { $lt: new Date() },
      })
        .populate('userId', 'phone')
        .sort({ dueDate: 1 })
        .lean(),
      Rental.find({
        status: 'ACTIVE',
        dueDate: {
          $gte: tomorrow,
          $lt: twoDaysFromNow,
        },
      })
        .populate('userId', 'phone')
        .sort({ dueDate: 1 })
        .lean(),
      Rental.find({ status: 'ACTIVE' })
        .populate('userId', 'phone')
        .sort({ dueDate: 1 })
        .lean(),
      Rental.find()
        .sort({ issuedAt: -1 })
        .limit(100)
        .lean(),
      BookRequest.countDocuments({ status: 'pending' }),
    ]);

    const stats = {
      books: {
        total: totalBooks,
        available: availableBooks,
        rented: rentedBooks,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
      },
      faculties: {
        total: totalFaculties,
        active: activeFaculties,
        pending: pendingRequests,
      },
      rentals: {
        total: totalRentals,
        active: activeRentals,
        today: todayRentals.length,
        overdue: overdueRentals.length,
      },
      pendingRequests,
    };

    return Response.json({
      success: true,
      data: {
        stats,
        todayRentals,
        currentlyRented,
        overdueRentals,
        dueSoonRentals,
        rentalHistory,
      },
    });
  } catch (error) {
    console.error('Manager stats error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch statistics',
    }, { status: 500 });
  }
}