// src/components/Pagination.js - With Page Numbers

'use client';

import styles from './Pagination.module.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Show max 5 page numbers at a time

    if (totalPages <= maxPagesToShow + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start: 1 2 3 4 5 ... 10
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-end');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end: 1 ... 6 7 8 9 10
        pages.push('ellipsis-start');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle: 1 ... 4 5 6 ... 10
        pages.push('ellipsis-start');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.pagination}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.prevButton}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (typeof page === 'string') {
          // Ellipsis
          return (
            <span key={`${page}-${index}`} className={styles.ellipsis}>
              ⋯
            </span>
          );
        }

        // Page number button
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.nextButton}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
}