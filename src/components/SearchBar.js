// // src/components/SearchBar.js

// 'use client';

// import { useState, useEffect } from 'react';
// import styles from './SearchBar.module.css';

// export default function SearchBar({ onSearch, placeholder = "Search books, authors, ISBN..." }) {
//   const [query, setQuery] = useState('');

//   // Debounce search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onSearch(query);
//     }, 300); // 300ms debounce

//     return () => clearTimeout(timer);
//   }, [query, onSearch]);

//   return (
// <div className={styles.searchContainer}>
//   <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//     <circle cx="11" cy="11" r="8"></circle>
//     <path d="m21 21-4.35-4.35"></path>
//   </svg>

//   <input
//     type="text"
//     className={styles.searchInput}
//     placeholder={placeholder}
//     value={query}
//     onChange={(e) => setQuery(e.target.value)}
//   />

//   {query && (
//     <button
//       className={styles.clearButton}
//       onClick={() => setQuery('')}
//       aria-label="Clear search"
//     >
//       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//         <line x1="18" y1="6" x2="6" y2="18"></line>
//         <line x1="6" y1="6" x2="18" y2="18"></line>
//       </svg>
//     </button>
//   )}
// </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({
  onSearch,
  placeholder = "Search books, authors, ISBN...",
}) {
  const [query, setQuery] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 🚫 Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]); // ❗ REMOVE onSearch from deps

  return (
    // <div className={styles.searchContainer}>
    //   <input
    //     type="text"
    //     className={styles.searchInput}
    //     placeholder={placeholder}
    //     value={query}
    //     onChange={(e) => setQuery(e.target.value)}
    //   />
    // </div>
    <div className={styles.searchContainer}>
      <svg
        className={styles.searchIcon}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>

      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query && (
        <button
          className={styles.clearButton}
          onClick={() => setQuery("")}
          aria-label="Clear search"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
}
