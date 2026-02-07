// src/app/api/admin/stats/route.js

import connectDB from '@/lib/mongodb';
import Book from '@/lib/models/Book';
import User from '@/lib/models/User';
import Rental from '@/lib/models/Rental';

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Get all stats
    const [
      totalBooks,
      availableBooks,
      rentedBooks,
      totalUsers,
      activeUsers,
      blockedUsers,
      todayRentals,
      activeRentals,
      overdueRentals,
      dueSoonRentals, // NEW
      totalRentalsCount
    ] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ rentalStatus: 'AVAILABLE' }),
      Book.countDocuments({ rentalStatus: 'RENTED' }),
      User.countDocuments(),
      User.countDocuments({ accountStatus: 'ACTIVE' }),
      User.countDocuments({ accountStatus: 'BLOCKED' }),
      Rental.countDocuments({
        issuedAt: { $gte: today, $lt: tomorrow }
      }),
      Rental.countDocuments({ status: 'ACTIVE' }),
      Rental.countDocuments({
        status: 'ACTIVE',
        dueDate: { $lt: new Date() }
      }),
      // NEW: Due tomorrow (within 24-48 hours)
      Rental.countDocuments({
        status: 'ACTIVE',
        dueDate: { $gte: tomorrow, $lt: dayAfterTomorrow }
      }),
      Rental.countDocuments()
    ]);

    // Today's rentals
    const todayRentalsList = await Rental.find({
      issuedAt: { $gte: today, $lt: tomorrow }
    })
      .populate('userId', 'enrollmentNumber email')
      .populate('bookId', 'title author isbn')
      .sort({ issuedAt: -1 })
      .lean();

    // Currently rented
    const currentlyRented = await Rental.find({ status: 'ACTIVE' })
      .populate('userId', 'enrollmentNumber email phone')
      .populate('bookId', 'title author isbn')
      .sort({ dueDate: 1 })
      .lean();

    // Overdue
    const overdueList = await Rental.find({
      status: 'ACTIVE',
      dueDate: { $lt: new Date() }
    })
      .populate('userId', 'enrollmentNumber email phone')
      .populate('bookId', 'title author isbn')
      .sort({ dueDate: 1 })
      .lean();

    // NEW: Due soon (tomorrow)
    const dueSoonList = await Rental.find({
      status: 'ACTIVE',
      dueDate: { $gte: tomorrow, $lt: dayAfterTomorrow }
    })
      .populate('userId', 'enrollmentNumber email phone')
      .populate('bookId', 'title author isbn')
      .sort({ dueDate: 1 })
      .lean();

    // Rental history
    const rentalHistory = await Rental.find({})
      .populate('userId', 'enrollmentNumber')
      .populate('bookId', 'title author')
      .sort({ issuedAt: -1 })
      .limit(100)
      .lean();

    return Response.json({
      success: true,
      data: {
        stats: {
          books: {
            total: totalBooks,
            available: availableBooks,
            rented: rentedBooks
          },
          users: {
            total: totalUsers,
            active: activeUsers,
            blocked: blockedUsers
          },
          rentals: {
            today: todayRentals,
            active: activeRentals,
            overdue: overdueRentals,
            dueSoon: dueSoonRentals, // NEW
            total: totalRentalsCount
          }
        },
        todayRentals: todayRentalsList,
        currentlyRented,
        overdueRentals: overdueList,
        dueSoonRentals: dueSoonList, // NEW
        rentalHistory
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch admin stats'
    }, { status: 500 });
  }
}