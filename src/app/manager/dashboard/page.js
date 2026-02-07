// src/app/manager/dashboard/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserSession, clearUserSession } from "@/lib/utils/session";
import styles from "./dashboard.module.css";

export default function ManagerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    const session = getUserSession();
    if (!session || session.role !== "manager") {
      alert("Unauthorized - Manager access only");
      router.push("/");
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/manager/stats");
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

  const handleLogout = () => {
    clearUserSession();
    router.push("/");
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  const handleReturnBook = async (rentalId) => {
    if (!confirm("Mark this book as returned and make it available?")) {
      return;
    }

    try {
      const response = await fetch("/api/manager/return-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalId }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Book marked as returned!");
        fetchStats();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert("❌ Failed to return book");
    }
  };

  // NEW: Send WhatsApp Messages
  const handleSendWhatsApp = (recipients, messageType) => {
    if (recipients.length === 0) {
      alert("No recipients found");
      return;
    }

    // Generate message based on type
    let message = "";
    if (messageType === "overdue") {
      message = `Dear Student,

Your library book is OVERDUE. Please return it immediately to avoid penalties.

Contact the library for assistance.

- IC Library Management`;
    } else if (messageType === "duesoon") {
      message = `Dear Student,

Your library book is due TOMORROW. Please return it on time to avoid penalties.

- IC Library Management`;
    }

    // Create WhatsApp links for each recipient
    const phoneNumbers = recipients.map((r) => r.phone).filter(Boolean);

    if (phoneNumbers.length === 0) {
      alert("❌ No phone numbers found for selected students");
      return;
    }

    // Open WhatsApp for each number
    const encodedMessage = encodeURIComponent(message);

    // Show confirmation
    const confirm = window.confirm(
      `Send WhatsApp message to ${phoneNumbers.length} student(s)?\n\nMessage:\n${message}`,
    );

    if (!confirm) return;

    // Open WhatsApp links
    phoneNumbers.forEach((phone, index) => {
      setTimeout(() => {
        const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digits
        const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
      }, index * 1000); // Delay 1 second between each
    });

    alert(
      `✅ Opening WhatsApp for ${phoneNumbers.length} student(s). Please send the messages manually.`,
    );
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
    dueSoonRentals,
    rentalHistory,
  } = data;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Manager Dashboard</h1>
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
            onClick={() => router.push("/manager/assign")}
            className={styles.assignButton}
          >
            ➕ Assign Book
          </button>
          <button
            onClick={() => router.push("/")}
            className={styles.backButton}
          >
            ← Library
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
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
          className={`${styles.tab} ${activeView === "duesoon" ? styles.activeTab : ""}`}
          onClick={() => setActiveView("duesoon")}
        >
          Due Soon ({dueSoonRentals?.length || 0})
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
        {/* Overview - Same as before */}
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
                <div>
                  Due Soon (1 day):{" "}
                  <strong>{dueSoonRentals?.length || 0} books</strong>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {overdueRentals.length > 0 && (
              <div className={styles.overviewSection}>
                <h2>⚠️ Urgent: Overdue Books</h2>
                <div className={styles.overdueQuickList}>
                  {overdueRentals.slice(0, 5).map((rental) => (
                    <div key={rental._id} className={styles.overdueQuickItem}>
                      <span>{rental.bookSnapshot.title}</span>
                      <span>{rental.userSnapshot.enrollmentNumber}</span>
                      <span className={styles.overdueDays}>
                        {Math.ceil(
                          (new Date() - new Date(rental.dueDate)) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days overdue
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dueSoonRentals && dueSoonRentals.length > 0 && (
              <div className={styles.overviewSection}>
                <h2>⏰ Due Tomorrow</h2>
                <div className={styles.dueSoonQuickList}>
                  {dueSoonRentals.slice(0, 5).map((rental) => (
                    <div key={rental._id} className={styles.dueSoonQuickItem}>
                      <span>{rental.bookSnapshot.title}</span>
                      <span>{rental.userSnapshot.enrollmentNumber}</span>
                      <span className={styles.dueSoonLabel}>Due tomorrow</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Today's Rentals - Same as before */}
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
                        {new Date(rental.dueDate).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Currently Rented */}
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentlyRented.map((rental) => {
                  const daysUntilDue = getDaysRemaining(rental.dueDate);
                  const isOverdue = daysUntilDue < 0;
                  const isDueSoon = daysUntilDue === 1;

                  return (
                    <tr
                      key={rental._id}
                      className={
                        isOverdue
                          ? styles.overdueRow
                          : isDueSoon
                            ? styles.dueSoonRow
                            : ""
                      }
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
                        {new Date(rental.issuedAt).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        {new Date(rental.dueDate).toLocaleDateString("en-GB")}
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
                              ? "Due tomorrow"
                              : `${daysUntilDue} days`}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.returnButton}
                          onClick={() => handleReturnBook(rental._id)}
                        >
                          ✓ Mark Returned
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* NEW: Due Soon Section */}
        {activeView === "duesoon" && (
          <div className={styles.tableContainer}>
            <div className={styles.sectionHeader}>
              <h2>⏰ Books Due Tomorrow</h2>
              {dueSoonRentals && dueSoonRentals.length > 0 && (
                <button
                  className={styles.whatsappButton}
                  onClick={() =>
                    handleSendWhatsApp(
                      dueSoonRentals.map((r) => ({
                        phone: r.userId?.phone,
                        name: r.userSnapshot.enrollmentNumber,
                      })),
                      "duesoon",
                    )
                  }
                >
                  📱 Send WhatsApp to All
                </button>
              )}
            </div>

            {!dueSoonRentals || dueSoonRentals.length === 0 ? (
              <p className={styles.emptyMessage}>✓ No books due tomorrow</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Due Date</th>
                    <th>WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {dueSoonRentals.map((rental) => (
                    <tr key={rental._id} className={styles.dueSoonRow}>
                      <td>
                        <strong>{rental.bookSnapshot.title}</strong>
                        <br />
                        <small>{rental.bookSnapshot.isbn}</small>
                      </td>
                      <td>{rental.userSnapshot.enrollmentNumber}</td>
                      <td>{rental.userSnapshot.email}</td>
                      <td>{rental.userId?.phone || "N/A"}</td>
                      <td>
                        {new Date(rental.dueDate).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        {rental.userId?.phone && (
                          <button
                            className={styles.whatsappButtonSmall}
                            onClick={() =>
                              handleSendWhatsApp(
                                [
                                  {
                                    phone: rental.userId.phone,
                                    name: rental.userSnapshot.enrollmentNumber,
                                  },
                                ],
                                "duesoon",
                              )
                            }
                          >
                            📱 Send
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Overdue Section - Updated */}
        {activeView === "overdue" && (
          <div className={styles.tableContainer}>
            <div className={styles.sectionHeader}>
              <h2>⚠️ Overdue Books - Action Required</h2>
              {overdueRentals.length > 0 && (
                <button
                  className={styles.whatsappButton}
                  onClick={() =>
                    handleSendWhatsApp(
                      overdueRentals.map((r) => ({
                        phone: r.userId?.phone,
                        name: r.userSnapshot.enrollmentNumber,
                      })),
                      "overdue",
                    )
                  }
                >
                  📱 Send WhatsApp to All
                </button>
              )}
            </div>

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
                    <th>WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueRentals.map((rental) => {
                    const daysOverdue = Math.ceil(
                      (new Date() - new Date(rental.dueDate)) /
                        (1000 * 60 * 60 * 24),
                    );

                    return (
                      <tr key={rental._id} className={styles.overdueRow}>
                        <td>
                          <span className={styles.badgeOverdue}>
                            {daysOverdue} days
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
                          {new Date(rental.dueDate).toLocaleDateString("en-GB")}
                        </td>
                        <td>
                          {rental.userId?.phone && (
                            <button
                              className={styles.whatsappButtonSmall}
                              onClick={() =>
                                handleSendWhatsApp(
                                  [
                                    {
                                      phone: rental.userId.phone,
                                      name: rental.userSnapshot
                                        .enrollmentNumber,
                                    },
                                  ],
                                  "overdue",
                                )
                              }
                            >
                              📱 Send
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* History - Same as before */}
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
                      {new Date(rental.issuedAt).toLocaleDateString("en-GB")}
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
                            "en-GB",
                          )
                        : rental.status === "ACTIVE"
                          ? `Due: ${new Date(rental.dueDate).toLocaleDateString("en-GB")}`
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
