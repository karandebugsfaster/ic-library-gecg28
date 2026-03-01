// src/app/manager/dashboard/page.js

"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PendingRequestsSection from "@/components/manager/PendingRequestsSection";
import ActiveMembersModal from "@/components/manager/ActiveMembersModal";
import FacultiesModal from "@/components/manager/FacultiesModal";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showFacultiesModal, setShowFacultiesModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user?.role !== "manager") {
      router.push("/unauthorized");
      return;
    }
    fetchStats();
  }, [session, status, router]);

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  const handleReturnBook = async (rentalId) => {
    if (!confirm("Mark this book as returned and make it available?")) return;

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

  const handleSendWhatsApp = (recipients, messageType) => {
    if (recipients.length === 0) {
      alert("No recipients found");
      return;
    }

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

    const phoneNumbers = recipients.map((r) => r.phone).filter(Boolean);
    if (phoneNumbers.length === 0) {
      alert("❌ No phone numbers found for selected students");
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const confirmSend = window.confirm(
      `Send WhatsApp message to ${phoneNumbers.length} student(s)?\n\nMessage:\n${message}`,
    );

    if (!confirmSend) return;

    phoneNumbers.forEach((phone, index) => {
      setTimeout(() => {
        const cleanPhone = phone.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
      }, index * 1000);
    });

    alert(
      `✅ Opening WhatsApp for ${phoneNumbers.length} student(s). Please send the messages manually.`,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-sm sm:text-base">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl text-center max-w-md">
          <div className="text-red-600 text-4xl sm:text-5xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-slate-600 mb-4 text-sm sm:text-base">
            Unable to fetch dashboard data
          </p>
          <button
            onClick={fetchStats}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Manager Dashboard
              </h1>
              <p className="text-slate-600 text-xs">IC Library</p>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
            >
              <svg
                className="w-6 h-6 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Manager Dashboard
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                IC Library Management System
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/manager/import")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Import Books
              </button>

              <button
                onClick={() => router.push("/manager/assign")}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Assign Book
              </button>

              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Library
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 space-y-2"
              >
                <button
                  onClick={() => {
                    router.push("/manager/import");
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center gap-2 text-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Import Books
                </button>

                <button
                  onClick={() => {
                    router.push("/manager/assign");
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Assign Book
                </button>

                <button
                  onClick={() => {
                    router.push("/");
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center gap-2 text-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Library
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center gap-2 text-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Stats Cards - Horizontal Scroll on Mobile */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile: Horizontal Scroll */}
          <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {[
                {
                  icon: "📚",
                  value: stats.books.total,
                  label: "Total Books",
                  sub1: `${stats.books.available} Available`,
                  sub2: `${stats.books.rented} Rented`,
                  gradient: "from-purple-600 to-purple-800",
                  border: "border-purple-500",
                  textColor: "text-purple-200",
                },
                {
                  icon: "👥",
                  value: stats.users.total,
                  label: "Total Students",
                  sub1: `${stats.users.active} Active`,
                  sub2: `${stats.users.blocked} Blocked`,
                  gradient: "from-pink-500 to-red-600",
                  border: "border-pink-500",
                  textColor: "text-pink-200",
                  onClick: () => setShowMembersModal(true),
                },
                {
                  icon: "👔",
                  value: stats.faculties?.total || 0,
                  label: "Total Faculties",
                  sub1: `${stats.faculties?.active || 0} Active`,
                  sub2: `${stats.faculties?.pending || 0} Requests`,
                  gradient: "from-indigo-600 to-blue-700",
                  border: "border-indigo-500",
                  textColor: "text-indigo-200",
                  onClick: () => setShowFacultiesModal(true),
                },
                {
                  icon: "📖",
                  value: stats.rentals.active,
                  label: "Active Rentals",
                  sub1: `${stats.rentals.today} Today`,
                  sub2: `${stats.rentals.total} Total`,
                  gradient: "from-cyan-500 to-blue-600",
                  border: "border-cyan-500",
                  textColor: "text-cyan-200",
                },
                {
                  icon: "⚠️",
                  value: stats.rentals.overdue,
                  label: "Overdue Books",
                  sub1: "Needs Attention",
                  gradient: "from-orange-500 to-red-600",
                  border: "border-orange-500",
                  textColor: "text-orange-200",
                  onClick: () => setActiveView("overdue"),
                },
                {
                  icon: "🔔",
                  value: stats.pendingRequests || 0,
                  label: "Pending Requests",
                  sub1:
                    stats.pendingRequests > 0
                      ? "Requires Approval"
                      : "All Clear",
                  gradient: "from-amber-500 to-orange-600",
                  border: "border-amber-500",
                  textColor: "text-amber-200",
                  onClick: () => setActiveView("requests"),
                },
                {
                  icon: "⏰",
                  value: dueSoonRentals?.length || 0,
                  label: "Due Tomorrow",
                  sub1: "Send Reminders",
                  gradient: "from-yellow-500 to-amber-600",
                  border: "border-yellow-500",
                  textColor: "text-yellow-200",
                  onClick: () => setActiveView("duesoon"),
                },
                {
                  icon: "📋",
                  value: rentalHistory?.length || 0,
                  label: "All Records",
                  sub1: "Complete History",
                  gradient: "from-slate-600 to-slate-800",
                  border: "border-slate-500",
                  textColor: "text-slate-200",
                  onClick: () => setActiveView("history"),
                },
              ].map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={card.onClick}
                  className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white shadow-xl min-w-[280px] ${card.onClick ? "cursor-pointer hover:scale-105" : ""} transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{card.icon}</div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{card.value}</div>
                      <div
                        className={`${card.textColor} text-xs font-medium mt-1`}
                      >
                        {card.label}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex justify-between text-xs pt-3 border-t ${card.border}`}
                  >
                    <span className={card.textColor}>{card.sub1}</span>
                    {card.sub2 && (
                      <span className={card.textColor}>{card.sub2}</span>
                    )}
                  </div>
                  {card.onClick && (
                    <div
                      className={`text-xs ${card.textColor} mt-2 font-medium`}
                    >
                      Tap to view →
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* (Keep your existing desktop cards here - same as before) */}
            {/* Total Books */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">📚</div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{stats.books.total}</div>
                  <div className="text-purple-200 text-sm font-medium mt-1">
                    Total Books
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-purple-500">
                <span className="text-purple-200">
                  {stats.books.available} Available
                </span>
                <span className="text-purple-200">
                  {stats.books.rented} Rented
                </span>
              </div>
            </motion.div>

            {/* Total Users */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowMembersModal(true)}
              className="bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">👥</div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{stats.users.active}</div>
                  <div className="text-pink-200 text-sm font-medium mt-1">
                    Total Students
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-pink-500">
                <span className="text-pink-200">
                  {stats.users.active} Active
                </span>
                <span className="text-pink-200">
                  {stats.users.blocked} Blocked
                </span>
              </div>
              <div className="text-xs text-pink-100 mt-2 font-medium">
                Click to manage →
              </div>
            </motion.div>

            {/* Total Faculties */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              onClick={() => setShowFacultiesModal(true)}
              className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">👔</div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {stats.faculties?.total || 0}
                  </div>
                  <div className="text-indigo-200 text-sm font-medium mt-1">
                    Total Faculties
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-indigo-500">
                <span className="text-indigo-200">
                  {stats.faculties?.active || 0} Active
                </span>
                <span className="text-indigo-200">
                  {stats.faculties?.pending || 0} Requests
                </span>
              </div>
              <div className="text-xs text-indigo-100 mt-2 font-medium">
                Click to manage →
              </div>
            </motion.div>

            {/* Active Rentals */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">📖</div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {stats.rentals.active}
                  </div>
                  <div className="text-cyan-200 text-sm font-medium mt-1">
                    Active Rentals
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-cyan-500">
                <span className="text-cyan-200">
                  {stats.rentals.today} Today
                </span>
                <span className="text-cyan-200">
                  {stats.rentals.total} Total
                </span>
              </div>
            </motion.div>

            {/* Overdue Books */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setActiveView("overdue")}
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">⚠️</div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {stats.rentals.overdue}
                  </div>
                  <div className="text-orange-200 text-sm font-medium mt-1">
                    Overdue Books
                  </div>
                </div>
              </div>
              <div className="text-sm pt-4 border-t border-orange-500">
                <span className="text-orange-200">Needs Attention</span>
              </div>
            </motion.div>

            {/* Pending Requests */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              onClick={() => setActiveView("requests")}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">🔔</div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {stats.pendingRequests || 0}
                  </div>
                  <div className="text-amber-200 text-sm font-medium mt-1">
                    Pending Requests
                  </div>
                </div>
              </div>
              <div className="text-sm pt-4 border-t border-amber-500">
                <span className="text-amber-200">
                  {stats.pendingRequests > 0
                    ? "Requires Approval"
                    : "All Clear"}
                </span>
              </div>
            </motion.div>

            {/* Due Soon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setActiveView("duesoon")}
              className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">⏰</div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {dueSoonRentals?.length || 0}
                  </div>
                  <div className="text-yellow-200 text-sm font-medium mt-1">
                    Due Tomorrow
                  </div>
                </div>
              </div>
              <div className="text-sm pt-4 border-t border-yellow-500">
                <span className="text-yellow-200">Send Reminders</span>
              </div>
            </motion.div>

            {/* All History */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              onClick={() => setActiveView("history")}
              className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">📋</div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {rentalHistory?.length || 0}
                  </div>
                  <div className="text-slate-200 text-sm font-medium mt-1">
                    All Records
                  </div>
                </div>
              </div>
              <div className="text-sm pt-4 border-t border-slate-500">
                <span className="text-slate-200">Complete History</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Navigation Tabs - Horizontal Scroll */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              {
                id: "requests",
                label: "Requests",
                count: stats.pendingRequests || 0,
                icon: "🔔",
              },
              {
                id: "today",
                label: "Today",
                count: todayRentals.length,
                icon: "📅",
              },
              {
                id: "active",
                label: "Rented",
                count: currentlyRented.length,
                icon: "📖",
              },
              {
                id: "duesoon",
                label: "Due Soon",
                count: dueSoonRentals?.length || 0,
                icon: "⏰",
              },
              {
                id: "overdue",
                label: "Overdue",
                count: overdueRentals.length,
                icon: "⚠️",
              },
              { id: "history", label: "History", icon: "📋" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeView === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeView === tab.id
                        ? "bg-white text-blue-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Views - Keep all your existing content sections but add responsive table handling */}
        {/* Content Views */}
        <AnimatePresence mode="wait">
          {/* Overview */}
          {activeView === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                  Quick Stats
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-slate-600 mb-1">
                      Total Rentals
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {stats.rentals.total}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-slate-600 mb-1">
                      Available
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.books.available}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-slate-600 mb-1">
                      Students
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {stats.users.total}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-slate-600 mb-1">
                      Due Tomorrow
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                      {dueSoonRentals?.length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgent Alerts */}
              {overdueRentals.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-red-900 flex items-center gap-2">
                      <span className="text-xl sm:text-2xl">⚠️</span>
                      Urgent: Overdue Books
                    </h2>
                    <button
                      onClick={() => setActiveView("overdue")}
                      className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
                    >
                      View All ({overdueRentals.length})
                    </button>
                  </div>
                  <div className="space-y-2">
                    {overdueRentals.slice(0, 5).map((rental) => {
                      const daysOverdue = Math.ceil(
                        (new Date() - new Date(rental.dueDate)) /
                          (1000 * 60 * 60 * 24),
                      );
                      return (
                        <div
                          key={rental._id}
                          className="bg-white rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-sm sm:text-base">
                              {rental.bookSnapshot.title}
                            </div>
                            <div className="text-xs sm:text-sm text-slate-600">
                              {rental.userSnapshot.enrollmentNumber}
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold whitespace-nowrap">
                            {daysOverdue} days overdue
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Due Tomorrow */}
              {dueSoonRentals && dueSoonRentals.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-amber-900 flex items-center gap-2">
                      <span className="text-xl sm:text-2xl">⏰</span>
                      Due Tomorrow
                    </h2>
                    <button
                      onClick={() => setActiveView("duesoon")}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-all"
                    >
                      View All ({dueSoonRentals.length})
                    </button>
                  </div>
                  <div className="space-y-2">
                    {dueSoonRentals.slice(0, 5).map((rental) => (
                      <div
                        key={rental._id}
                        className="bg-white rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 text-sm sm:text-base">
                            {rental.bookSnapshot.title}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600">
                            {rental.userSnapshot.enrollmentNumber}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-bold whitespace-nowrap">
                          Due tomorrow
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Pending Requests */}
          {activeView === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PendingRequestsSection
                managerId={session?.user?.id}
                onUpdate={fetchStats}
              />
            </motion.div>
          )}

          {/* Today's Rentals */}
          {activeView === "today" && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Books Rented Today
                </h2>
              </div>

              {todayRentals.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">📅</div>
                  <p className="text-slate-600 text-base sm:text-lg">
                    No rentals today
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Time
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Book
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Student
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Email
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {todayRentals.map((rental) => (
                        <tr
                          key={rental._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                            {new Date(rental.issuedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {rental.bookSnapshot.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              {rental.bookSnapshot.author}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                            {rental.userSnapshot.enrollmentNumber}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                            {rental.userSnapshot.email}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                            {new Date(rental.dueDate).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Currently Rented - THIS WAS MISSING/BROKEN */}
          {activeView === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Currently Rented Books
                </h2>
              </div>

              {currentlyRented.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">📖</div>
                  <p className="text-slate-600 text-base sm:text-lg">
                    No active rentals
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Book
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          ISBN
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Student
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Email
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Issued
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Due
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {currentlyRented.map((rental) => {
                        const daysUntilDue = getDaysRemaining(rental.dueDate);
                        const isOverdue = daysUntilDue < 0;
                        const isDueSoon = daysUntilDue === 1;

                        return (
                          <tr
                            key={rental._id}
                            className={`hover:bg-slate-50 transition-colors ${
                              isOverdue
                                ? "bg-red-50"
                                : isDueSoon
                                  ? "bg-amber-50"
                                  : ""
                            }`}
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                                {rental.bookSnapshot.title}
                              </div>
                              <div className="text-xs text-slate-500">
                                {rental.bookSnapshot.author}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                              {rental.bookSnapshot.isbn}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                              {rental.userSnapshot.enrollmentNumber}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                              {rental.userSnapshot.email}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                              {new Date(rental.issuedAt).toLocaleDateString(
                                "en-GB",
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                              {new Date(rental.dueDate).toLocaleDateString(
                                "en-GB",
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                  isOverdue
                                    ? "bg-red-100 text-red-700"
                                    : isDueSoon
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-green-100 text-green-700"
                                }`}
                              >
                                {isOverdue
                                  ? `${Math.abs(daysUntilDue)} days overdue`
                                  : isDueSoon
                                    ? "Due tomorrow"
                                    : `${daysUntilDue} days left`}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <button
                                onClick={() => handleReturnBook(rental._id)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-all whitespace-nowrap"
                              >
                                ✓ Return
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Due Soon */}
          {activeView === "duesoon" && (
            <motion.div
              key="duesoon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span>⏰</span>
                  Books Due Tomorrow
                </h2>
                {dueSoonRentals && dueSoonRentals.length > 0 && (
                  <button
                    onClick={() =>
                      handleSendWhatsApp(
                        dueSoonRentals.map((r) => ({
                          phone: r.userId?.phone,
                          name: r.userSnapshot.enrollmentNumber,
                        })),
                        "duesoon",
                      )
                    }
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span>📱</span>
                    Send WhatsApp to All
                  </button>
                )}
              </div>

              {!dueSoonRentals || dueSoonRentals.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">✓</div>
                  <p className="text-slate-600 text-base sm:text-lg">
                    No books due tomorrow
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Book
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Student
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Email
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Phone
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Due Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          WhatsApp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dueSoonRentals.map((rental) => (
                        <tr
                          key={rental._id}
                          className="hover:bg-amber-50 bg-amber-50/30 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {rental.bookSnapshot.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              {rental.bookSnapshot.isbn}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                            {rental.userSnapshot.enrollmentNumber}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                            {rental.userSnapshot.email}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                            {rental.userId?.phone || "N/A"}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                            {new Date(rental.dueDate).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {rental.userId?.phone && (
                              <button
                                onClick={() =>
                                  handleSendWhatsApp(
                                    [
                                      {
                                        phone: rental.userId.phone,
                                        name: rental.userSnapshot
                                          .enrollmentNumber,
                                      },
                                    ],
                                    "duesoon",
                                  )
                                }
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-all"
                              >
                                📱 Send
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Overdue */}
          {activeView === "overdue" && (
            <motion.div
              key="overdue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span>⚠️</span>
                  Overdue Books - Action Required
                </h2>
                {overdueRentals.length > 0 && (
                  <button
                    onClick={() =>
                      handleSendWhatsApp(
                        overdueRentals.map((r) => ({
                          phone: r.userId?.phone,
                          name: r.userSnapshot.enrollmentNumber,
                        })),
                        "overdue",
                      )
                    }
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span>📱</span>
                    Send WhatsApp to All
                  </button>
                )}
              </div>

              {overdueRentals.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">✓</div>
                  <p className="text-slate-600 text-base sm:text-lg">
                    No overdue books
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Days Overdue
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Book
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Student
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Email
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Phone
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Due Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          WhatsApp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {overdueRentals.map((rental) => {
                        const daysOverdue = Math.ceil(
                          (new Date() - new Date(rental.dueDate)) /
                            (1000 * 60 * 60 * 24),
                        );

                        return (
                          <tr
                            key={rental._id}
                            className="hover:bg-red-50 bg-red-50/30 transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                                {daysOverdue} days
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                                {rental.bookSnapshot.title}
                              </div>
                              <div className="text-xs text-slate-500">
                                {rental.bookSnapshot.isbn}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                              {rental.userSnapshot.enrollmentNumber}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                              {rental.userSnapshot.email}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                              {rental.userId?.phone || "N/A"}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                              {new Date(rental.dueDate).toLocaleDateString(
                                "en-GB",
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              {rental.userId?.phone && (
                                <button
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
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-all"
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
                </div>
              )}
            </motion.div>
          )}

          {/* History - THIS WAS MISSING/BROKEN */}
          {activeView === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Complete Rental History
                </h2>
              </div>

              {rentalHistory.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">📋</div>
                  <p className="text-slate-600 text-base sm:text-lg">
                    No rental history
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Book
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Student
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">
                          Returned
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rentalHistory.map((rental) => (
                        <tr
                          key={rental._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                            {new Date(rental.issuedAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {rental.bookSnapshot.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              {rental.bookSnapshot.author}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                            {rental.userSnapshot.enrollmentNumber}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                rental.status === "ACTIVE"
                                  ? "bg-blue-100 text-blue-700"
                                  : rental.status.includes("RETURNED")
                                    ? "bg-green-100 text-green-700"
                                    : rental.status === "OVERDUE"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {rental.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                            {rental.actualReturnedAt
                              ? new Date(
                                  rental.actualReturnedAt,
                                ).toLocaleDateString("en-GB")
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ActiveMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        managerId={session?.user?.id}
        onUpdate={fetchStats}
      />

      <FacultiesModal
        isOpen={showFacultiesModal}
        onClose={() => setShowFacultiesModal(false)}
        managerId={session?.user?.id}
        onUpdate={fetchStats}
      />
    </div>
  );
}
