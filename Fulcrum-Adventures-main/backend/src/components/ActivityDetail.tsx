"use client";

import { useState } from "react";

import styles from "./ActivityDetail.module.css";

import type { Activity } from "../data/mockActivities";

// Icon Components
function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4C4 2.89543 4.89543 2 6 2H10.5858C10.851 2 11.1054 2.10536 11.2929 2.29289L15.7071 6.70711C15.8946 6.89464 16 7.149 16 7.41421V16C16 17.1046 15.1046 18 14 18H6C4.89543 18 4 17.1046 4 16V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M10 2V7H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 4C5 3.44772 5.44772 3 6 3H14C14.5523 3 15 3.44772 15 4V17L10 14L5 17V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 6C12 7.65685 10.6569 9 9 9C7.34315 9 6 7.65685 6 6C6 4.34315 7.34315 3 9 3C10.6569 3 12 4.34315 12 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M3 15C3 12.7909 4.79086 11 7 11H11C13.2091 11 15 12.7909 15 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 12C2 10.3431 3.34315 9 5 9C6.65685 9 8 10.3431 8 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 12C10 10.3431 11.3431 9 13 9C14.6569 9 16 10.3431 16 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 5V9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 2L9.5 6L2.5 10V2Z" fill="currentColor" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 12V15C3 15.5523 3.44772 16 4 16H14C14.5523 16 15 15.5523 15 15V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9 2V11M9 11L6 8M9 11L12 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 9L7 13L15 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function CheckboxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="2"
        y="2"
        width="14"
        height="14"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

type ActivityDetailProps = {
  activity: Activity;
};

export default function ActivityDetail({ activity }: ActivityDetailProps) {
  const [activeTab, setActiveTab] = useState<"prep" | "play" | "safety" | "variation">("prep");

  return (
    <div className={styles.container}>
      {/* Hero Image/Video Section */}
      <div className={styles.heroSection}>
        {activity.images && activity.images.length > 0 && (
          <div className={styles.heroImage}>
            <button className={styles.navArrow} aria-label="Previous">
              &lt;
            </button>
            <div className={styles.heroContent}>
              <span className={styles.heroPlaceholder}>Activity Image</span>
            </div>
            <button className={styles.tutorialButton}>
              <span className={styles.playIcon}>
                <PlayIcon />
              </span>
              Tutorial
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Category Badge */}
        {activity.category && <span className={styles.categoryBadge}>{activity.category}</span>}

        {/* Title and Action Icons */}
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{activity.title}</h1>
          <div className={styles.actionIcons}>
            <button className={styles.iconButton} aria-label="Document">
              <DocumentIcon />
            </button>
            <button className={styles.iconButton} aria-label="Bookmark">
              <BookmarkIcon />
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className={styles.metricsRow}>
          {activity.gradeLevel && (
            <div className={styles.metric}>
              <span className={styles.metricValue}>{activity.gradeLevel}</span>
            </div>
          )}
          {activity.participants && (
            <div className={styles.metric}>
              <span className={styles.metricIcon}>
                <PeopleIcon />
              </span>
              <span className={styles.metricValue}>{activity.participants}</span>
            </div>
          )}
          {activity.duration && (
            <div className={styles.metric}>
              <span className={styles.metricIcon}>
                <ClockIcon />
              </span>
              <span className={styles.metricValue}>{activity.duration}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className={styles.description}>{activity.description}</p>

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <div className={styles.tags}>
            {activity.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Objective Section */}
        {activity.objective && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Objective</h2>
            <p className={styles.objectiveText}>{activity.objective}</p>
          </section>
        )}

        {/* Facilitate Section with Tabs */}
        {activity.facilitate && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Facilitate</h2>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "prep" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("prep")}
              >
                Prep
              </button>
              <button
                className={`${styles.tab} ${activeTab === "play" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("play")}
              >
                Play
              </button>
              <button
                className={`${styles.tab} ${activeTab === "safety" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("safety")}
              >
                Safety
              </button>
              <button
                className={`${styles.tab} ${activeTab === "variation" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("variation")}
              >
                Variation
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === "prep" && activity.facilitate.prep && (
                <div>
                  {activity.facilitate.prep.setup && (
                    <div className={styles.subsection}>
                      <h3 className={styles.subsectionTitle}>Set-Up</h3>
                      <p className={styles.subsectionText}>{activity.facilitate.prep.setup}</p>
                    </div>
                  )}
                  {activity.facilitate.prep.materials && (
                    <div className={styles.subsection}>
                      <h3 className={styles.subsectionTitle}>Materials</h3>
                      <ul className={styles.materialsList}>
                        {activity.facilitate.prep.materials.map((material, index) => (
                          <li key={index} className={styles.materialItem}>
                            <span className={styles.checkbox}>
                              <CheckboxIcon />
                            </span>
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "play" && activity.facilitate.play && (
                <p>{activity.facilitate.play}</p>
              )}
              {activeTab === "safety" && activity.facilitate.safety && (
                <p>{activity.facilitate.safety}</p>
              )}
              {activeTab === "variation" && activity.facilitate.variations && (
                <p>{activity.facilitate.variations}</p>
              )}
            </div>
          </section>
        )}

        {/* SEL Opportunity Section */}
        {activity.selOpportunities && activity.selOpportunities.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>SEL Opportunity</h2>
            <div className={styles.selTags}>
              {activity.selOpportunities.map((sel, index) => (
                <span key={index} className={styles.selTag}>
                  {sel}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.downloadButton}>
            <span className={styles.downloadIcon}>
              <DownloadIcon />
            </span>
            Download
          </button>
          <button className={styles.completedButton}>
            <span className={styles.checkIcon}>
              <CheckIcon />
            </span>
            Completed
          </button>
        </div>
      </div>
    </div>
  );
}
