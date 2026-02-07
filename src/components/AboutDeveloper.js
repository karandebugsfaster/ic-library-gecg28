// src/components/AboutDeveloper.js - Developer Credits Section

'use client';

import { DEVELOPER_INFO, ACKNOWLEDGEMENTS, PROJECT_INFO } from '@/lib/constants/developerInfo';
import styles from './AboutDeveloper.module.css';

export default function AboutDeveloper() {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.container}>
        
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.divider}></div>
          <h2 className={styles.title}>About the Developer</h2>
          <div className={styles.divider}></div>
        </div>

        {/* Developer Card */}
        <div className={styles.developerCard}>
          <div className={styles.avatar}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          
          <div className={styles.developerInfo}>
            <h3 className={styles.name}>{DEVELOPER_INFO.name}</h3>
            <p className={styles.role}>{DEVELOPER_INFO.role}</p>
            <p className={styles.description}>{DEVELOPER_INFO.description}</p>
            
            {DEVELOPER_INFO.skills && (
              <div className={styles.skills}>
                {DEVELOPER_INFO.skills}
              </div>
            )}

            {/* Optional Social Links */}
            {(DEVELOPER_INFO.social.github || DEVELOPER_INFO.social.linkedin || DEVELOPER_INFO.social.email) && (
              <div className={styles.socialLinks}>
                {DEVELOPER_INFO.social.github && (
                  <a href={DEVELOPER_INFO.social.github} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
                {DEVELOPER_INFO.social.linkedin && (
                  <a href={DEVELOPER_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}
                {DEVELOPER_INFO.social.email && (
                  <a href={`mailto:${DEVELOPER_INFO.social.email}`} className={styles.socialLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Acknowledgements */}
        <div className={styles.acknowledgements}>
          
          {/* Mentor */}
          <div className={styles.ackCard}>
            <div className={styles.ackIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className={styles.ackContent}>
              <h4 className={styles.ackTitle}>Mentor</h4>
              <p className={styles.ackName}>{ACKNOWLEDGEMENTS.mentor.name}</p>
              <p className={styles.ackMessage}>{ACKNOWLEDGEMENTS.mentor.message}</p>
            </div>
          </div>

          {/* HOD */}
          <div className={styles.ackCard}>
            <div className={styles.ackIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <div className={styles.ackContent}>
              <h4 className={styles.ackTitle}>{ACKNOWLEDGEMENTS.hod.title}</h4>
              <p className={styles.ackName}>{ACKNOWLEDGEMENTS.hod.name}</p>
              <p className={styles.ackMessage}>{ACKNOWLEDGEMENTS.hod.message}</p>
            </div>
          </div>

        </div>

        {/* Footer Credit */}
        <div className={styles.footer}>
          <p>© {PROJECT_INFO.year} {PROJECT_INFO.name}</p>
          <p>Built with ❤️ for {PROJECT_INFO.institution}</p>
        </div>

      </div>
    </section>
  );
}