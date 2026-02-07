// src/app/books/[id]/page.js - View Only (No Rental)

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./book.module.css";

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBookDetails();
  }, [params.id]);

  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setBook(data.data);
      } else {
        setMessage("❌ Book not found");
      }
    } catch (error) {
      console.error("Failed to fetch book:", error);
      setMessage("❌ Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className={styles.error}>
        <h2>Book Not Found</h2>
        <button onClick={() => router.push("/")}>← Back to Library</button>
      </div>
    );
  }

  const isAvailable = book.rentalStatus === "AVAILABLE";

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.push("/")}>
        ← Back to Library
      </button>

      <div className={styles.bookDetails}>
        {/* Book Cover */}
        <div className={styles.coverSection}>
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className={styles.cover}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <svg
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          )}

          {/* Status Badge */}
          <div
            className={`${styles.statusBadge} ${isAvailable ? styles.available : styles.rented}`}
          >
            {isAvailable ? "✓ Available" : "✗ Currently Rented"}
          </div>
        </div>

        {/* Book Info */}
        <div className={styles.infoSection}>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>by {book.author}</p>

          <div className={styles.metadata}>
            {book.isbn && (
              <div className={styles.metaItem}>
                <strong>ISBN:</strong> {book.isbn}
              </div>
            )}
            {book.publisher && (
              <div className={styles.metaItem}>
                <strong>Publisher:</strong> {book.publisher}
              </div>
            )}
            {book.publishedYear && (
              <div className={styles.metaItem}>
                <strong>Year:</strong> {book.publishedYear}
              </div>
            )}
            {book.edition && (
              <div className={styles.metaItem}>
                <strong>Edition:</strong> {book.edition}
              </div>
            )}
            {book.genre && book.genre.length > 0 && (
              <div className={styles.metaItem}>
                <strong>Genre:</strong>
                <div className={styles.genres}>
                  {book.genre.map((g, i) => (
                    <span key={i} className={styles.genreTag}>
                      {g}
                    </span>
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
            <div className={styles.noticeIcon}>ℹ️</div>
            <div className={styles.noticeContent}>
              <h4>How to Rent This Book</h4>
              <p>
                Books can only be rented through the library manager. Please
                visit the library with your enrollment number to rent this book.
              </p>
              {!isAvailable && book.currentRentalInfo && (
                <p className={styles.dueInfo}>
                  <strong>Expected return:</strong>{" "}
                  {new Date(book.currentRentalInfo.dueDate).toLocaleDateString(
                    "en-GB",
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
