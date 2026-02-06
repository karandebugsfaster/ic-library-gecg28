// src/components/GenreFilter.js

'use client';

import { useState, useEffect } from 'react';
import styles from './GenreFilter.module.css';

export default function GenreFilter({ onGenreChange }) {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch genres from API
    fetch('/api/books/genres')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGenres(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch genres:', err));
  }, []);

  const handleSelect = (genre) => {
    setSelectedGenre(genre);
    onGenreChange(genre);
    setIsOpen(false);
  };

  return (
    <div className={styles.filterContainer}>
      <button 
        className={styles.filterButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span>{selectedGenre === 'all' ? 'All Genres' : selectedGenre}</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            <button
              className={`${styles.dropdownItem} ${selectedGenre === 'all' ? styles.active : ''}`}
              onClick={() => handleSelect('all')}
            >
              All Genres
              {selectedGenre === 'all' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
            
            {genres.map(genre => (
              <button
                key={genre}
                className={`${styles.dropdownItem} ${selectedGenre === genre ? styles.active : ''}`}
                onClick={() => handleSelect(genre)}
              >
                {genre}
                {selectedGenre === genre && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}