// src/components/GenreFilter.js - Working Logic + Beautiful Styling

'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './GenreFilter.module.css';

export default function GenreFilter({ onGenreChange }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch genres from API
    fetch('/api/books/genres')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGenres(data.data); // ✅ Your working data structure
        }
      })
      .catch(err => console.error('Failed to fetch genres:', err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (genre) => {
    setSelectedGenre(genre);
    onGenreChange(genre);
    setIsOpen(false);
  };

  return (
    <div className={styles.filterContainer} ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        className={`${styles.filterButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <svg 
          className={styles.filterIcon}
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        
        <span className={styles.selectedText}>
          {selectedGenre === 'all' ? 'All Categories' : selectedGenre}
        </span>
        
        <svg 
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {/* All categories Option */}
          <button
            className={`${styles.dropdownItem} ${selectedGenre === 'all' ? styles.active : ''}`}
            onClick={() => handleSelect('all')}
            role="option"
            aria-selected={selectedGenre === 'all'}
          >
            <span>All categories</span>
            {selectedGenre === 'all' && (
              <svg 
                className={styles.checkmark}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </button>
          
          {/* Divider */}
          {genres.length > 0 && <div className={styles.divider}></div>}
          
          {/* Genre Options */}
          {genres.map(genre => (
            <button
              key={genre}
              className={`${styles.dropdownItem} ${selectedGenre === genre ? styles.active : ''}`}
              onClick={() => handleSelect(genre)}
              role="option"
              aria-selected={selectedGenre === genre}
            >
              <span>{genre}</span>
              {selectedGenre === genre && (
                <svg 
                  className={styles.checkmark}
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ))}

          {/* Empty State */}
          {genres.length === 0 && (
            <div className={styles.emptyState}>
              No genres available
            </div>
          )}
        </div>
      )}
    </div>
  );
}