// // src/components/BookCard.js

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import styles from './BookCard.module.css';

// export default function BookCard({ book }) {
//   const [isHovered, setIsHovered] = useState(false);

//   const statusColor = {
//     'AVAILABLE': '#22c55e',
//     'RENTED': '#ef4444',
//     'UNDER_INVESTIGATION': '#f59e0b',
//     'LOST': '#6b7280'
//   };

//   return (
//     <Link href={`/books/${book._id}`} className={styles.card}>
//       <div 
//         className={styles.cardInner}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         {/* Book Cover */}
//         <div className={styles.coverContainer}>
//           {book.coverImage ? (
//             <img 
//               src={book.coverImage} 
//               alt={book.title}
//               className={styles.cover}
//             />
//           ) : (
//             <div className={styles.coverPlaceholder}>
//               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
//                 <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
//               </svg>
//             </div>
//           )}
          
//           {/* Status Badge */}
//           <div 
//             className={styles.statusBadge}
//             style={{ backgroundColor: statusColor[book.rentalStatus] }}
//           >
//             {book.rentalStatus === 'AVAILABLE' ? 'Available' : 'Rented'}
//           </div>
//         </div>

//         {/* Book Info */}
//         <div className={styles.info}>
//           <h3 className={styles.title}>{book.title}</h3>
//           <p className={styles.author}>{book.author}</p>
          
//           {book.genre && book.genre.length > 0 && (
//             <div className={styles.genres}>
//               {book.genre.slice(0, 2).map((g, i) => (
//                 <span key={i} className={styles.genreTag}>{g}</span>
//               ))}
//             </div>
//           )}

//           {book.publishedYear && (
//             <p className={styles.year}>{book.publishedYear}</p>
//           )}
//         </div>

//         {/* Hover Overlay */}
//         {isHovered && (
//           <div className={styles.hoverOverlay}>
//             <span className={styles.viewDetails}>View Details →</span>
//           </div>
//         )}
//       </div>
//     </Link>
//   );
// }
// src/components/BookCard.js

'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './BookCard.module.css';

export default function BookCard({ book }) {
  const [isHovered, setIsHovered] = useState(false);

  const statusColor = {
    'AVAILABLE': '#22c55e',
    'RENTED': '#ef4444',
    'UNDER_INVESTIGATION': '#f59e0b',
    'LOST': '#6b7280'
  };

  return (
    <Link href={`/books/${book._id}`} className={styles.card}>
      <div 
        className={styles.cardInner}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Book Cover */}
        <div className={styles.coverContainer}>
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title}
              className={styles.cover}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          )}
          
          {/* Status Badge */}
          <div 
            className={styles.statusBadge}
            style={{ backgroundColor: statusColor[book.rentalStatus] }}
          >
            {book.rentalStatus === 'AVAILABLE' ? 'Available' : 'Rented'}
          </div>
        </div>

        {/* Book Info */}
        <div className={styles.info}>
          <h3 className={styles.title}>{book.title}</h3>
          <p className={styles.author}>{book.author}</p>
          
          {book.genre && book.genre.length > 0 && (
            <div className={styles.genres}>
              {book.genre.slice(0, 2).map((g, i) => (
                <span key={i} className={styles.genreTag}>{g}</span>
              ))}
            </div>
          )}

          {book.publishedYear && (
            <p className={styles.year}>{book.publishedYear}</p>
          )}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className={styles.hoverOverlay}>
            <span className={styles.viewDetails}>View Details →</span>
          </div>
        )}
      </div>
    </Link>
  );
}