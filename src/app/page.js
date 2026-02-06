// // src/app/page.js

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import BookCard from '@/components/BookCard';
// import SearchBar from '@/components/SearchBar';
// import GenreFilter from '@/components/GenreFilter';
// import Pagination from '@/components/Pagination';
// import styles from './page.module.css';

// export default function HomePage() {
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalBooks: 0
//   });

//   const [filters, setFilters] = useState({
//     search: '',
//     genre: 'all',
//     page: 1
//   });

//   // Fetch books
//   const fetchBooks = useCallback(async () => {
//     setLoading(true);

//     try {
//       const params = new URLSearchParams({
//         page: filters.page.toString(),
//         limit: '20'
//       });

//       if (filters.search) params.append('search', filters.search);
//       if (filters.genre !== 'all') params.append('genre', filters.genre);

//       const response = await fetch(`/api/books?${params}`);
//       const data = await response.json();

//       if (data.success) {
//         setBooks(data.data.books);
//         setPagination(data.data.pagination);
//       }
//     } catch (error) {
//       console.error('Failed to fetch books:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => {
//     fetchBooks();
//   }, [fetchBooks]);

//   const handleSearch = (query) => {
//     setFilters(prev => ({ ...prev, search: query, page: 1 }));
//   };

//   const handleGenreChange = (genre) => {
//     setFilters(prev => ({ ...prev, genre, page: 1 }));
//   };

//   const handlePageChange = (page) => {
//     setFilters(prev => ({ ...prev, page }));
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <div className={styles.container}>
//       {/* Hero Section */}
//       <header className={styles.hero}>
//         <h1 className={styles.heroTitle}>
//           IC Department Library
//         </h1>
//         <p className={styles.heroSubtitle}>
//           Discover and rent from our collection of {pagination.totalBooks}+ books
//         </p>
//       </header>

//       {/* Search & Filter Bar */}
//       <div className={styles.filterBar}>
//         <SearchBar onSearch={handleSearch} />
//         <GenreFilter onGenreChange={handleGenreChange} />
//       </div>

//       {/* Results Info */}
//       {filters.search || filters.genre !== 'all' ? (
//         <div className={styles.resultsInfo}>
//           Showing {books.length} of {pagination.totalBooks} books
//           {filters.search && ` for "${filters.search}"`}
//           {filters.genre !== 'all' && ` in ${filters.genre}`}
//         </div>
//       ) : null}

//       {/* Books Grid */}
//       {loading ? (
//         <div className={styles.loadingContainer}>
//           <div className={styles.spinner}></div>
//           <p>Loading books...</p>
//         </div>
//       ) : books.length === 0 ? (
//         <div className={styles.emptyState}>
//           <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
//             <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
//           </svg>
//           <h3>No books found</h3>
//           <p>Try adjusting your search or filters</p>
//         </div>
//       ) : (
//         <>
//           <div className={styles.booksGrid}>
//             {books.map(book => (
//               <BookCard key={book._id} book={book} />
//             ))}
//           </div>

//           <Pagination
//             currentPage={pagination.currentPage}
//             totalPages={pagination.totalPages}
//             onPageChange={handlePageChange}
//           />
//         </>
//       )}
//     </div>
//   );
// }
// src/app/page.js

"use client";

import { useState, useEffect } from "react";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import Pagination from "@/components/Pagination";
import styles from "./page.module.css";

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // ✅ FIX: Use filters as direct dependencies, not fetchBooks
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

        const response = await fetch(`/api/books?${params}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success) {
          setBooks(data.data.books);
          setPagination({
            ...data.data.pagination,
            currentPage: filters.page, // 🔥 source of truth
          });
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [filters.search, filters.genre, filters.page]); // ✅ Direct dependencies

  const handleSearch = (query) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
  };

  const handleGenreChange = (genre) => {
    setFilters((prev) => ({ ...prev, genre, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>IC Department Library</h1>
        <p className={styles.heroSubtitle}>
          Discover and rent from our collection of {pagination.totalBooks}+
          books
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
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
