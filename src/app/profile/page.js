"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserSession, clearUserSession } from "@/lib/utils/session";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const session = getUserSession();
    console.log("Session:", session);

    if (!session || !session.id) {
      console.log("No session found, redirecting to home");
      router.push("/");
      return;
    }

    fetchProfile(session.id);
  }, [router]);

  const fetchProfile = async (userId) => {
    try {
      console.log("Fetching profile for userId:", userId);
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      console.log("Profile response:", data);

      if (data.success) {
        setProfile(data.data);
      } else {
        console.error("Profile fetch failed:", data.error);
        alert("Failed to load profile: " + data.error);
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      alert("Error loading profile");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    router.push("/");
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

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
    return (
      <div className={styles.error}>
        <h2>Profile not found</h2>
        <button onClick={() => router.push("/")}>← Back to Library</button>
      </div>
    );
  }

  const { user, activeRentals, rentalHistory, overdueRentals } = profile;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push("/")}>
          ← Back to Library
        </button>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Profile Info Card */}
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
            <span className={styles.statLabel}>Total Rented</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{user.overdueCount}</span>
            <span className={styles.statLabel}>Overdue</span>
          </div>
        </div>
      </div>

      {/* Account Status */}
      {user.accountStatus !== "ACTIVE" && (
        <div className={styles.warningBanner}>
          <strong>⚠️ Account Status: {user.accountStatus}</strong>
          {user.penaltyUntil && (
            <p>
              Penalty until:{" "}
              {new Date(user.penaltyUntil).toLocaleDateString("en-GB")}
            </p>
          )}
          {user.penaltyReason && <p>Reason: {user.penaltyReason}</p>}
        </div>
      )}

      {/* Overdue Alert */}
      {overdueRentals.length > 0 && (
        <div className={styles.overdueAlert}>
          <h3>🚨 Overdue Books ({overdueRentals.length})</h3>
          <p>Please return these books immediately to avoid penalties</p>
          <div className={styles.overdueList}>
            {overdueRentals.map((rental) => (
              <div key={rental._id} className={styles.overdueItem}>
                <strong>{rental.bookSnapshot.title}</strong>
                <span>
                  Due: {new Date(rental.dueDate).toLocaleDateString("en-GB")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "active" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Rentals ({activeRentals.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "history" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History ({rentalHistory.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "active" ? (
        <div className={styles.rentalsGrid}>
          {activeRentals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No active rentals</p>
              <button onClick={() => router.push("/")}>Browse Books</button>
            </div>
          ) : (
            activeRentals.map((rental) => {
              const daysRemaining = getDaysRemaining(rental.dueDate);
              const isOverdue = daysRemaining < 0;
              const isDueSoon = daysRemaining <= 2 && daysRemaining >= 0;

              return (
                <div key={rental._id} className={styles.rentalCard}>
                  {/* Book Cover */}
                  <div className={styles.bookCover}>
                    {rental.bookId?.coverImage ? (
                      <img
                        src={rental.bookId.coverImage}
                        alt={rental.bookId.title}
                      />
                    ) : (
                      <div className={styles.coverPlaceholder}>
                        <svg
                          width="60"
                          height="60"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className={styles.rentalInfo}>
                    <h3>{rental.bookId?.title || rental.bookSnapshot.title}</h3>
                    <p className={styles.author}>
                      {rental.bookId?.author || "Unknown"}
                    </p>
                    <p className={styles.isbn}>
                      ISBN: {rental.bookId?.isbn || rental.bookSnapshot.isbn}
                    </p>

                    <div className={styles.rentalDates}>
                      <div>
                        <span className={styles.label}>Issued:</span>
                        <span className={styles.label}>
                          {new Date(rental.issuedAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </div>
                      <div>
                        <span className={styles.label}>Due:</span>
                        <span className={styles.label}>
                          {new Date(rental.dueDate).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div
                      className={`${styles.statusBadge} ${
                        isOverdue
                          ? styles.overdue
                          : isDueSoon
                            ? styles.dueSoon
                            : styles.safe
                      }`}
                    >
                      {isOverdue
                        ? `⚠️ Overdue by ${Math.abs(daysRemaining)} days`
                        : isDueSoon
                          ? `⏰ Due in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`
                          : `✓ ${daysRemaining} days remaining`}
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
            rentalHistory.map((rental) => (
              <div key={rental._id} className={styles.historyItem}>
                <div className={styles.historyBook}>
                  <strong>{rental.bookSnapshot.title}</strong>
                  <span className={styles.historyAuthor}>
                    {rental.bookId?.author || "Unknown"}
                  </span>
                </div>
                <div className={styles.historyDates}>
                  <span>
                    {new Date(rental.issuedAt).toLocaleDateString("en-GB")} →{" "}
                    {new Date(rental.actualReturnedAt).toLocaleDateString(
                      "en-GB",
                    )}
                  </span>
                  <span className={styles.historyStatus}>
                    {rental.status === "AUTO_RETURNED"
                      ? "✓ Returned"
                      : "✓ Manually Returned"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
