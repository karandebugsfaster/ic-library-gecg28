// src/app/page.js - Updated with Logo in Navbar

"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import Pagination from "@/components/Pagination";
// import SignInModal from '@/components/SignInModal';
import AboutDeveloper from "@/components/AboutDeveloper";
import FloatingChatButton from "@/components/FloatingChatButton";
// import { getUserSession } from '@/lib/utils/session';
import styles from "./page.module.css";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    genre: "all",
    page: 1,
  });

  // useEffect(() => {
  //   const session = getUserSession();
  //   setUserSession(session);
  // }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: filters.page.toString(),
          limit: "20",
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.genre !== "all") params.append("genre", filters.genre);

        const response = await fetch(`/api/books?${params}`);
        const data = await response.json();

        if (data.success) {
          setBooks(data.data.books);
          setPagination(data.data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [filters.search, filters.genre, filters.page]);

  const handleSearch = useCallback((query) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
  }, []);

  const handleGenreChange = useCallback((genre) => {
    setFilters((prev) => ({ ...prev, genre, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

    const handleDashboardClick = () => {
    // Check if user is logged in
    if (status === 'authenticated' && session?.user) {
      const role = session.user.role;

      // Redirect to appropriate dashboard
      if (role === 'manager') {
        router.push('/manager/dashboard');
      } else if (role === 'faculty') {
        router.push('/faculty/dashboard');
      } else if (role === 'student') {
        router.push('/student/dashboard');
      }
    } else {
      // Not logged in, redirect to login
      router.push('/login');
    }
  };

  return (
    <div className={styles.container}>
      {/* ========== UPDATED: Header with Logo ========== */}
      <div className={styles.topBar}>
        <div className={styles.logoSection}>
          <div className={styles.logoImage}>
            <Image
              src="/images/img-2.png"
              alt="IC Library Logo"
              width={80}
              height={80}
              priority
            />
          </div>
          <span className={styles.logo}>IC Library</span>
        </div>

        <div className={styles.authButtons}>
          {/* {userSession ? (
            <>
              <span className={styles.welcomeText}>
                {userSession.role === "manager" ? "👔 Manager" : "👤"}{" "}
                {userSession.enrollmentNumber || userSession.username}
              </span>
              <button
                onClick={() => {
                  if (userSession.role === "manager") {
                    router.push("/manager/dashboard");
                  } else {
                    router.push("/student/profile");
                  }
                }}
                className={styles.profileButton}
              >
                {userSession.role === "manager" ? "Dashboard" : "My Profile"}
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className={styles.signInButton}
            >
              Sign In
            </button>
          )} */}
          {status === 'authenticated' ? (
                <>
                  <div className="hidden sm:block text-sm text-slate-600">
                    Welcome, <span className="font-semibold text-slate-900">{session.user.name}</span>
                  </div>
                  <button
                    onClick={handleDashboardClick}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-xs sm:text-sm"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-xs sm:text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all text-sm"
                  >
                    Register
                  </Link>
                </>
              )}

          {/* Desktop About Button */}
          <button
            onClick={() => router.push("/about")}
            className={styles.aboutButton}
          >
            About
          </button>

          {/* Mobile Hamburger Menu */}
          <button
            className={styles.hamburgerButton}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {showMobileMenu && (
        <>
          <div
            className={styles.mobileMenuOverlay}
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className={styles.mobileMenuSidebar}>
            <div className={styles.mobileMenuHeader}>
              <h3>Menu</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div className={styles.mobileMenuContent}>
              <button
                onClick={() => {
                  router.push("/about");
                  setShowMobileMenu(false);
                }}
                className={styles.mobileMenuItem}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                About Developer
              </button>
            </div>
          </div>
        </>
      )}

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>IC Department Library</h1>
        <p className={styles.heroSubtitle}>
          Browse our collection of {pagination.totalBooks}+ books
        </p>
        <p className={styles.heroNote}>
          📚 Visit the library manager to rent books
        </p>
      </header>

      {/* Search & Filter Bar */}
      <div className={styles.filterBar}>
        <SearchBar onSearch={handleSearch} />
        <GenreFilter onGenreChange={handleGenreChange} />
      </div>

      {/* Results Info */}
      {filters.search || filters.genre !== "all" ? (
        <div className={styles.resultsInfo}>
          Showing {books.length} of {pagination.totalBooks} books
          {filters.search && ` for "${filters.search}"`}
          {filters.genre !== "all" && ` in ${filters.genre}`}
        </div>
      ) : null}

      {/* Books Grid */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className={styles.emptyState}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className={styles.booksGrid}>
            {books.map((book) => (
              <BookCard key={book._id} book={book} viewOnly={true} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Sign In Modal
      // {showSignIn && (
      //   <SignInModal 
      //     onClose={() => setShowSignIn(false)}
      //     onSuccess={(session) => {
      //       setUserSession(session);
      //       setShowSignIn(false);
      //     }}
      //   />
      // )} */}

      {/* About Developer Section */}
      <AboutDeveloper />

      {/* Floating AI Chat Button */}
      <FloatingChatButton />
    </div>
  );
}
// src/app/(library)/page.js

// 'use client';

// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';

// export default function LibraryPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   const fetchBooks = async () => {
//     try {
//       const res = await fetch('/api/books');
//       const data = await res.json();
//      if (data.success && Array.isArray(data.books)) {
//   setBooks(data.books);
// } else {
//   setBooks([]); // always keep it an array
// }
//     } catch (error) {
//       console.error('Failed to fetch books:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDashboardClick = () => {
//     // Check if user is logged in
//     if (status === 'authenticated' && session?.user) {
//       const role = session.user.role;

//       // Redirect to appropriate dashboard
//       if (role === 'manager') {
//         router.push('/manager/dashboard');
//       } else if (role === 'faculty') {
//         router.push('/faculty/dashboard');
//       } else if (role === 'student') {
//         router.push('/student/dashboard');
//       }
//     } else {
//       // Not logged in, redirect to login
//       router.push('/login');
//     }
//   };

//   const filteredBooks = books.filter((book) => {
//     const matchesSearch =
//       book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       book.isbn?.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesCategory =
//       selectedCategory === 'all' || book.category === selectedCategory;

//     return matchesSearch && matchesCategory;
//   });

//   const categories = ['all', ...new Set(books.map((b) => b.category).filter(Boolean))];

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
//           <div className="flex items-center justify-between">
//             {/* Logo */}
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
//                 <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                 </svg>
//               </div>
//               <div>
//                 <h1 className="text-lg sm:text-xl font-bold text-slate-900">IC Library</h1>
//                 <p className="text-xs text-slate-600 hidden sm:block">Information & Communication</p>
//               </div>
//             </div>

//             {/* Navigation */}
//             <div className="flex items-center gap-2 sm:gap-3">
//               {status === 'authenticated' ? (
//                 <>
//                   <div className="hidden sm:block text-sm text-slate-600">
//                     Welcome, <span className="font-semibold text-slate-900">{session.user.name}</span>
//                   </div>
//                   <button
//                     onClick={handleDashboardClick}
//                     className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-xs sm:text-sm"
//                   >
//                     Dashboard
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     href="/login"
//                     className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-xs sm:text-sm"
//                   >
//                     Sign In
//                   </Link>
//                   <Link
//                     href="/register"
//                     className="hidden sm:block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all text-sm"
//                   >
//                     Register
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
//           <h1 className="text-3xl sm:text-5xl font-bold mb-4">IC Department Library</h1>
//           <p className="text-lg sm:text-xl text-blue-100 mb-2">Browse our collection of {books.length}+ books</p>
//           <p className="text-sm sm:text-base text-blue-200">📚 Visit the library manager to rent books</p>
//         </div>
//       </div>

//       {/* Search & Filter */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
//         <div className="flex flex-col sm:flex-row gap-4 mb-6">
//           {/* Search */}
//           <div className="flex-1">
//             <div className="relative">
//               <svg
//                 className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search books, authors, ISBN..."
//                 className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base"
//               />
//             </div>
//           </div>

//           {/* Category Filter */}
//           <select
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             className="px-4 py-3 sm:py-4 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base bg-white"
//           >
//             {categories.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat === 'all' ? 'All Categories' : cat}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Books Grid */}
//         {loading ? (
//           <div className="flex items-center justify-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         ) : filteredBooks.length === 0 ? (
//           <div className="text-center py-20">
//             <div className="text-6xl mb-4">📚</div>
//             <p className="text-slate-600 text-lg">No books found</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
//             {filteredBooks.map((book) => (
//               <div
//                 key={book._id}
//                 className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
//               >
//                 {/* Book Cover */}
//                 <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-48 sm:h-64 flex items-center justify-center relative">
//                   <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                   </svg>
//                   {/* Status Badge */}
//                   <div className="absolute top-3 right-3">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-bold ${
//                         book.rentalStatus === 'AVAILABLE'
//                           ? 'bg-green-500 text-white'
//                           : 'bg-red-500 text-white'
//                       }`}
//                     >
//                       {book.rentalStatus === 'AVAILABLE' ? 'AVAILABLE' : 'RENTED'}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Book Info */}
//                 <div className="p-4">
//                   <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 text-sm sm:text-base">{book.title}</h3>
//                   <p className="text-slate-600 text-xs sm:text-sm mb-2">{book.author}</p>
//                   {book.isbn && <p className="text-slate-500 text-xs">ISBN: {book.isbn}</p>}
//                   {book.category && (
//                     <div className="mt-2">
//                       <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
//                         {book.category}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
