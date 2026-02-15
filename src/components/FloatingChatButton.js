// src/components/FloatingChatButton.js - Floating AI Chat Button

'use client';

import { useState } from 'react';
import styles from './FloatingChatButton.module.css';

export default function FloatingChatButton() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open('https://gtu-ai.vercel.app/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.floatingButtonContainer}>
      {/* Tooltip */}
      <div className={`${styles.tooltip} ${isHovered ? styles.visible : ''}`}>
        <strong>GTU AI Assistant</strong>
        <p>Get instant help with your studies! 🎓</p>
      </div>

      {/* Button */}
      <button
        className={styles.floatingButton}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open GTU AI Assistant"
      >
        {/* Pulsing Ring */}
        <div className={styles.pulseRing}></div>
        
        {/* AI Icon */}
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>

        {/* Badge */}
        <div className={styles.badge}>AI</div>
      </button>
    </div>
  );
}