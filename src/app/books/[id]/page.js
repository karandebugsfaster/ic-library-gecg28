// src/app/books/[id]/page.js

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { saveUserSession } from "@/lib/utils/session";
import styles from "./book.module.css";

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [renting, setRenting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    enrollmentNumber: "",
    email: "",
    phone: "",
    agreedToTerms: false,
  });

  //   useEffect(() => {
  //     fetchBookDetails();
  //   }, [params.id]);

  //   const fetchBookDetails = async () => {
  //     try {
  //       const response = await fetch(`/api/books/${params.id}`);
  //       const data = await response.json();

  //       if (data.success) {
  //         setBook(data.data);
  //       } else {
  //         setMessage('❌ Book not found');
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch book:', error);
  //       setMessage('❌ Failed to load book details');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  useEffect(() => {
    console.log("📖 Book ID from URL:", params.id); // ADD THIS
    fetchBookDetails();
  }, [params.id]);

  const fetchBookDetails = async () => {
    try {
      console.log("🔍 Fetching book:", params.id); // ADD THIS

      const response = await fetch(`/api/books/${params.id}`);
      console.log("📡 Response status:", response.status); // ADD THIS

      const data = await response.json();
      console.log("📦 Response data:", data); // ADD THIS

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

  const handleRent = async (e) => {
    e.preventDefault();
    setRenting(true);
    setMessage("");

    try {
      const response = await fetch("/api/rentals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: params.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save user session
        saveUserSession(data.data.user);

        setMessage(
          "✅ Book rented successfully! Redirecting to your profile...",
        );

        // Redirect to profile after 2 seconds
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setRenting(false);
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

          {/* Rental Section */}
          {isAvailable ? (
            !showRentalForm ? (
              <button
                className={styles.rentButton}
                onClick={() => setShowRentalForm(true)}
              >
                📚 Rent This Book
              </button>
            ) : (
              <div className={styles.rentalForm}>
                <h3>Rent "{book.title}"</h3>
                <p className={styles.formNote}>
                  Only IC Department students (enrollment code 17) can rent
                  books
                </p>

                <form onSubmit={handleRent}>
                  <div className={styles.formGroup}>
                    <label>Enrollment Number *</label>
                    <input
                      type="text"
                      value={formData.enrollmentNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enrollmentNumber: e.target.value,
                        })
                      }
                      placeholder="e.g., 2417001123"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your.email@gmail.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreedToTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          agreedToTerms: e.target.checked,
                        })
                      }
                      required
                    />
                    <label htmlFor="terms">
                      I agree to return the book within 7 days and follow
                      library rules
                    </label>
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setShowRentalForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={renting}
                    >
                      {renting ? "Processing..." : "Confirm Rental"}
                    </button>
                  </div>
                </form>

                {message && (
                  <div
                    className={
                      message.includes("✅")
                        ? styles.successMsg
                        : styles.errorMsg
                    }
                  >
                    {message}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className={styles.rentedInfo}>
              <h3>Currently Rented</h3>
              {book.currentRentalInfo && (
                <p>
                  Due back:{" "}
                  {new Date(book.currentRentalInfo.dueDate).toLocaleDateString(
                    "en-IN",
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
