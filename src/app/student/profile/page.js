// src/app/student/profile/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession, clearUserSession } from '@/lib/utils/session';
import styles from './profile.module.css';

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const session = getUserSession();
    if (!session || session.role !== 'student') {
      router.push('/');
      return;
    }
    fetchProfile(session.id);
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    router.push('/');
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className={styles.error}>Profile not found</div>;
  }

  const { user, activeRentals, rentalHistory, overdueRentals } = profile;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push('/')}>
          ← Back to Library
        </button>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Info Banner */}
      <div className={styles.infoBanner}>
        <strong>ℹ️ Note:</strong> You can only view your rentals here. To rent or return books, please visit the library manager.
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {user.enrollmentNumber.substring(0, 2)}
        </div>
        <div className={styles.userInfo}>
          <h1>{user.enrollmentNumber}</h1>
          <p>{user.email}</p>
          <p>{user.phone}</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{user.activeRentals}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{user.totalRentals}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{user.overdueCount}</span>
            <span className={styles.statLabel}>Overdue</span>
          </div>
        </div>
      </div>

      {/* Account Status Warnings */}
      {user.accountStatus !== 'ACTIVE' && (
        <div className={styles.warningBanner}>
          <strong>⚠️ Account Status: {user.accountStatus}</strong>
          {user.penaltyUntil && <p>Penalty until: {new Date(user.penaltyUntil).toLocaleDateString()}</p>}
          {user.penaltyReason && <p>Reason: {user.penaltyReason}</p>}
        </div>
      )}

      {overdueRentals.length > 0 && (
        <div className={styles.overdueAlert}>
          <h3>🚨 Overdue Books ({overdueRentals.length})</h3>
          <p>Please return these books to the library manager immediately</p>
          {overdueRentals.map(rental => (
            <div key={rental._id} className={styles.overdueItem}>
              <strong>{rental.bookSnapshot.title}</strong>
              <span>Due: {new Date(rental.dueDate).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Rentals ({activeRentals.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({rentalHistory.length})
        </button>
      </div>

      {/* Content - Same as before */}
      {activeTab === 'active' ? (
        <div className={styles.rentalsGrid}>
          {activeRentals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No active rentals</p>
              <p>Visit the library manager to rent books</p>
            </div>
          ) : (
            activeRentals.map(rental => {
              const daysRemaining = getDaysRemaining(rental.dueDate);
              const isOverdue = daysRemaining < 0;
              const isDueSoon = daysRemaining <= 2 && daysRemaining >= 0;

              return (
                <div key={rental._id} className={styles.rentalCard}>
                  <div className={styles.bookCover}>
                    {rental.bookId?.coverImage ? (
                      <img src={rental.bookId.coverImage} alt={rental.bookId.title} />
                    ) : (
                      <div className={styles.coverPlaceholder}>📚</div>
                    )}
                  </div>

                  <div className={styles.rentalInfo}>
                    <h3>{rental.bookSnapshot.title}</h3>
                    <p className={styles.author}>{rental.bookId?.author || 'Unknown'}</p>

                    <div className={styles.rentalDates}>
                      <div>
                        <span className={styles.label}>Issued:</span>
                        <span>{new Date(rental.issuedAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className={styles.label}>Due:</span>
                        <span>{new Date(rental.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className={`${styles.statusBadge} ${
                      isOverdue ? styles.overdue : isDueSoon ? styles.dueSoon : styles.safe
                    }`}>
                      {isOverdue
                        ? `⚠️ Overdue by ${Math.abs(daysRemaining)} days`
                        : isDueSoon
                        ? `⏰ Due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
                        : `✓ ${daysRemaining} days remaining`
                      }
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className={styles.historyList}>
          {rentalHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No rental history</p>
            </div>
          ) : (
            rentalHistory.map(rental => (
              <div key={rental._id} className={styles.historyItem}>
                <div>
                  <strong>{rental.bookSnapshot.title}</strong>
                  <p className={styles.historyDates}>
                    {new Date(rental.issuedAt).toLocaleDateString()} → {' '}
                    {rental.actualReturnedAt ? new Date(rental.actualReturnedAt).toLocaleDateString() : 'Not returned'}
                  </p>
                </div>
                <span className={styles.historyStatus}>✓ Returned</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}