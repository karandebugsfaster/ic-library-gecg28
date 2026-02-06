// src/app/admin/import/page.js

'use client';

import { useState } from 'react';
import { parseExcelToBooks } from '@/lib/utils/importBooks';
import styles from './import.module.css';

export default function ImportBooksPage() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      // Parse Excel file
      const books = await parseExcelToBooks(file);
      
      // Send to API
      const response = await fetch('/api/books/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Import Books from Excel</h1>
      
      <div className={styles.card}>
        <p className={styles.instruction}>
          Upload an Excel file (.xlsx or .xls) with the following columns:
          <br />
          <strong>ISBN, Title, Author, Genre, Publisher, Published Year, Edition, Description</strong>
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className={styles.fileInput}
        />

        {file && (
          <p className={styles.fileName}>Selected: {file.name}</p>
        )}

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className={styles.importButton}
        >
          {importing ? 'Importing...' : 'Import Books'}
        </button>

        {result && (
          <div className={result.success ? styles.success : styles.error}>
            {result.success ? (
              <>
                <h3>✅ Import Successful</h3>
                <p>Imported {result.data.imported} books</p>
                {result.data.errors > 0 && (
                  <p>⚠️ {result.data.errors} errors occurred</p>
                )}
              </>
            ) : (
              <>
                <h3>❌ Import Failed</h3>
                <p>{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}