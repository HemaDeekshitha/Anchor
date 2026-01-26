import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function WelcomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.container}>
          {/* This row aligns the card to the left and leaves space on the right */}
          <div className={styles.heroRow}>
            {/* THE WHITE "CUT BOX" */}
            <div className={styles.whiteCard}>
              <h1 className={styles.title}>
                Anchor - it's the clarity you deserve
              </h1>
              <p className={styles.subtitle}>
                Plans your day, tracks real applications, and prepares you for
                interviews — all in one place
              </p>

              {/* Button inside the white space */}
              <Link href="/steps" className={styles.ctaButton}>
                Start Today
              </Link>
            </div>

            {/* Empty right side (placeholder for your 3D image) */}
            <div className={styles.imagePlaceholder}></div>
          </div>
        </div>
      </section>
    </main>
  );
}
