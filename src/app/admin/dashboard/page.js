// src/app/admin/dashboard/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeView, setActiveView] = useState("overview"); // overview, today, active, overdue, history

  useEffect(() => {
    // Simple admin check - in production, use proper auth
    const adminPassword = prompt("Enter admin password:");
    if (adminPassword !== "admin123") {
      alert("Unauthorized");
      router.push("/");
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((now - due) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return <div className={styles.error}>Failed to load dashboard</div>;
  }

  const {
    stats,
    todayRentals,
    currentlyRented,
    overdueRentals,
    rentalHistory,
  } = data;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p className={styles.subtitle}>IC Library Management System</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => router.push("/admin/import")}
            className={styles.importButton}
          >
            📥 Import Books
          </button>
          <button
            onClick={() => router.push("/")}
            className={styles.backButton}
          >
            ← Library
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div
          className={styles.statCard}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statContent}>
            <h3>Total Books</h3>
            <div className={styles.statValue}>{stats.books.total}</div>
            <div className={styles.statBreakdown}>
              <span>{stats.books.available} Available</span>
              <span>{stats.books.rented} Rented</span>
            </div>
          </div>
        </div>

        <div
          className={styles.statCard}
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          }}
        >
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3>Total Users</h3>
            <div className={styles.statValue}>{stats.users.total}</div>
            <div className={styles.statBreakdown}>
              <span>{stats.users.active} Active</span>
              <span>{stats.users.blocked} Blocked</span>
            </div>
          </div>
        </div>

        <div
          className={styles.statCard}
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          }}
        >
          <div className={styles.statIcon}>📖</div>
          <div className={styles.statContent}>
            <h3>Active Rentals</h3>
            <div className={styles.statValue}>{stats.rentals.active}</div>
            <div className={styles.statBreakdown}>
              <span>{stats.rentals.today} Today</span>
            </div>
          </div>
        </div>

        <div
          className={styles.statCard}
          style={{
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          }}
        >
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statContent}>
            <h3>Overdue Books</h3>
            <div className={styles.statValue}>{stats.rentals.overdue}</div>
            <div className={styles.statBreakdown}>
              <span>Needs Attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeView === "overview" ? styles.activeTab : ""}`}
          onClick={() => setActiveView("overview")}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeView === "today" ? styles.activeTab : ""}`}
          onClick={() => setActiveView("today")}
        >
          Today's Rentals ({todayRentals.length})
        </button>
        <button
          className={`${styles.tab} ${activeView === "active" ? styles.activeTab : ""}`}
          onClick={() => setActiveView("active")}
        >
          Currently Rented ({currentlyRented.length})
        </button>
        <button
          className={`${styles.tab} ${activeView === "overdue" ? styles.activeTab : ""}`}
          onClick={() => setActiveView("overdue")}
        >
          Overdue ({overdueRentals.length})
        </button>
        <button
          className={`${styles.tab} ${activeView === "history" ? styles.activeTab : ""}`}
          onClick={() => setActiveView("history")}
        >
          All History
        </button>
      </div>

      {/* Content Views */}
      <div className={styles.content}>
        {activeView === "overview" && (
          <div className={styles.overview}>
            <div className={styles.overviewSection}>
              <h2>Quick Stats</h2>
              <div className={styles.quickStats}>
                <div>
                  Total Rentals (All Time):{" "}
                  <strong>{stats.rentals.total}</strong>
                </div>
                <div>
                  Available for Rent:{" "}
                  <strong>{stats.books.available} books</strong>
                </div>
                <div>
                  Registered Students: <strong>{stats.users.total}</strong>
                </div>
              </div>
            </div>

            {overdueRentals.length > 0 && (
              <div className={styles.overviewSection}>
                <h2>⚠️ Urgent: Overdue Books</h2>
                <div className={styles.overdueQuickList}>
                  {overdueRentals.slice(0, 5).map((rental) => (
                    <div key={rental._id} className={styles.overdueQuickItem}>
                      <span>{rental.bookSnapshot.title}</span>
                      <span>{rental.userSnapshot.enrollmentNumber}</span>
                      <span className={styles.overdueDays}>
                        {getDaysOverdue(rental.dueDate)} days overdue
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === "today" && (
          <div className={styles.tableContainer}>
            <h2>Books Rented Today</h2>
            {todayRentals.length === 0 ? (
              <p className={styles.emptyMessage}>No rentals today</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Book</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRentals.map((rental) => (
                    <tr key={rental._id}>
                      <td>{new Date(rental.issuedAt).toLocaleTimeString()}</td>
                      <td>
                        <strong>{rental.bookSnapshot.title}</strong>
                        <br />
                        <small>{rental.bookSnapshot.author}</small>
                      </td>
                      <td>{rental.userSnapshot.enrollmentNumber}</td>
                      <td>{rental.userSnapshot.email}</td>
                      <td>
                        {new Date(rental.dueDate).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeView === "active" && (
          <div className={styles.tableContainer}>
            <h2>Currently Rented Books</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>ISBN</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentlyRented.map((rental) => {
                  const daysUntilDue = Math.ceil(
                    (new Date(rental.dueDate) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isOverdue = daysUntilDue < 0;
                  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;

                  return (
                    <tr
                      key={rental._id}
                      className={isOverdue ? styles.overdueRow : ""}
                    >
                      <td>
                        <strong>{rental.bookSnapshot.title}</strong>
                        <br />
                        <small>{rental.bookSnapshot.author}</small>
                      </td>
                      <td>{rental.bookSnapshot.isbn}</td>
                      <td>{rental.userSnapshot.enrollmentNumber}</td>
                      <td>{rental.userSnapshot.email}</td>
                      <td>
                        {new Date(rental.issuedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        {new Date(rental.dueDate).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            isOverdue
                              ? styles.badgeOverdue
                              : isDueSoon
                                ? styles.badgeDueSoon
                                : styles.badgeOk
                          }`}
                        >
                          {isOverdue
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : isDueSoon
                              ? `Due in ${daysUntilDue}d`
                              : `${daysUntilDue} days`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeView === "overdue" && (
          <div className={styles.tableContainer}>
            <h2>⚠️ Overdue Books - Action Required</h2>
            {overdueRentals.length === 0 ? (
              <p className={styles.emptyMessage}>✓ No overdue books</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Days Overdue</th>
                    <th>Book</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueRentals.map((rental) => (
                    <tr key={rental._id} className={styles.overdueRow}>
                      <td>
                        <span className={styles.badgeOverdue}>
                          {getDaysOverdue(rental.dueDate)} days
                        </span>
                      </td>
                      <td>
                        <strong>{rental.bookSnapshot.title}</strong>
                        <br />
                        <small>{rental.bookSnapshot.isbn}</small>
                      </td>
                      <td>{rental.userSnapshot.enrollmentNumber}</td>
                      <td>{rental.userSnapshot.email}</td>
                      <td>{rental.userId?.phone || "N/A"}</td>
                      <td>
                        {new Date(rental.dueDate).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeView === "history" && (
          <div className={styles.tableContainer}>
            <h2>Complete Rental History</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Book</th>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Returned</th>
                </tr>
              </thead>
              <tbody>
                {rentalHistory.map((rental) => (
                  <tr key={rental._id}>
                    <td>
                      {new Date(rental.issuedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <strong>{rental.bookSnapshot.title}</strong>
                      <br />
                      <small>{rental.bookSnapshot.author}</small>
                    </td>
                    <td>{rental.userSnapshot.enrollmentNumber}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          rental.status === "ACTIVE"
                            ? styles.badgeActive
                            : rental.status.includes("RETURNED")
                              ? styles.badgeReturned
                              : rental.status === "OVERDUE"
                                ? styles.badgeOverdue
                                : styles.badgeNeutral
                        }`}
                      >
                        {rental.status}
                      </span>
                    </td>
                    <td>
                      {rental.actualReturnedAt
                        ? new Date(rental.actualReturnedAt).toLocaleDateString(
                            "en-IN",
                          )
                        : rental.status === "ACTIVE"
                          ? `Due: ${new Date(rental.dueDate).toLocaleDateString("en-IN")}`
                          : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
