// src/app/manager/assign/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession } from '@/lib/utils/session';
import styles from './assign.module.css';

export default function AssignBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    bookId: '',
    rentalDays: 7
  });

  useEffect(() => {
    const session = getUserSession();
    if (!session || session.role !== 'manager') {
      router.push('/');
      return;
    }

    fetchAvailableBooks();
  }, []);

  const fetchAvailableBooks = async () => {
    try {
      const response = await fetch('/api/books?limit=1000');
      const data = await response.json();

      if (data.success) {
        const available = data.data.books.filter(b => b.rentalStatus === 'AVAILABLE');
        setBooks(available);
        setFilteredBooks(available);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  const handleSearchBooks = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.isbn.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/manager/assign-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Book assigned successfully to ${formData.enrollmentNumber}!`);
        setFormData({ enrollmentNumber: '', bookId: '', rentalDays: 7 });
        fetchAvailableBooks(); // Refresh list
        
        setTimeout(() => {
          router.push('/manager/dashboard');
        }, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to assign book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Assign Book to Student</h1>
        <button onClick={() => router.push('/manager/dashboard')} className={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleAssign}>
          <div className={styles.formGroup}>
            <label>Student Enrollment Number *</label>
            <input
              type="text"
              value={formData.enrollmentNumber}
              className={styles.formInput}
              onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
              placeholder="e.g., 2417001123"
              required
            />
            <small>Student must be registered in the system</small>
          </div>

          <div className={styles.formGroup}>
            <label>Search for Book</label>
            <input
              type="text"
              value={searchQuery}
              className={styles.formInput}
              onChange={(e) => handleSearchBooks(e.target.value)}
              placeholder="Search by title, author, or ISBN"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Select Book * ({filteredBooks.length} available)</label>
            <select
              value={formData.bookId}
              className={styles.formInput}
              onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
              required
            >
              <option value="">-- Select a book --</option>
              {filteredBooks.map(book => (
                <option key={book._id} value={book._id}>
                  {book.title} by {book.author} (ISBN: {book.isbn})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Rental Duration (days) *</label>
            <input
              type="number"
              value={formData.rentalDays}
              className={styles.formInput}
              onChange={(e) => setFormData({ ...formData, rentalDays: parseInt(e.target.value) })}
              min="1"
              max="30"
              required
            />
            <small>Default: 7 days</small>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Book to Student'}
          </button>
        </form>

        {message && (
          <div className={message.includes('✅') ? styles.successMsg : styles.errorMsg}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}