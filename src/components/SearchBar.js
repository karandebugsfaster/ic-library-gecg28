// src/components/SearchBar.js - Fixed for Pagination

'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const debounceTimer = useRef(null);

  // Debounce search with cleanup
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      onSearch(query);
    }, 300);

    // Cleanup on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]); // Only depend on query, not onSearch

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className={styles.searchContainer}>
      {/* Search Icon */}
      <div className={styles.searchIcon}>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books, authors, ISBN..."
        className={styles.searchInput}
      />

      {/* Clear Button */}
      {query && (
        <button
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}