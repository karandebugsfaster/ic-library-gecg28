// src/app/about/page.js - Dedicated About Developer Page

'use client';

import { useRouter } from 'next/navigation';
import AboutDeveloper from '@/components/AboutDeveloper';
import styles from './about.module.css';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Header with Back Button */}
      <div className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backButton}>
          ← Back to Library
        </button>
      </div>

      {/* About Developer Component */}
      <AboutDeveloper />
    </div>
  );
}