"use client";

import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";

// Reuse the same Anchor logo
import anchorLogo from "../login/images/favicon.ico";
import googleIcon from "../login/images/google.png";
import linkedinIcon from "../login/images/linkedin.png";
import githubIcon from "../login/images/github.png";

export default function SignupPage() {
  return (
    <div className={styles.wrapper}>
      {/* LEFT PANEL */}
      <div className={styles.left}>
        <div className={`${styles.brand} ${styles.brandAnim}`}>
          <Image
            src={anchorLogo}
            alt="Anchor logo"
            width={48}
            height={48}
            priority
          />
          <h1>Anchor</h1>
        </div>

        <h2 className={styles.headingAnim}>Create your account</h2>
        <h4 className={styles.subHeadingAnim}>
          Start building better habits and staying consistent.
        </h4>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h3>Create an account</h3>
          <p className={styles.subtitle}>It takes less than a minute</p>

          <input
            type="text"
            placeholder="Full name"
            className={styles.input}
          />

          <input
            type="email"
            placeholder="Email address"
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Confirm password"
            className={styles.input}
          />

          <button className={styles.primary}>Sign up</button>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

           {/* SOCIAL LOGIN */}
          <button className={styles.socialGoogle}>
            <Image src={googleIcon} alt="Google" width={20} height={20} />
            Continue with Google
          </button>

          <div className={styles.socialRow}>
            <button className={styles.socialSmall}>
              <Image src={linkedinIcon} alt="LinkedIn" width={22} height={22} />
              Continue with LinkedIn
            </button>

            <button className={styles.socialSmall}>
              <Image src={githubIcon} alt="GitHub" width={22} height={22} />
              Continue with GitHub
            </button>
          </div>

          <p className={styles.login}>
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
