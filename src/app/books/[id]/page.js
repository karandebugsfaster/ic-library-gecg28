// src/app/books/[id]/page.js - FIXED VERSION

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './book.module.css';

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset states when ID changes
    setBook(null);
    setLoading(true);
    setError(null);
    
    fetchBookDetails();
  }, [params.id, retryCount]);

  const fetchBookDetails = async () => {
    try {
      console.log('🔍 Fetching book with ID:', params.id);

      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await fetch(`/api/books/${params.id}`, {
        cache: 'no-store', // Prevent caching issues
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load book');
      }

      if (data.success && data.data) {
        setBook(data.data);
        setError(null);
      } else {
        throw new Error('Book not found');
      }
    } catch (err) {
      console.error('❌ Failed to fetch book:', err);
      setError(err.message || 'Failed to load book details');
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2>Book Not Found</h2>
          <p>{error || 'The book you are looking for does not exist.'}</p>
          <div className={styles.errorActions}>
            <button onClick={() => router.push('/')} className={styles.backButton}>
              ← Back to Library
            </button>
            <button onClick={handleRetry} className={styles.retryButton}>
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = book.rentalStatus === 'AVAILABLE';

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.push('/')}>
        ← Back to Library
      </button>

      <div className={styles.bookDetails}>
        {/* Book Cover */}
        <div className={styles.coverSection}>
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className={styles.cover} />
          ) : (
            <div className={styles.coverPlaceholder}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          )}

          {/* Status Badge */}
          <div className={`${styles.statusBadge} ${isAvailable ? styles.available : styles.rented}`}>
            {isAvailable ? '✓ Available' : '✗ Currently Rented'}
          </div>
        </div>

        {/* Book Info */}
        <div className={styles.infoSection}>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>by {book.author}</p>

          <div className={styles.metadata}>
            {book.isbn && (
              <div className={styles.metaItem}>
                <strong>ISBN:</strong> <span>{book.isbn}</span>
              </div>
            )}
            {book.publisher && (
              <div className={styles.metaItem}>
                <strong>Publisher:</strong> <span>{book.publisher}</span>
              </div>
            )}
            {book.publishedYear && (
              <div className={styles.metaItem}>
                <strong>Year:</strong> <span>{book.publishedYear}</span>
              </div>
            )}
            {book.edition && (
              <div className={styles.metaItem}>
                <strong>Edition:</strong> <span>{book.edition}</span>
              </div>
            )}
            {book.genre && book.genre.length > 0 && (
              <div className={styles.metaItem}>
                <strong>Genre:</strong>
                <div className={styles.genres}>
                  {book.genre.map((g, i) => (
                    <span key={i} className={styles.genreTag}>{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {book.description && (
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>
          )}

          {/* Information Notice */}
          <div className={styles.rentalNotice}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <h4>Want to rent this book?</h4>
              <p>Please visit the library manager to rent books. Self-service rental is not available.</p>
            </div>
          </div>

          {/* Current Rental Info */}
          {!isAvailable && book.currentRentalInfo && (
            <div className={styles.rentedInfo}>
              <h3>Currently Rented</h3>
              <p>Expected return date: {new Date(book.currentRentalInfo.dueDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}