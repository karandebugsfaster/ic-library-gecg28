// src/components/AboutDeveloper.js - FIXED Button

"use client";

import {
  DEVELOPER_INFO,
  ACKNOWLEDGEMENTS,
  PROJECT_INFO,
} from "@/lib/constants/developerInfo";
import styles from "./AboutDeveloper.module.css";
import FloatingChatButton from "./FloatingChatButton";

export default function AboutDeveloper() {
  const handleClick = () => {
    window.open("https://gtu-ai.vercel.app/", "_blank", "noopener,noreferrer");
  };

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
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>

          <div className={styles.developerInfo}>
            <h3 className={styles.name}>{DEVELOPER_INFO.name}</h3>
            <p className={styles.role}>{DEVELOPER_INFO.role}</p>
            <p className={styles.description}>{DEVELOPER_INFO.description}</p>

            {DEVELOPER_INFO.skills && (
              <div className={styles.skills}>{DEVELOPER_INFO.skills}</div>
            )}

            {/* Optional Social Links */}
            {(DEVELOPER_INFO.social.github ||
              DEVELOPER_INFO.social.linkedin ||
              DEVELOPER_INFO.social.email) && (
              <div className={styles.socialLinks}>
                {DEVELOPER_INFO.social.github && (
                  <a
                    href={DEVELOPER_INFO.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                )}
                {DEVELOPER_INFO.social.linkedin && (
                  <a
                    href={DEVELOPER_INFO.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {DEVELOPER_INFO.social.email && (
                  <a
                    href={`mailto:${DEVELOPER_INFO.social.email}`}
                    className={styles.socialLink}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* GTU AI Featured Project */}
        <div className={styles.featuredProject}>
          <div className={styles.projectHeader}>
            <div className={styles.projectIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className={styles.projectBadge}>
              <span className={styles.badgeGlow}></span>
              Featured Project
            </div>
          </div>

          <h3 className={styles.projectTitle}>GTU AI Assistant 🎓</h3>
          <p className={styles.projectDescription}>
            A powerful AI-powered chatbot designed specifically for GTU
            students. Get instant help with your studies, assignments, exam
            preparation, and academic queries. Built with cutting-edge AI
            technology to provide accurate and helpful responses tailored to GTU
            curriculum.
          </p>

          <div className={styles.projectFeatures}>
            <div className={styles.featureTag}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
              24/7 Available
            </div>
            <div className={styles.featureTag}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
              GTU Curriculum
            </div>
            <div className={styles.featureTag}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
              Free to Use
            </div>
            <div className={styles.featureTag}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
              Instant Responses
            </div>
          </div>

          {/* ✅ FIXED: No nested button, just span */}
          <button
            className={styles.projectButton}
            onClick={handleClick}
          >
            <span>Try GTU AI Now</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <div className={styles.projectStats}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🚀</div>
              <div className={styles.statText}>
                <strong>Fast</strong>
                <span>Instant AI responses</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statText}>
                <strong>Accurate</strong>
                <span>GTU-focused answers</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>💡</div>
              <div className={styles.statText}>
                <strong>Smart</strong>
                <span>Context-aware AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acknowledgements */}
        <div className={styles.acknowledgements}>
          {/* Mentor */}
          <div className={styles.ackCard}>
            <div className={styles.ackIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className={styles.ackContent}>
              <h4 className={styles.ackTitle}>Mentor</h4>
              <p className={styles.ackName}>{ACKNOWLEDGEMENTS.mentor.name}</p>
              <p className={styles.ackMessage}>
                {ACKNOWLEDGEMENTS.mentor.message}
              </p>
            </div>
          </div>

          {/* HOD */}
          <div className={styles.ackCard}>
            <div className={styles.ackIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <div className={styles.ackContent}>
              <h4 className={styles.ackTitle}>{ACKNOWLEDGEMENTS.hod.title}</h4>
              <p className={styles.ackName}>{ACKNOWLEDGEMENTS.hod.name}</p>
              <p className={styles.ackMessage}>
                {ACKNOWLEDGEMENTS.hod.message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className={styles.footer}>
          <p>
            © {PROJECT_INFO.year} {PROJECT_INFO.name}
          </p>
          <p>Built with ❤️ for {PROJECT_INFO.institution}</p>
        </div>
      </div>
      <FloatingChatButton />
    </section>
  );
}