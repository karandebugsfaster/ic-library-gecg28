// src/app/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookCard from '@/components/BookCard';
import SearchBar from '@/components/SearchBar';
import GenreFilter from '@/components/GenreFilter';
import Pagination from '@/components/Pagination';
import SignInModal from '@/components/SignInModal';
import { getUserSession } from '@/lib/utils/session';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    genre: 'all',
    page: 1
  });

  useEffect(() => {
    // Check if user is logged in
    const session = getUserSession();
    setUserSession(session);

    const fetchBooks = async () => {
      setLoading(true);
      
      try {
        const params = new URLSearchParams({
          page: filters.page.toString(),
          limit: '20'
        });

        if (filters.search) params.append('search', filters.search);
        if (filters.genre !== 'all') params.append('genre', filters.genre);

        const response = await fetch(`/api/books?${params}`);
        const data = await response.json();

        if (data.success) {
          setBooks(data.data.books);
          setPagination(data.data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [filters.search, filters.genre, filters.page]);

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }));
  };

  const handleGenreChange = (genre) => {
    setFilters(prev => ({ ...prev, genre, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      {/* Header with Sign In */}
      <div className={styles.topBar}>
        <div className={styles.logo}>IC Library</div>
        <div className={styles.authButtons}>
          {userSession ? (
            <>
              <span className={styles.welcomeText}>
                {userSession.role === 'manager' ? '👔 Manager' : '👤'} {userSession.enrollmentNumber || userSession.username}
              </span>
              <button 
                onClick={() => {
                  if (userSession.role === 'manager') {
                    router.push('/manager/dashboard');
                  } else {
                    router.push('/student/profile');
                  }
                }}
                className={styles.profileButton}
              >
                {userSession.role === 'manager' ? 'Dashboard' : 'My Profile'}
              </button>
            </>
          ) : (
            <button onClick={() => setShowSignIn(true)} className={styles.signInButton}>
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          IC Department Library
        </h1>
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
      {filters.search || filters.genre !== 'all' ? (
        <div className={styles.resultsInfo}>
          Showing {books.length} of {pagination.totalBooks} books
          {filters.search && ` for "${filters.search}"`}
          {filters.genre !== 'all' && ` in ${filters.genre}`}
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
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className={styles.booksGrid}>
            {books.map(book => (
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

      {/* Sign In Modal */}
      {showSignIn && (
        <SignInModal 
          onClose={() => setShowSignIn(false)}
          onSuccess={(session) => {
            setUserSession(session);
            setShowSignIn(false);
          }}
        />
      )}
    </div>
  );
}